'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/user-avatar';
import { 
  Trophy, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Award,
  Star,
  Clock,
  BarChart3,
  Users,
  Brain
} from 'lucide-react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart } from 'recharts';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
}

interface UserStats {
  totalQuizzesCreated: number;
  totalQuizzesTaken: number;
  totalPoints: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  rank: number;
}

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  iconName: string;
  earnedAt: string;
}

interface QuizAttempt {
  id: string;
  quizTitle: string;
  score: number;
  totalPoints: number;
  percentage: number;
  completedAt: string;
  timeSpent?: number;
}

interface WeaknessData {
  tag: string;
  averageScore: number;
  attemptCount: number;
}

// Mock data - replace with actual API calls
const mockUserProfile: UserProfile = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  image: '/api/placeholder/100/100',
  createdAt: '2024-01-15T10:00:00Z'
};

const mockUserStats: UserStats = {
  totalQuizzesCreated: 12,
  totalQuizzesTaken: 45,
  totalPoints: 2840,
  averageScore: 78,
  bestScore: 95,
  currentStreak: 5,
  longestStreak: 12,
  rank: 23
};

const mockAchievements: Achievement[] = [
  {
    id: '1',
    type: 'quiz_master',
    title: 'Quiz Master',
    description: 'Created 10 quizzes',
    iconName: 'Trophy',
    earnedAt: '2024-03-01T10:00:00Z'
  },
  {
    id: '2',
    type: 'perfect_score',
    title: 'Perfect Score',
    description: 'Achieved 100% on a quiz',
    iconName: 'Target',
    earnedAt: '2024-02-15T14:30:00Z'
  },
  {
    id: '3',
    type: 'streak_master',
    title: 'Streak Master',
    description: 'Maintained a 10-day streak',
    iconName: 'TrendingUp',
    earnedAt: '2024-02-28T09:15:00Z'
  }
];

const mockRecentAttempts: QuizAttempt[] = [
  {
    id: '1',
    quizTitle: 'JavaScript Fundamentals',
    score: 85,
    totalPoints: 100,
    percentage: 85,
    completedAt: '2024-03-10T15:30:00Z',
    timeSpent: 1200
  },
  {
    id: '2',
    quizTitle: 'React Hooks Deep Dive',
    score: 92,
    totalPoints: 120,
    percentage: 77,
    completedAt: '2024-03-09T11:20:00Z',
    timeSpent: 1800
  },
  {
    id: '3',
    quizTitle: 'CSS Grid Layout',
    score: 78,
    totalPoints: 90,
    percentage: 87,
    completedAt: '2024-03-08T14:45:00Z',
    timeSpent: 900
  }
];

const mockScoreProgress = [
  { date: '2024-01', score: 65 },
  { date: '2024-02', score: 72 },
  { date: '2024-03', score: 78 },
  { date: '2024-04', score: 82 },
  { date: '2024-05', score: 85 },
  { date: '2024-06', score: 78 },
  { date: '2024-07', score: 88 }
];

const mockWeaknesses: WeaknessData[] = [
  { tag: 'Advanced CSS', averageScore: 62, attemptCount: 8 },
  { tag: 'Node.js', averageScore: 68, attemptCount: 5 },
  { tag: 'Database Design', averageScore: 71, attemptCount: 6 },
  { tag: 'Algorithms', averageScore: 65, attemptCount: 12 }
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile] = useState<UserProfile>(mockUserProfile);
  const [stats] = useState<UserStats>(mockUserStats);
  const [achievements] = useState<Achievement[]>(mockAchievements);
  const [recentAttempts] = useState<QuizAttempt[]>(mockRecentAttempts);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Profile Header */}
      <div className="mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              {/* <Avatar className="h-24 w-24">
                <AvatarImage src={profile.image} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar> */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                <p className="text-muted-foreground mb-4">{profile.email}</p>
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(profile.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-4 w-4" />
                    <span>Rank #{stats.rank}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {stats.totalPoints.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalQuizzesTaken}</div>
                <p className="text-sm text-muted-foreground">Quizzes Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalQuizzesCreated}</div>
                <p className="text-sm text-muted-foreground">Quizzes Created</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.currentStreak}</div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Score</span>
                    <span>{stats.averageScore}%</span>
                  </div>
                  <Progress value={stats.averageScore} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Best Score</span>
                    <span>{stats.bestScore}%</span>
                  </div>
                  <Progress value={stats.bestScore} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold">{stats.longestStreak}</div>
                    <p className="text-sm text-muted-foreground">Longest Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{stats.currentStreak}</div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Areas for Improvement */}
            <Card>
              <CardHeader>
                <CardTitle>Areas for Improvement</CardTitle>
                <CardDescription>
                  Topics where you could focus more attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockWeaknesses.map((weakness, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{weakness.tag}</span>
                        <Badge variant="outline">{weakness.averageScore}%</Badge>
                      </div>
                      <Progress value={weakness.averageScore} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {weakness.attemptCount} attempts
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Your Achievements</span>
              </CardTitle>
              <CardDescription>
                Badges and milestones you've earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className="border-2 border-muted">
                    <CardContent className="pt-6 text-center">
                      <div className="mb-4">
                        <Trophy className="h-12 w-12 mx-auto text-yellow-500" />
                      </div>
                      <h3 className="font-semibold mb-2">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Earned {formatDate(achievement.earnedAt)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Score Progress Over Time</CardTitle>
              <CardDescription>
                Track your improvement over the months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockScoreProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>
                Your average scores by topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockWeaknesses}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tag" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="averageScore" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Quiz Attempts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{attempt.quizTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        Completed {formatDate(attempt.completedAt)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={attempt.percentage >= 80 ? "default" : attempt.percentage >= 60 ? "secondary" : "destructive"}>
                          {attempt.percentage}%
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {attempt.score}/{attempt.totalPoints}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Time: {formatDuration(attempt.timeSpent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}