import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AIAssistant from '../components/AIAssistant';
import { INITIAL_STADIUM_STATE } from '../lib/mockData';

// Mock window.speechSynthesis
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      speak: jest.fn(),
      cancel: jest.fn(),
      speakEnabled: false,
    },
    writable: true,
  });
}

describe('AIAssistant Component', () => {
  it('renders with appropriate fan greeting', async () => {
    render(
      <AIAssistant 
        role="fan" 
        stadiumState={INITIAL_STADIUM_STATE} 
        systemMessage="" 
      />
    );
    
    expect(await screen.findByText(/FIFA 2026 Stadium Companion/i)).toBeInTheDocument();
    expect(screen.getByText(/Route me around Gate B queues/i)).toBeInTheDocument();
  });

  it('renders with appropriate organizer greeting and quick actions', async () => {
    render(
      <AIAssistant 
        role="organizer" 
        stadiumState={INITIAL_STADIUM_STATE} 
        systemMessage="" 
      />
    );
    
    expect(await screen.findByText(/Operations Advisor Online/i)).toBeInTheDocument();
    expect(screen.getByText(/Dispatch action plan for Cardiac Event/i)).toBeInTheDocument();
  });

  it('supports toggling voice speech settings', () => {
    render(
      <AIAssistant 
        role="fan" 
        stadiumState={INITIAL_STADIUM_STATE} 
        systemMessage="" 
      />
    );

    const voiceBtn = screen.getByTitle(/enable voice reader/i);
    expect(voiceBtn).toBeInTheDocument();
    
    fireEvent.click(voiceBtn);
    expect(screen.getByTitle(/disable speech output/i)).toBeInTheDocument();
  });
});
