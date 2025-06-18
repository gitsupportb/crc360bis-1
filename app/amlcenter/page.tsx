import { redirect } from 'next/navigation';

// This page redirects to the integrated LBCFT WEBAPP
export default function AMLCenterPage() {
  // Since we're using a custom server, this page will be handled by the Express routes
  // This is just a fallback in case someone accesses this route directly
  redirect('/amlcenter');
}
