export type EventCategory = 'Оголошення' | 'Навчання' | 'Дозвілля';

export interface CreateEventDto {
  title: string;
  description: string;
  category: EventCategory;
  author: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  category?: EventCategory;
  author?: string;
}

export interface EventResponseDto {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}
