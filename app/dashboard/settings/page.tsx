import { getUserProfile } from "@/lib/user-actions"
import { redirect } from "next/navigation"
import UserSettings from "@/components/user-settings"

export default async function SettingsPage() {
  const user = await getUserProfile()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e configurações da conta</p>
      </div>
      <UserSettings user={user} />
    </div>
  )
}
