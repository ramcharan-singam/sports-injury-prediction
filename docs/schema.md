# Database Schema Documentation: Sports Injury Risk Detection Platform

This document defines the complete relational (PostgreSQL) and document-based (MongoDB) database architecture for the Sports Injury Risk Detection platform.

---

## 1. PostgreSQL Relational Database Schema (Phase 1 Implemented)

### `users`
Stores system users, credentials, and roles.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `user_id` | UUID | Primary Key | Unique user identifier |
| `name` | VARCHAR | Required | User full name |
| `email` | VARCHAR | Unique, Required | User email address |
| `password` | TEXT | Required | Hashed password (Bcrypt) |
| `role` | ENUM | Required | Role: `Athlete`, `Coach`, `Physiotherapist`, `Sports Scientist`, `Admin` |
| `phone` | VARCHAR | Optional | Contact phone number |
| `profile_image` | TEXT | Optional | Image URL or storage path |
| `created_at` | TIMESTAMP | Default `NOW()` | Account creation timestamp |

### `athletes`
Stores physical and biomechanical profile details of athletes linked to a `users` account.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `athlete_id` | UUID | Primary Key | Unique athlete identifier |
| `user_id` | UUID | Foreign Key (`users.user_id`) | Associated user account |
| `sport` | VARCHAR | Required | Primary sport (e.g. Football, Basketball, Track) |
| `position` | VARCHAR | Required | Playing position |
| `age` | INT | Required | Age in years |
| `height` | FLOAT | Required | Height in centimeters or meters |
| `weight` | FLOAT | Required | Weight in kilograms |
| `training_load` | FLOAT | Required | Weekly training volume/intensity score |
| `flexibility` | FLOAT | Required | Biomechanical flexibility score (0-100) |
| `strength` | FLOAT | Required | Strength index score (0-100) |
| `balance` | FLOAT | Required | Dynamic balance score (0-100) |
| `endurance` | FLOAT | Required | Cardiorespiratory/muscular endurance score (0-100) |
| `coach_notes` | TEXT | Optional | Notes from coach or physiotherapist |

### `injury_history`
Tracks past and active injuries per athlete.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `injury_id` | UUID | Primary Key | Unique injury record identifier |
| `athlete_id` | UUID | Foreign Key (`athletes.athlete_id`) | Target athlete |
| `injury_type` | VARCHAR | Required | E.g., ACL Tear, Ankle Sprain, Hamstring Strain |
| `body_part` | VARCHAR | Required | Knee, Ankle, Thigh, Shoulder, Lower Back, etc. |
| `severity` | VARCHAR | Required | Mild, Moderate, Severe, Chronic |
| `injury_date` | DATE | Required | Date of occurrence |
| `recovery_date` | DATE | Optional | Actual or estimated recovery date |
| `remarks` | TEXT | Optional | Medical notes and rehabilitation status |

### `videos`
Stores metadata and status of uploaded movement assessment videos.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `video_id` | UUID | Primary Key | Unique video assessment identifier |
| `athlete_id` | UUID | Foreign Key (`athletes.athlete_id`) | Athlete performing movement |
| `activity` | VARCHAR | Required | Squat, Drop Jump, Sprint, Lunge, Cutting Movement |
| `video_url` | TEXT | Required | Local file path or cloud URL |
| `duration` | FLOAT | Optional | Video duration in seconds |
| `fps` | INT | Optional | Frames per second |
| `resolution` | VARCHAR | Optional | E.g., `1920x1080` |
| `quality_score` | FLOAT | Optional | Video clarity/lighting score (0-100) |
| `processing_status` | VARCHAR | Required, Default `"QUEUED"` | `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `uploaded_at` | TIMESTAMP | Default `NOW()` | Upload timestamp |

---

## 2. MongoDB Document Schemas (Pose & Motion Data)

### Collection: `pose_data`
Stores frame-by-frame 2D/3D skeletal keypoint coordinates extracted during video processing.

```json
{
  "video_id": "UUID string",
  "athlete_id": "UUID string",
  "frames": [
    {
      "frame_number": 0,
      "timestamp": 0.033,
      "keypoints": [
        { "id": 0, "name": "nose", "x": 0.52, "y": 0.18, "z": 0.10, "visibility": 0.98 },
        { "id": 23, "name": "left_hip", "x": 0.48, "y": 0.55, "z": 0.05, "visibility": 0.95 },
        { "id": 25, "name": "left_knee", "x": 0.47, "y": 0.72, "z": 0.02, "visibility": 0.92 },
        { "id": 27, "name": "left_ankle", "x": 0.46, "y": 0.88, "z": 0.01, "visibility": 0.90 }
      ]
    }
  ],
  "skeleton": [
    ["left_hip", "left_knee"],
    ["left_knee", "left_ankle"],
    ["right_hip", "right_knee"],
    ["right_knee", "right_ankle"]
  ]
}
```

### Collection: `ai_logs`
Stores ML pipeline execution logs, timing, and model metrics.

```json
{
  "video_id": "UUID string",
  "model_name": "MediaPipe Pose + XGBoost Injury Risk v1",
  "inference_time": 1.45,
  "confidence": 0.94,
  "output": {
    "status": "success",
    "frames_processed": 180,
    "anomalies_detected": 2
  }
}
```

---

## 3. Phase 2 Database Tables (Reserved & Out of Scope for Phase 1)

These tables are defined in the complete architecture design and will be wired in Phase 2 when MediaPipe, NumPy biomechanics calculation, and XGBoost injury prediction models are integrated.

### `analysis_results`
Stores calculated biomechanical metrics from video frame analysis.
- `analysis_id` UUID (PK)
- `video_id` UUID (FK -> `videos.video_id`)
- `athlete_id` UUID (FK -> `athletes.athlete_id`)
- `knee_valgus` FLOAT (Angle degree of knee collapsing inward)
- `hip_stability` FLOAT (Pelvic drop / lateral tilt index)
- `trunk_lean` FLOAT (Forward / lateral trunk flexion angle)
- `stride_length` FLOAT (Calculated stride / jump landing width)
- `joint_alignment` FLOAT (Kinematic chain alignment score)
- `symmetry_score` FLOAT (Left vs right limb symmetry percentage)
- `fatigue_score` FLOAT (Movement degradation over time)
- `movement_quality` FLOAT (Overall technique score)
- `overall_risk_score` FLOAT (0-100 risk score)
- `risk_level` VARCHAR (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`)
- `created_at` TIMESTAMP

### `injury_predictions`
Stores ML model prediction breakdowns by specific joint/anatomical zone.
- `prediction_id` UUID (PK)
- `analysis_id` UUID (FK -> `analysis_results.analysis_id`)
- `acl_risk` FLOAT (Probability 0.0 - 1.0)
- `hamstring_risk` FLOAT (Probability 0.0 - 1.0)
- `ankle_risk` FLOAT (Probability 0.0 - 1.0)
- `shoulder_risk` FLOAT (Probability 0.0 - 1.0)
- `lower_back_risk` FLOAT (Probability 0.0 - 1.0)
- `overuse_risk` FLOAT (Probability 0.0 - 1.0)

### `recommendations`
Stores automated preventive exercise and training adjustments based on risk predictions.
- `recommendation_id` UUID (PK)
- `prediction_id` UUID (FK -> `injury_predictions.prediction_id`)
- `exercise` TEXT (Target corrective exercise)
- `mobility` TEXT (Stretching / joint mobility prescription)
- `strengthening` TEXT (Target muscle strengthening regimen)
- `recovery` TEXT (Rest, ice, massage, active recovery advice)
- `training_modification` TEXT (Load management adjustments)

### `notifications`
Stores system alerts sent to coaches, athletes, and physiotherapists.
- `notification_id` UUID (PK)
- `user_id` UUID (FK -> `users.user_id`)
- `title` VARCHAR
- `message` TEXT
- `notification_type` VARCHAR (`RISK_ALERT`, `VIDEO_PROCESSED`, `REPORT_READY`)
- `is_read` BOOLEAN
- `created_at` TIMESTAMP

### `reports`
Stores generated PDF/CSV export records for assessments.
- `report_id` UUID (PK)
- `athlete_id` UUID (FK -> `athletes.athlete_id`)
- `report_type` VARCHAR (`EXECUTIVE_SUMMARY`, `BIOMECHANICAL_DEEP_DIVE`)
- `generated_by` UUID (FK -> `users.user_id`)
- `file_path` TEXT
- `created_at` TIMESTAMP

### `performance_records`
Stores baseline physical assessment benchmark data over time.
- `record_id` UUID (PK)
- `athlete_id` UUID (FK -> `athletes.athlete_id`)
- `activity` VARCHAR
- `score` FLOAT
- `remarks` TEXT
- `recorded_at` TIMESTAMP
