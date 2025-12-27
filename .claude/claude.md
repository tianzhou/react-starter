# Project Guidelines

## UI Component Library

This project uses a comprehensive UI component library located in `src/components/ui/`.

**Important**: Always use existing UI components from `src/components/ui/` instead of creating custom implementations or using plain HTML elements.

### Available Components

The following components are available in `src/components/ui/`:

#### Form Controls & Inputs
- `input.tsx` - Text input with various types (text, email, password, search, etc.)
- `textarea.tsx` - Multi-line text input
- `select.tsx` - Dropdown select with trigger, content, and items
- `checkbox.tsx` - Single checkbox
- `checkbox-group.tsx` - Group of checkboxes
- `radio-group.tsx` - Radio button group
- `switch.tsx` - Toggle switch
- `slider.tsx` - Range slider
- `number-field.tsx` - Numeric input with increment/decrement

#### Buttons & Interactive
- `button.tsx` - Standard button component
- `toggle.tsx` - Toggle button (on/off state)
- `toggle-group.tsx` - Group of toggle buttons

#### Navigation & Structure
- `menu.tsx` - Dropdown menu with items
- `tabs.tsx` - Tabbed interface
- `breadcrumb.tsx` - Breadcrumb navigation
- `pagination.tsx` - Page navigation controls
- `toolbar.tsx` - Action toolbar container

#### Layout & Containers
- `card.tsx` - Card container with header, content, footer
- `separator.tsx` - Horizontal or vertical divider
- `sheet.tsx` - Slide-out panel/drawer
- `sidebar.tsx` - Sidebar layout component
- `scroll-area.tsx` - Custom scrollable area
- `frame.tsx` - Frame container
- `group.tsx` - Grouping container

#### Dialogs & Overlays
- `dialog.tsx` - Modal dialog
- `alert-dialog.tsx` - Alert/confirmation dialog
- `popover.tsx` - Popover tooltip content
- `tooltip.tsx` - Hover tooltip

#### Feedback & Status
- `alert.tsx` - Alert/notification banner
- `toast.tsx` - Toast notification
- `progress.tsx` - Progress bar
- `meter.tsx` - Meter/gauge component
- `spinner.tsx` - Loading spinner
- `skeleton.tsx` - Loading skeleton placeholder
- `empty.tsx` - Empty state component

#### Data Display
- `table.tsx` - Data table component
- `badge.tsx` - Label/badge for status or count
- `avatar.tsx` - User avatar/profile picture
- `kbd.tsx` - Keyboard shortcut display
- `preview-card.tsx` - Preview card component

#### Advanced Components
- `combobox.tsx` - Searchable select dropdown
- `autocomplete.tsx` - Autocomplete input
- `command.tsx` - Command palette/menu
- `collapsible.tsx` - Collapsible section
- `accordion.tsx` - Accordion with multiple collapsible items

#### Form Structure
- `form.tsx` - Form wrapper component
- `field.tsx` - Form field wrapper
- `fieldset.tsx` - Form fieldset grouping
- `label.tsx` - Form label
- `input-group.tsx` - Input group container

### Usage Guidelines

1. **Always check for existing components** before creating custom UI elements
2. **Import from `./ui/` or `@/components/ui/`** depending on the file location
3. **Follow the component patterns** - check existing usage in the codebase for examples
4. **Use Tailwind CSS** for styling - the components are built with Tailwind
5. **Don't reinvent the wheel** - if a component exists, use it

### Examples

**Good:**
```tsx
import { Input } from './ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'
import { Button } from './ui/button'

<Input type="text" placeholder="Search..." size="sm" />
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Choose option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

**Bad:**
```tsx
// Don't use plain HTML elements when components exist
<input type="text" className="..." />
<select className="...">
  <option>Option 1</option>
</select>
```

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite (using rolldown-vite)
- **Styling**: Tailwind CSS v4
- **UI Base**: @base-ui/react
- **Icons**: lucide-react
- **Routing**: react-router-dom

## Code Style

- Use functional components with hooks
- Prefer `type` imports for TypeScript types: `import type { ... }`
- Use Tailwind utility classes for styling
- Keep components focused and composable
