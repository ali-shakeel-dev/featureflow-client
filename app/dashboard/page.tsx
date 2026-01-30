'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { DashboardLayout } from '@/components/dashboard-layout';
import { IdeaCard } from '@/components/idea-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ideasApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, TrendingUp, MessageSquare, Award } from 'lucide-react';
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

interface Stats {
  totalIdeas: number;
  userIdeas: number;
  userVotes: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [trendingIdeas, setTrendingIdeas] = useState<Idea[]>([]);
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ totalIdeas: 0, userIdeas: 0, userVotes: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trending, recent, allIdeas] = await Promise.all([
        ideasApi.trending(1),
        ideasApi.recent(1),
        ideasApi.list(),
      ]);

      if (trending.data) {
        setTrendingIdeas(trending.data.slice(0, 3));
      }
      if (recent.data) {
        setRecentIdeas(recent.data.slice(0, 3));
      }
      if (allIdeas.data) {
        setStats({
          totalIdeas: allIdeas.data.length,
          userIdeas: 0,
          userVotes: allIdeas.data.filter(i => i.user_has_voted).length,
        });
      }
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Shape the future by voting on features that matter</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-card border-border space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Ideas</p>
              <Award className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.totalIdeas}</p>
          </Card>
          <Card className="p-6 bg-card border-border space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Your Votes</p>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.userVotes}</p>
          </Card>
          <Card className="p-6 bg-card border-border space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Community Activity</p>
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">Active</p>
          </Card>
        </div>

        {/* Action Button */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Have an idea?</h3>
            <p className="text-sm text-muted-foreground">Share your feedback with the community</p>
          </div>
          <Link href="/ideas/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="h-4 w-4" />
              Submit Idea
            </Button>
          </Link>
        </div>

        {/* Trending Ideas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Trending This Week</h2>
            <Link href="/board">
              <Button variant="ghost" className="text-primary">
                View all
              </Button>
            </Link>
          </div>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : trendingIdeas.length > 0 ? (
            <div className="grid gap-4">
              {trendingIdeas.map((idea) => (
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
                  onVoteChange={loadData}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No trending ideas yet</p>
          )}
        </div>

        {/* Recent Ideas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Recently Added</h2>
            <Link href="/board">
              <Button variant="ghost" className="text-primary">
                View all
              </Button>
            </Link>
          </div>
          {recentIdeas.length > 0 ? (
            <div className="grid gap-4">
              {recentIdeas.map((idea) => (
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
                  onVoteChange={loadData}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent ideas</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
