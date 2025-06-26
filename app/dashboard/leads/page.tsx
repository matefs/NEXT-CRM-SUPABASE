import { getLeads } from "@/lib/leads-actions"
import LeadsList from "@/components/leads-list"

export default async function LeadsPage() {
  const leads = await getLeads()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestão de Leads</h1>
        <p className="text-muted-foreground">Gerencie seus leads e acompanhe o funil de vendas</p>
      </div>
      <LeadsList leads={leads} />
    </div>
  )
}
