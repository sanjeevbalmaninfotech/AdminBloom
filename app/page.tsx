'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedIn) {
      router.push('/login');
    }
    // No state needed, simple logic for demo
  }, [router]);

  // Optional: Could add a loader while redirecting, but null is fine
  return (
    <>
      <h1>Welcome!</h1>
      <p>You are logged in.</p>
    </>
  );
}
