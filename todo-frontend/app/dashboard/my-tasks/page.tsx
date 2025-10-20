"use client";

import { useEffect, useState } from "react";
import { Task, TaskStatus, Role, TaskPriority } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar, User as UserIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { TaskListSkeleton } from "@/components/ui/loading-skeletons";
import { TaskAssignmentForm } from "@/components/forms/TaskAssignmentForm";
import { useAuth } from "@/lib/auth";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  // const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const {user}=useAuth()
  useEffect(() => {
    
    fetchTasks();
    fetchCurrentUser();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await api.getMyTasks();
      setTasks(data);
    } catch (er: unknown) {
      if (er instanceof Error) {
        toast.error(`Failed to fetch tasks: ${er.message}`);
      } else {
        toast.error("Failed to fetch tasks");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.success && response.user) {
        // setCurrentUser(response.user);

      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    try {
      await api.updateTask(taskId, { status });
      setTasks(
        tasks.map((task: Task) =>
          ((task as Task)._id as string) === taskId ? { ...task, status } : task
        )
      );
      toast.success("Task status updated");
    } catch (error: unknown) {
      toast.error(
        `${
          error instanceof Error
            ? "task updation failed"
            : "task updation failed"
        }`
      );
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "bg-red-100 text-red-800";
      case TaskPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case TaskPriority.LOW:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case TaskStatus.PENDING:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter.toUpperCase();
  });

  if (loading) {
    return <TaskListSkeleton />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600">Manage your assigned tasks</p>
        </div>
        {/* {(currentUser?.role === Role.ADMIN || currentUser?.role === Role.MANAGER) && ( */}
        {user?.role!==Role.USER &&
          <Button onClick={() => setShowTaskForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        }
        {/* )} */}
      </div>

      <div className="mb-6">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 text-center">
              {filter === "all"
                ? "You don't have any tasks assigned yet."
                : `No ${filter.replace("_", " ")} tasks found.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task: Task) => (
            <Card key={task._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {task.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                    </div>
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      Created:{" "}
                      {format(new Date(task.createdAt), "MMM dd, yyyy")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {task.status === TaskStatus.PENDING && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateTaskStatus(task._id, TaskStatus.IN_PROGRESS)
                        }
                      >
                        Start Task
                      </Button>
                    )}
                    {task.status === TaskStatus.IN_PROGRESS && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateTaskStatus(task._id, TaskStatus.COMPLETED)
                        }
                      >
                        Complete
                      </Button>
                    )}
                    {task.status === TaskStatus.COMPLETED && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateTaskStatus(task._id, TaskStatus.IN_PROGRESS)
                        }
                      >
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TaskAssignmentForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        onTaskCreated={fetchTasks}
      />
    </div>
  );
}
