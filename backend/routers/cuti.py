# routers/cuti.py
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import date, timedelta
from database import get_db
import holidays
import httpx
from math import ceil
from fastapi import Query

router = APIRouter(prefix="/cuti", tags=["Cuti"])

class AjukanCutiRequest(BaseModel):
    id_jenis_cuti: int | None = None
    tanggal_mulai: date
    tanggal_akhir: date
    keterangan: str | None = None
    
class HitungCutiRequest(BaseModel):
    tanggal_mulai: date
    tanggal_akhir: date
    

# -------------------------
# Helper: fetch public holidays from Nager.Date as fallback
# -------------------------
def fetch_holidays_nager(year: int):
    url = f"https://date.nager.at/api/v3/PublicHolidays/{year}/ID"
    try:
        with httpx.Client(timeout=10.0) as client:
            r = client.get(url)
            r.raise_for_status()
            data = r.json()
            # return set of date objects
            return set([date.fromisoformat(item["date"]) for item in data])
    except Exception:
        return set()

# -------------------------
# Helper: build holiday set for range of years
# -------------------------
def build_holiday_set(start: date, end: date):
    years = range(start.year, end.year + 1)
    holiday_dates = set()

    # first try using library holidays for Indonesia
    try:
        for y in years:
            h = holidays.Indonesia(years=y)
            # h.items() might be empty for some future years -> fallback later
            for dt, _ in h.items():
                holiday_dates.add(dt)
    except Exception:
        # kalau library holidays gagal sama sekali, tetap lanjut ke fallback
        holiday_dates = set()

    # if holidays set empty or missing years, fallback to Nager.Date for those years
    # (we'll always call fallback for years that are not present)
    # Determine which years are missing by checking any holiday for that year
    present_years = set(d.year for d in holiday_dates)
    for y in years:
        if y not in present_years:
            fallback = fetch_holidays_nager(y)
            holiday_dates.update(fallback)

    return holiday_dates

# -------------------------
# Helper: hitung hari kerja (exclude Sat Sun and holiday dates)
# -------------------------
def count_workdays_excluding_holidays(start: date, end: date):
    if end < start:
        return 0
    holiday_dates = build_holiday_set(start, end)

    total = 0
    cur = start
    while cur <= end:
        # weekday: Mon=0 ... Sun=6
        if cur.weekday() < 5 and cur not in holiday_dates:
            total += 1
        cur = cur + timedelta(days=1)
    return total

# -------------------------
# Endpoint: ambil data karyawan
# -------------------------
@router.get("/me")
def get_my_profile(request: Request):
    id_karyawan = request.headers.get("X-Id-Karyawan")
    if not id_karyawan:
        raise HTTPException(status_code=400, detail="Missing X-Id-Karyawan header")

    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id_karyawan, nama, divisi FROM karyawan WHERE id_karyawan=%s", (id_karyawan,))
        k = cursor.fetchone()
        if not k:
            raise HTTPException(status_code=404, detail="Karyawan tidak ditemukan")
        return {"status":"success", "karyawan": k}
    finally:
        cursor.close()
        db.close()

# -------------------------
# Endpoint: hitung jumlah hari kerja (dipakai frontend untuk preview)
# -------------------------
@router.post("/hitung")
def hitung_jumlah(data: HitungCutiRequest):
    if data.tanggal_akhir < data.tanggal_mulai:
        raise HTTPException(status_code=400, detail="Tanggal akhir harus >= tanggal mulai")
    jumlah = count_workdays_excluding_holidays(data.tanggal_mulai, data.tanggal_akhir)
    return {"status": "success", "jumlah": jumlah}

#--------------------------------
#TABLE DATA CUTI
#---------------------------------

@router.get("/list")
def list_cuti(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=500),
    search: str | None = Query(None),
    year: int | None = Query(None),
    month: int | None = Query(None),
    status: str | None = Query(None)
):
    """
    Return paginated list of cuti with joined karyawan and jenis_cuti.
    Filters:
      - search: match id_cuti, id_karyawan, nama
      - year: tahun dari tanggal_mulai (atau tanggal_akhir)
      - month: bulan (1-12) dari tanggal_mulai
      - status: Menunggu/Disetujui/Ditolak
    """
    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        # base where
        where_clauses = []
        params = []

        if search:
            where_clauses.append("(CAST(c.id_cuti AS CHAR) LIKE %s OR CAST(c.id_karyawan AS CHAR) LIKE %s OR k.nama LIKE %s)")
            like = f"%{search}%"
            params.extend([like, like, like])

        if status:
            where_clauses.append("c.status = %s")
            params.append(status)

        if year:
            where_clauses.append("YEAR(c.tanggal_mulai) = %s")
            params.append(year)

        if month:
            where_clauses.append("MONTH(c.tanggal_mulai) = %s")
            params.append(month)

        where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

        # total count
        count_sql = f"""
            SELECT COUNT(*) as cnt
            FROM cuti c
            LEFT JOIN karyawan k ON k.id_karyawan = c.id_karyawan
            LEFT JOIN jenis_cuti j ON j.id_jenis_cuti = c.id_jenis_cuti
            {where_sql}
        """
        cursor.execute(count_sql, tuple(params))
        total = cursor.fetchone()["cnt"]

        # pagination
        offset = (page - 1) * per_page

        list_sql = f"""
            SELECT
            c.id_cuti,
            c.id_karyawan,
            k.nama AS nama_karyawan,
            k.divisi AS divisi,
            c.tanggal_mulai,
            c.tanggal_akhir,
            c.jumlah,
            c.keterangan,
            c.status,
            j.id_jenis_cuti,
            j.jenis_cuti
            FROM cuti c
            LEFT JOIN karyawan k ON k.id_karyawan = c.id_karyawan
            LEFT JOIN jenis_cuti j ON j.id_jenis_cuti = c.id_jenis_cuti
            {where_sql}
            ORDER BY c.id_cuti DESC  -- ganti c.created_at DESC ke c.id_cuti DESC
            LIMIT %s OFFSET %s
        """
        params_with_limit = list(params) + [per_page, offset]
        cursor.execute(list_sql, tuple(params_with_limit))

        rows = cursor.fetchall()

        # format results (convert date -> str)
        items = []
        for r in rows:
            items.append({
                "id_cuti": r["id_cuti"],
                "id_karyawan": r["id_karyawan"],
                "nama_karyawan": r["nama_karyawan"],
                "divisi": r["divisi"],
                "tanggal_mulai": r["tanggal_mulai"].isoformat() if r["tanggal_mulai"] else None,
                "tanggal_akhir": r["tanggal_akhir"].isoformat() if r["tanggal_akhir"] else None,
                "jumlah": r["jumlah"],
                "keterangan": r["keterangan"],
                "status": r["status"],
                "id_jenis_cuti": r["id_jenis_cuti"],
                "jenis_cuti": r["jenis_cuti"]
            })

        return {
            "status": "success",
            "data": {
                "items": items,
                "pagination": {
                    "total": total,
                    "page": page,
                    "per_page": per_page,
                    "total_pages": ceil(total / per_page) if per_page else 0
                }
            }
        }
    finally:
        cursor.close()
        db.close()
        
#--------------------------------
#TABLE DATA CUTI
#--------------------------------
# GET /cuti/{id_cuti}
@router.get("/{id_cuti}")
def get_cuti_detail(id_cuti: int):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        sql = """
            SELECT c.*, k.nama AS nama_karyawan, k.divisi, j.jenis_cuti
            FROM cuti c
            LEFT JOIN karyawan k ON k.id_karyawan = c.id_karyawan
            LEFT JOIN jenis_cuti j ON j.id_jenis_cuti = c.id_jenis_cuti
            WHERE c.id_cuti = %s
        """
        cursor.execute(sql, (id_cuti,))
        r = cursor.fetchone()
        if not r:
            raise HTTPException(status_code=404, detail="Cuti tidak ditemukan")
        # konversi tanggal
        r["tanggal_mulai"] = r["tanggal_mulai"].isoformat() if r["tanggal_mulai"] else None
        r["tanggal_akhir"] = r["tanggal_akhir"].isoformat() if r["tanggal_akhir"] else None
        return {"status":"success","cuti": r}
    finally:
        cursor.close()
        db.close()


# -------------------------
# Endpoint: simpan pengajuan cuti
# -------------------------
@router.post("/")
def ajukan_cuti(data: AjukanCutiRequest, request: Request):
    id_karyawan = request.headers.get("X-Id-Karyawan")
    if not id_karyawan:
        raise HTTPException(status_code=400, detail="Missing X-Id-Karyawan header")
    if data.tanggal_akhir < data.tanggal_mulai:
        raise HTTPException(status_code=400, detail="Tanggal akhir harus sama atau setelah tanggal mulai")

    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        # pastikan karyawan ada
        cursor.execute("SELECT id_karyawan, nama, divisi FROM karyawan WHERE id_karyawan=%s", (id_karyawan,))
        k = cursor.fetchone()
        if not k:
            raise HTTPException(status_code=404, detail="Karyawan tidak ditemukan")

        jumlah = count_workdays_excluding_holidays(data.tanggal_mulai, data.tanggal_akhir)

        # simpan ke table cuti
        cursor.execute(
            """
            INSERT INTO cuti
              (id_jenis_cuti, id_karyawan, tanggal_mulai, tanggal_akhir, jumlah, keterangan, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (data.id_jenis_cuti, id_karyawan, data.tanggal_mulai, data.tanggal_akhir, jumlah, data.keterangan, "Menunggu")
        )
        db.commit()
        new_id = cursor.lastrowid

        return {
            "status": "success",
            "message": "Pengajuan cuti berhasil disimpan",
            "data": {
                "id_cuti": new_id,
                "id_jenis_cuti": data.id_jenis_cuti,
                "id_karyawan": int(id_karyawan),
                "tanggal_mulai": str(data.tanggal_mulai),
                "tanggal_akhir": str(data.tanggal_akhir),
                "jumlah": jumlah,
                "keterangan": data.keterangan,
                "status": "Menunggu"
            }
        }
    finally:
        cursor.close()
        db.close()
        