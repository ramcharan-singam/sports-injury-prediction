# -*- coding: utf-8 -*-
import pytest
from ml.scoring_engine import evaluate_evidence_score, normalize_activity_key
from ml.config import ACTIVITY_CATEGORY_WEIGHTS, ACTIVITY_TYPE_MAP

def test_normalize_activity_key():
    assert normalize_activity_key("Jump Landing") == "jump_landing"
    assert normalize_activity_key("Running / Sprinting") == "running_sprinting"
    assert normalize_activity_key("Squat") == "squat"
    assert normalize_activity_key("Cutting / Direction Change") == "cutting_direction_change"
    assert normalize_activity_key("Walking / Gait Analysis") == "walking_gait"
    assert normalize_activity_key("Single-Leg Movement") == "single_leg_movement"
    assert normalize_activity_key("Lunge / Split Stance") == "lunge"

def test_activity_category_weights_normalization():
    # Squat activity has Bio 45% weight
    squat_features = {
        "pose_confidence": 0.88,
        "measurement_reliability": 0.85,
        "acl_valgus_angle": 10.0, # triggers valgus rule
        "lumbar_flexion_rom": 40.0
    }
    res = evaluate_evidence_score(squat_features, sex="female", activity="squat")
    assert res["gatekeeper_passed"] is True
    assert res["activity_criteria_summary"]["activity_type"] == "squat"
    assert res["activity_criteria_summary"]["category_weights"]["biomechanical_deviations"] == 0.45

def test_3tier_status_model_lower_body_not_applicable():
    # Upper-body metrics (e.g. shoulder_gird) on lower-body activities should be 'Not Applicable'
    squat_features = {
        "pose_confidence": 0.88,
        "measurement_reliability": 0.85,
        "shoulder_gird": 20.0
    }
    res = evaluate_evidence_score(squat_features, sex="female", activity="squat")
    statuses = res["activity_criteria_summary"]["feature_statuses"]
    assert statuses["shoulder_gird"] == "Not Applicable"
    assert statuses["shoulder_scapular_dyskinesis"] == "Not Applicable"

def test_landmark_visibility_occlusion_tagging():
    # Keypoint visibility low for knee/ankle -> Not-Assessable (Occluded)
    features = {
        "pose_confidence": 0.88,
        "measurement_reliability": 0.85,
        "keypoint_confidences": {
            "L_ANKLE": 0.20, # below min 0.60
            "R_ANKLE": 0.20
        }
    }
    res = evaluate_evidence_score(features, sex="female", activity="jump_landing")
    statuses = res["activity_criteria_summary"]["feature_statuses"]
    assert statuses["acl_valgus_angle"] == "Not-Assessable (Occluded)"
