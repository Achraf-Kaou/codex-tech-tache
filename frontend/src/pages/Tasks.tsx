import React, { useState } from 'react';
import Layout from '../components/Layout';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  LinearProgress,
  TablePagination,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Assignment,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { Status } from '../types/api.types';

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const Tasks: React.FC = () => {
  const { tasks, loading: tasksLoading, createTask, updateTask } = useTasks();
  const { projects, loading: projectsLoading } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [taskName, setTaskName] = useState('');
  const [taskStatus, setTaskStatus] = useState<Status>(Status.PENDING);
  const [taskProjectId, setTaskProjectId] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);

  const loading = tasksLoading || projectsLoading;

  const handleOpenDialog = (taskId?: number) => {
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setEditingTaskId(task.id);
        setTaskName(task.name);
        setTaskStatus(task.status);
        setTaskProjectId(task.projectId);
      }
    } else {
      setEditingTaskId(null);
      setTaskName('');
      setTaskStatus(Status.PENDING);
      setTaskProjectId('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTaskId(null);
    setTaskName('');
    setTaskStatus(Status.PENDING);
    setTaskProjectId('');
  };

  const handleSubmit = async () => {
    if (!taskName.trim() || !taskProjectId) {
      toast.error('Task name and project are required');
      return;
    }

    setSubmitting(true);
    try {
      const taskData = {
        name: taskName,
        status: taskStatus,
        projectId: Number(taskProjectId),
      };

      if (editingTaskId) {
        await updateTask(editingTaskId, taskData);
        toast.success('Task updated successfully');
      } else {
        await createTask(taskData);
        toast.success('Task created successfully');
      }
      handleCloseDialog();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save task';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: Status) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      await updateTask(taskId, {
        name: task.name,
        status: newStatus,
        projectId: task.projectId,
      });
      toast.success('Task status updated');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
      toast.error(errorMessage);
    }
  };

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

  const paginatedTasks = tasks.slice(
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
          <Typography variant="h4" className="font-bold text-foreground">
            Tasks
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
            disabled={projects.length === 0}
          >
            New Task
          </Button>
        </Box>

        {projects.length === 0 && (
          <Box className="text-center py-12">
            <Assignment className="text-muted-foreground mx-auto mb-4" fontSize="large" />
            <Typography variant="h6" className="text-muted-foreground mb-2">
              No projects available
            </Typography>
            <Typography variant="body2" className="text-muted-foreground mb-4">
              You need to create a project before adding tasks
            </Typography>
          </Box>
        )}

        {projects.length > 0 && (
          <>
            <Grid container spacing={3}>
              {paginatedTasks.map((task) => {
                const project = projects.find(p => p.id === task.projectId);
                return (
                  <Grid size={{xs:12, sm:6, md:4}} key={task.id}>
                    <Card className="bg-card border border-border h-full hover:shadow-lg transition-shadow">
                      <CardContent>
                        <Box className="flex items-start justify-between mb-3">
                          <Box className="flex items-center gap-2 flex-1">
                            <Box className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                              <Assignment className="text-secondary" />
                            </Box>
                            <Box className="flex-1 min-w-0">
                              <Typography variant="h6" className="font-semibold text-foreground truncate">
                                {task.name}
                              </Typography>
                              <Typography variant="caption" className="text-muted-foreground">
                                {project?.name || 'Unknown Project'}
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(task.id)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box className="mt-4">
                          <FormControl size="small" fullWidth>
                            <Select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value as Status)}
                              className="bg-background"
                            >
                              <MenuItem value={Status.PENDING}>
                                <Chip label="Pending" size="small" color="default" />
                              </MenuItem>
                              <MenuItem value={Status.IN_PROGRESS}>
                                <Chip label="In Progress" size="small" color="warning" />
                              </MenuItem>
                              <MenuItem value={Status.DONE}>
                                <Chip label="Done" size="small" color="success" />
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {tasks.length === 0 && (
              <Box className="text-center py-12">
                <Assignment className="text-muted-foreground mx-auto mb-4" fontSize="large" />
                <Typography variant="h6" className="text-muted-foreground mb-2">
                  No tasks yet
                </Typography>
                <Typography variant="body2" className="text-muted-foreground mb-4">
                  Create your first task to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground"
                >
                  Create Task
                </Button>
              </Box>
            )}

            {tasks.length > 0 && (
              <Box className="mt-4 flex justify-center">
                <TablePagination
                  component="div"
                  count={tasks.length}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </Box>
            )}
          </>
        )}

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingTaskId ? 'Edit Task' : 'New Task'}
          </DialogTitle>
          <DialogContent className="space-y-4 pt-4">
            <TextField
              autoFocus
              label="Task Name"
              fullWidth
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              variant="outlined"
              disabled={submitting}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !submitting) {
                  handleSubmit();
                }
              }}
            />
            <FormControl fullWidth disabled={submitting}>
              <InputLabel>Project</InputLabel>
              <Select
                value={taskProjectId}
                onChange={(e) => setTaskProjectId(e.target.value as number)}
                label="Project"
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth disabled={submitting}>
              <InputLabel>Status</InputLabel>
              <Select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as Status)}
                label="Status"
              >
                <MenuItem value={Status.PENDING}>Pending</MenuItem>
                <MenuItem value={Status.IN_PROGRESS}>In Progress</MenuItem>
                <MenuItem value={Status.DONE}>Done</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
              disabled={submitting}
            >
              {submitting ? (
                <Box className="flex items-center gap-2">
                  <LinearProgress className="w-16" />
                </Box>
              ) : editingTaskId ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Tasks;