# Header Navigation Design

**Date:** 2025-12-28
**Status:** Approved

## Overview

Add a header component to the authenticated app layout that enables users to navigate between organizations and projects. The header replaces the avatar in the gutter and provides breadcrumb-based navigation with dropdown switchers.

## Architecture & Data Flow

### Component Structure
- `Header.tsx` - Main header component containing logo, breadcrumbs, and right-side actions
- `OrgSwitcher.tsx` - Org breadcrumb with name link + dropdown for switching
- `ProjectSwitcher.tsx` - Project breadcrumb with name link + dropdown for switching

### URL Structure
```
/org/:orgSlug/project/:projectSlug
```

When a user switches org/project via the dropdown, we navigate to the new URL. The App component reads URL params to determine current context.

### API Endpoints (to be created)
```
GET /api/orgs - List all orgs the current user is a member of
GET /api/orgs/:orgSlug/projects - List all projects in an org
POST /api/orgs - Create new org
POST /api/orgs/:orgSlug/projects - Create new project
```

### Data Flow
1. User lands on `/org/acme/project/website`
2. Header reads orgSlug and projectSlug from URL params
3. Header fetches user's orgs and current org's projects from API
4. Displays current org/project names in breadcrumb
5. Dropdowns show all available orgs/projects
6. Clicking dropdown item navigates to new URL

## Header Layout

### Visual Structure (left to right)
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] [Org ▼] / [Project ▼]     [?] [Avatar]              │
└─────────────────────────────────────────────────────────────┘
```

### Components (left to right)

1. **Product Logo** - Leftmost, clickable icon/text that navigates to default org/project
2. **Org Switcher** - Two-part component:
   - Text part: Shows current org name, clicking navigates to `/org/:orgSlug` (org overview page)
   - Dropdown button: ChevronDown icon, opens menu with list of user's orgs + "Create new org" option
3. **Separator** - "/" character between org and project
4. **Project Switcher** - Two-part component:
   - Text part: Shows current project name, clicking navigates to `/org/:orgSlug/project/:projectSlug`
   - Dropdown button: ChevronDown icon, opens menu with list of org's projects + "Create new project" option
5. **Right section:**
   - Help icon (HelpCircle from lucide-react) - opens help/docs
   - User avatar (existing UserAvatar component) - opens user menu/settings

### Styling
- Fixed height header (h-12 or h-14)
- Border bottom
- Matches existing design system (gray-100 bg, gray-300 borders like Gutter)

### Gutter Changes
- Remove the avatar button from the bottom (lines 72-79 in Gutter.tsx)
- Keep only the top navigation icons

## Dropdown Menu Behavior

### Org Switcher Dropdown
- Opens below the org name when clicking the ChevronDown button
- Shows scrollable list of user's orgs (from orgMember table where userId = current user)
- Each org item shows org name
- Clicking an org navigates to `/org/:newOrgSlug/project/:defaultProjectSlug`
  - Default project = first project in the new org (alphabetically)
- Bottom of menu has "Create new org" action (opens dialog/modal)

### Project Switcher Dropdown
- Opens below the project name when clicking the ChevronDown button
- Shows scrollable list of projects in current org (from project table where orgId = current org)
- Each project item shows project name
- Clicking a project navigates to `/org/:currentOrgSlug/project/:newProjectSlug`
- Bottom of menu has "Create new project" action (opens dialog/modal)

### Menu Component
- Use existing `Menu` component from `src/components/ui/menu.tsx`
- Use `Popover` for the dropdown positioning
- Keyboard navigation support (arrow keys, Enter to select)

### Edge Cases
- If user has no orgs → redirect to onboarding/create org flow
- If org has no projects → show empty state with "Create project" CTA
- If switching to org with no projects → show project creation prompt

## Routing & App Integration

### Route Structure Changes

Update `App.tsx` routing from:
```tsx
<Route path="/" element={<MainContent />} />
<Route path="/settings" element={<Settings />} />
```

To:
```tsx
<Route path="/org/:orgSlug/project/:projectSlug" element={<MainContent />} />
<Route path="/settings" element={<Settings />} />
<Route path="/" element={<Navigate to={defaultOrgProjectUrl} />} />
```

### Default Route Logic
When user visits `/` (root), redirect them to a default org/project:
1. Fetch user's orgs from API
2. Check localStorage for `lastUsedOrg` and `lastUsedProject`
3. If found and valid → redirect to `/org/:lastOrgSlug/project/:lastProjectSlug`
4. Otherwise → redirect to first org's first project
5. If no orgs exist → redirect to onboarding

### Header Integration
- Header appears on all authenticated routes EXCEPT `/settings` (to match current behavior where settings has no sidebar)
- Header sits above the Gutter + Sidebar + MainContent layout
- Layout becomes: Header (full width) → Row containing [Gutter | Sidebar | MainContent]

### URL Sync
- Create a `useOrgProject()` hook that reads orgSlug and projectSlug from URL params
- Header components use this hook to display current context
- On org/project switch, use `navigate()` to change URL

### localStorage tracking
On successful navigation to org/project route, save to localStorage:
```ts
localStorage.setItem('lastUsedOrg', orgSlug)
localStorage.setItem('lastUsedProject', projectSlug)
```

## Implementation Details

### Header Component
```tsx
// No props needed - reads from URL params and API
function Header() {
  const { orgSlug, projectSlug } = useParams()
  const navigate = useNavigate()
  // Fetches data, renders UI
}
```

### OrgSwitcher Component
```tsx
interface OrgSwitcherProps {
  currentOrgSlug: string
  orgs: Array<{ id: string; name: string; slug: string }>
  onOrgChange: (slug: string) => void
}
```

### ProjectSwitcher Component
```tsx
interface ProjectSwitcherProps {
  currentProjectSlug: string
  currentOrgSlug: string
  projects: Array<{ id: string; name: string; slug: string }>
  onProjectChange: (slug: string) => void
}
```

### API Response Types
```tsx
// GET /api/orgs
type OrgsResponse = Array<{
  id: string
  name: string
  slug: string
  role: 'owner' | 'admin' | 'developer'
}>

// GET /api/orgs/:orgSlug/projects
type ProjectsResponse = Array<{
  id: string
  name: string
  slug: string
  description: string | null
}>
```

### Error Handling
- If orgSlug in URL doesn't exist or user has no access → redirect to default org or show 404
- If projectSlug doesn't exist in org → redirect to first project in org or show 404
- API errors → show toast notification, fallback to cached data if available

### Loading States
- Show skeleton placeholders in breadcrumb while fetching org/project names
- Dropdown shows loading spinner while fetching list

### Create New Org/Project
- For now, show a simple dialog with name input field
- Generate slug automatically from name (lowercase, hyphens)
- After creation, navigate to the new org/project

## Database Schema

Already exists in `src/db/schema.ts`:
- `org` table with id, name, slug
- `project` table with id, orgId, name, slug
- `orgMember` junction table with userId, orgId, role
