export interface Domain {
  id: string;
  icon: string;
  title: string;
  courses: number;
  gradient: string;
}

export const domainsData: Domain[] = [
  {
    id: 'health-safety',
    icon: '🦺',
    title: 'Health & Safety',
    courses: 4,
    gradient: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
  },
  {
    id: 'machine-ops',
    icon: '⚙️',
    title: 'Machine Operations',
    courses: 3,
    gradient: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
  },
  {
    id: 'quality-compliance',
    icon: '✅',
    title: 'Quality & Compliance',
    courses: 3,
    gradient: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
  },
  {
    id: 'chemical-handling',
    icon: '🧪',
    title: 'Chemical Handling',
    courses: 2,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
  },
  {
    id: 'electrical-safety',
    icon: '⚡',
    title: 'Electrical Safety',
    courses: 2,
    gradient: 'linear-gradient(135deg, #d97706 0%, #ca8a04 100%)',
  },
  {
    id: 'leadership-sops',
    icon: '🎯',
    title: 'Leadership & SOPs',
    courses: 1,
    gradient: 'linear-gradient(135deg, #0891b2 0%, #0284c7 100%)',
  },
];
