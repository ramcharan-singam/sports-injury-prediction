import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, Date, Enum as SQLEnum, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.database import Base

class UserRole(str, enum.Enum):
    ATHLETE = "Athlete"
    COACH = "Coach"
    PHYSIOTHERAPIST = "Physiotherapist"
    SPORTS_SCIENTIST = "Sports Scientist"
    ADMIN = "Admin"

class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=True)  # Nullable for pending activation accounts
    role = Column(SQLEnum(UserRole), nullable=False)
    account_status = Column(String, nullable=False, default="active")  # "pending_activation" or "active"
    phone = Column(String, nullable=True)
    profile_image = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    athlete_profile = relationship("Athlete", back_populates="user", uselist=False, foreign_keys="Athlete.user_id")
    coach_profile = relationship("CoachProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    activation_tokens = relationship("ActivationToken", back_populates="user", cascade="all, delete-orphan")

class CoachProfile(Base):
    __tablename__ = "coach_profiles"

    coach_profile_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), unique=True, nullable=False)
    unique_coach_id = Column(String, nullable=False, unique=True, index=True)
    dob = Column(Date, nullable=True)
    national_id_number = Column(String, nullable=True)
    coach_license_number = Column(String, nullable=True)
    certification_level = Column(String, nullable=True)
    issuing_authority = Column(String, nullable=True)
    license_expiry_date = Column(Date, nullable=True)
    assigned_team_id = Column(String, nullable=True)
    current_designation = Column(String, nullable=True)

    # Expanded Profile Attributes
    qualification = Column(String, nullable=True)
    coaching_specialization = Column(String, nullable=True)
    years_coaching_experience = Column(Integer, nullable=True, default=10)
    primary_sport = Column(String, nullable=True)
    club_academy = Column(String, nullable=True)
    coaching_level = Column(String, nullable=True, default="Elite")  # Beginner, Academy, Professional, Elite
    certifications_licenses = Column(Text, nullable=True)
    sports_worked_with = Column(Text, nullable=True)
    achievements = Column(Text, nullable=True)
    areas_of_expertise = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    languages = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    verification_status = Column(String, nullable=True, default="Verified ✅")
    teams_athletes_coached = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="coach_profile")

class Athlete(Base):
    __tablename__ = "athletes"

    athlete_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), unique=True, nullable=False)
    owning_coach_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True)
    sport = Column(String, nullable=False)
    position = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    height = Column(Float, nullable=False)
    weight = Column(Float, nullable=False)

    # Identity & Basic Info
    dob = Column(Date, nullable=True)
    gender = Column(String, nullable=True, default="Unspecified")
    dominant_leg = Column(String, nullable=True, default="Right")
    team_name = Column(String, nullable=True)
    jersey_number = Column(String, nullable=True)

    # Sports Background
    years_experience = Column(Float, nullable=True, default=1.0)
    competition_level = Column(String, nullable=True, default="Amateur")
    training_frequency = Column(Integer, nullable=True, default=4)

    # Injury History Summary & Status
    previous_injuries_summary = Column(Text, nullable=True)
    injury_recurrence_flag = Column(String, nullable=True, default="No")
    current_injury_status = Column(String, nullable=True, default="Fully Cleared")

    # Physical Screening Baselines
    nordic_strength_score = Column(Float, nullable=True)
    hamstring_flexibility = Column(Float, nullable=True)
    baseline_less_score = Column(Float, nullable=True)
    quad_hamstring_ratio = Column(Float, nullable=True)

    # Consent & Admin
    parental_consent = Column(String, nullable=True, default="Cleared / N/A")
    medical_clearance_status = Column(String, nullable=True, default="Cleared")

    # Additional Parameters
    emergency_contact = Column(String, nullable=True)
    training_load = Column(Float, default=70.0)
    flexibility = Column(Float, default=80.0)
    strength = Column(Float, default=80.0)
    balance = Column(Float, default=80.0)
    endurance = Column(Float, default=80.0)
    coach_notes = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="athlete_profile", foreign_keys=[user_id])
    owning_coach = relationship("User", foreign_keys=[owning_coach_id])
    injuries = relationship("InjuryHistory", back_populates="athlete", cascade="all, delete-orphan")
    videos = relationship("Video", back_populates="athlete", cascade="all, delete-orphan")
    access_grants = relationship("AthleteAccessGrant", back_populates="athlete", cascade="all, delete-orphan")

class AthleteAccessGrant(Base):
    __tablename__ = "athlete_access_grants"

    grant_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.athlete_id"), nullable=False)
    granted_to_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    granted_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    revoked_at = Column(DateTime, nullable=True)

    # Relationships
    athlete = relationship("Athlete", back_populates="access_grants")
    granted_to_user = relationship("User", foreign_keys=[granted_to_user_id])
    granted_by_user = relationship("User", foreign_keys=[granted_by_user_id])

class ActivationToken(Base):
    __tablename__ = "activation_tokens"

    token_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    token_hash = Column(String, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="activation_tokens")

class InjuryHistory(Base):
    __tablename__ = "injury_history"

    injury_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.athlete_id"), nullable=False)
    injury_type = Column(String, nullable=False)
    body_part = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    injury_date = Column(Date, nullable=False)
    recovery_date = Column(Date, nullable=True)
    remarks = Column(Text, nullable=True)
    symptoms = Column(Text, nullable=True)
    treatment_details = Column(Text, nullable=True)
    rehabilitation_exercises = Column(Text, nullable=True)
    recovery_progress = Column(Float, default=0.0)
    rehab_status = Column(String, default="In Rehab")

    # Relationships
    athlete = relationship("Athlete", back_populates="injuries")
    files = relationship("InjuryFile", back_populates="injury", cascade="all, delete-orphan")

class InjuryFile(Base):
    __tablename__ = "injury_files"

    file_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    injury_id = Column(UUID(as_uuid=True), ForeignKey("injury_history.injury_id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    file_url = Column(Text, nullable=False)
    file_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    injury = relationship("InjuryHistory", back_populates="files")

class Video(Base):
    __tablename__ = "videos"

    video_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.athlete_id"), nullable=False)
    activity = Column(String, nullable=False)
    video_url = Column(Text, nullable=False)
    duration = Column(Float, nullable=True)
    fps = Column(Integer, nullable=True)
    resolution = Column(String, nullable=True)
    quality_score = Column(Float, nullable=True)
    processing_status = Column(String, default="QUEUED")  # QUEUED, PROCESSING, COMPLETED, FAILED
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    athlete = relationship("Athlete", back_populates="videos")

class PhysioAssessment(Base):
    __tablename__ = "physio_assessments"

    assessment_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.athlete_id"), nullable=False)
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.video_id"), nullable=True)
    injury_id = Column(UUID(as_uuid=True), ForeignKey("injury_history.injury_id"), nullable=True)
    physio_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    observations = Column(Text, nullable=False)
    recommendations = Column(Text, nullable=True)
    precautions = Column(Text, nullable=True)
    assessment_severity = Column(String, nullable=False, default="Moderate")  # Mild, Moderate, Severe
    clearance_decision = Column(String, nullable=False, default="Active Rehab")  # Active Rehab, Conditional, Fully Cleared
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    athlete = relationship("Athlete", foreign_keys=[athlete_id])
    physio_user = relationship("User", foreign_keys=[physio_user_id])
    video = relationship("Video", foreign_keys=[video_id])
    injury = relationship("InjuryHistory", foreign_keys=[injury_id])

class PhysioOverallInsight(Base):
    __tablename__ = "physio_overall_insights"

    insight_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.athlete_id"), nullable=False)
    physio_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    overall_status = Column(String, nullable=False, default="Active Rehab")
    overall_comment = Column(Text, nullable=True)
    recovery_progress_percent = Column(Float, nullable=True)
    current_restrictions = Column(Text, nullable=True)
    next_followup_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    athlete = relationship("Athlete", foreign_keys=[athlete_id])
    physio_user = relationship("User", foreign_keys=[physio_user_id])

class RehabilitationPlan(Base):
    __tablename__ = "rehabilitation_plans"

    plan_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.athlete_id"), nullable=False)
    injury_id = Column(UUID(as_uuid=True), ForeignKey("injury_history.injury_id"), nullable=True)
    physio_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    precautions = Column(Text, nullable=True)
    target_clearance_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    athlete = relationship("Athlete", foreign_keys=[athlete_id])
    physio_user = relationship("User", foreign_keys=[physio_user_id])
    injury = relationship("InjuryHistory", foreign_keys=[injury_id])
    exercises = relationship("RehabExercise", back_populates="plan", cascade="all, delete-orphan")

class RehabExercise(Base):
    __tablename__ = "rehab_exercises"

    exercise_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("rehabilitation_plans.plan_id", ondelete="CASCADE"), nullable=False)
    exercise_name = Column(String, nullable=False)
    sets = Column(Integer, nullable=True, default=3)
    reps = Column(Integer, nullable=True, default=10)
    frequency = Column(String, nullable=True, default="1x daily")
    duration = Column(String, nullable=True, default="2 weeks")
    instructions = Column(Text, nullable=True)

    # Relationships
    plan = relationship("RehabilitationPlan", back_populates="exercises")

class RecoveryMonitoring(Base):
    __tablename__ = "recovery_monitoring"

    monitoring_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.athlete_id"), nullable=False)
    injury_id = Column(UUID(as_uuid=True), ForeignKey("injury_history.injury_id"), nullable=True)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("physio_assessments.assessment_id"), nullable=True)
    physio_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    physio_defined_recovery_percent = Column(Float, nullable=False, default=0.0)
    baseline_metrics = Column(JSON, nullable=True)
    current_metrics = Column(JSON, nullable=True)
    improvement_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    athlete = relationship("Athlete", foreign_keys=[athlete_id])
    physio_user = relationship("User", foreign_keys=[physio_user_id])
    assessment = relationship("PhysioAssessment", foreign_keys=[assessment_id])

class ClinicalDocument(Base):
    __tablename__ = "clinical_documents"

    document_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.athlete_id"), nullable=False)
    injury_id = Column(UUID(as_uuid=True), ForeignKey("injury_history.injury_id"), nullable=True)
    physio_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    document_type = Column(String, nullable=False, default="PDF Report")  # MRI, X-Ray, PDF Report, Other
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    athlete = relationship("Athlete", foreign_keys=[athlete_id])
    physio_user = relationship("User", foreign_keys=[physio_user_id])

class FollowUp(Base):
    __tablename__ = "follow_ups"

    followup_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.athlete_id"), nullable=False)
    injury_id = Column(UUID(as_uuid=True), ForeignKey("injury_history.injury_id"), nullable=True)
    physio_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    visit_date = Column(Date, nullable=False)
    outcome_notes = Column(Text, nullable=False)
    next_followup_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    athlete = relationship("Athlete", foreign_keys=[athlete_id])
    physio_user = relationship("User", foreign_keys=[physio_user_id])

class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipient_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False, index=True)
    athlete_id = Column(UUID(as_uuid=True), ForeignKey("athletes.athlete_id"), nullable=True, index=True)
    notification_type = Column(String, nullable=False) # PHYSIO_ASSESSMENT, REHAB_PLAN, RECOVERY_UPDATE, FOLLOW_UP, OVERALL_INSIGHT, ADMIN_NOTICE
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    reference_id = Column(UUID(as_uuid=True), nullable=True)
    reference_type = Column(String, nullable=True) # PHYSIO_ASSESSMENT, REHABILITATION_PLAN, RECOVERY_MONITORING, FOLLOW_UP, PHYSIO_OVERALL_INSIGHT, ADMIN_ACTION
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    recipient_user = relationship("User", foreign_keys=[recipient_user_id])
    athlete = relationship("Athlete", foreign_keys=[athlete_id])

class ProfessionalProfile(Base):
    __tablename__ = "professional_profiles"

    profile_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), unique=True, nullable=False)
    qualification = Column(String, nullable=True)
    specialization = Column(String, nullable=True)
    certifications = Column(Text, nullable=True)
    organization = Column(String, nullable=True)
    license_number = Column(String, nullable=True)
    verification_status = Column(String, nullable=False, default="Pending") # Pending, Verified, Rejected
    rejection_reason = Column(Text, nullable=True)
    submitted_documents = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    verified_by_admin_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True)

    user = relationship("User", foreign_keys=[user_id])
    verified_by_admin = relationship("User", foreign_keys=[verified_by_admin_id])

class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    audit_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    action_type = Column(String, nullable=False) # USER_STATUS_CHANGE, PROFESSIONAL_VERIFIED, PROFESSIONAL_REJECTED, CONTENT_REMOVED, USER_SUSPENDED, ROLE_CHANGE
    target_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True)
    target_record_id = Column(String, nullable=True)
    action_description = Column(Text, nullable=False)
    previous_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    admin_user = relationship("User", foreign_keys=[admin_user_id])
    target_user = relationship("User", foreign_keys=[target_user_id])

class ModerationReport(Base):
    __tablename__ = "moderation_reports"

    report_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    reported_user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True)
    content_type = Column(String, nullable=False) # Post, Comment, Video, Profile
    content_id = Column(String, nullable=True)
    reason = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="Pending") # Pending, Resolved, Action Taken, Dismissed
    action_taken = Column(Text, nullable=True)
    resolved_by_admin_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    reporter_user = relationship("User", foreign_keys=[reporter_user_id])
    reported_user = relationship("User", foreign_keys=[reported_user_id])
    resolved_by_admin = relationship("User", foreign_keys=[resolved_by_admin_id])


