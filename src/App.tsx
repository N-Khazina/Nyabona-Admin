import  { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { UserManagement } from './components/Users/UserManagement';
import { DriverManagement } from './components/Drivers/DriverManagement';
import { RideManagement } from './components/Rides/RideManagement';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { ReportsManagement } from './components/Reports/ReportsManagement';


function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard Overview',
      users: 'User Management',
      drivers: 'Driver Management',
      rides: 'Rides',
      analytics: 'Analytics',
      reports: 'Reports & Flags'
    };
    return titles[activeTab as keyof typeof titles] || 'Dashboard';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'users':
        return <UserManagement />;
      case 'drivers':
        return <DriverManagement />;
      case 'rides':
        return <RideManagement />;
      case 'analytics':
        return <AnalyticsView />;
      case 'carUpload':
        return <ReportsManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header 
          title={getPageTitle()} 
          setSidebarOpen={setSidebarOpen}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
