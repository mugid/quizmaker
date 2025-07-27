"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Medal,
  Crown,
  Star,
  TrendingUp,
  Users,
  Target,
  Brain,
  Award,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react"

interface LeaderboardUser {
  userId: string
  userName: string | null
  userImage: string | null
  totalPoints: number | null
  totalQuizzesTaken: number | null
  averageScore: number | null
  currentStreak: number | null
  rank: number | null
}

interface TopCreator {
  id: string
  name: string
  image?: string
  totalQuizzesCreated: number
  totalAttempts: number
  averageRating: number
  popularTags: string[]
}

interface CategoryLeader {
  id: string
  name: string
  image?: string
  category: string
  score: number
  attemptCount: number
}

interface UserStats {
  id?: string
  userId?: string
  totalQuizzesCreated?: number | null
  totalQuizzesTaken?: number | null
  totalPoints?: number | null
  averageScore?: number | null
  bestScore?: number | null
  currentStreak?: number | null
  longestStreak?: number | null
  rank?: number | null
  updatedAt?: Date
}

interface LeaderboardClientProps {
  initialData: {
    globalLeaderboard: LeaderboardUser[]
    userStats: UserStats | null
    topCreators: TopCreator[]
    categoryLeaders: CategoryLeader[]
  }
  userId: string
}

export function LeaderboardClient({ initialData, userId }: LeaderboardClientProps) {
  const [activeTab, setActiveTab] = useState("overall")
  const [timeframe, setTimeframe] = useState("all-time")

  const { globalLeaderboard, userStats, topCreators, categoryLeaders } = initialData

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRankIcon = (rank: number | null) => {
    if (!rank) return <span className="text-lg font-bold text-muted-foreground">#-</span>

    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankChange = (currentRank: number | null, previousRank?: number) => {
    if (!currentRank || !previousRank) return <Minus className="h-4 w-4 text-muted-foreground" />
    if (currentRank < previousRank) {
      return <ChevronUp className="h-4 w-4 text-green-500" />
    } else if (currentRank > previousRank) {
      return <ChevronDown className="h-4 w-4 text-red-500" />
    } else {
      return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
  }

  // Get top 3 users for podium
  const topThree = globalLeaderboard.slice(0, 3).filter((user) => user.rank && user.rank <= 3)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">See how you rank against other quiz enthusiasts</p>
      </div>

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="flex justify-center items-end space-x-8">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="text-center">
                  <div className="relative mb-4">
                    <Avatar className="h-16 w-16 mx-auto border-4 border-gray-300">
                      <AvatarImage
                        src={topThree[1].userImage || "/placeholder.svg?height=50&width=50"}
                        alt={topThree[1].userName || "User"}
                      />
                      <AvatarFallback>{getInitials(topThree[1].userName)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2">
                      <Medal className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg">{topThree[1].userName || "Unknown"}</h3>
                  <p className="text-muted-foreground text-sm">{(topThree[1].totalPoints || 0).toLocaleString()} pts</p>
                  <div className="bg-gray-100 h-16 mt-4 rounded-t-lg flex items-end justify-center">
                    <span className="text-2xl font-bold text-gray-600 mb-2">2</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className="text-center">
                  <div className="relative mb-4">
                    <Avatar className="h-20 w-20 mx-auto border-4 border-yellow-400">
                      <AvatarImage
                        src={topThree[0].userImage || "/placeholder.svg?height=50&width=50"}
                        alt={topThree[0].userName || "User"}
                      />
                      <AvatarFallback>{getInitials(topThree[0].userName)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2">
                      <Crown className="h-10 w-10 text-yellow-500" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-xl">{topThree[0].userName || "Unknown"}</h3>
                  <p className="text-muted-foreground text-sm">{(topThree[0].totalPoints || 0).toLocaleString()} pts</p>
                  <div className="bg-yellow-100 h-20 mt-4 rounded-t-lg flex items-end justify-center">
                    <span className="text-3xl font-bold text-yellow-600 mb-2">1</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="text-center">
                  <div className="relative mb-4">
                    <Avatar className="h-16 w-16 mx-auto border-4 border-amber-500">
                      <AvatarImage
                        src={topThree[2].userImage || "/placeholder.svg?height=50&width=50"}
                        alt={topThree[2].userName || "User"}
                      />
                      <AvatarFallback>{getInitials(topThree[2].userName)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2">
                      <Medal className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg">{topThree[2].userName || "Unknown"}</h3>
                  <p className="text-muted-foreground text-sm">{(topThree[2].totalPoints || 0).toLocaleString()} pts</p>
                  <div className="bg-amber-100 h-12 mt-4 rounded-t-lg flex items-end justify-center">
                    <span className="text-xl font-bold text-amber-600 mb-2">3</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeframe Selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          {["all-time", "this-month", "this-week"].map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {period === "all-time" ? "All Time" : period === "this-month" ? "This Month" : "This Week"}
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
              <CardDescription>Rankings based on total points earned from quiz attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {globalLeaderboard.map((user, index) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 w-16">
                        {getRankIcon(user.rank)}
                        {getRankChange(user.rank)}
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={user.userImage || "/placeholder.svg?height=50&width=50"}
                          alt={user.userName || "User"}
                        />
                        <AvatarFallback>{getInitials(user.userName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{user.userName || "Unknown User"}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{user.totalQuizzesTaken || 0} quizzes taken</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-xl font-bold text-primary">{(user.totalPoints || 0).toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">points</div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Target className="h-3 w-3" />
                        <span>{user.averageScore || 0}% avg</span>
                        <TrendingUp className="h-3 w-3" />
                        <span>{user.currentStreak || 0} streak</span>
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
              <CardDescription>Users who create the most engaging and popular quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topCreators.map((creator, index) => (
                  <div key={creator.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <span className="text-lg font-bold text-primary">#{index + 1}</span>
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={creator.image || "/placeholder.svg?height=50&width=50"} alt={creator.name} />
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
                      <div className="text-2xl font-bold text-primary">{creator.totalQuizzesCreated}</div>
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
              <CardDescription>Top performers in different quiz categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryLeaders.map((leader, index) => (
                  <div key={leader.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{leader.category}</h3>
                      <Badge className="bg-primary/10 text-primary">#{index + 1}</Badge>
                    </div>
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={leader.image || "/placeholder.svg?height=40&width=40"} alt={leader.name} />
                        <AvatarFallback className="text-sm">{getInitials(leader.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{leader.name}</div>
                        <div className="text-sm text-muted-foreground">{leader.attemptCount} attempts</div>
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
      {userStats && (
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
                  <span className="text-lg font-bold text-primary-foreground">#{userStats.rank || "-"}</span>
                </div>
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg?height=50&width=50" alt="You" />
                  <AvatarFallback>YU</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">You</h3>
                  <div className="text-sm text-muted-foreground">
                    {userStats.totalQuizzesTaken || 0} quizzes taken • {userStats.totalQuizzesCreated || 0} quizzes
                    created
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">{(userStats.totalPoints || 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">points</div>
                <div className="flex items-center space-x-2 text-sm mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">Streak: {userStats.currentStreak || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
