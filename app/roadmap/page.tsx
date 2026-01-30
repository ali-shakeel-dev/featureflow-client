'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { roadmapApi } from '@/lib/api';
import { toast } from 'sonner';
import { Calendar, CheckCircle2, Clock, Zap } from 'lucide-react';

interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'completed';
  target_date: string;
  priority: number;
  idea?: {
    id: string;
    title: string;
  };
}

export default function RoadmapPage() {
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    setLoading(true);
    try {
      const response = await roadmapApi.list(1);
      if (response.data) {
        setRoadmapItems(response.data);
      } else {
        toast.error('Failed to load roadmap');
      }
    } catch (error) {
      toast.error('Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  const groupedByStatus = {
    planned: roadmapItems.filter(i => i.status === 'planned'),
    in_progress: roadmapItems.filter(i => i.status === 'in_progress'),
    completed: roadmapItems.filter(i => i.status === 'completed'),
  };

  const statusConfig = {
    planned: {
      icon: Clock,
      label: 'Planned',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      borderColor: 'border-l-4 border-l-blue-500',
    },
    in_progress: {
      icon: Zap,
      label: 'In Progress',
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      borderColor: 'border-l-4 border-l-amber-500',
    },
    completed: {
      icon: CheckCircle2,
      label: 'Completed',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      borderColor: 'border-l-4 border-l-green-500',
    },
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Public Roadmap</h1>
          <p className="text-muted-foreground mt-2">See what we're building and what's coming next</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading roadmap...</p>
          </div>
        ) : roadmapItems.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No roadmap items yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(groupedByStatus).map(([status, items]) => {
              const config = statusConfig[status as keyof typeof statusConfig];
              const Icon = config.icon;

              return (
                <div key={status} className="space-y-4">
                  {/* Column Header */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">{config.label}</h2>
                      <p className="text-sm text-muted-foreground">{items.length} items</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {items.length > 0 ? (
                      items.map((item) => (
                        <Card
                          key={item.id}
                          className={`bg-card border-border p-4 space-y-3 hover:shadow-md transition-all ${config.borderColor}`}
                        >
                          <h3 className="font-semibold text-foreground line-clamp-2">
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          {item.idea && (
                            <div className="text-xs bg-secondary/50 text-secondary-foreground px-2 py-1 rounded w-fit">
                              Related to: {item.idea.title}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.target_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>

                            {item.priority > 0 && (
                              <div className="flex gap-1">
                                {Array.from({ length: item.priority }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="h-1.5 w-1.5 rounded-full bg-primary"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Nothing here yet
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-foreground">About Our Roadmap</h3>
          <p className="text-sm text-muted-foreground">
            This roadmap shows what we're currently working on and what's planned for the future. Items are organized by status and priority. Your feedback shapes what we build next!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
