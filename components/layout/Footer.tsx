import React from 'react';
import Link from 'next/link';

const footerLinks = {
  platform: [
    { label: 'Features', href: '#features' },
    { label: 'Training Domains', href: '#domains' },
    { label: 'AI Chatbot', href: '#features' },
    { label: 'Certifications', href: '#features' },
  ],
  resources: [
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Safety Guidelines', href: '#' },
    { label: 'Documentation', href: '#' },
  ],
  company: [
    { label: 'About Us', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Partners', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Compliance', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer grid */}
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-5 lg:py-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 md:pr-4">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-cyan/10 border border-accent-cyan/30">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 text-accent-cyan"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
                  <path d="M12 22V12" />
                  <path d="M3 7l9 5 9-5" />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-wider">KARMASETU</span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed mb-4">
              India&apos;s first AI-integrated industrial safety training platform. Train smarter, work safer.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {['X', 'Li', 'YT', 'IG'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted text-xs font-medium transition-all hover:border-accent-cyan hover:text-accent-cyan hover:bg-accent-cyan/5"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-primary">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted transition-colors hover:text-accent-cyan"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} KarmaSetu. All rights reserved. Made with ❤️ in India 🇮🇳
          </p>
          <p className="text-xs text-text-muted">
            Be Safe · Be Skilled · Be Productive
          </p>
        </div>
      </div>
    </footer>
  );
}
