# -*- coding: utf-8 -*-
import os
import cv2
import json
import math
import logging
import imageio
import numpy as np

try:
    from ml.config import FRAME_STRIDE
    from ml.extractor.video_reader import VideoReader
    from ml.extractor.pose_detector import PoseDetector
    from ml.extractor.landmark_extractor import extract_frame_metrics
    from ml.scoring_engine import evaluate_evidence_score
except ImportError:
    from backend.ml.config import FRAME_STRIDE
    from backend.ml.extractor.video_reader import VideoReader
    from backend.ml.extractor.pose_detector import PoseDetector
    from backend.ml.extractor.landmark_extractor import extract_frame_metrics
    from backend.ml.scoring_engine import evaluate_evidence_score

logger = logging.getLogger("ml.extractor")

def process_video_pose_extractor(video_path: str, output_skeleton_path: str, athlete_profile: dict = None, activity: str = "jump_landing"):
    """
    Main High-Speed Pose Extraction & Clinical Rule-Based Prediction Pipeline.
    1. Reads & downscales input video frames in VideoReader.
    2. Runs rtmlib.draw_skeleton() in PoseDetector for limb lines & joint node dots.
    3. Encodes web-native H.264 MP4 using imageio-ffmpeg.
    4. Evaluates Video Quality Gatekeeper & Evidence-Based Rule Categories.
    5. Returns 0-100 Screening Score and Low / Moderate / High tier classification.
    """
    reader = VideoReader(video_path)
    detector = PoseDetector()

    os.makedirs(os.path.dirname(output_skeleton_path), exist_ok=True)

    out_writer = None
    frame_metrics_list = []
    pose_detected_count = 0
    target_fps = max(15, int(reader.fps // FRAME_STRIDE))

    prev_kpts = None
    prev_met = None
    for frame_index, frame in reader.read_frames(stride=FRAME_STRIDE):
        annotated_frame, keypoints = detector.detect_and_draw(frame, frame_index, reader.total_frames)
        
        rgb_frame = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)

        fh, fw = rgb_frame.shape[:2]
        if fh % 2 != 0 or fw % 2 != 0:
            even_w = fw - (fw % 2)
            even_h = fh - (fh % 2)
            rgb_frame = cv2.resize(rgb_frame, (even_w, even_h), interpolation=cv2.INTER_AREA)

        if out_writer is None:
            out_writer = imageio.get_writer(
                output_skeleton_path,
                fps=target_fps,
                codec='libx264',
                pixelformat='yuv420p',
                macro_block_size=1,
                ffmpeg_params=['-preset', 'ultrafast']
            )

        out_writer.append_data(rgb_frame)

        if keypoints:
            pose_detected_count += 1
            actual_video_frame = frame_index + 1
            metrics = extract_frame_metrics(keypoints, actual_video_frame, prev_keypoints=prev_kpts, prev_metrics=prev_met)
            frame_metrics_list.append(metrics)
            prev_kpts = keypoints
            prev_met = metrics

    if out_writer is not None:
        out_writer.close()
    reader.close()

    total_f = reader.total_frames or (len(frame_metrics_list) * FRAME_STRIDE)
    pose_f = len(frame_metrics_list)
    
    # Accurate idle frame count accounting for stride
    total_sampled = max(1, math.ceil(total_f / FRAME_STRIDE))
    unreadable_sampled = max(0, total_sampled - pose_f)
    idle_f = unreadable_sampled * FRAME_STRIDE

    first_frame_num = frame_metrics_list[0]["frame"] if frame_metrics_list else 1
    last_frame_num = frame_metrics_list[-1]["frame"] if frame_metrics_list else total_f

    # --- AGGREGATE KINEMATIC FEATURES ACROSS FRAMES ---
    if frame_metrics_list:
        pose_conf = float(np.mean([m.get("pose_confidence", 0.88) for m in frame_metrics_list]))
        meas_rel = float(np.mean([m.get("measurement_reliability", 0.84) for m in frame_metrics_list]))
        
        acl_valgus = float(np.max([m.get("acl_valgus_angle", 0.0) for m in frame_metrics_list]))
        acl_flexion_ic = float(np.min([m.get("acl_flexion_initial_contact", 180.0) for m in frame_metrics_list]))
        acl_trunk_lean = float(np.max([m.get("acl_trunk_lean", 0.0) for m in frame_metrics_list]))
        acl_valgus_asym = float(np.max([m.get("acl_valgus_asymmetry", 0.0) for m in frame_metrics_list]))

        ham_speed_asym = float(np.max([m.get("hamstring_speed_asymmetry", 0.0) for m in frame_metrics_list]))
        ham_pelvic_tilt = float(np.max([m.get("hamstring_pelvic_tilt", 0.0) for m in frame_metrics_list]))

        ank_dorsiflexion = float(np.min([m.get("ankle_dorsiflexion_rom", 45.0) for m in frame_metrics_list]))
        ank_sway = float(np.mean([m.get("ankle_sway_variance", 0.0) for m in frame_metrics_list]))

        sh_gird = float(np.max([m.get("shoulder_gird", 0.0) for m in frame_metrics_list]))
        sh_trom = float(np.max([m.get("shoulder_trom_deficit", 0.0) for m in frame_metrics_list]))
        sh_dyskinesis = float(np.max([m.get("shoulder_scapular_dyskinesis", 0.0) for m in frame_metrics_list]))

        lum_flexion = float(np.max([m.get("lumbar_flexion_rom", 0.0) for m in frame_metrics_list]))
        lum_drift = float(np.max([m.get("lumbar_compensation_drift", 0.0) for m in frame_metrics_list]))
        work_decline = float(np.max([m.get("workload_quality_decline", 0.0) for m in frame_metrics_list]))
    else:
        pose_conf = 0.50
        meas_rel = 0.50
        acl_valgus = 0.0
        acl_flexion_ic = 180.0
        acl_trunk_lean = 0.0
        acl_valgus_asym = 0.0
        ham_speed_asym = 0.0
        ham_pelvic_tilt = 0.0
        ank_dorsiflexion = 45.0
        ank_sway = 0.0
        sh_gird = 0.0
        sh_trom = 0.0
        sh_dyskinesis = 0.0
        lum_flexion = 0.0
        lum_drift = 0.0
        work_decline = 0.0

    # Parse profile historical flags
    prof = athlete_profile or {}
    sex = prof.get("gender", prof.get("sex", "female"))
    prev_injuries = str(prof.get("previous_injuries_summary", "")).lower()
    acwr_val = float(prof.get("acwr", prof.get("training_frequency", 1.0)))

    acl_prior = 1.0 if "acl" in prev_injuries else 0.0
    ham_prior = 1.0 if "hamstring" in prev_injuries else 0.0
    ank_prior = 1.0 if "ankle" in prev_injuries or "sprain" in prev_injuries else 0.0
    lum_prior = 1.0 if "lumbar" in prev_injuries or "back" in prev_injuries else 0.0
    workload_acwr_elevated = 1.0 if acwr_val >= 1.5 else 0.0

    feature_payload = {
        "pose_confidence": pose_conf,
        "measurement_reliability": meas_rel,

        "acl_valgus_angle": acl_valgus,
        "acl_flexion_initial_contact": acl_flexion_ic,
        "acl_trunk_lean": acl_trunk_lean,
        "acl_valgus_asymmetry": acl_valgus_asym,
        "acl_prior_injury": acl_prior,

        "hamstring_speed_asymmetry": ham_speed_asym,
        "hamstring_pelvic_tilt": ham_pelvic_tilt,
        "hamstring_prior_injury": ham_prior,

        "ankle_dorsiflexion_rom": ank_dorsiflexion,
        "ankle_sway_variance": ank_sway,
        "ankle_prior_injury": ank_prior,

        "shoulder_gird": sh_gird,
        "shoulder_trom_deficit": sh_trom,
        "shoulder_scapular_dyskinesis": sh_dyskinesis,

        "lumbar_flexion_rom": lum_flexion,
        "lumbar_compensation_drift": lum_drift,
        "lumbar_prior_injury": lum_prior,

        "workload_acwr_elevated": workload_acwr_elevated,
        "workload_quality_decline": work_decline
    }

    # RUN CLINICAL RULE ENGINE EVALUATION
    scoring_result = evaluate_evidence_score(feature_payload, sex=sex, activity=activity)

    summary = {
        "total_video_frames": total_f,
        "pose_detected_frames": pose_f,
        "active_movement_window": f"F{first_frame_num} - F{last_frame_num}",
        "idle_frames_trimmed": idle_f,
        "quality_gatekeeper": {
            "passed": scoring_result["gatekeeper_passed"],
            "message": scoring_result["gatekeeper_message"],
            "pose_confidence": pose_conf,
            "measurement_reliability": meas_rel
        },
        "evidence_based_scoring": {
            "screening_score": scoring_result["screening_score"],
            "classification": scoring_result["classification"],
            "urgency_level": scoring_result["urgency_level"],
            "bucket_scores": scoring_result["bucket_scores"],
            "triggered_rules": scoring_result["triggered_rules"],
            "recommendations": scoring_result["recommendations"]
        },
        "metrics_preview": frame_metrics_list
    }

    metrics_json_path = output_skeleton_path.replace(".mp4", "_metrics.json")
    try:
        with open(metrics_json_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2)
        logger.info(f"Saved extracted metrics JSON to {metrics_json_path}")
    except Exception as e:
        logger.error(f"Failed to write metrics JSON {metrics_json_path}: {e}")

    logger.info(f"Clinical Rule Extractor completed: {total_f} frames, Score={scoring_result['screening_score']}, Classification={scoring_result['classification']}")
    return summary
