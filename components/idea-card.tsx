'use client';

import React from "react"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { ideasApi } from '@/lib/api';
import { toast } from 'sonner';
import { useState } from 'react';

interface IdeaCardProps {
  id: string;
  title: string;
  description: string;
  votesCount: number;
  commentsCount?: number;
  category?: string;
  status?: string;
  createdAt: string;
  userVoted?: boolean;
  onVoteChange?: () => void;
}

export function IdeaCard({
  id,
  title,
  description,
  votesCount,
  commentsCount = 0,
  category,
  status = 'submitted',
  createdAt,
  userVoted = false,
  onVoteChange,
}: IdeaCardProps) {
  const { isAuthenticated } = useAuth();
  const [voted, setVoted] = useState(userVoted);
  const [votes, setVotes] = useState(votesCount);
  const [loading, setLoading] = useState(false);

  const statusColors: Record<string, string> = {
    submitted: 'bg-muted/50 text-muted-foreground',
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

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to vote');
      return;
    }

    setLoading(true);
    try {
      if (voted) {
        await ideasApi.unvote(id);
        setVoted(false);
        setVotes(votes - 1);
      } else {
        await ideasApi.vote(id);
        setVoted(true);
        setVotes(votes + 1);
      }
      onVoteChange?.();
    } catch (error) {
      toast.error('Failed to update vote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link href={`/ideas/${id}`}>
      <div className="rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer p-6 space-y-4">
        {/* Header with status */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground line-clamp-2">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          </div>
          {status && status !== 'submitted' && (
            <div className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${statusColors[status] || statusColors.submitted}`}>
              {status.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
            </div>
          )}
        </div>

        {/* Category and metadata */}
        <div className="flex items-center gap-2 flex-wrap">
          {category && (
            <div className={`text-xs font-medium px-2 py-1 rounded ${categoryColors[category] || categoryColors.other}`}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </div>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Footer with votes and comments */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVote}
              disabled={loading}
              className={`h-8 gap-2 ${voted ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-muted-foreground'}`}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="text-sm font-medium">{votes}</span>
            </Button>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{commentsCount}</span>
            </div>
          </div>
          {votes > 20 && (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Trending</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
