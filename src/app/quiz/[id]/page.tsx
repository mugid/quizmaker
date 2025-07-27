import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getQuizWithQuestions, getUserBestAttempt } from '@/server/queries';
import { auth } from '@/lib/auth';
import QuizTaker from '@/components/quiz/quiz-taker';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {headers } from 'next/headers'

interface QuizPageProps {
  params: {
    id: string;
  };
}

async function QuizContent({ quizId, userId }: { quizId: string; userId: string | null }) {
  const quiz = await getQuizWithQuestions(quizId);
  
  if (!quiz) {
    notFound();
  }

  if (!quiz.isPublished) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-600 mb-4">Quiz Not Available</h1>
            <p className="text-gray-500">This quiz is not published yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  let bestAttempt = null;
  if (userId) {
    bestAttempt = await getUserBestAttempt(userId, quizId);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <QuizTaker 
        quiz={{
          ...quiz,
          description: quiz.description ?? undefined,
          tags: quiz.tags ?? undefined,
          totalPoints: quiz.totalPoints ?? 0,
          difficulty: (["easy", "medium", "hard"].includes(quiz.difficulty as string) ? quiz.difficulty : "medium") as "easy" | "medium" | "hard"
        }} 
        userId={userId} 
        bestAttempt={bestAttempt}
      />
    </div>
  );
}

function QuizSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardContent className="p-8">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-6" />
          <Skeleton className="h-32 w-full mb-6" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function QuizPage({ params }: QuizPageProps) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  const userId = session?.user?.id || null;

  return (
    <Suspense fallback={<QuizSkeleton />}>
      <QuizContent quizId={params.id} userId={userId} />
    </Suspense>
  );
}

export async function generateMetadata({ params }: QuizPageProps) {
  const quiz = await getQuizWithQuestions(params.id);
  
  if (!quiz) {
    return {
      title: 'Quiz Not Found'
    };
  }

  return {
    title: `${quiz.title} - Quiz`,
    description: quiz.description || `Take the ${quiz.title} quiz and test your knowledge!`
  };
}