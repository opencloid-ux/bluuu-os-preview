# KOMMO CRM — Анализ переписки Bluuu Tours (Part 25–35)

> **Дата анализа:** 02.04.2025  
> **Источник:** CSV-файлы kommo-messages-part-25 … part-35  
> **Формат:** `"дата","отправитель","тип","текст"`  
> **Компания:** Day Trip Bali / Bluuu Tours (лодочные туры на Бали, Нуса Пенида)

---

## 1. Вывод Python-скрипта (сырые данные)

```
Found files:
  kommo-messages-part-25---94977223-31b7-42d8-865e-07aab7b683a5.csv
  kommo-messages-part-26---4dbc2883-631e-4217-ad5b-2c5bbe6ff3af.csv
  kommo-messages-part-27---751df345-7526-4cc9-a9ff-9c74f50160fc.csv
  kommo-messages-part-28---3d9b8baf-301d-4082-bf02-4771aa1c07f2.csv
  kommo-messages-part-29---75fd8f2b-bb2d-4e19-aeaf-61ba3d070dac.csv
  kommo-messages-part-3---f4685e3a-b329-4aa8-9a07-e23bb54f78c8.csv
  kommo-messages-part-30---d7c00df9-59ef-44e0-a4f3-825434c2330a.csv
  kommo-messages-part-31---ce704ca1-040a-4ab7-8653-7710fed633e2.csv
  kommo-messages-part-32---492457ce-e964-4296-83c5-fa97e60556e6.csv
  kommo-messages-part-33---4c11f045-8bf6-4f21-ac5e-f4c3c002a3aa.csv
  kommo-messages-part-34---acd75564-4a45-4860-891b-89bf5798ea14.csv
  kommo-messages-part-35---8d2eb300-c05a-4abb-b04b-b93670c2c284.csv

Total incoming: 187 602
Total outgoing: 271 577

By year:
  2018: 2
  2019: 62
  2020: 18
  2021: 114
  2022: 186 937
  2023: 231 863
  2025: 40 183

Top keywords in incoming messages:
  book:       9 372
  private:    7 174
  time:       5 275
  snorkel:    4 318
  price:      4 180
  hotel:      3 768
  transfer:   2 812
  available:  2 349
  lunch:      2 120
  how much:   2 046
  shared:     1 944
  photo:      1 725
  pickup:     1 619
  manta:      1 610
  cancel:     1 534
  weather:    1 209
  refund:       992
  deposit:      885
  child:        740
  discount:     511
  children:     454
  safe:         232
  baby:         119
  скидка:         4
  время:          3
  сколько:        2
```

---

## 2. Аналитические выводы

### 2.1 Объём переписки

Всего в анализируемых 12 файлах (part-25 … part-35) зафиксировано **459 179 сообщений**:
- Входящих (от клиентов): **187 602** (~41%)
- Исходящих (от команды / бота): **271 577** (~59%)

Соотношение 1:1.4 в пользу исходящих — типично для проактивного отдела продаж: менеджеры активно ведут клиентов, догоняют незакрытые сделки, шлют напоминания.

### 2.2 Временной охват

Подавляющее большинство сообщений приходится на **2022–2023 годы** (~91% совокупного трафика). Пик — 2023 (231 863 сообщений). В 2025 году уже 40 183 сообщения — судя по всему, это текущий активный период (файл part-3, судя по дате переписки март–апрель 2025). 2020–2021 почти пустые — скорее всего COVID-ограничения.

### 2.3 ТОП запросов клиентов

| Ранг | Ключевое слово | Кол-во | Интерпретация |
|------|---------------|--------|---------------|
| 1 | **book** | 9 372 | Намерение забронировать — самый частый запрос |
| 2 | **private** | 7 174 | Клиенты активно ищут приватные туры |
| 3 | **time** | 5 275 | Уточнение расписания, времени отправления |
| 4 | **snorkel** | 4 318 | Снорклинг — ключевая активность тура |
| 5 | **price** / **how much** | 4 180 + 2 046 = **6 226** | Цена — второй по важности фактор |
| 6 | **hotel** | 3 768 | Трансфер от/до отеля |
| 7 | **transfer** / **pickup** | 2 812 + 1 619 = **4 431** | Логистика добраться |
| 8 | **available** | 2 349 | Проверка дат |
| 9 | **lunch** | 2 120 | Включён ли обед |
| 10 | **shared** | 1 944 | Групповые vs приватные туры |
| 11 | **photo** | 1 725 | Фото/видео под водой — важная ценность |
| 12 | **manta** | 1 610 | Плавание с мантами — ключевой аттракцион |
| 13 | **cancel** | 1 534 | Отмены — значимая тема |
| 14 | **weather** | 1 209 | Погодный риск — частое беспокойство |
| 15 | **refund** | 992 | Возврат средств |
| 16 | **deposit** | 885 | Условия депозита |
| 17 | **child/children/baby** | 740 + 454 + 119 = **1 313** | Семьи с детьми — отдельный сегмент |
| 18 | **discount** | 511 | Скидки |
| 19 | **safe** | 232 | Безопасность (спрашивают редко, но это важный вопрос) |

### 2.4 Ключевые наблюдения

**1. Приватные туры доминируют над групповыми**  
Слово "private" встречается в 7 174 сообщениях против 1 944 "shared". Клиенты явно предпочитают эксклюзивность — это ценовой сигнал для позиционирования.

**2. Цена — вторая по важности тема**  
Суммарно запросы о цене (price + how much) = ~6 226. При этом отказы из-за цены есть, но немного — большинство принимает предложенные условия или торгуется. Рынок чувствителен к цене, но воспринимает премиальность.

**3. Мanta ray + snorkeling = core experience**  
Манты и снорклинг упоминаются суммарно ~6 000 раз — это фундаментальная ценность продукта, которую нужно продвигать в первую очередь.

**4. Трансфер — скрытая боль**  
Transfer + pickup = 4 431 упоминаний. Клиенты серьёзно озабочены логистикой "как добраться". Трансфер — существенный дополнительный доход и снятие возражений.

**5. Отмены и погода — управляемые риски**  
Cancel (1 534) + weather (1 209) + refund (992) = ~3 735 сообщений. Это ~2% от всего входящего трафика, но чувствительная тема. Компания имеет чёткую политику: отмена по погоде = полный рефанд или перенос; отмена по инициативе клиента менее чем за 24 ч = депозит не возвращается.

**6. Семьи с детьми — значимый сегмент**  
Слова child/children/baby = 1 313 вхождений. Родители спрашивают о безопасности, возрастных ограничениях, возможности взять ребёнка на колени. Отдельный онбординговый скрипт для семей был бы полезен.

**7. Фото/видео — важная добавленная стоимость**  
Photo = 1 725. Клиенты ценят GoPro-видео под водой. Жалобы на то, что фото не прислали — один из триггеров негативных отзывов.

**8. Переписка преимущественно на английском**  
Русских/индонезийских ключевых слов почти нет (скидка: 4, сколько: 2). Аудитория — международные туристы, преимущественно англоязычные.

---

## 3. Примеры типичных диалогов

### 3.1 Успешное бронирование

**Файл:** part-25, 08.07.2023  
**Сценарий:** Клиент уточняет детали тура накануне, подтверждает бронь.

```
[08.07.2023 15:45] КЛИЕНТ: And also just checking if our booking is confirmed for right 
  because I still haven't got the location?

[08.07.2023 15:46] Yudha (менеджер): Hey how are you it's Yudha, yes the tour is confirmed. 
  Let me share the meeting location :)

[08.07.2023 15:46] Yudha: For self drive please meet us at 7:30am at the Seagrass by the 
  Beach Cafe (Sanur). You can have a tasty breakfast there with ocean view (not included). 
  Please follow this link: https://goo.gl/maps/bt8...

[08.07.2023 15:50] Yudha: For the next few days we are still confirmed for the tour but we 
  are actively checking the conditions and will update if any changes.

[08.07.2023 15:51] Yudha: Your transfer has been confirmed! 
  Pick Up: Hilton Bali Resort in Nusa Dua
  Drop Off: Hilton Bali Resort in Nusa Dua

[08.07.2023 15:52] КЛИЕНТ: Great thank you for the information. We will not book a car but 
  we will meet you at the seagrass :) thanks

[08.07.2023 15:53] Yudha: Thank you for chatting with us today. Do feel free to reach out 
  to us if you have any further questions regarding our tour.
```

**Паттерн:** Клиент уже оплатил → менеджер проактивно подтверждает тур, делится локацией встречи, предлагает трансфер. Конверсия завершена, операционный онбординг выполнен.

---

### 3.2 Отказ из-за цены

**Файл:** part-28, 23.04.2023  
**Сценарий:** Клиент сравнивает цены и выбирает дешевле.

```
[23.04.2023 12:28] Mario: For those package tours will start from Bali and you need public 
  fast boat ticket to get there. Return ticket will be 400,000 IDR/person. May I know the 
  date so I can check our boat availabilities?

[23.04.2023 12:30] Mario: Thank you for patiently waiting, on 31st of July we have Riki J 
  Yacht and Dedean Boat available. Would you like to know more details about it?

[23.04.2023 12:31] Mario: [отправляет описание Riki J Yacht — 13-метровая яхта, 
  снорклинг 4 точки, гид, GoPro-фото, ланч...]

[23.04.2023 12:31] КЛИЕНТ: No need, you are too expensive. I have one for 1.2 juta.

[23.04.2023 12:32] Mario: [продолжает — отправляет описание Dedean Boat]

[23.04.2023 12:33] Mario: Which boat do you prefer? These 2 boats are best sellers this 
  month and all guests loved it!

[23.04.2023 12:34] КЛИЕНТ: No need you are too expensive, I have one for 1.2 juta.
  [повторяет отказ]
```

**Паттерн:** Клиент нашёл более дешёвый вариант (1,2 млн IDR vs ~9,5 млн IDR). Менеджер не снижает цену и не апеллирует к ценности — просто продолжает отправлять варианты. Сделка не закрыта. **Возможность улучшения:** контраргумент "что включено за эту цену vs что у конкурента".

---

### 3.3 Отмена тура

**Файл:** part-28, 23.04.2023  
**Сценарий:** Клиент хочет отменить тур за несколько часов из-за болезни.

```
[23.04.2023 17:55] КЛИЕНТ (Alex): Hello, would I be able to speak with someone

[23.04.2023 17:55] КЛИЕНТ: I would like to cancel my trip for tomorrow

[23.04.2023 17:56] Yudha: Hey Alex how are you, may we ask regarding the cancellation? 
  Please also note regarding our cancellation policy that was informed upon payment.

[23.04.2023 17:56] Yudha: 
  🔹 This experience requires good weather. If canceled due to poor weather, you'll be 
     offered a different date or a full refund.
  🔹 For a full refund, you must cancel at least 24 hours before the experience start time.
  🔹 If you cancel less than 24 hours before: deposit is non-refundable.

[23.04.2023 17:58] КЛИЕНТ: We are a bit under the weather and are probably heading to 
  the hospital.

[23.04.2023 17:59] КЛИЕНТ: Is there any cancellation fee instead?

[23.04.2023 17:59] Yudha: We do understand and hope you feel better. Please note that 
  since it is less than 24 hours, the deposit is not able to be refunded.

[23.04.2023 18:00] КЛИЕНТ: Okok then I will continue with the trip tomorrow.

[23.04.2023 18:00] КЛИЕНТ: I won't cancel then.

[23.04.2023 18:00] КЛИЕНТ: I will continue with the trip.

[23.04.2023 18:02] КЛИЕНТ: Ok sure, so we will continue with the plan tomorrow and with 
  2 jet skis instead.

[23.04.2023 18:02] Yudha: Okay sure, also just was about to message you — our supplier 
  will only be able to provide 2 jetskis for tomorrow instead of 3 since one is under 
  maintenance.
```

**Паттерн:** Клиент болен → хочет отменить → узнаёт про штраф (депозит невозвратен) → решает всё равно поехать. Политика отмены работает как удержание клиента. Этот случай также демонстрирует проактивную коммуникацию об изменениях со стороны компании.

---

### 3.4 Жалоба на качество тура

**Файл:** part-28, 21.04.2023  
**Клиент:** Gabby  
**Сценарий:** Клиент недоволен несоответствием обещаний и реальности.

```
[21.04.2023 15:25] КЛИЕНТ (Gabby): We paid all this money for an experience we didn't 
  even get. The boat we travelled in looked nothing like the boat in the pictures. 
  But I saw on other people's posts they got to travel in that boat. All the places 
  listed that we would get to see we didn't visit all of them. We only went to one of 
  them beaches on the list. We had 7 destinations and didn't visit all of them. 

[21.04.2023 15:23] КЛИЕНТ: Then I want a refund.

[21.04.2023 15:22] Hardi: We actually have different rates for 4 pax with other boats 
  we have on tour.

[21.04.2023 15:23] Hardi: With our regular private boat, it will starts from 9,500,000 
  IDR/boat. Please have a look at the option pricing details on our web.

[21.04.2023 15:25] Yudha: Hi Gabby, we do understand. We do hope you have a good rest 
  of your holiday and book with us on your next visit.

[21.04.2023 15:27] КЛИЕНТ: The fact that we were going to get them photos meant I wasn't 
  going to leave a bad review or ask for a partial refund, but since the photos are 
  included and for some reason only our photos haven't been uploaded — this is ridiculous.
```

**Паттерн:** Клиент жалуется на три вещи: (1) лодка не та, что на фото, (2) не все точки маршрута посетили, (3) GoPro-фото так и не прислали. Компания отделывается стандартным "мы понимаем" без конкретного решения. Отказ вернуть деньги не аргументирован. **Риск:** такая реакция прямой путь к негативному отзыву на TripAdvisor.

---

## 4. Системные наблюдения

### Боты и автоматизация
В поле "отправитель" часто стоит "Robot" — это чат-бот Nemo, который обрабатывает первичные обращения. Бот отвечает на FAQ, квалифицирует клиентов (сколько людей, какая дата, тип тура) и передаёт живым менеджерам (Yudha, Mario, Hardi, Dimas, Valiant и др.).

### Команда менеджеров
По частоте появления в исходящих: **Yudha** (самый активный), **Mario**, **Hardi**, **Dimas R**, **Valiant**. Yudha и Hardi — senior-менеджеры, часто разруливают сложные случаи.

### Мультиканальность
Источники входящих: WhatsApp (большинство), TripAdvisor (автоматические уведомления о новых бронях с фразой "we're excited that you booked..."), Instagram (часть сообщений помечена ограничениями Instagram — reels, galleries).

### Политика отмен (зафиксирована в шаблонах)
- Отмена по погоде → полный рефанд или перенос даты
- Отмена клиентом за 24+ ч → полный рефанд (в некоторых контекстах — 14 дней для определённых пакетов)
- Отмена менее чем за 24 ч → депозит не возвращается

### Проблемные паттерны, требующие внимания
1. **Массовая рассылка напоминаний** — одно и то же сообщение-напоминание дублируется 8–9 раз подряд одному клиенту (баг автоматизации).
2. **Жалобы на несоответствие лодки** — клиенты ожидают конкретную яхту с фото, получают другую. Прозрачность при бронировании нужна.
3. **Задержка с фото/видео** — частая претензия, хотя входит в стоимость.
4. **Слабая отработка возражений по цене** — менеджеры не объясняют разницу в ценности.

---

## 5. Сводная таблица по файлам

| Файл | Период (примерно) | Характер |
|------|------------------|---------|
| part-25 | Июль 2023 | Подтверждения туров, накануне-онбординг |
| part-26 | Июнь 2023 | Смешанные запросы, трансферы |
| part-27 | Май 2023 | Яхта Seven Heaven, luxury segment |
| part-28 | Апрель 2023 | Жалобы, отмены, крупные групповые брони |
| part-29 | Март 2023 | Групповые брони, семьи с детьми |
| part-3  | Март 2025 | Текущие продажи (2025) |
| part-30 | Февраль 2023 | Погодные вопросы, high season |
| part-31 | Декабрь 2022 | Новогодний сезон, депозиты |
| part-32 | Ноябрь 2022 | Продажи, ценовые запросы |
| part-33–35 | 2022 | Разные сделки, mixed |

---

*Анализ подготовлен на основе 12 CSV-файлов. Общий объём обработанных сообщений: 459 179.*
