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
  timeUntilMatch: string;
  totalAttendance: number;
  currentCapacity: number;
  solarPowerOutput: number; // kW
  wasteDiversion: number; // %
  waterSaved: number; // Gallons
  gates: GateStatus[];
  concessions: ConcessionStatus[];
  incidents: Incident[];
}

export interface Scenario {
  name: string;
  description: string;
  state: StadiumState;
}

export interface TransitOption {
  id: string;
  name: string;
  timeMin: number;
  carbonSavedKg: number;
  ecoRating: string;
  cost: string;
  status: string;
}
