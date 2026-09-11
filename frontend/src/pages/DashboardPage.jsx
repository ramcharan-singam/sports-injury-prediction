import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AthleteDashboard } from '../components/dashboards/AthleteDashboard';
import { CoachDashboard } from '../components/dashboards/CoachDashboard';
import { PhysioDashboard } from '../components/dashboards/PhysioDashboard';
import { ScientistDashboard } from '../components/dashboards/ScientistDashboard';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';

export const DashboardPage = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 accent-text"></div>
      </div>
    );
  }

  const renderDashboardContent = () => {
    switch (user.role) {
      case 'Coach':
        return <CoachDashboard user={user} />;
      case 'Physiotherapist':
        return <PhysioDashboard user={user} />;
      case 'Sports Scientist':
        return <ScientistDashboard user={user} />;
      case 'Admin':
        return <AdminDashboard user={user} />;
      case 'Athlete':
      default:
        return <AthleteDashboard user={user} />;
    }
  };

  return (
    <div 
      className="min-h-screen relative bg-cover bg-center bg-no-repeat bg-fixed transition-colors duration-300"
      style={{ backgroundImage: `url('/app_bg.png')` }}
    >
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {renderDashboardContent()}
      </div>
    </div>
  );
};
