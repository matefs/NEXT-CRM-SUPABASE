"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import type { Message } from "./types"

export async function sendMessage(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  const leadId = formData.get("lead_id")?.toString()
  const message = formData.get("message")?.toString()

  if (!leadId) {
    return { error: "Lead é obrigatório" }
  }

  if (!message || message.trim().length === 0) {
    return { error: "Mensagem é obrigatória" }
  }

  try {
    // Verify that the lead belongs to the current user
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, name")
      .eq("id", leadId)
      .eq("user_id", user.id)
      .single()

    if (leadError || !lead) {
      return { error: "Lead não encontrado ou não autorizado" }
    }

    // Insert the message
    const { error } = await supabase.from("messages").insert({
      lead_id: leadId,
      message: message.trim(),
      user_id: user.id,
      status: "sent",
    })

    if (error) {
      console.error("Erro ao enviar mensagem:", error)
      return { error: error.message }
    }

    revalidatePath("/dashboard/messages")
    return { success: `Mensagem enviada para ${lead.name} com sucesso!` }
  } catch (error) {
    console.error("Erro inesperado ao enviar mensagem:", error)
    return { error: "Erro ao enviar mensagem" }
  }
}

export async function sendBulkMessage(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  const message = formData.get("message")?.toString()
  const selectedLeadsData = formData.get("selected_leads")?.toString()

  if (!message || message.trim().length === 0) {
    return { error: "Mensagem é obrigatória" }
  }

  if (!selectedLeadsData) {
    return { error: "Selecione pelo menos um lead" }
  }

  let selectedLeads: string[]
  try {
    selectedLeads = JSON.parse(selectedLeadsData)
  } catch {
    return { error: "Dados de leads inválidos" }
  }

  if (selectedLeads.length === 0) {
    return { error: "Selecione pelo menos um lead" }
  }

  try {
    // Verify that all leads belong to the current user
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("id, name")
      .in("id", selectedLeads)
      .eq("user_id", user.id)

    if (leadsError || !leads || leads.length !== selectedLeads.length) {
      return { error: "Alguns leads não foram encontrados ou não são autorizados" }
    }

    // Prepare messages for bulk insert
    const messages = leads.map((lead) => ({
      lead_id: lead.id,
      message: message.trim(),
      user_id: user.id,
      status: "sent",
    }))

    // Insert all messages
    const { error } = await supabase.from("messages").insert(messages)

    if (error) {
      console.error("Erro ao enviar mensagens em massa:", error)
      return { error: error.message }
    }

    revalidatePath("/dashboard/messages")
    revalidatePath("/dashboard/bulk-messages")
    return { success: `Mensagem enviada para ${leads.length} lead(s) com sucesso!` }
  } catch (error) {
    console.error("Erro inesperado ao enviar mensagens em massa:", error)
    return { error: "Erro ao enviar mensagens em massa" }
  }
}

export async function getMessages(): Promise<(Message & { lead_name: string })[]> {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Check if user is authenticated first
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Erro de autenticação:", userError)
      return []
    }

    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        leads!inner(name)
      `)
      .eq("user_id", user.id)
      .order("sent_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar mensagens:", error)
      return []
    }

    return (
      data?.map((item) => ({
        id: item.id,
        lead_id: item.lead_id,
        message: item.message,
        sent_at: item.sent_at,
        user_id: item.user_id,
        status: item.status,
        lead_name: item.leads.name,
      })) || []
    )
  } catch (error) {
    console.error("Erro inesperado ao buscar mensagens:", error)
    return []
  }
}
