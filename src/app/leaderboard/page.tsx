'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  TrendingUp, 
  Users, 
  Calendar,
  Target,
  Brain,
  Award,
  ChevronUp,
  ChevronDown,
  Minus
} from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  image?: string;
  totalPoints: number;
  totalQuizzesTaken: number;
  totalQuizzesCreated: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
  previousRank?: number;
  joinedAt: string;
}

interface TopCreator {
  id: string;
  name: string;
  image?: string;
  totalQuizzesCreated: number;
  totalAttempts: number;
  averageRating: number;
  popularTags: string[];
}

interface CategoryLeader {
  id: string;
  name: string;
  image?: string;
  category: string;
  score: number;
  attemptCount: number;
}

// Mock data - replace with actual API calls
const mockLeaderboardUsers: LeaderboardUser[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    image: '/api/placeholder/50/50',
    totalPoints: 4580,
    totalQuizzesTaken: 67,
    totalQuizzesCreated: 23,
    averageScore: 92,
    currentStreak: 15,
    longestStreak: 28,
    rank: 1,
    previousRank: 2,
    joinedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Alex Rodriguez',
    image: '/api/placeholder/50/50',
    totalPoints: 4320,
    totalQuizzesTaken: 89,
    totalQuizzesCreated: 12,
    averageScore: 87,
    currentStreak: 8,
    longestStreak: 22,
    rank: 2,
    previousRank: 1,
    joinedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    name: 'Emily Johnson',
    image: '/api/placeholder/50/50',
    totalPoints: 4150,
    totalQuizzesTaken: 78,
    totalQuizzesCreated: 18,
    averageScore: 89,
    currentStreak: 12,
    longestStreak: 25,
    rank: 3,
    previousRank: 4,
    joinedAt: '2024-01-10T09:15:00Z'
  },
  {
    id: '4',
    name: 'Michael Brown',
    image: '/api/placeholder/50/50',
    totalPoints: 3980,
    totalQuizzesTaken: 56,
    totalQuizzesCreated: 31,
    averageScore: 85,
    currentStreak: 6,
    longestStreak: 19,
    rank: 4,
    previousRank: 3,
    joinedAt: '2024-02-01T16:20:00Z'
  },
  {
    id: '5',
    name: 'Jessica Davis',
    image: '/api/placeholder/50/50',
    totalPoints: 3850,
    totalQuizzesTaken: 92,
    totalQuizzesCreated: 8,
    averageScore: 83,
    currentStreak: 4,
    longestStreak: 16,
    rank: 5,
    previousRank: 5,
    joinedAt: '2024-01-25T11:45:00Z'
  },
  {
    id: '6',
    name: 'David Wilson',
    image: '/api/placeholder/50/50',
    totalPoints: 3720,
    totalQuizzesTaken: 64,
    totalQuizzesCreated: 15,
    averageScore: 88,
    currentStreak: 9,
    longestStreak: 21,
    rank: 6,
    previousRank: 7,
    joinedAt: '2024-02-05T13:10:00Z'
  },
  {
    id: '7',
    name: 'Lisa Garcia',
    image: '/api/placeholder/50/50',
    totalPoints: 3590,
    totalQuizzesTaken: 71,
    totalQuizzesCreated: 20,
    averageScore: 81,
    currentStreak: 3,
    longestStreak: 14,
    rank: 7,
    previousRank: 6,
    joinedAt: '2024-01-30T15:30:00Z'
  },
  {
    id: '8',
    name: 'Robert Taylor',
    image: '/api/placeholder/50/50',
    totalPoints: 3420,
    totalQuizzesTaken: 53,
    totalQuizzesCreated: 24,
    averageScore: 86,
    currentStreak: 7,
    longestStreak: 18,
    rank: 8,
    previousRank: 9,
    joinedAt: '2024-02-10T08:45:00Z'
  },
  {
    id: '9',
    name: 'Amanda Martinez',
    image: '/api/placeholder/50/50',
    totalPoints: 3280,
    totalQuizzesTaken: 87,
    totalQuizzesCreated: 6,
    averageScore: 79,
    currentStreak: 2,
    longestStreak: 12,
    rank: 9,
    previousRank: 8,
    joinedAt: '2024-02-12T12:20:00Z'
  },
  {
    id: '10',
    name: 'James Anderson',
    image: '/api/placeholder/50/50',
    totalPoints: 3150,
    totalQuizzesTaken: 49,
    totalQuizzesCreated: 27,
    averageScore: 84,
    currentStreak: 5,
    longestStreak: 15,
    rank: 10,
    previousRank: 11,
    joinedAt: '2024-02-08T10:15:00Z'
  }
];

const mockTopCreators: TopCreator[] = [
  {
    id: '4',
    name: 'Michael Brown',
    image: '/api/placeholder/50/50',
    totalQuizzesCreated: 31,
    totalAttempts: 1250,
    averageRating: 4.7,
    popularTags: ['JavaScript', 'React', 'Node.js']
  },
  {
    id: '10',
    name: 'James Anderson',
    image: '/api/placeholder/50/50',
    totalQuizzesCreated: 27,
    totalAttempts: 980,
    averageRating: 4.5,
    popularTags: ['Python', 'Django', 'Database']
  },
  {
    id: '1',
    name: 'Sarah Chen',
    image: '/api/placeholder/50/50',
    totalQuizzesCreated: 23,
    totalAttempts: 1150,
    averageRating: 4.8,
    popularTags: ['CSS', 'Frontend', 'Design']
  }
];

const mockCategoryLeaders: CategoryLeader[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    image: '/api/placeholder/40/40',
    category: 'JavaScript',
    score: 94,
    attemptCount: 15
  },
  {
    id: '2',
    name: 'Alex Rodriguez',
    image: '/api/placeholder/40/40',
    category: 'Python',
    score: 91,
    attemptCount: 12
  },
  {
    id: '3',
    name: 'Emily Johnson',
    image: '/api/placeholder/40/40',
    category: 'CSS',
    score: 88,
    attemptCount: 18
  },
  {
    id: '4',
    name: 'Michael Brown',
    image: '/api/placeholder/40/40',
    category: 'React',
    score: 86,
    attemptCount: 22
  }
];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('overall');
  const [timeframe, setTimeframe] = useState('all-time');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankChange = (currentRank: number, previousRank?: number) => {
    if (!previousRank) return <Minus className="h-4 w-4 text-muted-foreground" />;
    
    if (currentRank < previousRank) {
      return <ChevronUp className="h-4 w-4 text-green-500" />;
    } else if (currentRank > previousRank) {
      return <ChevronDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          See how you rank against other quiz enthusiasts
        </p>
      </div>

      {/* Top 3 Podium */}
      <Card className="mb-8">
        <CardContent className="pt-8">
          <div className="flex justify-center items-end space-x-8">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="relative mb-4">
                <Avatar className="h-16 w-16 mx-auto border-4 border-gray-300">
                  <AvatarImage src={mockLeaderboardUsers[1].image} alt={mockLeaderboardUsers[1].name} />
                  <AvatarFallback>{getInitials(mockLeaderboardUsers[1].name)}</AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2">
                  <Medal className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="font-semibold text-lg">{mockLeaderboardUsers[1].name}</h3>
              <p className="text-muted-foreground text-sm">{mockLeaderboardUsers[1].totalPoints.toLocaleString()} pts</p>
              <div className="bg-gray-100 h-16 mt-4 rounded-t-lg flex items-end justify-center">
                <span className="text-2xl font-bold text-gray-600 mb-2">2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <div className="relative mb-4">
                <Avatar className="h-20 w-20 mx-auto border-4 border-yellow-400">
                  <AvatarImage src={mockLeaderboardUsers[0].image} alt={mockLeaderboardUsers[0].name} />
                  <AvatarFallback>{getInitials(mockLeaderboardUsers[0].name)}</AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2">
                  <Crown className="h-10 w-10 text-yellow-500" />
                </div>
              </div>
              <h3 className="font-semibold text-xl">{mockLeaderboardUsers[0].name}</h3>
              <p className="text-muted-foreground text-sm">{mockLeaderboardUsers[0].totalPoints.toLocaleString()} pts</p>
              <div className="bg-yellow-100 h-20 mt-4 rounded-t-lg flex items-end justify-center">
                <span className="text-3xl font-bold text-yellow-600 mb-2">1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="relative mb-4">
                <Avatar className="h-16 w-16 mx-auto border-4 border-amber-500">
                  <AvatarImage src={mockLeaderboardUsers[2].image} alt={mockLeaderboardUsers[2].name} />
                  <AvatarFallback>{getInitials(mockLeaderboardUsers[2].name)}</AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2">
                  <Medal className="h-8 w-8 text-amber-600" />
                </div>
              </div>
              <h3 className="font-semibold text-lg">{mockLeaderboardUsers[2].name}</h3>
              <p className="text-muted-foreground text-sm">{mockLeaderboardUsers[2].totalPoints.toLocaleString()} pts</p>
              <div className="bg-amber-100 h-12 mt-4 rounded-t-lg flex items-end justify-center">
                <span className="text-xl font-bold text-amber-600 mb-2">3</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeframe Selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          {['all-time', 'this-month', 'this-week'].map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {period === 'all-time' ? 'All Time' : 
               period === 'this-month' ? 'This Month' : 'This Week'}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Leaderboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overall">Overall Rankings</TabsTrigger>
          <TabsTrigger value="creators">Top Creators</TabsTrigger>
          <TabsTrigger value="categories">Category Leaders</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Overall Leaderboard</span>
              </CardTitle>
              <CardDescription>
                Rankings based on total points earned from quiz attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLeaderboardUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 w-16">
                        {getRankIcon(user.rank)}
                        {getRankChange(user.rank, user.previousRank)}
                      </div>
                      
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold">{user.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Joined {formatDate(user.joinedAt)}</span>
                          <span>•</span>
                          <span>{user.totalQuizzesTaken} quizzes taken</span>
                          <span>•</span>
                          <span>{user.totalQuizzesCreated} quizzes created</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="text-xl font-bold text-primary">
                        {user.totalPoints.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">points</div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Target className="h-3 w-3" />
                        <span>{user.averageScore}% avg</span>
                        <TrendingUp className="h-3 w-3" />
                        <span>{user.currentStreak} streak</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Top Quiz Creators</span>
              </CardTitle>
              <CardDescription>
                Users who create the most engaging and popular quizzes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockTopCreators.map((creator, index) => (
                  <div key={creator.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <span className="text-lg font-bold text-primary">#{index + 1}</span>
                      </div>
                      
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={creator.image} alt={creator.name} />
                        <AvatarFallback>{getInitials(creator.name)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold">{creator.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          {creator.popularTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{creator.totalAttempts.toLocaleString()} total attempts</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{creator.averageRating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {creator.totalQuizzesCreated}
                      </div>
                      <div className="text-sm text-muted-foreground">quizzes created</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Category Leaders</span>
              </CardTitle>
              <CardDescription>
                Top performers in different quiz categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockCategoryLeaders.map((leader, index) => (
                  <div key={leader.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{leader.category}</h3>
                      <Badge className="bg-primary/10 text-primary">
                        #{index + 1}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={leader.image} alt={leader.name} />
                        <AvatarFallback className="text-sm">
                          {getInitials(leader.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{leader.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {leader.attemptCount} attempts
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Score</span>
                        <span className="font-medium">{leader.score}%</span>
                      </div>
                      <Progress value={leader.score} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Your Current Ranking Card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Your Current Ranking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary">
                <span className="text-lg font-bold text-primary-foreground">#23</span>
              </div>
              
              <Avatar className="h-12 w-12">
                <AvatarImage src="/api/placeholder/50/50" alt="You" />
                <AvatarFallback>YU</AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-semibold">You</h3>
                <div className="text-sm text-muted-foreground">
                  45 quizzes taken • 12 quizzes created
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xl font-bold text-primary">2,840</div>
              <div className="text-sm text-muted-foreground">points</div>
              <div className="flex items-center space-x-2 text-sm mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+3 this week</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}