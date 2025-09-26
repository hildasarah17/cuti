
# routers/approve.py
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from database import get_db
from typing import List

router = APIRouter(prefix="/cuti", tags=["Cuti Approval"])

# Model for single update
class UpdateStatusRequest(BaseModel):
    status: str  # 'Disetujui' or 'Ditolak'
    id_approval: int | None = None
    note: str | None = None

# Model for bulk update
class BulkUpdateRequest(BaseModel):
    ids: List[int]
    status: str  # 'Disetujui' or 'Ditolak'
    id_approval: int | None = None
    note: str | None = None

def _check_role_is_approval(request: Request):
    # Simple check: header X-User-Role. Ganti dengan JWT/Auth real jika ada.
    role = request.headers.get("X-User-Role", "")
    if not role or role.lower() != "approval":
        raise HTTPException(status_code=403, detail="Hanya role approval yang boleh mengubah status")

@router.put("/{id_cuti}/status")
def update_status(id_cuti: int, body: UpdateStatusRequest, request: Request):
    _check_role_is_approval(request)

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

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Cuti tidak ditemukan atau tidak diubah")

        return {"status": "success", "message": f"Status cuti #{id_cuti} diperbarui jadi {body.status}"}
    finally:
        cursor.close()
        db.close()

@router.put("/bulk-status")
def bulk_update_status(body: BulkUpdateRequest, request: Request):
    _check_role_is_approval(request)

    if not body.ids:
        raise HTTPException(status_code=400, detail="Daftar id kosong")
    if body.status not in ("Disetujui", "Ditolak"):
        raise HTTPException(status_code=400, detail="Status tidak valid")

    db = get_db()
    cursor = db.cursor()
    try:
        # build placeholders
        ids_tuple = tuple(body.ids)
        # Update dengan single query menggunakan IN (...)
        sql = f"""
            UPDATE cuti
            SET status=%s, id_approval=%s
            WHERE id_cuti IN ({','.join(['%s'] * len(body.ids))})
        """
        params = [body.status, body.id_approval] + list(body.ids)
        cursor.execute(sql, tuple(params))
        db.commit()

        affected = cursor.rowcount

        return {
            "status": "success",
            "message": f"{affected} pengajuan cuti diperbarui menjadi {body.status}",
            "updated_count": affected,
            "updated_ids": body.ids  # frontend bisa memanfaatkan ini untuk update UI
        }
    finally:
        cursor.close()
        db.close()