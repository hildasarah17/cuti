# routers/profile.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from database import get_db
from passlib.hash import bcrypt
import os
import shutil

router = APIRouter(prefix="/profile", tags=["Profile"])

# Folder upload foto
UPLOAD_FOLDER = "uploads/avatars"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

DEFAULT_AVATAR = "uploads/avatars/default-avatar.png"
# Pastikan file default-avatar.png ada di folder uploads/avatars

# Mount folder uploads agar bisa diakses frontend
router.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# ==========================
# GET PROFILE
# ==========================
@router.get("/{id_karyawan}")
def get_profile(id_karyawan: int):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        # Ambil data karyawan
        cursor.execute("""
            SELECT id_karyawan, nama, tempat_lahir, tanggal_lahir, jenis_kelamin, agama, alamat,
                   status_karyawan AS status, divisi, email, foto
            FROM karyawan WHERE id_karyawan=%s
        """, (id_karyawan,))
        karyawan = cursor.fetchone()
        if not karyawan:
            raise HTTPException(status_code=404, detail="Karyawan tidak ditemukan")

        # Ambil password dari users
        cursor.execute("SELECT password FROM users WHERE id_karyawan=%s", (id_karyawan,))
        user = cursor.fetchone()
        karyawan["password"] = user["password"] if user else ""

        # Ubah foto menjadi URL lengkap atau default
        if karyawan.get("foto"):
            karyawan["foto"] = f"http://localhost:8000/{karyawan['foto'].replace(os.sep, '/')}"
        else:
            karyawan["foto"] = f"http://localhost:8000/{DEFAULT_AVATAR}"

        return {"status": "success", "data": karyawan}
    finally:
        cursor.close()
        db.close()


# ==========================
# UPDATE PROFILE
# ==========================
@router.put("/{id_karyawan}")
async def update_profile(
    id_karyawan: int,
    email: str = Form(...),
    password: str = Form(...),
    alamat: str = Form(...),
    file: UploadFile | None = File(None)
):
    db = get_db()
    cursor = db.cursor()
    try:
        # Update email & alamat di tabel karyawan
        cursor.execute(
            "UPDATE karyawan SET email=%s, alamat=%s WHERE id_karyawan=%s",
            (email, alamat, id_karyawan)
        )

        # Update password di tabel users
        hashed_password = bcrypt.hash(password)
        cursor.execute(
            "UPDATE users SET password=%s WHERE id_karyawan=%s",
            (hashed_password, id_karyawan)
        )

        # Upload foto jika ada
        foto_url = None
        if file:
            ext = os.path.splitext(file.filename)[1]
            filename = f"{id_karyawan}{ext}"
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            foto_url = f"http://localhost:8000/{file_path.replace(os.sep, '/')}"
            cursor.execute(
                "UPDATE karyawan SET foto=%s WHERE id_karyawan=%s",
                (file_path.replace(os.sep, "/"), id_karyawan)
            )

        db.commit()

        return {
            "status": "success",
            "message": "Profile berhasil diperbarui",
            "data": {
                "email": email,
                "alamat": alamat,
                "foto": foto_url or f"http://localhost:8000/{DEFAULT_AVATAR}"
            }
        }
    finally:
        cursor.close()
        db.close()