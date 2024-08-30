// frontend/watchly-web/app/dashboard/layout.tsx

'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BarChart2, Users, Settings, LogOut,Zap } from 'lucide-react';
import withAuth from '@/components/auth/withAuth';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { icon: Home, label: 'Monitors', href: '/dashboard' },
    { icon: BarChart2, label: 'Incidents', href: '/dashboard/incidents' },
    { icon: Users, label: 'Status Pages', href: '/dashboard/status-pages' },
    { icon: Zap, label: 'Notifications', href: '/dashboard/notifications' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="flex flex-col h-full bg-green-900 text-green-100 w-64 p-4">
      <div className="text-2xl font-bold mb-8 text-green-400">Watchly</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} passHref>
                <div
                  className={`flex items-center p-2 rounded-lg hover:bg-green-800 ${
                    pathname === item.href ? 'bg-green-800' : ''
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <button 
          className="flex items-center p-2 rounded-lg hover:bg-green-800 w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default withAuth(DashboardLayout);