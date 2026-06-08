import { v4 as uuidv4 } from 'uuid';

interface Registration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: Date;
}

export class RegistrationsRepository {
  private registrations: Registration[] = [];

  create(eventId: string, userId: string): Registration {
    const registration: Registration = {
      id: uuidv4(),
      eventId,
      userId,
      registeredAt: new Date(),
    };
    this.registrations.push(registration);
    return registration;
  }

  findAll(): Registration[] {
    return [...this.registrations];
  }

  findById(id: string): Registration | null {
    return this.registrations.find((r) => r.id === id) || null;
  }

  findByEventId(eventId: string): Registration[] {
    return this.registrations.filter((r) => r.eventId === eventId);
  }

  findByUserId(userId: string): Registration[] {
    return this.registrations.filter((r) => r.userId === userId);
  }

  findByEventAndUser(eventId: string, userId: string): Registration | null {
    return (
      this.registrations.find(
        (r) => r.eventId === eventId && r.userId === userId
      ) || null
    );
  }

  delete(id: string): boolean {
    const index = this.registrations.findIndex((r) => r.id === id);
    if (index === -1) return false;

    this.registrations.splice(index, 1);
    return true;
  }

  loadFromStorage(data: Registration[]): void {
    this.registrations = data;
  }

  getAll(): Registration[] {
    return this.registrations;
  }
}
