from fastapi import APIRouter, Request, HTTPException
from database import get_db
from datetime import datetime

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def get_dashboard(request: Request):
    id_karyawan = request.headers.get("X-Id-Karyawan")
    if not id_karyawan:
        raise HTTPException(status_code=400, detail="Missing X-Id-Karyawan header")

    year = datetime.now().year

    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        # Ambil nama karyawan
        cursor.execute("SELECT nama FROM karyawan WHERE id_karyawan=%s", (id_karyawan,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Karyawan tidak ditemukan")
        nama = row["nama"]

        # Hitung total pengajuan cuti per status (hanya tahun berjalan)
        cursor.execute("""
            SELECT status, COUNT(*) as cnt
            FROM cuti
            WHERE YEAR(tanggal_mulai) = %s
            GROUP BY status
        """, (year,))
        status_counts = {r["status"]: r["cnt"] for r in cursor.fetchall()}

        total_all = sum(status_counts.values())

        # Data chart batang (per bulan)
        cursor.execute("""
            SELECT MONTH(tanggal_mulai) as bulan, COUNT(*) as cnt
            FROM cuti
            WHERE YEAR(tanggal_mulai) = %s
            GROUP BY MONTH(tanggal_mulai)
        """, (year,))
        per_month = {r["bulan"]: r["cnt"] for r in cursor.fetchall()}
        data_bar = [
            {"name": m.strftime("%b"), "value": per_month.get(i, 0)}
            for i, m in enumerate([datetime(year, x, 1) for x in range(1, 13)], start=1)
        ]

        # Data chart pie (per divisi)
        cursor.execute("""
            SELECT k.divisi, COUNT(*) as cnt
            FROM cuti c
            LEFT JOIN karyawan k ON k.id_karyawan = c.id_karyawan
            WHERE YEAR(c.tanggal_mulai) = %s
            GROUP BY k.divisi
        """, (year,))
        data_pie = [{"name": r["divisi"] or "Lainnya", "value": r["cnt"]} for r in cursor.fetchall()]

        return {
            "status": "success",
            "data": {
                "nama": nama,
                "total_all": total_all,
                "status_counts": {
                    "Diproses": status_counts.get("Menunggu", 0),  # mapping 'Menunggu' jadi 'Diproses'
                    "Disetujui": status_counts.get("Disetujui", 0),
                    "Ditolak": status_counts.get("Ditolak", 0)
                },
                "data_bar": data_bar,
                "data_pie": data_pie
            }
        }
    finally:
        cursor.close()
        db.close()