import { format, formatDistanceToNow, parseISO, differenceInHours, parse } from 'date-fns';
import clsx from 'clsx';

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return format(parseISO(dateStr), 'MMM dd, yyyy');
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getInitials(firstName, lastName) {
  const first = firstName ? firstName.charAt(0) : '';
  const last = lastName ? lastName.charAt(0) : '';
  return `${first}${last}`.toUpperCase();
}

export function classNames(...classes) {
  return clsx(...classes);
}

export function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function getRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return formatDistanceToNow(date, { addSuffix: true });
}

export function calculateDuration(start, end) {
  if (!start || !end) return 0;
  const startDate = parse(start, 'HH:mm', new Date());
  const endDate = parse(end, 'HH:mm', new Date());
  return differenceInHours(endDate, startDate);
}

export function getStatusColor(status) {
  const colorMap = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    'on leave': 'bg-yellow-100 text-yellow-800',
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-orange-100 text-orange-800',
    'half day': 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800',
    swapped: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
    overpaid: 'bg-orange-100 text-orange-800',
    underpaid: 'bg-red-100 text-red-800',
    correct: 'bg-green-100 text-green-800',
  };
  return colorMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

export function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}
