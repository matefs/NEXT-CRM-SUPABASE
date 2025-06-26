"use client"

import { useActionState, useState, useMemo } from "react"
import { useFormStatus } from "react-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, MessageSquare, Search, User } from "lucide-react"
import { sendMessage } from "@/lib/messages-actions"
import type { Lead } from "@/lib/types"
import { leadStatuses } from "@/lib/types"

const statusColors = {
  novo: "bg-blue-100 text-blue-800",
  contatado: "bg-yellow-100 text-yellow-800",
  qualificado: "bg-purple-100 text-purple-800",
  proposta: "bg-orange-100 text-orange-800",
  fechado: "bg-green-100 text-green-800",
  perdido: "bg-red-100 text-red-800",
}

function SubmitButton({ hasSelectedLead }: { hasSelectedLead: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending || !hasSelectedLead} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enviando...
        </>
      ) : (
        <>
          <MessageSquare className="mr-2 h-4 w-4" />
          Enviar Mensagem
        </>
      )}
    </Button>
  )
}

interface SendMessageFormProps {
  leads: Lead[]
}

export default function SendMessageForm({ leads }: SendMessageFormProps) {
  const [state, formAction] = useActionState(sendMessage, null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  // Filter leads based on search term
  const filteredLeads = useMemo(() => {
    if (!searchTerm) return leads

    return leads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [leads, searchTerm])

  const getStatusText = (status: string) => {
    return leadStatuses.find((s) => s.id === status)?.text || status
  }

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead)
    setSearchTerm(lead.name)
    setShowDropdown(false)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setSelectedLead(null)
    setShowDropdown(true)
  }

  const handleSubmit = (formData: FormData) => {
    if (selectedLead) {
      formData.append("lead_id", selectedLead.id)
    }
    formAction(formData)
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Enviar Mensagem Individual
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
            <label htmlFor="lead_search" className="block text-sm font-medium">
              Selecionar Lead *
            </label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="lead_search"
                  type="text"
                  placeholder="Pesquisar por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  className="pl-10"
                  required
                />
              </div>

              {/* Selected Lead Display */}
              {selectedLead && !showDropdown && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">{selectedLead.name}</p>
                        {selectedLead.company && <p className="text-sm text-blue-700">{selectedLead.company}</p>}
                        {selectedLead.email && <p className="text-xs text-blue-600">{selectedLead.email}</p>}
                      </div>
                    </div>
                    <Badge
                      className={
                        statusColors[selectedLead.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
                      }
                    >
                      {getStatusText(selectedLead.status)}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Dropdown with filtered leads */}
              {showDropdown && searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleLeadSelect(lead)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            {lead.company && <p className="text-sm text-gray-600">{lead.company}</p>}
                            {lead.email && <p className="text-xs text-gray-500">{lead.email}</p>}
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
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">
                      <p>Nenhum lead encontrado</p>
                      <p className="text-xs mt-1">Tente pesquisar com outros termos</p>
                    </div>
                  )}
                </div>
              )}

              {/* Show all leads when no search term */}
              {showDropdown && !searchTerm && leads.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 bg-gray-50 border-b">
                    <p className="text-xs text-gray-600">Digite para pesquisar ou selecione um lead:</p>
                  </div>
                  {leads.slice(0, 10).map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleLeadSelect(lead)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          {lead.company && <p className="text-sm text-gray-600">{lead.company}</p>}
                          {lead.email && <p className="text-xs text-gray-500">{lead.email}</p>}
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
                  ))}
                  {leads.length > 10 && (
                    <div className="p-2 bg-gray-50 text-center">
                      <p className="text-xs text-gray-600">
                        Mostrando 10 de {leads.length} leads. Digite para pesquisar.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Click outside to close dropdown */}
            {showDropdown && <div className="fixed inset-0 z-5" onClick={() => setShowDropdown(false)} />}
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-medium">
              Mensagem *
            </label>
            <Textarea
              id="message"
              name="message"
              required
              placeholder="Digite sua mensagem aqui..."
              rows={6}
              className="resize-none"
            />
          </div>

          <SubmitButton hasSelectedLead={!!selectedLead} />
        </form>

        {/* Stats */}
        {leads.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>{leads.length}</strong> leads disponíveis para envio de mensagens
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
