import React from 'react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import {
  LayoutDashboard, Camera, Users, Receipt, Scissors, Settings,
  Zap, Bell, Search, Cpu
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cameras', label: 'Live Cameras', icon: Camera },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'services', label: 'Services', icon: Scissors },
  { id: 'ai-test', label: 'AI Test Lab', icon: Cpu },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { systemStatus } = useStore();

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
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                currentPage === item.id
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
                {navItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {currentPage === 'dashboard' && 'Real-time AI-powered service detection & billing'}
                {currentPage === 'cameras' && 'Live monitoring of all barber chairs'}
                {currentPage === 'customers' && 'Active and recent customer sessions'}
                {currentPage === 'transactions' && 'Payment history and records'}
                {currentPage === 'services' && 'Manage services and pricing'}
                {currentPage === 'settings' && 'System configuration'}
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
              <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-medium">
                A
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
