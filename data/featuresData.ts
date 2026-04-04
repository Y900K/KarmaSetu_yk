export interface Feature {
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  description: string;
  mockupType: 'chatbot' | 'quiz' | 'training' | 'certificate' | 'analytics' | 'admin';
}

export const featuresData: Feature[] = [
  {
    id: 'chatbot',
    icon: '🤖',
    iconBg: 'from-purple-500 to-purple-700',
    title: 'AI Chatbot',
    description:
      'Instant answers on safety, SOPs & compliance using our AI assistant — available 24/7.',
    mockupType: 'chatbot',
  },
  {
    id: 'quiz',
    icon: '📝',
    iconBg: 'from-cyan-500 to-sky-600',
    title: 'AI Quiz Generator',
    description:
      'Auto-generated quizzes tailored to each training module with adaptive difficulty scoring.',
    mockupType: 'quiz',
  },
  {
    id: 'training',
    icon: '🎓',
    iconBg: 'from-emerald-500 to-green-600',
    title: 'Interactive Training',
    description:
      '15+ industrial training courses with structured modules, video lessons, and PDF study material.',
    mockupType: 'training',
  },
  {
    id: 'certificate',
    icon: '🏅',
    iconBg: 'from-amber-500 to-yellow-600',
    title: 'Smart Certificates',
    description:
      'Auto-generated digital certificates with unique QR codes after every course completion.',
    mockupType: 'certificate',
  },
  {
    id: 'analytics',
    icon: '📊',
    iconBg: 'from-blue-500 to-blue-700',
    title: 'Live Analytics',
    description:
      'Track compliance scores, course completions and department performance in real-time.',
    mockupType: 'analytics',
  },
  {
    id: 'admin',
    icon: '⚙️',
    iconBg: 'from-red-500 to-red-700',
    title: 'Admin Dashboard',
    description:
      'Full workforce management — add trainees, assign courses, track compliance and export reports.',
    mockupType: 'admin',
  },
];
