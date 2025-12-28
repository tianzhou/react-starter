import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Gutter from './components/Gutter'
import type { GutterItem } from './components/Gutter'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import Account from './pages/Account'
import OrgHome from './pages/OrgHome'
import OrgSettings from './pages/OrgSettings'
import ProjectHome from './pages/ProjectHome'
import ProjectSettings from './pages/ProjectSettings'
import Header from './components/Header'
import { useSession } from './lib/auth-client'
import { getLastUsedOrgProject } from './hooks/useOrgProject'

function DefaultRedirect() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function redirect() {
      try {
        // Try to get last used org/project from localStorage
        const { lastUsedOrg, lastUsedProject } = getLastUsedOrgProject()

        // Fetch user's orgs
        const response = await fetch('http://localhost:3001/api/orgs', {
          credentials: 'include',
        })

        if (response.ok) {
          const orgs = await response.json()
          if (orgs.length === 0) {
            // No orgs, should redirect to onboarding (for now just show a message)
            setLoading(false)
            return
          }

          // Try to use last used org, or fall back to first org
          const targetOrgSlug = lastUsedOrg || orgs[0].slug

          // Fetch projects for the target org
          const projectsResponse = await fetch(
            `http://localhost:3001/api/orgs/${targetOrgSlug}/projects`,
            { credentials: 'include' }
          )

          if (projectsResponse.ok) {
            const projects = await projectsResponse.json()
            if (projects.length > 0) {
              const targetProjectSlug = lastUsedProject || projects[0].slug
              navigate(`/org/${targetOrgSlug}/project/${targetProjectSlug}`, { replace: true })
              return
            }
          }

          // No projects in target org, use first org's first project
          const firstOrgProjectsResponse = await fetch(
            `http://localhost:3001/api/orgs/${orgs[0].slug}/projects`,
            { credentials: 'include' }
          )

          if (firstOrgProjectsResponse.ok) {
            const firstOrgProjects = await firstOrgProjectsResponse.json()
            if (firstOrgProjects.length > 0) {
              navigate(`/org/${orgs[0].slug}/project/${firstOrgProjects[0].slug}`, {
                replace: true,
              })
              return
            }
          }
        }
      } catch (error) {
        console.error('Failed to redirect:', error)
      }
      setLoading(false)
    }

    redirect()
  }, [navigate])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">No organizations found</h1>
        <p className="text-gray-600">Please create an organization to get started.</p>
      </div>
    </div>
  )
}

function AppLayout() {
  const [activeItem, setActiveItem] = useState<GutterItem>('home')
  const location = useLocation()
  const { data: session, isPending } = useSession()

  // Determine active item based on route
  useEffect(() => {
    if (location.pathname.includes('/settings')) {
      setActiveItem('settings')
    } else {
      setActiveItem('home')
    }
  }, [location.pathname])

  const isAccountPage = location.pathname === '/account'
  const isOrgProjectPage = location.pathname.startsWith('/org/')
  const showSidebar = false // Sidebar is removed for now
  const showHeader = !!session && (isOrgProjectPage || isAccountPage)
  const showGutter = !isAccountPage && !!session && isOrgProjectPage

  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
      {showHeader && <Header />}
      <div className="flex flex-1 overflow-hidden">
        {showGutter && <Gutter activeItem={activeItem} onItemClick={setActiveItem} />}
        {showSidebar && <Sidebar activeItem={activeItem} />}
        <Routes>
          <Route path="/" element={<DefaultRedirect />} />
          <Route path="/org/:orgSlug" element={<OrgHome />} />
          <Route path="/org/:orgSlug/settings" element={<OrgSettings />} />
          <Route path="/org/:orgSlug/project/:projectSlug" element={<ProjectHome />} />
          <Route path="/org/:orgSlug/project/:projectSlug/settings" element={<ProjectSettings />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
