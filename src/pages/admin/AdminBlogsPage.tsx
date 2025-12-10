import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogsApi } from '@/api/blogs';
import { Loader } from '@/components/Loader';
import { Badge } from '@/components/Badge';
import { formatDate } from '@/utils/helpers';
import { CheckCircle, XCircle } from 'lucide-react';

export const AdminBlogsPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'blogs'],
    queryFn: () => blogsApi.getAll({ page: 1, limit: 50 }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => blogsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: number) => blogsApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] });
    },
  });

  if (isLoading) return <Loader />;

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold mb-6">Blogs Management</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Author</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.data.map((blog) => (
              <tr key={blog.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{blog.title}</td>
                <td className="px-4 py-3">{blog.author?.name || 'Unknown'}</td>
                <td className="px-4 py-3">
                  <Badge status={blog.status}>{blog.status}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(blog.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    {blog.status === 'pending' && (
                      <button
                        onClick={() => approveMutation.mutate(blog.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Approve"
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}
                    {blog.status === 'approved' && (
                      <button
                        onClick={() => publishMutation.mutate(blog.id)}
                        className="text-sm btn btn-primary py-1 px-3"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
