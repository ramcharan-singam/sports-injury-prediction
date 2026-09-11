import cv2
import logging
try:
    from ml.config import MAX_FRAME_DIM
except ImportError:
    from backend.ml.config import MAX_FRAME_DIM

logger = logging.getLogger("ml.video_reader")

class VideoReader:
    def __init__(self, video_path: str):
        self.video_path = video_path
        self.cap = cv2.VideoCapture(video_path)
        if not self.cap.isOpened():
            raise ValueError(f"Unable to open video file: {video_path}")

        self.fps = int(self.cap.get(cv2.CAP_PROP_FPS)) or 30
        self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 100
        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 1920
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 1080

    def read_frames(self, stride: int = 1):
        """Yield frames sequentially with downscaling and stride acceleration."""
        frame_index = 0
        while self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret or frame is None:
                break
            
            if frame_index % stride == 0:
                h, w = frame.shape[:2]
                if max(h, w) > MAX_FRAME_DIM:
                    scale = MAX_FRAME_DIM / float(max(h, w))
                    new_w, new_h = int(w * scale), int(h * scale)
                else:
                    new_w, new_h = w, h

                new_w = new_w - (new_w % 2)
                new_h = new_h - (new_h % 2)

                frame = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

                yield frame_index, frame
            frame_index += 1

        self.cap.release()

    def close(self):
        if self.cap.isOpened():
            self.cap.release()
