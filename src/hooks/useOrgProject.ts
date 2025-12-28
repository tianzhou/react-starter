import { useParams } from 'react-router-dom'
import { useEffect } from 'react'

/**
 * Hook to get current org and project from URL params
 * Also saves to localStorage for "last used" tracking
 */
export function useOrgProject() {
  const { orgSlug, projectSlug } = useParams<{
    orgSlug: string
    projectSlug: string
  }>()

  // Save to localStorage when params change
  useEffect(() => {
    if (orgSlug) {
      localStorage.setItem('lastUsedOrg', orgSlug)
    }
    if (projectSlug) {
      localStorage.setItem('lastUsedProject', projectSlug)
    }
  }, [orgSlug, projectSlug])

  return { orgSlug, projectSlug }
}

/**
 * Get last used org/project from localStorage
 */
export function getLastUsedOrgProject() {
  return {
    lastUsedOrg: localStorage.getItem('lastUsedOrg'),
    lastUsedProject: localStorage.getItem('lastUsedProject'),
  }
}
