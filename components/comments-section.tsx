'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { commentsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Send, Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  created_at: string;
}

interface CommentsSectionProps {
  ideaId: string;
}

export function CommentsSection({ ideaId }: CommentsSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [ideaId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await commentsApi.list(ideaId, 1);
      if (response.data) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      const response = await commentsApi.create(ideaId, commentText);
      if (response.data) {
        setComments([response.data, ...comments]);
        setCommentText('');
        toast.success('Comment posted!');
      } else {
        toast.error('Failed to post comment');
      }
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentsApi.delete(ideaId, commentId);
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Discussion ({comments.length})</h2>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="space-y-2">
            <textarea
              placeholder="Share your thoughts..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={submitting}
              className="w-full h-24 px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              maxLength={1000}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{commentText.length}/1000</span>
              <Button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Send className="h-4 w-4" />
                Post Comment
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
          <p className="text-muted-foreground mb-4">Sign in to join the discussion</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{comment.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {isAuthenticated && (user?.id === comment.user.id || user?.admin) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-foreground break-words">{comment.content}</p>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
            <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
