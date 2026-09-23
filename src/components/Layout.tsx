import React from 'react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import {
  LayoutDashboard, Camera, Users, Receipt, Scissors, Settings,
  Zap
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
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { systemStatus } = useStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">BarberAI</h1>
                  <p className="text-xs text-muted-foreground">Visual Service & Payment Counter</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => onNavigate(item.id)}
                    className="gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>

            {/* Status & Controls */}
            <div className="flex items-center gap-4">
              {/* System Status */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                AI System Online
              </div>
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center gap-1 overflow-x-auto pb-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onNavigate(item.id)}
                className="gap-1.5 whitespace-nowrap"
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
