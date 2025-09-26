from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db
from passlib.hash import bcrypt
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Auth"])

# ==========================
# MODELS
# ==========================
class LoginRequest(BaseModel):
    id_karyawan: int
    password: str

class TwoFactorRequest(BaseModel):
    id_karyawan: int
    jawaban1: str
    jawaban2: str
    jawaban3: str

class ResetPasswordRequest(BaseModel):
    id_karyawan: int
    password_baru: str

# ==========================
# HELPERS
# ==========================
def now_datetime():
    # gunakan UTC atau lokal sesuai preferensi DB; ganti jika mau timezone lokal
    return datetime.utcnow()

# ==========================
# LOGIN
# ==========================
@router.post("/login")
def login(req: LoginRequest):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id_karyawan, password, role FROM users WHERE id_karyawan=%s",
            (req.id_karyawan,),
        )
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="ID Karyawan tidak terdaftar")

        # Validasi password
        db_password = user["password"]
        valid = False

        try:
            # kalau password di DB hashed dengan passlib bcrypt
            if bcrypt.verify(req.password, db_password):
                valid = True
        except Exception:
            # jika bcrypt.verify melempar (mis. db_password bukan hash), fallback ke perbandingan plain
            pass

        # fallback: jika di DB masih plain text (tidak direkomendasikan)
        if not valid and db_password == req.password:
            valid = True

        if not valid:
            raise HTTPException(status_code=401, detail="Password salah")

        # --- update last_login & last_activity di tabel users ---
        ts = now_datetime()
        cursor.execute(
            """
            UPDATE users
            SET last_login=%s,
                last_activity_time=%s,
                last_activity_type=%s,
                last_activity_detail=%s
            WHERE id_karyawan=%s
            """,
            (
                ts,
                ts,
                "login",
                f"User {req.id_karyawan} berhasil login",
                req.id_karyawan,
            ),
        )
        db.commit()
        # -------------------------------------------------------

        # Cek apakah sudah ada jawaban 2FA di tabel karyawan
        cursor.execute(
            "SELECT jawaban1, jawaban2, jawaban3 FROM karyawan WHERE id_karyawan=%s",
            (req.id_karyawan,),
        )
        karyawan = cursor.fetchone()

        if karyawan and all([karyawan["jawaban1"], karyawan["jawaban2"], karyawan["jawaban3"]]):
            return {
                "status": "success",
                "message": "Login berhasil, langsung ke beranda",
                "user": {
                    "id_karyawan": user["id_karyawan"],
                    "role": user["role"],
                },
                "next_step": "dashboard"
            }
        else:
            return {
                "status": "success",
                "message": "Login berhasil, lanjutkan ke 2FA",
                "user": {
                    "id_karyawan": user["id_karyawan"],
                    "role": user["role"],
                },
                "next_step": "2fa"
            }
    finally:
        cursor.close()
        db.close()

# ==========================
# LOGOUT
# ==========================
@router.post("/logout")
def logout(req: LoginRequest):
    """
    Endpoint sederhana untuk mencatat last_logout & last_activity ketika user logout.
    Frontend bisa panggil dengan body { id_karyawan, password } atau buat model khusus jika mau.
    """
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id_karyawan FROM users WHERE id_karyawan=%s",
            (req.id_karyawan,),
        )
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="ID Karyawan tidak ditemukan")

        ts = now_datetime()
        cursor.execute(
            """
            UPDATE users
            SET last_logout=%s,
                last_activity_time=%s,
                last_activity_type=%s,
                last_activity_detail=%s
            WHERE id_karyawan=%s
            """,
            (
                ts,
                ts,
                "logout",
                f"User {req.id_karyawan} logout",
                req.id_karyawan,
            ),
        )
        db.commit()

        return {"status": "success", "message": "Logout berhasil"}
    finally:
        cursor.close()
        db.close()

# ==========================
# CATAT AKTIVITAS UMUM
# ==========================
@router.post("/activity")
def activity(payload: dict):
    """
    Expect JSON like:
    {
      "id_karyawan": 123,
      "activity_type": "ajukan_cuti",
      "detail": "Ajukan cuti tahunan 2025-07-20"
    }
    """
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        id_karyawan = payload.get("id_karyawan")
        activity_type = payload.get("activity_type")
        detail = payload.get("detail", "")

        if not id_karyawan or not activity_type:
            raise HTTPException(status_code=400, detail="id_karyawan dan activity_type diperlukan")

        cursor.execute(
            "SELECT id_karyawan FROM users WHERE id_karyawan=%s",
            (id_karyawan,),
        )
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="ID Karyawan tidak ditemukan")

        ts = now_datetime()
        cursor.execute(
            """
            UPDATE users
            SET last_activity_time=%s,
                last_activity_type=%s,
                last_activity_detail=%s
            WHERE id_karyawan=%s
            """,
            (
                ts,
                activity_type,
                detail,
                id_karyawan,
            ),
        )
        db.commit()

        return {"status": "success", "message": f"Aktivitas '{activity_type}' dicatat"}
    finally:
        cursor.close()
        db.close()

# ==========================
# TWO FACTOR SETUP
# ==========================
@router.post("/2fa")
def setup_2fa(req: TwoFactorRequest):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            UPDATE karyawan 
            SET jawaban1=%s, jawaban2=%s, jawaban3=%s
            WHERE id_karyawan=%s
            """,
            (req.jawaban1, req.jawaban2, req.jawaban3, req.id_karyawan),
        )
        db.commit()

        return {"status": "success", "message": "2FA berhasil disimpan"}
    finally:
        cursor.close()
        db.close()

# ==========================
# FORGOT PASSWORD VERIFY
# ==========================
@router.post("/forgot-password/verify-2fa")
def verify_2fa(req: TwoFactorRequest):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT jawaban1, jawaban2, jawaban3 
            FROM karyawan 
            WHERE id_karyawan=%s
            """,
            (req.id_karyawan,),
        )
        karyawan = cursor.fetchone()

        if not karyawan:
            raise HTTPException(status_code=404, detail="ID Karyawan tidak ditemukan")

        # Normalisasi jawaban (lowercase & strip spasi)
        def normalize(val): return val.strip().lower() if val else ""

        if (
            normalize(karyawan["jawaban1"]) != normalize(req.jawaban1)
            or normalize(karyawan["jawaban2"]) != normalize(req.jawaban2)
            or normalize(karyawan["jawaban3"]) != normalize(req.jawaban3)
        ):
            raise HTTPException(status_code=401, detail="Jawaban tidak sesuai")

        return {"status": "success", "id_karyawan": req.id_karyawan}
    finally:
        cursor.close()
        db.close()

# ==========================
# RESET PASSWORD
# ==========================
@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        hashed_password = bcrypt.hash(req.password_baru)

        cursor.execute(
            "UPDATE users SET password=%s WHERE id_karyawan=%s",
            (hashed_password, req.id_karyawan),
        )
        db.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="ID Karyawan tidak ditemukan")

        return {"status": "success", "message": "Password berhasil direset"}
    finally:
        cursor.close()
        db.close()

@router.post("/activity")
def activity(payload: dict):
    """
    Body JSON:
    {
      "id_karyawan": 123,
      "activity_type": "ajukan_cuti",
      "detail": "Ajukan cuti tahunan 2025-07-20 s.d 2025-07-25"
    }
    """
    db = get_db()
    cursor = db.cursor(dictionary=True)

    try:
        id_karyawan = payload.get("id_karyawan")
        activity_type = payload.get("activity_type")
        detail = payload.get("detail", "")

        if not id_karyawan or not activity_type:
            raise HTTPException(status_code=400, detail="id_karyawan dan activity_type diperlukan")

        ts = now_datetime()
        cursor.execute(
            """
            UPDATE users
            SET last_activity_time=%s,
                last_activity_type=%s,
                last_activity_detail=%s
            WHERE id_karyawan=%s
            """,
            (ts, activity_type, detail, id_karyawan),
        )
        db.commit()

        return {"status": "success", "message": f"Aktivitas '{activity_type}' dicatat"}
    finally:
        cursor.close()
        db.close()
