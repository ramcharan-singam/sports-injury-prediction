import uuid
import secrets
import hashlib
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.postgres import User, Athlete, ActivationToken, UserRole, CoachProfile, AthleteAccessGrant
from app.schemas import CoachAthleteCreatePayload, CoachAthleteCreateResponse, CoachProfileOut, CoachProfileUpdate
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/api/coach", tags=["Coach Operations"])

@router.get("/profile", response_model=CoachProfileOut)
def get_coach_profile(
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Coach/Admin: Get full professional coach profile details."""
    coach_prof = db.query(CoachProfile).filter(CoachProfile.user_id == current_user.user_id).first()
    
    if not coach_prof:
        rand_id = str(uuid.uuid4())[:8].upper()
        is_seed_demo = (current_user.email == "coach@injurysense.com")
        coach_prof = CoachProfile(
            user_id=current_user.user_id,
            unique_coach_id=f"COACH-{rand_id}",
            dob=datetime(1988, 5, 15).date() if is_seed_demo else None,
            national_id_number="NAT-9840291" if is_seed_demo else None,
            coach_license_number="LIC-UEFA-9823" if is_seed_demo else f"LIC-{rand_id}",
            certification_level="Level 3 Senior High-Performance Coach" if is_seed_demo else "Certified Performance Coach",
            issuing_authority="National Sports Association" if is_seed_demo else "Sports Coaching Authority",
            license_expiry_date=datetime(2028, 12, 31).date() if is_seed_demo else None,
            assigned_team_id="TEAM-ALPHA-01" if is_seed_demo else None,
            current_designation="Head Performance & Fitness Coach" if is_seed_demo else "Head Coach",
            qualification="M.Sc. Sports Science & Biomechanics, CSCS" if is_seed_demo else "Sports Science Specialist",
            coaching_specialization="ACL Injury Prevention & Athletic Conditioning" if is_seed_demo else "Athletic Conditioning",
            years_coaching_experience=12 if is_seed_demo else 1,
            primary_sport="Soccer / Football" if is_seed_demo else "Basketball",
            club_academy="Apex Elite Sports Performance Academy" if is_seed_demo else "Youth Academy",
            coaching_level="Elite" if is_seed_demo else "Professional",
            certifications_licenses="UEFA A License, NSCA CSCS" if is_seed_demo else "National Coaching Certification",
            sports_worked_with="Soccer, Track & Field, Basketball" if is_seed_demo else "Basketball",
            achievements="Guided 15+ Elite Athletes to International Competitions" if is_seed_demo else "Registered High Performance Coach",
            areas_of_expertise="Biomechanical Video Analysis, Return-to-Sport Protocols" if is_seed_demo else "Movement Analysis",
            location="London, United Kingdom" if is_seed_demo else "United States",
            languages="English, Spanish" if is_seed_demo else "English",
            bio="Dedicated Senior High-Performance Coach" if is_seed_demo else "Performance Coach",
            verification_status="Verified ✅" if is_seed_demo else "Pending Verification",
            teams_athletes_coached="Apex Football Club" if is_seed_demo else "Squad Team"
        )
        db.add(coach_prof)
        db.commit()
        db.refresh(coach_prof)

    # Sync ProfessionalProfile for Admin Verification Queue
    prof = db.query(ProfessionalProfile).filter(ProfessionalProfile.user_id == current_user.user_id).first()
    if not prof:
        prof = ProfessionalProfile(
            user_id=current_user.user_id,
            qualification=coach_prof.qualification,
            specialization=coach_prof.coaching_specialization,
            certifications=coach_prof.certifications_licenses,
            organization=coach_prof.club_academy,
            license_number=coach_prof.coach_license_number,
            verification_status="Verified" if coach_prof.verification_status == "Verified ✅" else "Pending"
        )
        db.add(prof)
        db.commit()

    return CoachProfileOut(
        coach_profile_id=coach_prof.coach_profile_id,
        user_id=current_user.user_id,
        registered_email=current_user.email,
        account_password_masked="••••••••",
        full_name=current_user.name,
        profile_image=current_user.profile_image,
        dob=coach_prof.dob,
        unique_coach_id=coach_prof.unique_coach_id,
        national_identity_number=coach_prof.national_id_number,
        coach_license_number=coach_prof.coach_license_number,
        certification_level=coach_prof.certification_level,
        issuing_authority=coach_prof.issuing_authority,
        license_expiry_date=coach_prof.license_expiry_date,
        assigned_team_id=coach_prof.assigned_team_id,
        current_designation=coach_prof.current_designation or "Head Coach",
        qualification=coach_prof.qualification or "Sports Science Specialist",
        coaching_specialization=coach_prof.coaching_specialization or "Athletic Conditioning",
        years_coaching_experience=coach_prof.years_coaching_experience if coach_prof.years_coaching_experience is not None else 1,
        primary_sport=coach_prof.primary_sport or "Basketball",
        club_academy=coach_prof.club_academy or "Youth Academy",
        coaching_level=coach_prof.coaching_level or "Professional",
        certifications_licenses=coach_prof.certifications_licenses or "National Coaching Certification",
        sports_worked_with=coach_prof.sports_worked_with or "Basketball",
        achievements=coach_prof.achievements or "Registered High Performance Coach",
        areas_of_expertise=coach_prof.areas_of_expertise or "Movement Analysis",
        location=coach_prof.location or "United States",
        languages=coach_prof.languages or "English",
        bio=coach_prof.bio or "Performance Coach",
        verification_status=coach_prof.verification_status or "Pending Verification",
        teams_athletes_coached=coach_prof.teams_athletes_coached or "Squad Team",
        system_access_role=current_user.role.value,
        account_status=current_user.account_status
    )

@router.put("/profile", response_model=CoachProfileOut)
def update_coach_profile(
    payload: CoachProfileUpdate,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Coach/Admin: Update professional coach profile details with required field validation."""
    coach_prof = db.query(CoachProfile).filter(CoachProfile.user_id == current_user.user_id).first()
    if not coach_prof:
        rand_id = str(uuid.uuid4())[:8].upper()
        coach_prof = CoachProfile(
            user_id=current_user.user_id,
            unique_coach_id=f"COACH-{rand_id}"
        )
        db.add(coach_prof)
        db.commit()
        db.refresh(coach_prof)

    # Required field non-empty checks
    if payload.full_name is not None and not payload.full_name.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Full Name is a required field.")
    if payload.qualification is not None and not payload.qualification.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Qualification is a required field.")
    if payload.coaching_specialization is not None and not payload.coaching_specialization.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coaching Specialization is a required field.")
    if payload.primary_sport is not None and not payload.primary_sport.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Primary Sport is a required field.")
    if payload.current_designation is not None and not payload.current_designation.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current Team / Position is a required field.")

    if payload.full_name:
        current_user.name = payload.full_name.strip()
        db.add(current_user)
    if payload.profile_image is not None:
        current_user.profile_image = payload.profile_image
        db.add(current_user)

    if payload.dob is not None:
        coach_prof.dob = payload.dob
    if payload.national_identity_number is not None:
        coach_prof.national_id_number = payload.national_identity_number
    if payload.coach_license_number is not None:
        coach_prof.coach_license_number = payload.coach_license_number
    if payload.certification_level is not None:
        coach_prof.certification_level = payload.certification_level
    if payload.issuing_authority is not None:
        coach_prof.issuing_authority = payload.issuing_authority
    if payload.license_expiry_date is not None:
        coach_prof.license_expiry_date = payload.license_expiry_date
    if payload.assigned_team_id is not None:
        coach_prof.assigned_team_id = payload.assigned_team_id
    if payload.current_designation is not None:
        coach_prof.current_designation = payload.current_designation
    if payload.qualification is not None:
        coach_prof.qualification = payload.qualification
    if payload.coaching_specialization is not None:
        coach_prof.coaching_specialization = payload.coaching_specialization
    if payload.years_coaching_experience is not None:
        coach_prof.years_coaching_experience = payload.years_coaching_experience
    if payload.primary_sport is not None:
        coach_prof.primary_sport = payload.primary_sport
    if payload.club_academy is not None:
        coach_prof.club_academy = payload.club_academy
    if payload.coaching_level is not None:
        coach_prof.coaching_level = payload.coaching_level
    if payload.certifications_licenses is not None:
        coach_prof.certifications_licenses = payload.certifications_licenses
    if payload.sports_worked_with is not None:
        coach_prof.sports_worked_with = payload.sports_worked_with
    if payload.achievements is not None:
        coach_prof.achievements = payload.achievements
    if payload.areas_of_expertise is not None:
        coach_prof.areas_of_expertise = payload.areas_of_expertise
    if payload.location is not None:
        coach_prof.location = payload.location
    if payload.languages is not None:
        coach_prof.languages = payload.languages
    if payload.bio is not None:
        coach_prof.bio = payload.bio
    if payload.verification_status is not None:
        coach_prof.verification_status = payload.verification_status
    if payload.teams_athletes_coached is not None:
        coach_prof.teams_athletes_coached = payload.teams_athletes_coached

    db.commit()
    db.refresh(coach_prof)

    # Sync ProfessionalProfile for Admin Verification Queue
    prof = db.query(ProfessionalProfile).filter(ProfessionalProfile.user_id == current_user.user_id).first()
    if not prof:
        prof = ProfessionalProfile(
            user_id=current_user.user_id,
            verification_status="Pending"
        )
        db.add(prof)

    prof.qualification = coach_prof.qualification
    prof.specialization = coach_prof.coaching_specialization
    prof.organization = coach_prof.club_academy
    prof.certifications = coach_prof.certifications_licenses
    prof.license_number = coach_prof.coach_license_number
    db.commit()

    return CoachProfileOut(
        coach_profile_id=coach_prof.coach_profile_id,
        user_id=current_user.user_id,
        registered_email=current_user.email,
        account_password_masked="••••••••",
        full_name=current_user.name,
        profile_image=current_user.profile_image,
        dob=coach_prof.dob,
        unique_coach_id=coach_prof.unique_coach_id,
        national_identity_number=coach_prof.national_id_number,
        coach_license_number=coach_prof.coach_license_number,
        certification_level=coach_prof.certification_level,
        issuing_authority=coach_prof.issuing_authority,
        license_expiry_date=coach_prof.license_expiry_date,
        assigned_team_id=coach_prof.assigned_team_id,
        current_designation=coach_prof.current_designation or "Head Performance & Fitness Coach",
        qualification=coach_prof.qualification,
        coaching_specialization=coach_prof.coaching_specialization,
        years_coaching_experience=coach_prof.years_coaching_experience,
        primary_sport=coach_prof.primary_sport,
        club_academy=coach_prof.club_academy,
        coaching_level=coach_prof.coaching_level,
        certifications_licenses=coach_prof.certifications_licenses,
        sports_worked_with=coach_prof.sports_worked_with,
        achievements=coach_prof.achievements,
        areas_of_expertise=coach_prof.areas_of_expertise,
        location=coach_prof.location,
        languages=coach_prof.languages,
        bio=coach_prof.bio,
        verification_status=coach_prof.verification_status,
        teams_athletes_coached=coach_prof.teams_athletes_coached,
        system_access_role=current_user.role.value,
        account_status=current_user.account_status
    )

@router.post("/athletes", response_model=CoachAthleteCreateResponse, status_code=status.HTTP_201_CREATED)
def register_athlete_by_coach(
    payload: CoachAthleteCreatePayload,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Coach-only Athlete Registration (Option A).
    """
    email_clean = payload.email.strip().lower()
    existing_user = db.query(User).filter(User.email.ilike(email_clean)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists."
        )

    athlete_user = User(
        name=payload.name.strip(),
        email=email_clean,
        password=None,
        role=UserRole.ATHLETE,
        account_status="pending_activation"
    )
    db.add(athlete_user)
    db.commit()
    db.refresh(athlete_user)

    athlete = Athlete(
        user_id=athlete_user.user_id,
        owning_coach_id=current_user.user_id,
        sport=payload.sport.strip(),
        position=payload.position.strip(),
        age=payload.age,
        height=payload.height,
        weight=payload.weight,
        dob=payload.dob,
        gender=payload.gender or "Unspecified",
        dominant_leg=payload.dominant_leg or "Right",
        team_name=payload.team_name,
        jersey_number=payload.jersey_number,
        years_experience=payload.years_experience or 1.0,
        competition_level=payload.competition_level or "Amateur",
        training_frequency=payload.training_frequency or 4,
        previous_injuries_summary=payload.previous_injuries_summary,
        injury_recurrence_flag=payload.injury_recurrence_flag or "No",
        current_injury_status=payload.current_injury_status or "Fully Cleared",
        nordic_strength_score=payload.nordic_strength_score,
        hamstring_flexibility=payload.hamstring_flexibility,
        baseline_less_score=payload.baseline_less_score,
        quad_hamstring_ratio=payload.quad_hamstring_ratio,
        parental_consent=payload.parental_consent or "Cleared / N/A",
        medical_clearance_status=payload.medical_clearance_status or "Cleared",
        emergency_contact=payload.emergency_contact,
        training_load=payload.training_load or 70.0,
        flexibility=payload.flexibility or 80.0,
        strength=payload.strength or 80.0,
        balance=payload.balance or 80.0,
        endurance=payload.endurance or 80.0,
        coach_notes=payload.coach_notes
    )
    db.add(athlete)
    db.commit()
    db.refresh(athlete)

    # Auto-grant access ONLY to staff members that this Coach has explicitly granted access to
    active_delegates = db.query(AthleteAccessGrant.granted_to_user_id).filter(
        AthleteAccessGrant.granted_by_user_id == current_user.user_id,
        AthleteAccessGrant.revoked_at.is_(None)
    ).distinct().all()

    for (staff_uid,) in active_delegates:
        grant = AthleteAccessGrant(
            athlete_id=athlete.athlete_id,
            granted_to_user_id=staff_uid,
            granted_by_user_id=current_user.user_id
        )
        db.add(grant)
    if active_delegates:
        db.commit()

    # Generate 6-digit random activation code
    code_num = secrets.randbelow(900000) + 100000
    raw_token = f"{code_num}"
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(hours=48)

    act_token = ActivationToken(
        user_id=athlete_user.user_id,
        token_hash=token_hash,
        expires_at=expires_at
    )
    db.add(act_token)
    db.commit()

    activation_url = f"http://localhost:3000/activate?token={raw_token}"

    return CoachAthleteCreateResponse(
        athlete_id=athlete.athlete_id,
        user_id=athlete_user.user_id,
        name=athlete_user.name,
        email=athlete_user.email,
        sport=athlete.sport,
        position=athlete.position,
        account_status=athlete_user.account_status,
        activation_code=raw_token,
        activation_token=raw_token,
        activation_url=activation_url
    )

@router.post("/athletes/{athlete_id}/resend-activation", response_model=CoachAthleteCreateResponse)
def resend_athlete_activation(
    athlete_id: uuid.UUID,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Coach/Admin: Re-issue a fresh 48-hour activation code for a pending athlete.
    """
    athlete = db.query(Athlete).filter(Athlete.athlete_id == athlete_id).first()
    if not athlete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Athlete profile not found"
        )

    if current_user.role == UserRole.COACH and athlete.owning_coach_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owning Coach can resend an activation link for this athlete."
        )

    athlete_user = db.query(User).filter(User.user_id == athlete.user_id).first()
    if not athlete_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated athlete user account not found."
        )

    code_num = secrets.randbelow(900000) + 100000
    raw_token = f"{code_num}"
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(hours=48)

    act_token = ActivationToken(
        user_id=athlete_user.user_id,
        token_hash=token_hash,
        expires_at=expires_at
    )
    db.add(act_token)
    db.commit()

    activation_url = f"http://localhost:3000/activate?token={raw_token}"

    return CoachAthleteCreateResponse(
        athlete_id=athlete.athlete_id,
        user_id=athlete_user.user_id,
        name=athlete_user.name,
        email=athlete_user.email,
        sport=athlete.sport,
        position=athlete.position,
        account_status=athlete_user.account_status,
        activation_code=raw_token,
        activation_token=raw_token,
        activation_url=activation_url
    )
