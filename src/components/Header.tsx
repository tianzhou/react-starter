import { useNavigate } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'
import { useOrgProject } from '@/hooks/useOrgProject'
import { useSession } from '@/lib/auth-client'
import OrgSwitcher from './OrgSwitcher'
import ProjectSwitcher from './ProjectSwitcher'
import UserAvatar from './UserAvatar'
import { Button } from './ui/button'

export default function Header() {
  const { orgSlug, projectSlug } = useOrgProject()
  const { data: session } = useSession()
  const navigate = useNavigate()

  const handleOrgChange = async (newOrgSlug: string) => {
    // Fetch first project in the new org
    try {
      const response = await fetch(`http://localhost:3001/api/orgs/${newOrgSlug}/projects`, {
        credentials: 'include',
      })
      if (response.ok) {
        const projects = await response.json()
        if (projects.length > 0) {
          navigate(`/org/${newOrgSlug}/project/${projects[0].slug}`)
        } else {
          // No projects, just navigate to org
          navigate(`/org/${newOrgSlug}`)
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  const handleProjectChange = (newProjectSlug: string) => {
    if (orgSlug) {
      navigate(`/org/${orgSlug}/project/${newProjectSlug}`)
    }
  }

  const handleLogoClick = () => {
    // Navigate to current org/project or default
    if (orgSlug && projectSlug) {
      navigate(`/org/${orgSlug}/project/${projectSlug}`)
    } else {
      navigate('/')
    }
  }

  const handleAvatarClick = () => {
    navigate('/settings')
  }

  if (!orgSlug || !projectSlug) {
    return null
  }

  return (
    <header className="h-12 bg-gray-100 border-b border-gray-300 flex items-center px-4 justify-between">
      {/* Left section: Logo and breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Product Logo */}
        <button
          onClick={handleLogoClick}
          className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded text-white font-bold text-xs hover:bg-blue-600 transition-colors"
          aria-label="Home"
        >
          R
        </button>

        {/* Org Switcher */}
        <OrgSwitcher currentOrgSlug={orgSlug} onOrgChange={handleOrgChange} />

        {/* Separator */}
        <span className="text-gray-400">/</span>

        {/* Project Switcher */}
        <ProjectSwitcher
          currentOrgSlug={orgSlug}
          currentProjectSlug={projectSlug}
          onProjectChange={handleProjectChange}
        />
      </div>

      {/* Right section: Help and Avatar */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Help"
          onClick={() => window.open('https://docs.example.com', '_blank')}
        >
          <HelpCircle size={18} />
        </Button>

        <button
          onClick={handleAvatarClick}
          className="p-1 hover:bg-gray-200 rounded-md transition-colors"
          aria-label="Settings"
        >
          <UserAvatar user={session?.user} size="sm" />
        </button>
      </div>
    </header>
  )
}
