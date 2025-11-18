import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProjectProvider } from '../../contexts/ProjectContext';
import { AuthProvider } from '../../contexts/AuthContext';
import Projects from '../../components/Projects/Projects';
import { vi } from 'vitest';
import projectService from '../../services/projectService';

// Mock Firebase
vi.mock('../../firebase', () => ({
  db: {},
  auth: {
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com'
    }
  }
}));

// Mock services
vi.mock('../../services/projectService', () => ({
  default: {
    getAllProjects: vi.fn().mockResolvedValue([
      {
        id: 'project-1',
        name: 'Test Project',
        description: 'Test Description',
        status: 'active',
        createdAt: new Date().toISOString(),
        phases: []
      }
    ]),
    createProject: vi.fn().mockResolvedValue({
      id: 'new-project',
      name: 'New Project',
      description: 'New Description',
      status: 'active',
      createdAt: new Date().toISOString(),
      phases: []
    }),
    updateProject: vi.fn().mockResolvedValue(true),
    deleteProject: vi.fn().mockResolvedValue(true)
  }
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      <ProjectProvider>
        {children}
      </ProjectProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('Project Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should load and display projects', async () => {
    render(
      <TestWrapper>
        <Projects />
      </TestWrapper>
    );

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('should create a new project', async () => {
    render(
      <TestWrapper>
        <Projects />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Click create project button
    const createButton = screen.getByText(/nouveau projet/i);
    fireEvent.click(createButton);

    // Fill form
    const nameInput = screen.getByLabelText(/nom du projet/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    fireEvent.change(nameInput, { target: { value: 'New Test Project' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Test Description' } });

    // Submit form
    const submitButton = screen.getByText(/créer/i);
    fireEvent.click(submitButton);

    // Wait for project to be created
    await waitFor(() => {
      expect(screen.getByText('New Test Project')).toBeInTheDocument();
    });
  });

  test('should handle project creation error', async () => {
    // Mock error
    const projectService = await import('../../services/projectService');
    vi.mocked(projectService.default.createProject).mockRejectedValueOnce(
      new Error('Creation failed')
    );

    render(
      <TestWrapper>
        <Projects />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Try to create project
    const createButton = screen.getByText(/nouveau projet/i);
    fireEvent.click(createButton);

    const nameInput = screen.getByLabelText(/nom du projet/i);
    fireEvent.change(nameInput, { target: { value: 'Failed Project' } });

    const submitButton = screen.getByText(/créer/i);
    fireEvent.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/erreur/i)).toBeInTheDocument();
    });
  });

  test('should update project status', async () => {
    render(
      <TestWrapper>
        <Projects />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Find and click status dropdown
    const statusButton = screen.getByText(/actif/i);
    fireEvent.click(statusButton);

    // Select new status
    const completedOption = screen.getByText(/terminé/i);
    fireEvent.click(completedOption);

    // Verify update was called
    await waitFor(() => {
      expect(projectService.updateProject).toHaveBeenCalledWith(
        'project-1',
        expect.objectContaining({ status: 'completed' })
      );
    });
  });

  test('should delete project with confirmation', async () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <TestWrapper>
        <Projects />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // Find and click delete button
    const deleteButton = screen.getByLabelText(/supprimer/i);
    fireEvent.click(deleteButton);

    // Verify confirmation was shown
    expect(confirmSpy).toHaveBeenCalled();

    // Verify delete was called
    await waitFor(() => {
      expect(projectService.deleteProject).toHaveBeenCalledWith('project-1');
    });

    confirmSpy.mockRestore();
  });
});
