"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Plus, Search, Filter } from "lucide-react"
import { leadStatuses, type Lead } from "@/lib/types"
import { deleteLead } from "@/lib/leads-actions"
import LeadForm from "./lead-form"

interface LeadsListProps {
  leads: Lead[]
}

const statusColors = {
  novo: "bg-blue-100 text-blue-800",
  contatado: "bg-yellow-100 text-yellow-800",
  qualificado: "bg-purple-100 text-purple-800",
  proposta: "bg-orange-100 text-orange-800",
  fechado: "bg-green-100 text-green-800",
  perdido: "bg-red-100 text-red-800",
}

export default function LeadsList({ leads }: LeadsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

  // Filter leads based on search term and status
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDelete = async (leadId: string) => {
    const result = await deleteLead(leadId)
    if (result?.error) {
      alert(result.error)
    }
  }

  const getStatusText = (status: string) => {
    return leadStatuses.find((s) => s.id === status)?.text || status
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and create button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {leadStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <LeadForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Leads grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{lead.name}</CardTitle>
                  {lead.company && <p className="text-sm text-gray-600 mt-1">{lead.company}</p>}
                </div>
                <Badge
                  className={statusColors[lead.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}
                >
                  {getStatusText(lead.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {lead.email && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {lead.email}
                </p>
              )}

              {lead.phone && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Telefone:</span> {lead.phone}
                </p>
              )}

              {lead.notes && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Observações:</span> {lead.notes}
                </p>
              )}

              <p className="text-xs text-gray-500">
                Criado em: {new Date(lead.created_at).toLocaleDateString("pt-BR")}
              </p>

              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setEditingLead(lead)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <LeadForm lead={editingLead || undefined} onSuccess={() => setEditingLead(null)} />
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o lead "{lead.name}"? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(lead.id)} className="bg-red-600 hover:bg-red-700">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm || statusFilter !== "all"
              ? "Nenhum lead encontrado com os filtros aplicados."
              : "Nenhum lead cadastrado ainda."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar primeiro lead
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
