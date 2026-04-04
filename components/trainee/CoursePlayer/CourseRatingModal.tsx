import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface CourseRatingModalProps {
  isOpen: boolean;
  onSubmit: (rating: number, comment: string) => void;
  onSkip: () => void;
}

export default function CourseRatingModal({ isOpen, onSubmit, onSkip }: CourseRatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    await onSubmit(rating, comment);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0d1b2a] border border-[#1e2d3d] rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <h3 className="text-xl font-bold text-white mb-2 text-center">How was this course?</h3>
        <p className="text-slate-400 text-sm text-center mb-6">
          Your feedback helps us improve KarmaSetu training.
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 focus:outline-none transition-transform hover:scale-110"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-transparent text-[#1e2d3d]'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Any comments for the instructors? (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full bg-[#020817] border border-[#1e2d3d] rounded-xl p-3 text-white placeholder-slate-500 max-h-32 min-h-24 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            placeholder="What did you like? What could be better?"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            disabled={isSubmitting}
            className="flex-1 py-3 text-slate-400 font-medium hover:text-white transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center transition-all ${
              rating === 0 || isSubmitting
                ? 'bg-[#1e2d3d] text-slate-500 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-lg hover:-translate-y-0.5'
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              'Submit Feedback'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
