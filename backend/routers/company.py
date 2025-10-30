from fastapi import APIRouter, Depends, HTTPException
from backend.models.company_models import CompanyProfileSchema
from backend.services.company_service import save_company_profile, get_company_profile

router = APIRouter()

@router.get("/company/profile", response_model=CompanyProfileSchema)
def read_company_profile():
    profile = get_company_profile()
    if profile is None:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return profile

@router.post("/company/profile", response_model=CompanyProfileSchema)
def create_company_profile(profile_data: CompanyProfileSchema):
    try:
        saved_profile = save_company_profile(profile_data)
        return saved_profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
