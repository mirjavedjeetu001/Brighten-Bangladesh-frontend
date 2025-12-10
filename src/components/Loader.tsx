import { Loader2 } from 'lucide-react';

export const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-primary-600" size={48} />
    </div>
  );
};
