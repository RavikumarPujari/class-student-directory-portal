import { api } from "./api";

export interface Team {
 id: string;
 name: string;
 description: string | null;
 requiredSkills: string | null;
 maxSize: number;
 leaderId: string;
 approvalStatus: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
 createdAt: string;
 updatedAt: string;
 roadmap?: any;
 roadmapGeneratedAt?: string | null;
}

export interface PopulatedTeam extends Team {
 leader: {
 id: string;
 name: string;
 usn: string;
 branch: string;
 photo: string | null;
 };
 memberCount: number;
 isLeader?: boolean;
 members?: Array<{
 id: string;
 name: string;
 usn: string;
 branch: string;
 skills: string;
 photo: string | null;
 email: string;
 joinedAt: string;
 }>;
}

export interface CreateTeamPayload {
 name: string;
 description?: string;
 requiredSkills?: string;
 maxSize?: number;
}

export const teamsService = {
 createTeam: async (data: CreateTeamPayload) => {
 const response = await api.post<{ success: boolean; message: string; data: Team }>("/teams", data);
 return response.data.data;
 },

 getMyTeams: async () => {
 const response = await api.get<{ success: boolean; data: PopulatedTeam[] }>("/teams/me");
 return response.data.data;
 },

 getTeam: async (teamId: string) => {
 const response = await api.get<{ success: boolean; data: PopulatedTeam }>(`/teams/${teamId}`);
 return response.data.data;
 },

 submitTeam: async (teamId: string) => {
 const response = await api.post<{ success: boolean; message: string }>(`/teams/${teamId}/submit`);
 return response.data;
 },

  getAllTeams: async () => {
    const response = await api.get<{ success: boolean; data: PopulatedTeam[] }>("/teams");
    return response.data.data;
  },

  deleteTeam: async (teamId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/teams/${teamId}`);
    return response.data;
  },

  removeMember: async (teamId: string, studentId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/teams/${teamId}/members/${studentId}`);
    return response.data;
  },

  requestToJoinTeam: async (teamId: string) => {
    const response = await api.post<{ success: boolean; message: string }>(`/teams/${teamId}/requests`);
    return response.data;
  },

  generateAIPlan: async (teamId: string) => {
    const response = await api.post<{ success: boolean; data: any }>(`/teams/${teamId}/ai-plan`);
    return response.data.data;
  },

  getMatchingStudents: async (teamId: string, params?: { search?: string; minimumMatchPercentage?: number }) => {
    let url = `/teams/${teamId}/matching-students`;
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.minimumMatchPercentage !== undefined) searchParams.append("minimumMatchPercentage", String(params.minimumMatchPercentage));
    if (searchParams.toString()) url += `?${searchParams.toString()}`;
    
    const response = await api.get<{ success: boolean; data: any[] }>(url);
    return response.data.data;
  },

 inviteStudent: async (teamId: string, studentId: string) => {
 const response = await api.post<{ success: boolean; data: any }>(`/teams/${teamId}/invitations`, { studentId });
 return response.data;
 },

 getInvitations: async (teamId: string) => {
 const response = await api.get<{ success: boolean; data: any[] }>(`/teams/${teamId}/invitations`);
 return response.data.data;
 },

 getMyInvitations: async () => {
 const response = await api.get<{ success: boolean; data: any[] }>("/team-invitations/me");
 return response.data.data;
 },

 acceptInvitation: async (token: string) => {
 const response = await api.post<{ success: boolean; message: string }>(`/team-invitations/${token}/accept`);
 return response.data;
 },

 declineInvitation: async (token: string) => {
 const response = await api.post<{ success: boolean; message: string }>(`/team-invitations/${token}/decline`);
 return response.data;
 },

 getTeamMessages: async (teamId: string) => {
 const response = await api.get<{ success: boolean; data: any[] }>(`/teams/${teamId}/messages`);
 return response.data.data;
 },

  
  clearTeamMessages: async (teamId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/teams/${teamId}/messages`);
    return response.data;
  },
  unsendTeamMessage: async (teamId: string, messageId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/teams/${teamId}/messages/${messageId}`);
    return response.data;
  },
  sendTeamMessage: async (teamId: string, content: string) => {
    const response = await api.post<{ success: boolean; data: any }>(`/teams/${teamId}/messages`, { content });
    return response.data.data;
  },

  generateTeamRoadmap: async (teamId: string) => {
    const response = await api.post<{ success: boolean; data: any }>(`/teams/${teamId}/roadmap`);
    return response.data.data;
  },

  getTeamAIMessages: async (teamId: string) => {
    const response = await api.get<{ success: boolean; data: any[] }>(`/teams/${teamId}/ask-ai`);
    return response.data.data;
  },

  askTeamAI: async (teamId: string, question: string) => {
    const response = await api.post<{ success: boolean; data: any }>(`/teams/${teamId}/ask-ai`, { question });
    return response.data.data;
  }
};
