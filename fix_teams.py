with open("client/src/services/teams.service.ts", "r") as f:
    content = f.read()

import re

# Find the messed up clearTeamMessages and replace it.
pattern = re.compile(r'clearTeamMessages: async \(teamId: string\) => \{ const response = await api\.delete<\{ success: boolean; message: string \}>\(/teams//messages\); return response\.data; \}, unsendTeamMessage: async \(teamId: string, messageId: string\) => \{ const response = await api\.delete<\{ success: boolean; message: string \}>\(/teams//messages/\); return response\.data; \}, sendTeamMessage: async \(teamId: string, content: string\) => \{')

replacement = """clearTeamMessages: async (teamId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/teams/${teamId}/messages`);
    return response.data;
  },
  unsendTeamMessage: async (teamId: string, messageId: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/teams/${teamId}/messages/${messageId}`);
    return response.data;
  },
  sendTeamMessage: async (teamId: string, content: string) => {"""

content = pattern.sub(replacement, content)

with open("client/src/services/teams.service.ts", "w") as f:
    f.write(content)

