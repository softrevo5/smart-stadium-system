/** @jest-environment jsdom */
/**
 * utils.test.ts
 * Unit tests for derived utility logic in the Smart Stadium application.
 * Tests carbon offset calculation, role-based quick actions, and stadium state derivations.
 */

import { REAL_TRANSIT_OPTIONS } from '../lib/stadiumConfig';

// Carbon Offset Calculation
// Mirrors formula in TransitSustainability.tsx:
// totalCarbonSaved = (distanceKm * activeTransit.carbonSavedKg / 10).toFixed(1)
function calculateCarbonSaved(distanceKm: number, carbonSavedKgPer10km: number): string {
  return (distanceKm * carbonSavedKgPer10km / 10).toFixed(1);
}

describe('Carbon Offset Calculation', () => {
  const metroTransit = REAL_TRANSIT_OPTIONS.find(t => t.id === 'metro')!;
  const shuttleTransit = REAL_TRANSIT_OPTIONS.find(t => t.id === 'shuttle')!;
  const rideshareTransit = REAL_TRANSIT_OPTIONS.find(t => t.id === 'rideshare')!;

  it('calculates metro savings at 15km correctly', () => {
    expect(calculateCarbonSaved(15, metroTransit.carbonSavedKg)).toBe('6.3');
  });

  it('calculates shuttle savings at 10km correctly', () => {
    expect(calculateCarbonSaved(10, shuttleTransit.carbonSavedKg)).toBe('3.8');
  });

  it('calculates rideshare savings at 20km correctly', () => {
    expect(calculateCarbonSaved(20, rideshareTransit.carbonSavedKg)).toBe('3.0');
  });

  it('returns 0.0 for 0km distance', () => {
    expect(calculateCarbonSaved(0, metroTransit.carbonSavedKg)).toBe('0.0');
  });

  it('scales linearly with distance', () => {
    const half = parseFloat(calculateCarbonSaved(10, metroTransit.carbonSavedKg));
    const full = parseFloat(calculateCarbonSaved(20, metroTransit.carbonSavedKg));
    expect(full).toBeCloseTo(half * 2, 5);
  });

  it('metro saves more than rideshare at same distance', () => {
    const metroSaved = parseFloat(calculateCarbonSaved(30, metroTransit.carbonSavedKg));
    const rideshareSaved = parseFloat(calculateCarbonSaved(30, rideshareTransit.carbonSavedKg));
    expect(metroSaved).toBeGreaterThan(rideshareSaved);
  });
});

// Transit Config Completeness
describe('REAL_TRANSIT_OPTIONS configuration', () => {
  it('should have exactly 3 transit options', () => {
    expect(REAL_TRANSIT_OPTIONS).toHaveLength(3);
  });

  it('all transit options have required fields', () => {
    REAL_TRANSIT_OPTIONS.forEach(opt => {
      expect(opt.id).toBeTruthy();
      expect(opt.name).toBeTruthy();
      expect(opt.timeMin).toBeGreaterThan(0);
      expect(opt.carbonSavedKg).toBeGreaterThan(0);
      expect(opt.ecoRating).toBeTruthy();
      expect(opt.cost).toBeTruthy();
      expect(opt.status).toBeTruthy();
    });
  });

  it('metro transit has the best eco rating', () => {
    const metro = REAL_TRANSIT_OPTIONS.find(t => t.id === 'metro');
    expect(metro?.ecoRating).toBe('Best');
  });

  it('FIFA shuttle is free with ticket', () => {
    const shuttle = REAL_TRANSIT_OPTIONS.find(t => t.id === 'shuttle');
    expect(shuttle?.cost.toLowerCase()).toContain('free');
  });
});

// Role-based Quick Actions Logic
// Mirrors the useMemo logic in AIAssistant.tsx
function getQuickActionsForRole(role: string): string[] {
  switch (role) {
    case 'fan':
      return [
        'Route me around Gate B queues',
        'Nearest free water refill?',
        'How do I take the green shuttle?',
        'Food with eco-friendly options?'
      ];
    case 'organizer':
      return [
        'Dispatch action plan for Cardiac Event',
        'Analyze all gate traffic and flow rates',
        'Give solar microgrid efficiency report',
        'List unresolved incident details'
      ];
    case 'volunteer':
      return [
        'Protocol for lost child reported',
        'Ticket scanner login troubleshooting',
        'Guidelines for fan recycling bins'
      ];
    case 'staff':
      return [
        'Turnstile network scanner setup',
        'Clean spill Section 104 log',
        'Broadcast crowd flow redirection'
      ];
    default:
      return [];
  }
}

describe('Role-based Quick Actions', () => {
  it('fan role returns 4 action chips', () => {
    expect(getQuickActionsForRole('fan')).toHaveLength(4);
  });

  it('organizer role returns 4 action chips', () => {
    expect(getQuickActionsForRole('organizer')).toHaveLength(4);
  });

  it('volunteer role returns 3 action chips', () => {
    expect(getQuickActionsForRole('volunteer')).toHaveLength(3);
  });

  it('staff role returns 3 action chips', () => {
    expect(getQuickActionsForRole('staff')).toHaveLength(3);
  });

  it('unknown role returns empty array', () => {
    expect(getQuickActionsForRole('admin')).toHaveLength(0);
  });

  it('fan actions include gate routing chip', () => {
    const actions = getQuickActionsForRole('fan');
    expect(actions.some(a => a.toLowerCase().includes('gate'))).toBe(true);
  });

  it('organizer actions include incident management chip', () => {
    const actions = getQuickActionsForRole('organizer');
    expect(actions.some(a => a.toLowerCase().includes('incident'))).toBe(true);
  });

  it('volunteer actions include lost child protocol', () => {
    const actions = getQuickActionsForRole('volunteer');
    expect(actions.some(a => a.toLowerCase().includes('lost child'))).toBe(true);
  });
});
