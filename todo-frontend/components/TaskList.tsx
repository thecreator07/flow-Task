'use client';

import { useState } from 'react';
import { Task, User, UpdateTaskDto, TaskStatus } from '@/types';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2} from 'lucide-react';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';

interface TaskListProps {
  tasks: Task[];
  currentUser: User;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

export default function TaskList({ tasks, currentUser, onTaskUpdated, onTaskDeleted }: TaskListProps) {
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'PENDING': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setUpdatingTasks(prev => new Set(prev).add(taskId));
    
    try {
      const updates: UpdateTaskDto = { status: newStatus as TaskStatus};
      const updatedTask = await api.updateTask(taskId, updates);
      onTaskUpdated(updatedTask);
    } catch (error:unknown) {
      console.error('Failed to update task:', error instanceof Error?error.message:"");
    } finally {
      setUpdatingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.deleteTask(taskId);
      onTaskDeleted(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const canEditTask = (task: Task) => {
    return currentUser.role === 'ADMIN' || 
           currentUser.role === 'MANAGER' || 
           task.assignedTo === currentUser.id || 
           task.createdBy === currentUser.id;
  };

  const canDeleteTask = (task: Task) => {
    return currentUser.role === 'ADMIN' || 
           currentUser.role === 'MANAGER' || 
           task.createdBy === currentUser.id;
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks found. Create your first task to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task._id} className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {canDeleteTask(task) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{task.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Due Date:</span>
                <br />
                {format(new Date(task.dueDate), 'PPp')}
              </div>
              <div>
                <span className="font-medium">Assigned To:</span>
                <br />
                {typeof task.assignedTo === 'string'
                  ? task.assignedTo
                  : task.assignedTo
                  ? task.assignedTo.name
                  : 'Unassigned'}
              </div>
              <div>
                <span className="font-medium">Created:</span>
                <br />
                {format(new Date(task.createdAt), 'PP')}
              </div>
            </div>

            {canEditTask(task) && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Select
                  value={task.status}
                  onValueChange={(value) => handleStatusChange(task._id, value)}
                  disabled={updatingTasks.has(task._id)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
                {updatingTasks.has(task._id) && (
                  <Spinner className="h-4 w-4" />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
