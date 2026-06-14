import { apiService } from '../../../shared/services/api';

export interface Post {
  id: string;
  author_id: string;
  author_name?: string;
  title: string;
  content: string;
  is_published: boolean;
  is_liked?: boolean;
  like_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author_name?: string;
  parent_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const postApi = {
  getAllPosts: async (): Promise<{ posts: Post[] }> => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { posts: Post[] };
    }>('/posts');
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  getPostById: async (postId: string): Promise<{ post: Post }> => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { post: Post };
    }>(`/posts/${postId}`);
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  getCommentsByPostId: async (postId: string): Promise<{ comments: Comment[] }> => {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { comments: Comment[] };
    }>(`/posts/${postId}/comments`);
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  createPost: async (data: { title: string; content: string }): Promise<{ post: Post }> => {
    const response = await apiService.post<{
      success: boolean;
      message: string;
      data: { post: Post };
    }>('/posts', data);
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  createComment: async (postId: string, data: { content: string }): Promise<{ comment: Comment }> => {
    const response = await apiService.post<{
      success: boolean;
      message: string;
      data: { comment: Comment };
    }>(`/posts/${postId}/comments`, data);
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  toggleLike: async (postId: string): Promise<{ post: Post }> => {
    const response = await apiService.post<{
      success: boolean;
      message: string;
      data: { post: Post };
    }>(`/posts/${postId}/like`, {});
    if (!response?.data?.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },
};
