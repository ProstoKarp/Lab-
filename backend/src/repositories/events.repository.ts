import { v4 as uuidv4 } from 'uuid';
import { EventCategory } from '../dtos/events.dto';

interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export class EventsRepository {
  private events: Event[] = [];

  create(
    title: string,
    description: string,
    category: EventCategory,
    author: string
  ): Event {
    const event: Event = {
      id: uuidv4(),
      title,
      description,
      category,
      author,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.events.push(event);
    return event;
  }

  findAll(): Event[] {
    return [...this.events];
  }

  findById(id: string): Event | null {
    return this.events.find((e) => e.id === id) || null;
  }

  update(id: string, updates: Partial<Omit<Event, 'id' | 'createdAt'>>): Event | null {
    const event = this.events.find((e) => e.id === id);
    if (!event) return null;

    Object.assign(event, { ...updates, updatedAt: new Date() });
    return event;
  }

  delete(id: string): boolean {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return false;

    this.events.splice(index, 1);
    return true;
  }

  loadFromStorage(data: Event[]): void {
    this.events = data;
  }

  getAll(): Event[] {
    return this.events;
  }
}
