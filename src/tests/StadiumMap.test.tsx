import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StadiumMap from '../components/StadiumMap';
import { GateStatus } from '../lib/mockData';

const mockGates: GateStatus[] = [
  { id: 'gate-a', name: 'Gate A (North)', congestion: 'low', flowRate: 85, estimatedWait: 2, accessibleRamps: true },
  { id: 'gate-b', name: 'Gate B (East)', congestion: 'high', flowRate: 190, estimatedWait: 18, accessibleRamps: true },
  { id: 'gate-c', name: 'Gate C (South)', congestion: 'medium', flowRate: 110, estimatedWait: 8, accessibleRamps: false },
  { id: 'gate-d', name: 'Gate D (West)', congestion: 'low', flowRate: 40, estimatedWait: 1, accessibleRamps: true }
];

describe('StadiumMap Component', () => {
  it('renders the map title and description', () => {
    render(<StadiumMap gates={mockGates} onSelectGate={jest.fn()} selectedGateId={null} />);
    
    expect(screen.getByRole('heading', { name: /interactive wayfinding map/i })).toBeInTheDocument();
    expect(screen.getByText(/click a gate or section/i)).toBeInTheDocument();
  });

  it('renders SVG gate indicators', () => {
    render(
      <StadiumMap gates={mockGates} onSelectGate={jest.fn()} selectedGateId={null} />
    );
    
    // Check for our interactive gate text elements A, B, C, D
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('triggers onSelectGate when a gate is clicked', () => {
    const handleSelectGate = jest.fn();
    render(
      <StadiumMap gates={mockGates} onSelectGate={handleSelectGate} selectedGateId={null} />
    );

    const gateACircle = screen.getByText('A').closest('g');
    expect(gateACircle).not.toBeNull();
    
    if (gateACircle) {
      fireEvent.click(gateACircle);
      expect(handleSelectGate).toHaveBeenCalledWith(mockGates[0]);
    }
  });

  it('toggles accessibility mode and highlights ADA routes', () => {
    render(
      <StadiumMap gates={mockGates} onSelectGate={jest.fn()} selectedGateId={null} />
    );

    const toggleBtn = screen.getByRole('button', { name: /accessibility view/i });
    expect(toggleBtn).toBeInTheDocument();
    
    // Click toggle
    fireEvent.click(toggleBtn);
    expect(screen.getByRole('button', { name: /disable ada highlighting/i })).toBeInTheDocument();
  });
});
