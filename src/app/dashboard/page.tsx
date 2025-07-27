'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  TrendingUp,
  Brain,
  Trophy,
  Play,
  Edit,
  Eye,
  Heart,
  Calendar
} from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  creatorImage?: string;
  tags: string[];
  totalPoints: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  isPublished: boolean;
  createdAt: string;
  attemptCount: number;
  averageScore: number;
  isFavorited?: boolean;
}

interface DashboardStats {
  totalQuizzesTaken: number;
  totalQuizzesCreated: number;
  averageScore: number;
  currentStreak: number;
  totalPoints: number;
  rank: number;
}

// Mock data - replace with actual API calls
const mockStats: DashboardStats = {
  totalQuizzesTaken: 45,
  totalQuizzesCreated: 12,
  averageScore: 78,
  currentStreak: 5,
  totalPoints: 2840,
  rank: 23
};

const mockRecentQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'JavaScript ES6 Features',
    description: 'Test your knowledge of modern JavaScript features',
    creatorName: 'Sarah Wilson',
    creatorImage: '/api/placeholder/40/40',
    tags: ['JavaScript', 'ES6', 'Programming'],
    totalPoints: 100,
    difficulty: 'medium',
    estimatedTime: 15,
    isPublished: true,
    createdAt: '2024-03-10T10:00:00Z',
    attemptCount: 234,
    averageScore: 82,
    isFavorited: true
  },
  {
    id: '2',
    title: 'React Hooks Deep Dive',
    description: 'Advanced concepts in React Hooks',
    creatorName: 'Mike Chen',
    creatorImage: '/api/placeholder/40/40',
    tags: ['React', 'Hooks', 'Frontend'],
    totalPoints: 120,
    difficulty: 'hard',
    estimatedTime: 25,
    isPublished: true,
    createdAt: '2024-03-09T14:30:00Z',
    attemptCount: 156,
    averageScore: 71,
    isFavorited: false
  },
  {
    id: '3',
    title: 'CSS Grid Mastery',
    description: 'Master CSS Grid layout system',
    creatorName: 'Emily Rodriguez',
    creatorImage: '/api/placeholder/40/40',
    tags: ['CSS', 'Layout', 'Design'],
    totalPoints: 80,
    difficulty: 'easy',
    estimatedTime: 12,
    isPublished: true,
    createdAt: '2024-03-08T09:15:00Z',
    attemptCount: 189,
    averageScore: 89,
    isFavorited: true
  }
];

const mockMyQuizzes: Quiz[] = [
  {
    id: '4',
    title: 'Node.js Fundamentals',
    description: 'Backend basics with Node.js',
    creatorName: 'You',
    tags: ['Node.js', 'Backend', 'JavaScript'],
    totalPoints: 90,
    difficulty: 'medium',
    estimatedTime: 20,
    isPublished: true,
    createdAt: '2024-03-05T16:20:00Z',
    attemptCount: 67,
    averageScore: 75,
    isFavorited: false
  },
  {
    id: '5',
    title: 'Database Design Principles',
    description: 'Learn database normalization and design patterns',
    creatorName: 'You',
    tags: ['Database', 'SQL', 'Design'],
    totalPoints: 110,
    difficulty: 'hard',
    estimatedTime: 30,
    isPublished: false,
    createdAt: '2024-03-03T11:45:00Z',
    attemptCount: 0,
    averageScore: 0,
    isFavorited: false
  }
];

const mockPopularTags = [
  'JavaScript', 'React', 'CSS', 'Node.js', 'Python', 'Database', 'Algorithm', 'Frontend'
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [stats] = useState<DashboardStats>(mockStats);
  const [recentQuizzes] = useState<Quiz[]>(mockRecentQuizzes);
  const [myQuizzes] = useState<Quiz[]>(mockMyQuizzes);

  const filteredQuizzes = recentQuizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => quiz.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">
          Ready to challenge yourself with some quizzes?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-lg font-bold">{stats.totalQuizzesTaken}</div>
                <p className="text-xs text-muted-foreground">Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-lg font-bold">{stats.totalQuizzesCreated}</div>
                <p className="text-xs text-muted-foreground">Created</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-lg font-bold">{stats.averageScore}%</div>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-lg font-bold">{stats.currentStreak}</div>
                <p className="text-xs text-muted-foreground">Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-lg font-bold">{stats.totalPoints.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-indigo-500" />
              <div>
                <div className="text-lg font-bold">#{stats.rank}</div>
                <p className="text-xs text-muted-foreground">Rank</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="my-quizzes">My Quizzes</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
          
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Quiz</span>
          </Button>
        </div>

        <TabsContent value="discover">
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
            </div>

            {/* Popular Tags */}
            <div className="flex flex-wrap gap-2">
              {mockPopularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Quiz Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getDifficultyColor(quiz.difficulty)}>
                      {quiz.difficulty}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Heart className={`h-4 w-4 ${quiz.isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {quiz.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={quiz.creatorImage} alt={quiz.creatorName} />
                      <AvatarFallback className="text-xs">
                        {getInitials(quiz.creatorName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{quiz.creatorName}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {quiz.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {quiz.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{quiz.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{quiz.estimatedTime}m</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{quiz.attemptCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>{quiz.averageScore}%</span>
                    </div>
                  </div>

                  <Button className="w-full flex items-center space-x-2">
                    <Play className="h-4 w-4" />
                    <span>Start Quiz</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-quizzes">
          <div className="space-y-4">
            {myQuizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold">{quiz.title}</h3>
                        <Badge className={getDifficultyColor(quiz.difficulty)}>
                          {quiz.difficulty}
                        </Badge>
                        {!quiz.isPublished && (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">
                        {quiz.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {quiz.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created {formatDate(quiz.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{quiz.attemptCount} attempts</span>
                        </div>
                        {quiz.isPublished && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>{quiz.averageScore}% avg</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentQuizzes.filter(quiz => quiz.isFavorited).map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getDifficultyColor(quiz.difficulty)}>
                      {quiz.difficulty}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {quiz.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-2 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={quiz.creatorImage} alt={quiz.creatorName} />
                      <AvatarFallback className="text-xs">
                        {getInitials(quiz.creatorName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{quiz.creatorName}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {quiz.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{quiz.estimatedTime}m</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{quiz.attemptCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>{quiz.averageScore}%</span>
                    </div>
                  </div>

                  <Button className="w-full flex items-center space-x-2">
                    <Play className="h-4 w-4" />
                    <span>Start Quiz</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}