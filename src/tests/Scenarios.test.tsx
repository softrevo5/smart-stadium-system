import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import Home from '../app/page';
import { SCENARIOS } from '../lib/stadiumConfig';

// Mock the SpeechSynthesis API
const mockCancel = jest.fn();
const mockSpeak = jest.fn();
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      cancel: mockCancel,
      speak: mockSpeak,
      getVoices: () => []
    },
    writable: true
  });
}

// Mock the API endpoint to avoid network requests
// Mock the API endpoints conditionally (Open-Meteo weather and Gemini API)
global.fetch = jest.fn().mockImplementation((url: string) => {
  if (url.includes('open-meteo.com')) {
    return Promise.resolve({
      json: () => Promise.resolve({
        current: {
          temperature_2m: 20, // 20C = 68F
          precipitation: 0.5, // rainy
          weather_code: 61,
          cloud_cover: 75
        }
      })
    });
  }
  return Promise.resolve({
    json: () => Promise.resolve({ content: 'Mocked Gemini response' })
  });
}) as jest.Mock;

describe('Match Day Scenarios Simulation Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all scenario button options', () => {
    render(<Home />);
    
    // Check if the simulation region is present
    expect(screen.getByRole('region', { name: /simulation scenario control panel/i })).toBeInTheDocument();
    
    // Verify each button is displayed — identified by data-testid
    Object.keys(SCENARIOS).forEach(key => {
      expect(screen.getByTestId(`scenario-btn-${key}`)).toBeInTheDocument();
    });
  });

  it('updates stadium state when a scenario is selected', () => {
    render(<Home />);
    
    // Switch to Mid-Match (Halftime Peak)
    const duringButton = screen.getByTestId('scenario-btn-during');
    fireEvent.click(duringButton);
    
    // Verify that attendance capacity updates to halftime level
    // Halftime current capacity is 82,420
    expect(screen.getByText('82,420')).toBeInTheDocument();
    
    // Switch to Post-Match (Dispersal Peak)
    const postButton = screen.getByTestId('scenario-btn-post');
    fireEvent.click(postButton);
    
    // Post-Match current capacity is 32,100
    expect(screen.getByText('32,100')).toBeInTheDocument();
  });

  it('correctly configures evacuation state during Emergency Evacuation scenario', () => {
    render(<Home />);
    
    const emergencyButton = screen.getByTestId('scenario-btn-emergency');
    fireEvent.click(emergencyButton);
    
    // Verify evacuation banner notification elements
    expect(screen.getByText(/evacuation active/i)).toBeInTheDocument();
    
    // Select Gate A to display its details card
    const gateAElement = screen.getByText('A').closest('g');
    expect(gateAElement).not.toBeNull();
    if (gateAElement) {
      fireEvent.click(gateAElement);
    }
    
    // Check if the exit notes are shown now that Gate A details card is visible
    expect(screen.getByText(/ALL EXIT TURNSTILES OPEN/i)).toBeInTheDocument();
  });

  it('dynamically loads real-time weather and updates stadium metrics', async () => {
    render(<Home />);

    // Wait for the asynchronous weather fetch to resolve and update the DOM
    await waitFor(() => {
      const weatherTextElements = screen.getAllByText(/68/);
      expect(weatherTextElements.length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Rainy/i).length).toBeGreaterThan(0);
    });

    // Select Gate A to verify that the rain delay alert is dynamically appended
    const gateAElement = screen.getByText('A').closest('g');
    expect(gateAElement).not.toBeNull();
    if (gateAElement) {
      fireEvent.click(gateAElement);
    }

    // Verify rain warning notes are displayed on the Gate A card
    await waitFor(() => {
      expect(screen.getByText(/⚠️ Rain delays active/i)).toBeInTheDocument();
    });
  });
});
