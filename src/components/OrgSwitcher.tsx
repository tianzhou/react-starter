import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Plus } from 'lucide-react'
import { Menu, MenuTrigger, MenuPopup, MenuItem, MenuSeparator } from './ui/menu'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface Org {
  id: string
  name: string
  slug: string
  role: 'owner' | 'admin' | 'developer'
}

interface OrgSwitcherProps {
  currentOrgSlug: string
  onOrgChange: (slug: string) => void
}

export default function OrgSwitcher({ currentOrgSlug, onOrgChange }: OrgSwitcherProps) {
  const [orgs, setOrgs] = useState<Org[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  const currentOrg = orgs.find((org) => org.slug === currentOrgSlug)

  useEffect(() => {
    fetchOrgs()
  }, [])

  async function fetchOrgs() {
    try {
      const response = await fetch('http://localhost:3001/api/orgs', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setOrgs(data)
      }
    } catch (error) {
      console.error('Failed to fetch orgs:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault()
    if (!newOrgName.trim() || creating) return

    setCreating(true)
    try {
      const response = await fetch('http://localhost:3001/api/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newOrgName.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setOrgs([...orgs, { ...data.org, role: 'owner' as const }])
        setCreateDialogOpen(false)
        setNewOrgName('')
        // Navigate to new org with default project
        navigate(`/org/${data.org.slug}/project/${data.defaultProject.slug}`)
      }
    } catch (error) {
      console.error('Failed to create org:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => {
          if (currentOrgSlug) {
            navigate(`/org/${currentOrgSlug}`)
          }
        }}
        className="text-sm font-medium hover:text-gray-600 transition-colors cursor-pointer"
      >
        {loading ? '...' : currentOrg?.name || currentOrgSlug}
      </button>

      <Menu>
        <MenuTrigger>
          <Button variant="ghost" size="icon-sm" aria-label="Switch organization" className="hover:bg-gray-200">
            <ChevronDown size={14} />
          </Button>
        </MenuTrigger>
        <MenuPopup>
          {orgs.map((org) => (
            <MenuItem
              key={org.id}
              onSelect={() => onOrgChange(org.slug)}
              className={currentOrgSlug === org.slug ? 'bg-gray-100' : ''}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{org.name}</span>
                <span className="text-xs text-gray-500">{org.role}</span>
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
            Create new organization
          </MenuItem>
        </MenuPopup>
      </Menu>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Organization</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div>
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Acme Inc"
                    autoFocus
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
                  <Button type="submit" disabled={!newOrgName.trim() || creating}>
                    {creating ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
      </Dialog>
    </div>
  )
}
