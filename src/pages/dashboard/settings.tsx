import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Manage your account preferences and settings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
