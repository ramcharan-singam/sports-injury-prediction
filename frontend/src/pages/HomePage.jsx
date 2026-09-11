import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AboutSection } from '../components/AboutSection';
import { 
  Activity, ArrowRight, ShieldCheck, Video, Award, 
  CheckCircle2, Sparkles, Dumbbell, Cpu, Scan, Layers, PlayCircle, Eye,
  Target, Users, Shield, BarChart3, TrendingUp, Zap, Brain, HeartPulse, Lock
} from 'lucide-react';

export const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, [location.hash]);

  return (
    <div>
      
      {/* 1. FULL HERO SECTION DESIGN matching uploaded mockup media_1788945229864.jpg */}
      <section className="relative min-h-[85vh] flex flex-col justify-between overflow-hidden bg-[#FAF7F2] dark:bg-[#070709] border-b border-[#EAE5DC] dark:border-white/10">
        
        {/* Full-width 8K sports park background image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/hero_sports_park_hd.jpg" 
            alt="InjurySense 8K Sports Park Showcase" 
            className="w-full h-full object-cover object-center scale-102"
          />
          {/* Crisp, subtle dark gradient for crystal-clear image visibility and 100% text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent"></div>
        </div>

        {/* Hero Content Overlay */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-28 relative z-10 w-full flex-1 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-6">
              <span className="text-xs font-black uppercase tracking-[0.25em] !text-[#F97316] font-mono block drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                MOVE SMART. STAY AHEAD.
              </span>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black !text-white tracking-tight font-display leading-[1.05] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                Computer Vision <br />
                Motion Screening for <br />
                <span className="italic !text-[#F97316] font-serif drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">Elite Performance.</span>
              </h1>

              <p className="!text-white text-sm sm:text-base max-w-xl leading-relaxed font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Deploy multi-factor 3D joint landmark pose tracking, 7 dynamic movement activity scopes, and evidence-based risk pattern screening to prevent sports injuries before they happen.
              </p>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-extrabold px-8 py-3.5 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Decorative Handwritten Cursive Script Accent matching user mockup media_1788959911252.png */}
            <div className="lg:col-span-4 hidden lg:flex flex-col items-end pt-4 space-y-1">
              <div className="text-right font-serif italic text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight rotate-[-4deg] drop-shadow-2xl">
                Play <br />
                Inspire <br />
                Belong
              </div>
              <div className="w-28 h-1 rounded-full bg-[#F97316] shadow-lg"></div>
            </div>

          </div>
        </div>

        {/* Floating Glassmorphism Stat Bar at Bottom of Hero matching user mockup media_1788959911252.png */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
          <div className="bg-black/65 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-2xl text-white">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-white/20">
              
              <div className="flex items-center space-x-3.5 sm:justify-center pt-2 sm:pt-0">
                <div className="w-10 h-10 rounded-xl bg-[#F97316]/25 border border-[#F97316]/50 flex items-center justify-center text-[#F97316] shrink-0 shadow-lg">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black font-mono tracking-wider uppercase text-white">Frames Analyzed</div>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 sm:justify-center pt-2 sm:pt-0">
                <div className="w-10 h-10 rounded-xl bg-[#F97316]/25 border border-[#F97316]/50 flex items-center justify-center text-[#F97316] shrink-0 shadow-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black font-mono tracking-wider uppercase text-white">Athletes Supported</div>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 sm:justify-center pt-2 sm:pt-0">
                <div className="w-10 h-10 rounded-xl bg-[#F97316]/25 border border-[#F97316]/50 flex items-center justify-center text-[#F97316] shrink-0 shadow-lg">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black font-mono tracking-wider uppercase text-white">Risk Detection Rate</div>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 sm:justify-center pt-2 sm:pt-0">
                <div className="w-10 h-10 rounded-xl bg-[#F97316]/25 border border-[#F97316]/50 flex items-center justify-center text-[#F97316] shrink-0 shadow-lg">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black font-mono tracking-wider uppercase text-white">Movement Scopes</div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* 2. SPORTS & MOVEMENT SCOPES SECTION (Seamlessly attached flush below Hero) */}
      <section id="sports" className="scroll-mt-24 relative w-full py-14 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat overflow-hidden"
               style={{ backgroundImage: `url('/assets/stadium_field_hd.jpg')` }}>
        {/* Soft gradient overlay over stadium background for optimal contrast & smooth transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/75 backdrop-brightness-[0.98]" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Center Main Card Container featuring 8K Sports Flatlay */}
          <div className="w-full relative rounded-3xl overflow-hidden shadow-2xl bg-cover bg-center bg-no-repeat py-10 px-6 sm:px-10 border-2 border-white/80 dark:border-white/20"
               style={{ backgroundImage: `url('/assets/sports_flatlay_hd.jpg')` }}>
            {/* Dark contrast overlay inside card */}
            <div className="absolute inset-0 bg-black/25 backdrop-brightness-[0.95]" />

            <div className="relative z-10 space-y-7">
              <div className="space-y-1.5">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black !text-white tracking-tight font-display drop-shadow-lg">
                  Supported Movement <span className="italic !text-[#F97316] font-serif font-extrabold">Scopes.</span>
                </h2>
                <p className="!text-white/95 text-xs sm:text-sm font-semibold drop-shadow max-w-2xl">
                  7 dynamic athletic movement criteria scopes with custom category weight matrices.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: '🏃', name: 'Running / Sprinting', detail: 'Hamstring Speed Asymmetry & Sprint Workload' },
                  { icon: '🦵', name: 'Squat', detail: 'Deep Knee/Hip Flexion & Lumbar ROM' },
                  { icon: '🏋️', name: 'Jump Landing', detail: 'ACL Knee Valgus & Initial Contact Flexion' },
                  { icon: '↔️', name: 'Cutting / Direction Change', detail: 'Torso Lateral Lean & Valgus Asymmetry' },
                  { icon: '🚶', name: 'Walking / Gait', detail: 'Center-of-Mass Sway & Gait Symmetry' },
                  { icon: '🦶', name: 'Single-Leg Movement', detail: 'Single-Leg Postural Instability Index' },
                  { icon: '🏃‍♂️', name: 'Lunge / Split Stance', detail: 'Anterior Pelvic Tilt & Bilateral Flexion' }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-2xl bg-[#EBEBEB]/95 hover:bg-white border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center space-x-3.5 group hover:-translate-y-1"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#221F1F] flex items-center justify-center text-xl shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>
                    <div className="space-y-0.5 pr-1">
                      <h3 className="text-sm sm:text-base font-bold !text-[#111111] font-display leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs !text-[#555555] font-medium leading-normal">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section 
        id="how-it-works" 
        className="scroll-mt-24 relative w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `url('/assets/sports_grass_clean_bg.jpg')` }}
      >
        <div className="max-w-7xl mx-auto relative z-10 space-y-12">
          
          {/* Top Header Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Header Title & Subtitle */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-black uppercase text-[#F97316] tracking-[0.2em] block">
                  OUR SCREENING PROCESS
                </span>
                <div className="w-10 h-[3px] bg-[#F97316] rounded-full" />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-[#0B192C] leading-tight drop-shadow-sm">
                Evidence-Based Motion Analytics <span className="italic !text-[#F97316] font-serif font-extrabold block sm:inline">Workflow.</span>
              </h2>

              <p className="text-slate-800 text-sm sm:text-base font-semibold max-w-xl leading-relaxed">
                From video to actionable insights — a streamlined process to analyze movement, detect risks, and support safer, stronger athletes.
              </p>
            </div>

            {/* Right Column: Science Meets Movement & Move Safer Perform Better */}
            <div className="lg:col-span-4 hidden lg:flex flex-col items-end text-right space-y-1 select-none pt-2">
              <div className="text-[10px] font-mono font-black uppercase tracking-[2.5px] text-[#0B192C]">
                SCIENCE<br />MEETS<br />MOVEMENT
              </div>
              <div className="text-2xl sm:text-3xl font-serif italic font-extrabold text-[#0B192C] leading-snug rotate-[-3deg] pt-1">
                Move<br />Safer<br />Perform<br />Better
              </div>
              <div className="w-14 h-1 bg-[#F97316] rounded-full ml-auto shadow-sm" />
            </div>

          </div>

          {/* 4 Feature Step Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2 relative">
            {[
              {
                step: "01",
                title: "Video Upload",
                desc: "Select from 7 movement activity scopes and upload video footage.",
                icon: Video,
                accentColor: "text-orange-500",
                badgeBg: "bg-orange-500 text-white",
                btnBg: "bg-orange-500 text-white",
                cardBg: "bg-white/80 backdrop-blur-md",
                borderColor: "border-2 border-orange-300/80 hover:border-orange-500",
                hoverShadow: "hover:shadow-[0_20px_40px_rgba(249,115,22,0.3)]",
                arrowColor: "text-orange-500"
              },
              {
                step: "02",
                title: "Pose Extraction",
                desc: "Extracts 36 anatomical joint keypoints and landmark visibilities.",
                icon: Activity,
                accentColor: "text-blue-500",
                badgeBg: "bg-blue-500 text-white",
                btnBg: "bg-blue-500 text-white",
                cardBg: "bg-white/80 backdrop-blur-md",
                borderColor: "border-2 border-blue-300/80 hover:border-blue-500",
                hoverShadow: "hover:shadow-[0_20px_40px_rgba(37,99,235,0.3)]",
                arrowColor: "text-blue-500"
              },
              {
                step: "03",
                title: "Rule Evaluation",
                desc: "Evaluates biomechanical, asymmetry, workload, and fatigue rules.",
                icon: BarChart3,
                accentColor: "text-green-600",
                badgeBg: "bg-green-600 text-white",
                btnBg: "bg-green-600 text-white",
                cardBg: "bg-white/80 backdrop-blur-md",
                borderColor: "border-2 border-green-300/80 hover:border-green-600",
                hoverShadow: "hover:shadow-[0_20px_40px_rgba(22,163,74,0.3)]",
                arrowColor: "text-green-600"
              },
              {
                step: "04",
                title: "Risk Screening",
                desc: "Generates non-diagnostic screening scores and targeted recommendations.",
                icon: ShieldCheck,
                accentColor: "text-pink-500",
                badgeBg: "bg-pink-500 text-white",
                btnBg: "bg-pink-500 text-white",
                cardBg: "bg-white/80 backdrop-blur-md",
                borderColor: "border-2 border-pink-300/80 hover:border-pink-500",
                hoverShadow: "hover:shadow-[0_20px_40px_rgba(225,29,72,0.35)]",
                arrowColor: "text-pink-500"
              }
            ].map((st, idx, arr) => (
              <div key={st.step} className="relative group">
                
                {/* Step Card Element with Scale & Shadow Hover Effects */}
                <div className={`p-6 rounded-[22px] ${st.cardBg} ${st.borderColor} ${st.hoverShadow} flex flex-col justify-between h-[285px] transition-all duration-300 ease-out cursor-pointer hover:-translate-y-2 hover:scale-[1.02] shadow-xl`}>
                  
                  {/* Top Row: Large Step Number + Circle Badge Icon */}
                  <div className="flex items-center justify-between">
                    <span className={`text-3xl font-black font-mono tracking-tight ${st.accentColor}`}>
                      {st.step}
                    </span>

                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 ${st.badgeBg}`}>
                      <st.icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Card Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-black font-display text-[#0B192C] leading-snug">
                      {st.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-700 font-semibold leading-relaxed">
                      {st.desc}
                    </p>
                  </div>

                  {/* Bottom Row: Circular Action Button */}
                  <div className="pt-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${st.btnBg}`}>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-[3px]" />
                    </div>
                  </div>

                </div>

                {/* Connecting Circle Badge Arrow between steps (hidden on small screens) */}
                {idx < arr.length - 1 && (
                  <div className="hidden lg:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center pointer-events-none">
                    <ArrowRight className={`w-4 h-4 ${arr[idx + 1].arrowColor}`} />
                  </div>
                )}

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. INSIGHTS SECTION: Biomechanical Motion Insights */}
      <section 
        id="insights" 
        className="scroll-mt-24 w-full py-16 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat relative overflow-hidden"
        style={{ backgroundImage: `url('/assets/InjurySense_HD_Sports_Field_Background.jpg')` }}
      >
        
        {/* Main Glass Panel: Centered 92-94% width translucent glass container */}
        <div className="w-[93%] max-w-[1400px] mx-auto min-h-[620px] rounded-[28px] bg-white/45 backdrop-blur-[6px] border border-white/70 shadow-2xl p-8 sm:p-12 lg:p-14 relative overflow-hidden flex flex-col justify-between space-y-10">
          
          {/* Header & Right Decoration Visual Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
            
            {/* Top-Left Header */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-xs sm:text-sm font-mono font-black uppercase text-[#FF6B00] tracking-[0.25em] block">
                  REAL-TIME ANALYTICS & INSIGHTS
                </span>
                <div className="w-10 h-[3px] bg-[#FF6B00] rounded-full" />
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-black font-display tracking-tight text-[#0B192C] leading-[1.08]">
                Biomechanical Motion <span className="italic !text-[#FF6B00] font-serif font-extrabold block sm:inline">Insights.</span>
              </h2>

              <p className="text-[#26364D] text-sm sm:text-base lg:text-lg font-semibold max-w-xl leading-relaxed">
                Discover actionable data-driven metrics powered by computer vision pose estimations and load tracking.
              </p>
            </div>

            {/* Right Decoration: Four Circular Sports Icons + Movement Tagline */}
            <div className="lg:col-span-4 relative min-h-[140px] flex items-center justify-end">
              
              {/* Four Circular Sports Icons Visual */}
              <div className="hidden sm:flex absolute right-24 top-0 space-x-2.5 pointer-events-none select-none">
                {/* Basketball */}
                <div className="w-10 h-10 rounded-full bg-orange-500/20 backdrop-blur-sm border border-orange-500/40 flex items-center justify-center text-[#FF6B00] shadow-md animate-float-1">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M4.93 4.93A10 10 0 0 1 19.07 19.07"/>
                    <path d="M4.93 19.07A10 10 0 0 1 19.07 4.93"/>
                    <path d="M12 2v20"/>
                    <path d="M2 12h20"/>
                  </svg>
                </div>
                {/* Soccer */}
                <div className="w-10 h-10 rounded-full bg-slate-800/15 backdrop-blur-sm border border-slate-700/30 flex items-center justify-center text-slate-800 shadow-md animate-float-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m12 7-3.5 2.5 1.3 4h4.4l1.3-4z"/>
                    <path d="M12 7V2"/>
                    <path d="m8.5 9.5-4.5-2"/>
                    <path d="m9.8 13.5-3 3.5"/>
                    <path d="m14.2 13.5 3 3.5"/>
                    <path d="m15.5 9.5 4.5-2"/>
                  </svg>
                </div>
                {/* Tennis */}
                <div className="w-10 h-10 rounded-full bg-lime-500/20 backdrop-blur-sm border border-lime-500/40 flex items-center justify-center text-lime-600 shadow-md animate-float-3">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M18.36 5.64a9 9 0 0 1 0 12.72"/>
                    <path d="M5.64 18.36a9 9 0 0 1 0-12.72"/>
                  </svg>
                </div>
                {/* Target */}
                <div className="w-9 h-9 rounded-full bg-rose-500/20 backdrop-blur-sm border border-rose-500/40 flex items-center justify-center text-[#F23B91] shadow-md animate-float-1">
                  <Target className="w-4 h-4" />
                </div>
              </div>

              {/* Tagline Column */}
              <div className="text-right space-y-1 select-none z-10 pl-4">
                <div className="text-[10px] font-mono font-black uppercase tracking-[2.5px] text-[#0B192C]">
                  REAL-TIME<br />MOVEMENT<br />INSIGHTS
                </div>
                <div className="text-2xl sm:text-3xl font-serif italic font-extrabold text-[#0B192C] leading-snug rotate-[-2deg] pt-1">
                  Move<br />Safer<br />Perform<br />Better
                </div>
                <div className="w-14 h-1 bg-[#FF6B00] rounded-full ml-auto shadow-sm" />
              </div>

            </div>

          </div>

          {/* Four Translucent Cards Grid (26px gap) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[26px] relative z-10">
            {[
              {
                num: "01",
                title: "Asymmetry & Imbalance Profiling",
                desc: "Real-time tracking of bilateral joint angle discrepancies across knees, hips, and shoulders.",
                icon: TrendingUp,
                accentColor: "#FF6B00",
                hexText: "text-[#FF6B00]",
                borderClass: "hover:border-[#FF6B00]",
                borderBottomStyle: { borderBottomColor: "#FF6B00" },
                hoverShadow: "hover:shadow-[0_20px_40px_rgba(255,107,0,0.28)]"
              },
              {
                num: "02",
                title: "Workload & Fatigue Monitoring",
                desc: "Quantify jump volume, sprint load, and force decay over time to avoid overuse injuries.",
                icon: Activity,
                accentColor: "#287CF7",
                hexText: "text-[#287CF7]",
                borderClass: "hover:border-[#287CF7]",
                borderBottomStyle: { borderBottomColor: "#287CF7" },
                hoverShadow: "hover:shadow-[0_20px_40px_rgba(40,124,247,0.28)]"
              },
              {
                num: "03",
                title: "3D Joint Landmark Precision",
                desc: "High-accuracy 36-keypoint anatomical skeleton mapping at 60 FPS without wearable sensors.",
                icon: Scan,
                accentColor: "#16B957",
                hexText: "text-[#16B957]",
                borderClass: "hover:border-[#16B957]",
                borderBottomStyle: { borderBottomColor: "#16B957" },
                hoverShadow: "hover:shadow-[0_20px_40px_rgba(22,185,87,0.28)]"
              },
              {
                num: "04",
                title: "Targeted Injury Prevention Plans",
                desc: "Automated non-diagnostic screening recommendations targeting ACL, hamstring, and lumbar ROM.",
                icon: ShieldCheck,
                accentColor: "#F23B91",
                hexText: "text-[#F23B91]",
                borderClass: "hover:border-[#F23B91]",
                borderBottomStyle: { borderBottomColor: "#F23B91" },
                hoverShadow: "hover:shadow-[0_20px_40px_rgba(242,59,145,0.28)]"
              }
            ].map((card) => (
              <div 
                key={card.num}
                style={{ borderBottomWidth: '4px', ...card.borderBottomStyle }}
                className={`p-6 sm:p-7 rounded-[20px] bg-white/[0.72] backdrop-blur-[8px] border border-white/80 shadow-[0_12px_30px_rgba(0,0,0,0.15)] ${card.hoverShadow} ${card.borderClass} flex flex-col justify-between min-h-[290px] transition-all duration-300 ease-out cursor-pointer group hover:-translate-y-2 hover:scale-[1.01]`}
              >
                {/* Top Row: Icon Container on Left + Accent Number on Right */}
                <div className="flex items-center justify-between">
                  <div 
                    style={{ color: card.accentColor }}
                    className="w-12 h-12 rounded-2xl bg-[#221F1F] flex items-center justify-center border border-white/10 shadow-md transition-transform duration-300 group-hover:scale-110"
                  >
                    <card.icon className="w-6 h-6" />
                  </div>

                  <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${card.hexText}`}>
                    {card.num}
                  </span>
                </div>

                {/* Middle: Title & Description */}
                <div className="space-y-2 py-3">
                  <h3 className="text-lg font-black font-display text-[#0B192C] leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-700 font-medium leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                {/* Bottom: LEARN MORE -> */}
                <div className="pt-2">
                  <div 
                    style={{ color: card.accentColor }} 
                    className="inline-flex items-center space-x-1.5 text-xs font-black font-mono tracking-wider"
                  >
                    <span>LEARN MORE</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-[5px]" />
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. ABOUT SECTION */}
      <AboutSection />

    </div>
  );
};

export default HomePage;
