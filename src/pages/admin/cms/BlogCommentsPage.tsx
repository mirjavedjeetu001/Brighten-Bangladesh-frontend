import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, MessageSquare, User, Mail, Calendar, Search } from 'lucide-react';
import { commentsApi, BlogComment } from '../../../api/comments';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const BlogCommentsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlog, setSelectedBlog] = useState<string>('all');

  // Fetch all comments (we'll need to add this endpoint)
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['all-comments'],
    queryFn: async () => {
      // For now, we'll fetch comments for all blogs
      // TODO: Create a backend endpoint to get all comments
      const response = await fetch('http://localhost:3000/api/blogs/comments/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => commentsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-comments'] });
      toast.success('Comment deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });

  const handleDelete = (commentId: number, authorName: string) => {
    if (window.confirm(`Are you sure you want to delete the comment by ${authorName}?`)) {
      deleteMutation.mutate(commentId);
    }
  };

  const filteredComments = comments.filter((comment: any) => {
    const matchesSearch = 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comment.author_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comment.author_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBlog = selectedBlog === 'all' || comment.blog?.slug === selectedBlog;
    
    return matchesSearch && matchesBlog;
  });

  // Get unique blog titles for filter
  const blogTitles = Array.from(new Set(comments.map((c: any) => c.blog?.title))).filter(Boolean);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Comments</h1>
          <p className="text-gray-600 mt-1">Manage and moderate blog comments</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MessageSquare className="text-primary-600" size={20} />
          <span className="font-semibold text-gray-700">
            {filteredComments.length} {filteredComments.length === 1 ? 'Comment' : 'Comments'}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search comments, author name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Blog Filter */}
          <select
            value={selectedBlog}
            onChange={(e) => setSelectedBlog(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Blogs</option>
            {blogTitles.map((title: any) => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No comments found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedBlog !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Comments will appear here once users start commenting'}
            </p>
          </div>
        ) : (
          filteredComments.map((comment: any) => (
            <div
              key={comment.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Blog Title */}
                  {comment.blog && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-primary-600">{comment.blog.title}</span>
                    </div>
                  )}

                  {/* Author Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium">
                        {comment.user ? comment.user.name : comment.author_name || 'Anonymous'}
                      </span>
                      {comment.user && (
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                          Member
                        </span>
                      )}
                    </div>
                    {(comment.author_email || comment.user?.email) && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span>{comment.user?.email || comment.author_email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{format(new Date(comment.created_at), 'MMM dd, yyyy hh:mm a')}</span>
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(comment.id, comment.user?.name || comment.author_name || 'Anonymous')}
                  className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete comment"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
