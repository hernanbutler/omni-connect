from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services import view_state_service

router = APIRouter()


class KeyValue(BaseModel):
    key: str
    value: str


@router.get("/view-states/{key}")
def read_view_state(key: str):
    state = view_state_service.get_view_state(key)
    if state is None:
        raise HTTPException(status_code=404, detail="View state not found")
    return {"value": state}


@router.post("/view-states")
def create_or_update_view_state(kv: KeyValue):
    view_state_service.set_view_state(kv.key, kv.value)
    return {"message": "View state updated successfully"}


# Backwards-compatible endpoints (underscore / PUT)
class ViewState(BaseModel):
    state: str


@router.get("/view_state/{view_name}")
def get_view_state(view_name: str):
    state = view_state_service.get_view_state(view_name)
    if state is None:
        raise HTTPException(status_code=404, detail="View not found")
    return {"state": state}


@router.put("/view_state/{view_name}")
def update_view_state(view_name: str, view_state: ViewState):
    view_state_service.update_view_state(view_name, view_state.state)
    return {"message": "View state updated successfully"}
