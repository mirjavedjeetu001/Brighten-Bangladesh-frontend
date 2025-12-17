import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { blogsApi } from '@/api/blogs';
import { Loader } from '@/components/Loader';
import { Badge } from '@/components/Badge';
import { CommentsSection } from '@/components/CommentsSection';
import { formatDate } from '@/utils/helpers';
import { ArrowLeft, Calendar, Eye, Heart, Share2, Link as LinkIcon, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { SEO } from '@/components/SEO';
import toast from 'react-hot-toast';

export const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuthStore();
  const [likeState, setLikeState] = useState<{ likes: number; liked: boolean }>({ likes: 0, liked: false });
  const [views, setViews] = useState<number>(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

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

  const getShareUrl = () => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://brightenbangladesh.com';
    return `${baseUrl}/share.php?slug=${slug}`;
  };

  const copyLink = () => {
    const shareUrl = getShareUrl();
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
    setShowShareMenu(false);
  };

  const shareOnFacebook = () => {
    const shareUrl = getShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareOnTwitter = () => {
    const shareUrl = getShareUrl();
    const text = encodeURIComponent(blog?.title || '');
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const shareOnWhatsApp = () => {
    const shareUrl = getShareUrl();
    const text = encodeURIComponent(`${blog?.title || ''} - ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const shareOnLinkedIn = () => {
    const shareUrl = getShareUrl();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    setShowShareMenu(false);
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
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
            {showShareMenu && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[200px]">
                <button
                  onClick={copyLink}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                >
                  <LinkIcon size={16} />
                  <span>Copy Link</span>
                </button>
                <button
                  onClick={shareOnFacebook}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-blue-600"
                >
                  <Facebook size={16} />
                  <span>Facebook</span>
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sky-500"
                >
                  <Twitter size={16} />
                  <span>Twitter</span>
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-blue-700"
                >
                  <Linkedin size={16} />
                  <span>LinkedIn</span>
                </button>
                <button
                  onClick={shareOnWhatsApp}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-green-600"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>
              </div>
            )}
          </div>
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
