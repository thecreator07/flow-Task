'use client';

import { useState } from 'react';
import { Task, User, TaskStatus, TaskPriority, UpdateTaskDto} from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserCheck, 
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  User as UserIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EditTaskDialog } from './EditTaskDialog';
import { AssignTaskDialog } from './AssignTaskDialog';

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates:UpdateTaskDto ) => void;
  onDelete: (taskId: string) => void;
  onSelect?: (taskId: string, selected: boolean) => void;
  isSelected?: boolean;
  showSelect?: boolean;
  canEdit: boolean;
  canDelete: boolean;
  users: User[];
}

export function TaskCard({ 
  task, 
  onUpdate, 
  onDelete, 
  onSelect,
  isSelected = false,
  showSelect = false,
  canEdit,
  canDelete,
  users 
}: TaskCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-red-100 text-red-800 border-red-200';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TaskPriority.LOW:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case TaskStatus.PENDING:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircle2 className="h-4 w-4" />;
      case TaskStatus.IN_PROGRESS:
        return <Clock className="h-4 w-4" />;
      case TaskStatus.PENDING:
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    onUpdate(task._id, { status: newStatus });
  };

  const assignedUser = typeof task.assignedTo === 'object' ? task.assignedTo : null;
  const createdUser = typeof task.createdBy === 'object' ? task.createdBy : null;

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED;

  return (
    <>
      <Card className={cn(
        "transition-all duration-200 hover:shadow-lg",
        isSelected && "ring-2 ring-blue-500",
        isOverdue && "border-red-200 bg-red-50/30"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {showSelect && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelect?.(task._id, e.target.checked)}
                  className="mt-1 rounded border-gray-300"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <>
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowAssignDialog(true)}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Reassign
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                {/* Quick Status Updates */}
                {task.status !== TaskStatus.PENDING && (
                  <DropdownMenuItem onClick={() => handleStatusChange(TaskStatus.PENDING)}>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Mark as Pending
                  </DropdownMenuItem>
                )}
                {task.status !== TaskStatus.IN_PROGRESS && (
                  <DropdownMenuItem onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}>
                    <Clock className="mr-2 h-4 w-4" />
                    Mark as In Progress
                  </DropdownMenuItem>
                )}
                {task.status !== TaskStatus.COMPLETED && (
                  <DropdownMenuItem onClick={() => handleStatusChange(TaskStatus.COMPLETED)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </DropdownMenuItem>
                )}
                
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Task
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Status and Priority */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn("text-xs", getStatusColor(task.status))}>
                {getStatusIcon(task.status)}
                <span className="ml-1">{task.status.replace('_', ' ')}</span>
              </Badge>
              <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
                {task.priority} Priority
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
            </div>

            {/* Assigned User */}
            {assignedUser && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserIcon className="h-4 w-4" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                    {assignedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{assignedUser.name}</span>
                </div>
              </div>
            )}

            {/* Created By */}
            {createdUser && (
              <div className="text-xs text-gray-500">
                Created by {createdUser.name} on {format(new Date(task.createdAt), 'MMM dd, yyyy')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditTaskDialog
        task={task}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdate={onUpdate}
        users={users}
      />

      {/* Assign Dialog */}
      <AssignTaskDialog
        task={task}
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        onAssign={(userId) => onUpdate(task._id, { assignedTo: userId })}
        users={users}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{task.title}&ldquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(task._id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
