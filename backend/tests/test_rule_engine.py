# -*- coding: utf-8 -*-
import pytest
from ml.scoring_engine import evaluate_quality_gatekeeper, evaluate_evidence_score

def test_quality_gatekeeper_pass():
    passed, msg = evaluate_quality_gatekeeper(0.85, 0.80)
    assert passed is True
    assert msg == "Passed"

def test_quality_gatekeeper_fail():
    passed, msg = evaluate_quality_gatekeeper(0.65, 0.80)
    assert passed is False
    assert "Unable to Classify" in msg

def test_evidence_score_low_tier():
    features = {
        "pose_confidence": 0.90,
        "measurement_reliability": 0.88,
        "acl_valgus_angle": 3.0,
        "acl_flexion_initial_contact": 35.0,
        "acl_trunk_lean": 2.0,
        "acl_valgus_asymmetry": 2.0,
        "hamstring_speed_asymmetry": 3.0,
        "hamstring_pelvic_tilt": 2.0,
        "ankle_dorsiflexion_rom": 40.0,
        "ankle_sway_variance": 0.05,
        "shoulder_gird": 5.0,
        "shoulder_trom_deficit": 1.0,
        "shoulder_scapular_dyskinesis": 0.05,
        "lumbar_flexion_rom": 5.0,
        "lumbar_compensation_drift": 0.05,
        "workload_acwr_elevated": 0.0,
        "workload_quality_decline": 0.05
    }
    res = evaluate_evidence_score(features, sex="female")
    assert res["gatekeeper_passed"] is True
    assert res["classification"] == "Low"
    assert res["screening_score"] <= 33.0
    assert res["urgency_level"] == "Informational"

def test_evidence_score_high_tier():
    features = {
        "pose_confidence": 0.90,
        "measurement_reliability": 0.88,
        "acl_valgus_angle": 14.0,
        "acl_flexion_initial_contact": 18.0,
        "acl_trunk_lean": 15.0,
        "acl_valgus_asymmetry": 18.0,
        "acl_prior_injury": 1.0,
        "hamstring_speed_asymmetry": 25.0,
        "hamstring_pelvic_tilt": 12.0,
        "hamstring_prior_injury": 1.0,
        "ankle_dorsiflexion_rom": 22.0,
        "ankle_sway_variance": 0.25,
        "ankle_prior_injury": 1.0,
        "shoulder_gird": 25.0,
        "shoulder_trom_deficit": 8.0,
        "shoulder_scapular_dyskinesis": 0.35,
        "lumbar_flexion_rom": 18.0,
        "lumbar_compensation_drift": 0.30,
        "lumbar_prior_injury": 1.0,
        "workload_acwr_elevated": 1.0,
        "workload_quality_decline": 0.40
    }
    res = evaluate_evidence_score(features, sex="female")
    assert res["gatekeeper_passed"] is True
    assert res["classification"] == "High"
    assert res["screening_score"] >= 67.0
    assert res["urgency_level"] == "Physiotherapist Review Priority"
    assert len(res["recommendations"]) > 0

def test_sex_confidence_multiplier():
    features = {
        "pose_confidence": 0.90,
        "measurement_reliability": 0.88,
        "acl_trunk_lean": 15.0
    }
    res_female = evaluate_evidence_score(features, sex="female")
    res_male = evaluate_evidence_score(features, sex="male")
    
    rule_f = [r for r in res_female["triggered_rules"] if r["rule_id"] == "acl_trunk_lean"][0]
    rule_m = [r for r in res_male["triggered_rules"] if r["rule_id"] == "acl_trunk_lean"][0]
    
    assert rule_f["confidence_multiplier"] == 1.0
    assert rule_m["confidence_multiplier"] == 0.7
