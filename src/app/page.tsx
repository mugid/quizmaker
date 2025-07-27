import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { quizzes, user } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { QuizCard } from '@/components/quiz/quiz-card';
import { Button } from '@/components/ui/button';
import { QuizSearchFilter } from '@/components/quiz/quiz-search-filter';
import { filterQuizzes, getAllTags } from '@/server/quiz-filter-actions';
import Link from 'next/link';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Loading component for the quiz grid
function QuizGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

// Component to render the quiz grid
function QuizGrid({ quizzes }: { quizzes: any[] }) {
  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No quizzes found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria, or create a new quiz.
            </p>
          </div>
          <Button asChild>
            <Link href="/quiz/create">Create Your First Quiz</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.id}
          id={quiz.id}
          title={quiz.title}
          description={quiz.description || ''}
          tags={quiz.tags || []}
          totalPoints={quiz.totalPoints || 0}
          difficulty={quiz.difficulty}
          estimatedTime={quiz.estimatedTime}
          creatorName={quiz.creatorName || 'Unknown'}
          createdAt={quiz.createdAt}
        />
      ))}
    </div>
  );
}

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth/signin');
  }

  const initialQuizzes = await db
    .select({
      id: quizzes.id,
      title: quizzes.title,
      description: quizzes.description,
      tags: quizzes.tags,
      totalPoints: quizzes.totalPoints,
      difficulty: quizzes.difficulty,
      estimatedTime: quizzes.estimatedTime,
      createdAt: quizzes.createdAt,
      creatorName: user.name,
    })
    .from(quizzes)
    .leftJoin(user, eq(quizzes.creatorId, user.id))
    .where(eq(quizzes.isPublished, true))
    .orderBy(desc(quizzes.createdAt))
    .limit(20);

  const allTags = await getAllTags();

  return (
    <div className="space-y-8 lg:max-w-7xl md:max-w-4xl px-10 md:px-0 mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold">
          Welcome to QuizMaker
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Create engaging quizzes, challenge your knowledge, and track your progress with our interactive quiz platform.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg">
            <Link href="/quiz/create">Create Quiz</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/dashboard">My Dashboard</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/leaderboard">Leaderboard</Link>
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{initialQuizzes.length}</div>
          <div className="text-sm text-muted-foreground">Published Quizzes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{allTags.length}</div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">∞</div>
          <div className="text-sm text-muted-foreground">Learning Opportunities</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Explore Quizzes</h2>
        </div>
        {/* Popular Tags Section */}
      {allTags.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Popular Categories</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 10).map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                className="text-xs"
                asChild
              >
                <Link href={`/?tags=${encodeURIComponent(tag)}`}>
                  {tag}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}

        {/* Search and Filter - Now includes the quiz grid */}
        <QuizSearchFilter
          initialQuizzes={initialQuizzes}
          allTags={allTags}
          onFilterChange={filterQuizzes}
        />
      </div>
    </div>
  );
}