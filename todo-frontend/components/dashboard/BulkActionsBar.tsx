'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Trash2, X, CheckSquare } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({ selectedCount, onBulkDelete, onClearSelection }: BulkActionsBarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleBulkDelete = () => {
    onBulkDelete();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-3">
          <CheckSquare className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">
            {selectedCount} task{selectedCount > 1 ? 's' : ''} selected
          </span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedCount}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4 mr-2" />
            Clear Selection
          </Button>
        </div>
      </div>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Tasks</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} selected task{selectedCount > 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedCount} Task{selectedCount > 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
