import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getQuizWithQuestions, getUserBestAttempt } from "@/server/queries";
import { auth } from "@/lib/auth";
import QuizTaker from "@/components/quiz/quiz-taker";
import { Skeleton } from "@/components/ui/skeleton";
import { headers } from "next/headers";

interface QuizPageProps {
  params: Promise<{ slug: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id || null;
  const { slug } = await params;

  const quiz = await getQuizWithQuestions(slug);

  if (!quiz) {
    return notFound();
  }

  // Ensure difficulty is always a valid string
  const validDifficulty =
    quiz.difficulty === "easy" ||
    quiz.difficulty === "medium" ||
    quiz.difficulty === "hard"
      ? quiz.difficulty
      : "medium";

  const bestAttempt =
    userId && quiz?.id ? await getUserBestAttempt(userId, quiz.id) : null;

  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <QuizTaker
        quiz={{
          ...quiz,
          totalPoints: quiz.totalPoints ?? 0,
          difficulty: validDifficulty,
          questions: quiz.questions.map((q) => ({
            ...q,
            type: q.type as "multiple_choice" | "checkbox" | "short_answer",
            options: Array.isArray(q.options)
              ? (q.options as string[])
              : undefined,
            correctAnswers: Array.isArray(q.correctAnswers)
              ? (q.correctAnswers as string[])
              : undefined,
            points: q.points ?? 0,
            explanation: q.explanation === null ? undefined : q.explanation,
          })),
        }}
        bestAttempt={bestAttempt}
        userId={userId}
      />
    </Suspense>
  );
}
/* No changes needed. The code already redirects to 404 using notFound() if the quiz or slug is missing. */
export async function generateMetadata({ params }: QuizPageProps) {
  const { slug } = await params;
  const quiz = await getQuizWithQuestions(slug);

  if (!quiz) {
    return {
      title: "Quiz Not Found",
    };
  }

  return {
    title: `${quiz.title} - Quiz`,
    description:
      quiz.description ||
      `Take the ${quiz.title} quiz and test your knowledge!`,
  };
}
