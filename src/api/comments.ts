import api from './client';

export interface BlogComment {
  id: number;
  content: string;
  author_name: string | null;
  author_email: string | null;
  user_id: number | null;
  blog_id: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateCommentDto {
  content: string;
  author_name?: string;
  author_email?: string;
}

export const commentsApi = {
  getComments: async (blogId: number): Promise<BlogComment[]> => {
    const response = await api.get(`/blogs/${blogId}/comments`);
    return response.data;
  },

  createComment: async (blogId: number, data: CreateCommentDto): Promise<BlogComment> => {
    const response = await api.post(`/blogs/${blogId}/comments`, data);
    return response.data;
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/blogs/comments/${commentId}`);
  },
};
