import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Login as LoginIcon, PersonAdd } from '@mui/icons-material';
import { toast } from 'sonner';
import { Role } from '../types/api.types';

const Auth: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register, error, user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      let redirectTo = from;
      if (user.role === Role.ADMIN && redirectTo === '/dashboard') {
        redirectTo = '/users';
      }
      navigate(redirectTo, { replace: true });
    }
  }, [loading, isAuthenticated, user, from, navigate]);

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (tabValue === 1 && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (tabValue === 0) {
        response = await login({ email, password });
        toast.success('Logged in successfully');
      } else {
        response = await register({ email, password, name: name || undefined });
        toast.success('Account created successfully');
      }

      // Role-based redirection logic
      let redirectTo = from;
      if (response.user?.role === 'admin' && redirectTo === '/dashboard') {
        redirectTo = '/users';
      }

      navigate(redirectTo, { replace: true });
    } catch (err) {
      const errorMessage = err.message || 'Authentication failed';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <Box className="text-center mb-6">
            <Typography variant="h4" className="font-bold text-foreground mb-2">
              TaskFlow
            </Typography>
            <Typography variant="body2" className="text-muted-foreground">
              Manage your projects and tasks efficiently
            </Typography>
          </Box>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            className="mb-6"
            variant="fullWidth"
          >
            <Tab label="Login" icon={<LoginIcon />} iconPosition="start" />
            <Tab label="Register" icon={<PersonAdd />} iconPosition="start" />
          </Tabs>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tabValue === 1 && (
              <TextField
                fullWidth
                label="Name (Optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
                disabled={submitting}
              />
            )}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              variant="outlined"
              disabled={submitting}
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              variant="outlined"
              disabled={submitting}
              autoComplete={tabValue === 0 ? 'current-password' : 'new-password'}
              helperText={tabValue === 1 ? 'Minimum 6 characters' : ''}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              {submitting ? (
                <CircularProgress size={24} className="text-primary-foreground" />
              ) : tabValue === 0 ? (
                'Login'
              ) : (
                'Register'
              )}
            </Button>
          </form>

          {tabValue === 0 && (
            <Box className="mt-4 text-center">
              <Typography variant="body2" className="text-muted-foreground">
                Don't have an account?{' '}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setTabValue(1)}
                  className="text-primary"
                >
                  Register here
                </Button>
              </Typography>
            </Box>
          )}

          {tabValue === 1 && (
            <Box className="mt-4 text-center">
              <Typography variant="body2" className="text-muted-foreground">
                Already have an account?{' '}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setTabValue(0)}
                  className="text-primary"
                >
                  Login here
                </Button>
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Auth;