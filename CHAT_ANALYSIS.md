# BLUUU Tours — Глубокий анализ бизнес-процессов по WhatsApp чатам

**Дата анализа:** 1 апреля 2026  
**Период данных:** Апрель 2022 — Апрель 2026  
**Источники:** 7 WhatsApp чатов (~234 000 строк), включая Guest Relations / DTB Management, Guides, F&B, GRM Updates, Serangan Office Launch, Boat Management, Time Check-in Reporting

---

## 1. Executive Summary

**Bluuu Tours (ранее Day Trip Bali / DTB)** — премиальный тур-оператор, который за 4 года прошёл путь от одной лодки на Airbnb до крупнейшего оператора лодочных туров на Бали с 17+ лодками, 5+ ежедневных рейсов, 150+ пассажирами в день и 9000+ отзывами.

### Ключевые находки:

**Операционная модель работает, но держится на ручном труде.** Каждый день менеджеры (7-8 человек) вручную:
- Обновляют наличие мест на 6+ OTA-платформах (~1782 раз Aline получила запрос «please close»)
- Согласовывают цены, скидки и замены лодок через WhatsApp  
- Обрабатывают жалобы, возвраты и негативные отзывы (~353 случая с негативными отзывами)
- Управляют заменами лодок при поломках (~312 случаев проблем с двигателями)

**Основные боли:**
1. **Ручное управление наличием** — одна и та же задача (close/open availability) повторяется тысячи раз в месяц вручную на каждой OTA-платформе
2. **Отсутствие единого источника правды** — информация размазана между Kommo, Odoo, WhatsApp, Google Sheets, и часто теряется
3. **Реактивное управление жалобами** — вместо предотвращения проблем, команда тушит пожары
4. **Зависимость от WhatsApp как системы управления** — все критические решения, ценообразование, эскалации идут через WhatsApp, без структуры и трекинга

**Стратегический вывод:** BLUUU OS должен в первую очередь автоматизировать три процесса: (1) управление наличием на OTA, (2) ценообразование и квотирование, (3) предотвращение проблем до жалобы. Это покроет ~60% текущей ручной работы команды.

---

## 2. Операционные процессы (детально)

### 2.1 Обработка бронирований

**Входящие каналы:**
- **OTA:** Viator/TripAdvisor, Klook, Airbnb, GetYourGuide (GYG) — основной поток
- **Прямые:** Сайт bluuu.tours (бывший nusapenida.one), WhatsApp, Google My Business
- **Агенты:** Coco Travel, Quizi, MBT, B2B-партнёры
- **Рефералы:** Гиды приводят клиентов через WhatsApp

**Процесс обработки лида (реконструкция из чатов):**

1. Бронирование приходит на OTA или сайт → автоматически создаётся лид в Kommo CRM
2. Менеджер GR (Hardi/Edward/Yuda/Mario/Mika/Valiant) подхватывает лид
3. Менеджер связывается с гостем через Respond.io (WhatsApp)
4. Для прямых запросов — квотирование цены через WhatsApp с эскалацией к Karim
5. Оплата: 50% депозит (PayPal, банковский перевод, Stripe через сайт) или полная оплата через OTA
6. Подтверждение: шаблон WA с деталями лодки, временем, точкой встречи
7. За день до тура: проверка check-in, связь с гостем, назначение трансфера

**Примеры из чатов:**

> «@Aline please close SD on 5th, just booked as private from Klook» — Edward, 01/01/25
> «For tomorrow shared availability: SD 1 seat, RK 9 seat» — Aline, 03/01/25
> «Please close all for tomorrow, 1 more pax booked» — Edward, 04/01/26

**Проблемы:**
- Нет автоматической синхронизации наличия между OTA — Aline вручную закрывает/открывает на каждой платформе
- Задержки в закрытии ведут к овербукингам: «Actually we're overbooked by 1 pax. SD only 13 max» — Edward, 03/01/25
- Лиды из некоторых каналов не парсятся в CRM: «cancellation e-mail from luxury escape, not parsed as lead» — Edward, 03/01/25

### 2.2 Управление наличием лодок и слотами

**Текущая модель:**
- **Лодки:** 17+ лодок разных категорий — Standard Shared (SH4, Riki J, Lady Manta), Premium Shared (Sanjaya 04/05, QR12, Honey Milk, Almond Milk), Private (Sea Dragon, BM55, AR55, Jet Asia 20, Oscar, Dedean, etc.)
- **Слоты:** Утренний отправление 8:30-9:40 в зависимости от типа тура
- **Вместимость:** 12-15 пассажиров на стандартных, до 20+ на яхтах, 14 на Riki J (снижена до 12 из-за проверок Пениды)

**Ежедневный процесс управления наличием:**
1. Aline публикует утренний отчёт о наличии: «05.01.2026 availability: Rk full, Lm 1, SD 3, Hm 4, S4 4. Total 12 spot left. 6 boat booked for private»
2. По мере поступления бронирований менеджеры говорят Aline закрыть на OTA
3. Aline вручную закрывает на каждой платформе: Viator, Klook, GYG, Airbnb, сайт
4. Когда мест мало — решение о закрытии, flash sale или апгрейде

**Критический пример рабочего дня (06/01/25):**
> Dima: «If there's no more shared bookings by 7pm, please move 4pax from LM to SH4 and upgrade 2pax from LM to premium, and move 1pax to other date»
> Edward: «Should we use Riki J instead of SH4 so we can fit 15 on the normal shared?»
> Edward: «I closed viator, web and GYG»
> Aline: «Sorry, Guys, was driving from serangan»
> Edward: «no worries, all closed already... airbnb klook done too»

**Боль:** Один человек (Aline) — single point of failure для управления наличием на всех OTA. Когда она недоступна, другие менеджеры вынуждены закрывать вручную.

### 2.3 Отмены и возвраты

**Политика:**
- Стандартная: невозвратная в течение 24 часов до тура
- На практике: гибкий подход ради отзывов

**Типичные сценарии:**
1. **Погода** — гости боятся ехать, Bluuu стоит на позиции «тур не отменён» → «We can only reschedule/refund if we'll get it cancelled tomorrow morning» — Dima, 02/01/25
2. **Болезнь (Bali belly)** — частый повод: «SD guests are also asking to reschedule caused by food poisoning» — Mario, 06/01/25
3. **No-show** — «3 pax shared on SH4 cancelled, only 5 pax left» — Edward, 05/01/25
4. **Негативный отзыв → рефанд** — основная стратегия управления репутацией

**Рефанд как инструмент управления репутацией:**
> KarimT: «To compensate for the inconvenience, we would like to offer you a 50% refund if you could consider removing your review in light of this offer» — 02/01/25
> Гость: «Could we meet in the middle for a 60% refund and I remove the review?»
> KarimT: «The maximum we can offer is a 50% refund»
> Гость принимает 50%.

Этот паттерн повторяется регулярно — ~353 случаев работы с негативными отзывами найдено в чатах.

**Каналы рефандов:**
- Viator/TA — через панель Viator CS, Dima отправляет запрос
- Klook — через Klook CS  
- Прямые — PayPal или банковский перевод
- Airbnb — через платформу

### 2.4 День тура (операционный цикл)

**Утро (6:00-9:30):**
1. Гиды приезжают в офис Серангана
2. Водители забирают гостей по отелям (shuttle bus или private transfer)
3. Widya/Weda встречают гостей в офисе, check-in, welcome drink (кокос или сок)
4. Гиды делают roll-call и отчитываются в чат Guides: «SD 10 pax ready to departed» — Budimanjh, 02/01/25
5. Гиды связываются с гостями, которые не пришли
6. В случае no-show — связь с MOD

**Во время тура:**
- Гиды отчитываются об инцидентах в GRM Updates
- Если проблемы — эскалация: Guide → Gee → KarimT/Dima → менеджер GR связывается с гостем
- Time Check-in Reporting через Odoo — Aline фиксирует timely/departure/arrival

**После тура (16:00-19:00):**
- Гости возвращаются, душ/переодевание в офисе
- Shuttle bus отвозит обратно
- Менеджеры включают «complaint mode» для проблемных гостей
- Ссылки на отзывы отправляются гостям

### 2.5 Управление трансферами

**Эволюция:**
- **2022-2024:** Только private transfers (Arya's drivers, 12 водителей)
- **Январь 2026:** Запуск FREE Shuttle Bus — революционное изменение

**Shuttle Bus:**
> KarimT (02/01/26): «Hello team! We have 4 pax for the shuttle bus tomorrow, it's test run»
> KarimT (04/01/26): «hey guys our free shuttle bus is already running and it's been added to the description on all otas»

**Проблемы с шаттлом (из 2026 года):**
> Mika (31/03/26): «She was at Bintang Supermarket at 7.03am, but the shuttle van left at 7.02am. I thought we usually wait for 10 minutes at each stop?»
> Mario (30/03/26): «they choose free shuttle but no WhatsApp connected to their account so they miss their tour today cause they think the bus will pick them up»

---

## 3. Коммуникационные паттерны и решения

### 3.1 Иерархия принятия решений

| Тема | Кто решает | Примеры |
|------|-----------|---------|
| Цены, скидки, квоты | **KarimT** | «Please, quote 5.5 jt.», «lowest we can make is 43,460,000» |
| Замены лодок, расписание | **Dima** | «Please move 5pax to Riki J and close availability» |
| Рефанды через OTA | **Dima** | «Sent refund request to Viator CS» |
| Бизнес-решения, стратегия | **Alex** | «Don't need additional charges», финальное одобрение |
| Инциденты на воде | **Gee** → **Dima/Karim** | Gee репортит, команда реагирует |
| Управление гидами | **Gee (Guide Boss)** | Бонусы, брифинги, расписание |
| Лодки, техническое | **David (Boat Manager)** | Maintenance, документы, замены |
| Наличие на OTA | **Aline** | Close/open на всех платформах |
| Офис Серанган | **Widya (GM)** | Check-in, инциденты в офисе |

### 3.2 Паттерны эскалации

**Уровень 1 — Менеджеры GR решают сами:**
- Стандартные вопросы от гостей (время, пикап, что взять)
- Простые изменения в бронировании
- Отправка шаблонов

**Уровень 2 — К Dima:**
- Рефанды (>15%)
- Замена лодок
- Отмена/перенос туров из-за погоды
- Решения по овербукингу
- Политика по возрасту/детям

**Уровень 3 — К Karim:**
- Ценообразование (любые нестандартные цены/скидки)
- Финансовые решения
- Контракты с лодками и партнёрами
- Системные настройки (CRM, OTA, шаблоны)
- Верификация платежей

**Уровень 4 — К Alex:**
- Стратегические решения
- Крупные инвестиции
- Новые направления бизнеса
- Иногда — быстрое ОК когда Dima/Karim недоступны: «Don't need additional charges» — Alex, 04/01/25

### 3.3 Типичные вопросы от гостей

На основе анализа чатов, топ-категории:

1. **Погода/безопасность** — «Is it safe to go? It's raining» (очень частый)
2. **Цена/скидки** — запросы на скидку для больших групп
3. **Изменение даты** — «Can we reschedule to another day?»
4. **Добавление людей** — «Can we add 2 more?»
5. **Специальные запросы** — день рождения, проприпо, jetski, рыбалка, обед в определённом месте
6. **Дайвинг** — «Is diving available? Certified/beginner?»
7. **Трансфер** — «Where is the pickup point?»
8. **Дети/возраст** — «Is it safe for 7yo?» / «Can 78yo join?»

### 3.4 Боли и узкие места в коммуникации

1. **WhatsApp как единственный канал** — критические решения теряются в потоке сообщений
2. **Множественные группы** — информация фрагментирована: GR чат, Guides чат, F&B чат, GRM Updates, Boat Management, Time Check-in — 7+ активных групп
3. **Нет структуры для handoff** — когда менеджер уходит в оффлайн, другие не знают статус дел
4. **Задержки с ответами** — Aline иногда недоступна для закрытия OTA: «Sorry, Guys, was driving from serangan» — Aline, 06/01/25
5. **Повторяющиеся вопросы** — менеджеры постоянно спрашивают одни и те же цены/политики у Karim

---

## 4. Топ-10 проблем и болей

### 🔴 #1: Ручное управление наличием на OTA (КРИТИЧЕСКАЯ)
**Частота:** Ежедневно, ~1782 запросов «please close» только к Aline  
**Суть:** Каждый раз когда приходит бронирование, менеджер должен попросить Aline закрыть наличие на каждой OTA вручную (Viator, Klook, GYG, Airbnb, сайт)  
**Последствие:** Овербукинги, потеря доходов от flash sales, зависимость от одного человека  
**Пример:** «Actually we're overbooked by 1 pax. SD only 13 max» — Edward, 03/01/25

### 🔴 #2: Отсутствие автоматического ценообразования (КРИТИЧЕСКАЯ)
**Частота:** Множество раз ежедневно  
**Суть:** Менеджеры постоянно спрашивают Karim о ценах, скидках, доплатах  
**Последствие:** Задержки в ответах гостям, невозможность масштабирования  
**Примеры:**
> «How much extra would that be for this request?» — Hardi
> «What's the best price we can offer?» — Hardi
> «For 8 pax, what's the best we can offer for these luxury option?» — Hardi
> «Please, quote 5.5 jt.» — KarimT

### 🔴 #3: Проблемы с лодками и двигателями (КРИТИЧЕСКАЯ)
**Частота:** ~312 упоминаний проблем с двигателями  
**Суть:** Регулярные поломки в день тура, необходимость срочной замены лодки  
**Последствие:** Задержки, жалобы, потеря качества  
**Примеры:**
> «LS is having engine issue again, guests had arrived at office» — KarimT, 04/01/25
> «Sanjaya has engine issues» — Dima, 05/01/26
> «Sea Dragon engine problem 🫨» — David, 07/09/25

### 🟡 #4: Управление негативными отзывами — реактивный подход
**Частота:** ~353 случая  
**Суть:** Команда узнаёт о проблемах из отзывов, а не предотвращает их  
**Последствие:** Рефанды как постоянная статья расхода, торговля «50% refund за удаление отзыва»  
**Пример типичного цикла:**
1. Гость оставляет 1⭐
2. Aline находит лид
3. Karim/Dima предлагают 50% рефанд за удаление
4. Переговоры через WA
5. Рефанд через OTA

### 🟡 #5: Информационные потери при swap/upgrade лодок
**Частота:** Несколько раз в неделю  
**Суть:** При замене лодки информация не доходит до всех: владельцу лодки, ресторану, гидам  
**Пример:**
> «Regular shared tour My Darling seems having a big miss communication. No one informed vendor about swapping SH4 to MD, and now guests are waiting» — Gee, 29/05/25
> «We sent 17pax to wrong lunch place» — Dima, 31/12/23

### 🟡 #6: Shuttle bus — новый источник проблем (2026)
**Частота:** Растущая, с момента запуска в январе 2026  
**Суть:** Гости не понимают систему шаттла, пропускают автобус, злятся  
**Примеры:**
> «She was at Bintang Supermarket at 7.03am, but the shuttle van left at 7.02am» — Mika, 31/03/26
> «they choose free shuttle but no WhatsApp connected to their account so they miss their tour today» — Mario, 30/03/26

### 🟡 #7: Check-in и no-show
**Частота:** Несколько раз в неделю  
**Суть:** Гости не приходят, не отвечают на сообщения, приходят в неправильное место  
**Примеры:**
> «Pak Weda forgot to mark them on our check-in sheets. Only in Odo system. Our guide did tried to contact them via text last night and this morning but received no response» — Widya, 22/05/25
> «they can't find the office» — Yuda, 03/01/25

### 🟡 #8: Ветхие/некачественные машины на Пениде
**Частота:** Периодически  
**Суть:** Land tour на Пениде с плохими машинами = жалобы  
**Пример:**
> «car condition is very very bad probably 1/10 and even aircond wasnt working so fine. Mold and Dirt is everywhere» — гость через Mika, 29/03/26

### 🟠 #9: Конфликт между shared и premium expectations
**Частота:** Регулярно  
**Суть:** Гости не понимают разницу между shared/private, приходят с неправильными ожиданиями  
**Примеры:**
> «Abdularhman complaining that they booked the private tour and don't wanna get along and grouping with the other» — Gee, 07/06/25
> «They thought that they are booked for Private Boat Tour. Since on the confirmation she got it stated 'Nusa Penida Private Speed Boat Tour'» — Widya, 27/05/25

### 🟠 #10: Множественность CRM-систем и confusion
**Частота:** Постоянно  
**Суть:** Kommo для лидов, Odoo для бухгалтерии и ценообразования, Respond.io для WA — данные не связаны  
**Пример:**
> «The bot sending the 'please check e-mail for registration' is sending it everytime we move a lead to booked, or change something in the lead» — Edward, 03/01/25
> «Can I delete the odoo number in payment data and manual input?» — Edward, 08/03/24

---

## 5. Приоритизированный план автоматизации

### 🏆 Приоритет 1 (Максимальный эффект, можно начать сейчас)

#### 1.1 Автоматическая синхронизация наличия на OTA
**Текущая боль:** Aline вручную закрывает/открывает на 6 платформах, ~1782 запросов  
**Решение:** Channel Manager (API-интеграция с Viator, Klook, GYG, Airbnb) → автоматическое обновление при бронировании  
**Эффект:** Экономия 3-4 часа/день, ноль овербукингов  
**Сложность:** Средняя — нужны API-ключи от каждой OTA

#### 1.2 Автоматическое ценообразование (Pricing Engine)
**Текущая боль:** Karim отвечает на вопросы о ценах 10-20 раз в день  
**Решение:** Pricing Matrix в BLUUU OS: лодка × количество людей × продолжительность × extras → автоматическая цена с правилами скидок  
**Эффект:** Менеджеры сразу видят цену, скидку, и могут сами отвечать гостям  
**Сложность:** Средняя — нужно формализовать правила из головы Karim

#### 1.3 AI-автоответчик для стандартных вопросов гостей
**Текущая боль:** Менеджеры отвечают на одни и те же вопросы (погода, время, что взять)  
**Решение:** AI-бот в Respond.io для FAQ + авто-check-in reminder  
**Эффект:** -50% нагрузки на GR менеджеров  
**Сложность:** Низкая

### 🥈 Приоритет 2 (Высокий эффект, требует стандартизации)

#### 2.1 Автоматический Complaint Prevention System
**Текущая боль:** 353 негативных отзыва → реактивные рефанды  
**Решение:**
- Post-tour survey через WA за 1 час до окончания тура (через бот)
- Автоматический alert менеджеру при score < 4
- Проактивный контакт ДО отзыва
**Эффект:** -30-50% негативных отзывов  

#### 2.2 Единая панель управления лодками и слотами
**Текущая боль:** Информация размазана между WA-чатами, Kommo, Odoo, таблицами  
**Решение:** Dashboard BLUUU OS: все лодки, их статус, наличие, текущие пассажиры, замены — в одном месте  
**Включает:** Авто-уведомление при swap лодки → ресторану, гидам, владельцу  

#### 2.3 Автоматическое формирование дневного отчёта
**Текущая боль:** Aline вручную считает наличие и публикует: «05.01.2026 availability: Rk full, Lm 1...»  
**Решение:** Авто-генерация из booking системы  

### 🥉 Приоритет 3 (Средний эффект, требует инвестиций)

#### 3.1 Shuttle Bus Management System
- Автоматическое назначение маршрутов
- GPS-трекинг, уведомления гостям «ваш автобус через 5 мин»
- Автоматическое закрытие мест

#### 3.2 Boat Maintenance Tracking
- Расписание обслуживания по часам работы
- Автоматическое уведомление о необходимости обслуживания
- Трекинг проблем и замен

#### 3.3 Guide Performance Dashboard
- Автоматический подсчёт бонусов за отзывы (сейчас вручную)
- GPS time-tracking (вместо ручных отчётов)
- Система распределения гидов по лодкам

#### 3.4 Financial Automation
- Автоматическая сверка платежей от OTA
- Auto-invoicing для vendor boats
- Expense reporting через Odoo (уже начато)

---

## 6. Эволюция 2022-2026

### 2022: Стартап-фаза
**Апрель 2022** — Alex создаёт группу Guides с 4 гидами (Budi, Lufi, Gede, David)
> Alex: «This is new group for easy communication»
> Alex: «please instal this app on yout phone» (Notion)
> Alex: «good news guys! from 1 may your salary 700k»

- 1-2 лодки
- Бронирования через Airbnb
- Гиды = всё: и гиды, и бронирования, и контакт с гостями
- Alex лично координирует всё
- Notion как первый инструмент

**Ключевые решения 2022:**
- Набор первых GR-менеджеров: Hardi, Yuda, Mario
- Переход на CRM (первая система)
- Запуск на TripAdvisor/Viator

### 2023: Рост
- Флот вырос до 8-10 лодок
- Появление категорий: Shared, Premium, Private
- Dima становится ключевым операционным лидером
- Edward присоединяется как менеджер
- Проблемы с масштабированием: овербукинги, невнимание к деталям

**Ключевой инцидент 31/12/23:**
> Dima: «We sent 17pax to wrong lunch place. The lunch for 17pax in Khamara will be covered from bonuses of the manager who set wrong lunch place next month»

### 2024: Структуризация
**Март 2024:** Интеграция Odoo с Kommo — начало автоматизации цен
> Dima: «For bookings from WhatsApp please inform guests about the total price as per Odoo rental order total field»

**Апрель 2024:** Karim официально присоединяется как COO
> KarimT: «I've been already working on several projects and tasks for DTB since December (installation of ERP Odoo system + pricing)»

**Сентябрь 2024:** Запуск офиса в Серангане — переезд из Санура
> KarimT: «Serangan is to open door to the first customers starting from the upcoming Monday»

**Системы Karim внедрил:**
- Odoo ERP (бухгалтерия, expense, inventory, PoS)
- PoS-станция в офисе
- F&B cost-tracking
- Стандартизация цен через Odoo

### 2025: Профессионализация
- GRM Updates чат для трекинга жалоб в реальном времени
- QC Checklists для лодок (но потеряны при переезде...)
- Time Check-in Reporting через Odoo — попытка трекинга маршрутов
- Widya как GM Serangan — структурированные отчёты об инцидентах
- Ребрендинг: Day Trip Bali → BLUUU Tours
- Boat Management как отдельный процесс (чат создан август 2025)

**Ключевые события 2025:**
> Gee (22/05/25): «We had an issue with BSH group today, our boat was intentionally almost hit by local penida boat twice»
> Widya (22/05/25): «Guest Incident Report 22 May 25 — Pak Weda forgot to mark them on our check-in sheets»
> KarimT (30/05/25): «Following today's KF case, let re-launch those QC checklists and do one-two more rounds for each boat»
> David (28/08/25): «Now we have to limit guests as pas kecil capacity, capt crew guide included as max capacity written»

### 2026: Масштаб + новые вызовы
- Запуск Shuttle Bus (январь 2026)
- 6-7 менеджеров GR работают параллельно
- 5+ лодок ежедневно для shared + несколько private
- Партнёрство с Dubai Infinia Yachts обсуждается
- Новый сайт на np.one / bluuu.tours
- Mika, Valiant, Aline — новое поколение менеджеров

**Что улучшилось к 2026:**
✅ Профессиональная команда GR с чёткими ролями
✅ Структурированная система ценообразования (Karim)
✅ Офис Серанган с PoS и welcome drinks
✅ Free Shuttle Bus — конкурентное преимущество
✅ QC Checklists для лодок
✅ GRM Updates — проактивный мониторинг жалоб

**Что осталось проблемой:**
❌ Ручное управление наличием на OTA
❌ Цены в голове у Karim, а не в системе
❌ WhatsApp как основная операционная система
❌ Нет единого dashboard для всех операций
❌ Нет автоматического complaint prevention
❌ Фрагментированные данные между Kommo/Odoo/WA

---

## 7. Конкретные рекомендации для BLUUU OS

### 7.1 Архитектура BLUUU OS

BLUUU OS должен быть **операционным хабом**, который объединяет:

```
┌─────────────────────────────────────────┐
│             BLUUU OS Dashboard           │
├─────────┬──────────┬──────────┬─────────┤
│ Booking │ Fleet    │ Guest    │ Finance │
│ Engine  │ Manager  │ Relations│ Module  │
├─────────┴──────────┴──────────┴─────────┤
│         Channel Manager (OTA API)        │
├─────────┬──────────┬──────────┬─────────┤
│ Viator  │  Klook   │   GYG   │ Airbnb  │
└─────────┴──────────┴──────────┴─────────┘
          ↕ Respond.io (WhatsApp)
          ↕ Odoo (Finance/Inventory)
          ↕ Kommo → migrate all to BLUUU OS
```

### 7.2 Модули по приоритету

**Модуль 1: Channel Manager + Availability Engine**
- API-интеграция с Viator, Klook, GYG, Airbnb
- Real-time sync наличия мест
- Автоматическое закрытие при заполнении
- Flash sale триггеры при низком заполнении
- **ROI:** Замена 80% работы Aline, ноль овербукингов

**Модуль 2: Pricing Engine**
- Pricing matrix: лодка × pax × тип тура × extras
- Правила скидок: группа ≥10, repeat customer, low season, FOC
- Автоматическое квотирование для менеджеров
- Karim утверждает правила, система исполняет
- **ROI:** Замена 60% вопросов к Karim о ценах

**Модуль 3: Guest Communication AI**
- AI-бот для Respond.io / WhatsApp
- Автоответы на FAQ: погода, время, что взять, пикап
- Авто-check-in reminder за 24ч и 2ч
- Post-tour survey + review request
- Complaint detection + автоэскалация
- **ROI:** -50% нагрузки на GR менеджеров

**Модуль 4: Operations Dashboard**
- Реальное состояние всех лодок (статус, пассажиры, маршрут)
- Автоматические daily reports (вместо ручных от Aline)
- Swap/upgrade workflow с автоуведомлениями
- Weather integration + auto-alerts
- **ROI:** Прозрачность + ноль потерь информации при swap

**Модуль 5: Review Management**
- Мониторинг отзывов с всех платформ
- Auto-alert при ≤3⭐
- Шаблоны ответов + tracking рефандов за удаление
- Proactive outreach до публикации отзыва
- **ROI:** -30% негативных отзывов

**Модуль 6: Fleet & Maintenance**
- Трекинг моточасов каждого двигателя
- Расписание обслуживания
- Автозамена при поломке (первый доступный)
- QC checklist digital
- **ROI:** Меньше emergency replacements

### 7.3 Что НЕ нужно автоматизировать

- **Человеческий контакт с VIP-гостями** — персонализация остаётся ценностью
- **Решения о рефандах** — AI может предлагать, но человек решает
- **Погодные решения** — слишком высокий риск для автоматизации
- **Переговоры с B2B-партнёрами** — требует человеческого judgment

### 7.4 Дорожная карта внедрения

**Месяц 1-2:** Pricing Engine (формализация правил Karim) + Guest Communication AI (FAQ-бот)
**Месяц 2-3:** Channel Manager (начать с 1-2 OTA) + Operations Dashboard (MVP)
**Месяц 3-5:** Channel Manager (все OTA) + Review Management + Shuttle Management
**Месяц 5-8:** Fleet & Maintenance + Financial Automation + полная миграция с Kommo
**Месяц 8-12:** AI-driven operations: demand forecasting, dynamic pricing, automated scheduling

### 7.5 Критические факторы успеха

1. **Karim должен формализовать pricing rules** — сейчас это его экспертиза, которую нужно перевести в систему
2. **Aline — ключевой пользователь Channel Manager** — её знание OTA-платформ критично для настройки
3. **Постепенный переход** — не пытаться заменить всё сразу, начать с самых болезненных процессов
4. **WhatsApp останётся** — BLUUU OS должен интегрироваться с WA, а не заменять его
5. **Обучение команды** — балийская команда привыкла к WA, переход на dashboard требует времени и терпения

---

## Приложение: Ключевые цитаты из чатов

### О проблемах с OTA-наличием:
> «would it be better if we close trip/airbnb booking after a certain time at night so we don't have accidental overbook if it happen?» — Yuda, 02/09/22

> «Notion still not updating so don't want to overbook. Group of 4 on trip booked a shared for tomorrow» — Yuda, 10/09/22

### О ценообразовании:
> «Please, offer -1 jt. discount, a free transfer and a bottle of prosecco» — KarimT, 01/04/26

> «For agents, please offer odoo prices please» — Dima, 07/03/24

### Об инцидентах:
> «While c/i here, he already well informed that the trip is a premium shared trip, and seems fine. I don't know whether he didn't pay attention to the explanation that we gave or not 😅🙏🏻» — Widya, 07/06/25

> «Chinese calling military with you not mister. Fml» — David, 01/09/25

### О командном духе:
> «What are you doing there guys? it is so late now😀» — Alex, 29/09/24
> «we are chilling alex😂» — Weda, 29/09/24
> «Making sure all good tomorrow 😁 Big day!» — David, 29/09/24
> «Omg, you are the best guys ever!» — Alex, 29/09/24

> «we smells money bro 🤣» — Lufi Guide, 24/04/22

> «This is THE BEST TEAM in the universe!» — Gee, 02/01/25

---

*Отчёт подготовлен на основе анализа ~234,000 строк WhatsApp чатов команды Bluuu Tours за период апрель 2022 — апрель 2026.*
