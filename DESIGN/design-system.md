# BLUUU OS DESIGN SYSTEM

Бренд: **Bluuu Tours** (Бали, премиальный ocean-бренд, современный, морская тематика)

---

## 1. 💎 Design Tokens (Переменные дизайна)

### Цветовая палитра

```css
:root {
  /* PRIMARY BRANDING */
  --color-primary: #14b8c8;      /* Sea Blue/Turquoise (главный) */
  --color-primary-variant: #117e9e; /* Глубокий океан */

  --color-secondary: #ffb35f;    /* Солнечный premium amber */

  /* BACKGROUND */
  --color-bg-light: #f9fbfd;     /* Светлый фон */
  --color-bg-dark:  #0e1823;     /* Тёмный, глубокий синий */

  /* SURFACE */
  --color-surface-light: #fff;   /* Карточки, панели (светлый) */
  --color-surface-dark: #17222b; /* Для dark mode */

  /* STATUS */
  --color-success: #20c997;      /* Зеленый GO */
  --color-warning: #f6c244;      /* Желтый WARNING */
  --color-danger:  #f2434a;      /* Красный NOGO */
  --color-info:    #3197e8;      /* Синий Info */

  /* TEXT */
  --color-text-primary-light: #19344d;   /* Основной текст */
  --color-text-secondary-light: #697d91; /* Второстепенный */
  --color-text-disabled-light: #b1bbc7;

  --color-text-primary-dark: #f3f7fa;
  --color-text-secondary-dark: #98a8b5;
  --color-text-disabled-dark: #3e556a;

  /* BORDERS */
  --color-border-light: #e2eaf2;
  --color-border-dark: #253041;

  /* HOVER/ACTIVE */
  --color-hover: #ecf6f9;
  --color-active: #c1e9f2;

  /* SHADOWS */
  --shadow-card: 0 4px 24px rgba(20, 184, 200, 0.07);

  /* BORDER RADIUS */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 32px;

  /* SPACING */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 16px;
  --spacing-4: 24px;
  --spacing-5: 32px;
  --spacing-6: 48px;
}
```

### Типографика

- **Google Fonts:** `Inter`, `Manrope`, `Roboto` (fallback: Arial, sans-serif)
- **Monospace для чисел/метрик:** `Roboto Mono`, `Menlo`, `monospace`

| Текст       | Размер | Вес    | Line-height |
| ----------- | ------ | ------ | ----------- |
| **H1**      | 36px   | 700    | 1.15        |
| **H2**      | 28px   | 600    | 1.18        |
| **H3**      | 22px   | 600    | 1.22        |
| **H4**      | 18px   | 600    | 1.26        |
| **Body**    | 16px   | 400/500| 1.55        |
| **Caption** | 13px   | 400    | 1.28        |
| **Monospace (for numbers)** | 16px | 500 | 1.48 |

```css
body {
  font-family: 'Inter', 'Manrope', 'Roboto', Arial, sans-serif;
  font-size: 16px;
  color: var(--color-text-primary-light);
}

.metric-number {
  font-family: 'Roboto Mono', Menlo, monospace;
  font-size: 36px;
  font-weight: 700;
}
```

### Spacing система

- **4px шаг**: все отступы и размеры — кратны 4px
- Пример: padding: 16px 24px; gap: 8px

### Border radius, shadows

- **Border radius:** 4/8/16/32px, по значимости компонента
- **Тени:** мягкие и прозрачные для premium feel

---

## 2. 📦 Библиотека компонентов

### Metric Card
- **Структура:**
  - Заголовок (H4)
  - Главное число (monospace, крупно)
  - Subtext (маленький, например, ― vs вчера / vs план)
  - Иконка тренда: ↑/↓ (цветится - зелёный, красный)
  - Варианты: normal / warning / danger / success

```css
.metric-card {
  background: var(--color-surface-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: var(--spacing-4);
}
.metric-card--success { border-left: 4px solid var(--color-success); }
.metric-card--warning { border-left: 4px solid var(--color-warning); }
.metric-card--danger  { border-left: 4px solid var(--color-danger);  }
```

---

### Status Badge
- Отображает текущее состояние (GO, WARNING, NOGO)
- Цвет: Success (зелёный), Warning (жёлтый), Danger (красный)
- Варианты размеров: small (20px), medium (28px), large (36px)

```css
.status-badge {
  border-radius: 32px;
  background: var(--color-success); /* или warning/danger */
  font-size: 13px;
  color: #fff;
  padding: 0 12px;
  height: 28px;
  display: inline-flex;
  align-items: center;
}
```

---

### Data Table
- Sticky Header
- Заголовки, строки, пагинация
- Цветовые строки (success/warning/danger)
- Row actions (иконки, выпадающее меню)
- Сортировка по колонкам

```css
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.data-table thead th {
  position: sticky;
  top: 0;
  background: var(--color-surface-light);
  z-index: 1;
}
.data-table tbody tr.success { background: #e5fbef; }
.data-table tbody tr.warning { background: #fff5e1; }
.data-table tbody tr.danger  { background: #fadbe3; }
```

---

### Alert Banner
- Критический (красный, полностью сверху), Warning (жёлтый), Info (синий)
- Слева иконка, основной текст, кнопка закрыть или действия справа

```css
.alert-banner {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-2);
  font-size: 16px;
}
.alert-banner--danger  { background: #fdebec; color: #cc1e2c; }
.alert-banner--warning { background: #fff3d5; color: #bc8800; }
.alert-banner--info    { background: #e7f2fb; color: #146fa3; }
```

---

### Navigation
- **Left sidebar:**
  - Роль пользователя (выделено), аватар, меню секций
  - Цветовая идентичность роли
- **Top bar:**
  - Уведомления (колокольчик), Language Switch EN/RU/ID, профиль/выход

---

### Chat Component (GR-дэшборд)
- Список чатов, каждый — имя гостя, topic, бейджик unread
- Окно переписки с аватаром, текстом, историей
- Быстрые чипсы-ответы

---

### Boat Card (дэшборд David)
- Фото лодки, название, статус-бейдж текущей готовности
- Прогресс-бар моточасов до ТО (цветной акцент — зелёный/жёлтый/красный)
- Коническая форма для background состояния лодки (optional, premium vibe)

---

### Availability Matrix (Aline Dashboard)
- Grid таблица: по X — даты, по Y — типы туров
- В ячейке — число (мест), background — градиент от success к danger в зависимости от наполненности

```css
.availability-cell--low { background: #e5fbef; color: var(--color-success); }
.availability-cell--med { background: #fff5e1; color: var(--color-warning); }
.availability-cell--high { background: #fadbe3; color: var(--color-danger); }
```

---

## 3. Роль-специфичная навигация (Sidebar)

**Alex (CEO):**
- Dashboard
- Все отчёты
- KPI/Revenue
- Boat Fleet
- Booking Matrix
- Guests
- Чат (для всех)
- Настройки

**Карим (OPS):**
- Dashboard
- Бронирования
- Статус лодок
- Смена/График
- Операционные Alert
- Guests
- Чат

**Дима (GR):**
- Dashboard
- Чаты гостей
- Задачи
- Guests/Поиск
- Статистика GR

**David (Fleet):**
- Dashboard
- Boat Fleet
- Контроль ТО
- Проблемы лодок (NOGO)
- Чат с OPS

**Geebran (Guides):**
- Dashboard
- Смена/Туры
- Guests
- Индивидуальные заметки
- Чат

**Widia (Лаунж):**
- Dashboard
- Гости на пирсе (Check-In)
- Quick Notes
- Status Badge

**GR Manager:**
- Dashboard
- Guests
- GR аналитика
- Менеджмент задач
- Чаты GR

---

## 4. 📱 Mobile-first правила

- Критичные дашборды для мобильного: Widia (Check-In), Guests, Boat Status, Чат
- **Data Table**: на мобайле разбить на карточки, упростить/сократить столбцы
- Navigation bottom bar вместо sidebar
- **Push-уведомления**:
  - Widia: новый check-in, критические алерты
  - Дима/GR: новые сообщения
  - Карим: NOGO лодка, тревоги
  - David: ТО, критические статусы

---

## 5. 🌘 Dark Mode, High Contrast

- В зависимости от темы, менять токены (см. переменные выше)
- High Contrast режим (яркое солнце) — для пирса Widia: использовать более темные типографику и максимально читаемый фон (например, жёлтый фон для alert)
- Dark Mode (ночная работа — David): глубокий blue/navy фон, светлый текст
- Проверять контрастность для WCAG AA

---

## 6. 🎨 Рекомендации для Ники (Дизайнер)

### Figma структура
- **Pages:** Foundations / Components / Dashboards / Flows / Assets
- **Components:** всё атомарно (Button, Card, Status Badge, Table, etc.)
- **Frames:** под все размеры: Desktop, Tablet, Mobile (adapts all key screens)
- Использовать Auto Layout, варианты компонентов

### Порядок работы
1. Формализуй дизайн-токены (цвета, типографика, spacing)
2. Собери атомарные компоненты
3. Вариативные states (active, disabled, etc.)
4. Собирать сложные компоненты (Card, DataTable, Navigation)
5. Сверстать реальные дашборды по ролям
6. Проверить адаптацию на мобайл/яркое солнце

### UX – внимание!
- Контрастность критична для пирса (Widia)
- Проверяй интерактивные элементы (размеры touch areas > 44px)
- Упор на скорость сценариев (минимум кликов в рабочих сценариях)
- Применять состояния loading, empty, error
- Минимизировать визуальный шум, убрать всё лишнее

---

# Примеры частых custom properties (вариант использования):

```css
.card {
  background: var(--color-surface-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: var(--spacing-4);
}
.alert {
  background: var(--color-danger);
  color: #fff;
  border-radius: var(--radius-sm);
}
```

---

**Документ составлен на основе задачи создания дизайн-системы для современной, премиальной и mobile-first операционной системы BLUUU OS для Bluuu Tours.**

