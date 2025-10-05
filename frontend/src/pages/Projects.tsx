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
  IconButton,
  Chip,
  LinearProgress,
  TablePagination,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  FolderOpen,
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { Project } from '../types/api.types';

const Projects: React.FC = () => {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const { tasks } = useTasks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setProjectName(project.name);
    } else {
      setEditingProject(null);
      setProjectName('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProject(null);
    setProjectName('');
  };

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      toast.error('Project name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, { name: projectName });
        toast.success('Project updated successfully');
      } else {
        await createProject({ name: projectName });
        toast.success('Project created successfully');
      }
      handleCloseDialog();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save project';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this project? All associated tasks will be deleted.')) {
      return;
    }

    try {
      await deleteProject(id);
      toast.success('Project deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project';
      toast.error(errorMessage);
    }
  };

  const getProjectTaskCount = (projectId: number): number => {
    return tasks.filter(task => task.projectId === projectId).length;
  };

  const paginatedProjects = projects.slice(
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
            Projects
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
          >
            New Project
          </Button>
        </Box>

        <Grid container spacing={3}>
          {paginatedProjects.map((project) => (
            <Grid size={{xs:12, sm:6, md:4}} key={project.id}>
              <Card className="bg-card border border-border h-full hover:shadow-lg transition-shadow">
                <CardContent>
                  <Box className="flex items-start justify-between mb-3">
                    <Box className="flex items-center gap-2">
                      <Box className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="text-primary" />
                      </Box>
                      <Box>
                        <Typography variant="h6" className="font-semibold text-foreground">
                          {project.name}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(project)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(project.id)}
                        className="text-destructive"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box className="mt-4">
                    <Chip
                      label={`${getProjectTaskCount(project.id)} tasks`}
                      size="small"
                      className="bg-accent text-accent-foreground"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {projects.length === 0 && (
          <Box className="text-center py-12">
            <FolderOpen className="text-muted-foreground mx-auto mb-4" fontSize="large" />
            <Typography variant="h6" className="text-muted-foreground mb-2">
              No projects yet
            </Typography>
            <Typography variant="body2" className="text-muted-foreground mb-4">
              Create your first project to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              Create Project
            </Button>
          </Box>
        )}

        {projects.length > 0 && (
          <Box className="mt-4 flex justify-center">
            <TablePagination
              component="div"
              count={projects.length}
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

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingProject ? 'Edit Project' : 'New Project'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Project Name"
              fullWidth
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              variant="outlined"
              disabled={submitting}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !submitting) {
                  handleSubmit();
                }
              }}
            />
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
              ) : editingProject ? (
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

export default Projects;