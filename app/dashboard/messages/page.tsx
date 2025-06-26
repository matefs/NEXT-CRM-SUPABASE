import { getLeads } from "@/lib/leads-actions"
import SendMessageForm from "@/components/send-message-form"

export default async function MessagesPage() {
  const leads = await getLeads()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enviar Mensagem</h1>
        <p className="text-muted-foreground">Envie uma mensagem personalizada para um lead específico</p>
      </div>
      <SendMessageForm leads={leads} />
    </div>
  )
}
