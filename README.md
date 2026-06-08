# Board Application API — Лабораторна робота 3

Проєкт залишає початкову ідею та дизайн: це **дошка оголошень групи** з авторами, категоріями та текстом оголошення. У версії `0.3.0` бекенд переведено на SQLite, TypeScript, міграції, seed-дані, повний CRUD і контрольовані помилки API.

## Запуск

```bash
npm install
npm run build
npm start
```

Для розробки без попереднього build:

```bash
npm run dev
```

Заповнити базу тестовими даними:

```bash
npm run seed
```

Frontend відкривається файлом:

```text
Frontend/index.html
```

API працює на:

```text
http://localhost:3000/api
```

## SQLite

- SQLite-файл створюється автоматично у `data/app.db`.
- `data/`, `*.db`, `*.db-journal` додані в `.gitignore`, тому локальна база не має потрапляти в репозиторій.
- При старті сервера виконується `runMigrations()` до `app.listen()`.
- Увімкнено `PRAGMA foreign_keys = ON`.
- ORM не використовується.
- SQL-запити ізольовані в `src/repositories/*`, а не розкидані по routes.

## Структура

```text
src/
├── app.ts
├── server.ts
├── controllers/
├── services/
├── repositories/
├── routes/
├── middleware/
├── errors/
├── db/
│   ├── db.ts
│   ├── migrations.ts
│   ├── seed.ts
│   └── sql.ts
├── dtos/
└── migrations/
    ├── 001_init.sql
    └── 002_add_indexes.sql
Frontend/
├── index.html
├── app.js
└── styles.css
```

## Схема БД

### `users`

| Поле | Тип | Обмеження |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY |
| `name` | TEXT | NOT NULL, CHECK length >= 3 |
| `email` | TEXT | NOT NULL, UNIQUE |
| `createdAt` | TEXT | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

### `events`

| Поле | Тип | Обмеження |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY |
| `title` | TEXT | NOT NULL, CHECK length >= 5 |
| `description` | TEXT | NOT NULL, CHECK not empty |
| `category` | TEXT | NOT NULL, CHECK: `announcement`, `meeting`, `workshop`, `conference` |
| `author_id` | INTEGER | NOT NULL, FK → `users(id)` ON DELETE CASCADE |
| `createdAt` | TEXT | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `updatedAt` | TEXT | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

### `registrations`

| Поле | Тип | Обмеження |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY |
| `user_id` | INTEGER | NOT NULL, FK → `users(id)` ON DELETE CASCADE |
| `event_id` | INTEGER | NOT NULL, FK → `events(id)` ON DELETE CASCADE |
| `status` | TEXT | NOT NULL, CHECK: `registered`, `attended`, `cancelled` |
| `createdAt` | TEXT | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `UNIQUE(user_id, event_id)` | — | один користувач не може двічі зареєструватися на ту саму подію |

### `schema_migrations`

Технічна таблиця для фіксації застосованих міграцій.

## Зв’язки

- `users 1:N events`: один користувач може створити багато оголошень/подій.
- `users 1:N registrations`: один користувач може мати багато реєстрацій.
- `events 1:N registrations`: одна подія може мати багато реєстрацій.
- Для дочірніх таблиць використано `ON DELETE CASCADE`, щоб при видаленні користувача або події не залишалися “биті” записи.

## Міграції

Міграції лежать у `src/migrations/` і застосовуються за порядком назв:

- `001_init.sql` — створення таблиць `users`, `events`, `registrations`.
- `002_add_indexes.sql` — індекси для пошуку, сортування та JOIN.

Таблиця `schema_migrations` не дозволяє застосувати одну й ту саму міграцію двічі.

## Основні endpoint-и

### Users

| Метод | URL | Опис |
|---|---|---|
| GET | `/api/users?sort=id&order=ASC&limit=20` | список користувачів |
| GET | `/api/users/:id` | користувач за id |
| POST | `/api/users` | створення користувача |
| PUT | `/api/users/:id` | оновлення користувача |
| DELETE | `/api/users/:id` | видалення користувача |

### Events

| Метод | URL | Опис |
|---|---|---|
| GET | `/api/events` | список подій |
| GET | `/api/events?category=workshop&sort=createdAt&order=DESC&limit=5` | приклад WHERE + ORDER BY + LIMIT |
| GET | `/api/events/:id` | подія за id |
| POST | `/api/events` | створення події |
| PUT | `/api/events/:id` | оновлення події |
| DELETE | `/api/events/:id` | видалення події |
| GET | `/api/events/details/with-authors?category=meeting&sort=author_name&order=ASC&limit=10` | JOIN + фільтри + сортування |
| GET | `/api/events/search/unsafe?q=test` | демонстраційний небезпечний пошук для SQLi-пояснення |

### Registrations

| Метод | URL | Опис |
|---|---|---|
| GET | `/api/registrations` | список реєстрацій |
| GET | `/api/registrations?status=registered&sort=createdAt&order=DESC&limit=10` | фільтрація + сортування |
| GET | `/api/registrations/:id` | реєстрація за id |
| POST | `/api/registrations` | створення реєстрації |
| PUT | `/api/registrations/:id` | оновлення статусу |
| DELETE | `/api/registrations/:id` | видалення реєстрації |
| GET | `/api/registrations/details/all` | JOIN: реєстрації + користувачі + події |
| GET | `/api/registrations/stats/per-event` | агрегація COUNT/SUM по подіях |

## Формат відповідей

Успішний список:

```json
{
  "data": [],
  "meta": {
    "count": 0
  }
}
```

Успішний один запис:

```json
{
  "data": {
    "id": 1
  }
}
```

Помилка:

```json
{
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "details": null
  }
}
```

## HTTP-коди

- `200` — успішне читання або оновлення.
- `201` — створення запису.
- `204` — успішне видалення.
- `400` — некоректні дані, CHECK/NOT NULL/FOREIGN KEY або неправильні query-параметри.
- `404` — ресурс з таким id не знайдено.
- `409` — конфлікт унікальності, наприклад дубль email або повторна реєстрація.
- `500` — неочікувана помилка сервера.

## Приклади curl

Створити користувача:

```bash
curl -X POST http://localhost:3000/api/users ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\"}"
```

Створити оголошення:

```bash
curl -X POST http://localhost:3000/api/events ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Нове оголошення\",\"description\":\"Текст оголошення\",\"category\":\"announcement\",\"author_id\":1}"
```

WHERE + ORDER + LIMIT:

```bash
curl "http://localhost:3000/api/events?category=workshop&sort=createdAt&order=DESC&limit=5"
```

JOIN:

```bash
curl "http://localhost:3000/api/events/details/with-authors?category=meeting&sort=author_name&order=ASC&limit=10"
```

Агрегація:

```bash
curl http://localhost:3000/api/registrations/stats/per-event
```

Перевірка 404:

```bash
curl http://localhost:3000/api/events/999999
```

Перевірка 409:

```bash
curl -X POST http://localhost:3000/api/users ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\"}"
```

## Навчальна демонстрація SQL injection

У лабораторній №3 параметризовані запити ще не використовуються. Для демонстрації ризику залишено спеціальний endpoint:

```text
GET /api/events/search/unsafe?q=...
```

У ньому `q` навмисно вставляється у SQL через рядкову конкатенацію. Наприклад, “поганий” ввід може змінити логіку `WHERE`:

```text
' OR '1'='1
```

Це зроблено лише для навчального пояснення небезпеки. У звичайних CRUD-запитах рядки екрануються через `sqlText()`, але в реальних проєктах правильне рішення — параметризовані запити, які розглядаються в наступній лабораторній.

## Що закриває критерії

### Задовільно

- Є SQLite-підключення `src/db/db.ts`.
- Є запуск міграцій перед стартом сервера `src/server.ts`.
- Є 3 таблиці, PK, FK, `PRAGMA foreign_keys = ON`.
- CRUD працює через SQLite, не через фейкові масиви.
- Є WHERE + ORDER BY + LIMIT.
- Є 400/404/409/500 через централізований error handler.

### Добре

- Є `schema_migrations` і SQL-міграції.
- Є індекси для типових фільтрів/JOIN.
- SQL винесений у repository-шар.
- Є seed-скрипт.
- Є JOIN endpoint.
- Є фільтрація і сортування списків.

### Відмінно

- Бекенд написаний на TypeScript.
- Є міграції `001_init.sql`, `002_add_indexes.sql`.
- Є опис схеми в README.
- Є endpoint з агрегацією `COUNT/SUM`.
- Є JOIN + фільтри + сортування.
- Є навчальна SQLi-демонстрація.
- Формат відповідей узгоджений: `{ data, meta }` / `{ error }`.
