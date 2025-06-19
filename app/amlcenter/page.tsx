import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AMLCenterPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if we're in production (Vercel) or development
    if (process.env.NODE_ENV === 'development') {
      // In development, redirect to the Express server endpoint
      window.location.href = 'http://localhost:3000/amlcenter';
    } else {
      // In production (Vercel), handle the view here
      // You should implement the AML center view here
      // This is where you'll add your UI components
    }
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AML Center</h1>
      {/* Add your AML center components here */}
    </div>
  );
}
