"use client"

import { useActionState, useState, useMemo } from "react"
import { useFormStatus } from "react-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Users, Search } from "lucide-react"
import { sendBulkMessage } from "@/lib/messages-actions"
import type { Lead } from "@/lib/types"
import { leadStatuses } from "@/lib/types"
import { Input } from "@/components/ui/input"

const statusColors = {
  novo: "bg-blue-100 text-blue-800",
  contatado: "bg-yellow-100 text-yellow-800",
  qualificado: "bg-purple-100 text-purple-800",
  proposta: "bg-orange-100 text-orange-800",
  fechado: "bg-green-100 text-green-800",
  perdido: "bg-red-100 text-red-800",
}

function SubmitButton({ selectedCount }: { selectedCount: number }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending || selectedCount === 0} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enviando...
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Enviar para {selectedCount} lead(s)
        </>
      )}
    </Button>
  )
}

interface BulkMessageFormProps {
  leads: Lead[]
}

export default function BulkMessageForm({ leads }: BulkMessageFormProps) {
  const [state, formAction] = useActionState(sendBulkMessage, null)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // Filter and limit leads based on search term
  const filteredLeads = useMemo(() => {
    let result = leads

    // Filter by search term if provided
    if (searchTerm.trim()) {
      result = leads.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.company?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Show only last 50 leads by default (sorted by created_at desc)
    return result.slice(0, 50)
  }, [leads, searchTerm])

  const handleLeadToggle = (leadId: string) => {
    setSelectedLeads((prev) => (prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]))
  }

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(filteredLeads.map((lead) => lead.id))
    }
  }

  const getStatusText = (status: string) => {
    return leadStatuses.find((s) => s.id === status)?.text || status
  }

  const handleSubmit = (formData: FormData) => {
    formData.append("selected_leads", JSON.stringify(selectedLeads))
    formAction(formData)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Mensagem em Massa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {state?.error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-700 px-4 py-3 rounded">{state.error}</div>
            )}

            {state?.success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-700 px-4 py-3 rounded">
                {state.success}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium">
                Mensagem *
              </label>
              <Textarea
                id="message"
                name="message"
                required
                placeholder="Digite a mensagem que será enviada para todos os leads selecionados..."
                rows={6}
                className="resize-none"
              />
            </div>

            <SubmitButton selectedCount={selectedLeads.length} />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Selecionar Leads ({selectedLeads.length}/{filteredLeads.length})
              {searchTerm && <span className="text-sm font-normal text-muted-foreground">- Filtrado</span>}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedLeads.length === filteredLeads.length ? "Desmarcar Todos" : "Selecionar Todos"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Pesquisar por nome, email ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Info about filtering */}
          {!searchTerm && leads.length > 50 && (
            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
              Mostrando os últimos 50 leads. Use a pesquisa para encontrar leads específicos. Total de leads:{" "}
              {leads.length}
            </div>
          )}

          {searchTerm && (
            <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
              Encontrados {filteredLeads.length} leads para "{searchTerm}"
            </div>
          )}

          {filteredLeads.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedLeads.includes(lead.id) ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleLeadToggle(lead.id)}
                >
                  <Checkbox checked={selectedLeads.includes(lead.id)} onChange={() => handleLeadToggle(lead.id)} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        {lead.company && <p className="text-sm text-muted-foreground">{lead.company}</p>}
                        {lead.email && <p className="text-xs text-muted-foreground">{lead.email}</p>}
                      </div>
                      <Badge
                        className={
                          statusColors[lead.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
                        }
                      >
                        {getStatusText(lead.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? `Nenhum lead encontrado para "${searchTerm}"` : "Nenhum lead encontrado"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? "Tente pesquisar com outros termos" : "Crie alguns leads primeiro para enviar mensagens"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
