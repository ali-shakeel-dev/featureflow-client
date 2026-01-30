'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { IdeaCard } from '@/components/idea-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ideasApi } from '@/lib/api';
import { toast } from 'sonner';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';

interface Idea {
  id: string;
  title: string;
  description: string;
  votes_count: number;
  comments_count?: number;
  category?: string;
  status?: string;
  created_at: string;
  user_has_voted?: boolean;
}

export default function FeedbackBoardPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('trending');

  useEffect(() => {
    loadIdeas();
  }, [statusFilter, categoryFilter, sortBy]);

  const loadIdeas = async () => {
    setLoading(true);
    try {
      let response;
      if (sortBy === 'trending') {
        response = await ideasApi.trending(1);
      } else if (sortBy === 'recent') {
        response = await ideasApi.recent(1);
      } else {
        response = await ideasApi.list({
          status: statusFilter === 'all' ? undefined : statusFilter,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
        });
      }

      if (response.data) {
        setIdeas(response.data);
      } else {
        toast.error('Failed to load ideas');
      }
    } catch (error) {
      toast.error('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  const filteredIdeas = ideas.filter(idea =>
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Feedback Board</h1>
            <p className="text-muted-foreground mt-1">Discover and vote on feature ideas</p>
          </div>
          <Link href="/ideas/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              Submit Idea
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-input">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="popular">Most voted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-input">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-input">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ideas Grid */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading ideas...</p>
            </div>
          ) : filteredIdeas.length > 0 ? (
            <div className="grid gap-4">
              {filteredIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  id={idea.id}
                  title={idea.title}
                  description={idea.description}
                  votesCount={idea.votes_count}
                  commentsCount={idea.comments_count || 0}
                  category={idea.category}
                  status={idea.status}
                  createdAt={idea.created_at}
                  userVoted={idea.user_has_voted || false}
                  onVoteChange={loadIdeas}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">No ideas found</p>
              <Link href="/ideas/new">
                <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Be the first to submit an idea
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
