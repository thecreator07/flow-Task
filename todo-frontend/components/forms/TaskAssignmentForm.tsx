"use client";

import { useState, useEffect } from "react";
import { User, CreateTaskDto, TaskPriority, TaskStatus } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { DatePicker } from "../DatePicker";

interface TaskAssignmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: () => void;
}

export function TaskAssignmentForm({
  open,
  onOpenChange,
  onTaskCreated,
}: TaskAssignmentFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTaskDto>({
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    dueDate: "",
    assignedTo: "",
  });

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Task description is required");
      return;
    }

    if (!formData.dueDate) {
      toast.error("Due date is required");
      return;
    }

    try {
      setSubmitting(true);
      await api.createTask({
        ...formData,
        assignedTo: formData.assignedTo || undefined,
      });

      toast.success("Task created and assigned successfully");
      onTaskCreated?.();
      handleClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create task"
      );
      console.error("Error creating task:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      dueDate: "",
      assignedTo: "",
    });
    onOpenChange(false);
  };

  const handleInputChange = (field: keyof CreateTaskDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Set default due date to tomorrow
  useEffect(() => {
    if (open && !formData.dueDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData((prev) => ({
        ...prev,
        dueDate: formatDateForInput(tomorrow),
      }));
    }
  }, [open, formData.dueDate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-description="TaskAssignmentForm"
        className="sm:max-w-[600px]"
      >
        <DialogHeader>
          <DialogTitle>Create & Assign New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description </Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              required
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={async () => {
                  if (!formData.description.trim()) {
                    toast.error("Enter a rough description first");
                    return;
                  }
                  try {
                    toast.info("Generating AI suggestion...");
                    const improved = await api.suggestDescription(
                      formData.description
                    );
                    setFormData((prev) => ({ ...prev, description: improved }));
                    toast.success("AI suggestion applied!");
                  } catch (err) {
                    console.error(err);
                    toast.error("Failed to get AI suggestion");
                  }
                }}
              >
                ✨ Suggest with AI
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                  <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={TaskStatus.IN_PROGRESS}>
                    In Progress
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <DatePicker
              label="Due Date"
              value={formData.dueDate ? new Date(formData.dueDate) : undefined}
              onChange={(date) =>
                handleInputChange(
                  "dueDate",
                  date ? date.toISOString().split("T")[0] : ""
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assign To</Label>
            <Select
              value={formData.assignedTo}
              onValueChange={(value) => handleInputChange("assignedTo", value)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loading ? "Loading users..." : "Select user (optional)"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email} - {user.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || loading}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
