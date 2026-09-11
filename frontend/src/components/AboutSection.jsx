import React from 'react';
import { BarChart3, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import './AboutSection.css';

export const AboutSection = () => {
  return (
    <section 
      id="about" 
      className="about-section scroll-mt-24" 
      style={{ backgroundImage: `url('/assets/about_runner_hd.jpg')` }}
    >
      {/* Light gradient overlay for maximum readability */}
      <div className="about-gradient-overlay" />

      {/* Subtle Biomechanical HUD Tracking Graphics on athlete leg/shoe */}
      <div className="about-hud-container">
        <div className="about-hud-circle-outer" />
        <div className="about-hud-circle-inner" />
        <div className="about-hud-dot-center" />
        <div className="about-hud-dot-knee" />
      </div>

      <div className="about-content-wrapper">
        
        {/* Top Header & Copy */}
        <div className="about-header-container">
          <div className="about-label-badge">
            <span className="about-label-text">ABOUT INJURYSENSE</span>
            <div className="about-label-line" />
          </div>

          <h2 className="about-main-heading">
            Pioneering Technology for a <span className="italic text-orange font-serif font-extrabold">Safer</span> Athletic Future.
          </h2>

          <p className="about-description-text">
            InjurySense is an advanced AI movement screening platform built on MediaPipe 3D joint landmark pose tracking and 34 clinical biomechanical rules. Our mission is to empower athletes, coaches, physiotherapists, and sports scientists with non-diagnostic screening data to reduce injury risks and optimize movement longevity.
          </p>
        </div>

        {/* 3 Large Glassmorphism Feature Cards with Project-Specific Core Pillars */}
        <div className="about-cards-grid">
          
          {/* Card 01: Blue Accent - 3D Pose Landmark Engine */}
          <div className="about-glass-card about-card-blue">
            <div className="about-card-header">
              <div className="about-icon-box">
                <BarChart3 className="w-7 h-7" />
              </div>
              <span className="about-card-number">01</span>
            </div>

            <div className="about-card-body">
              <h3 className="about-card-title">3D Pose Landmark Engine</h3>
              <p className="about-card-desc">
                Tracks 36 anatomical joint keypoints from standard video footage at 60 FPS without wearable sensors or costly motion capture labs.
              </p>
            </div>

            <div className="about-card-footer">
              <div className="about-card-line" />
              <div className="about-card-arrow-btn">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 02: Orange Accent - 34 Biomechanical Rules */}
          <div className="about-glass-card about-card-orange">
            <div className="about-card-header">
              <div className="about-icon-box">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="about-card-number">02</span>
            </div>

            <div className="about-card-body">
              <h3 className="about-card-title">34 Biomechanical Rules</h3>
              <p className="about-card-desc">
                Evaluates ACL knee valgus, hamstring speed asymmetry, trunk lateral lean, dynamic balance, and ACWR fatigue workload indices.
              </p>
            </div>

            <div className="about-card-footer">
              <div className="about-card-line" />
              <div className="about-card-arrow-btn">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Card 03: Green Accent - Multi-Role Collaboration */}
          <div className="about-glass-card about-card-green">
            <div className="about-card-header">
              <div className="about-icon-box">
                <Users className="w-7 h-7" />
              </div>
              <span className="about-card-number">03</span>
            </div>

            <div className="about-card-body">
              <h3 className="about-card-title">Multi-Role Collaboration</h3>
              <p className="about-card-desc">
                Secure role-based workflows for Athletes, Coaches, Physios, Scientists, and Admins to share screening data and track athlete progress.
              </p>
            </div>

            <div className="about-card-footer">
              <div className="about-card-line" />
              <div className="about-card-arrow-btn">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default AboutSection;
