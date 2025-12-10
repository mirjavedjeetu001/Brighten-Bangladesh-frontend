import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { Loader } from '@/components/Loader';
import { Badge } from '@/components/Badge';
import { formatDate } from '@/utils/helpers';

export const AdminUsersPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => usersApi.getAll(1, 50),
  });

  if (isLoading) return <Loader />;

  return (
    <div className="card">
      <h2 className="text-2xl font-semibold mb-6">Users Management</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Organization</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.data.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <Badge status={user.role}>{user.role}</Badge>
                </td>
                <td className="px-4 py-3">{user.organization || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(user.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
