import type {
  ActivityItem,
  MetricItem,
  NotificationSettings,
  PricingTier,
  ProjectItem,
  ProjectStatus,
  RevenuePoint,
  UserProfile,
} from '#lib/types/domain.ts';

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'prj-1',
    name: 'Aurora Design System',
    client: 'Core Platform',
    description: 'Unified token architecture and container-query primitives across web surfaces.',
    status: 'active',
    progress: 78,
    dueDate: 'Dec 12',
    category: 'Design System',
    members: [
      { name: 'Nicha Tan', color: 'bg-indigo-600' },
      { name: 'Korn Chai', color: 'bg-emerald-600' },
      { name: 'Mina Park', color: 'bg-amber-600' },
    ],
  },
  {
    id: 'prj-2',
    name: 'Checkout Flow v4',
    client: 'Commerce Squad',
    description:
      'Streamlined one-page checkout with adaptive mobile summary and instant validation.',
    status: 'review',
    progress: 92,
    dueDate: 'Dec 04',
    category: 'Web App',
    members: [
      { name: 'Pim Srisai', color: 'bg-rose-600' },
      { name: 'Alex Rivera', color: 'bg-sky-600' },
    ],
  },
  {
    id: 'prj-3',
    name: 'Mobile Banking Kit',
    client: 'FinCore Labs',
    description: 'High-contrast accessible components for cards, transfers, and biometric dialogs.',
    status: 'completed',
    progress: 100,
    dueDate: 'Nov 20',
    category: 'Mobile UI',
    members: [
      { name: 'Korn Chai', color: 'bg-emerald-600' },
      { name: 'Nicha Tan', color: 'bg-indigo-600' },
    ],
  },
  {
    id: 'prj-4',
    name: 'Analytics Studio Refresh',
    client: 'Growth Data',
    description: 'Interactive KPI dashboards and real-time cohort tables for enterprise teams.',
    status: 'active',
    progress: 54,
    dueDate: 'Jan 15',
    category: 'Web App',
    members: [
      { name: 'Mina Park', color: 'bg-amber-600' },
      { name: 'Alex Rivera', color: 'bg-sky-600' },
    ],
  },
  {
    id: 'prj-5',
    name: 'Brand Guidelines 2027',
    client: 'Marketing Studio',
    description: 'Typography scale, illustration direction, and interactive landing page modules.',
    status: 'paused',
    progress: 35,
    dueDate: 'Feb 01',
    category: 'Brand Refresh',
    members: [{ name: 'Pim Srisai', color: 'bg-rose-600' }],
  },
];

const INITIAL_METRICS: MetricItem[] = [
  {
    id: 'm-1',
    label: 'Monthly Revenue',
    value: '$128.4k',
    delta: '+14.2%',
    trend: 'up',
    sparkline: [62, 68, 65, 79, 88, 94, 112, 128],
  },
  {
    id: 'm-2',
    label: 'Active Reviewers',
    value: '1,482',
    delta: '+8.6%',
    trend: 'up',
    sparkline: [910, 980, 1020, 1150, 1240, 1310, 1405, 1482],
  },
  {
    id: 'm-3',
    label: 'Component Reuse',
    value: '91.4%',
    delta: '+3.1%',
    trend: 'up',
    sparkline: [78, 80, 82, 84, 86, 88, 90, 91.4],
  },
  {
    id: 'm-4',
    label: 'Review Cycle Time',
    value: '4.2h',
    delta: '-18.5%',
    trend: 'down',
    sparkline: [7.5, 6.9, 6.4, 5.8, 5.5, 5.0, 4.6, 4.2],
  },
];

const REVENUE_12M: RevenuePoint[] = [
  { month: 'Jan', revenue: 64, target: 60 },
  { month: 'Feb', revenue: 71, target: 65 },
  { month: 'Mar', revenue: 78, target: 72 },
  { month: 'Apr', revenue: 84, target: 80 },
  { month: 'May', revenue: 89, target: 85 },
  { month: 'Jun', revenue: 95, target: 90 },
  { month: 'Jul', revenue: 102, target: 95 },
  { month: 'Aug', revenue: 98, target: 100 },
  { month: 'Sep', revenue: 110, target: 104 },
  { month: 'Oct', revenue: 118, target: 110 },
  { month: 'Nov', revenue: 124, target: 115 },
  { month: 'Dec', revenue: 128, target: 120 },
];

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    actor: 'Nicha Tan',
    actorColor: 'bg-indigo-600',
    action: 'approved responsive layout for',
    target: 'Checkout Flow v4',
    timestamp: '12m ago',
    status: 'completed',
  },
  {
    id: 'act-2',
    actor: 'Korn Chai',
    actorColor: 'bg-emerald-600',
    action: 'pinned 3 annotations on',
    target: 'Aurora Design System',
    timestamp: '48m ago',
    status: 'pending',
  },
  {
    id: 'act-3',
    actor: 'Pim Srisai',
    actorColor: 'bg-rose-600',
    action: 'flagged contrast issue in',
    target: 'DeleteWorkspaceDialog',
    timestamp: '2h ago',
    status: 'warning',
  },
  {
    id: 'act-4',
    actor: 'Alex Rivera',
    actorColor: 'bg-sky-600',
    action: 'published tokens v2.4 to',
    target: 'Analytics Studio',
    timestamp: '5h ago',
    status: 'completed',
  },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$0',
    period: '/ month',
    description: 'For solo builders prototyping atomic components locally.',
    features: [
      'Unlimited local dev artboards',
      'Container query breakpoint presets',
      'Zero-footprint production build stripping',
    ],
    ctaLabel: 'Start Free',
  },
  {
    id: 'studio',
    name: 'Studio',
    price: '$29',
    period: '/ seat / mo',
    description: 'For product teams collaborating across design and engineering.',
    highlighted: true,
    features: [
      'Everything in Starter',
      'Pinned review annotations & threads',
      'Shared fixture catalogs & visual diffs',
      'Multi-theme side-by-side comparison',
    ],
    ctaLabel: 'Start 14-Day Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$89',
    period: '/ seat / mo',
    description: 'For organizations managing multi-brand design systems at scale.',
    features: [
      'Everything in Studio',
      'SSO / SAML & audit logs',
      'CI visual regression pipelines',
      'Dedicated design systems architect',
    ],
    ctaLabel: 'Contact Sales',
  },
];

class WorkspaceController {
  darkMode = $state(false);
  dashboardPeriod = $state<'6m' | '12m'>('6m');

  projects = $state<ProjectItem[]>(structuredClone(INITIAL_PROJECTS));
  projectQuery = $state('');
  projectStatus = $state<ProjectStatus | 'all'>('all');

  metrics = $state<MetricItem[]>(INITIAL_METRICS);
  activities = $state<ActivityItem[]>(INITIAL_ACTIVITIES);

  profile = $state<UserProfile>({
    fullName: 'Nicha Tan',
    email: 'nicha@velocestudio.dev',
    role: 'Staff Design Engineer',
    workspaceName: 'Veloce Studio',
    timezone: 'Asia/Bangkok (UTC+7)',
    bio: 'Building resilient atomic UI systems with SvelteKit 3.',
  });

  notifications = $state<NotificationSettings>({
    designReviews: true,
    weeklyDigest: true,
    deployAlerts: false,
    mentionEmails: true,
  });

  revenueData = $derived(this.dashboardPeriod === '6m' ? REVENUE_12M.slice(-6) : REVENUE_12M);

  filteredProjects = $derived.by(() => {
    const q = this.projectQuery.trim().toLowerCase();
    return this.projects.filter((project) => {
      const matchesStatus = this.projectStatus === 'all' || project.status === this.projectStatus;
      const matchesQuery =
        !q ||
        project.name.toLowerCase().includes(q) ||
        project.client.toLowerCase().includes(q) ||
        project.category.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  });

  toggleTheme() {
    this.darkMode = !this.darkMode;
  }

  resetProjectFilters() {
    this.projectQuery = '';
    this.projectStatus = 'all';
  }

  addProject(name: string, client: string, category: string) {
    const newProject: ProjectItem = {
      id: `prj-${Date.now()}`,
      name: name.trim(),
      client: client.trim() || 'Internal Squad',
      description: 'Newly created workspace project ready for atomic UI review.',
      status: 'active',
      progress: 10,
      dueDate: 'Dec 30',
      category,
      members: [{ name: this.profile.fullName, color: 'bg-indigo-600' }],
    };
    this.projects = [newProject, ...this.projects];
  }

  updateProfile(patch: Partial<UserProfile>) {
    this.profile = { ...this.profile, ...patch };
  }

  updateNotifications(patch: Partial<NotificationSettings>) {
    this.notifications = { ...this.notifications, ...patch };
  }
}

export const workspace = new WorkspaceController();
