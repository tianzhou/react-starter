import { useNavigate, useLocation } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import OrgSwitcher from './OrgSwitcher'
import UserAvatar from './UserAvatar'
import { Button } from './ui/button'

export default function Header() {
  const { data: session } = useSession()
  const navigate = useNavigate()
  const location = useLocation()

  // Extract org from pathname
  const orgMatch = location.pathname.match(/^\/org\/([^/]+)/)
  const orgSlug = orgMatch?.[1]

  const handleOrgChange = (newOrgSlug: string) => {
    navigate(`/org/${newOrgSlug}`)
  }

  const handleLogoClick = () => {
    // Navigate to current org or default
    if (orgSlug) {
      navigate(`/org/${orgSlug}`)
    } else {
      navigate('/')
    }
  }

  const handleAvatarClick = () => {
    navigate('/account')
  }

  // Check if we're on the account page
  const isAccountPage = location.pathname === '/account'
  const isOrgPage = location.pathname.startsWith('/org/')

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

        {isAccountPage ? (
          /* Account breadcrumb - no dropdown */
          <span className="text-sm font-medium">Account</span>
        ) : orgSlug ? (
          /* Org breadcrumb */
          <OrgSwitcher currentOrgSlug={orgSlug} onOrgChange={handleOrgChange} />
        ) : null}
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
