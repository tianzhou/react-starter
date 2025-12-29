import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orgClient } from '../lib/connect-client';

// Query keys
export const orgKeys = {
  all: ['orgs'] as const,
  lists: () => [...orgKeys.all, 'list'] as const,
  list: () => [...orgKeys.lists()] as const,
  details: () => [...orgKeys.all, 'detail'] as const,
  detail: (id: string) => [...orgKeys.details(), id] as const,
  members: (orgId: string) => [...orgKeys.detail(orgId), 'members'] as const,
};

// List all orgs for the current user
export function useOrgs() {
  return useQuery({
    queryKey: orgKeys.list(),
    queryFn: async () => {
      const response = await orgClient.listOrgs({});
      return response.orgs;
    },
  });
}

// Get a single org by ID
export function useOrg(id: string) {
  return useQuery({
    queryKey: orgKeys.detail(id),
    queryFn: async () => {
      const response = await orgClient.getOrg({ id });
      return response.org;
    },
    enabled: !!id,
  });
}

// Create a new organization
export function useCreateOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await orgClient.createOrg(data);
      return response.org;
    },
    onSuccess: (newOrg) => {
      // Invalidate and refetch orgs list
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
      // Optionally set the new org data immediately
      if (newOrg) {
        queryClient.setQueryData(orgKeys.detail(newOrg.id), newOrg);
      }
    },
  });
}

// Update an organization
export function useUpdateOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; name: string }) => {
      const response = await orgClient.updateOrg(data);
      return response.org;
    },
    onSuccess: (updatedOrg) => {
      if (updatedOrg) {
        // Update the cached org data
        queryClient.setQueryData(orgKeys.detail(updatedOrg.id), updatedOrg);
        // Invalidate lists in case name changed
        queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
      }
    },
  });
}

// Delete an organization
export function useDeleteOrg() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orgId: string) => {
      await orgClient.deleteOrg({ id: orgId });
      return orgId;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: orgKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
    },
  });
}
