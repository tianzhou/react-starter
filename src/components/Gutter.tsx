import { Files, Search, Package } from 'lucide-react'
import { ComponentType } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import { useSession } from '@/lib/auth-client'
import UserAvatar from './UserAvatar'

export type GutterItem = 'files' | 'search' | 'extensions' | 'settings'

// Re-export as a const for runtime access
export const GUTTER_ITEMS = ['files', 'search', 'extensions', 'settings'] as const

interface GutterProps {
  activeItem: GutterItem
  onItemClick: (item: GutterItem) => void
}

const topGutterIcons: { id: GutterItem; Icon: ComponentType<{ size?: number }>; label: string }[] = [
  { id: 'files', Icon: Files, label: 'Explorer' },
  { id: 'search', Icon: Search, label: 'Search' },
  { id: 'extensions', Icon: Package, label: 'Extensions' },
]

export default function Gutter({ activeItem, onItemClick }: GutterProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: session } = useSession()

  const handleClick = (id: GutterItem) => {
    onItemClick(id)
    if (id === 'settings') {
      navigate('/settings')
    } else {
      if (location.pathname !== '/') {
        navigate('/')
      }
    }
  }

  const renderButton = ({ id, Icon, label }: { id: GutterItem; Icon: ComponentType<any>; label: string }) => {
    const isActive = activeItem === id
    return (
      <Button
        key={id}
        onClick={() => handleClick(id)}
        variant={isActive ? 'default' : 'ghost'}
        size="icon-sm"
        aria-label={label}
        title={label}
      >
        <Icon size={18} strokeWidth={2} />
      </Button>
    )
  }

  const handleAvatarClick = () => {
    onItemClick('settings')
    navigate('/settings')
  }

  return (
    <div className="w-12 bg-gray-100 border-r border-gray-300 flex flex-col items-center py-2 gap-1">
      {/* Top icons */}
      <div className="flex flex-col gap-1">
        {topGutterIcons.map(renderButton)}
      </div>

      {/* Spacer to push bottom icons down */}
      <div className="flex-1" />

      {/* User Avatar */}
      <button
        onClick={handleAvatarClick}
        className="p-1 hover:bg-gray-200 rounded-md transition-colors"
        aria-label="Settings"
        title="Settings"
      >
        <UserAvatar user={session?.user} size="sm" />
      </button>
    </div>
  )
}
