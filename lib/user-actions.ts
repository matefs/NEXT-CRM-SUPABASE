"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export interface UserProfile {
  id: string
  email: string
  created_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
  phone?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      console.error("Erro ao buscar usuário:", error)
      return null
    }

    return {
      id: user.id,
      email: user.email || "",
      created_at: user.created_at || "",
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at,
      phone: user.phone,
      user_metadata: user.user_metadata,
    }
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error)
    return null
  }
}

export async function updateUserProfile(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const fullName = formData.get("full_name")?.toString()
  const phone = formData.get("phone")?.toString()

  try {
    const { error } = await supabase.auth.updateUser({
      phone: phone || undefined,
      data: {
        full_name: fullName || undefined,
      },
    })

    if (error) {
      return { error: error.message }
    }

    return { success: "Perfil atualizado com sucesso!" }
  } catch (error) {
    return { error: "Erro ao atualizar perfil" }
  }
}
