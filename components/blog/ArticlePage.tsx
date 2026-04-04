import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/data/blogPosts';

interface ArticlePageProps {
  post: BlogPost;
}

export default function ArticlePage({ post }: ArticlePageProps) {
  return (
    <article className="min-h-screen pt-28 lg:pt-32 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent-cyan transition-colors mb-8"
        >
          ← Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${post.categoryColor}20`,
                color: post.categoryColor,
              }}
            >
              {post.category}
            </span>
            <span className="text-sm text-text-muted">{post.readTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <span>By {post.author}</span>
            <span>·</span>
            <span>
              {new Date(post.date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:text-text-primary prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-text-muted prose-p:leading-relaxed
            prose-strong:text-text-primary
            prose-ul:text-text-muted prose-ol:text-text-muted
            prose-li:text-text-muted
            prose-blockquote:border-accent-cyan prose-blockquote:text-text-muted prose-blockquote:italic
            prose-a:text-accent-cyan prose-a:no-underline hover:prose-a:underline"
        >
          {post.content.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <br key={i} />;

            if (trimmed.startsWith('## ')) {
              return <h2 key={i}>{trimmed.slice(3)}</h2>;
            }
            if (trimmed.startsWith('### ')) {
              return <h3 key={i}>{trimmed.slice(4)}</h3>;
            }
            if (trimmed.startsWith('> ')) {
              return (
                <blockquote key={i}>
                  <p>{trimmed.slice(2)}</p>
                </blockquote>
              );
            }
            if (trimmed.startsWith('- **')) {
              const match = trimmed.match(/^- \*\*(.+?)\*\*\s*[-—]?\s*(.*)$/);
              if (match) {
                return (
                  <p key={i} className="ml-4 mb-1">
                    • <strong>{match[1]}</strong> — {match[2]}
                  </p>
                );
              }
            }
            if (trimmed.startsWith('- ')) {
              return (
                <p key={i} className="ml-4 mb-1">
                  • {trimmed.slice(2)}
                </p>
              );
            }
            if (/^\d+\.\s\*\*/.test(trimmed)) {
              const match = trimmed.match(/^\d+\.\s\*\*(.+?)\*\*\s*[-—]?\s*(.*)$/);
              if (match) {
                return (
                  <p key={i} className="ml-4 mb-1">
                    <strong>{match[1]}</strong> — {match[2]}
                  </p>
                );
              }
            }

            // Handle inline bold
            const parts = trimmed.split(/\*\*(.+?)\*\*/g);
            if (parts.length > 1) {
              return (
                <p key={i}>
                  {parts.map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                  )}
                </p>
              );
            }

            return <p key={i}>{trimmed}</p>;
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 rounded-2xl bg-bg-secondary border border-border p-8 text-center">
          <h3 className="text-xl font-bold text-text-primary mb-2">
            Ready to train smarter?
          </h3>
          <p className="text-text-muted mb-4">
            Start your AI-powered safety training journey with KarmaSetu today.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-accent-cyan px-6 py-3 text-sm font-semibold text-bg-primary transition-all hover:brightness-110 hover:scale-105"
          >
            Get Started Free →
          </Link>
        </div>
      </div>
    </article>
  );
}
