export interface GateStatus {
  id: string;
  name: string;
  congestion: 'low' | 'medium' | 'high';
  flowRate: number; // people per min
  estimatedWait: number; // minutes
  accessibleRamps: boolean;
  notes?: string;
}

export interface ConcessionStatus {
  id: string;
  name: string;
  type: 'food' | 'merch' | 'drinks';
  queueSize: number;
  estimatedWait: number;
  featuredGreenItem: string;
}

export interface Incident {
  id: string;
  title: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  status: 'reported' | 'dispatching' | 'resolved';
  timestamp: string;
  description: string;
  category: 'safety' | 'technical' | 'crowd' | 'medical';
  aiActionPlan?: string;
}

export interface StadiumState {
  timeUntilMatch: string; // e.g., "-45 mins" or "Live"
  totalAttendance: number;
  currentCapacity: number;
  solarPowerOutput: number; // kW
  wasteDiversion: number; // %
  waterSaved: number; // Gallons
  gates: GateStatus[];
  concessions: ConcessionStatus[];
  incidents: Incident[];
}

export const INITIAL_STADIUM_STATE: StadiumState = {
  timeUntilMatch: 'Match Starts in 45m',
  totalAttendance: 68500,
  currentCapacity: 48920,
  solarPowerOutput: 420, // kW
  wasteDiversion: 82, // %
  waterSaved: 12500, // Gallons
  gates: [
    { id: 'gate-a', name: 'Gate A (North Entrance)', congestion: 'low', flowRate: 85, estimatedWait: 2, accessibleRamps: true },
    { id: 'gate-b', name: 'Gate B (East/Plaza)', congestion: 'high', flowRate: 190, estimatedWait: 18, accessibleRamps: true, notes: 'Direct link to Light Rail' },
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

export const MOCK_TRANSIT_OPTIONS = [
  { id: 'metro', name: 'Metro (Line 6 - Stadium Link)', timeMin: 18, carbonSavedKg: 4.2, ecoRating: 'Best', cost: '$2.50', status: 'Running on schedule' },
  { id: 'shuttle', name: 'FIFA Green Shuttle (Electric)', timeMin: 22, carbonSavedKg: 3.8, ecoRating: 'Excellent', cost: 'Free with ticket', status: '5 min headway' },
  { id: 'rideshare', name: 'Eco Rideshare (Hybrid/EV only)', timeMin: 35, carbonSavedKg: 1.5, ecoRating: 'Fair', cost: '$22.00', status: 'High demand, expect delays' }
];

export const MOCK_GUIDELINES_SUMMARY = `
=== FIFA WORLD CUP 2026 STADIUM GUIDELINES ===
- Bag Policy: Clear bags only. Maximum size: 12" x 6" x 12". One bag per person.
- Prohibited Items: Weapons, lasers, glass bottles, metal cans, flares, drones.
- Accessibility: All gates except Gate C have accessible ramps. Elevators are located at Gates A, B, and D. Accessible restrooms are located in every section concourse.
- Sustainability: Bring reusable bottles (non-glass, under 750ml) to use at hydration stations. Recyclables must go to Blue bins, compostables to Green bins.
- Emergency Protocols: Evacuation routes lead to outer plaza. AEDs are located at first aid stations near Section 112, 220, and 305.
`;
