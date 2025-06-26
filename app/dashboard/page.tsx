import Dashboard from "@/components/dashboard"

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral dos seus leads e vendas</p>
      </div>
      <Dashboard />
    </div>
  )
}
