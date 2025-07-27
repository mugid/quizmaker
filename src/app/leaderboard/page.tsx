import { redirect } from "next/navigation"
import { LeaderboardClient } from "./leaderboard-client"
import { getLeaderboardData } from "./actions"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"


export default async function LeaderboardPage() {
  const currentUser = await auth.api.getSession({
    headers: await headers()
  })

  if (!currentUser) {
    redirect("/login")
  }

  const leaderboardData = await getLeaderboardData(currentUser.user.id)

  return <LeaderboardClient initialData={leaderboardData} userId={currentUser.user.id} />
}
