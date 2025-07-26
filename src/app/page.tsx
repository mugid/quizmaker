import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { quizzes, user } from '@/lib/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { QuizCard } from '@/components/quiz/quiz-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/signin');
  }

  // Get published quizzes with creator info
  const publishedQuizzes = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      tags: quizzes.tags,
      totalPoints: quizzes.totalPoints,
      createdAt: quizzes.createdAt,
      creatorName: user.name,
    })
    .from(quizzes)
    .leftJoin(user, eq(quizzes.creatorId, user.id))
    .where(eq(quizzes.isPublished, true))
    .orderBy(desc(quizzes.createdAt))
    .limit(20);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to QuizMaker</h1>
        <p className="text-muted-foreground text-lg">
          Create, share, and take interactive quizzes
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/quiz/create">Create Quiz</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">My Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent Quizzes</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Search quizzes..."
              className="w-64"
            />
            <Button variant="outline">Filter</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              id={quiz.id}
              title={quiz.title}
              description={quiz.description || ''}
              tags={quiz.tags || []}
              totalPoints={quiz.totalPoints || 0}
              creatorName={quiz.creatorName || 'Unknown'}
              createdAt={quiz.createdAt}
            />
          ))}
        </div>

        {publishedQuizzes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No quizzes available yet.</p>
            <Button className="mt-4" asChild>
              <Link href="/quiz/create">Create the first quiz</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}