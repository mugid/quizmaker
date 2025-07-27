"use server"

import { getGlobalLeaderboard, getUserStats } from "@/server/queries"

export async function getLeaderboardData(userId: string) {
  try {
    const [globalLeaderboard, userStats] = await Promise.all([getGlobalLeaderboard(50), getUserStats(userId)])

    const topCreators = [
      {
        id: "4",
        name: "Michael Brown",
        image: "/placeholder.svg?height=50&width=50",
        totalQuizzesCreated: 31,
        totalAttempts: 1250,
        averageRating: 4.7,
        popularTags: ["JavaScript", "React", "Node.js"],
      },
      {
        id: "10",
        name: "James Anderson",
        image: "/placeholder.svg?height=50&width=50",
        totalQuizzesCreated: 27,
        totalAttempts: 980,
        averageRating: 4.5,
        popularTags: ["Python", "Django", "Database"],
      },
      {
        id: "1",
        name: "Sarah Chen",
        image: "/placeholder.svg?height=50&width=50",
        totalQuizzesCreated: 23,
        totalAttempts: 1150,
        averageRating: 4.8,
        popularTags: ["CSS", "Frontend", "Design"],
      },
    ]

    const categoryLeaders = [
      {
        id: "1",
        name: "Sarah Chen",
        image: "/placeholder.svg?height=40&width=40",
        category: "JavaScript",
        score: 94,
        attemptCount: 15,
      },
      {
        id: "2",
        name: "Alex Rodriguez",
        image: "/placeholder.svg?height=40&width=40",
        category: "Python",
        score: 91,
        attemptCount: 12,
      },
      {
        id: "3",
        name: "Emily Johnson",
        image: "/placeholder.svg?height=40&width=40",
        category: "CSS",
        score: 88,
        attemptCount: 18,
      },
      {
        id: "4",
        name: "Michael Brown",
        image: "/placeholder.svg?height=40&width=40",
        category: "React",
        score: 86,
        attemptCount: 22,
      },
    ]

    return {
      globalLeaderboard,
      userStats,
      topCreators,
      categoryLeaders,
    }
  } catch (error) {
    console.error("Error fetching leaderboard data:", error)
    throw new Error("Failed to load leaderboard data")
  }
}
