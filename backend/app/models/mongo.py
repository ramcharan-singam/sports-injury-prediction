from typing import List, Optional, Any
from pydantic import BaseModel, Field

class Keypoint(BaseModel):
    id: int
    name: str
    x: float
    y: float
    z: Optional[float] = None
    visibility: Optional[float] = None

class FrameData(BaseModel):
    frame_number: int
    timestamp: float
    keypoints: List[Keypoint]

class PoseDataSchema(BaseModel):
    video_id: str
    athlete_id: str
    frames: List[FrameData] = []
    keypoints: List[str] = []
    skeleton: List[List[str]] = []

class AILogSchema(BaseModel):
    video_id: str
    model_name: str
    inference_time: float
    confidence: float
    output: Optional[Any] = None
