import { getStatusColor } from '@/utils/helpers';

interface BadgeProps {
  status: string;
  children: React.ReactNode;
}

export const Badge = ({ status, children }: BadgeProps) => {
  const color = getStatusColor(status);
  const badgeClass = `badge badge-${color}`;

  return <span className={badgeClass}>{children}</span>;
};
