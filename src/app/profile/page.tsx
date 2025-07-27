import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from 'next/navigation';
import ProfileClient from './profileClient';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
}

export default async function ProfilePage() {

  const currentUser = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!currentUser) {
    redirect('/login');
  }

  const userId = currentUser.user.id;
  
 
  const user: UserProfile = {
    id: currentUser.user.id,
    name: currentUser.user.name || 'Unknown User',
    email: currentUser.user.email || '',
    image: currentUser.user.image || undefined,
    createdAt: currentUser.user.createdAt instanceof Date 
      ? currentUser.user.createdAt.toISOString() 
      : (typeof currentUser.user.createdAt === 'string' ? currentUser.user.createdAt : new Date().toISOString())
  };

  return <ProfileClient user={user} />;
}
