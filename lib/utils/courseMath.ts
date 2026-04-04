/**
 * Industrial Training Duration Engine
 * Calculates estimated completion time based on content types.
 */

export interface CalculationInput {
  videoDurations: string[];
  documentsCount: number;
  quizQuestionsCount: number;
}

/**
 * Parses "MM:SS" or "HH:MM:SS" into total seconds.
 */
export function parseDurationToSeconds(duration: string): number {
  if (!duration || typeof duration !== 'string') return 0;
  
  const parts = duration.split(':').map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // Minutes only
    return parts[0] * 60;
  }
  
  return 0;
}

/**
 * Formats total seconds into a human-readable "X min" or "Xh Ym" string.
 */
export function formatSecondsToDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0 min';
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.ceil((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

/**
 * Calculates the total estimated duration for a course.
 * - Videos: Exact duration
 * - Documents: 5 minutes per document (technical reading)
 * - Quiz: 1 minute per question
 */
export function calculateCourseEstimate(input: CalculationInput): string {
  const videoSeconds = input.videoDurations.reduce((acc, d) => acc + parseDurationToSeconds(d), 0);
  const docSeconds = input.documentsCount * 300; // 5 mins
  const quizSeconds = input.quizQuestionsCount * 60; // 1 min

  return formatSecondsToDuration(videoSeconds + docSeconds + quizSeconds);
}
