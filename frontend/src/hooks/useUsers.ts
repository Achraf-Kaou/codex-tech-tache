import { useState, useEffect } from 'react';
import { usersService } from '../services/users.service';
import { User } from '../types/api.types';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getAll();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (id: number) => {
    try {
      setLoading(true);
      const updated = await usersService.blockUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return updated;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to block user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const activateUser = async (id: number) => {
    try {
      setLoading(true);
      const updated = await usersService.activateUser(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      return updated;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      setLoading(true);
      await usersService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    blockUser,
    activateUser,
    deleteUser,
  };
};