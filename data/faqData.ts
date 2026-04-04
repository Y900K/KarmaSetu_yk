export interface FAQ {
  question: string;
  answer: string;
}

export const faqData: FAQ[] = [
  {
    question: 'Is the platform free to use?',
    answer:
      'Yes. The platform offers a free tier with access to core training courses, AI quizzes, and basic certificates. Advanced features like bulk user management and detailed analytics are available for organizations. No credit card required to start.',
  },
  {
    question: 'What industries and domains does this platform cover?',
    answer:
      'The platform covers Health & Safety, Machine Operations, Quality & Compliance, Chemical Handling, Electrical Safety, and Leadership & SOPs — all specifically designed for Indian industrial and manufacturing environments including factories, chemical plants, and production facilities.',
  },
  {
    question: 'How are certificates generated after course completion?',
    answer:
      'Every completed course with a passing quiz score (70% or above) automatically generates a digital certificate with a unique ID, QR code for verification, trainee name, course name, score, and completion date. Certificates can be viewed, downloaded as PDF, and shared via link.',
  },
  {
    question: 'Is the platform mobile-friendly for factory floor workers?',
    answer:
      'Yes. The platform is fully responsive across all screen sizes — mobile, tablet, and desktop. Workers can access training content, take quizzes, and view certificates directly from their smartphones, even in low-connectivity environments with offline caching support.',
  },
  {
    question: 'How does the AI chatbot work?',
    answer:
      'Our AI assistant, YK, is trained on industrial safety protocols, SOPs, and best practices across multiple domains. Workers can ask questions about PPE requirements, emergency procedures, chemical handling, and more — and get instant, accurate answers in their preferred language.',
  },
  {
    question: 'Can I use KarmaSetu for my entire organization?',
    answer:
      'Absolutely! We offer enterprise plans that include admin dashboards, progress tracking across employees, compliance reporting, custom course creation, and dedicated support. Contact us for a tailored enterprise solution.',
  },
  {
    question: 'What languages are supported?',
    answer:
      'KarmaSetu supports English, Hindi, and select regional languages. Our AI chatbot can respond in multiple languages, making safety training accessible to workers across India regardless of their language background.',
  },
];
