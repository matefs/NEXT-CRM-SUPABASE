import { getLeads } from "@/lib/leads-actions"
import BulkMessageForm from "@/components/bulk-message-form"

export default async function BulkMessagesPage() {
  const leads = await getLeads()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mensagem em Massa</h1>
        <p className="text-muted-foreground">Envie a mesma mensagem para múltiplos leads simultaneamente</p>
      </div>
      <BulkMessageForm leads={leads} />
    </div>
  )
}
