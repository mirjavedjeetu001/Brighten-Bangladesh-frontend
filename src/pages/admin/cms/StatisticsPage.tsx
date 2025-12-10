import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, BarChart3 } from 'lucide-react';
import { statisticApi, Statistic } from '../../../api/cms';
import { toast } from 'react-hot-toast';

export const StatisticsPage = () => {
  const queryClient = useQueryClient();
  const [editedStats, setEditedStats] = useState<Statistic[]>([]);

  const { data: statistics, isLoading } = useQuery({
    queryKey: ['statistics'],
    queryFn: statisticApi.getAll,
  });

  useEffect(() => {
    if (statistics) {
      setEditedStats(statistics);
    }
  }, [statistics]);

  const updateMutation = useMutation({
    mutationFn: statisticApi.bulkUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('Statistics updated successfully');
    },
    onError: () => toast.error('Failed to update statistics'),
  });

  const handleChange = (id: number, field: keyof Statistic, value: string | boolean | number) => {
    setEditedStats((prev) =>
      prev.map((stat) => (stat.id === id ? { ...stat, [field]: value } : stat))
    );
  };

  const handleSave = () => {
    const updates = editedStats.map((stat) => ({
      id: stat.id,
      label: stat.label,
      value: stat.value,
      icon: stat.icon,
      display_order: stat.display_order,
      is_active: stat.is_active,
    }));

    updateMutation.mutate({ statistics: updates });
  };

  if (isLoading) {
    return <div className="flex justify-center p-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
          <p className="text-gray-600 mt-1">Manage impact statistics and numbers</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isLoading}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Save size={20} />
          <span>Save All Changes</span>
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {editedStats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="text-primary-600" size={32} />
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-600">Active</label>
                <input
                  type="checkbox"
                  checked={stat.is_active}
                  onChange={(e) => handleChange(stat.id, 'is_active', e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  value={stat.icon || ''}
                  onChange={(e) => handleChange(stat.id, 'icon', e.target.value)}
                  className="input w-full text-center text-3xl"
                  placeholder="📊"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value *
                </label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => handleChange(stat.id, 'value', e.target.value)}
                  className="input w-full text-center text-4xl font-bold text-primary-600"
                  placeholder="10,000+"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label *
                </label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => handleChange(stat.id, 'label', e.target.value)}
                  className="input w-full text-center"
                  placeholder="Students Reached"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={stat.display_order}
                  onChange={(e) => handleChange(stat.id, 'display_order', parseInt(e.target.value))}
                  className="input w-full"
                  min={1}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
              ID: {stat.id} • Order: {stat.display_order}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-lg p-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Live Preview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {editedStats
            .filter((stat) => stat.is_active)
            .sort((a, b) => a.display_order - b.display_order)
            .map((stat) => (
              <div key={stat.id} className="text-center text-white">
                {stat.icon && (
                  <div className="text-5xl mb-3">{stat.icon}</div>
                )}
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
