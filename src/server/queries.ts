"use server";

import { db } from '@/lib/db';
import { 
  user, 
  quizzes, 
  questions, 
  quizAttempts, 
  achievements, 
  userStats, 
  quizFavorites 
} from '@/lib/db/schema'; 
import { eq, desc, asc, and, sql, inArray, count, avg, max } from 'drizzle-orm';

// ==================== QUIZ QUERIES ====================

export const getQuizById = async (quizId: string) => {
  const result = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);
  return result[0];
};

export const getQuizWithQuestions = async (quizId: string) => {
  const quiz = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!quiz[0]) return null;

  const quizQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, quizId))
    .orderBy(asc(questions.order));

  return {
    ...quiz[0],
    questions: quizQuestions
  };
};

export const getPublishedQuizzes = async (limit = 20, offset = 0) => {
  return await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      creatorId: quizzes.creatorId,
      tags: quizzes.tags,
      totalPoints: quizzes.totalPoints,
      difficulty: quizzes.difficulty,
      estimatedTime: quizzes.estimatedTime,
      createdAt: quizzes.createdAt,
      creatorName: user.name
    })
    .from(quizzes)
    .leftJoin(user, eq(quizzes.creatorId, user.id))
    .where(eq(quizzes.isPublished, true))
    .orderBy(desc(quizzes.createdAt))
    .limit(limit)
    .offset(offset);
};

export const getQuizzesByUser = async (userId: string) => {
  return await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.creatorId, userId))
    .orderBy(desc(quizzes.createdAt));
};

export const searchQuizzes = async (searchTerm: string, tags?: string[]) => {
  const conditions = [
    eq(quizzes.isPublished, true),
    sql`${quizzes.title} ILIKE ${`%${searchTerm}%`} OR ${quizzes.description} ILIKE ${`%${searchTerm}%`}`
  ];

  if (tags && tags.length > 0) {
    conditions.push(sql`${quizzes.tags} && ${tags}`);
  }

  return await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      creatorId: quizzes.creatorId,
      tags: quizzes.tags,
      totalPoints: quizzes.totalPoints,
      difficulty: quizzes.difficulty,
      isPublished: quizzes.isPublished,
      estimatedTime: quizzes.estimatedTime,
      createdAt: quizzes.createdAt,
      creatorName: user.name
    })
    .from(quizzes)
    .leftJoin(user, eq(quizzes.creatorId, user.id))
    .where(and(...conditions))
    .orderBy(desc(quizzes.createdAt));
};

export const createQuiz = async (quizData: {
  title: string;
  description?: string;
  creatorId: string;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;
}) => {
  const result = await db
    .insert(quizzes)
    .values(quizData)
    .returning();
  return result[0];
};

export const updateQuiz = async (quizId: string, updates: Partial<{
  title: string;
  description: string;
  tags: string[];
  isPublished: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
}>) => {
  const result = await db
    .update(quizzes)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(quizzes.id, quizId))
    .returning();
  return result[0];
};

export const deleteQuiz = async (quizId: string) => {
  await db.delete(quizzes).where(eq(quizzes.id, quizId));
};

export const publishQuiz = async (quizId: string) => {
  // Calculate total points
  const totalPointsResult = await db
    .select({ total: sql<number>`SUM(${questions.points})` })
    .from(questions)
    .where(eq(questions.quizId, quizId));

  const totalPoints = totalPointsResult[0]?.total || 0;

  const result = await db
    .update(quizzes)
    .set({ 
      isPublished: true, 
      totalPoints,
      updatedAt: new Date() 
    })
    .where(eq(quizzes.id, quizId))
    .returning();
  return result[0];
};

// ==================== QUESTION QUERIES ====================

export const getQuestionsByQuizId = async (quizId: string) => {
  return await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, quizId))
    .orderBy(asc(questions.order));
};

export const createQuestion = async (questionData: {
  quizId: string;
  type: 'multiple_choice' | 'checkbox' | 'short_answer';
  question: string;
  options?: any;
  correctAnswers: any;
  points?: number;
  explanation?: string;
  order: number;
}) => {
  const result = await db
    .insert(questions)
    .values(questionData)
    .returning();
  return result[0];
};

export const updateQuestion = async (questionId: string, updates: Partial<{
  type: 'multiple_choice' | 'checkbox' | 'short_answer';
  question: string;
  options: any;
  correctAnswers: any;
  points: number;
  explanation: string;
  order: number;
}>) => {
  const result = await db
    .update(questions)
    .set(updates)
    .where(eq(questions.id, questionId))
    .returning();
  return result[0];
};

export const deleteQuestion = async (questionId: string) => {
  await db.delete(questions).where(eq(questions.id, questionId));
};

export const reorderQuestions = async (questionUpdates: { id: string; order: number }[]) => {
  const promises = questionUpdates.map(({ id, order }) =>
    db.update(questions)
      .set({ order })
      .where(eq(questions.id, id))
  );
  await Promise.all(promises);
};

// ==================== QUIZ ATTEMPT QUERIES ====================

export const createQuizAttempt = async (attemptData: {
  quizId: string;
  userId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  answers: any;
  timeSpent?: number;
}) => {
  const result = await db
    .insert(quizAttempts)
    .values(attemptData)
    .returning();
  
  // Update user stats after creating attempt
  await updateUserStatsAfterAttempt(attemptData.userId, attemptData.percentage);
  
  return result[0];
};

export const getQuizAttemptsByUser = async (userId: string, limit = 20) => {
  return await db
    .select({
      id: quizAttempts.id,
      quizId: quizAttempts.quizId,
      score: quizAttempts.score,
      totalPoints: quizAttempts.totalPoints,
      percentage: quizAttempts.percentage,
      timeSpent: quizAttempts.timeSpent,
      completedAt: quizAttempts.completedAt,
      quizTitle: quizzes.title,
      quizDifficulty: quizzes.difficulty
    })
    .from(quizAttempts)
    .leftJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
    .where(eq(quizAttempts.userId, userId))
    .orderBy(desc(quizAttempts.completedAt))
    .limit(limit);
};

export const getQuizAttemptsByQuiz = async (quizId: string, limit = 50) => {
  return await db
    .select({
      id: quizAttempts.id,
      userId: quizAttempts.userId,
      score: quizAttempts.score,
      totalPoints: quizAttempts.totalPoints,
      percentage: quizAttempts.percentage,
      timeSpent: quizAttempts.timeSpent,
      completedAt: quizAttempts.completedAt,
      userName: user.name
    })
    .from(quizAttempts)
    .leftJoin(user, eq(quizAttempts.userId, user.id))
    .where(eq(quizAttempts.quizId, quizId))
    .orderBy(desc(quizAttempts.percentage), desc(quizAttempts.completedAt))
    .limit(limit);
};

export const getUserBestAttempt = async (userId: string, quizId: string) => {
  const result = await db
    .select()
    .from(quizAttempts)
    .where(and(
      eq(quizAttempts.userId, userId),
      eq(quizAttempts.quizId, quizId)
    ))
    .orderBy(desc(quizAttempts.percentage))
    .limit(1);
  return result[0];
};

export const getQuizLeaderboard = async (quizId: string, limit = 10) => {
  return await db
    .select({
      userId: quizAttempts.userId,
      userName: user.name,
      bestScore: max(quizAttempts.percentage),
      bestTime: sql<number>`MIN(${quizAttempts.timeSpent}) FILTER (WHERE ${quizAttempts.percentage} = MAX(${quizAttempts.percentage}))`,
      attemptCount: count(quizAttempts.id)
    })
    .from(quizAttempts)
    .leftJoin(user, eq(quizAttempts.userId, user.id))
    .where(eq(quizAttempts.quizId, quizId))
    .groupBy(quizAttempts.userId, user.name)
    .orderBy(desc(sql`MAX(${quizAttempts.percentage})`), asc(sql`MIN(${quizAttempts.timeSpent})`))
    .limit(limit);
};

// ==================== USER STATS QUERIES ====================

export const getUserStats = async (userId: string) => {
  const result = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);
  return result[0];
};

export const updateUserStatsAfterAttempt = async (userId: string, percentage: number) => {
  const stats = await getUserStats(userId);
  
  if (!stats) {
    // Create initial stats
    await db.insert(userStats).values({
      userId,
      totalQuizzesTaken: 1,
      totalPoints: percentage,
      averageScore: percentage,
      bestScore: percentage,
      currentStreak: percentage >= 70 ? 1 : 0,
      longestStreak: percentage >= 70 ? 1 : 0
    });
  } else {
    const newTotalTaken = (stats.totalQuizzesTaken ?? 0) + 1;
    const newTotalPoints = (stats.totalPoints ?? 0) + percentage;
    const newAverageScore = Math.round(newTotalPoints / newTotalTaken);
    const newBestScore = Math.max(stats.bestScore ?? 0, percentage);
    const newCurrentStreak = percentage >= 70 ? (stats.currentStreak ?? 0) + 1 : 0;
    const newLongestStreak = Math.max(stats.longestStreak ?? 0, newCurrentStreak);

    await db
      .update(userStats)
      .set({
        totalQuizzesTaken: newTotalTaken,
        totalPoints: newTotalPoints,
        averageScore: newAverageScore,
        bestScore: newBestScore,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        updatedAt: new Date()
      })
      .where(eq(userStats.userId, userId));
  }
};

export const updateUserQuizCreatedCount = async (userId: string) => {
  const stats = await getUserStats(userId);
  
  if (!stats) {
    await db.insert(userStats).values({
      userId,
      totalQuizzesCreated: 1
    });
  } else {
    await db
      .update(userStats)
      .set({
        totalQuizzesCreated: (stats.totalQuizzesCreated ?? 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(userStats.userId, userId));
  }
};

export const getGlobalLeaderboard = async (limit = 50) => {
  return await db
    .select({
      userId: userStats.userId,
      userName: user.name,
      userImage: user.image,
      totalPoints: userStats.totalPoints,
      averageScore: userStats.averageScore,
      totalQuizzesTaken: userStats.totalQuizzesTaken,
      currentStreak: userStats.currentStreak,
      rank: userStats.rank
    })
    .from(userStats)
    .leftJoin(user, eq(userStats.userId, user.id))
    .orderBy(desc(userStats.totalPoints), desc(userStats.averageScore))
    .limit(limit);
};

// ==================== FAVORITES QUERIES ====================

export const addQuizToFavorites = async (userId: string, quizId: string) => {
  const result = await db
    .insert(quizFavorites)
    .values({ userId, quizId })
    .returning();
  return result[0];
};

export const removeQuizFromFavorites = async (userId: string, quizId: string) => {
  await db
    .delete(quizFavorites)
    .where(and(
      eq(quizFavorites.userId, userId),
      eq(quizFavorites.quizId, quizId)
    ));
};

export const getUserFavoriteQuizzes = async (userId: string) => {
  return await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      creatorId: quizzes.creatorId,
      tags: quizzes.tags,
      totalPoints: quizzes.totalPoints,
      difficulty: quizzes.difficulty,
      estimatedTime: quizzes.estimatedTime,
      createdAt: quizzes.createdAt,
      favoriteCreatedAt: quizFavorites.createdAt,
      creatorName: user.name
    })
    .from(quizFavorites)
    .leftJoin(quizzes, eq(quizFavorites.quizId, quizzes.id))
    .leftJoin(user, eq(quizzes.creatorId, user.id))
    .where(eq(quizFavorites.userId, userId))
    .orderBy(desc(quizFavorites.createdAt));
};

export const isQuizFavorited = async (userId: string, quizId: string) => {
  const result = await db
    .select()
    .from(quizFavorites)
    .where(and(
      eq(quizFavorites.userId, userId),
      eq(quizFavorites.quizId, quizId)
    ))
    .limit(1);
  return result.length > 0;
};

// ==================== ACHIEVEMENT QUERIES ====================

export const createAchievement = async (achievementData: {
  userId: string;
  type: string;
  title: string;
  description?: string;
  iconName?: string;
}) => {
  const result = await db
    .insert(achievements)
    .values(achievementData)
    .returning();
  return result[0];
};

export const getUserAchievements = async (userId: string) => {
  return await db
    .select()
    .from(achievements)
    .where(eq(achievements.userId, userId))
    .orderBy(desc(achievements.earnedAt));
};

export const checkAndAwardAchievements = async (userId: string) => {
  const stats = await getUserStats(userId);
  if (!stats) return;

  const existingAchievements = await getUserAchievements(userId);
  const achievementTypes = existingAchievements.map(a => a.type);

  const achievementsToAward = [];

  // First Quiz Achievement
  if ((stats.totalQuizzesTaken ?? 0) >= 1 && !achievementTypes.includes('first_quiz')) {
    achievementsToAward.push({
      userId,
      type: 'first_quiz',
      title: 'Getting Started',
      description: 'Completed your first quiz!',
      iconName: 'Trophy'
    });
  }

  // Quiz Master Achievement
  if ((stats.totalQuizzesTaken ?? 0) >= 10 && !achievementTypes.includes('quiz_master')) {
    achievementsToAward.push({
      userId,
      type: 'quiz_master',
      title: 'Quiz Master',
      description: 'Completed 10 quizzes!',
      iconName: 'Crown'
    });
  }

  // Perfect Score Achievement
  if (stats.bestScore === 100 && !achievementTypes.includes('perfect_score')) {
    achievementsToAward.push({
      userId,
      type: 'perfect_score',
      title: 'Perfect Score',
      description: 'Achieved a perfect score!',
      iconName: 'Star'
    });
  }

  // Streak Achievements
  if ((stats.currentStreak ?? 0) >= 5 && !achievementTypes.includes('streak_5')) {
    achievementsToAward.push({
      userId,
      type: 'streak_5',
      title: 'On Fire',
      description: 'Maintained a 5-quiz streak!',
      iconName: 'Flame'
    });
  }

  // Creator Achievement
  if ((stats.totalQuizzesCreated ?? 0) >= 1 && !achievementTypes.includes('first_creator')) {
    achievementsToAward.push({
      userId,
      type: 'first_creator',
      title: 'Quiz Creator',
      description: 'Created your first quiz!',
      iconName: 'Lightbulb'
    });
  }

  // Award new achievements
  for (const achievement of achievementsToAward) {
    await createAchievement(achievement);
  }

  return achievementsToAward;
};

// ==================== ANALYTICS QUERIES ====================

export const getQuizAnalytics = async (quizId: string) => {
  const totalAttempts = await db
    .select({ count: count() })
    .from(quizAttempts)
    .where(eq(quizAttempts.quizId, quizId));

  const avgScore = await db
    .select({ avg: avg(quizAttempts.percentage) })
    .from(quizAttempts)
    .where(eq(quizAttempts.quizId, quizId));

  const avgTime = await db
    .select({ avg: avg(quizAttempts.timeSpent) })
    .from(quizAttempts)
    .where(eq(quizAttempts.quizId, quizId));

  return {
    totalAttempts: totalAttempts[0]?.count || 0,
    averageScore: Math.round(Number(avgScore[0]?.avg) || 0),
    averageTime: Math.round(Number(avgTime[0]?.avg) || 0)
  };
};

export const getDashboardStats = async (userId: string) => {
  const userQuizCount = await db
    .select({ count: count() })
    .from(quizzes)
    .where(eq(quizzes.creatorId, userId));

  const publishedQuizCount = await db
    .select({ count: count() })
    .from(quizzes)
    .where(and(
      eq(quizzes.creatorId, userId),
      eq(quizzes.isPublished, true)
    ));

  const totalAttempts = await db
    .select({ count: count() })
    .from(quizAttempts)
    .leftJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
    .where(eq(quizzes.creatorId, userId));

  const stats = await getUserStats(userId);

  return {
    totalQuizzesCreated: userQuizCount[0]?.count || 0,
    publishedQuizzes: publishedQuizCount[0]?.count || 0,
    totalAttemptsOnMyQuizzes: totalAttempts[0]?.count || 0,
    myQuizzesTaken: stats?.totalQuizzesTaken || 0,
    myAverageScore: stats?.averageScore || 0,
    myCurrentStreak: stats?.currentStreak || 0
  };
};