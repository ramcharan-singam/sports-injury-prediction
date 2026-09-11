# -*- coding: utf-8 -*-
import os
import json
import logging
from typing import Dict, Any, Tuple, List, Optional

try:
    from ml.config import (
        ACTIVITY_TYPE_MAP,
        ACTIVITY_CATEGORY_WEIGHTS,
        FEATURE_KEYPOINT_REQUIREMENTS,
        LOWER_BODY_ACTIVITIES,
        UPPER_BODY_FEATURES
    )
except ImportError:
    from backend.ml.config import (
        ACTIVITY_TYPE_MAP,
        ACTIVITY_CATEGORY_WEIGHTS,
        FEATURE_KEYPOINT_REQUIREMENTS,
        LOWER_BODY_ACTIVITIES,
        UPPER_BODY_FEATURES
    )

logger = logging.getLogger("ml.scoring_engine")

RULES_REGISTRY_PATH = os.path.join(os.path.dirname(__file__), "rules_registry.json")

def load_rules_registry() -> dict:
    if os.path.exists(RULES_REGISTRY_PATH):
        try:
            with open(RULES_REGISTRY_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading rules registry: {e}")
    return {"categories": {}}

def normalize_activity_key(activity: Optional[str]) -> str:
    """Normalize any string representation of activity (e.g. 'Jump Landing' -> 'jump_landing')."""
    if not activity:
        return "jump_landing"
    
    clean = str(activity).strip().lower().replace(" ", "_").replace("/", "_").replace("-", "_")
    if "running" in clean or "sprint" in clean:
        return "running_sprinting"
    elif "squat" in clean:
        return "squat"
    elif "jump" in clean or "landing" in clean:
        return "jump_landing"
    elif "cut" in clean or "direction" in clean:
        return "cutting_direction_change"
    elif "walk" in clean or "gait" in clean:
        return "walking_gait"
    elif "single_leg" in clean or "singleleg" in clean:
        return "single_leg_movement"
    elif "lunge" in clean:
        return "lunge"
    
    return "jump_landing"

def evaluate_quality_gatekeeper(pose_confidence: float, measurement_reliability: float) -> Tuple[bool, str]:
    """
    Video Quality Gatekeeper
    Requires pose_confidence >= 0.75 AND measurement_reliability >= 0.70.
    Returns (passed, message).
    """
    if pose_confidence < 0.75 or measurement_reliability < 0.70:
        return False, f"Unable to Classify - Insufficient Video Quality (Pose Confidence: {pose_confidence:.2f}, Reliability: {measurement_reliability:.2f})"
    return True, "Passed"

def evaluate_activity_validation(activity_key: str, features: dict) -> Tuple[bool, str]:
    """
    Activity Validation Gatekeeper
    Verifies that the movement activity is valid and pose landmarks meet essential criteria.
    Returns (passed, message).
    """
    if activity_key not in ACTIVITY_TYPE_MAP:
        return False, f"Unsupported Movement Activity Type: '{activity_key}'"
    
    # Check minimum general pose confidence
    pose_conf = float(features.get("pose_confidence", 0.85))
    if pose_conf < 0.40:
        return False, f"Activity Validation Failed - Pose confidence ({pose_conf:.2f}) too low for activity assessment"

    return True, "Passed"

def evaluate_evidence_score(
    features: dict,
    sex: str = "female",
    activity: str = "jump_landing",
    athlete_history: Optional[dict] = None
) -> dict:
    """
    Evaluates evidence-based rules across 5 screening categories using dynamic activity weights,
    3-tier status data model (Assess, Not Applicable, Not-Assessable), sex confidence multipliers,
    explicit weight normalization formula, screening scores (0-100), tier classifications, and targeted recommendations.
    """
    activity_key = normalize_activity_key(activity)
    activity_meta = ACTIVITY_TYPE_MAP.get(activity_key, ACTIVITY_TYPE_MAP["jump_landing"])
    activity_weights = ACTIVITY_CATEGORY_WEIGHTS.get(activity_key, ACTIVITY_CATEGORY_WEIGHTS["jump_landing"])

    pose_confidence = float(features.get("pose_confidence", 0.85))
    measurement_reliability = float(features.get("measurement_reliability", 0.80))
    
    # 1. Quality Gatekeeper
    passed_gatekeeper, gatekeeper_msg = evaluate_quality_gatekeeper(pose_confidence, measurement_reliability)
    if not passed_gatekeeper:
        return {
            "gatekeeper_passed": False,
            "gatekeeper_message": gatekeeper_msg,
            "screening_score": None,
            "classification": "Unable to Classify - Insufficient Video Quality",
            "urgency_level": "Re-record Video",
            "bucket_scores": {
                "biomechanical_deviations": 0.0,
                "historical_injury_factors": 0.0,
                "movement_asymmetry": 0.0,
                "training_load_indicators": 0.0,
                "fatigue_indicators": 0.0
            },
            "activity_criteria_summary": {
                "activity_type": activity_key,
                "activity_name": activity_meta["name"],
                "primary_focus": activity_meta["focus"],
                "category_weights": activity_weights,
                "assessable_categories": [],
                "feature_statuses": {}
            },
            "triggered_rules": [],
            "recommendations": []
        }

    # 2. Activity Validation Gatekeeper
    passed_act_val, act_val_msg = evaluate_activity_validation(activity_key, features)
    if not passed_act_val:
        return {
            "gatekeeper_passed": False,
            "gatekeeper_message": act_val_msg,
            "screening_score": None,
            "classification": "Unable to Classify - Invalid Activity Scope",
            "urgency_level": "Re-record Video",
            "bucket_scores": {
                "biomechanical_deviations": 0.0,
                "historical_injury_factors": 0.0,
                "movement_asymmetry": 0.0,
                "training_load_indicators": 0.0,
                "fatigue_indicators": 0.0
            },
            "activity_criteria_summary": {
                "activity_type": activity_key,
                "activity_name": activity_meta["name"],
                "primary_focus": activity_meta["focus"],
                "category_weights": activity_weights,
                "assessable_categories": [],
                "feature_statuses": {}
            },
            "triggered_rules": [],
            "recommendations": []
        }

    registry = load_rules_registry()
    categories = registry.get("categories", {})
    
    normalized_sex = sex.lower() if sex else "female"
    if normalized_sex not in ["female", "male"]:
        normalized_sex = "female"

    # Determine 3-tier status for every feature:
    # 'Assess': Relevant to activity & landmark visibility sufficient
    # 'Not Applicable': Out of activity scope (e.g. Upper-body features on lower-body activities)
    # 'Not-Assessable (Occluded)': Required for activity scope but required landmark visibility insufficient
    feature_statuses = {}
    keypoint_confs = features.get("keypoint_confidences", {})

    for feat_name, req in FEATURE_KEYPOINT_REQUIREMENTS.items():
        if activity_key in LOWER_BODY_ACTIVITIES and feat_name in UPPER_BODY_FEATURES:
            feature_statuses[feat_name] = "Not Applicable"
            continue

        min_vis = req.get("minimum_visibility", 0.40)
        req_kpts = req.get("required_keypoints", [])
        
        if not req_kpts:
            feature_statuses[feat_name] = "Assess"
            continue

        vis_ok = True
        for kpt in req_kpts:
            conf = keypoint_confs.get(kpt, pose_confidence)
            if conf < min_vis:
                vis_ok = False
                break

        if vis_ok:
            feature_statuses[feat_name] = "Assess"
        else:
            feature_statuses[feat_name] = "Not-Assessable (Occluded)"

    # History status handling
    has_history = athlete_history is not None or any(k for k in features.keys() if "prior_injury" in k)

    triggered_rules = []
    category_results = {}

    bucket_sums = {
        "biomechanical_deviations": {"weighted_triggered": 0.0, "total_weight": 0.0, "assessable_count": 0},
        "historical_injury_factors": {"weighted_triggered": 0.0, "total_weight": 0.0, "assessable_count": 0},
        "movement_asymmetry": {"weighted_triggered": 0.0, "total_weight": 0.0, "assessable_count": 0},
        "training_load_indicators": {"weighted_triggered": 0.0, "total_weight": 0.0, "assessable_count": 0},
        "fatigue_indicators": {"weighted_triggered": 0.0, "total_weight": 0.0, "assessable_count": 0}
    }

    def assign_to_bucket(rule_id, evidence_type):
        if "prior_injury" in rule_id or (evidence_type == "Direct" and "injury" in rule_id):
            return "historical_injury_factors"
        elif "asymmetry" in rule_id or "deficit" in rule_id or "dyskinesis" in rule_id:
            return "movement_asymmetry"
        elif "acwr" in rule_id or "volume" in rule_id or "workload" in rule_id:
            return "training_load_indicators"
        elif "drift" in rule_id or "fatigue" in rule_id or "decline" in rule_id:
            return "fatigue_indicators"
        else:
            return "biomechanical_deviations"

    all_recommendations = []

    for cat_key, cat_data in categories.items():
        cat_triggered = []
        for rule in cat_data.get("rules", []):
            rule_id = rule["id"]
            bucket_key = assign_to_bucket(rule_id, rule.get("evidence_type"))

            # Check 3-tier status for this rule's feature
            rule_status = feature_statuses.get(rule_id, "Assess")
            if bucket_key == "historical_injury_factors" and not has_history:
                rule_status = "Not Available"

            if rule_status != "Assess":
                continue

            threshold = float(rule["threshold"])
            operator = rule["operator"]
            val = float(features.get(rule_id, 0.0))
            
            triggered = False
            if operator == ">=" and val >= threshold:
                triggered = True
            elif operator == ">" and val > threshold:
                triggered = True
            elif operator == "<=" and val <= threshold:
                triggered = True
            elif operator == "<" and val < threshold:
                triggered = True
            elif operator == "==" and abs(val - threshold) < 1e-4:
                triggered = True

            sex_mults = rule.get("sex_validation", {})
            conf_mult = float(sex_mults.get(normalized_sex, 1.0))
            
            weight = float(rule.get("severity_weight", 1.0))

            bucket_sums[bucket_key]["total_weight"] += weight
            bucket_sums[bucket_key]["assessable_count"] += 1
            
            if triggered:
                bucket_sums[bucket_key]["weighted_triggered"] += (weight * conf_mult)
                rule_item = {
                    "rule_id": rule_id,
                    "rule_name": rule["name"],
                    "category": cat_data["name"],
                    "value": round(val, 2),
                    "threshold": threshold,
                    "unit": rule.get("unit", ""),
                    "evidence_type": rule.get("evidence_type", "Direct"),
                    "confidence_multiplier": conf_mult,
                    "recommendations": rule.get("recommendations", [])
                }
                triggered_rules.append(rule_item)
                cat_triggered.append(rule_item)

                for rec in rule.get("recommendations", []):
                    if rec not in all_recommendations:
                        all_recommendations.append(rec)

        category_results[cat_key] = cat_triggered

    # Calculate raw category percentage scores S_c
    bucket_scores = {}
    assessable_categories = []

    for b_key, b_val in bucket_sums.items():
        if b_val["total_weight"] > 0:
            b_score = (b_val["weighted_triggered"] / b_val["total_weight"]) * 100.0
            bucket_scores[b_key] = round(min(100.0, max(0.0, b_score)), 1)
            assessable_categories.append(b_key)
        else:
            bucket_scores[b_key] = 0.0

    # Explicit Category Normalization Formula over assessable categories A:
    # S_final = sum_{c in A} (W_c * S_c) / sum_{c in A} W_c
    sum_weighted_scores = 0.0
    sum_weights = 0.0

    for c_key in assessable_categories:
        w_c = activity_weights.get(c_key, 0.20)
        s_c = bucket_scores[c_key]
        sum_weighted_scores += (w_c * s_c)
        sum_weights += w_c

    if sum_weights > 0:
        final_score = sum_weighted_scores / sum_weights
    else:
        final_score = 0.0

    final_score = round(min(100.0, max(0.0, final_score)), 1)

    # Risk pattern screening classification
    if final_score <= 33.0:
        classification = "Low"
        urgency = "Informational"
    elif final_score <= 66.0:
        classification = "Moderate"
        urgency = "Actionable Correctives"
    else:
        classification = "High"
        urgency = "Physiotherapist Review Priority"

    formatted_recs = []
    for rec_text in all_recommendations:
        formatted_recs.append({
            "text": rec_text,
            "urgency": urgency,
            "classification_tier": classification
        })

    return {
        "gatekeeper_passed": True,
        "gatekeeper_message": "Passed",
        "screening_score": final_score,
        "classification": classification,
        "urgency_level": urgency,
        "bucket_scores": bucket_scores,
        "activity_criteria_summary": {
            "activity_type": activity_key,
            "activity_name": activity_meta["name"],
            "primary_focus": activity_meta["focus"],
            "category_weights": activity_weights,
            "assessable_categories": assessable_categories,
            "feature_statuses": feature_statuses
        },
        "triggered_rules": triggered_rules,
        "recommendations": formatted_recs
    }
