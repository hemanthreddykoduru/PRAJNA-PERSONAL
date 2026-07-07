import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(path: string, options: RequestInit = {}) {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API Request Failed' }));
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
}

export const facultyApi = {
  getProfile: () => apiRequest('/faculty/profile'),
  updateProfile: (data: any) => apiRequest('/faculty/profile', { method: 'PUT', body: JSON.stringify(data) }),
  lookupDoi: (doi: string) => apiRequest(`/research/lookup?doi=${doi}`),
  submitPublication: (data: any) => apiRequest('/research', { method: 'POST', body: JSON.stringify(data) }),
  
  // Business logic routes added for end-to-end integration
  getScore: (facultyId: string) => apiRequest(`/score/${facultyId}`),
  getRankings: (facultyId: string) => apiRequest(`/leaderboard/rankings/${facultyId}`),
  getPendingCount: () => apiRequest('/approval/pending/me/count'),
};
