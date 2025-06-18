import { redirect } from "next/navigation"

// Modifier la redirection pour aller directement au dashboard au lieu de la page de login
export default function Home() {
  redirect("/dashboard")
}
