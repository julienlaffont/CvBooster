// API client for CVBooster backend
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "./queryClient";
import type { 
  Cv, 
  CoverLetter, 
  Conversation, 
  Message,
  InsertCv,
  InsertCoverLetter,
  InsertConversation,
  UpdateCv,
  UpdateCoverLetter 
} from "@shared/schema";

// User API
export function useUser() {
  return useQuery<any>({
    queryKey: ['/api/auth/user'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - avoid frequent refetches
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on network reconnect
    refetchInterval: false, // Disable automatic refetching
  });
}

// Dashboard Stats API
export function useDashboardStats() {
  return useQuery<{
    documents: number;
    averageScore: number;
    totalSuggestions: number;
    cvCount: number;
    coverLetterCount: number;
    conversationCount: number;
  }>({
    queryKey: ['/api/dashboard/stats'],
  });
}

// CVs API
export function useCvs() {
  return useQuery<Cv[]>({
    queryKey: ['/api/cvs'],
  });
}

export function useCv(id: string) {
  return useQuery<Cv>({
    queryKey: ['/api/cvs', id],
    enabled: !!id,
  });
}

export function useCreateCv() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertCv) => {
      const res = await apiRequest('POST', '/api/cvs', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cvs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/usage'] });
    },
  });
}

export function useUpdateCv() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCv }) => {
      const res = await apiRequest('PUT', `/api/cvs/${id}`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cvs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cvs', data.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
  });
}

export function useDeleteCv() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/cvs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cvs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
  });
}

export function useAnalyzeCv() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/cvs/${id}/analyze`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cvs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cvs', data.cv.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/usage'] });
    },
  });
}

// Cover Letters API
export function useCoverLetters() {
  return useQuery<CoverLetter[]>({
    queryKey: ['/api/cover-letters'],
  });
}

export function useCoverLetter(id: string) {
  return useQuery<CoverLetter>({
    queryKey: ['/api/cover-letters', id],
    enabled: !!id,
  });
}

export function useCreateCoverLetter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertCoverLetter) => {
      const res = await apiRequest('POST', '/api/cover-letters', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cover-letters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/usage'] });
    },
  });
}

export function useUpdateCoverLetter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCoverLetter }) => {
      const res = await apiRequest('PUT', `/api/cover-letters/${id}`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cover-letters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cover-letters', data.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
  });
}

export function useDeleteCoverLetter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/cover-letters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cover-letters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
  });
}

export function useAnalyzeCoverLetter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('POST', `/api/cover-letters/${id}/analyze`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cover-letters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cover-letters', data.letter.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/usage'] });
    },
  });
}

export function useGenerateCoverLetter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      cvId: string;
      companyName: string;
      position: string;
      jobDescription?: string;
      sector?: string;
    }) => {
      const res = await apiRequest('POST', '/api/cover-letters/generate-from-cv', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cover-letters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
  });
}

// File Upload API
export function useUploadCv() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { file: File; title?: string; sector?: string; position?: string }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.title) formData.append('title', data.title);
      if (data.sector) formData.append('sector', data.sector);
      if (data.position) formData.append('position', data.position);
      
      const res = await fetch('/api/upload/cv', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cvs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
  });
}

export function useUploadCoverLetter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      file: File; 
      title?: string; 
      companyName?: string; 
      position?: string; 
      sector?: string 
    }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.title) formData.append('title', data.title);
      if (data.companyName) formData.append('companyName', data.companyName);
      if (data.position) formData.append('position', data.position);
      if (data.sector) formData.append('sector', data.sector);
      
      const res = await fetch('/api/upload/cover-letter', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cover-letters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
  });
}

// Conversations API
export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertConversation) => {
      const res = await apiRequest('POST', '/api/conversations', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });
}

export function useConversationMessages(conversationId: string) {
  return useQuery<Message[]>({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const res = await apiRequest('POST', `/api/conversations/${conversationId}/messages`, { content });
      return await res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/conversations', variables.conversationId, 'messages'] 
      });
    },
  });
}

// Photo upload and enhancement hooks
export function useUploadPhoto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (photoFile: File) => {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const res = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });
}

export function useAnalyzePhoto() {
  return useMutation({
    mutationFn: async (photoFile: File) => {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const res = await fetch('/api/photo/analyze', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      return await res.json();
    },
  });
}

export function useEnhancePhoto() {
  return useMutation({
    mutationFn: async (photoFile: File) => {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      // Try authenticated endpoint first, fallback to demo endpoint if unauthorized
      let res = await fetch('/api/photo/enhance', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      // If unauthorized, try demo endpoint
      if (res.status === 401) {
        res = await fetch('/api/photo/enhance-demo', {
          method: 'POST',
          body: formData,
        });
      }
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      return await res.json();
    },
  });
}

export function useApplyEnhancedPhoto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (enhancedImageData: string) => {
      const res = await apiRequest('POST', '/api/photo/apply-enhanced', { 
        enhancedImageData 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });
}