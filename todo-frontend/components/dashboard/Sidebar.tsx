'use client';

import { Role, User } from '@/types';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  LogOut,
  UserCheck,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const { logout } = useAuth();
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: 'My Tasks',
      href: '/dashboard/my-tasks',
      icon: CheckSquare,
      show: true,
    },
    {
      name: 'Teams',
      href: '/dashboard/teams',
      icon: Users,
      show: true,
    },
    {
      name: 'User Management',
      href: '/dashboard/users',
      icon: UserCheck,
      show: user.role === Role.ADMIN || user.role === Role.MANAGER,
    },
    {
      name: 'Admin Panel',
      href: '/dashboard/admin',
      icon: Shield,
      show: user.role === Role.ADMIN,
    },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Task Manager</h2>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-sm text-slate-300">Welcome back,</p>
          <p className="text-white font-semibold">{user.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <p className="text-xs text-slate-400 capitalize">{user.role.toLowerCase()}</p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          if (!item.show) return null;
          
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200',
                  isActive && 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      <Separator />
      
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border border-slate-700 hover:border-red-500/30"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
