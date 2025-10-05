import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  FolderOpen,
  Assignment,
  ArrowForward,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { Status } from '../types/api.types';

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();

  const loading = projectsLoading || tasksLoading;

  useEffect(() => {
    if (projectsError) {
      toast.error(projectsError);
    }
    if (tasksError) {
      toast.error(tasksError);
    }
  }, [projectsError, tasksError]);

  const getStatusColor = (status: Status): ChipColor => {
    switch (status) {
      case Status.DONE:
        return 'success';
      case Status.IN_PROGRESS:
        return 'warning';
      case Status.PENDING:
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Status): string => {
    return status.replace('_', ' ');
  };

  const getProjectProgress = (projectId: number): number => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter((t) => t.status === Status.DONE).length;
    return (completed / projectTasks.length) * 100;
  };

  const getProjectTaskCount = (projectId: number): number => {
    return tasks.filter(task => task.projectId === projectId).length;
  };

  const inProgressCount = tasks.filter((t) => t.status === Status.IN_PROGRESS).length;
  const completedCount = tasks.filter((t) => t.status === Status.DONE).length;

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
        <Typography variant="h4" className="font-bold text-foreground mb-6">
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card className="bg-card border border-border">
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="body2" className="text-muted-foreground">
                      Total Projects
                    </Typography>
                    <Typography variant="h4" className="font-bold text-foreground">
                      {projects.length}
                    </Typography>
                  </Box>
                  <FolderOpen className="text-primary" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card className="bg-card border border-border">
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="body2" className="text-muted-foreground">
                      Total Tasks
                    </Typography>
                    <Typography variant="h4" className="font-bold text-foreground">
                      {tasks.length}
                    </Typography>
                  </Box>
                  <Assignment className="text-secondary" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card className="bg-card border border-border">
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="body2" className="text-muted-foreground">
                      In Progress
                    </Typography>
                    <Typography variant="h4" className="font-bold text-foreground">
                      {inProgressCount}
                    </Typography>
                  </Box>
                  <Box className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                    <Assignment className="text-warning" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card className="bg-card border border-border">
              <CardContent>
                <Box className="flex items-center justify-between">
                  <Box>
                    <Typography variant="body2" className="text-muted-foreground">
                      Completed
                    </Typography>
                    <Typography variant="h4" className="font-bold text-foreground">
                      {completedCount}
                    </Typography>
                  </Box>
                  <Box className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                    <Assignment className="text-success" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Projects */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card className="bg-card border border-border">
              <CardContent>
                <Box className="flex items-center justify-between mb-4">
                  <Typography variant="h6" className="font-semibold text-foreground">
                    Recent Projects
                  </Typography>
                  <IconButton size="small" onClick={() => navigate('/projects')}>
                    <ArrowForward />
                  </IconButton>
                </Box>
                <Box className="space-y-3">
                  {projects.slice(0, 5).map((project) => (
                    <Box
                      key={project.id}
                      className="p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => navigate('/projects')}
                    >
                      <Box className="flex items-center justify-between mb-2">
                        <Typography variant="body1" className="font-medium text-foreground">
                          {project.name}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          {getProjectTaskCount(project.id)} tasks
                        </Typography>
                      </Box>
                      <Box className="flex items-center gap-2">
                        <LinearProgress
                          variant="determinate"
                          value={getProjectProgress(project.id)}
                          className="h-2 rounded-full flex-1"
                        />
                        <Typography variant="caption" className="text-muted-foreground min-w-[40px]">
                          {Math.round(getProjectProgress(project.id))}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  {projects.length === 0 && (
                    <Typography variant="body2" className="text-muted-foreground text-center py-4">
                      No projects yet
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Tasks */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card className="bg-card border border-border">
              <CardContent>
                <Box className="flex items-center justify-between mb-4">
                  <Typography variant="h6" className="font-semibold text-foreground">
                    My Tasks
                  </Typography>
                  <IconButton size="small" onClick={() => navigate('/tasks')}>
                    <ArrowForward />
                  </IconButton>
                </Box>
                <Box className="space-y-3">
                  {tasks.slice(0, 5).map((task) => {
                    const project = projects.find(p => p.id === task.projectId);
                    return (
                      <Box
                        key={task.id}
                        className="p-3 rounded-lg border border-border hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => navigate('/tasks')}
                      >
                        <Box className="flex items-center justify-between mb-1">
                          <Typography variant="body1" className="font-medium text-foreground">
                            {task.name}
                          </Typography>
                          <Chip
                            label={getStatusLabel(task.status)}
                            size="small"
                            color={getStatusColor(task.status)}
                            className="h-6"
                          />
                        </Box>
                        <Typography variant="caption" className="text-muted-foreground">
                          {project?.name || 'Unknown Project'}
                        </Typography>
                      </Box>
                    );
                  })}
                  {tasks.length === 0 && (
                    <Typography variant="body2" className="text-muted-foreground text-center py-4">
                      No tasks assigned
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default Dashboard;