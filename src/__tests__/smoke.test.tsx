import { render, screen } from '@testing-library/react';
import React from 'react';
import { it, expect } from 'vitest';

function Hello() {
  return <div>Bonjour Tests</div>;
}

it('renders smoke component', () => {
  render(<Hello />);
  expect(screen.getByText(/Bonjour Tests/i)).toBeInTheDocument();
});
