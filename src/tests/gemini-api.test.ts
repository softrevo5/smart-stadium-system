/** @jest-environment node */
import { POST } from '../app/api/gemini/route';
import { NextRequest } from 'next/server';
import { INITIAL_STADIUM_STATE } from '../lib/mockData';

// Mock the GoogleGenerativeAI SDK to avoid live calls during tests
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockImplementation(() => {
          return {
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: () => 'Mocked Gemini Response'
              }
            })
          };
        })
      };
    })
  };
});

describe('Gemini API Route Handler', () => {
  const createMockRequest = (body: Record<string, unknown>) => {
    return new NextRequest('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  it('runs demo fallback when process.env.GEMINI_API_KEY is not defined', async () => {
    // Save current key and delete to test fallback
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const req = createMockRequest({
      role: 'fan',
      stadiumState: INITIAL_STADIUM_STATE,
      messages: [{ role: 'user', content: 'What is the queue like at Gate B?' }]
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.content).toContain('[DEMO MODE]');
    expect(data.content).toContain('Gate B'); // Fallback logic response contains Gate B info
    
    // Restore key
    if (originalKey) {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it('handles malformed requests with 500 status', async () => {
    const req = new NextRequest('http://localhost:3000/api/gemini', {
      method: 'POST',
      body: null, // Empty body raises error in JSON parsing
    });

    const response = await POST(req);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBe('Failed to process request');
  });
});
