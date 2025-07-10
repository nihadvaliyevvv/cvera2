// API client utilities for frontend
export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Get token from localStorage if not already set
    if (!this.accessToken && typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      console.log('Making API request to:', url);
      console.log('Request options:', { 
        ...options, 
        headers,
        body: options.body ? JSON.parse(options.body as string) : undefined
      });
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('API response status:', response.status);
      console.log('API response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        console.error('API Error Response:', errorData);
        
        // Create a detailed error message
        const errorMessage = errorData.error || `HTTP ${response.status}`;
        const errorDetails = errorData.details ? ` - ${errorData.details}` : '';
        
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
      }
      throw error;
    }
  }

  // Auth endpoints
  async register(data: { name: string; email: string; password: string }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async refreshToken() {
    return this.request('/api/auth/refresh-token', {
      method: 'POST',
    });
  }

  // User endpoints
  async getCurrentUser() {
    return this.request('/api/users/me');
  }

  async updateUser(data: { name?: string; email?: string; password?: string }) {
    return this.request('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // CV endpoints
  async getCVs() {
    return this.request('/api/cvs');
  }

  async getCV(id: string) {
    return this.request(`/api/cvs/${id}`);
  }

  async createCV(data: { title: string; cv_data: Record<string, unknown> }) {
    return this.request('/api/cvs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCV(id: string, data: { title: string; cv_data: Record<string, unknown> }) {
    return this.request(`/api/cvs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCV(id: string) {
    return this.request(`/api/cvs/${id}`, {
      method: 'DELETE',
    });
  }

  // Template endpoints
  async getTemplates() {
    return this.request('/api/templates');
  }

  // LinkedIn import
  async importLinkedIn(url: string) {
    return this.request('/api/import/linkedin', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // File generation
  async downloadCV(cvId: string, format: 'pdf' | 'docx') {
    return this.request(`/api/cvs/${cvId}/download`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
  }

  async getJobStatus(jobId: string) {
    return this.request(`/api/jobs/${jobId}/status`);
  }

  async getJobResult(jobId: string) {
    return this.request(`/api/jobs/${jobId}/result`);
  }
}

export const apiClient = new ApiClient();
