# Dedicated ML Feature Extractor & Skeleton Tracking Pipeline Architecture

**Module**: `ml/extractor/` & `backend/ml/extractor/`  
**Integration Status**: 100% Fully Connected (Backend API + Frontend UI)

---

## 1. Tech Stack for Athlete Video Input & Preprocessing

| Technology | Role & Function | Implementation File |
|---|---|---|
| **OpenCV (`opencv-python`)** | Decodes uploaded MP4/AVI/MOV/MKV athlete videos, extracts frame dimensions & FPS, and applies frame downscaling (`MAX_FRAME_DIM = 480`) for $30+\text{ FPS}$ real-time throughput. | [`ml/extractor/video_reader.py`](file:///c:/Users/ramch/PRACTICE/infosys/start/ml/extractor/video_reader.py) |
| **FastAPI 0.115** | Receives multipart video file uploads via `POST /api/videos/upload` and manages video processing lifecycle. | [`backend/app/routers/videos.py`](file:///c:/Users/ramch/PRACTICE/infosys/start/backend/app/routers/videos.py) |

---

## 2. Tech Stack for Athlete Pose & Keypoint Labels

| Technology | Role & Function | Implementation File |
|---|---|---|
| **MediaPipe Pose / Kinematic Engine** | Deep learning pose estimator predicting body keypoints (hips, knees, ankles, feet, shoulders, elbows, wrists, spine). | [`ml/extractor/pose_detector.py`](file:///c:/Users/ramch/PRACTICE/infosys/start/ml/extractor/pose_detector.py) |
| **Landmark Label Mapper** | Calculates anatomical joint angles for each frame (`L_KNEE`, `R_KNEE`, `L_HIP`, `R_HIP`, `L_ELBOW`, `R_ELBOW`, `L_FOOT_FLEXION`, `R_FOOT_FLEXION`, `SPINE_TILT`, `STEP_WIDTH`). | [`ml/extractor/landmark_extractor.py`](file:///c:/Users/ramch/PRACTICE/infosys/start/ml/extractor/landmark_extractor.py) |

---

## 3. Tech Stack for Skeleton View Rendering (Visual Overlay)

| Technology | Role & Function | Implementation File |
|---|---|---|
| **`detector.detect_and_draw()`** | Draws colored limb skeleton lines (green, cyan, amber, rose, yellow) and joint nodes directly on athlete video frames based on keypoints. | [`ml/extractor/pose_detector.py`](file:///c:/Users/ramch/PRACTICE/infosys/start/ml/extractor/pose_detector.py) |
| **OpenCV VideoWriter (`mp4v` / H.264)** | Encodes the skeleton-overlay video frames into a web-native MP4 video file served at `/uploads/skeleton_<video_id>.mp4`. | [`ml/extractor/__init__.py`](file:///c:/Users/ramch/PRACTICE/infosys/start/ml/extractor/__init__.py) |

---

## 4. Tech Stack for Web UI & Video Player

| Technology | Role & Function | Implementation File |
|---|---|---|
| **HTML5 `<video>` Skeleton Player** | Interactive video player (`<video controls autoPlay loop playsinline>`) rendering the live skeleton tracking overlay video in the browser dashboard. | [`VideoResultsPage.jsx`](file:///c:/Users/ramch/PRACTICE/infosys/start/frontend/src/pages/VideoResultsPage.jsx) |
| **Summary Cards** | Renders `Total Video Frames`, `Pose Detected Frames`, `Active Movement Window`, and `Idle Frames Trimmed`. | [`VideoResultsPage.jsx`](file:///c:/Users/ramch/PRACTICE/infosys/start/frontend/src/pages/VideoResultsPage.jsx) |
| **Extracted Metrics Preview Table** | Scrollable table displaying frame-by-frame joint angles (Frame, L. Knee (°), R. Knee (°), L. Hip (°), R. Hip (°), L. Elbow (°), R. Elbow (°), L. Foot Flexion (°), R. Foot Flexion (°), Spine Tilt (°), Step Width (cm)). | [`VideoResultsPage.jsx`](file:///c:/Users/ramch/PRACTICE/infosys/start/frontend/src/pages/VideoResultsPage.jsx) |
