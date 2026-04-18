export const ADMIN_USER = {
  name: "Manish Bhardwaj",
  email: "admin@karmasetu.com",
  role: "Admin",
  title: "HR Manager",
  department: "HR & Administration",
  avatar: "MB",
};

export const KPI_STATS = {
  totalTrainees: 124,
  trainingCompliance: 78,
  activeCourses: 9,
  validCertificates: 87,
  overdueTrainees: 18,
  avgCompletion: 92,
};

export const TRAINEES = [
  { id: "EMP-001", name: "Ravi Sharma", email: "ravi@karmasetu.com", department: "Safety & EHS", role: "Safety Officer", progress: 82, status: "Active", lastLogin: "Today, 9:14 AM", phone: "+91 98765 43210" },
  { id: "EMP-002", name: "Priya Verma", email: "priya@karmasetu.com", department: "Production", role: "Worker / Operator", progress: 65, status: "Active", lastLogin: "Yesterday", phone: "+91 87654 32109" },
  { id: "EMP-003", name: "Suresh Kumar", email: "suresh@karmasetu.com", department: "Electrical", role: "Worker / Operator", progress: 34, status: "Overdue", lastLogin: "5 days ago", phone: "+91 76543 21098" },
  { id: "EMP-004", name: "Anjali Singh", email: "anjali@karmasetu.com", department: "Quality Control", role: "Supervisor", progress: 91, status: "Active", lastLogin: "Today, 11:30 AM", phone: "+91 65432 10987" },
  { id: "EMP-005", name: "Mukesh Yadav", email: "mukesh@karmasetu.com", department: "Maintenance", role: "Worker / Operator", progress: 48, status: "Overdue", lastLogin: "8 days ago", phone: "+91 54321 09876" },
  { id: "EMP-006", name: "Kavita Patel", email: "kavita@karmasetu.com", department: "Chemical / Process", role: "Supervisor", progress: 78, status: "Active", lastLogin: "2 days ago", phone: "+91 43210 98765" },
  { id: "EMP-007", name: "Deepak Tiwari", email: "deepak@karmasetu.com", department: "Production", role: "Worker / Operator", progress: 12, status: "Inactive", lastLogin: "21 days ago", phone: "+91 32109 87654" },
  { id: "EMP-008", name: "Neha Gupta", email: "neha@karmasetu.com", department: "HR / Admin", role: "HR / Admin", progress: 95, status: "Active", lastLogin: "Today, 8:00 AM", phone: "+91 21098 76543" },
];

// ... (COURSES AND CERTIFICATES)

export const DEPARTMENTS = [
  { name: "Safety & EHS", compliance: 94, status: "Compliant" },
  { name: "Production", compliance: 81, status: "Compliant" },
  { name: "Quality Control", compliance: 89, status: "Compliant" },
  { name: "Maintenance", compliance: 67, status: "At Risk" },
  { name: "Electrical", compliance: 73, status: "At Risk" },
  { name: "Chemical / Process", compliance: 58, status: "Non-Compliant" },
  { name: "Logistics", compliance: 85, status: "Compliant" },
  { name: "Operations", compliance: 79, status: "Warning" },
];

// ... (MONTHLY_COMPLETIONS)

export const DEPT_PERFORMANCE = [
  { rank: 1, dept: "Safety & EHS", avgScore: 91, completions: 68, compliance: 94 },
  { rank: 2, dept: "Quality Control", avgScore: 87, completions: 54, compliance: 89 },
  { rank: 3, dept: "Production", avgScore: 82, completions: 72, compliance: 81 },
  { rank: 4, dept: "Electrical", avgScore: 76, completions: 31, compliance: 73 },
  { rank: 5, dept: "Maintenance", avgScore: 71, completions: 48, compliance: 67 },
  { rank: 6, dept: "Chemical / Process", avgScore: 64, completions: 28, compliance: 58 },
];

// ... (COURSE_ANALYSIS, RECENT_ACTIVITY, ALERTS, ANNOUNCEMENTS, OVERDUE_TRAINEES)

export const ROLE_OPTIONS = ["Worker / Operator", "Supervisor / Team Lead", "Manager / Department Head", "Safety Officer", "HR / Admin"];
export const DEPT_OPTIONS = ["Safety & EHS", "Chemical / Process", "Maintenance", "Production", "Quality Control", "Electrical", "HR / Admin", "Logistics", "Operations", "General"];
export const PRIORITY_OPTIONS = ["INFO", "REMINDER", "HIGH", "URGENT"];
export const COURSE_COLOR_THEMES = [
  { label: "Fire Red", value: "from-red-600 to-orange-500" },
  { label: "Ocean Blue", value: "from-blue-600 to-indigo-500" },
  { label: "Forest Green", value: "from-green-600 to-teal-500" },
  { label: "Royal Purple", value: "from-purple-600 to-violet-500" },
  { label: "Electric Cyan", value: "from-cyan-600 to-sky-500" },
  { label: "Golden Amber", value: "from-yellow-500 to-amber-400" },
];
