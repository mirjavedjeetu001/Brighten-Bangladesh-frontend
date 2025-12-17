import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userCvsApi } from '../../api/cvs';
import { ArrowLeft, Download } from 'lucide-react';

export const CvPreviewPage = () => {
  const { id } = useParams();
  const cvId = Number(id);

  const { data, isLoading } = useQuery({
    queryKey: ['user-cv-preview', cvId],
    queryFn: () => userCvsApi.getOne(cvId),
    enabled: !!cvId,
  });

  const cv = data?.data;

  const handleDownloadHtml = async () => {
    if (!cvId) return;
    const blob = await userCvsApi.downloadHtml(cvId);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cv?.title || 'cv'}.html`;
    a.click();
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading preview...</div>;
  }

  if (!cv) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">CV not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <Link to="/cv-maker" className="inline-flex items-center gap-2 text-gray-700 hover:text-teal-600">
            <ArrowLeft size={18} /> Back to CVs
          </Link>
          <div className="flex gap-2 items-center">
            <button onClick={handleDownloadHtml} className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm font-medium">
              <Download size={16} /> Download HTML
            </button>
            <span className="text-xs text-gray-500">(Open in Word to save as DOCX)</span>
          </div>
        </div>
        <div className="bg-white shadow-lg rounded-lg border overflow-hidden">
          <iframe
            title="CV Preview"
            srcDoc={cv.htmlContent}
            className="w-full h-[1200px]"
          />
        </div>
      </div>
    </div>
  );
};
