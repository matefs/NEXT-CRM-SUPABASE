import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Calendar, Target, AlertCircle } from "lucide-react"
import { getLeadStats } from "@/lib/dashboard-actions"
import { getLeads } from "@/lib/leads-actions"
import { leadStatuses } from "@/lib/types"
import { Suspense } from "react"

const statusColors = {
  novo: "bg-blue-100 text-blue-800",
  contatado: "bg-yellow-100 text-yellow-800",
  qualificado: "bg-purple-100 text-purple-800",
  proposta: "bg-orange-100 text-orange-800",
  fechado: "bg-green-100 text-green-800",
  perdido: "bg-red-100 text-red-800",
}

function LoadingCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 bg-muted rounded w-24 animate-pulse" />
        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-muted rounded w-16 animate-pulse mb-2" />
        <div className="h-3 bg-muted rounded w-32 animate-pulse" />
      </CardContent>
    </Card>
  )
}

function ErrorCard({ title, error }: { title: string; error: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <AlertCircle className="h-4 w-4 text-red-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-red-500">Erro</div>
        <p className="text-xs text-red-600">{error}</p>
      </CardContent>
    </Card>
  )
}

async function DashboardContent() {
  try {
    const [stats, recentLeads] = await Promise.all([getLeadStats(), getLeads()])

    // Get recent 5 leads
    const latestLeads = recentLeads.slice(0, 5)

    const getStatusText = (status: string) => {
      return leadStatuses.find((s) => s.id === status)?.text || status
    }

    return (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total de leads cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos (7 dias)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentLeads}</div>
              <p className="text-xs text-muted-foreground">Leads dos últimos 7 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
              <p className="text-xs text-muted-foreground">Leads criados este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fechados</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.fechado || 0}</div>
              <p className="text-xs text-muted-foreground">Leads convertidos</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leadStatuses.map((status) => {
                  const count = stats.byStatus[status.id] || 0
                  const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0

                  return (
                    <div key={status.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            statusColors[status.id as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
                          }
                        >
                          {status.text}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{count}</span>
                        <span className="text-xs text-muted-foreground">({percentage}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <CardTitle>Leads Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {latestLeads.length > 0 ? (
                  latestLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        {lead.company && <p className="text-sm text-muted-foreground">{lead.company}</p>}
                        <p className="text-xs text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Badge
                        className={
                          statusColors[lead.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
                        }
                      >
                        {getStatusText(lead.status)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum lead cadastrado ainda</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Vá para a seção Leads para criar seu primeiro lead
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  } catch (error) {
    console.error("Erro no dashboard:", error)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ErrorCard title="Total de Leads" error="Erro ao carregar dados" />
        <ErrorCard title="Novos (7 dias)" error="Erro ao carregar dados" />
        <ErrorCard title="Este Mês" error="Erro ao carregar dados" />
        <ErrorCard title="Fechados" error="Erro ao carregar dados" />
      </div>
    )
  }
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  )
}
