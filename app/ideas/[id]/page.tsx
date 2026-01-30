'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { CommentsSection } from '@/components/comments-section';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ideasApi } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import { ArrowLeft, ThumbsUp, MessageCircle, Share2, Calendar } from 'lucide-react';
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
  user?: {
    id: string;
    name: string;
    email: string;
  };
  voters?: any[];
}

export default function IdeaDetailPage() {
  const params = useParams();
  const ideaId = params.id as string;
  const { isAuthenticated } = useAuth();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState(0);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    loadIdea();
  }, [ideaId]);

  const loadIdea = async () => {
    setLoading(true);
    try {
      const response = await ideasApi.getById(ideaId);
      if (response.data) {
        setIdea(response.data);
        setVoted(response.data.user_has_voted || false);
        setVotes(response.data.votes_count);
      } else {
        toast.error('Idea not found');
      }
    } catch (error) {
      toast.error('Failed to load idea');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to vote');
      return;
    }

    setVoting(true);
    try {
      if (voted) {
        await ideasApi.unvote(ideaId);
        setVoted(false);
        setVotes(votes - 1);
      } else {
        await ideasApi.vote(ideaId);
        setVoted(true);
        setVotes(votes + 1);
      }
    } catch (error) {
      toast.error('Failed to update vote');
    } finally {
      setVoting(false);
    }
  };

  const statusColors: Record<string, string> = {
    submitted: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const categoryColors: Record<string, string> = {
    feature: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    improvement: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    bug: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!idea) {
    return (
      <DashboardLayout>
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">Idea not found</p>
          <Link href="/board">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Back to board
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <Link href="/board" className="flex items-center gap-2 text-primary hover:text-primary/80">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to board</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground leading-tight">{idea.title}</h1>
              <p className="text-foreground/80 text-lg">{idea.description}</p>

              <div className="flex flex-wrap gap-2">
                {idea.category && (
                  <div className={`text-xs font-medium px-3 py-1 rounded-full ${categoryColors[idea.category] || categoryColors.other}`}>
                    {idea.category.charAt(0).toUpperCase() + idea.category.slice(1)}
                  </div>
                )}
                {idea.status && (
                  <div className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[idea.status] || statusColors.submitted}`}>
                    {idea.status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-6 py-6 border-y border-border">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(idea.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {idea.user && (
                <div>
                  <span className="text-sm text-muted-foreground">Submitted by</span>
                  <p className="font-medium text-foreground">{idea.user.name}</p>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <CommentsSection ideaId={ideaId} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Vote Card */}
            <Card className="bg-card border-border p-6 space-y-4">
              <Button
                onClick={handleVote}
                disabled={voting}
                className={`w-full gap-2 py-6 text-base ${
                  voted
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/90 text-foreground'
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
                {voted ? 'Voted' : 'Vote'}
              </Button>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{votes}</p>
                <p className="text-sm text-muted-foreground">people voted</p>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="bg-card border-border p-6 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Comments</span>
                <span className="font-semibold text-foreground">{idea.comments_count || 0}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="font-semibold text-foreground">
                  {idea.status?.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="font-semibold text-foreground">
                  {idea.category?.charAt(0).toUpperCase() + idea.category?.slice(1)}
                </span>
              </div>
            </Card>

            {/* Share Card */}
            <Card className="bg-card border-border p-6">
              <Button
                variant="outline"
                className="w-full border-border gap-2 bg-transparent"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied!');
                }}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
