'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Task, User, TaskPriority, TaskStatus, UpdateTaskDto, Role } from '@/types';
import { useAuth } from '@/lib/auth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const editTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  dueDate: z.date({
    message: 'Due date is required',
  }),
  priority: z.nativeEnum(TaskPriority, {
    message: 'Priority is required',
  }),
  status: z.nativeEnum(TaskStatus, {
    message: 'Status is required',
  }),
  assignedTo: z.string().min(1, 'Assignee is required'),
});

type EditTaskFormData = z.infer<typeof editTaskSchema>;

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (taskId: string, updates: UpdateTaskDto) => void;
  users: User[];
}

export function EditTaskDialog({ task, open, onOpenChange, onUpdate, users }: EditTaskDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const isManager = user?.role === Role.MANAGER || user?.role === Role.ADMIN;
  const isAssignee = user?.id === (typeof task.assignedTo === 'object' ? task.assignedTo : task.assignedTo);
  
  // Users can only edit status, managers can edit everything
  const canEditAll = isManager;
  const canEditStatus = isAssignee || isManager;

  const form = useForm<EditTaskFormData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      assignedTo: typeof task.assignedTo === 'string' ? task.assignedTo : (task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo._id : ''),
      dueDate: new Date(task.dueDate),
    },
  });

  // Reset form when task changes
  useEffect(() => {
    if (open) {
      form.reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignedTo: typeof task.assignedTo === 'string' ? task.assignedTo : (task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo._id : ''),
        dueDate: new Date(task.dueDate),
      });
    }
  }, [task, open, form]);

  const onSubmit = async (data: EditTaskFormData) => {
    setLoading(true);
    try {
      const updates: UpdateTaskDto = {
        ...data,
        dueDate: data.dueDate.toISOString(),
      };

      // If user is not a manager, only allow status updates
      if (!canEditAll) {
        const filteredUpdates: UpdateTaskDto = {
          status: data.status
        };
        onUpdate(task._id, filteredUpdates);
      } else {
        onUpdate(task._id, updates);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Task
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {canEditAll ? 'Update task details below.' : 'You can only update the task status.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title - Manager only */}
            {canEditAll && (
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">Task Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter a descriptive task title..." 
                        className="border-2 focus:border-blue-500 transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Description - Manager only */}
            {canEditAll && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide detailed information about the task..."
                        className="border-2 focus:border-blue-500 transition-colors min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority - Manager only */}
              {canEditAll && (
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 focus:border-blue-500">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TaskPriority.LOW}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              Low Priority
                            </div>
                          </SelectItem>
                          <SelectItem value={TaskPriority.MEDIUM}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              Medium Priority
                            </div>
                          </SelectItem>
                          <SelectItem value={TaskPriority.HIGH}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              High Priority
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Status - All users can edit */}
              {canEditStatus && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 focus:border-blue-500">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TaskStatus.PENDING}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                              Pending
                            </div>
                          </SelectItem>
                          <SelectItem value={TaskStatus.IN_PROGRESS}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              In Progress
                            </div>
                          </SelectItem>
                          <SelectItem value={TaskStatus.COMPLETED}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              Completed
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Assigned To - Manager only */}
            {canEditAll && (
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">Assign To</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-2 focus:border-blue-500">
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Due Date - Manager only */}
            {canEditAll && (
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-semibold text-gray-700">Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal border-2 focus:border-blue-500",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a due date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Task
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
