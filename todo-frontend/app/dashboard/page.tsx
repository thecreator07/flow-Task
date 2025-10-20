'use client';

import { TaskDashboard } from '@/components/dashboard/TaskDashboard';

export default function DashboardPage() {
  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <TaskDashboard />
    </div>
  );
}
