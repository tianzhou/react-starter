import { useParams } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function ProjectSettings() {
  const { orgSlug, projectSlug } = useParams<{ orgSlug: string; projectSlug: string }>()

  return (
    <div className="flex-1 bg-white text-gray-900 overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-2">Project Settings</h1>
        <p className="text-gray-600 mb-8">
          Manage project settings and preferences
        </p>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="Enter project name"
                  defaultValue={projectSlug}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-slug">Project Slug</Label>
                <Input
                  id="project-slug"
                  placeholder="project-slug"
                  defaultValue={projectSlug}
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  The slug cannot be changed after creation
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage who can access this project
              </p>
              <Button variant="outline">Manage Access</Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Delete Project</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete a project, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive">Delete Project</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
