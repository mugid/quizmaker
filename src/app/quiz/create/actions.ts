"use server"
import {
  createQuiz,
  createQuestion,
  publishQuiz,
  updateUserQuizCreatedCount,
  checkAndAwardAchievements,
} from "@/server/queries"

interface QuestionData {
  id: string
  type: "multiple_choice" | "checkbox" | "short_answer"
  question: string
  options: string[]
  correctAnswers: string[]
  points: number
  explanation?: string
}

interface QuizFormData {
  title: string
  description?: string
  tags: string[]
  difficulty?: "easy" | "medium" | "hard"
  estimatedTime?: number
  questions: QuestionData[]
}

export async function createQuizAction(formData: QuizFormData, userId: string, publish = false) {
  try {
    // Validate required fields
    if (!formData.title.trim()) {
      return { error: "Quiz title is required" }
    }

    if (formData.questions.length === 0) {
      return { error: "At least one question is required" }
    }

    // Validate questions
    const incompleteQuestions = formData.questions.filter((q) => !q.question.trim() || q.correctAnswers.length === 0)

    if (incompleteQuestions.length > 0) {
      return { error: "Please complete all questions and mark correct answers" }
    }

    // Calculate total points
    const totalPoints = formData.questions.reduce((sum, q) => sum + q.points, 0)

    // Create the quiz
    const quiz = await createQuiz({
      title: formData.title,
      description: formData.description,
      creatorId: userId,
      tags: formData.tags,
      difficulty: formData.difficulty || "medium",
      estimatedTime: formData.estimatedTime,
    })

    if (!quiz) {
      return { error: "Failed to create quiz" }
    }

    // Create questions
    const questionPromises = formData.questions.map((question, index) =>
      createQuestion({
        quizId: quiz.id,
        type: question.type,
        question: question.question,
        options: question.options,
        correctAnswers: question.correctAnswers,
        points: question.points,
        explanation: question.explanation,
        order: index,
      }),
    )

    await Promise.all(questionPromises)

    // Update user stats
    await updateUserQuizCreatedCount(userId)

    // Check for achievements
    await checkAndAwardAchievements(userId)

    // Publish if requested
    if (publish) {
      await publishQuiz(quiz.id)
    }

    return { success: true, quizId: quiz.id }
  } catch (error) {
    console.error("Error creating quiz:", error)
    return { error: "Failed to create quiz. Please try again." }
  }
}

export async function publishQuizAction(quizId: string) {
  try {
    await publishQuiz(quizId)
    return { success: true }
  } catch (error) {
    console.error("Error publishing quiz:", error)
    return { error: "Failed to publish quiz" }
  }
}
