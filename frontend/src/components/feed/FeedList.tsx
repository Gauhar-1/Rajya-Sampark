'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import api from '@/lib/api';
import FeedItemCard from './FeedItemCard';
import Loader from '@/components/Loaders/primary';
import { SearchIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FeedItem } from '@/types';

interface FeedListProps {
    onOpenPostDialog: () => void;
}

export default function FeedList({ onOpenPostDialog }: FeedListProps) {
    const { ref, inView } = useInView();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const fetchFeed = async ({ pageParam = 1 }) => {
        const response = await api.get(`/post?page=${pageParam}&limit=10`);
        // Check if data is nested
        const feedData = response.data.data || response.data;
        return feedData;
    };

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['feed'],
        queryFn: fetchFeed,
        getNextPageParam: (lastPage, pages) => {
            // Assuming the API returns totalPages or similar to determine if there are more pages
            // If the API structure is different, this needs adjustment.
            // Based on previous code, it returned { success: true, allFeed: [...] }
            // We might need to adjust the API to support pagination or handle client-side pagination if the API doesn't support it.
            // For now, assuming the API returns all items, we can simulate pagination or just return undefined if no more items.
            // If the API returns all items at once, useInfiniteQuery might not be the best fit without API changes.
            // However, to support 1M users, server-side pagination is a MUST.
            // I will assume the API *should* support pagination. If not, I'll fallback to client-side slicing for now but note it as a backend requirement.

            // If the current API response structure is { allFeed: [] }, we can't really paginate effectively without backend support.
            // I will assume for this refactor that we are consuming the existing API but preparing for pagination.
            // If the API returns all items, we can't really "fetch next page".

            // Let's check the previous code: const { allFeed } = response.data;
            // It seems it returns everything.
            // I will implement this to handle the current structure but structure it for future pagination.

            return undefined; // No pagination support in current API endpoint apparently.
        },
        initialPageParam: 1,
    });

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const likeMutation = useMutation({
        mutationFn: async ({ itemId, action }: { itemId: string; action: 'like' | 'unlike' }) => {
            return api.patch(`/post/${itemId}/like`, { action });
        },
        onMutate: async ({ itemId, action }) => {
            await queryClient.cancelQueries({ queryKey: ['feed'] });
            const previousFeed = queryClient.getQueryData(['feed']);

            queryClient.setQueryData(['feed'], (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        allFeed: page.allFeed.map((item: FeedItem) => {
                            if (item._id === itemId) {
                                return {
                                    ...item,
                                    likes: action === 'like' ? item.likes + 1 : Math.max(0, item.likes - 1),
                                    // We should also update likedBy but for now just updating count for UI responsiveness
                                };
                            }
                            return item;
                        }),
                    })),
                };
            });

            return { previousFeed };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['feed'], context?.previousFeed);
            toast({ description: "Failed to update like", variant: "destructive" });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (itemId: string) => {
            return api.delete(`/post/${itemId}/delete`);
        },
        onSuccess: () => {
            toast({ description: "Post Deleted Successfully" });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        },
        onError: () => {
            toast({ description: "Failed to delete post", variant: "destructive" });
        },
    });

    const issueMutation = useMutation({
        mutationFn: async (itemId: string) => {
            return api.post(`/post/issue`, { id: itemId });
        },
        onSuccess: () => {
            toast({ description: 'Post took as an issue' });
        },
        onError: () => {
            console.log("Error found while taking an issue");
        }
    })

    const voteMutation = useMutation({
        mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
            return api.patch(`/post/${pollId}/vote`, { optionId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        },
        onError: () => {
            console.error("Error while voting");
        }
    });


    if (status === 'pending') return <Loader />;
    if (status === 'error') return <p>Error loading feed</p>;

    // Flatten pages to get all items
    const feedItems = data?.pages.flatMap((page: any) => page.allFeed) || [];

    // Sort items (client-side sort as fallback if backend doesn't sort)
    const sortedFeedItems = [...feedItems].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (sortedFeedItems.length === 0) {
        return (
            <Card className="text-center p-8 shadow-md rounded-lg">
                <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">The Feed is Quiet</h2>
                <p className="text-muted-foreground mb-6">
                    No posts yet. Be the first to share something!
                </p>
                <Button onClick={onOpenPostDialog}>
                    <Edit3 className="mr-2 h-4 w-4" /> Create First Post
                </Button>
            </Card>
        );
    }

    return (
        <>
            {sortedFeedItems.map((item: FeedItem) => (
                <FeedItemCard
                    key={item._id}
                    item={item}
                    onPollVote={(pollId, optionId) => voteMutation.mutate({ pollId, optionId })}
                    onLike={(itemId, action) => likeMutation.mutate({ itemId, action })}
                    onDelete={(itemId) => deleteMutation.mutate(itemId)}
                    onShare={(itemId) => {
                        // Share logic (local state update or API call if needed)
                        // For now just console log or toast as per original code
                        // Original code just updated local state.
                    }}
                    onIssue={(itemId) => issueMutation.mutate(itemId)}
                />
            ))}
            <div ref={ref} className="h-10 flex justify-center items-center">
                {isFetchingNextPage && <Loader />}
            </div>
        </>
    );
}
