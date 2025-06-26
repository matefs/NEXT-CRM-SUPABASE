import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getLeads } from "@/lib/leads-actions"
import LeadsList from "@/components/leads-list"

export default async function LeadsPage() {
  // Check if user is authenticated
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get leads for the current user
  const leads = await getLeads()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CRM - Gestão de Leads</h1>
          <p className="text-gray-600 mt-2">Gerencie seus leads e acompanhe o funil de vendas</p>
        </div>

        <LeadsList leads={leads} />
      </div>
    </div>
  )
}
