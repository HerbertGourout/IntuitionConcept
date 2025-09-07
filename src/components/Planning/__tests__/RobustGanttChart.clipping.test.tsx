import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RobustGanttChart from '../RobustGanttChart';
import { TeamMember } from '../../../types/team';
import { ProjectTask } from '../../../contexts/projectTypes';

function midnight(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

describe('RobustGanttChart clipping indicators', () => {
  const team: TeamMember[] = [] as any;

  it('shows left and right clipping when task overflows window', () => {
    const today = midnight(new Date());
    const visibleStart = midnight(new Date(today.getTime() + 2 * 86400000)); // window starts D+2
    const setVisibleStartDate = vi.fn();

    const task: ProjectTask = {
      id: 'clip',
      name: 'Overflow Task',
      status: 'in_progress',
      startDate: new Date(today.getTime() + 0 * 86400000).toISOString(), // starts before window
      endDate: new Date(today.getTime() + 6 * 86400000).toISOString(),   // ends after window (if daysToShow=3)
      assignedTo: [],
    } as any;

    render(
      <RobustGanttChart
        tasks={[task]}
        teamMembers={team}
        visibleStartDate={visibleStart}
        setVisibleStartDate={setVisibleStartDate}
        daysToShow={3}
      />
    );

    // Task label is rendered
    expect(screen.getByText('Overflow Task')).toBeInTheDocument();

    // Clipping indicators are present by title
    expect(screen.getByTitle('Commence avant la fenêtre visible')).toBeInTheDocument();
    expect(screen.getByTitle('Se termine après la fenêtre visible')).toBeInTheDocument();
  });
});
