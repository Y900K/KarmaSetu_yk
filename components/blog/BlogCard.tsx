import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/data/blogPosts';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-2xl bg-bg-secondary border border-border overflow-hidden transition-all duration-300 hover:border-accent-cyan/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.08)] h-full"
    >
      {/* Category color bar */}
      <div className="h-1 w-full" style={{ backgroundColor: post.categoryColor }} />

      <div className="p-5 sm:p-6 flex flex-col h-full">
        {/* Category + date */}
        <div className="flex items-center gap-3 mb-3">
          <span
            className="text-xs font-medium px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: `${post.categoryColor}20`,
              color: post.categoryColor,
            }}
          >
            {post.category}
          </span>
          <span className="text-xs text-text-muted">{post.readTime}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent-cyan transition-colors leading-tight">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-text-muted leading-relaxed mb-4 flex-grow">
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <span className="text-xs text-text-muted">{post.author}</span>
          <span className="text-xs text-text-muted">
            {new Date(post.date).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
