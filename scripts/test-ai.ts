import { generateAdminCourseQuiz } from '../lib/server/adminCourseAI';
import { config } from 'dotenv';
config();

async function run() {
  const apiKey = process.env.SARVAM_API_KEY!;
  console.log('Testing quiz generation...');
  try {
    const questions = await generateAdminCourseQuiz('Chemical Spill Response', apiKey, 10, 'hinglish');
    console.log(`Generated ${questions.length} questions successfully!`);
    console.log(JSON.stringify(questions.slice(0, 2), null, 2));
  } catch (err) {
    console.error('Failed:', err);
  }
}

run();
