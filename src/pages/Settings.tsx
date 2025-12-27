import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function Settings() {
  const [colorTheme, setColorTheme] = useState<string[]>(['light'])
  const [iconTheme, setIconTheme] = useState<string[]>(['default'])

  return (
    <div className="flex-1 bg-white text-gray-900 overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">
          Manage your workspace preferences and configurations
        </p>

        <div className="space-y-6">
          {/* Editor Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Editor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium">Auto Save</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically save files after a delay
                  </div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium">Word Wrap</Label>
                  <div className="text-sm text-muted-foreground">
                    Controls whether lines should wrap
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium">Minimap</Label>
                  <div className="text-sm text-muted-foreground">
                    Show a small overview of your code
                  </div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium">Font Size</Label>
                  <div className="text-sm text-muted-foreground">
                    Controls the font size in pixels
                  </div>
                </div>
                <Input
                  type="number"
                  defaultValue={14}
                  className="w-20"
                  size="sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium">Color Theme</Label>
                  <div className="text-sm text-muted-foreground">
                    Select your preferred color theme
                  </div>
                </div>
                <Select value={colorTheme} onValueChange={setColorTheme}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="high-contrast">High Contrast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium">Icon Theme</Label>
                  <div className="text-sm text-muted-foreground">
                    File icon theme
                  </div>
                </div>
                <Select value={iconTheme} onValueChange={setIconTheme}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="seti">Seti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Workspace Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Workspace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium">Auto Detect Indentation</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically detect file indentation
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium">Tab Size</Label>
                  <div className="text-sm text-muted-foreground">
                    The number of spaces a tab is equal to
                  </div>
                </div>
                <Input
                  type="number"
                  defaultValue={2}
                  className="w-20"
                  size="sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
