import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Plus } from 'lucide-react'
import { Menu, MenuTrigger, MenuPopup, MenuItem, MenuSeparator } from './ui/menu'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useOrgs, useCreateOrg } from '../hooks/useOrgs'

interface OrgSwitcherProps {
  currentOrgSlug: string
  onOrgChange: (slug: string) => void
}

export default function OrgSwitcher({ currentOrgSlug, onOrgChange }: OrgSwitcherProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgSlug, setNewOrgSlug] = useState('')
  const navigate = useNavigate()

  const { data: orgs, isLoading } = useOrgs()
  const createMutation = useCreateOrg()

  const currentOrg = orgs?.find((org) => org.slug === currentOrgSlug)

  // Auto-generate slug from name
  function handleNameChange(name: string) {
    setNewOrgName(name)
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setNewOrgSlug(slug)
  }

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault()
    if (!newOrgName.trim() || !newOrgSlug.trim() || createMutation.isPending) return

    try {
      const newOrg = await createMutation.mutateAsync({
        name: newOrgName.trim(),
        slug: newOrgSlug.trim(),
      })
      setCreateDialogOpen(false)
      setNewOrgName('')
      setNewOrgSlug('')
      // Navigate to new org
      if (newOrg) {
        navigate(`/org/${newOrg.slug}`)
      }
    } catch (error) {
      console.error('Failed to create org:', error)
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
        className="text-sm font-medium hover:text-gray-600 transition-colors"
      >
        {isLoading ? '...' : currentOrg?.name || currentOrgSlug}
      </button>

      <Menu>
        <MenuTrigger>
          <Button variant="ghost" size="icon-sm" aria-label="Switch organization" className="hover:bg-gray-200">
            <ChevronDown size={14} />
          </Button>
        </MenuTrigger>
        <MenuPopup>
          {orgs?.map((org) => (
            <MenuItem
              key={org.id}
              onSelect={() => onOrgChange(org.slug)}
              className={currentOrgSlug === org.slug ? 'bg-gray-100' : ''}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{org.name}</span>
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
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Acme Inc"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="org-slug">Organization Slug</Label>
                  <Input
                    id="org-slug"
                    value={newOrgSlug}
                    onChange={(e) => setNewOrgSlug(e.target.value)}
                    placeholder="acme-inc"
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
                  <Button type="submit" disabled={!newOrgName.trim() || !newOrgSlug.trim() || createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
      </Dialog>
    </div>
  )
}
