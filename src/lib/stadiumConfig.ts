import { StadiumState, Scenario, TransitOption } from './types';

// MetLife Stadium Real-world Specifications (Actual World Cup 2026 facts)
export const METLIFE_STADIUM_CAPACITY = 82500;

export const STADIUM_GUIDELINES_SUMMARY = `
=== METLIFE STADIUM FIFA WORLD CUP 2026 GUIDELINES ===
- Bag Policy: Clear bags only. Maximum size: 12" x 6" x 12". One bag per person.
- Prohibited Items: Weapons, lasers, glass bottles, metal cans, flares, drones.
- Accessibility: All gates except Gate C have accessible ramps. Elevators are located at Gates A, B, and D. Accessible restrooms are located in every section concourse.
- Sustainability: Bring reusable bottles (non-glass, under 750ml) to use at hydration stations. Recyclables must go to Blue bins, compostables to Green bins.
- Emergency Protocols: Evacuation routes lead to outer plaza. AEDs are located at first aid stations near Section 112, 220, and 305.
`;

export const REAL_TRANSIT_OPTIONS: TransitOption[] = [
  { id: 'metro', name: 'Meadowlands Rail Line (NJ Transit)', timeMin: 18, carbonSavedKg: 4.2, ecoRating: 'Best', cost: '$2.50', status: 'Running on schedule' },
  { id: 'shuttle', name: 'FIFA Green Shuttle (Electric)', timeMin: 22, carbonSavedKg: 3.8, ecoRating: 'Excellent', cost: 'Free with ticket', status: '5 min headway' },
  { id: 'rideshare', name: 'Eco Rideshare (Hybrid/EV only)', timeMin: 35, carbonSavedKg: 1.5, ecoRating: 'Fair', cost: '$22.00', status: 'High demand, expect delays' }
];

export const INITIAL_STADIUM_STATE: StadiumState = {
  timeUntilMatch: 'Match Starts in 45m',
  totalAttendance: METLIFE_STADIUM_CAPACITY,
  currentCapacity: 58000,
  solarPowerOutput: 420, // kW
  wasteDiversion: 82, // %
  waterSaved: 12500, // Gallons
  gates: [
    { id: 'gate-a', name: 'Gate A (North Entrance)', congestion: 'low', flowRate: 85, estimatedWait: 2, accessibleRamps: true },
    { id: 'gate-b', name: 'Gate B (East/Plaza)', congestion: 'high', flowRate: 190, estimatedWait: 18, accessibleRamps: true, notes: 'Direct link to Meadowlands Rail' },
    { id: 'gate-c', name: 'Gate C (South Entrance)', congestion: 'medium', flowRate: 110, estimatedWait: 8, accessibleRamps: false, notes: 'Stairs only, use Gate B for accessibility' },
    { id: 'gate-d', name: 'Gate D (VIP & West)', congestion: 'low', flowRate: 40, estimatedWait: 1, accessibleRamps: true }
  ],
  concessions: [
    { id: 'conc-1', name: 'Azteca Tacos & Empanadas', type: 'food', queueSize: 22, estimatedWait: 12, featuredGreenItem: 'Plant-based Chorizo Tacos' },
    { id: 'conc-2', name: 'MetLife Arena Grill', type: 'food', queueSize: 35, estimatedWait: 18, featuredGreenItem: 'Organic Grass-fed Burgers' },
    { id: 'conc-3', name: 'FIFA official Merchandise Hub', type: 'merch', queueSize: 45, estimatedWait: 22, featuredGreenItem: 'Upcycled Polyester Jersey' },
    { id: 'conc-4', name: 'Eco-Hydration Station 1', type: 'drinks', queueSize: 3, estimatedWait: 1, featuredGreenItem: 'Free Filtered Water Refill' }
  ],
  incidents: [
    {
      id: 'inc-1',
      title: 'Ticket Scanner Failure',
      location: 'Gate B - Turnstiles 4 & 5',
      severity: 'medium',
      status: 'reported',
      timestamp: '22:15',
      description: 'Handheld scanner units disconnected from network. Slowing entry flow by 30%.',
      category: 'technical'
    },
    {
      id: 'inc-2',
      title: 'Restroom Spill',
      location: 'Section 104 - Concourse Area',
      severity: 'low',
      status: 'reported',
      timestamp: '22:20',
      description: 'Slippery surface reported near Men\'s Restroom. Safety hazard for incoming crowd.',
      category: 'safety'
    },
    {
      id: 'inc-3',
      title: 'Cardiac Event Reported',
      location: 'Section 218 - Row K',
      severity: 'high',
      status: 'reported',
      timestamp: '22:31',
      description: 'Fan reports chest pain and dizziness. Needs emergency responder with AED unit.',
      category: 'medical'
    }
  ]
};

export const SCENARIOS: Record<string, Scenario> = {
  arrival: {
    name: 'Match 1: Brazil vs Morocco (June 13, 2026) - Arrival Peak',
    description: 'Actual tournament match 1. High gate queues as fans enter the stadium. Fast flow rates.',
    state: {
      timeUntilMatch: 'Match Starts in 45m',
      totalAttendance: METLIFE_STADIUM_CAPACITY,
      currentCapacity: 58000,
      solarPowerOutput: 420,
      wasteDiversion: 82,
      waterSaved: 12500,
      gates: [
        { id: 'gate-a', name: 'Gate A (North Entrance)', congestion: 'medium', flowRate: 120, estimatedWait: 6, accessibleRamps: true },
        { id: 'gate-b', name: 'Gate B (East/Plaza)', congestion: 'high', flowRate: 195, estimatedWait: 18, accessibleRamps: true, notes: 'Direct link to Meadowlands Rail. Peak entry rush.' },
        { id: 'gate-c', name: 'Gate C (South Entrance)', congestion: 'high', flowRate: 140, estimatedWait: 14, accessibleRamps: false, notes: 'Stairs only, use Gate B for accessibility' },
        { id: 'gate-d', name: 'Gate D (VIP & West)', congestion: 'low', flowRate: 40, estimatedWait: 3, accessibleRamps: true }
      ],
      concessions: [
        { id: 'conc-1', name: 'Azteca Tacos & Empanadas', type: 'food', queueSize: 10, estimatedWait: 5, featuredGreenItem: 'Plant-based Chorizo Tacos' },
        { id: 'conc-2', name: 'MetLife Arena Grill', type: 'food', queueSize: 12, estimatedWait: 6, featuredGreenItem: 'Organic Grass-fed Burgers' },
        { id: 'conc-3', name: 'FIFA official Merchandise Hub', type: 'merch', queueSize: 15, estimatedWait: 8, featuredGreenItem: 'Upcycled Polyester Jersey' },
        { id: 'conc-4', name: 'Eco-Hydration Station 1', type: 'drinks', queueSize: 2, estimatedWait: 1, featuredGreenItem: 'Free Filtered Water Refill' }
      ],
      incidents: [
        {
          id: 'inc-1',
          title: 'Ticket Scanner Failure',
          location: 'Gate B - Turnstiles 4 & 5',
          severity: 'medium',
          status: 'reported',
          timestamp: '22:15',
          description: 'Handheld scanner units disconnected from network. Slowing entry flow by 30%.',
          category: 'technical'
        }
      ]
    }
  },
  during: {
    name: 'Match 2: France vs Senegal (June 16, 2026) - Halftime Peak',
    description: 'Actual tournament match 2. Gates are clear, but concession and restroom lines peak.',
    state: {
      timeUntilMatch: 'Halftime',
      totalAttendance: METLIFE_STADIUM_CAPACITY,
      currentCapacity: 82420,
      solarPowerOutput: 480,
      wasteDiversion: 84,
      waterSaved: 14200,
      gates: [
        { id: 'gate-a', name: 'Gate A (North Entrance)', congestion: 'low', flowRate: 5, estimatedWait: 1, accessibleRamps: true },
        { id: 'gate-b', name: 'Gate B (East/Plaza)', congestion: 'low', flowRate: 8, estimatedWait: 1, accessibleRamps: true },
        { id: 'gate-c', name: 'Gate C (South Entrance)', congestion: 'low', flowRate: 4, estimatedWait: 1, accessibleRamps: false },
        { id: 'gate-d', name: 'Gate D (VIP & West)', congestion: 'low', flowRate: 2, estimatedWait: 1, accessibleRamps: true }
      ],
      concessions: [
        { id: 'conc-1', name: 'Azteca Tacos & Empanadas', type: 'food', queueSize: 48, estimatedWait: 22, featuredGreenItem: 'Plant-based Chorizo Tacos' },
        { id: 'conc-2', name: 'MetLife Arena Grill', type: 'food', queueSize: 55, estimatedWait: 26, featuredGreenItem: 'Organic Grass-fed Burgers' },
        { id: 'conc-3', name: 'FIFA official Merchandise Hub', type: 'merch', queueSize: 62, estimatedWait: 30, featuredGreenItem: 'Upcycled Polyester Jersey' },
        { id: 'conc-4', name: 'Eco-Hydration Station 1', type: 'drinks', queueSize: 28, estimatedWait: 7, featuredGreenItem: 'Free Filtered Water Refill' }
      ],
      incidents: [
        {
          id: 'inc-2',
          title: 'Restroom Spill',
          location: 'Section 104 - Concourse Area',
          severity: 'low',
          status: 'reported',
          timestamp: '22:20',
          description: 'Slippery surface reported near Men\'s Restroom. Safety hazard for incoming crowd.',
          category: 'safety'
        },
        {
          id: 'inc-3',
          title: 'Cardiac Event Reported',
          location: 'Section 218 - Row K',
          severity: 'high',
          status: 'reported',
          timestamp: '22:31',
          description: 'Fan reports chest pain and dizziness. Needs emergency responder with AED unit.',
          category: 'medical'
        }
      ]
    }
  },
  post: {
    name: 'Match 8: World Cup Final (July 19, 2026) - Dispersal Peak',
    description: 'Actual tournament final. Event ends, stadium is emptying. High demand on public transit.',
    state: {
      timeUntilMatch: 'Match Ended',
      totalAttendance: METLIFE_STADIUM_CAPACITY,
      currentCapacity: 32100,
      solarPowerOutput: 30,
      wasteDiversion: 86,
      waterSaved: 16500,
      gates: [
        { id: 'gate-a', name: 'Gate A (North Entrance)', congestion: 'low', flowRate: 0, estimatedWait: 1, accessibleRamps: true },
        { id: 'gate-b', name: 'Gate B (East/Plaza)', congestion: 'low', flowRate: 0, estimatedWait: 1, accessibleRamps: true },
        { id: 'gate-c', name: 'Gate C (South Entrance)', congestion: 'low', flowRate: 0, estimatedWait: 1, accessibleRamps: false },
        { id: 'gate-d', name: 'Gate D (VIP & West)', congestion: 'low', flowRate: 0, estimatedWait: 1, accessibleRamps: true }
      ],
      concessions: [
        { id: 'conc-1', name: 'Azteca Tacos & Empanadas', type: 'food', queueSize: 2, estimatedWait: 1, featuredGreenItem: 'Plant-based Chorizo Tacos' },
        { id: 'conc-2', name: 'MetLife Arena Grill', type: 'food', queueSize: 1, estimatedWait: 1, featuredGreenItem: 'Organic Grass-fed Burgers' },
        { id: 'conc-3', name: 'FIFA official Merchandise Hub', type: 'merch', queueSize: 28, estimatedWait: 12, featuredGreenItem: 'Upcycled Polyester Jersey' },
        { id: 'conc-4', name: 'Eco-Hydration Station 1', type: 'drinks', queueSize: 0, estimatedWait: 0, featuredGreenItem: 'Free Filtered Water Refill' }
      ],
      incidents: []
    }
  },
  emergency: {
    name: 'Emergency Evacuation Protocol Simulation',
    description: 'Safety drills and crisis response testing. All gate turnstiles configured for exit.',
    state: {
      timeUntilMatch: 'EVACUATION ACTIVE',
      totalAttendance: METLIFE_STADIUM_CAPACITY,
      currentCapacity: 68000,
      solarPowerOutput: 400,
      wasteDiversion: 82,
      waterSaved: 12500,
      gates: [
        { id: 'gate-a', name: 'Gate A (North Exit Path)', congestion: 'low', flowRate: 350, estimatedWait: 2, accessibleRamps: true, notes: 'ALL EXIT TURNSTILES OPEN' },
        { id: 'gate-b', name: 'Gate B (East Exit Path)', congestion: 'medium', flowRate: 410, estimatedWait: 5, accessibleRamps: true, notes: 'METRO DISPERSAL FLOW ACTIVE' },
        { id: 'gate-c', name: 'Gate C (South Exit Path)', congestion: 'high', flowRate: 290, estimatedWait: 8, accessibleRamps: false, notes: 'STAIRS ONLY WARNING - REDIRECT WHEELCHAIRS' },
        { id: 'gate-d', name: 'Gate D (VIP & West Exit Path)', congestion: 'low', flowRate: 180, estimatedWait: 1, accessibleRamps: true, notes: 'EXIT FLOW RUNNING EFFICIENTLY' }
      ],
      concessions: [
        { id: 'conc-1', name: 'Azteca Tacos & Empanadas', type: 'food', queueSize: 0, estimatedWait: 0, featuredGreenItem: 'Plant-based Chorizo Tacos' },
        { id: 'conc-2', name: 'MetLife Arena Grill', type: 'food', queueSize: 0, estimatedWait: 0, featuredGreenItem: 'Organic Grass-fed Burgers' },
        { id: 'conc-3', name: 'FIFA official Merchandise Hub', type: 'merch', queueSize: 0, estimatedWait: 0, featuredGreenItem: 'Upcycled Polyester Jersey' },
        { id: 'conc-4', name: 'Eco-Hydration Station 1', type: 'drinks', queueSize: 0, estimatedWait: 0, featuredGreenItem: 'Free Filtered Water Refill' }
      ],
      incidents: [
        {
          id: 'inc-4',
          title: 'Arena Fire Alarm Tripped',
          location: 'Concourse West Wing',
          severity: 'high',
          status: 'reported',
          timestamp: '23:45',
          description: 'Emergency warning triggered. Evacuation in progress.',
          category: 'safety'
        }
      ]
    }
  }
};
