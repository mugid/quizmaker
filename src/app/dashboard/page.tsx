import { redirect } from "next/navigation"
import { DashboardClient } from "./dashboard-client"
import { getDashboardData } from "./actions"
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'


export default async function DashboardPage() {
  const currentUser = await auth.api.getSession({
    headers: await headers()
  })

  if (!currentUser) {
    redirect("/login")
  }

  const dashboardData = await getDashboardData(currentUser.user.id)

  return <DashboardClient initialData={dashboardData} userId={currentUser.user.id} />
}
