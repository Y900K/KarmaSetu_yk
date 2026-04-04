import React from 'react';
import { Metadata } from 'next';
import BlogCard from '@/components/blog/BlogCard';
import { blogPosts } from '@/data/blogPosts';
import Badge from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Blog — KarmaSetu',
  description:
    'Stay updated with the latest insights on industrial safety training, AI in workplace safety, digital certifications, and more.',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen pt-28 lg:pt-32 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="blue" className="mb-4">BLOG</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Safety Training <span className="text-accent-blue">Insights</span>
          </h1>
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            Expert articles on industrial safety, AI-powered training, and workforce development.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
