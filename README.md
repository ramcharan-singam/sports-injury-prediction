InjurySense is a full-stack athletic biomechanics, movement-screening, and rehabilitation management platform. It processes athlete movement videos, extracts pose landmarks, calculates biomechanical measurements, applies rule-based risk scoring, and provides rehabilitation and workload-management workflows.
Key Features
🎥 Movement & Biomechanical Analysis
- Processes athlete movement videos.
- Extracts body landmarks using RTMPose-S (ONNX Runtime) and MediaPipe Pose.
- Calculates biomechanical measurements such as knee valgus angle, touchdown flexion, swing-speed asymmetry, dorsiflexion range of motion, and posture-compensation drift.
🛡️ Quality Gatekeeper
- Filters low-quality movement clips before risk scoring.
- Uses pose-confidence and measurement-quality thresholds:
  - Average pose confidence ≥ 0.50
  - Measurement/framing ratio ≥ 0.45
📊 Rule-Based Risk Scoring
- Evaluates 17 clinical/biomechanical rules across six categories:
  1. Biomechanical Deviations
  2. Movement Asymmetry
  3. Historical Injury Factors
  4. Training Load Indicators
  5. Fatigue Indicators
  6. Quality Gatekeeper
- Supports sex and recurrence multipliers of 1.4× where applicable.
🩺 Physiotherapist Rehabilitation Management
- Physiotherapists create rehabilitation plans by entering:
  - Exercise name
  - Sets
  - Repetitions
  - Frequency
  - Assigned days
  - Instructions
  - Target clearance date
- The system generates daily RehabSession records from the configured plan.
🏃 Athlete Rehabilitation Tracking
- Athletes can view assigned rehabilitation exercises.
- Athletes can mark daily sessions as completed.
- Progress is calculated from database records:
	ext{Progress \%} =
rac{	ext{Completed Sessions}}
{	ext{Total Assigned Sessions}}
	imes 100📅 Clinical Follow-Ups
- Physiotherapists and administrators can schedule athlete follow-up appointments.
- Athletes can view upcoming clinical visits and reassessments.
🔐 Role-Based Access Control
The platform supports five roles:
- ATHLETE
- PHYSIOTHERAPIST
- COACH
- SPORTS_SCIENTIST
- ADMIN
🎨 Responsive Theme
- Responsive user interface.
- Light and dark theme support.



Prerequisites
Install the following before running the project:
- Python 3.11 or higher
- Node.js 18.0 or higher
- npm 9.0 or higher
- Git
  
1. Backend Setup
Navigate to the backend
cd backend
Create a virtual environment
Windows PowerShell
python -m venv venv
.env\Scripts\Activate.ps1
macOS / Linux
python3 -m venv venv
source venv/bin/activate
Install dependencies
pip install -r requirements.txt
Configure environment variables
Create a .env file inside the backend/ directory:
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./sports_injury_restart.db
Start the FastAPI server
uvicorn app.main:app --reload --port 8000
Backend API:
http://localhost:8000
Swagger API documentation:
http://localhost:8000/docs

2. Frontend Setup
Open a new terminal and navigate to the frontend:
cd frontend
Install dependencies:
npm install
Start the Vite development server:
npm run dev
Frontend:
http://localhost:5173
