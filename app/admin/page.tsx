'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { Trash2, CheckCircle2, Clock, AlertCircle, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Idea {
  id: string;
  title: string;
  description: string;
  votes_count: number;
  status: string;
  category: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  created_at: string;
}

const statusOptions = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

const statusColors: Record<string, string> = {
  submitted: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    planned: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    if (!user?.admin) {
      router.push('/dashboard');
      return;
    }
    loadIdeas();
  }, [user, router]);

  const loadIdeas = async () => {
    setLoading(true);
    try {
      const response = await adminApi.ideasList(1);
      if (response.data) {
        setIdeas(response.data);
        
        // Calculate stats
        const total = response.data.length;
        const submitted = response.data.filter(i => i.status === 'submitted').length;
        const planned = response.data.filter(i => i.status === 'planned').length;
        const inProgress = response.data.filter(i => i.status === 'in_progress').length;
        const completed = response.data.filter(i => i.status === 'completed').length;
        
        setStats({ total, submitted, planned, inProgress, completed });
      }
    } catch (error) {
      toast.error('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ideaId: string, newStatus: string) => {
    setUpdatingId(ideaId);
    try {
      const response = await adminApi.changeIdeaStatus(ideaId, newStatus);
      if (response.data) {
        setIdeas(ideas.map(idea => idea.id === ideaId ? { ...idea, status: newStatus } : idea));
        toast.success('Idea status updated');
        loadIdeas();
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (ideaId: string) => {
    if (!confirm('Are you sure? This cannot be undone.')) {
      return;
    }

    try {
      await adminApi.ideaDelete(ideaId);
      setIdeas(ideas.filter(idea => idea.id !== ideaId));
      toast.success('Idea deleted');
      loadIdeas();
    } catch (error) {
      toast.error('Failed to delete idea');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage ideas and moderate community feedback</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4 bg-card border-border space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Ideas</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </Card>
          <Card className="p-4 bg-card border-border space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Submitted</p>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-400">{stats.submitted}</p>
          </Card>
          <Card className="p-4 bg-card border-border space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Planned</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.planned}</p>
          </Card>
          <Card className="p-4 bg-card border-border space-y-2">
            <p className="text-sm font-medium text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.inProgress}</p>
          </Card>
          <Card className="p-4 bg-card border-border space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.completed}</p>
          </Card>
        </div>

        {/* Ideas Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">All Ideas</h2>

          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : ideas.length === 0 ? (
            <p className="text-muted-foreground">No ideas yet</p>
          ) : (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-foreground">Title</th>
                      <th className="text-left p-4 font-semibold text-foreground">Votes</th>
                      <th className="text-left p-4 font-semibold text-foreground">Author</th>
                      <th className="text-left p-4 font-semibold text-foreground">Status</th>
                      <th className="text-left p-4 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ideas.map((idea) => (
                      <tr key={idea.id} className="border-t border-border hover:bg-muted/30">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">
                              {idea.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {idea.description}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-foreground font-medium">{idea.votes_count}</td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-foreground">{idea.user.name}</p>
                            <p className="text-xs text-muted-foreground">{idea.user.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Select
                            value={idea.status}
                            onValueChange={(value) => handleStatusChange(idea.id, value)}
                            disabled={updatingId === idea.id}
                          >
                            <SelectTrigger className={`w-32 ${statusColors[idea.status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDelete(idea.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
