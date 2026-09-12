import { api } from "./api";

export interface Team {
 id: string;
 name: string;
 description: string | null;
 requiredSkills: string | null;
 maxSize: number;
 leaderId: string;
 createdAt: string;
 updatedAt: string;
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

 getMatchingStudents: async (teamId: string, params?: { search?: string; minimumMatchPercentage?: number }) => {
 const response = await api.get<any[]>(`/teams/${teamId}/matching-students`, { params });
 return response.data;
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

 sendTeamMessage: async (teamId: string, content: string) => {
 const response = await api.post<{ success: boolean; data: any }>(`/teams/${teamId}/messages`, { content });
 return response.data.data;
 }
};

