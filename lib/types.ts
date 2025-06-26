export interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface Message {
  id: string
  lead_id: string
  message: string
  sent_at: string
  user_id: string
  status: string
}

export const leadStatuses = [
  { id: "novo", text: "Novo" },
  { id: "contatado", text: "Contatado" },
  { id: "qualificado", text: "Qualificado" },
  { id: "proposta", text: "Proposta" },
  { id: "fechado", text: "Fechado" },
  { id: "perdido", text: "Perdido" },
]
