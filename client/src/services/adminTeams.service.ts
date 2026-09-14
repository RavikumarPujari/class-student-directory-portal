import { api } from "./api";
import { PopulatedTeam } from "./teams.service";

export const adminTeamsService = {
  getPendingTeams: async () => {
    const response = await api.get<{ success: boolean; data: PopulatedTeam[] }>("/admin/teams/pending");
    return response.data.data;
  },

  getAllTeams: async () => {
    const response = await api.get<{ success: boolean; data: PopulatedTeam[] }>("/admin/teams");
    return response.data.data;
  },

  reviewTeam: async (teamId: string, status: "APPROVED" | "REJECTED") => {
    const response = await api.post<{ success: boolean; data: PopulatedTeam }>(`/admin/teams/${teamId}/review`, { status });
    return response.data.data;
  }
};
