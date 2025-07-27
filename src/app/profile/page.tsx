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

interface ProfilePageProps {
  // You can add params if this is a dynamic route
  params?: { userId?: string };
}

export default async function ProfilePage({ params }: ProfilePageProps = {}) {
  // Get the current user from your auth system

  const currentUser = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!currentUser) {
    redirect('/login');
  }

  // If you want to support viewing other users' profiles via params
  const userId = params?.userId || currentUser.user.id;
  
  // For security, you might want to check if the user can view this profile
  if (userId !== currentUser.user.id) {
    // Add your authorization logic here
    // For example, check if profiles are public or if users are friends
    // redirect('/unauthorized');
  }

  // Prepare user data for the client component
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
