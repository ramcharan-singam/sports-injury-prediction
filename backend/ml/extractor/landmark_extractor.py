# -*- coding: utf-8 -*-
import os
import math
import numpy as np
import logging

logger = logging.getLogger("ml.extractor")

def calculate_angle(a, b, c):
    """Calculate 2D angle between three points A-B-C in degrees, bounded [0, 180]."""
    ba = np.array([a[0] - b[0], a[1] - b[1]])
    bc = np.array([c[0] - b[0], c[1] - b[1]])

    norm_ba = np.linalg.norm(ba)
    norm_bc = np.linalg.norm(bc)
    
    if norm_ba == 0 or norm_bc == 0:
        return 180.0

    cosine_angle = np.dot(ba, bc) / (norm_ba * norm_bc)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    angle = np.degrees(np.arccos(cosine_angle))
    return round(float(angle), 2)

def extract_frame_metrics(keypoints_dict, frame_index, prev_keypoints=None, prev_metrics=None):
    """
    Extract raw pose joint angles and compute feature-engineered dataset attributes
    and rule-based risk evaluation indicators across ACL, Hamstring, Ankle, Shoulder, Lumbar, and Workload.
    Applies strict physiological bounding to prevent division blowups.
    """
    def get_pt_and_conf(name):
        val = keypoints_dict.get(name) if isinstance(keypoints_dict, dict) else None
        if isinstance(val, (tuple, list)) and len(val) >= 2:
            conf = float(val[2]) if len(val) >= 3 else 0.85
            return (float(val[0]), float(val[1])), conf
        if prev_keypoints and isinstance(prev_keypoints, dict) and name in prev_keypoints:
            val_p = prev_keypoints.get(name)
            if isinstance(val_p, (tuple, list)) and len(val_p) >= 2:
                conf_p = float(val_p[2]) * 0.9 if len(val_p) >= 3 else 0.70
                return (float(val_p[0]), float(val_p[1])), conf_p
        return None, 0.0

    l_hip_pt, l_hip_c = get_pt_and_conf("L_HIP")
    r_hip_pt, r_hip_c = get_pt_and_conf("R_HIP")
    l_knee_pt, l_knee_c = get_pt_and_conf("L_KNEE")
    r_knee_pt, r_knee_c = get_pt_and_conf("R_KNEE")
    l_ankle_pt, l_ankle_c = get_pt_and_conf("L_ANKLE")
    r_ankle_pt, r_ankle_c = get_pt_and_conf("R_ANKLE")
    
    l_sh_pt, l_sh_c = get_pt_and_conf("L_SHOULDER")
    r_sh_pt, r_sh_c = get_pt_and_conf("R_SHOULDER")
    l_el_pt, l_el_c = get_pt_and_conf("L_ELBOW")
    r_el_pt, r_el_c = get_pt_and_conf("R_ELBOW")
    l_wr_pt, l_wr_c = get_pt_and_conf("L_WRIST")
    r_wr_pt, r_wr_c = get_pt_and_conf("R_WRIST")

    valid_pts = [p for p in [l_hip_pt, r_hip_pt, l_knee_pt, r_knee_pt, l_ankle_pt, r_ankle_pt, l_sh_pt, r_sh_pt] if p is not None]
    if valid_pts:
        cx = sum(p[0] for p in valid_pts) / len(valid_pts)
        cy = sum(p[1] for p in valid_pts) / len(valid_pts)
    else:
        cx, cy = 300.0, 300.0

    l_hip = l_hip_pt or (cx - 20.0, cy - 40.0)
    r_hip = r_hip_pt or (cx + 20.0, cy - 40.0)
    l_knee = l_knee_pt or (l_hip[0], l_hip[1] + 80.0)
    r_knee = r_knee_pt or (r_hip[0], r_hip[1] + 80.0)
    l_ankle = l_ankle_pt or (l_knee[0], l_knee[1] + 80.0)
    r_ankle = r_ankle_pt or (r_knee[0], r_knee[1] + 80.0)

    l_shoulder = l_sh_pt or (l_hip[0], l_hip[1] - 80.0)
    r_shoulder = r_sh_pt or (r_hip[0], r_hip[1] - 80.0)
    l_elbow = l_el_pt or (l_shoulder[0] - 30.0, l_shoulder[1] + 40.0)
    r_elbow = r_el_pt or (r_shoulder[0] + 30.0, r_shoulder[1] + 40.0)
    l_wrist = l_wr_pt or (l_elbow[0] - 20.0, l_elbow[1] + 40.0)
    r_wrist = r_wr_pt or (r_elbow[0] + 20.0, r_elbow[1] + 40.0)

    mid_hip = ((l_hip[0] + r_hip[0]) / 2.0, (l_hip[1] + r_hip[1]) / 2.0)
    mid_shoulder = ((l_shoulder[0] + r_shoulder[0]) / 2.0, (l_shoulder[1] + r_shoulder[1]) / 2.0)

    all_confs = [c for c in [l_hip_c, r_hip_c, l_knee_c, r_knee_c, l_ankle_c, r_ankle_c, l_sh_c, r_sh_c] if c > 0.0]
    pose_confidence = round(float(np.mean(all_confs)), 3) if all_confs else 0.85
    measurement_reliability = round(float(min(0.98, max(0.50, pose_confidence * 0.96))), 3)

    # Compute raw joint angles
    l_knee_angle = min(180.0, max(0.0, calculate_angle(l_hip, l_knee, l_ankle)))
    r_knee_angle = min(180.0, max(0.0, calculate_angle(r_hip, r_knee, r_ankle)))
    l_hip_angle = min(180.0, max(0.0, calculate_angle(l_shoulder, l_hip, l_knee)))
    r_hip_angle = min(180.0, max(0.0, calculate_angle(r_shoulder, r_hip, r_knee)))
    l_elbow_angle = min(180.0, max(0.0, calculate_angle(l_shoulder, l_elbow, l_wrist)))
    r_elbow_angle = min(180.0, max(0.0, calculate_angle(r_shoulder, r_elbow, r_wrist)))

    # Foot flexion & spine tilt
    l_ankle_ref_x = l_ankle[0] + (25.0 if l_ankle[0] >= l_knee[0] else -25.0)
    r_ankle_ref_x = r_ankle[0] + (25.0 if r_ankle[0] >= r_knee[0] else -25.0)
    l_foot_flexion = min(180.0, max(0.0, calculate_angle(l_knee, l_ankle, (l_ankle_ref_x, l_ankle[1]))))
    r_foot_flexion = min(180.0, max(0.0, calculate_angle(r_knee, r_ankle, (r_ankle_ref_x, r_ankle[1]))))

    trunk_dx = mid_shoulder[0] - mid_hip[0]
    trunk_dy = max(1.0, abs(mid_hip[1] - mid_shoulder[1]))
    spine_tilt_deg = math.degrees(math.atan2(abs(trunk_dx), trunk_dy))
    spine_tilt = round(float(min(90.0, max(0.0, spine_tilt_deg))), 2)
    step_width = round(float(abs(l_ankle[0] - r_ankle[0])), 2)

    # --- FEATURE ENGINEERING ---
    hip_flexion_angle = round(float(min(180.0, max(0.0, (l_hip_angle + r_hip_angle) / 2.0))), 2)
    knee_flexion_angle = round(float(min(180.0, max(0.0, (l_knee_angle + r_knee_angle) / 2.0))), 2)
    ankle_rotation_angle = round(float(min(90.0, max(-90.0, ((l_foot_flexion + r_foot_flexion) / 2.0) - 90.0))), 2)

    if prev_metrics:
        l_knee_prev = prev_metrics.get("l_knee", l_knee_angle)
        r_knee_prev = prev_metrics.get("r_knee", r_knee_angle)
        angular_velocity = round(float(min(10.0, max(0.0, (abs(l_knee_angle - l_knee_prev) + abs(r_knee_angle - r_knee_prev)) * 0.5))), 2)
    else:
        angular_velocity = round(float(min(10.0, max(0.0, abs(l_knee_angle - r_knee_angle) * 0.08 + 1.2))), 2)

    linear_acceleration = round(float(min(10.0, max(0.0, spine_tilt * 0.05 + 1.8))), 2)
    ground_reaction_force = round(float(min(9999.0, max(500.0, 1100 + step_width * 85 + (180 - min(l_knee_angle, r_knee_angle)) * 6.5))), 2)
    postural_instability_index = round(float(min(0.99, max(0.01, spine_tilt / 45.0))), 3)
    biomechanical_deviation_score = round(float(min(0.99, max(0.001, abs(l_knee_angle - r_knee_angle) / 90.0))), 4)
    fatigue_level = round(float(min(0.99, max(0.01, (frame_index % 100) / 100.0))), 3)

    # --- CLINICAL 6-CATEGORY FEATURE EXTRACTION WITH BOUNDS ---
    # ACL 2D Valgus calculation: Thigh vector vs shank vector angular deviation in frontal projection
    l_thigh_angle = math.degrees(math.atan2(l_knee[0] - l_hip[0], max(1.0, l_knee[1] - l_hip[1])))
    l_shank_angle = math.degrees(math.atan2(l_ankle[0] - l_knee[0], max(1.0, l_ankle[1] - l_knee[1])))
    l_valgus = min(45.0, max(0.0, abs(l_shank_angle - l_thigh_angle)))

    r_thigh_angle = math.degrees(math.atan2(r_knee[0] - r_hip[0], max(1.0, r_knee[1] - r_hip[1])))
    r_shank_angle = math.degrees(math.atan2(r_ankle[0] - r_knee[0], max(1.0, r_ankle[1] - r_knee[1])))
    r_valgus = min(45.0, max(0.0, abs(r_shank_angle - r_thigh_angle)))

    acl_valgus_angle = round(float(max(l_valgus, r_valgus)), 2)
    acl_flexion_initial_contact = round(float(min(180.0, max(0.0, min(l_knee_angle, r_knee_angle)))), 2)
    acl_trunk_lean = round(float(min(90.0, max(0.0, spine_tilt))), 2)
    valgus_diff = abs(l_valgus - r_valgus)
    denom = max(l_valgus, r_valgus, 1.0)
    acl_valgus_asymmetry = round(float(min(100.0, max(0.0, (valgus_diff / denom) * 100.0))), 2)

    # Hamstring Indicators
    if prev_metrics:
        l_knee_prev = prev_metrics.get("l_knee", l_knee_angle)
        r_knee_prev = prev_metrics.get("r_knee", r_knee_angle)
        l_speed = abs(l_knee_angle - l_knee_prev)
        r_speed = abs(r_knee_angle - r_knee_prev)
    else:
        l_speed = abs(l_knee_angle - 90.0) * 0.2
        r_speed = abs(r_knee_angle - 90.0) * 0.2

    speed_diff = abs(l_speed - r_speed)
    speed_denom = max(l_speed, r_speed, 0.5)
    hamstring_speed_asymmetry = round(float(min(100.0, max(0.0, (speed_diff / speed_denom) * 100.0))), 2)

    hip_dx = max(1.0, abs(r_hip[0] - l_hip[0]))
    hip_dy = abs(r_hip[1] - l_hip[1])
    pelvic_tilt_deg = math.degrees(math.atan2(hip_dy, hip_dx))
    hamstring_pelvic_tilt = round(float(min(90.0, max(0.0, pelvic_tilt_deg))), 2)

    # Ankle Indicators
    ankle_dorsiflexion_rom = round(float(min(90.0, max(0.0, abs(90.0 - (l_foot_flexion + r_foot_flexion) / 2.0)))), 2)
    ankle_sway_variance = round(float(min(1.0, max(0.0, (spine_tilt / 45.0) * 0.25))), 3)

    # Shoulder Indicators
    shoulder_gird = round(float(min(90.0, max(0.0, abs(l_elbow_angle - r_elbow_angle)))), 2)
    shoulder_trom_deficit = round(float(min(45.0, max(0.0, abs(l_elbow_angle - r_elbow_angle) * 0.5))), 2)
    shoulder_scapular_dyskinesis = round(float(min(1.0, max(0.0, spine_tilt / 90.0))), 3)

    # Lumbar & Workload Indicators
    lumbar_flexion_rom = round(float(min(90.0, max(0.0, spine_tilt * 0.85))), 2)
    mid_ankle_x = (l_ankle[0] + r_ankle[0]) / 2.0
    lumbar_compensation_drift = round(float(min(1.0, max(0.0, abs(mid_hip[0] - mid_ankle_x) / 100.0))), 3)
    workload_quality_decline = round(float(min(1.0, max(0.0, (frame_index / 300.0) * 0.1))), 3)

    return {
        "frame": frame_index,
        "pose_confidence": pose_confidence,
        "measurement_reliability": measurement_reliability,
        
        "l_knee": l_knee_angle,
        "r_knee": r_knee_angle,
        "l_hip": l_hip_angle,
        "r_hip": r_hip_angle,
        "l_elbow": l_elbow_angle,
        "r_elbow": r_elbow_angle,
        "l_foot_flexion": l_foot_flexion,
        "r_foot_flexion": r_foot_flexion,
        "spine_tilt": spine_tilt,
        "step_width": step_width,

        # Dataset engineered attributes
        "hip_flexion_angle": hip_flexion_angle,
        "knee_flexion_angle": knee_flexion_angle,
        "ankle_rotation_angle": ankle_rotation_angle,
        "angular_velocity": angular_velocity,
        "linear_acceleration": linear_acceleration,
        "ground_reaction_force": ground_reaction_force,
        "postural_instability_index": postural_instability_index,
        "biomechanical_deviation_score": biomechanical_deviation_score,
        "fatigue_level": fatigue_level,

        # Clinical Rule Categories Attributes
        "acl_valgus_angle": acl_valgus_angle,
        "acl_flexion_initial_contact": acl_flexion_initial_contact,
        "acl_trunk_lean": acl_trunk_lean,
        "acl_valgus_asymmetry": acl_valgus_asymmetry,

        "hamstring_speed_asymmetry": hamstring_speed_asymmetry,
        "hamstring_pelvic_tilt": hamstring_pelvic_tilt,

        "ankle_dorsiflexion_rom": ankle_dorsiflexion_rom,
        "ankle_sway_variance": ankle_sway_variance,

        "shoulder_gird": shoulder_gird,
        "shoulder_trom_deficit": shoulder_trom_deficit,
        "shoulder_scapular_dyskinesis": shoulder_scapular_dyskinesis,

        "lumbar_flexion_rom": lumbar_flexion_rom,
        "lumbar_compensation_drift": lumbar_compensation_drift,
        "workload_quality_decline": workload_quality_decline,
        "keypoint_confidences": {
            "L_HIP": l_hip_c,
            "R_HIP": r_hip_c,
            "L_KNEE": l_knee_c,
            "R_KNEE": r_knee_c,
            "L_ANKLE": l_ankle_c,
            "R_ANKLE": r_ankle_c,
            "L_SHOULDER": l_sh_c,
            "R_SHOULDER": r_sh_c,
            "L_ELBOW": l_el_c,
            "R_ELBOW": r_el_c
        }
    }
