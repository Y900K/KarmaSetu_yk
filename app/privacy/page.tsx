import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — KarmaSetu',
  description: 'KarmaSetu privacy policy — how we collect, use, and protect your personal data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-28 lg:pt-32 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-text-muted text-sm mb-10">Last updated: March 2025</p>

        <div className="space-y-8 text-text-muted leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">1. Introduction</h2>
            <p>
              KarmaSetu (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our AI-integrated industrial training platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">2. Information We Collect</h2>
            <p className="mb-3">We may collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong className="text-text-primary">Personal Information:</strong> Name, email address, phone number, and organization details when you register.</li>
              <li><strong className="text-text-primary">Usage Data:</strong> Course progress, quiz scores, completion rates, and interaction data with our AI assistant.</li>
              <li><strong className="text-text-primary">Device Information:</strong> Browser type, operating system, IP address, and device identifiers.</li>
              <li><strong className="text-text-primary">Cookies:</strong> We use cookies and similar technologies to enhance your experience and analyze platform usage.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>To provide, personalize, and improve our training platform.</li>
              <li>To generate AI-powered learning recommendations and assessments.</li>
              <li>To issue and verify digital certificates.</li>
              <li>To communicate with you about your account, courses, and platform updates.</li>
              <li>To analyze usage patterns and improve platform performance.</li>
              <li>To comply with legal obligations and enforce our terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">4. Data Sharing</h2>
            <p>
              We do not sell your personal data. We may share information with third-party service providers
              who assist in platform operations, analytics, and certificate verification — only to the
              extent necessary for their services and under strict confidentiality agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">5. Data Security</h2>
            <p>
              We implement industry-standard security measures, including encryption, access controls,
              and regular security audits, to protect your information. However, no method of electronic
              transmission or storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">6. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Access, correct, or delete your personal data.</li>
              <li>Withdraw consent for data processing.</li>
              <li>Request a copy of your data in a portable format.</li>
              <li>Opt out of marketing communications.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@karmasetu.in" className="text-accent-cyan hover:underline">
                privacy@karmasetu.in
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
