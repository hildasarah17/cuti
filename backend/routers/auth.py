from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db
from passlib.hash import bcrypt

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
            if bcrypt.verify(req.password, db_password):
                valid = True
        except ValueError:
            pass  # kalau bukan hash

        if not valid and db_password == req.password:
            valid = True

        if not valid:
            raise HTTPException(status_code=401, detail="Password salah")

        # Cek apakah sudah ada jawaban 2FA
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
class ResetPasswordRequest(BaseModel):
    id_karyawan: int
    password_baru: str


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
