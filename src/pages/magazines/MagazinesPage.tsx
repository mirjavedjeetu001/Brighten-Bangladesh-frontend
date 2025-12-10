import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { magazinesApi } from '@/api/magazines';
import { Loader } from '@/components/Loader';
import { formatDate } from '@/utils/helpers';
import { BookOpen, Download } from 'lucide-react';

export const MagazinesPage = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['magazines', page],
    queryFn: () => magazinesApi.getAll(page, 12),
  });

  if (isLoading) return <Loader />;
  if (error) return <div>Error loading magazines</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Our Magazines</h1>
        <p className="text-gray-600">
          Browse our collection of quarterly magazines and special editions
        </p>
      </div>

      {data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.data.map((magazine) => (
              <div key={magazine.id} className="card">
                {magazine.coverImage ? (
                  <img
                    src={magazine.coverImage}
                    alt={magazine.title}
                    className="w-full h-64 object-cover rounded-md mb-4"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                    <BookOpen size={48} className="text-gray-400" />
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-2">{magazine.title}</h3>
                {magazine.issueNumber && (
                  <p className="text-sm text-gray-600 mb-2">{magazine.issueNumber}</p>
                )}
                {magazine.publishDate && (
                  <p className="text-sm text-gray-500 mb-4">
                    Published: {formatDate(magazine.publishDate)}
                  </p>
                )}
                {magazine.filePath && (
                  <a
                    href={magazine.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-full flex items-center justify-center"
                  >
                    <Download size={18} className="mr-2" />
                    Download PDF
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-outline disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center px-4">
                Page {page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="btn btn-outline disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No magazines available</p>
        </div>
      )}
    </div>
  );
};
