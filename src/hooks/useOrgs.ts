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

// Get a single org by ID or slug
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
    mutationFn: async (data: { name: string; slug: string }) => {
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
    mutationFn: async (data: { id: string; name?: string; slug?: string }) => {
      const response = await orgClient.updateOrg(data);
      return response.org;
    },
    onSuccess: (updatedOrg) => {
      if (updatedOrg) {
        // Update the cached org data
        queryClient.setQueryData(orgKeys.detail(updatedOrg.id), updatedOrg);
        // Invalidate lists in case slug or name changed
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

// List org members
export function useOrgMembers(orgId: string) {
  return useQuery({
    queryKey: orgKeys.members(orgId),
    queryFn: async () => {
      const response = await orgClient.listMembers({ orgId });
      return response.members;
    },
    enabled: !!orgId,
  });
}

// Add a member to an org
export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { orgId: string; userId: string; role: string }) => {
      const response = await orgClient.addMember(data);
      return { member: response.member, orgId: data.orgId };
    },
    onSuccess: ({ orgId }) => {
      // Invalidate members list
      queryClient.invalidateQueries({ queryKey: orgKeys.members(orgId) });
    },
  });
}

// Update member role
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { orgId: string; userId: string; role: string }) => {
      const response = await orgClient.updateMemberRole(data);
      return { member: response.member, orgId: data.orgId };
    },
    onSuccess: ({ orgId }) => {
      // Invalidate members list
      queryClient.invalidateQueries({ queryKey: orgKeys.members(orgId) });
    },
  });
}

// Remove a member from an org
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { orgId: string; userId: string }) => {
      await orgClient.removeMember(data);
      return data;
    },
    onSuccess: ({ orgId }) => {
      // Invalidate members list
      queryClient.invalidateQueries({ queryKey: orgKeys.members(orgId) });
    },
  });
}
