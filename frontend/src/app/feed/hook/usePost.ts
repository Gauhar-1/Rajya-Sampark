import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

// ==========================================
// 1. AXIOS INSTANCE & INTERCEPTOR
// ==========================================
const API_BASE = `${process.env.NEXT_PUBLIC_NEXT_API_URL}/post` || 'http://localhost:3000/api/post';

// Create a custom instance of Axios
const apiClient = axios.create({
  baseURL: API_BASE,
});

// Attach the interceptor to inject the Bearer token
apiClient.interceptors.request.use(
  (config) => {
    // Check if we are running in the browser to avoid SSR errors
    if (typeof window !== 'undefined') {
      // ⚠️ UPDATE THIS LINE based on where you store your token!
      // Examples: localStorage.getItem('token'), Cookies.get('token'), etc.
      const token = localStorage.getItem('token'); 
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// 2. API CALL FUNCTIONS
// ==========================================
const api = {
  getFeed: async () => {
    // Notice how clean the URLs are now since we used baseURL above!
    const { data } = await apiClient.get('/'); 
    return data.data.allFeed; 
  },
  getPostById: async (id: string) => {
    const { data } = await apiClient.get(`/${id}`);
    return data.data.post;
  },
  getComments: async (id: string) => {
    const { data } = await apiClient.get(`/${id}/comment`);
    return data.data.comments;
  },
  createPost: async (postData: { content?: string; itemType: string; mediaUrl?: string }) => {
    const { data } = await apiClient.post('/', postData);
    return data.data.populatedPost;
  },
  createPoll: async (pollData: { pollQuestion: string; pollOptions: string[] }) => {
    const { data } = await apiClient.post('/poll', pollData);
    return data.data.populatedPoll;
  },
  votePoll: async ({ id, optionId }: { id: string; optionId: string }) => {
    const { data } = await apiClient.patch(`/${id}/vote`, { optionId });
    return data.data.poll;
  },
  postComment: async (commentData: { content: string; timestamp: string; postId: string }) => {
    const { data } = await apiClient.post('/comment', commentData);
    return data.data.populatedComment;
  },
  updateLikes: async ({ id, action }: { id: string; action: 'like' | 'unlike' }) => {
    const { data } = await apiClient.patch(`/${id}/like`, { action });
    return data.data.likeCount;
  },
  deletePost: async (id: string) => {
    await apiClient.delete(`/${id}/delete`);
    return id;
  },
  infiniteFeed: async ({ pageParam = 1 }) => {
    const res = await apiClient.get(`/?page=${pageParam}&limit=12`);
    console.log("res", res.data.data);
    return res.data.data.paginatedFeed;
  },
};

// ==========================================
// 3. REACT QUERY HOOKS
// ==========================================

export const useInfiniteFeed = () => {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: api.infiniteFeed,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.length >= 10 ? allPages.length + 1 : undefined;
    },
  });
};

export const useFeed = () => {
  return useQuery({
    queryKey: ['feed'],
    queryFn: api.getFeed,
  });
};

export const usePostById = (id: string) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => api.getPostById(id),
    enabled: !!id, 
  });
};

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => api.getComments(postId),
    enabled: !!postId,
  });
};

// --- MUTATIONS (Modifying Data) ---

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};

export const useCreatePoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createPoll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};

export const useVotePoll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.votePoll,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.id] });
    },
  });
};

export const usePostComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.postComment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
    },
  });
};

export const useUpdateLikes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateLikes,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['post', variables.id] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};