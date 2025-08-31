import { render, screen } from '@testing-library/react';
import React from 'react';

function Hello() {
  return <div>Bonjour Tests</div>;
}

test('renders smoke component', () => {
  render(<Hello />);
  expect(screen.getByText(/Bonjour Tests/i)).toBeInTheDocument();
});
