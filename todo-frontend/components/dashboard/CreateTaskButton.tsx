'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { User } from '@/types';
import { CreateTaskDialog } from './CreateTaskDialog';

interface CreateTaskButtonProps {
  onTaskCreated?: () => void;
  users?: User[];
}

export function CreateTaskButton({ onTaskCreated, users = [] }: CreateTaskButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  const handleTaskCreated = () => {
    setShowDialog(false);
    onTaskCreated?.();
  };

  return (
    <>
      <Button 
        onClick={() => setShowDialog(true)}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Task
        <Sparkles className="ml-2 h-4 w-4" />
      </Button>

      <CreateTaskDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onTaskCreated={handleTaskCreated}
        users={users}
      />
    </>
  );
}
