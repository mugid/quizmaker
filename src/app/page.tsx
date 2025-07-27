import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { quizzes, user } from '@/lib/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { QuizCard } from '@/components/quiz/quiz-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Star,
  Clock,
  Target,
  Brain,
  Trophy
} from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Brain className="h-4 w-4" />
              <span>Welcome back, {session.user.name}!</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              QuizMaker
            </h1>
            
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              Create engaging quizzes, challenge your knowledge, and compete with others in our interactive learning platform
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/quiz/create">
                <Plus className="h-5 w-5 mr-2" />
                Create New Quiz
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/dashboard">
                <Target className="h-5 w-5 mr-2" />
                My Dashboard
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/leaderboard">
                <Trophy className="h-5 w-5 mr-2" />
                Leaderboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Quizzes</p>
                  <p className="text-2xl font-bold text-blue-700">{publishedQuizzes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-700">1.2k</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-purple-700">94%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-orange-700">4.8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Popular Categories</span>
            </CardTitle>
            <CardDescription>
              Explore quizzes by topic and find your area of interest
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['JavaScript', 'Python', 'React', 'CSS', 'Node.js', 'Database', 'Algorithms', 'Machine Learning'].map((category) => (
                <Badge 
                  key={category} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="flex items-center space-x-2 text-2xl">
                  <Clock className="h-6 w-6" />
                  <span>Latest Quizzes</span>
                </CardTitle>
                <CardDescription className="mt-1">
                  Discover recently published quizzes from our community
                </CardDescription>
              </div>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search quizzes..."
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-6">
            {publishedQuizzes.length > 0 ? (
              <>
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

                {/* Load More Button */}
                <div className="flex justify-center mt-8">
                  <Button variant="outline" size="lg">
                    Load More Quizzes
                  </Button>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-16 space-y-4">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No quizzes yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Be the first to create a quiz and start building our learning community
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
                  <Button size="lg" asChild>
                    <Link href="/quiz/create">
                      <Plus className="h-5 w-5 mr-2" />
                      Create First Quiz
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/docs">
                      Learn How to Create
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <div className="mt-12 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Join thousands of learners and educators</span>
          </div>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/help" className="hover:text-foreground transition-colors">
              Help Center
            </Link>
            <Link href="/community" className="hover:text-foreground transition-colors">
              Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}