import { redirect } from "next/navigation"

// Redirect to documents page as the main landing page
export default function DocSecurePage() {
  redirect("/docsecure/documents")
}
