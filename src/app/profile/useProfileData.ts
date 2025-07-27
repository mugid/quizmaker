'use client';

import { useState, useEffect } from 'react';

// Import your queries
import { 
  getUserStats, 
  getUserAchievements, 
  getQuizAttemptsByUser,
  checkAndAwardAchievements 
} from '@/server/queries';

export interface UserStats {
  totalQuizzesCreated: number;
  totalQuizzesTaken: number;
  totalPoints: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
}

export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  iconName: string;
  earnedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizTitle: string;
  score: number;
  totalPoints: number;
  percentage: number;
  completedAt: string;
  timeSpent?: number;
  quizDifficulty?: string;
}

export interface WeaknessData {
  tag: string;
  averageScore: number;
  attemptCount: number;
}

export interface ScoreProgressData {
  date: string;
  score: number;
}

export interface UseProfileDataReturn {
  stats: UserStats;
  achievements: Achievement[];
  recentAttempts: QuizAttempt[];
  scoreProgress: ScoreProgressData[];
  weaknesses: WeaknessData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfileData(userId: string): UseProfileDataReturn {
  const [stats, setStats] = useState<UserStats>({
    totalQuizzesCreated: 0,
    totalQuizzesTaken: 0,
    totalPoints: 0,
    averageScore: 0,
    bestScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    rank: 0
  });
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [scoreProgress, setScoreProgress] = useState<ScoreProgressData[]>([]);
  const [weaknesses, setWeaknesses] = useState<WeaknessData[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user stats
      const userStats = await getUserStats(userId);
      if (userStats) {
        setStats({
          totalQuizzesCreated: userStats.totalQuizzesCreated ?? 0,
          totalQuizzesTaken: userStats.totalQuizzesTaken ?? 0,
          totalPoints: userStats.totalPoints ?? 0,
          averageScore: userStats.averageScore ?? 0,
          bestScore: userStats.bestScore ?? 0,
          currentStreak: userStats.currentStreak ?? 0,
          longestStreak: userStats.longestStreak ?? 0,
          rank: userStats.rank ?? 0
        });
      }

      // Load achievements and check for new ones
      const [userAchievements] = await Promise.all([
        getUserAchievements(userId),
        checkAndAwardAchievements(userId)
      ]);
      
      setAchievements(
        userAchievements.map((a: any) => ({
          id: a.id,
          type: a.type,
          title: a.title,
          description: a.description ?? '',
          iconName: a.iconName ?? 'Trophy',
          earnedAt: a.earnedAt instanceof Date 
            ? a.earnedAt.toISOString() 
            : (typeof a.earnedAt === 'string' ? a.earnedAt : new Date().toISOString())
        }))
      );

      // Load recent quiz attempts
      const attempts = await getQuizAttemptsByUser(userId, 10);
      const processedAttempts = attempts.map((attempt: any) => ({
        id: attempt.id,
        quizTitle: attempt.quizTitle ?? 'Unknown Quiz',
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.percentage,
        completedAt: attempt.completedAt instanceof Date 
          ? attempt.completedAt.toISOString()
          : (typeof attempt.completedAt === 'string' ? attempt.completedAt : new Date().toISOString()),
        timeSpent: attempt.timeSpent ?? undefined,
        quizDifficulty: attempt.quizDifficulty ?? undefined
      }));

      setRecentAttempts(processedAttempts);

      // Generate score progress data from recent attempts
      setScoreProgress(generateScoreProgress(processedAttempts));

      // Generate weaknesses data from attempts
      setWeaknesses(generateWeaknessesData(processedAttempts));

    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate score progress data
  const generateScoreProgress = (attempts: QuizAttempt[]): ScoreProgressData[] => {
    const monthlyScores = attempts.reduce((acc: Record<string, { total: number; count: number }>, attempt) => {
      const month = new Date(attempt.completedAt).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { total: 0, count: 0 };
      }
      acc[month].total += attempt.percentage;
      acc[month].count += 1;
      return acc;
    }, {});

    return Object.entries(monthlyScores)
      .map(([month, data]) => ({
        date: month,
        score: Math.round(data.total / data.count)
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-6); // Last 6 months
  };

  // Helper function to generate weaknesses data
  const generateWeaknessesData = (attempts: QuizAttempt[]): WeaknessData[] => {
    const difficultyGroups = attempts.reduce((acc: Record<string, { total: number; count: number }>, attempt) => {
      const difficulty = attempt.quizDifficulty || 'medium';
      if (!acc[difficulty]) {
        acc[difficulty] = { total: 0, count: 0 };
      }
      acc[difficulty].total += attempt.percentage;
      acc[difficulty].count += 1;
      return acc;
    }, {});

    return Object.entries(difficultyGroups)
      .map(([difficulty, data]) => ({
        tag: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quizzes`,
        averageScore: Math.round(data.total / data.count),
        attemptCount: data.count
      }))
      .filter(item => item.averageScore < 80) // Only show areas that need improvement
      .sort((a, b) => a.averageScore - b.averageScore);
  };

  return {
    stats,
    achievements,
    recentAttempts,
    scoreProgress,
    weaknesses,
    loading,
    error,
    refetch: loadUserData
  };
}