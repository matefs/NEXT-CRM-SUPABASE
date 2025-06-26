"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import type { Lead } from "./types"

export async function createLead(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  const name = formData.get("name")?.toString()
  const email = formData.get("email")?.toString()
  const phone = formData.get("phone")?.toString()
  const company = formData.get("company")?.toString()
  const status = formData.get("status")?.toString() || "novo"
  const notes = formData.get("notes")?.toString()

  if (!name) {
    return { error: "Nome é obrigatório" }
  }

  try {
    const { error } = await supabase.from("leads").insert({
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      status,
      notes: notes || null,
      user_id: user.id,
    })

    if (error) {
      console.error("Erro ao criar lead:", error)
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/leads")
    return { success: "Lead criado com sucesso!" }
  } catch (error) {
    console.error("Erro inesperado ao criar lead:", error)
    return { error: "Erro ao criar lead" }
  }
}

export async function updateLead(leadId: string, prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  const name = formData.get("name")?.toString()
  const email = formData.get("email")?.toString()
  const phone = formData.get("phone")?.toString()
  const company = formData.get("company")?.toString()
  const status = formData.get("status")?.toString()
  const notes = formData.get("notes")?.toString()

  if (!name) {
    return { error: "Nome é obrigatório" }
  }

  try {
    const { error } = await supabase
      .from("leads")
      .update({
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        status,
        notes: notes || null,
      })
      .eq("id", leadId)

    if (error) {
      console.error("Erro ao atualizar lead:", error)
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/leads")
    return { success: "Lead atualizado com sucesso!" }
  } catch (error) {
    console.error("Erro inesperado ao atualizar lead:", error)
    return { error: "Erro ao atualizar lead" }
  }
}

export async function deleteLead(leadId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { error } = await supabase.from("leads").delete().eq("id", leadId)

    if (error) {
      console.error("Erro ao excluir lead:", error)
      return { error: error.message }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/leads")
    return { success: "Lead excluído com sucesso!" }
  } catch (error) {
    console.error("Erro inesperado ao excluir lead:", error)
    return { error: "Erro ao excluir lead" }
  }
}

export async function getLeads(): Promise<Lead[]> {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Check if user is authenticated first
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("Erro de autenticação:", userError)
      return []
    }

    if (!user) {
      console.log("Usuário não autenticado")
      return []
    }

    console.log("Buscando leads para usuário:", user.id)

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar leads:", error)
      return []
    }

    console.log("Leads encontrados:", data?.length || 0)
    return data || []
  } catch (error) {
    console.error("Erro inesperado ao buscar leads:", error)
    return []
  }
}
