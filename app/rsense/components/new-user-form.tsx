"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

const roles = [
  { value: "admin", label: "Admin" },
  { value: "analyst", label: "Analyste" },
]

export function NewUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({ name: "", email: "", role: "admin" })
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Utilisateur créé",
        description: `L'utilisateur ${formData.name} a été créé avec succès.`,
      })
      onSuccess()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de l'utilisateur.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormField controlId="name">
        <FormItem>
          <FormLabel>Nom</FormLabel>
          <FormControl>
            <Input name="name" value={formData.name} onChange={handleChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField controlId="email">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField controlId="role">
        <FormItem>
          <FormLabel>Rôle</FormLabel>
          <FormControl>
            <Select name="role" value={formData.role} onChange={handleChange}>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <Button type="submit">Créer</Button>
    </Form>
  )
}

