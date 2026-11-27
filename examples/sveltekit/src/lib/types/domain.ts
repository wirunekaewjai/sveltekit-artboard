export type NavRouteId = '/' | '/dashboard' | '/projects' | '/settings';

export type ProjectStatus = 'active' | 'review' | 'completed' | 'paused';

export type ProjectItem = {
  id: string;
  name: string;
  client: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  dueDate: string;
  members: Array<{ name: string; color: string }>;
  category: string;
};

export type MetricItem = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
  sparkline: number[];
};

export type RevenuePoint = {
  month: string;
  revenue: number;
  target: number;
};

export type ActivityItem = {
  id: string;
  actor: string;
  actorColor: string;
  action: string;
  target: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'warning';
};

export type PricingTier = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  highlighted?: boolean;
  features: string[];
  ctaLabel: string;
};

export type UserProfile = {
  fullName: string;
  email: string;
  role: string;
  workspaceName: string;
  timezone: string;
  bio: string;
};

export type NotificationSettings = {
  designReviews: boolean;
  weeklyDigest: boolean;
  deployAlerts: boolean;
  mentionEmails: boolean;
};
