import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export class UsersRepository {
  private users: User[] = [];

  create(name: string, email: string): User {
    const user: User = {
      id: uuidv4(),
      name,
      email,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  findAll(): User[] {
    return [...this.users];
  }

  findById(id: string): User | null {
    return this.users.find((u) => u.id === id) || null;
  }

  update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;

    Object.assign(user, updates);
    return user;
  }

  delete(id: string): boolean {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    return true;
  }

  loadFromStorage(data: User[]): void {
    this.users = data;
  }

  getAll(): User[] {
    return this.users;
  }
}
