from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from database import get_db

router = APIRouter(prefix="/cuti", tags=["Cuti Approval"])


class UpdateStatusRequest(BaseModel):
    status: str  # e 'Disetujui' or 'Ditolak or 'Diproses'
    id_approval: int | None = None
    note: str | None = None

@router.put("/{id_cuti}/status")
def update_status(id_cuti: int, body: UpdateStatusRequest, request: Request):
    # ✅ simple role-check via header (ganti JWT kalau sudah ada auth)
    role = request.headers.get("X-User-Role", "karyawan")
    if role.lower() != "approval":
        raise HTTPException(status_code=403, detail="Hanya role approval yang boleh mengubah status")

    if body.status not in ("Disetujui", "Ditolak"):
        raise HTTPException(status_code=400, detail="Status tidak valid")

    db = get_db()
    cursor = db.cursor()
    try:
        sql = """
            UPDATE cuti
            SET status=%s, id_approval=%s
            WHERE id_cuti=%s
        """
        cursor.execute(sql, (body.status, body.id_approval, id_cuti))
        db.commit()
        return {"status": "success", "message": f"Status cuti #{id_cuti} diperbarui jadi {body.status}"}
    finally:
        cursor.close()
        db.close()