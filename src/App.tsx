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
import Header from './components/Header'
import { useSession } from './lib/auth-client'

function DefaultRedirect() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function redirect() {
      try {
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

          // Redirect to first org
          navigate(`/org/${orgs[0].slug}`, { replace: true })
          return
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
  const isOrgPage = location.pathname.startsWith('/org/')
  const showSidebar = false // Sidebar is removed for now
  const showHeader = !!session // Always show header when logged in
  const showGutter = !isAccountPage && !!session && isOrgPage

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
