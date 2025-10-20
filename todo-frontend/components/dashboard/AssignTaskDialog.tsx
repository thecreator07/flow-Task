'use client';

import { useState } from 'react';
import { Task, User } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Users } from 'lucide-react';

interface AssignTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (userId: string) => void;
  users: User[];
}

export function AssignTaskDialog({ task, open, onOpenChange, onAssign, users }: AssignTaskDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const currentAssigneeId = typeof task.assignedTo === 'string' ? task.assignedTo : (task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo._id : '');
  const currentAssignee = typeof task.assignedTo === 'object' ? task.assignedTo : null;

  const handleAssign = async () => {
    if (!selectedUserId) return;
    
    setLoading(true);
    try {
      await onAssign(selectedUserId);
      onOpenChange(false);
      setSelectedUserId('');
    } catch (error) {
      console.error('Failed to assign task:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableUsers = users.filter(user => user.id !== currentAssigneeId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            Reassign Task
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Change the assignee for &rdquo;{task.title}&rdquo;
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Assignee */}
          {currentAssignee && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Currently Assigned To:</h4>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                  {currentAssignee.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{currentAssignee.name}</div>
                  <div className="text-sm text-gray-500">{currentAssignee.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* New Assignee Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Assign To:</h4>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="border-2 focus:border-blue-500">
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    No other users available
                  </div>
                ) : (
                  availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
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
              onClick={handleAssign}
              disabled={loading || !selectedUserId || availableUsers.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Assign Task
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
