import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { blogsApi } from '@/api/blogs';
import { Loader } from '@/components/Loader';
import { Badge } from '@/components/Badge';
import { CommentsSection } from '@/components/CommentsSection';
import { formatDate } from '@/utils/helpers';
import { ArrowLeft, Calendar, Eye, Heart } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { SEO } from '@/components/SEO';

export const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuthStore();
  const [likeState, setLikeState] = useState<{ likes: number; liked: boolean }>({ likes: 0, liked: false });
  const [views, setViews] = useState<number>(0);

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => blogsApi.getBySlug(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    if (blog) {
      setLikeState({ likes: blog.likesCount || 0, liked: !!blog.likedByMe });
      setViews(blog.viewCount || 0);
      blogsApi.incrementView(blog.id).then((res) => setViews(res.views)).catch(() => {});
    }
  }, [blog]);

  const toggleLike = async () => {
    if (!blog) return;
    if (!isAuthenticated) {
      alert('Please sign in to like this blog.');
      return;
    }
    try {
      const res = await blogsApi.toggleLike(blog.id);
      setLikeState({ likes: res.likes, liked: res.liked });
    } catch (err) {
      console.error('Failed to toggle like', err);
    }
  };

  if (isLoading) return <Loader />;
  if (error || !blog) return <div>Blog not found</div>;

  const plainText = (blog.content || '').replace(/<[^>]+>/g, ' ');
  const description = blog.summary || plainText.slice(0, 160);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : undefined;

  return (
    <>
      <SEO
        title={blog.title}
        description={description}
        image={blog.coverImage}
        url={pageUrl}
        type="article"
      />
      <div className="container mx-auto px-4 py-12">
      <Link to="/blogs" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft size={20} className="mr-2" />
        Back to Blogs
      </Link>

      <article className="max-w-4xl mx-auto">
        {blog.coverImage && (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <Badge status={blog.status}>{blog.status}</Badge>
          <div className="flex items-center text-gray-600">
            <Calendar size={16} className="mr-2" />
            {formatDate(blog.createdAt)}
          </div>
          <div className="flex items-center text-gray-600 gap-2">
            <Eye size={16} />
            <span>{views}</span>
          </div>
          <button
            onClick={toggleLike}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border transition ${
              likeState.liked ? 'border-rose-500 text-rose-600 bg-rose-50' : 'border-gray-200 text-gray-700'
            }`}
          >
            <Heart size={16} fill={likeState.liked ? '#e11d48' : 'none'} />
            <span>{likeState.likes}</span>
          </button>
          {blog.author && (
            <div className="flex items-center text-gray-600">
              <img
                src={
                  blog.author.profilePhoto
                    ? (blog.author.profilePhoto.startsWith('data:image') || blog.author.profilePhoto.startsWith('http') 
                      ? blog.author.profilePhoto 
                      : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://brightenbangladesh.com'}${blog.author.profilePhoto}`)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author.name)}&background=166534&color=fff&size=64`
                }
                alt={blog.author.name}
                className="w-6 h-6 rounded-full object-cover mr-2 border border-gray-300"
              />
              {blog.author.name}
            </div>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-6">{blog.title}</h1>

        {blog.summary && (
          <p className="text-xl text-gray-600 mb-8 italic">{blog.summary}</p>
        )}

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {blog.author && (
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-2">About the Author</h3>
            <div className="flex items-center space-x-4">
              <img
                src={
                  blog.author.profilePhoto
                    ? (blog.author.profilePhoto.startsWith('data:image') || blog.author.profilePhoto.startsWith('http') 
                      ? blog.author.profilePhoto 
                      : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://brightenbangladesh.com'}${blog.author.profilePhoto}`)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author.name)}&background=166534&color=fff&size=128`
                }
                alt={blog.author.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
              <div>
                <p className="font-medium">{blog.author.name}</p>
                {blog.author.organization && (
                  <p className="text-gray-600">{blog.author.organization}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Comments & Social Share Section */}
        <div className="mt-16">
          <CommentsSection 
            blogId={blog.id} 
            blogSlug={blog.slug}
            blogTitle={blog.title}
          />
        </div>
      </article>
      </div>
    </>
  );
};
