import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  TablePagination,
  Avatar,
  Button,
} from '@mui/material';
import {
  Block,
  CheckCircle,
  Delete,
  PersonOff,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useUsers } from '../hooks/useUsers';
import { Role } from '../types/api.types';

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const Users: React.FC = () => {
  const { users, loading, blockUser, activateUser, deleteUser } = useUsers();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const handleBlockUser = async (id: number) => {
    setActionLoading(id);
    try {
      await blockUser(id);
      toast.success('User blocked successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to block user';
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivateUser = async (id: number) => {
    setActionLoading(id);
    try {
      await activateUser(id);
      toast.success('User activated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to activate user';
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setActionLoading(id);
    try {
      await deleteUser(id);
      toast.success('User deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleColor = (role: Role): ChipColor => {
    return role === Role.ADMIN ? 'primary' : 'default';
  };

  const getInitials = (name: string | null, email: string): string => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name[0].toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const paginatedUsers = users.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Layout>
        <Box className="flex items-center justify-center h-full">
          <LinearProgress className="w-48" />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        <Box className="flex items-center justify-between mb-6">
          <Box>
            <Typography variant="h4" className="font-bold text-foreground">
              User Management
            </Typography>
            <Typography variant="body2" className="text-muted-foreground mt-1">
              Manage user accounts and permissions
            </Typography>
          </Box>
          <Chip
            label={`${users.length} Total Users`}
            color="primary"
            variant="outlined"
          />
        </Box>

        <Card className="bg-card border border-border">
          <CardContent>
            <Box className="space-y-4">
              {paginatedUsers.map((user) => (
                <Card key={user.id} className="bg-background border border-border">
                  <CardContent>
                    <Box className="flex items-center justify-between">
                      <Box className="flex items-center gap-4">
                        <Avatar className="bg-primary text-primary-foreground w-12 h-12">
                          {getInitials(user.name, user.email)}
                        </Avatar>
                        <Box>
                          <Box className="flex items-center gap-2 mb-1 flex-wrap">
                            <Typography variant="h6" className="font-semibold text-foreground">
                              {user.name || 'Unnamed User'}
                            </Typography>
                            <Chip
                              label={user.role}
                              size="small"
                              color={getRoleColor(user.role)}
                            />
                            {user.bloqued && (
                              <Chip
                                label="Blocked"
                                size="small"
                                color="error"
                                icon={<PersonOff />}
                              />
                            )}
                            {!user.active && (
                              <Chip
                                label="Inactive"
                                size="small"
                                color="warning"
                              />
                            )}
                          </Box>
                          <Typography variant="body2" className="text-muted-foreground">
                            {user.email}
                          </Typography>
                          <Typography variant="caption" className="text-muted-foreground">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box className="flex gap-2">
                        {user.bloqued ? (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CheckCircle />}
                            onClick={() => handleActivateUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="border-success text-success hover:bg-success/10"
                          >
                            {actionLoading === user.id ? 'Loading...' : 'Activate'}
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Block />}
                            onClick={() => handleBlockUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="border-warning text-warning hover:bg-warning/10"
                          >
                            {actionLoading === user.id ? 'Loading...' : 'Block'}
                          </Button>
                        )}
                        <IconButton
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={actionLoading === user.id}
                          className="text-destructive"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {users.length === 0 && (
              <Box className="text-center py-12">
                <Typography variant="h6" className="text-muted-foreground mb-2">
                  No users found
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  All registered users will appear here
                </Typography>
              </Box>
            )}

            {users.length > 0 && (
              <Box className="mt-4 flex justify-center">
                <TablePagination
                  component="div"
                  count={users.length}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Layout>
  );
};

export default Users;