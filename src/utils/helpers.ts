import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getStatusColor(
  status: string
): 'success' | 'warning' | 'error' | 'info' {
  const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    active: 'success',
    approved: 'success',
    published: 'success',
    pending: 'warning',
    draft: 'info',
    inactive: 'warning',
    expired: 'error',
  };

  return statusMap[status.toLowerCase()] || 'info';
}

export function hasRole(
  userRole: string,
  allowedRoles: string[]
): boolean {
  return allowedRoles.includes(userRole);
}

export function isSuperAdmin(userRole: string): boolean {
  return userRole === 'super_admin';
}

export function isAdmin(userRole: string): boolean {
  return userRole === 'admin' || userRole === 'super_admin';
}

export function canManageContent(userRole: string): boolean {
  return ['super_admin', 'admin', 'content_manager', 'editor'].includes(userRole);
}

export function getImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  // Handle base64 data URLs
  if (imageUrl.startsWith('data:image')) {
    return imageUrl;
  }
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  const API_BASE = import.meta.env.VITE_API_URL || 'https://brightenbangladesh.com/api';
  const baseUrl = API_BASE.replace('/api', '');
  return `${baseUrl}${imageUrl}`;
}
