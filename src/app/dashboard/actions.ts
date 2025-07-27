"use server"

import {
  getPublishedQuizzes,
  getQuizzesByUser,
  getDashboardStats,
  getUserFavoriteQuizzes,
  isQuizFavorited,
  addQuizToFavorites,
  removeQuizFromFavorites,
  searchQuizzes,
} from "@/server/queries"

export async function getDashboardData(userId: string) {
  try {
    const [stats, recentQuizzes, myQuizzes, favoriteQuizzes] = await Promise.all([
      getDashboardStats(userId),
      getPublishedQuizzes(20, 0),
      getQuizzesByUser(userId),
      getUserFavoriteQuizzes(userId),
    ])

    // Transform the data to match expected types
    const transformedRecentQuizzes = recentQuizzes.map((quiz: any) => ({
      ...quiz,
      attemptCount: 0, // You might want to add this to your queries
      averageScore: 0, // You might want to add this to your queries
      isFavorited: false, // You might want to check this for each quiz
    }))

    const transformedMyQuizzes = myQuizzes.map((quiz: any) => ({
      ...quiz,
      attemptCount: 0, // You might want to add this to your queries
      averageScore: 0, // You might want to add this to your queries
    }))

    const transformedFavoriteQuizzes = favoriteQuizzes.map((quiz: any) => ({
      ...quiz,
      attemptCount: 0, // You might want to add this to your queries
      averageScore: 0, // You might want to add this to your queries
      isFavorited: true,
    }))

    return {
      stats,
      recentQuizzes: transformedRecentQuizzes,
      myQuizzes: transformedMyQuizzes,
      favoriteQuizzes: transformedFavoriteQuizzes,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    throw new Error("Failed to load dashboard data")
  }
}

export async function toggleQuizFavorite(userId: string, quizId: string) {
  try {
    const isFavorited = await isQuizFavorited(userId, quizId)

    if (isFavorited) {
      await removeQuizFromFavorites(userId, quizId)
      return { isFavorited: false }
    } else {
      await addQuizToFavorites(userId, quizId)
      return { isFavorited: true }
    }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    throw new Error("Failed to update favorite status")
  }
}

export async function searchQuizzesAction(searchTerm: string, tags?: string[]) {
  try {
    const results = await searchQuizzes(searchTerm, tags)
    return results.map((quiz: any) => ({
      ...quiz,
      attemptCount: 0, // You might want to add this to your queries
      averageScore: 0, // You might want to add this to your queries
      isFavorited: false, // You might want to check this for each quiz
    }))
  } catch (error) {
    console.error("Error searching quizzes:", error)
    throw new Error("Failed to search quizzes")
  }
}
