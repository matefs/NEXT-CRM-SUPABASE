"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { createLead, updateLead } from "@/lib/leads-actions"
import { leadStatuses, type Lead } from "@/lib/types"

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEditing ? "Atualizando..." : "Criando..."}
        </>
      ) : isEditing ? (
        "Atualizar Lead"
      ) : (
        "Criar Lead"
      )}
    </Button>
  )
}

interface LeadFormProps {
  lead?: Lead
  onSuccess?: () => void
}

export default function LeadForm({ lead, onSuccess }: LeadFormProps) {
  const isEditing = !!lead
  const action = isEditing ? updateLead.bind(null, lead.id) : createLead
  const [state, formAction] = useActionState(action, null)

  // Handle success
  if (state?.success && onSuccess) {
    onSuccess()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Lead" : "Novo Lead"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-700 px-4 py-3 rounded">{state.error}</div>
          )}

          {state?.success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-700 px-4 py-3 rounded">
              {state.success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Nome *
              </label>
              <Input id="name" name="name" defaultValue={lead?.name || ""} required placeholder="Nome do lead" />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={lead?.email || ""}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium">
                Telefone
              </label>
              <Input id="phone" name="phone" defaultValue={lead?.phone || ""} placeholder="(11) 99999-9999" />
            </div>

            <div className="space-y-2">
              <label htmlFor="company" className="block text-sm font-medium">
                Empresa
              </label>
              <Input id="company" name="company" defaultValue={lead?.company || ""} placeholder="Nome da empresa" />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-medium">
              Status
            </label>
            <Select name="status" defaultValue={lead?.status || "novo"}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {leadStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium">
              Observações
            </label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={lead?.notes || ""}
              placeholder="Observações sobre o lead..."
              rows={3}
            />
          </div>

          <SubmitButton isEditing={isEditing} />
        </form>
      </CardContent>
    </Card>
  )
}
