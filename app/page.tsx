'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ContactUsPage from './contact-us/page';

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
   <ContactUsPage/>
    </>
  );
}
