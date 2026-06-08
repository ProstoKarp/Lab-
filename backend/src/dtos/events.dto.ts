export type EventCategory = 'announcement' | 'meeting' | 'workshop' | 'conference';
export type EventRow = { id: number; title: string; description: string; category: EventCategory; author_id: number; createdAt: string; updatedAt: string };
export type CreateEventDto = { title: string; description: string; category: EventCategory; author_id: number };
export type UpdateEventDto = Partial<Omit<CreateEventDto, 'author_id'>>;
