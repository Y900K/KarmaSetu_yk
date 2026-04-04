import React from 'react';
import CoursePlayer from '@/components/trainee/CoursePlayer/CoursePlayer';

export default async function CoursePlayerPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <CoursePlayer courseId={courseId} />;
}
