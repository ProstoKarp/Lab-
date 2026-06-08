# Дошка оголошень групи — ЛР 05, версія 1.0.0

Проєкт залишає ідею та дизайн дошки оголошень: користувачі створюють оголошення, переглядають список подій, реєструються на події, а статистика показує кількість реєстрацій.

У цій версії виконано вимоги ЛР 05: захист від SQL Injection, XSS, Broken Access Control / IDOR та базовий Security Misconfiguration hardening.

## Запуск

Встановити залежності:

```bash
npm install
```

Опційно наповнити БД тестовими даними:

```bash
npm run seed
```

Запуск у двох терміналах:

```bash
npm run dev:be
```

```bash
npm run dev:fe
```

Адреси:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000/api/v1`
- Healthcheck: `http://localhost:3000/api/v1/health`

## Основні можливості UI

- створення користувача;
- редагування імені користувача через кнопку ✎ у таблиці користувачів;
- створення оголошення від імені обраного автора;
- редагування/видалення тільки своїх оголошень;
- реєстрація будь-якого створеного користувача на подію;
- зміна статусу реєстрації;
- статистика реєстрацій по подіях;
- стани `loading / success / empty / error`;
- скасування/таймаут fetch-запиту через `AbortController`.

## API

Усі основні маршрути мають префікс `/api/v1`.

### Users

```text
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
```

Приклад створення користувача:

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Новий користувач\"}"
```

Приклад редагування імені:

```bash
curl -X PUT http://localhost:3000/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Оновлене ім'я\"}"
```

### Events

```text
GET    /api/v1/events
GET    /api/v1/events/details/with-authors
GET    /api/v1/events/:id                  захищено X-Demo-UserId
POST   /api/v1/events                      захищено X-Demo-UserId
PUT    /api/v1/events/:id                  захищено X-Demo-UserId
DELETE /api/v1/events/:id                  захищено X-Demo-UserId
```

Для створення, перегляду деталей, редагування й видалення конкретного оголошення потрібен заголовок `X-Demo-UserId`. Його значення має збігатися з `author_id` оголошення.

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -H "X-Demo-UserId: 1" \
  -d "{\"title\":\"Оголошення\",\"description\":\"Текст оголошення\",\"category\":\"announcement\",\"author_id\":1}"
```

### Registrations

```text
GET    /api/v1/registrations
GET    /api/v1/registrations/details/all
GET    /api/v1/registrations/stats/per-event
GET    /api/v1/registrations/:id           захищено X-Demo-UserId
POST   /api/v1/registrations               захищено X-Demo-UserId
PUT    /api/v1/registrations/:id           захищено X-Demo-UserId
DELETE /api/v1/registrations/:id           захищено X-Demo-UserId
```

Користувач може створювати/читати/редагувати/видаляти тільки власні реєстрації. На фронтенді це передається як `X-Demo-UserId` вибраного користувача.

## Що зроблено для ЛР 05

### A. SQL Injection

- Раніше у навчальній версії SQL формувався рядковою підстановкою.
- Тепер усі значення користувача передаються параметрами SQLite через `?`.
- Для `ORDER BY` використано allowlist через `pickSort()`, бо назви колонок не можна передавати як SQL-параметри.

Приклад захищеного пошуку у коді:

```ts
where.push('(title LIKE ? OR description LIKE ?)');
params.push(`%${filters.q}%`, `%${filters.q}%`);
```

Перевірка:

```bash
curl "http://localhost:3000/api/v1/events?q=' OR '1'='1&sort=createdAt&order=DESC&limit=10"
```

Очікувано: введення обробляється як текст пошуку, а не як SQL-код.

### Б. XSS

- Рендеринг користувацьких даних на фронтенді виконано через DOM API і `textContent`.
- Дані з БД не вставляються в DOM як HTML.

Перевірка: створити оголошення з текстом на кшталт `<b>тест</b>`. Воно має показатися як текст, а не як HTML-розмітка.

### В. IDOR / Broken Access Control

- Додано демо-ідентифікацію через `X-Demo-UserId`.
- Якщо заголовка немає — `401 Unauthorized`.
- Якщо користувач не існує або id невалідний — `401 Unauthorized`.
- Для оголошень: читати деталі, змінювати й видаляти конкретне оголошення може тільки автор.
- Для реєстрацій: читати, змінювати й видаляти конкретну реєстрацію може тільки її користувач.

Перевірка чужого оголошення:

```bash
curl -X PUT http://localhost:3000/api/v1/events/1 \
  -H "Content-Type: application/json" \
  -H "X-Demo-UserId: 2" \
  -d "{\"description\":\"Спроба чужого редагування\"}"
```

Очікувано: `403 Forbidden`, якщо подія належить не користувачу 2.

### Г. Security Misconfiguration

Додано базові безпечні заголовки:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

CORS не використовує `*`, а дозволяє тільки локальні origin фронтенду:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:5500`
- `http://127.0.0.1:5500`

У production-режимі помилки не віддають внутрішні dev-деталі.

Перевірка заголовків:

```bash
curl -I http://localhost:3000/api/v1/health
```

## Формат помилки

Усі контрольовані помилки повертаються в одному форматі:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You can read, edit or delete only your own events",
    "statusCode": 403,
    "details": null
  }
}
```

## Тег для здачі

```bash
git tag -a 1.0.0 -m "Lab 05 security fixes"
git push origin 1.0.0
```
