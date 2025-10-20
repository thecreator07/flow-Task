'use client';

import { TaskFilters, TaskStatus, TaskPriority, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface TaskFiltersBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  users: User[];
  isManager: boolean;
}

export function TaskFiltersBar({ filters, onFiltersChange, users, isManager }: TaskFiltersBarProps) {
  const updateFilter = (key: keyof TaskFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status Filter */}
        <Select
          value={filters.status || ''}
          onValueChange={(value) => updateFilter('status', value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Status">All Status</SelectItem>
            <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
            <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority || ''}
          onValueChange={(value) => updateFilter('priority', value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Priority">All Priority</SelectItem>
            <SelectItem value={TaskPriority.HIGH}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                High
              </div>
            </SelectItem>
            <SelectItem value={TaskPriority.MEDIUM}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                Medium
              </div>
            </SelectItem>
            <SelectItem value={TaskPriority.LOW}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Low
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Assigned To Filter (Manager only) */}
        {isManager && (
          <Select
            value={filters.assignedTo || ''}
            onValueChange={(value) => updateFilter('assignedTo', value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Assigned to" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Assignees">All Assignees</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    {user.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Created By Filter (Manager only) */}
        {isManager && (
          <Select
            value={filters.createdBy || ''}
            onValueChange={(value) => updateFilter('createdBy', value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Created by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Creators">All Creators</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    {user.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Active Filters and Clear Button */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Filter className="w-3 h-3 mr-1" />
            {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
