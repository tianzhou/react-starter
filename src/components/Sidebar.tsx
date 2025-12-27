import type { GutterItem } from './Gutter'
import { useState } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { Input } from './ui/input'

interface SidebarProps {
  activeItem: GutterItem
}

export default function Sidebar({ activeItem }: SidebarProps) {
  const [filesFilter, setFilesFilter] = useState<string[]>(['all'])
  const [searchFilter, setSearchFilter] = useState<string[]>(['all'])
  const [extensionsFilter, setExtensionsFilter] = useState<string[]>(['all'])
  const [settingsFilter, setSettingsFilter] = useState<string[]>(['all'])

  const renderContent = () => {
    switch (activeItem) {
      case 'files':
        return (
          <div className="p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Explorer
            </h2>
            <Select value={filesFilter} onValueChange={setFilesFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files</SelectItem>
                <SelectItem value="recent">Recent Files</SelectItem>
                <SelectItem value="modified">Modified Files</SelectItem>
                <SelectItem value="favorites">Favorites</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Search files..."
              size="sm"
            />
          </div>
        )
      case 'search':
        return (
          <div className="p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Search
            </h2>
            <Select value={searchFilter} onValueChange={setSearchFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Search in All Files</SelectItem>
                <SelectItem value="current">Search in Current File</SelectItem>
                <SelectItem value="folder">Search in Folder</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Search..."
              size="sm"
            />
          </div>
        )
      case 'extensions':
        return (
          <div className="p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Extensions
            </h2>
            <Select value={extensionsFilter} onValueChange={setExtensionsFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Extensions</SelectItem>
                <SelectItem value="installed">Installed</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="recommended">Recommended</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Search extensions..."
              size="sm"
            />
          </div>
        )
      case 'settings':
        return (
          <div className="p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Settings
            </h2>
            <Select value={settingsFilter} onValueChange={setSettingsFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Settings</SelectItem>
                <SelectItem value="editor">Editor Settings</SelectItem>
                <SelectItem value="workspace">Workspace Settings</SelectItem>
                <SelectItem value="user">User Settings</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Search settings..."
              size="sm"
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-300 overflow-y-auto">
      {renderContent()}
    </div>
  )
}
