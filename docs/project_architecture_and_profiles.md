# Architecture & User Profile Specification: Sports Injury Risk Detection Platform

This document presents a competitive comparative analysis against leading industry platforms (Kitman Labs, Zone7, Sparta Science) and specifies the exact user profile designs, role responsibilities, and database schema mappings for our platform (**KINEMA AI**).

---

## 1. Competitive Comparative Analysis

| Feature / Dimension | Kitman Labs (EHR) | Zone7 (AI Risk Engine) | Sparta Science (Force Plate) | **OUR PLATFORM (KINEMA AI)** |
|---|---|---|---|---|
| **Primary Data Source** | EMR logs & Wearables | GPS / Micro-sensor loads | Ground reaction force plates | **Athlete Video Movement Clips (2D/3D Pose)** |
| **Biomechanics Extraction** | Manual entry | Algorithmic load index | Kinetic jump force curves | **OpenCV + MediaPipe Pose Landmark Extraction** |
| **Predictive Modeling** | Statistical regression | Machine Learning (Ensemble) | Machine Learning | **XGBoost Joint Risk Prediction Engine** |
| **Relational Database** | PostgreSQL | PostgreSQL / DynamoDB | PostgreSQL | **PostgreSQL (Strict finalized 4-table schema)** |
| **Pose & Kinetic Storage** | Time-series DB | MongoDB / Cloud Storage | Proprietary binary format | **MongoDB (`pose_data` & `ai_logs` collections)** |
| **Target User Roles** | Medical & Performance | Performance & Coaches | Strength & Conditioning | **Athlete, Coach, Physiotherapist, Sports Scientist, Admin** |

---

## 2. Platform User Profiles & Role Responsibilities

Our platform enforces strict role-based access control (RBAC) across 5 primary user roles. Below is the functional design and required necessities for each role in our system:

### 1. `Athlete` Profile
- **Core Purpose**: Self-monitoring of physical condition, logging recovery, and uploading movement assessment videos.
- **Required Necessities**:
  - **Demographics**: `sport`, `position`, `age`, `height`, `weight`.
  - **Biomechanical Metrics**: Self-rated or tested scores for `flexibility`, `strength`, `balance`, `endurance` (0-100).
  - **Training Load**: Weekly `training_load` volume score.
  - **Injury History**: View active and historical injury records.
  - **Video Upload**: Portal to submit assessment videos (Squat, Drop Jump, Lunge, Sprint, Cutting Movement).

### 2. `Coach` Profile
- **Core Purpose**: Team roster oversight, training load balancing, and performance readiness.
- **Required Necessities**:
  - **Roster Directory**: Select and review any athlete's physical profile.
  - **Training Load & Readiness**: Monitor high training loads to prevent acute-to-chronic workload spikes.
  - **Assessment Notes**: Write and update `coach_notes` on movement technique and fixture load management.
  - **Video Review**: Inspect uploaded assessment clips and processing statuses (`QUEUED`, `COMPLETED`).

### 3. `Physiotherapist` Profile
- **Core Purpose**: Clinical injury management, rehabilitation protocols, and movement safety clearance.
- **Required Necessities**:
  - **Clinical Injury CRUD**: Add and update `injury_history` records (`injury_type`, `body_part`, `severity`, `injury_date`, `recovery_date`, `remarks`).
  - **Rehab Status Tracking**: Monitor recovery timelines and return-to-play clearance notes.
  - **Movement Assessment Review**: Inspect video clips for high-risk movement compensation patterns.

### 4. `Sports Scientist` Profile
- **Core Purpose**: Biomechanical research, kinematic metrics analysis, and AI model oversight.
- **Required Necessities**:
  - **Capability Ratings**: Analyze multi-dimensional biomechanical ratings (`flexibility`, `strength`, `balance`, `endurance`).
  - **Video Quality Inspection**: Review video parameters (`fps`, `duration`, `resolution`, `quality_score`).
  - **Phase 2 Readiness**: Access pose keypoint arrays (`pose_data`) and inference logs (`ai_logs`).

### 5. `Admin` Profile
- **Core Purpose**: System administration, user access management, and database integrity.
- **Required Necessities**:
  - **System Health**: Monitor API health (`/api/health`) and static video storage `/uploads`.
  - **Directory Oversight**: Access all `users`, `athletes`, `injury_history`, and `videos` table entries.

---

## 3. Database Schema Mapping & Phase Integration

### Phase 1 Implemented Schema (Relational PostgreSQL)

```
+-----------------------------------------------------------------------------------+
| USERS                                                                             |
| user_id (PK UUID) | name | email (Unique) | password | role (ENUM) | phone | created_at |
+-----------------------------------------------------------------------------------+
                                         | (1:1)
                                         v
+-----------------------------------------------------------------------------------+
| ATHLETES                                                                          |
| athlete_id (PK UUID) | user_id (FK) | sport | position | age | height | weight    |
| training_load | flexibility | strength | balance | endurance | coach_notes         |
+-----------------------------------------------------------------------------------+
                   | (1:N)                                     | (1:N)
                   v                                           v
+------------------------------------+   +------------------------------------------+
| INJURY_HISTORY                     |   | VIDEOS                                   |
| injury_id (PK UUID) | athlete_id   |   | video_id (PK UUID) | athlete_id (FK)     |
| injury_type | body_part | severity |   | activity | video_url | duration | fps    |
| injury_date | recovery_date |      |   | resolution | quality_score | status   |
| remarks                            |   | uploaded_at                              |
+------------------------------------+   +------------------------------------------+
```

### Phase 2 Extension Points (Document MongoDB & Reserved Tables)
- **MongoDB `pose_data`**: Stores frame-by-frame 2D/3D joint coordinates extracted via MediaPipe.
- **MongoDB `ai_logs`**: Stores inference execution timing, model versioning, and confidence metrics.
- **Isolated Service Stub (`services/video_processor.py`)**: Entry point called by video upload route, currently setting status to `COMPLETED`, ready for MediaPipe $\rightarrow$ NumPy $\rightarrow$ XGBoost pipeline injection.
