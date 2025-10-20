'use client';

import { TaskStats, TaskStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Target,
  TrendingUp,
} from 'lucide-react';

interface TaskStatsCardsProps {
  stats: TaskStats;
}

export function TaskStatsCards({ stats }: TaskStatsCardsProps) {
  const pendingCount = stats.byStatus[TaskStatus.PENDING] || 0;
  const inProgressCount = stats.byStatus[TaskStatus.IN_PROGRESS] || 0;
  const completedCount = stats.byStatus[TaskStatus.COMPLETED] || 0;
  
  const completionRate = stats.total > 0 ? Math.round((completedCount / stats.total) * 100) : 0;

  const statsCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'All tasks in system'
    },
    {
      title: 'Pending',
      value: pendingCount,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Awaiting action'
    },
    {
      title: 'In Progress',
      value: inProgressCount,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Currently active'
    },
    {
      title: 'Completed',
      value: completedCount,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Successfully finished'
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: completionRate >= 70 ? 'text-green-600' : completionRate >= 40 ? 'text-yellow-600' : 'text-red-600',
      bgColor: completionRate >= 70 ? 'bg-green-100' : completionRate >= 40 ? 'bg-yellow-100' : 'bg-red-100',
      description: 'Tasks completed'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="transition-all duration-200 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              
              {/* Progress bar for completion rate */}
              {stat.title === 'Completion Rate' && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        completionRate >= 70 ? 'bg-green-500' : 
                        completionRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
