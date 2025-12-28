import { useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function ProjectHome() {
  const { orgSlug, projectSlug } = useParams<{ orgSlug: string; projectSlug: string }>()

  return (
    <div className="flex-1 bg-white text-gray-900 overflow-auto">
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-2">Project Overview</h1>
        <p className="text-gray-600 mb-8">
          View project details, activity, and quick actions
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Files</span>
                  <span className="text-2xl font-bold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Modified</span>
                  <span className="text-sm">Never</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  Create new file
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  Upload files
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  View documentation
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Organization:</span>
                  <p className="font-medium">{orgSlug}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Project:</span>
                  <p className="font-medium">{projectSlug}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
