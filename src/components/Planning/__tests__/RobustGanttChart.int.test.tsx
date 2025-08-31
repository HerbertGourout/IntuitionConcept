import { render, screen } from '@testing-library/react';
import React from 'react';
import RobustGanttChart from '../RobustGanttChart';
import type { ProjectTask } from '../../../contexts/projectTypes';
import type { TeamMember } from '../../../types/team';

function makeDate(iso: string): string {
  // Keep as ISO string; component parses to Date and normalizes to midnight
  return iso;
}

describe('RobustGanttChart integration', () => {
  const team: TeamMember[] = [
    { id: 'u1', name: 'Alice', role: 'engineer' } as any,
    { id: 'u2', name: 'Bob', role: 'manager' } as any,
  ];

  const baseStart = new Date();
  baseStart.setHours(0, 0, 0, 0);

  const tasks: ProjectTask[] = [
    {
      id: 't1',
      name: 'Tâche A',
      status: 'in_progress',
      startDate: makeDate(new Date(baseStart).toISOString()),
      endDate: makeDate(new Date(baseStart.getTime() + 2 * 86400000).toISOString()),
      assignedTo: ['u1'],
    } as any,
    {
      id: 't2',
      name: 'Tâche B (start only)',
      status: 'planned',
      startDate: makeDate(new Date(baseStart.getTime() + 1 * 86400000).toISOString()),
      // dueDate/endDate omitted -> fallback to startDate for 1-day bar
      assignedTo: ['u2'],
    } as any,
  ];

  it('renders task bars for valid visible tasks', () => {
    const setVisibleStartDate = vi.fn();
    render(
      <RobustGanttChart
        tasks={tasks}
        teamMembers={team}
        visibleStartDate={baseStart}
        setVisibleStartDate={setVisibleStartDate}
        daysToShow={7}
      />
    );

    // Bars render the task names inside
    expect(screen.getByText('Tâche A')).toBeInTheDocument();
    expect(screen.getByText('Tâche B (start only)')).toBeInTheDocument();

    // Info panel shows counts
    expect(screen.getByText(/Tâches valides:/)).toBeInTheDocument();
    expect(screen.getByText(/Barres affichées:/)).toBeInTheDocument();
  });
});
