"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Task, User, TaskStats, TaskFilters, Role, TaskStatus, UpdateTaskDto } from "@/types";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

import { Search, Target } from "lucide-react";
import { CreateTaskButton } from "./CreateTaskButton";
import { TaskCard } from "./TaskCard";
import { TaskStatsCards } from "./TaskStatsCards";
import { TaskFiltersBar } from "./TaskFiltersBar";
import { BulkActionsBar } from "./BulkActionsBar";

export function TaskDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const isManager = user?.role === Role.MANAGER || user?.role === Role.ADMIN;
  // const isAdmin = user?.role === Role.ADMIN;
  console.log("Current tasks:", tasks);
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [filters, activeTab]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [tasksData, statsData, usersData] = await Promise.all([
        loadTasks(),
        api.getTaskStats(),
        isManager ? api.getUsers() : Promise.resolve([]),
      ]);
console.log(Object.keys(tasksData))
      setStats(statsData);
      if (isManager) {
        setUsers(usersData);
      }
    } catch (error: unknown) {
      toast.error(
        `Failed to load dashboard data ${
          error instanceof Error ? error.message : ""
        } `
      );
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      let tasksData: Task[];

      if (activeTab === "my-tasks") {
        tasksData = await api.getMyTasks();
      } else {
        tasksData = await api.getTasks(filters);
      }

      // Apply search filter
      if (searchQuery) {
        tasksData = tasksData.filter(
          (task) =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setTasks(tasksData);
      return tasksData;
    } catch (error: unknown) {
      toast.error(
        `Failed to load dashboard data ${
          error instanceof Error ? error.message : ""
        } `
      );

      return [];
    }
  };

  const handleTaskCreated = () => {
    loadTasks();
    loadStats();
  };

  const loadStats = async () => {
    try {
      const statsData = await api.getTaskStats();
      setStats(statsData);
    } catch (error:unknown) {
      toast.error(`Failed to load statistics:  ${error instanceof Error?error.message:""}`);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: UpdateTaskDto) => {
    try {
      await api.updateTask(taskId, updates);
      toast.success("Task updated successfully");
      loadTasks();
      loadStats();
    } catch (error:unknown) {
      toast.error(`Failed to update task ${error instanceof Error?error.message:""}`);
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      toast.success("Task deleted successfully");
      loadTasks();
      loadStats();
    } catch (error:unknown) {
      toast.error(`Failed to delete task  ${error instanceof Error?error.message:""}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;

    try {
      await api.bulkDeleteTasks(selectedTasks);
      toast.success(`${selectedTasks.length} tasks deleted successfully`);
      setSelectedTasks([]);
      loadTasks();
      loadStats();
    } catch (error:unknown) {
      toast.error(`Failed to delete tasks  ${error instanceof Error?error.message:""}`);
    }
  };

  const handleTaskSelect = (taskId: string, selected: boolean) => {
    if (selected) {
      setSelectedTasks((prev) => [...prev, taskId]);
    } else {
      setSelectedTasks((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTasks(tasks.map((task) => task._id));
    } else {
      setSelectedTasks([]);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "pending") return task.status === TaskStatus.PENDING;
    if (activeTab === "in-progress")
      return task.status === TaskStatus.IN_PROGRESS;
    if (activeTab === "completed") return task.status === TaskStatus.COMPLETED;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Task Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            {isManager
              ? "Manage and oversee all team tasks"
              : "Track your assigned tasks and progress"}
          </p>
        </div>

        {isManager && (
          <CreateTaskButton onTaskCreated={handleTaskCreated} users={users} />
        )}
      </div>

      {/* Statistics Cards */}
      {stats && <TaskStatsCards stats={stats} />}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <TaskFiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          users={users}
          isManager={isManager}
        />
      </div>

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && isManager && (
        <BulkActionsBar
          selectedCount={selectedTasks.length}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedTasks([])}
        />
      )}

      {/* Tasks Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-500 text-center">
                  {activeTab === "my-tasks"
                    ? "You don't have any tasks assigned yet."
                    : "No tasks match your current filters."}
                </p>
                {isManager && activeTab === "all" && (
                  <CreateTaskButton
                    onTaskCreated={handleTaskCreated}
                    users={users}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {/* Select All Checkbox for Managers */}
              {isManager && filteredTasks.length > 0 && (
                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedTasks.length === filteredTasks.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">
                    Select all ({filteredTasks.length} tasks)
                  </span>
                </div>
              )}

              {/* Task Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task._id ?? task.createdAt}
                    task={task}
                    onUpdate={handleTaskUpdate}
                    onDelete={handleTaskDelete}
                    onSelect={handleTaskSelect}
                    isSelected={selectedTasks.includes(task._id)}
                    showSelect={isManager}
                    canEdit={
                      isManager ||
                      user?.id ===
                        (typeof task.assignedTo === "string"
                          ? task.assignedTo
                          : task.assignedTo &&
                            typeof task.assignedTo === "object"
                          ? task.assignedTo._id
                          : "")
                    }
                    canDelete={
                      isManager ||
                      user?.id ===
                        (typeof task.createdBy === "string"
                          ? task.createdBy
                          : task.createdBy && typeof task.createdBy === "object"
                          ? task.createdBy._id
                          : "")
                    }
                    users={users}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
