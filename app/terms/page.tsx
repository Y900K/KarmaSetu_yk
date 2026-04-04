import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — KarmaSetu',
  description: 'KarmaSetu terms of service — the rules and conditions for using our AI-integrated industrial training platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-28 lg:pt-32 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-text-muted text-sm mb-10">Last updated: March 2025</p>

        <div className="space-y-8 text-text-muted leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using KarmaSetu (&quot;the Platform&quot;), you agree to be bound by these Terms
              of Service. If you do not agree to these terms, please do not use the Platform. These terms
              apply to all users, including trainees, administrators, and organizational accounts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">2. Description of Service</h2>
            <p>
              KarmaSetu provides an AI-integrated industrial safety training platform that includes
              video courses, AI-powered quizzes, a 24/7 AI chatbot assistant, progress tracking,
              and digital certifications for industrial workforce training.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">3. User Accounts</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>You must provide accurate and complete registration information.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must be at least 18 years old or have parental/guardian consent to use the Platform.</li>
              <li>One person per account; shared accounts are not permitted.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">4. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Use the Platform for any unlawful purpose.</li>
              <li>Share, redistribute, or sell course content or certificates.</li>
              <li>Attempt to manipulate quiz scores or certification results.</li>
              <li>Interfere with or disrupt the Platform&apos;s infrastructure.</li>
              <li>Use automated tools to access the Platform without authorization.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">5. Intellectual Property</h2>
            <p>
              All content on the Platform — including courses, quizzes, AI-generated content,
              certificates, logos, and software — is the intellectual property of KarmaSetu or its
              licensors. You may not reproduce, distribute, or create derivative works without
              explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">6. Certifications</h2>
            <p>
              Digital certificates issued through the Platform represent completion of specific training
              modules and AI-assessed competency scores. While our certifications are designed to meet
              industry standards, they do not replace official government-mandated certifications where
              required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">7. AI-Generated Content</h2>
            <p>
              Our AI chatbot and quiz systems provide information based on training data and safety
              protocols. While we strive for accuracy, AI-generated responses should not replace
              professional safety advice. Always consult qualified safety professionals for critical
              safety decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">8. Limitation of Liability</h2>
            <p>
              KarmaSetu provides the Platform &quot;as is&quot; without warranties of any kind. We shall not
              be liable for any indirect, incidental, or consequential damages arising from your
              use of the Platform, including but not limited to workplace incidents, training gaps,
              or certification disputes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">9. Modifications</h2>
            <p>
              We reserve the right to modify these Terms at any time. Continued use of the Platform
              after changes constitutes acceptance of the modified Terms. We will notify registered
              users of significant changes via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">10. Contact</h2>
            <p>
              For questions about these Terms, contact us at{' '}
              <a href="mailto:legal@karmasetu.in" className="text-accent-cyan hover:underline">
                legal@karmasetu.in
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
