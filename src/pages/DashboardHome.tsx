import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import StudentDashboard from './dashboards/StudentDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import InterviewerDashboard from './dashboards/InterviewerDashboard';
import OrgAdminDashboard from './dashboards/OrgAdminDashboard';
import OtherDashboard from './dashboards/OtherDashboard';

const DashboardHome = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'student':
      case 'interviewee':
        return <StudentDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'interviewer':
        return <InterviewerDashboard />;
      case 'org_admin':
      case 'super_admin':
        return <OrgAdminDashboard />;
      case 'other':
        return <OtherDashboard />;
      default:
        return <OtherDashboard />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default DashboardHome;
