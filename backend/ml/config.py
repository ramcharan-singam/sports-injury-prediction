import os

ONNX_BACKEND = "onnxruntime"
POSE_MODE = "lightweight"
POSE_MODEL_NAME = "rtmpose-s"
DET_MODEL_NAME = "yolox-tiny"
MAX_FRAME_DIM = 360
FRAME_STRIDE = 3
MIN_VISIBILITY_THRESHOLD = 0.10
OUTPUT_FPS = 30
DEFAULT_SKEL_COLOR = (0, 255, 0)
JOINTS_COLOR = (255, 165, 0)

# 7 Distinct Movement Activity Types
ACTIVITY_TYPE_MAP = {
    "running_sprinting": {
        "name": "Running / Sprinting",
        "icon": "🏃",
        "focus": "Hamstring Speed Asymmetry & Sprint Workload"
    },
    "squat": {
        "name": "Squat",
        "icon": "🦵",
        "focus": "Deep Knee/Hip Flexion & Lumbar ROM"
    },
    "jump_landing": {
        "name": "Jump Landing",
        "icon": "🏋️",
        "focus": "ACL Knee Valgus & Initial Contact Flexion"
    },
    "cutting_direction_change": {
        "name": "Cutting / Direction Change",
        "icon": "↔️",
        "focus": "Torso Lateral Lean & Valgus Asymmetry"
    },
    "walking_gait": {
        "name": "Walking / Gait Analysis",
        "icon": "🚶",
        "focus": "Center-of-Mass Sway Variance & Gait Symmetry"
    },
    "single_leg_movement": {
        "name": "Single-Leg Movement",
        "icon": "🦶",
        "focus": "Single-Leg Postural Instability Index"
    },
    "lunge": {
        "name": "Lunge / Split Stance",
        "icon": "🏃‍♂️",
        "focus": "Anterior Pelvic Tilt & Bilateral Flexion"
    }
}

# Category Activity Weight Matrix (W_Activity, c)
ACTIVITY_CATEGORY_WEIGHTS = {
    "running_sprinting": {
        "biomechanical_deviations": 0.15,
        "historical_injury_factors": 0.15,
        "movement_asymmetry": 0.20,
        "training_load_indicators": 0.25,
        "fatigue_indicators": 0.25
    },
    "squat": {
        "biomechanical_deviations": 0.45,
        "historical_injury_factors": 0.10,
        "movement_asymmetry": 0.10,
        "training_load_indicators": 0.15,
        "fatigue_indicators": 0.20
    },
    "jump_landing": {
        "biomechanical_deviations": 0.45,
        "historical_injury_factors": 0.15,
        "movement_asymmetry": 0.15,
        "training_load_indicators": 0.15,
        "fatigue_indicators": 0.10
    },
    "cutting_direction_change": {
        "biomechanical_deviations": 0.35,
        "historical_injury_factors": 0.15,
        "movement_asymmetry": 0.30,
        "training_load_indicators": 0.10,
        "fatigue_indicators": 0.10
    },
    "walking_gait": {
        "biomechanical_deviations": 0.15,
        "historical_injury_factors": 0.15,
        "movement_asymmetry": 0.30,
        "training_load_indicators": 0.20,
        "fatigue_indicators": 0.20
    },
    "single_leg_movement": {
        "biomechanical_deviations": 0.25,
        "historical_injury_factors": 0.15,
        "movement_asymmetry": 0.30,
        "training_load_indicators": 0.15,
        "fatigue_indicators": 0.15
    },
    "lunge": {
        "biomechanical_deviations": 0.35,
        "historical_injury_factors": 0.15,
        "movement_asymmetry": 0.20,
        "training_load_indicators": 0.15,
        "fatigue_indicators": 0.15
    }
}

# Landmark-Based Keypoint Visibility Mapping
FEATURE_KEYPOINT_REQUIREMENTS = {
    "acl_valgus_angle": {
        "required_keypoints": ["L_HIP", "L_KNEE", "L_ANKLE", "R_HIP", "R_KNEE", "R_ANKLE"],
        "minimum_visibility": 0.60
    },
    "acl_flexion_initial_contact": {
        "required_keypoints": ["L_HIP", "L_KNEE", "L_ANKLE", "R_HIP", "R_KNEE", "R_ANKLE"],
        "minimum_visibility": 0.50
    },
    "acl_trunk_lean": {
        "required_keypoints": ["L_SHOULDER", "R_SHOULDER", "L_HIP", "R_HIP"],
        "minimum_visibility": 0.50
    },
    "acl_valgus_asymmetry": {
        "required_keypoints": ["L_HIP", "L_KNEE", "L_ANKLE", "R_HIP", "R_KNEE", "R_ANKLE"],
        "minimum_visibility": 0.60
    },
    "hamstring_speed_asymmetry": {
        "required_keypoints": ["L_KNEE", "R_KNEE"],
        "minimum_visibility": 0.50
    },
    "hamstring_pelvic_tilt": {
        "required_keypoints": ["L_HIP", "R_HIP"],
        "minimum_visibility": 0.50
    },
    "ankle_dorsiflexion_rom": {
        "required_keypoints": ["L_KNEE", "L_ANKLE", "R_KNEE", "R_ANKLE"],
        "minimum_visibility": 0.50
    },
    "ankle_sway_variance": {
        "required_keypoints": ["L_ANKLE", "R_ANKLE"],
        "minimum_visibility": 0.40
    },
    "shoulder_gird": {
        "required_keypoints": ["L_SHOULDER", "L_ELBOW", "R_SHOULDER", "R_ELBOW"],
        "minimum_visibility": 0.50
    },
    "shoulder_trom_deficit": {
        "required_keypoints": ["L_SHOULDER", "L_ELBOW", "R_SHOULDER", "R_ELBOW"],
        "minimum_visibility": 0.50
    },
    "shoulder_scapular_dyskinesis": {
        "required_keypoints": ["L_SHOULDER", "R_SHOULDER"],
        "minimum_visibility": 0.50
    },
    "lumbar_flexion_rom": {
        "required_keypoints": ["L_SHOULDER", "R_SHOULDER", "L_HIP", "R_HIP"],
        "minimum_visibility": 0.50
    },
    "lumbar_compensation_drift": {
        "required_keypoints": ["L_HIP", "R_HIP", "L_ANKLE", "R_ANKLE"],
        "minimum_visibility": 0.50
    },
    "workload_quality_decline": {
        "required_keypoints": [],
        "minimum_visibility": 0.00
    }
}

LOWER_BODY_ACTIVITIES = [
    "running_sprinting", "squat", "jump_landing", "cutting_direction_change",
    "walking_gait", "single_leg_movement", "lunge"
]

UPPER_BODY_FEATURES = [
    "shoulder_gird", "shoulder_trom_deficit", "shoulder_scapular_dyskinesis"
]
