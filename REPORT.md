# REPORT.md — ЛР 05 «Уразливості і захист»

## Короткий опис

Проєкт: дошка оголошень групи. Основні сутності: користувачі, оголошення, реєстрації на події. Поточна версія `1.0.0` реалізує 4 сценарії ЛР 05: SQLi, XSS, IDOR/Broken Access Control, Security Misconfiguration.

## Таблиця «ризик → наслідок → виправлення»

| Сценарій | Ризик | Наслідок | Виправлення |
|---|---|---|---|
| SQL Injection | Дані користувача можуть змінити SQL-запит | Некоректна вибірка, витік або зміна даних | Параметризовані запити `?`, allowlist для сортування |
| XSS | Текст користувача може стати HTML/JS | Зміна DOM, виконання небезпечного вмісту | DOM API + `textContent` замість небезпечного `innerHTML` |
| IDOR | Користувач підставляє чужий id | Читання/зміна/видалення чужого ресурсу | `X-Demo-UserId`, перевірка власника на бекенді |
| Misconfiguration | Зайві dev-деталі або слабкі headers/CORS | Розкриття внутрішніх деталей, ширший доступ | Єдиний формат помилок, security headers, CORS whitelist |

---

## Сценарій А — SQL Injection

### Було

Уразлива навчальна версія будувала SQL через конкатенацію рядка, наприклад для пошуку:

```ts
const sql = `SELECT * FROM events WHERE description LIKE '%${q}%'`;
```

Проблема: `q` ставав частиною SQL-коду.

### Відтворення

Проблемний ввід для локальної перевірки:

```text
' OR '1'='1
```

У небезпечній версії такий ввід міг змінювати логіку `WHERE`.

### Виправлення

У репозиторіях значення передаються параметрами:

```ts
where.push('(title LIKE ? OR description LIKE ?)');
params.push(`%${filters.q}%`, `%${filters.q}%`);
```

Для `ORDER BY` використано allowlist:

```ts
pickSort(filters.sort, ['id', 'title', 'category', 'createdAt']);
```

### Перевірка

```bash
curl "http://localhost:3000/api/v1/events?q=' OR '1'='1&sort=createdAt&order=DESC&limit=10"
```

Очікувано: ввід сприймається як текст пошуку, а не як SQL-код. Звичайний пошук теж працює.

---

## Сценарій Б — XSS

### Було

Якщо дані користувача рендерити через `innerHTML`, текст може бути інтерпретований браузером як HTML.

### Відтворення

У поле оголошення ввести:

```html
<b>перевірка</b>
```

У небезпечній версії браузер міг показати це як HTML-розмітку.

### Виправлення

У фронтенді `Frontend/src/main.ts` таблиці будуються через `createElement`, `appendChild`, `replaceChildren`, а значення користувача записуються через `textContent`.

### Перевірка

Той самий ввід `<b>перевірка</b>` після виправлення відображається як звичайний текст, без виконання або інтерпретації HTML.

---

## Сценарій В — Broken Access Control / IDOR

### Було

Кнопки могли бути сховані або заблоковані на фронтенді, але це не є захистом: користувач може відправити запит напряму через Postman/curl.

### Відтворення

Приклад спроби змінити чуже оголошення:

```bash
curl -X PUT http://localhost:3000/api/v1/events/1 \
  -H "Content-Type: application/json" \
  -H "X-Demo-UserId: 2" \
  -d "{\"description\":\"Спроба чужого редагування\"}"
```

Якщо подія `1` належить іншому автору, це IDOR-сценарій.

### Виправлення

Додано middleware `demoAuth`, яке читає `X-Demo-UserId`, перевіряє формат і наявність користувача. Для ресурсів із власником перевірка виконується на бекенді:

- `GET /api/v1/events/:id`
- `PUT /api/v1/events/:id`
- `DELETE /api/v1/events/:id`
- `GET /api/v1/registrations/:id`
- `PUT /api/v1/registrations/:id`
- `DELETE /api/v1/registrations/:id`

### Перевірка

- без заголовка `X-Demo-UserId` → `401 Unauthorized`;
- чужий ресурс → `403 Forbidden`;
- власний ресурс → успішна відповідь.

---

## Сценарій Г — Security Misconfiguration

### Було

Типові ризики: надто широке CORS, зайві dev-деталі в помилках, відсутність базових security headers.

### Виправлення

Додано headers:

```text
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

CORS дозволяє тільки локальні origin фронтенду, а не `*`.

Помилки мають єдиний формат `code/message/statusCode/details`, а в production внутрішні деталі не показуються.

### Перевірка

```bash
curl -I http://localhost:3000/api/v1/health
```

Очікувано: у відповіді присутні security headers.

---

## Регресійні перевірки

### SQLi

```bash
curl "http://localhost:3000/api/v1/events?q=' OR '1'='1&limit=5"
```

### IDOR без заголовка

```bash
curl http://localhost:3000/api/v1/events/1
```

Очікувано: `401`.

### IDOR чужий користувач

```bash
curl -X DELETE http://localhost:3000/api/v1/events/1 -H "X-Demo-UserId: 2"
```

Очікувано: `403`, якщо подія належить не користувачу 2.

### XSS

Створити оголошення з текстом `<b>перевірка</b>` і перевірити, що воно показується як текст.

### Headers

```bash
curl -I http://localhost:3000/api/v1/health
```
