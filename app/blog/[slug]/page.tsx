import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ArticlePage from '@/components/blog/ArticlePage';
import { blogPosts } from '@/data/blogPosts';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: 'Not Found — KarmaSetu' };

  return {
    title: `${post.title} — KarmaSetu Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return <ArticlePage post={post} />;
}
