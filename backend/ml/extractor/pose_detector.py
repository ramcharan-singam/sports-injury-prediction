import cv2
import logging
import numpy as np
from ml.config import ONNX_BACKEND, POSE_MODE, POSE_MODEL_NAME, DET_MODEL_NAME

logger = logging.getLogger("ml.pose_detector")

class PoseDetector:
    def __init__(self, mode=POSE_MODE, device='cpu'):
        """
        Uses ONNX Runtime backend running quantized high-performance
        rtmpose-s (pose estimation) and yolox-tiny (person detector) models via rtmlib.
        """
        self.device = device
        self.mode_name = mode
        self.rtmlib_model = None
        
        try:
            import rtmlib
            self.rtmlib_model = rtmlib.Body(
                mode=mode,
                to_openpose=False,
                backend=ONNX_BACKEND,
                device=device
            )
            logger.info(f"Successfully initialized rtmlib {POSE_MODEL_NAME} & {DET_MODEL_NAME} on {ONNX_BACKEND} ({device})")
        except Exception as e:
            logger.warning(f"Could not initialize rtmlib lightweight ONNX model ({e}).")

    def detect_and_draw(self, frame, frame_index, total_frames):
        """
        Runs ONNX Runtime rtmpose-s & yolox-tiny model inference on athlete video frame,
        draws skeleton using rtmlib.draw_skeleton(), and extracts keypoint matrix.
        """
        if frame is None:
            return frame, {}

        keypoints_dict = {}
        annotated_frame = frame.copy()

        if self.rtmlib_model is not None:
            try:
                import rtmlib
                keypoints, scores = self.rtmlib_model(frame)

                if len(keypoints) > 0 and len(scores) > 0:
                    # Draw official rtmpose-s skeleton overlay using rtmlib.draw_skeleton
                    annotated_frame = rtmlib.draw_skeleton(annotated_frame, keypoints, scores, kpt_thr=0.25)

                    kpts = keypoints[0]
                    scs = scores[0]

                    def add_kpt(idx, name):
                        if idx < len(kpts) and idx < len(scs) and scs[idx] > 0.05:
                            keypoints_dict[name] = (float(kpts[idx][0]), float(kpts[idx][1]), float(scs[idx]))

                    add_kpt(0, "NOSE")
                    add_kpt(5, "L_SHOULDER")
                    add_kpt(6, "R_SHOULDER")
                    add_kpt(7, "L_ELBOW")
                    add_kpt(8, "R_ELBOW")
                    add_kpt(9, "L_WRIST")
                    add_kpt(10, "R_WRIST")
                    add_kpt(11, "L_HIP")
                    add_kpt(12, "R_HIP")
                    add_kpt(13, "L_KNEE")
                    add_kpt(14, "R_KNEE")
                    add_kpt(15, "L_ANKLE")
                    add_kpt(16, "R_ANKLE")

                    if "L_SHOULDER" in keypoints_dict and "R_SHOULDER" in keypoints_dict:
                        l_s = keypoints_dict["L_SHOULDER"]
                        r_s = keypoints_dict["R_SHOULDER"]
                        neck_conf = (l_s[2] + r_s[2]) / 2.0
                        keypoints_dict["NECK"] = (
                            (l_s[0] + r_s[0]) / 2.0,
                            (l_s[1] + r_s[1]) / 2.0,
                            neck_conf
                        )

                    return annotated_frame, keypoints_dict
            except Exception as ex:
                logger.error(f"rtmlib ONNX inference error on frame {frame_index}: {ex}")

        return annotated_frame, keypoints_dict
