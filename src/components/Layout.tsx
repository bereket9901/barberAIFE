import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import {
  LayoutDashboard, Camera, Users, Receipt, Scissors, Settings,
  Zap, Bell, Search, Cpu, LogOut, UserCog
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: '/cameras', label: 'Live Cameras', icon: Camera },
  { id: '/customers', label: 'Customers', icon: Users },
  { id: '/transactions', label: 'Transactions', icon: Receipt },
  { id: '/services', label: 'Services', icon: Scissors },
  { id: '/ai-test', label: 'AI Test Lab', icon: Cpu },
  { id: '/admin/users', label: 'User Management', icon: UserCog },
  { id: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children }: LayoutProps) {
  const { systemStatus } = useStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col fixed h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">BarberAI</h1>
              <p className="text-xs text-muted-foreground">Visual Counter</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                location.pathname === item.id
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* System Status */}
        <div className="p-4 border-t border-border">
          <div className="bg-accent/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-foreground">AI System Online</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
              <div>Cameras: {systemStatus.camerasConnected}/{systemStatus.cameras}</div>
              <div>Detection: Active</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between h-16 px-8">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {navItems.find(item => item.id === location.pathname)?.label || 'Dashboard'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {location.pathname === '/dashboard' && 'Real-time AI-powered service detection & billing'}
                {location.pathname === '/cameras' && 'Live monitoring of all barber chairs'}
                {location.pathname === '/customers' && 'Active and recent customer sessions'}
                {location.pathname === '/transactions' && 'Payment history and records'}
                {location.pathname === '/services' && 'Manage services and pricing'}
                {location.pathname === '/admin/users' && 'Manage admin users and permissions'}
                {location.pathname === '/settings' && 'System configuration'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors">
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors relative">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">3</span>
              </button>
              
              {/* User Info and Logout */}
              <div className="flex items-center gap-2 pl-3 border-l border-border">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || 'admin@barberai.com'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
