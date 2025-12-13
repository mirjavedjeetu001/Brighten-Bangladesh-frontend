import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { MessageCircle, Trash2, Send, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { commentsApi, CreateCommentDto } from '@/api/comments';
import { useAuthStore } from '@/stores/authStore';
import { canManageContent } from '@/utils/helpers';
import { getImageUrl } from '@/utils/helpers';

interface CommentsSectionProps {
  blogId: number;
  blogSlug: string;
  blogTitle: string;
}

export const CommentsSection = ({ blogId, blogSlug, blogTitle }: CommentsSectionProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['blog-comments', blogId],
    queryFn: () => commentsApi.getComments(blogId),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCommentDto) => commentsApi.createComment(blogId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-comments', blogId] });
      setCommentText('');
      setGuestName('');
      setGuestEmail('');
      toast.success('Comment posted successfully!');
    },
    onError: () => {
      toast.error('Failed to post comment');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: commentsApi.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-comments', blogId] });
      toast.success('Comment deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!isAuthenticated && (!guestName.trim() || !guestEmail.trim())) {
      toast.error('Please enter your name and email');
      return;
    }

    const data: CreateCommentDto = {
      content: commentText,
      ...((!isAuthenticated) && { author_name: guestName, author_email: guestEmail }),
    };

    createMutation.mutate(data);
  };

  const handleShare = (platform: string) => {
    // Use API host (with /api prefix) so share endpoint is reachable; works locally and prod
    const apiBase = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
    const base = apiBase.replace(/\/$/, '');
    const shareUrl = `${base}/share/blog/${blogSlug}`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(blogTitle);

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const canDelete = user && canManageContent(user.role);

  return (
    <div className="space-y-8">
      {/* Social Share Section */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8 shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Share2 className="text-primary-600" size={28} />
            <h3 className="text-xl font-bold text-gray-900">Share this article</h3>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              <Facebook size={20} />
              <span>Facebook</span>
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              <Twitter size={20} />
              <span>Twitter</span>
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              <Linkedin size={20} />
              <span>LinkedIn</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <MessageCircle className="text-primary-600" size={32} />
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
            Comments ({comments.length})
          </h3>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="mb-10 bg-gray-50 rounded-xl p-6 shadow-inner">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-300 resize-none text-base"
            rows={4}
          />
          
          {!isAuthenticated && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your Name"
                className="px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-300"
              />
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="Your Email"
                className="px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-300"
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="mt-4 flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
            {createMutation.isPending ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading comments...</p>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 flex-shrink-0">
                      {comment.user?.profilePhoto ? (
                        <img
                          src={getImageUrl(comment.user.profilePhoto)}
                          alt={comment.user?.name || 'User'}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                          {(comment.user?.name || comment.author_name || 'G').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-gray-900 text-lg">
                          {comment.user?.name || comment.author_name || 'Guest'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => deleteMutation.mutate(comment.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-300"
                      title="Delete comment"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
