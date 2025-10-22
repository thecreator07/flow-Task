"use client";

import { useEffect, useState } from "react";
import { Task, TaskUser } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, CheckSquare, Clock, TrendingUp } from "lucide-react";
import { TeamsSkeleton } from "@/components/ui/loading-skeletons";

interface TeamStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  completionRate: number;
}

export default function TeamsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const tasksData = await api.getTasks();
      setTasks(tasksData);

      // Calculate team statistics
      const stats: TeamStats = {
        totalTasks: tasksData.length,
        completedTasks: tasksData.filter((t) => t.status === "COMPLETED")
          .length,
        inProgressTasks: tasksData.filter((t) => t.status === "IN_PROGRESS")
          .length,
        pendingTasks: tasksData.filter((t) => t.status === "PENDING").length,
        completionRate:
          tasksData.length > 0
            ? (tasksData.filter((t) => t.status === "COMPLETED").length /
                tasksData.length) *
              100
            : 0,
      };
      setTeamStats(stats);
    } catch (error: unknown) {
      toast.error(
        `${error instanceof Error ? error.message : "error during STATS"}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Group tasks by assigned user
  const { tasksByUser, usersById } = tasks.reduce(
    (acc, task) => {
      const assigned = task.assignedTo;
      let userId = "unassigned";
      let name: string | undefined;
      let email: string | undefined;

      if (typeof assigned === "string") {
        userId = assigned;
      } else if (assigned && typeof assigned === "object") {
        userId = (assigned as TaskUser)._id ?? "unassigned";
        name = (assigned as TaskUser).name;
        email = (assigned as TaskUser).email;
      }

      if (!acc.tasksByUser[userId]) acc.tasksByUser[userId] = [];
      acc.tasksByUser[userId].push(task);

      if (!acc.usersById[userId]) {
        acc.usersById[userId] = { id: userId, name, email };
      } else {
        // populate missing fields if later tasks include them
        if (!acc.usersById[userId].name && name)
          acc.usersById[userId].name = name;
        if (!acc.usersById[userId].email && email)
          acc.usersById[userId].email = email;
      }

      return acc;
    },
    {
      tasksByUser: {} as Record<string, Task[]>,
      usersById: {} as Record<
        string,
        { id: string; name?: string; email?: string }
      >,
    }
  );

  if (loading) {
    return <TeamsSkeleton />;
  }

  const statCards = [
    {
      title: "Total Tasks",
      value: teamStats?.totalTasks || 0,
      icon: CheckSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "In Progress",
      value: teamStats?.inProgressTasks || 0,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Completed",
      value: teamStats?.completedTasks || 0,
      icon: CheckSquare,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Completion Rate",
      value: `${Math.round(teamStats?.completionRate || 0)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
        <p className="text-gray-600">
          Overview of team performance and task distribution
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Team Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            Team completion rate across all tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Completed Tasks</span>
                <span>
                  {teamStats?.completedTasks} / {teamStats?.totalTasks}
                </span>
              </div>
              <Progress
                value={teamStats?.completionRate || 0}
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {teamStats?.pendingTasks}
                </div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {teamStats?.inProgressTasks}
                </div>
                <div className="text-sm text-gray-500">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {teamStats?.completedTasks}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Distribution by User  */}

      <Card>
        <CardHeader>
          <CardTitle>Task Distribution</CardTitle>
          <CardDescription>Tasks assigned to each team member</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(tasksByUser).length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tasks assigned
              </h3>
              <p className="text-gray-600">
                No tasks have been assigned to team members yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(tasksByUser).map(([userId, userTasks]) => {
                const completed = userTasks.filter(
                  (t) => t.status === "COMPLETED"
                ).length;
                const inProgress = userTasks.filter(
                  (t) => t.status === "IN_PROGRESS"
                ).length;
                const pending = userTasks.filter(
                  (t) => t.status === "PENDING"
                ).length;
                const completionRate =
                  userTasks.length > 0
                    ? (completed / userTasks.length) * 100
                    : 0;

                const userInfo = usersById[userId];
                const displayName =
                  userInfo?.name || userInfo?.email || "Unassigned";

                return (
                  <div key={userId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {displayName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {userTasks.length} total tasks
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {Math.round(completionRate)}%
                        </div>
                        <div className="text-sm text-gray-600">Completion</div>
                      </div>
                    </div>
                    <Progress value={completionRate} className="h-2 mb-3" />
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary">{pending}</Badge>
                        <span>Pending</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className="bg-orange-100 text-orange-800">
                          {inProgress}
                        </Badge>
                        <span>In Progress</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className="bg-green-100 text-green-800">
                          {completed}
                        </Badge>
                        <span>Completed</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
