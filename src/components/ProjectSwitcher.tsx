import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Plus } from 'lucide-react'
import { Menu, MenuTrigger, MenuPopup, MenuItem, MenuSeparator } from './ui/menu'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface Project {
  id: string
  name: string
  slug: string
  description: string | null
}

interface ProjectSwitcherProps {
  currentOrgSlug: string
  currentProjectSlug: string
  onProjectChange: (slug: string) => void
}

export default function ProjectSwitcher({
  currentOrgSlug,
  currentProjectSlug,
  onProjectChange,
}: ProjectSwitcherProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  const currentProject = projects.find((project) => project.slug === currentProjectSlug)

  useEffect(() => {
    if (currentOrgSlug) {
      fetchProjects()
    }
  }, [currentOrgSlug])

  async function fetchProjects() {
    try {
      const response = await fetch(
        `http://localhost:3001/api/orgs/${currentOrgSlug}/projects`,
        {
          credentials: 'include',
        }
      )
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    if (!newProjectName.trim() || creating) return

    setCreating(true)
    try {
      const response = await fetch(
        `http://localhost:3001/api/orgs/${currentOrgSlug}/projects`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: newProjectName.trim(),
            description: newProjectDescription.trim() || undefined,
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        setProjects([...projects, data])
        setCreateDialogOpen(false)
        setNewProjectName('')
        setNewProjectDescription('')
        // Navigate to new project
        navigate(`/org/${currentOrgSlug}/project/${data.slug}`)
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => {
          if (currentOrgSlug && currentProjectSlug) {
            navigate(`/org/${currentOrgSlug}/project/${currentProjectSlug}`)
          }
        }}
        className="text-sm font-medium hover:text-gray-600 transition-colors cursor-pointer"
      >
        {loading ? '...' : currentProject?.name || currentProjectSlug}
      </button>

      <Menu>
        <MenuTrigger>
          <Button variant="ghost" size="icon-sm" aria-label="Switch project" className="hover:bg-gray-200">
            <ChevronDown size={14} />
          </Button>
        </MenuTrigger>
        <MenuPopup>
          {projects.map((project) => (
            <MenuItem
              key={project.id}
              onSelect={() => onProjectChange(project.slug)}
              className={currentProjectSlug === project.slug ? 'bg-gray-100' : ''}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{project.name}</span>
                {project.description && (
                  <span className="text-xs text-gray-500">{project.description}</span>
                )}
              </div>
            </MenuItem>
          ))}
          <MenuSeparator />
          <MenuItem
            onSelect={(e) => {
              e.preventDefault()
              setCreateDialogOpen(true)
            }}
          >
            <Plus size={16} className="mr-2" />
            Create new project
          </MenuItem>
        </MenuPopup>
      </Menu>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="My Project"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="project-description">Description (optional)</Label>
                  <Input
                    id="project-description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="A brief description"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!newProjectName.trim() || creating}>
                    {creating ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
      </Dialog>
    </div>
  )
}
