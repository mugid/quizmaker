'use server';

import { createQuizAttempt, checkAndAwardAchievements } from './queries';
import { revalidatePath } from 'next/cache';

interface SubmitQuizAttemptData {
  quizId: string;
  userId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  answers: Record<string, any>;
  timeSpent: number;
}

export async function submitQuizAttempt(data: SubmitQuizAttemptData) {
  try {
    // Create the quiz attempt
    const attempt = await createQuizAttempt(data);
    
    // Check and award achievements
    const newAchievements = await checkAndAwardAchievements(data.userId);
    
    // Revalidate relevant paths
    revalidatePath('/profile');
    revalidatePath('/dashboard');
    revalidatePath('/leaderboard');
    revalidatePath(`/quiz/${data.quizId}`);
    
    return {
      ...attempt,
      achievements: newAchievements || []
    };
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    throw new Error('Failed to submit quiz attempt');
  }
}

export async function getQuizAttemptResults(attemptId: string) {
  // This would be used if you need to fetch results separately
  // For now, we return results immediately after submission
  return null;
}