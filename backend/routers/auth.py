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
    """
    Login menggunakan id_karyawan dan password.
    Password bisa hash (bcrypt) atau plain text.
    """
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # 1. Ambil user dari tabel users
    cursor.execute(
        "SELECT id_karyawan, password, role FROM users WHERE id_karyawan=%s",
        (req.id_karyawan,),
    )
    user = cursor.fetchone()

    if not user:
        cursor.close()
        db.close()
        raise HTTPException(status_code=401, detail="ID Karyawan tidak terdaftar")

    cursor.close()
    db.close()

    if not user:
        raise HTTPException(status_code=404, detail="Data karyawan tidak ditemukan")

    # 3. Validasi password
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

    # 4. Return data login (belum ada jawaban 2FA)
    return {
    "status": "success",
    "message": "Login berhasil, lanjutkan ke 2FA",
    "user": {
        "id_karyawan": user["id_karyawan"],
        "role": user["role"],
    },
}



# ==========================
# TWO FACTOR SETUP
# ==========================
@router.post("/2fa")
def setup_2fa(req: TwoFactorRequest):
    """
    Simpan jawaban keamanan (2FA) ke database.
    """
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # update jawaban ke tabel karyawan
    cursor.execute(
        """
        UPDATE karyawan 
        SET jawaban1=%s, jawaban2=%s, jawaban3=%s
        WHERE id_karyawan=%s
        """,
        (req.jawaban1, req.jawaban2, req.jawaban3, req.id_karyawan),
    )
    db.commit()

    cursor.close()
    db.close()

    return {"status": "success", "message": "2FA berhasil disimpan"}