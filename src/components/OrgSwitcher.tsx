import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Plus } from 'lucide-react'
import { Menu, MenuTrigger, MenuPopup, MenuItem, MenuSeparator } from './ui/menu'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useOrgs, useCreateOrg } from '../hooks/useOrgs'
import { toastManager } from './ui/toast'
import { ConnectError } from '@connectrpc/connect'

interface OrgSwitcherProps {
  currentOrgSlug: string
  onOrgChange: (slug: string) => void
}

export default function OrgSwitcher({ currentOrgSlug, onOrgChange }: OrgSwitcherProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const navigate = useNavigate()

  const { data: orgs, isLoading } = useOrgs()
  const createMutation = useCreateOrg()

  const currentOrg = orgs?.find((org) => org.slug === currentOrgSlug)

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault()
    if (!newOrgName.trim() || createMutation.isPending) return

    try {
      const newOrg = await createMutation.mutateAsync({
        name: newOrgName.trim(),
      })
      setCreateDialogOpen(false)
      setNewOrgName('')

      toastManager.add({
        title: 'Organization created',
        description: `Successfully created ${newOrg?.name}`,
        type: 'success',
        duration: 3000,
      })

      // Navigate to new org
      if (newOrg) {
        navigate(`/org/${newOrg.slug}`)
      }
    } catch (error) {
      const errorMessage = error instanceof ConnectError
        ? error.rawMessage
        : 'Failed to create organization'

      toastManager.add({
        title: 'Error',
        description: errorMessage,
        type: 'error',
        duration: 5000,
      })
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
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Acme Inc"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">A unique slug will be automatically generated</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!newOrgName.trim() || createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
      </Dialog>
    </div>
  )
}
