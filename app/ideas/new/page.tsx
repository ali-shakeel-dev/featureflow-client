'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ideasApi } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewIdeaPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('feature');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (title.length < 5) {
      toast.error('Title must be at least 5 characters');
      return;
    }

    if (description.length < 20) {
      toast.error('Description must be at least 20 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await ideasApi.create(title, description, category);
      if (response.data) {
        toast.success('Idea submitted successfully!');
        router.push(`/ideas/${response.data.id}`);
      } else {
        toast.error(response.errors?.[0] || 'Failed to submit idea');
      }
    } catch (error) {
      toast.error('Failed to submit idea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link href="/board" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to board</span>
        </Link>

        {/* Form */}
        <div className="bg-card rounded-lg border border-border p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Share Your Idea</h1>
            <p className="text-muted-foreground mt-2">Help shape our product roadmap</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground font-semibold">
                Idea Title
              </Label>
              <Input
                id="title"
                placeholder="A clear, concise title for your idea"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                className="bg-input text-foreground"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/200
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground font-semibold">
                Description
              </Label>
              <textarea
                id="description"
                placeholder="Describe your idea in detail. What problem does it solve? How would you like to see it implemented?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                className="w-full h-32 px-4 py-3 rounded-md border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/5000
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground font-semibold">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory} disabled={loading}>
                <SelectTrigger className="bg-input">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t border-border">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? 'Submitting...' : 'Submit Idea'}
              </Button>
              <Link href="/board" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border bg-transparent"
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </form>

          {/* Tips */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2 border border-border">
            <h3 className="font-semibold text-sm text-foreground">Tips for a great idea</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Be specific and clear about your idea</li>
              <li>Explain the problem you're trying to solve</li>
              <li>Describe the benefits and use cases</li>
              <li>Check if similar ideas already exist</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
