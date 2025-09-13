import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, Eye, Edit } from 'lucide-react';
import { usePosts, Post } from '@/hooks/usePosts';
import { format, isSameDay, startOfDay } from 'date-fns';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ContentCalendarProps {
  selectedProjectId?: string;
}

const platformColors = {
  REDDIT: 'bg-orange-500',
  TWITTER: 'bg-blue-500',
  LINKEDIN: 'bg-blue-700',
  FACEBOOK: 'bg-blue-600',
  INSTAGRAM: 'bg-pink-500',
  TIKTOK: 'bg-black'
};

const statusColors = {
  draft: 'bg-gray-500',
  scheduled: 'bg-blue-500',
  published: 'bg-green-500',
  failed: 'bg-red-500'
};

import { useDroppable } from '@dnd-kit/core';

const DroppableDay = ({ date, children }: { date: Date, children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${date.toISOString()}`,
    data: {
      date,
    },
  });

  return (
    <div ref={setNodeRef} className={`relative w-full h-full ${isOver ? 'bg-accent' : ''}`}>
      {children}
    </div>
  );
};

export const ContentCalendar = ({ selectedProjectId }: ContentCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { posts, isLoading, updatePost } = usePosts(selectedProjectId);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = selectedDatePosts.findIndex(p => p.id === active.id);
      const newIndex = selectedDatePosts.findIndex(p => p.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newPosts = arrayMove(selectedDatePosts, oldIndex, newIndex);
        // Here you would update the order of posts for the day, if that's a feature.
        // For now, we are more interested in dragging between days.
      }
    }
    
    // This is a simplified example. A real implementation would need to handle dropping on a calendar day.
    if (over && over.data.current?.date) {
      const newDate = over.data.current.date;
      const postId = active.id as string;
      const post = posts.find(p => p.id === postId);
      if (post) {
        updatePost({ id: postId, scheduled_at: newDate.toISOString() });
      }
    }
  };

  // Filter posts by date and other criteria
  const getPostsForDate = (date: Date) => {
    return posts.filter(post => {
      // Check if post is scheduled for this date
      const postDate = post.scheduled_at ? new Date(post.scheduled_at) : null;
      const isScheduledForDate = postDate && isSameDay(postDate, date);
      
      // Check if post was published on this date
      const publishedDate = post.published_at ? new Date(post.published_at) : null;
      const isPublishedOnDate = publishedDate && isSameDay(publishedDate, date);
      
      if (!isScheduledForDate && !isPublishedOnDate) return false;
      
      // Apply platform filter
      if (platformFilter !== 'all' && !post.platforms.includes(platformFilter)) return false;
      
      // Apply status filter
      if (statusFilter !== 'all' && post.status !== statusFilter) return false;
      
      return true;
    });
  };

  // Get posts for the selected date
  const selectedDatePosts = getPostsForDate(selectedDate);

  // Get dates that have posts for calendar highlighting
  const getDatesWithPosts = () => {
    const dates: Date[] = [];
    posts.forEach(post => {
      if (post.scheduled_at) {
        dates.push(startOfDay(new Date(post.scheduled_at)));
      }
      if (post.published_at) {
        dates.push(startOfDay(new Date(post.published_at)));
      }
    });
    return dates;
  };

  const datesWithPosts = getDatesWithPosts();

  const renderDayContent = (date: Date) => {
    const dayPosts = getPostsForDate(date);
    if (dayPosts.length === 0) return null;

    return (
      <div className="flex flex-col items-center gap-1 mt-1">
        <div className="flex gap-1 flex-wrap justify-center">
          {dayPosts.slice(0, 3).map((post, index) => (
            <div
              key={post.id}
              className={`w-2 h-2 rounded-full ${statusColors[post.status as keyof typeof statusColors]}`}
            />
          ))}
          {dayPosts.length > 3 && (
            <div className="w-2 h-2 rounded-full bg-gray-400 text-[8px] flex items-center justify-center">
              +
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Calendar</h1>
          <p className="text-muted-foreground">View and manage your scheduled content</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="REDDIT">Reddit</SelectItem>
            <SelectItem value="TWITTER">Twitter</SelectItem>
            <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
            <SelectItem value="FACEBOOK">Facebook</SelectItem>
            <SelectItem value="INSTAGRAM">Instagram</SelectItem>
            <SelectItem value="TIKTOK">TikTok</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(selectedDate, 'MMMM yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                modifiers={{
                  hasPosts: datesWithPosts
                }}
                modifiersStyles={{
                  hasPosts: { 
                    backgroundColor: 'hsl(var(--accent))',
                    borderRadius: '4px'
                  }
                }}
                components={{
                  DayContent: ({ date }) => (
                    <DroppableDay date={date}>
                      <div className="relative w-full h-full">
                        <span>{date.getDate()}</span>
                        {renderDayContent(date)}
                      </div>
                    </DroppableDay>
                  )
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Posts */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {format(selectedDate, 'EEEE, MMMM d')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDatePosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No posts scheduled for this date</p>
                </div>
              ) : (
                <SortableContext items={selectedDatePosts.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {selectedDatePosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </SortableContext>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span>Draft</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Published</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Failed</span>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </DndContext>
    </div>
  );
};

const PostCard = ({ post }: { post: Post }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getTimeString = () => {
    if (post.scheduled_at) {
      return `Scheduled: ${format(new Date(post.scheduled_at), 'h:mm a')}`;
    }
    if (post.published_at) {
      return `Published: ${format(new Date(post.published_at), 'h:mm a')}`;
    }
    return '';
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="border rounded-lg p-3 space-y-2 bg-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {post.title && (
            <h4 className="font-medium text-sm truncate">{post.title}</h4>
          )}
          <p className="text-xs text-muted-foreground line-clamp-2">
            {post.content || 'No content'}
          </p>
        </div>
        <Badge 
          variant="secondary" 
          className={`text-xs ${statusColors[post.status as keyof typeof statusColors]} text-white`}
        >
          {post.status}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {post.platforms.map((platform) => (
            <div
              key={platform}
              className={`w-3 h-3 rounded-full ${platformColors[platform as keyof typeof platformColors]}`}
              title={platform}
            />
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          {getTimeString()}
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </div>
    </div>
  );
};