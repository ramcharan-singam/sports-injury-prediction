import uuid
from datetime import datetime, date
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, ConfigDict

# Enum import for reference
from app.models.postgres import UserRole

# Auth Schemas
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole
    phone: Optional[str] = None
    profile_image: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    user_id: UUID
    name: str
    email: EmailStr
    role: UserRole
    account_status: str = "active"
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None

# Coach-Driven Athlete Creation Schemas
class CoachAthleteCreatePayload(BaseModel):
    name: str
    email: EmailStr
    sport: str
    position: str
    age: int
    height: float
    weight: float
    dob: Optional[date] = None
    gender: Optional[str] = "Unspecified"
    dominant_leg: Optional[str] = "Right"
    team_name: Optional[str] = None
    jersey_number: Optional[str] = None
    years_experience: Optional[float] = 1.0
    competition_level: Optional[str] = "Amateur"
    training_frequency: Optional[int] = 4
    previous_injuries_summary: Optional[str] = None
    injury_recurrence_flag: Optional[str] = "No"
    current_injury_status: Optional[str] = "Fully Cleared"
    nordic_strength_score: Optional[float] = None
    hamstring_flexibility: Optional[float] = None
    baseline_less_score: Optional[float] = None
    quad_hamstring_ratio: Optional[float] = None
    parental_consent: Optional[str] = "Cleared / N/A"
    medical_clearance_status: Optional[str] = "Cleared"
    emergency_contact: Optional[str] = None
    training_load: Optional[float] = 70.0
    flexibility: Optional[float] = 80.0
    strength: Optional[float] = 80.0
    balance: Optional[float] = 80.0
    endurance: Optional[float] = 80.0
    coach_notes: Optional[str] = None

class CoachAthleteCreateResponse(BaseModel):
    athlete_id: UUID
    user_id: UUID
    name: str
    email: str
    sport: str
    position: str
    account_status: str = "pending_activation"
    activation_code: Optional[str] = None
    activation_token: str
    activation_url: str

class ActivateAccountPayload(BaseModel):
    token: str
    new_password: str

# Access Grant Schemas
class AccessGrantCreate(BaseModel):
    granted_to_user_id: UUID

class AccessGrantOut(BaseModel):
    grant_id: UUID
    athlete_id: UUID
    granted_to_user_id: UUID
    granted_to_user_name: Optional[str] = None
    granted_to_user_role: Optional[str] = None
    granted_by_user_id: UUID
    created_at: datetime
    revoked_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Injury History & Physiotherapy Schemas
class InjuryHistoryCreate(BaseModel):
    injury_type: str
    body_part: str
    severity: str
    injury_date: date
    recovery_date: Optional[date] = None
    remarks: Optional[str] = None
    symptoms: Optional[str] = None
    treatment_details: Optional[str] = None
    rehabilitation_exercises: Optional[str] = None
    recovery_progress: Optional[float] = 0.0
    rehab_status: Optional[str] = "In Rehab"

class InjuryHistoryUpdate(BaseModel):
    injury_type: Optional[str] = None
    body_part: Optional[str] = None
    severity: Optional[str] = None
    injury_date: Optional[date] = None
    recovery_date: Optional[date] = None
    remarks: Optional[str] = None
    symptoms: Optional[str] = None
    treatment_details: Optional[str] = None
    rehabilitation_exercises: Optional[str] = None
    recovery_progress: Optional[float] = None
    rehab_status: Optional[str] = None

class InjuryFileOut(BaseModel):
    file_id: UUID
    injury_id: UUID
    file_name: str
    file_url: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InjuryHistoryOut(BaseModel):
    injury_id: UUID
    athlete_id: UUID
    injury_type: str
    body_part: str
    severity: str
    injury_date: date
    recovery_date: Optional[date] = None
    remarks: Optional[str] = None
    symptoms: Optional[str] = None
    treatment_details: Optional[str] = None
    rehabilitation_exercises: Optional[str] = None
    recovery_progress: Optional[float] = 0.0
    rehab_status: Optional[str] = "In Rehab"
    files: List[InjuryFileOut] = []

    model_config = ConfigDict(from_attributes=True)

class InjuryHistoryRestrictedOut(BaseModel):
    """Restricted schema for Coach and Sports Scientist roles: 'remarks' field MUST NOT be present."""
    injury_id: UUID
    athlete_id: UUID
    injury_type: str
    body_part: str
    severity: str
    injury_date: date
    recovery_date: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)

# Athlete Schemas
class AthleteCreate(BaseModel):
    sport: str
    position: str
    age: int
    height: float
    weight: float
    training_load: Optional[float] = 70.0
    flexibility: Optional[float] = 80.0
    strength: Optional[float] = 80.0
    balance: Optional[float] = 80.0
    endurance: Optional[float] = 80.0
    coach_notes: Optional[str] = None

class AthleteUpdate(BaseModel):
    sport: Optional[str] = None
    position: Optional[str] = None
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    training_load: Optional[float] = None
    flexibility: Optional[float] = None
    strength: Optional[float] = None
    balance: Optional[float] = None
    endurance: Optional[float] = None
    coach_notes: Optional[str] = None

class AthleteOut(BaseModel):
    athlete_id: UUID
    user_id: UUID
    owning_coach_id: Optional[UUID] = None
    account_status: str = "active"
    sport: str
    position: str
    age: int
    height: float
    weight: float
    dob: Optional[date] = None
    gender: Optional[str] = "Unspecified"
    dominant_leg: Optional[str] = "Right"
    team_name: Optional[str] = None
    jersey_number: Optional[str] = None
    years_experience: Optional[float] = 1.0
    competition_level: Optional[str] = "Amateur"
    training_frequency: Optional[int] = 4
    previous_injuries_summary: Optional[str] = None
    injury_recurrence_flag: Optional[str] = "No"
    current_injury_status: Optional[str] = "Fully Cleared"
    nordic_strength_score: Optional[float] = None
    hamstring_flexibility: Optional[float] = None
    baseline_less_score: Optional[float] = None
    quad_hamstring_ratio: Optional[float] = None
    parental_consent: Optional[str] = "Cleared / N/A"
    medical_clearance_status: Optional[str] = "Cleared"
    emergency_contact: Optional[str] = None
    training_load: float
    flexibility: float
    strength: float
    balance: float
    endurance: float
    coach_notes: Optional[str] = None
    user: Optional[UserOut] = None
    injuries: List[InjuryHistoryOut] = []

    model_config = ConfigDict(from_attributes=True)

# Dedicated Coach Professional Profile Schemas
class CoachProfileOut(BaseModel):
    coach_profile_id: UUID
    user_id: UUID
    registered_email: str
    account_password_masked: str = "••••••••"
    full_name: str
    profile_image: Optional[str] = None
    dob: Optional[date] = None
    unique_coach_id: str
    national_identity_number: Optional[str] = None
    coach_license_number: Optional[str] = None
    certification_level: Optional[str] = None
    issuing_authority: Optional[str] = None
    license_expiry_date: Optional[date] = None
    assigned_team_id: Optional[str] = None
    current_designation: Optional[str] = None
    qualification: Optional[str] = None
    coaching_specialization: Optional[str] = None
    years_coaching_experience: Optional[int] = 10
    primary_sport: Optional[str] = None
    club_academy: Optional[str] = None
    coaching_level: Optional[str] = "Elite"
    certifications_licenses: Optional[str] = None
    sports_worked_with: Optional[str] = None
    achievements: Optional[str] = None
    areas_of_expertise: Optional[str] = None
    location: Optional[str] = None
    languages: Optional[str] = None
    bio: Optional[str] = None
    verification_status: Optional[str] = "Verified ✅"
    teams_athletes_coached: Optional[str] = None
    system_access_role: str = "Coach"
    account_status: str = "active"

    model_config = ConfigDict(from_attributes=True)

class CoachProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    profile_image: Optional[str] = None
    dob: Optional[date] = None
    national_identity_number: Optional[str] = None
    coach_license_number: Optional[str] = None
    certification_level: Optional[str] = None
    issuing_authority: Optional[str] = None
    license_expiry_date: Optional[date] = None
    assigned_team_id: Optional[str] = None
    current_designation: Optional[str] = None
    qualification: Optional[str] = None
    coaching_specialization: Optional[str] = None
    years_coaching_experience: Optional[int] = None
    primary_sport: Optional[str] = None
    club_academy: Optional[str] = None
    coaching_level: Optional[str] = None
    certifications_licenses: Optional[str] = None
    sports_worked_with: Optional[str] = None
    achievements: Optional[str] = None
    areas_of_expertise: Optional[str] = None
    location: Optional[str] = None
    languages: Optional[str] = None
    bio: Optional[str] = None
    verification_status: Optional[str] = None
    teams_athletes_coached: Optional[str] = None

# Video Processing & Metrics Schemas
class FrameMetricsItem(BaseModel):
    frame: int
    l_knee: float
    r_knee: float
    l_hip: float
    r_hip: float
    l_elbow: float
    r_elbow: float
    l_foot_flexion: float
    r_foot_flexion: float
    spine_tilt: float
    step_width: float
    
    # Feature engineered attributes
    hip_flexion_angle: Optional[float] = None
    knee_flexion_angle: Optional[float] = None
    ankle_rotation_angle: Optional[float] = None
    angular_velocity: Optional[float] = None
    linear_acceleration: Optional[float] = None
    ground_reaction_force: Optional[float] = None
    postural_instability_index: Optional[float] = None
    biomechanical_deviation_score: Optional[float] = None
    fatigue_level: Optional[float] = None
    injury_risk: Optional[int] = 0
    injury_risk_prob: Optional[float] = 0.12

    # Rule-based clinical metrics
    pose_confidence: Optional[float] = None
    measurement_reliability: Optional[float] = None
    acl_valgus_angle: Optional[float] = None
    acl_flexion_initial_contact: Optional[float] = None
    acl_trunk_lean: Optional[float] = None
    acl_valgus_asymmetry: Optional[float] = None
    hamstring_speed_asymmetry: Optional[float] = None
    hamstring_pelvic_tilt: Optional[float] = None
    ankle_dorsiflexion_rom: Optional[float] = None
    ankle_sway_variance: Optional[float] = None
    shoulder_gird: Optional[float] = None
    shoulder_trom_deficit: Optional[float] = None
    shoulder_scapular_dyskinesis: Optional[float] = None
    lumbar_flexion_rom: Optional[float] = None
    lumbar_compensation_drift: Optional[float] = None
    workload_quality_decline: Optional[float] = None

    model_config = ConfigDict(extra="ignore", from_attributes=True)

class ExtractedMetricsSummary(BaseModel):
    total_video_frames: int = 154
    pose_detected_frames: int = 75
    active_movement_window: str = "F128 - F150"
    idle_frames_trimmed: int = 63
    quality_gatekeeper: Optional[dict] = None
    evidence_based_scoring: Optional[dict] = None
    metrics_preview: List[FrameMetricsItem] = []

class VideoOut(BaseModel):
    video_id: UUID
    athlete_id: UUID
    athlete_name: Optional[str] = None
    sport: Optional[str] = None
    activity: str
    video_url: str
    skeleton_video_url: Optional[str] = None
    duration: Optional[float] = None
    fps: Optional[int] = None
    resolution: Optional[str] = None
    quality_score: Optional[float] = None
    processing_status: str
    uploaded_at: datetime
    extracted_metrics: Optional[ExtractedMetricsSummary] = None

    model_config = ConfigDict(from_attributes=True)

# Analysis Report Schemas
class MovementAssessmentSample(BaseModel):
    knee_movement: str = "Good"
    hip_movement: str = "Good"
    posture: str = "Good"
    balance: str = "Moderate"
    symmetry: str = "Good"

class BiomechanicalMetricsSample(BaseModel):
    knee_flexion_angle: str = "72°"
    hip_flexion_angle: str = "41°"
    spine_tilt_angle: str = "8°"
    step_width: str = "31 cm"
    heel_distance: str = "24 cm"

class DemoAssessmentReport(BaseModel):
    report_id: str
    generated_at: datetime
    athlete_name: str
    sport: str
    position: str
    video_id: UUID
    activity: str
    duration: float
    fps: int
    resolution: str
    quality_score: float
    video_quality_status: str
    movement_assessment: MovementAssessmentSample = MovementAssessmentSample()
    biomechanical_metrics: BiomechanicalMetricsSample = BiomechanicalMetricsSample()
    evidence_based_scoring: Optional[dict] = None
    overall_assessment: Optional[str] = "CLEARED FOR TRAINING — LOW BIOMECHANICAL RISK DETECTED"
    disclaimer: Optional[str] = "This official biomechanical assessment report is generated using computer vision landmark tracking and clinical evidence-based screening rules."

# Physio Clinical & Rehabilitation Schemas
class PhysioAssessmentCreate(BaseModel):
    video_id: Optional[UUID] = None
    injury_id: Optional[UUID] = None
    observations: str
    recommendations: Optional[str] = None
    precautions: Optional[str] = None
    assessment_severity: str = "Moderate"  # Mild, Moderate, Severe
    clearance_decision: str = "Active Rehab"  # Active Rehab, Conditional, Fully Cleared

class PhysioAssessmentOut(BaseModel):
    assessment_id: UUID
    athlete_id: UUID
    video_id: Optional[UUID] = None
    injury_id: Optional[UUID] = None
    physio_user_id: UUID
    observations: str
    recommendations: Optional[str] = None
    precautions: Optional[str] = None
    assessment_severity: str
    clearance_decision: str
    created_at: datetime
    physio_name: Optional[str] = "Verified Physiotherapist ✓"
    video_activity: Optional[str] = None
    video_quality_score: Optional[float] = None
    physio_user: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

class PhysioOverallInsightCreate(BaseModel):
    overall_status: str = "Active Rehab"
    overall_comment: Optional[str] = None
    recovery_progress_percent: Optional[float] = None
    current_restrictions: Optional[str] = None
    next_followup_date: Optional[date] = None

class PhysioOverallInsightOut(BaseModel):
    insight_id: UUID
    athlete_id: UUID
    physio_user_id: UUID
    overall_status: str
    overall_comment: Optional[str] = None
    recovery_progress_percent: Optional[float] = None
    current_restrictions: Optional[str] = None
    next_followup_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    physio_name: Optional[str] = "Verified Physiotherapist ✓"
    physio_user: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

class ObjectiveTrendItem(BaseModel):
    label: str
    initial: str
    latest: str
    improved: bool

class AthleteOverallInsightResponse(BaseModel):
    latest_insight: Optional[PhysioOverallInsightOut] = None
    historical_insights: List[PhysioOverallInsightOut] = []
    objective_trends: List[ObjectiveTrendItem] = []
    total_assessments_count: int = 0

class RehabExerciseSchema(BaseModel):
    exercise_name: str
    sets: Optional[int] = 3
    reps: Optional[int] = 10
    frequency: Optional[str] = "1x daily"
    duration: Optional[str] = "2 weeks"
    instructions: Optional[str] = None

class RehabExerciseOut(RehabExerciseSchema):
    exercise_id: UUID
    plan_id: UUID

    model_config = ConfigDict(from_attributes=True)

class RehabilitationPlanCreate(BaseModel):
    injury_id: Optional[UUID] = None
    precautions: Optional[str] = None
    target_clearance_date: Optional[date] = None
    exercises: List[RehabExerciseSchema] = []

class RehabilitationPlanOut(BaseModel):
    plan_id: UUID
    athlete_id: UUID
    injury_id: Optional[UUID] = None
    physio_user_id: UUID
    precautions: Optional[str] = None
    target_clearance_date: Optional[date] = None
    created_at: datetime
    exercises: List[RehabExerciseOut] = []

    model_config = ConfigDict(from_attributes=True)

class RecoveryMonitoringCreate(BaseModel):
    injury_id: Optional[UUID] = None
    assessment_id: Optional[UUID] = None
    physio_defined_recovery_percent: float = 0.0
    baseline_metrics: Optional[dict] = None
    current_metrics: Optional[dict] = None
    improvement_notes: Optional[str] = None

class RecoveryMonitoringOut(BaseModel):
    monitoring_id: UUID
    athlete_id: UUID
    injury_id: Optional[UUID] = None
    assessment_id: Optional[UUID] = None
    physio_user_id: UUID
    physio_defined_recovery_percent: float
    baseline_metrics: Optional[dict] = None
    current_metrics: Optional[dict] = None
    improvement_notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ClinicalDocumentOut(BaseModel):
    document_id: UUID
    athlete_id: UUID
    injury_id: Optional[UUID] = None
    physio_user_id: UUID
    document_type: str
    file_name: str
    file_path: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class FollowUpCreate(BaseModel):
    injury_id: Optional[UUID] = None
    visit_date: date
    outcome_notes: str
    next_followup_date: Optional[date] = None

class FollowUpOut(BaseModel):
    followup_id: UUID
    athlete_id: UUID
    injury_id: Optional[UUID] = None
    physio_user_id: UUID
    visit_date: date
    outcome_notes: str
    next_followup_date: Optional[date] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Notification Schemas
class NotificationOut(BaseModel):
    notification_id: UUID
    recipient_user_id: UUID
    athlete_id: UUID
    notification_type: str
    title: str
    message: str
    reference_id: Optional[UUID] = None
    reference_type: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificationUnreadCountOut(BaseModel):
    unread_count: int



