import { useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function OrgHome() {
  const { orgSlug } = useParams<{ orgSlug: string }>()

  return (
    <div className="flex-1 bg-white text-gray-900 overflow-auto">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Organization Home</h1>
          <p className="text-gray-600">Welcome to your organization</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                This is your organization home page. You can customize this page to show
                relevant information for your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Add your own content, widgets, or dashboards here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
