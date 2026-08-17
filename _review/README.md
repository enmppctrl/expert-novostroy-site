# Review registry

Файл `pages.json` хранит список страниц для GitHub review-dashboard.

## Формат записи

```json
{
  "title": "Контакты",
  "url": "/kontakty/",
  "file": "pages/kontakty/kontakty.html",
  "status": "ready_for_review",
  "updated": "2026-08-16"
}
```

`preview` можно указать явно, если ссылка отличается от пути `file`.

## Статусы

- `in_progress`
- `ready_for_review`
- `changes_requested`
- `approved`
- `published`

Codex должен обновлять этот файл при изменении review-статуса страницы.
