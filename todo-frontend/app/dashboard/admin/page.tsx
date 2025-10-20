'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Database, 
  Settings, 
  Activity, 
  Users, 
  CheckSquare,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { AdminSkeleton } from '@/components/ui/loading-skeletons';
import { Role } from '@/types';

interface SystemStats {
  totalUsers: number;
  totalTasks: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export default function AdminPage() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user} = useAuth();

  useEffect(() => {
    // Check if user has admin permissions
    if (user?.role !== Role.ADMIN) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    
    fetchSystemStats();
  }, [user]);

  const fetchSystemStats = async () => {
    try {
      // Mock system statistics - in real app, this would come from API
      const stats: SystemStats = {
        totalUsers: 25,
        totalTasks: 150,
        activeUsers: 18,
        systemHealth: 'healthy',
      };
      setSystemStats(stats);
    } catch (error: unknown) {
      if (error instanceof Error) {
      toast.error('Failed to fetch system statistics', { description: error.message });
      } else {
      toast.error('Failed to fetch system statistics');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check permissions
  if (user?.role !== Role.ADMIN) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 text-center">
              You need administrator privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <AdminSkeleton />;
  }

  const getHealthColor = (health: SystemStats['systemHealth']) => {
    switch (health) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: systemStats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Tasks',
      value: systemStats?.totalTasks || 0,
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Users',
      value: systemStats?.activeUsers || 0,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'System Health',
      value: systemStats?.systemHealth || 'unknown',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600">System administration and management</p>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {card.title === 'System Health' ? (
                    <Badge className={getHealthColor(card.value as SystemStats['systemHealth'])}>
                      {String(card.value).toUpperCase()}
                    </Badge>
                  ) : (
                    card.value
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>
                  Current system status and key metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Database Status</span>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>API Status</span>
                  <Badge className="bg-green-100 text-green-800">Operational</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Last Backup</span>
                  <span className="text-sm text-gray-600">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Server Uptime</span>
                  <span className="text-sm text-gray-600">5 days, 12 hours</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Database className="mr-2 h-4 w-4" />
                  Backup Database
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Export User Data
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  System Configuration
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="mr-2 h-4 w-4" />
                  View System Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Advanced user administration tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button>Create Bulk Users</Button>
                  <Button variant="outline">Export User List</Button>
                  <Button variant="outline">Reset Passwords</Button>
                </div>
                <div className="text-sm text-gray-600">
                  Advanced user management features will be available here.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Maintenance Mode</h4>
                    <p className="text-sm text-gray-600">Enable maintenance mode for system updates</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Configure system email settings</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Security Settings</h4>
                    <p className="text-sm text-gray-600">Manage security policies and authentication</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                System activity and audit trail
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">User login</div>
                    <div className="text-xs text-gray-600">john@example.com logged in successfully</div>
                  </div>
                  <div className="text-xs text-gray-500">2 min ago</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <CheckSquare className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Task completed</div>
                    <div className="text-xs text-gray-600">Task &quot;Update documentation&quot; marked as complete</div>
                  </div>
                  <div className="text-xs text-gray-500">5 min ago</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">System warning</div>
                    <div className="text-xs text-gray-600">High memory usage detected</div>
                  </div>
                  <div className="text-xs text-gray-500">15 min ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
