export interface Plan {
  id: string;
  title: string;
  date: string; // ISO date string
  time: string; // HH:MM format
  location: string;
  totalSpots: number;
  filledSpots: number;
  rsvpDeadline: string; // ISO date string
  notes?: string;
  createdAt: string;
}

export interface PlanFormData {
  title: string;
  date: Date;
  time: Date;
  location: string;
  totalSpots: string;
  rsvpDeadline: Date;
  notes: string;
}
