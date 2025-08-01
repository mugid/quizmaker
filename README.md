# Quizzer

**Quizzer** — это веб-приложение для создания и прохождения интерактивных тестов с различными типами вопросов: множественный выбор, чекбоксы и короткий ответ. Пользователи могут создавать собственные тесты, проходить чужие, отслеживать прогресс и зарабатывать достижения.

## Функциональность MVP

- Создание тестов с тремя типами вопросов
- Назначение баллов и правильных ответов
- Прохождение тестов и мгновенная оценка
- Фильтрация по тегам, сортировка, поиск по названию, пагинация
- Рейтинг пользователей по сумме набранных баллов
- Профиль с графиком прогресса, анализом слабых тем и достижениями
- Генерация квизов с помощью ИИ

## Установка и запуск

1. Клонируйте репозиторий:

```bash
git clone https://github.com/yourusername/quizmaker.git
cd quizmaker
```

2. Установите зависимости:
```bash
pnpm install
```

3. Настройте .env файл

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
BETTERAUTH_SECRET=
NEXT_PUBLIC_AZURE_API_KEY=
```

4. Запустите локальный сервер
```bash
pnpm dev
```

## Проектирование и разработка
Проект был задуман как минимально жизнеспособный продукт (MVP). Сначала был реализован базовый интерфейс конструктора и прохождения тестов. Затем добавлены профили пользователей, рейтинг и простая аналитика.

База данных была спроектирована с учетом масштабируемости (отдельные таблицы для вопросов, вариантов ответов, результатов и т.д.).

Особое внимание уделялось UX и минимальному количеству кликов до прохождения теста.

## Уникальные подходы
Интеграция BetterAuth для безопасной и гибкой авторизации.

Использование Drizzle ORM с полной типизацией и миграциями.

Отслеживание слабых сторон пользователя на основе тегов и баллов.

Упор на простоту интерфейса и минимализм.

## Компромиссы
Анализ коротких ответов выполняется через полное совпадение (без NLP).

ИИ сгенерированые тесты сами выбирают уровень сложности и и количество вопросов, пользователь выбирает только тему

Лидерборд на данный момент, содержит моковые данные


## Проблемы
Присутсвует легаси код

Могут присутсвовать баги, в частности в фильтрации по тегам на главном экране и попытке заново пройти квиз.

## Почему такой стек?
Next.js — мощный фреймворк с поддержкой SSR и client-side интерактива.

Supabase — полноценный backend-as-a-service с Postgres, легкий сетап.

BetterAuth — простая и безопасная альтернатива NextAuth.

Drizzle ORM — типобезопасный SQL-код, понятный и масштабируемый.

pnpm — быстрый и надежный менеджер пакетов с поддержкой monorepo.

azure ai - бесплатная генерация на сумму %200 :/
