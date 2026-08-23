'use client';

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Home() {

  const { data: session } = authClient.useSession();
  const router = useRouter();
  
  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
          toast.success("Signed out successfully!");
        }
      },
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold text-red-500">Welcome to the LMS</h1>
      <ThemeToggle />
      {session ? (
        <div>
          <p>Welcome back, {session.user.name}!</p>
          <Button onClick={signOut}>Logout</Button>
        </div>
      ) : (
        <Button onClick={() => router.push('/login')}>Please sign in to access your courses.</Button>
      )}
    </div>
  );
}
