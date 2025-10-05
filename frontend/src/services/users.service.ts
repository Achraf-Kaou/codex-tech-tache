import { apiClient } from './api.config';
import { User } from '../types/api.types';

export const usersService = {
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  async getById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  async blockUser(id: number): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}/block`);
    return response.data;
  },

  async activateUser(id: number): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}/activate`);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};