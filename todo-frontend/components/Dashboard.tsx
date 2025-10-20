'use client';

import { useState, useEffect } from 'react';
import { User, Task } from '@/types';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Plus } from 'lucide-react';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import TaskStats from '@/components/TaskStats';
import { Spinner } from '@/components/ui/spinner';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const tasksData = await api.getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    setShowTaskForm(false);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ));
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks(prev => prev.filter(task => task._id !== taskId));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Todo Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name} ({user.role})
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(user.role === 'MANAGER' || user.role === 'ADMIN') && (
              <Button onClick={() => setShowTaskForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            )}
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6">
          {/* Stats */}
          <TaskStats tasks={tasks} />

          {/* Task Form */}
          {showTaskForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Task</CardTitle>
                <CardDescription>
                  Fill in the details to create a new task
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskForm
                  onTaskCreated={handleTaskCreated}
                  onCancel={() => setShowTaskForm(false)}
                />
              </CardContent>
            </Card>
          )}

          {/* Task List */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                {user.role === 'USER' 
                  ? 'Your assigned tasks' 
                  : 'All tasks in the system'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : (
                <TaskList
                  tasks={tasks}
                  currentUser={user}
                  onTaskUpdated={handleTaskUpdated}
                  onTaskDeleted={handleTaskDeleted}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
