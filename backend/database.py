import mysql.connector

def get_db():
    """
    Membuat koneksi ke database MySQL lembur
    """
    return mysql.connector.connect(
        host="localhost",
        port= 3306,
        user="root",        # ganti sesuai user MySQL Anda
        password="",        # ganti sesuai password MySQL Anda
        database="db_cuti"   # sesuai nama database
    )