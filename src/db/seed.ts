import { closeDB, dbRun } from './db';
import { runMigrations } from './migrations';

async function seed(): Promise<void> {
  try {
    await runMigrations();
    console.log('Seeding database...');
    const users = [
      { name: 'Анастасія Лисенко', email: 'anastasiia@example.com' },
      { name: 'Іван Петренко', email: 'ivan@example.com' },
      { name: 'Марія Коваленко', email: 'maria@example.com' },
      { name: 'Олег Шевченко', email: 'oleh@example.com' },
      { name: 'Софія Мельник', email: 'sofiia@example.com' }
    ];
    for (const u of users) await dbRun('INSERT OR IGNORE INTO users (name, email) VALUES (?, ?);', [u.name, u.email]);
    const events = [
      { title: 'Зустріч групи', description: 'Організаційна зустріч щодо навчальних планів', category: 'meeting', author_id: 1 },
      { title: 'Оголошення про дедлайн', description: 'Нагадування про дедлайн здачі лабораторної роботи', category: 'announcement', author_id: 2 },
      { title: 'Майстер-клас SQLite', description: 'Практичний мінітренінг із SQLite та CRUD', category: 'workshop', author_id: 3 },
      { title: 'Навчальна конференція', description: 'Виступи студентів і презентація проєктів', category: 'conference', author_id: 1 },
      { title: 'Дозвілля після пар', description: 'Неформальна зустріч групи після занять', category: 'meeting', author_id: 4 }
    ];
    for (const e of events) {
      await dbRun('INSERT OR IGNORE INTO events (title, description, category, author_id) VALUES (?, ?, ?, ?);', [e.title, e.description, e.category, e.author_id]);
    }
    const regs = [
      { user_id: 1, event_id: 1, status: 'registered' }, { user_id: 2, event_id: 1, status: 'attended' },
      { user_id: 3, event_id: 2, status: 'registered' }, { user_id: 4, event_id: 3, status: 'registered' },
      { user_id: 5, event_id: 3, status: 'cancelled' }, { user_id: 2, event_id: 4, status: 'attended' },
      { user_id: 3, event_id: 4, status: 'registered' }, { user_id: 5, event_id: 5, status: 'registered' }
    ];
    for (const r of regs) {
      await dbRun('INSERT OR IGNORE INTO registrations (user_id, event_id, status) VALUES (?, ?, ?);', [r.user_id, r.event_id, r.status]);
    }
    console.log('Seed completed');
  } finally {
    await closeDB();
  }
}
seed().catch((e) => { console.error('Seed failed:', e); process.exit(1); });
