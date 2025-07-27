import { redirect } from "next/navigation"
import { CreateQuizForm } from "@/app/quiz/create/create-quiz-form"
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function CreateQuizPage() {
  const currentUser = await auth.api.getSession({
    headers: await headers()
  })

  if (!currentUser) {
    redirect("/login")
  }

  return <CreateQuizForm currentUserId={currentUser.user.id} />
}
