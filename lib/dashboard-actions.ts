"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export interface LeadStats {
  total: number
  byStatus: Record<string, number>
  recentLeads: number
  thisMonth: number
}

export async function getLeadStats(): Promise<LeadStats> {
  const defaultStats: LeadStats = {
    total: 0,
    byStatus: {},
    recentLeads: 0,
    thisMonth: 0,
  }

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
      return defaultStats
    }

    if (!user) {
      console.log("Usuário não autenticado para estatísticas")
      return defaultStats
    }

    console.log("Buscando estatísticas para usuário:", user.id)

    // Get all leads for current user
    const { data: leads, error } = await supabase
      .from("leads")
      .select("status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar estatísticas:", error)
      return defaultStats
    }

    if (!leads) {
      console.log("Nenhum lead encontrado")
      return defaultStats
    }

    const total = leads.length

    // Count by status
    const byStatus: Record<string, number> = {}
    leads.forEach((lead) => {
      byStatus[lead.status] = (byStatus[lead.status] || 0) + 1
    })

    // Count recent leads (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentLeads = leads.filter((lead) => new Date(lead.created_at) >= sevenDaysAgo).length

    // Count this month's leads
    const thisMonth = new Date()
    const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
    const thisMonthLeads = leads.filter((lead) => new Date(lead.created_at) >= firstDayOfMonth).length

    const stats = {
      total,
      byStatus,
      recentLeads,
      thisMonth: thisMonthLeads,
    }

    console.log("Estatísticas calculadas:", stats)
    return stats
  } catch (error) {
    console.error("Erro inesperado ao buscar estatísticas:", error)
    return defaultStats
  }
}
