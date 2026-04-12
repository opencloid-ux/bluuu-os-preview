import { useState } from "react";

const PROCESSES = [
  {
    id: "new-lead",
    name: "1. Обработка нового лида",
    owner: "Менеджеры (Hardi, Edward, Yuda, Mario, Mika)",
    escalation: "Карим",
    frequency: "50-100/день",
    aiTarget: 95,
    trigger: "Новый лид в Kommo (из OTA, сайта, WhatsApp, email)",
    outcome: "Гость получил предложение и готов к бронированию",
    steps: [
      { step: "Лид поступает", actor: "Система", detail: "Kommo создаёт карточку автоматически. Источник: Viator, Klook, Airbnb, GYG, np.one, WhatsApp, email", decision: null },
      { step: "Квалификация лида", actor: "Менеджер", detail: "Проверить: дата, кол-во гостей, тип тура (shared/private/yacht), контакт рабочий", decision: {
        question: "Лид валидный?",
        yes: "Перейти к шагу 3",
        no: "Пометить Closed-Lost, причина: невалидный контакт / спам / дубль"
      }},
      { step: "Проверка дубликата", actor: "Менеджер", detail: "Поиск в Kommo по номеру телефона и email. Частая проблема: +62-0xxx (лишний 0 после кода страны)", decision: {
        question: "Дубликат найден?",
        yes: "Объединить карточки. Продолжить в существующей сделке",
        no: "Продолжить как новый лид"
      }},
      { step: "Первый контакт", actor: "Менеджер", detail: "WhatsApp в течение 15 мин. Использовать шаблон приветствия для платформы. Представиться по имени. Уточнить дату и предпочтения", decision: null },
      { step: "Подбор продукта", actor: "Менеджер", detail: "На основе размера группы, бюджета и дат предложить подходящий тур", decision: {
        question: "Группа 12+ человек?",
        yes: "Обязательно предложить Private или Yacht опцию",
        no: "Предложить Shared (standard или premium) или Private"
      }},
      { step: "Отправка предложения", actor: "Менеджер", detail: "Отправить: описание тура, цену, что включено, фото/видео, ссылку на оплату", decision: null },
      { step: "Follow-up", actor: "Бот / Менеджер", detail: "Если нет ответа через 48ч → автоматическое напоминание. Через 5 дней → второе. Через 10 дней → Closed-Lost", decision: null },
    ],
    rules: [
      "Время ответа: макс 15 минут в рабочие часы, 1 час вне",
      "Шаблоны приветствия: отдельные для каждой платформы (Viator, Airbnb, direct)",
      "Никогда не давать скидки на первом контакте",
      "Группы 12+ → всегда предлагать upgrade до Private/Yacht",
      "Индийские группы → требовать полную предоплату",
    ],
    metrics: ["Время первого ответа (target: <15 мин)", "Conversion rate лид→бронирование", "% потерянных лидов по причинам"],
  },
  {
    id: "booking",
    name: "2. Бронирование и подтверждение",
    owner: "Менеджеры",
    escalation: "Дима → Карим (спецзапросы)",
    frequency: "30-60/день",
    aiTarget: 90,
    trigger: "Гость согласен бронировать",
    outcome: "Бронирование создано, оплата получена, гость подтверждён",
    steps: [
      { step: "Проверка доступности", actor: "Менеджер / Aline", detail: "Проверить наличие лодок на дату. Shared: смотреть загрузку (макс 13 pax). Private: целая лодка свободна", decision: {
        question: "Есть свободная лодка?",
        yes: "Продолжить бронирование",
        no: "Предложить альтернативную дату или waitlist"
      }},
      { step: "Создание бронирования", actor: "Менеджер", detail: "Kommo: перевести в статус Booked. Заполнить: имена гостей, контакт, дата, тип тура, доп.услуги (фотограф, DJ, торт, extended hours)", decision: null },
      { step: "Формирование цены", actor: "Менеджер", detail: "Стандартные цены из прайс-листа NP.ONE_Price_Tiers", decision: {
        question: "Цена стандартная?",
        yes: "Применить из прайса",
        no: "ЭСКАЛАЦИЯ → Карим. Причины: большая группа, спецзапрос, корпоративное, повторный клиент"
      }},
      { step: "Отправка инвойса", actor: "Менеджер", detail: "Отправить платёжную ссылку (Xendit). Shared → полная оплата. Private → депозит $100 или полная сумма", decision: null },
      { step: "Получение оплаты", actor: "Система", detail: "Xendit уведомляет об оплате. Если EDC → ручная проверка", decision: {
        question: "Оплата получена?",
        yes: "Перевести статус → Invoice Paid. Отправить подтверждение",
        no: "Follow-up через 24ч. Если нет оплаты 72ч → предупреждение об отмене"
      }},
      { step: "Подтверждение бронирования", actor: "Менеджер", detail: "Отправить гостю: подтверждение с деталями, время пикапа (если трансфер), место встречи (Серанган), что взять с собой", decision: null },
      { step: "Добавление доп.услуг", actor: "Менеджер", detail: "Фотограф (Agus/Bhaga), дрон, торт, DJ, extended hours, jet ski — координация с соответствующими подрядчиками", decision: {
        question: "Есть доп.услуги?",
        yes: "Уведомить подрядчика, добавить в манифест, пересчитать сумму",
        no: "Завершить бронирование"
      }},
    ],
    rules: [
      "Shared tours: полная оплата при бронировании",
      "Private tours: минимум депозит $100",
      "Никаких скидок в праздничные дни (жёсткая политика)",
      "Комиссия агентам: стандарт 20%, Klook 25%",
      "Бонус менеджеру: 50K IDR за каждое shared booking",
      "Дети на shared турах: запрещены на Viator (приводит к жалобам)",
      "Максимум 14 pax на premium shared, 13 на standard",
    ],
    metrics: ["Conversion rate предложение→оплата", "Среднее время от согласия до оплаты", "% бронирований с доп.услугами (upsell rate)"],
  },
  {
    id: "ota-slots",
    name: "3. Управление OTA-слотами",
    owner: "Aline",
    escalation: "Дима",
    frequency: "Несколько раз/день",
    aiTarget: 95,
    trigger: "Изменение загрузки лодок / ТО / погода",
    outcome: "Все платформы отражают актуальную доступность",
    steps: [
      { step: "Мониторинг загрузки", actor: "Aline", detail: "Проверить текущую загрузку лодок на ближайшие 7 дней по данным из Kommo", decision: null },
      { step: "Решение по слотам", actor: "Aline", detail: "Определить, сколько мест открыть/закрыть на каждой платформе", decision: {
        question: "Лодки загружены >80%?",
        yes: "Закрыть shared слоты на OTA. Оставить только private",
        no: "Открыть дополнительные слоты, приоритет: Viator > Klook > Airbnb > GYG"
      }},
      { step: "Обновление платформ", actor: "Aline", detail: "Вручную обновить availability на каждой платформе (Viator, Klook, Airbnb, GYG, np.one)", decision: null },
      { step: "Блокировка при ТО/погоде", actor: "Aline / David", detail: "Лодка на ТО или закрытие по погоде → закрыть все слоты на эту дату", decision: {
        question: "Полная отмена дня?",
        yes: "Закрыть ВСЕ слоты. Уведомить менеджеров для контакта с забронированными гостями",
        no: "Скорректировать количество доступных мест"
      }},
    ],
    rules: [
      "НИКОГДА не допускать overbooking — лучше закрыть раньше",
      "Приоритет платформ по марже: np.one (0%) > Direct (0%) > Airbnb > GYG > Viator (20%) > Klook (25%)",
      "При погодной отмене — закрыть в течение 30 мин",
      "Flash-sales: открывать доп.слоты по решению Карима в низкий сезон",
    ],
    metrics: ["% загрузки по платформам", "Случаи overbooking (target: 0)", "Упущенные бронирования (закрыто рано)"],
  },
  {
    id: "pretour",
    name: "4. Pre-tour коммуникация",
    owner: "Менеджеры",
    escalation: "Дима",
    frequency: "30-60/день",
    aiTarget: 85,
    trigger: "T-24 часа до тура",
    outcome: "Гость знает всё: время, место, что взять, водитель назначен",
    steps: [
      { step: "Напоминание T-24ч", actor: "Бот / Менеджер", detail: "Отправить: подтверждение даты, время пикапа, место встречи (Серанган), ссылку на Google Maps, что взять (купальник, полотенце, солнцезащитный)", decision: null },
      { step: "Подтверждение от гостя", actor: "Менеджер", detail: "Дождаться ответа. Если нет ответа → звонок", decision: {
        question: "Гость подтвердил?",
        yes: "Добавить в финальный манифест",
        no: "Звонок. Если недоступен → пометить как риск no-show"
      }},
      { step: "Назначение трансфера", actor: "Менеджер / David", detail: "Если трансфер включён: рассчитать время пикапа (обратно от 7:30 прибытия), назначить водителя", decision: {
        question: "Трансфер нужен?",
        yes: "Назначить водителя. Отправить гостю: имя водителя, номер телефона, время пикапа",
        no: "Отправить self-drive инструкции до Серангана"
      }},
      { step: "Утреннее подтверждение", actor: "Водитель", detail: "Водитель звонит гостю в 6:00-6:30 утра. Подтверждает пикап", decision: null },
      { step: "Передача в Operations", actor: "Менеджер", detail: "Финальный список гостей передаётся Widya (лаунж) и Gee (гиды) к 18:00 предыдущего дня", decision: null },
    ],
    rules: [
      "Место встречи: СЕРАНГАН (НЕ Sanur Bay — частая ошибка гостей)",
      "Google Maps ссылку отправлять ОБЯЗАТЕЛЬНО каждому",
      "Трансфер рассчитывать от отеля до Серанган + 30 мин запаса",
      "Стандартный трансфер: 200K IDR (до 6 pax). Дальние (Canggu, Ubud): 300-600K IDR",
      "Финальный манифест — крайний срок 18:00 накануне",
      "Дети до определённого возраста — только на private (не shared)",
    ],
    metrics: ["% гостей подтвердивших T-24", "% no-shows", "Задержки пикапов"],
  },
  {
    id: "cancellations",
    name: "5. Отмены и возвраты",
    owner: "Менеджеры → Карим",
    escalation: "ВСЕ кейсы → Карим (сейчас). Цель: 80% решать по decision tree",
    frequency: "5-15/день",
    aiTarget: 90,
    trigger: "Гость запрашивает отмену / reschedule / refund",
    outcome: "Кейс закрыт: перенос, возврат или отказ — с сохранением отношений",
    steps: [
      { step: "Запрос от гостя", actor: "Менеджер", detail: "Зафиксировать: причина отмены, дата тура, сумма оплаты, канал бронирования", decision: null },
      { step: "Классификация причины", actor: "Менеджер", detail: "Определить тип отмены", decision: {
        question: "Причина отмены?",
        yes: "ПОГОДА (наша отмена) → Шаг 3A\nБОЛЕЗНЬ (Bali belly и т.д.) → Шаг 3B\nПЛАНЫ ИЗМЕНИЛИСЬ → Шаг 3C\nНЕДОВОЛЬСТВО СЕРВИСОМ → Шаг 3D",
        no: null
      }},
      { step: "3A: Погодная отмена", actor: "Менеджер", detail: "Компания отменяет тур из-за погоды", decision: {
        question: "Гость может перенести?",
        yes: "Бесплатный перенос на любую доступную дату. Приоритет при размещении",
        no: "Полный возврат 100%. Обработать через Xendit в течение 3-5 рабочих дней"
      }},
      { step: "3B: Болезнь гостя", actor: "Менеджер", detail: "Гость заболел (частая причина — Bali belly)", decision: {
        question: "Есть мед.справка + >24ч до тура?",
        yes: "Бесплатный перенос. Если невозможно — возврат 100%",
        no: "Предложить перенос. Если отказ — возврат 50% (депозит удерживается)"
      }},
      { step: "3C: Планы изменились", actor: "Менеджер", detail: "Гость передумал / уезжает раньше / другие планы", decision: {
        question: "За сколько дней до тура?",
        yes: ">14 дней → полный возврат\n7-14 дней → возврат 50%\n<7 дней → без возврата (предложить перенос)\n<24ч → без возврата, без переноса",
        no: null
      }},
      { step: "3D: Недовольство сервисом", actor: "Дима → Карим", detail: "ВСЕГДА ЭСКАЛАЦИЯ. Связаться с гостём, выслушать, предложить компенсацию", decision: {
        question: "Уровень проблемы?",
        yes: "Мелкая (еда, задержка) → скидка 15-20% на следующий тур\nСерьёзная (инцидент, поломка) → возврат 30% + скидка 50% на следующий\nКритическая (травма, безопасность) → полный возврат + страховой кейс",
        no: null
      }},
      { step: "Обработка возврата", actor: "Shenny / Менеджер", detail: "Оформить возврат через Xendit. Если OTA — через платформу. Обновить статус в Kommo → Cancelled", decision: null },
      { step: "Post-cancel follow-up", actor: "Менеджер", detail: "Через 24ч: отправить сообщение с сожалением и предложением вернуться. Скидка 10% на будущее бронирование", decision: null },
    ],
    rules: [
      "DECISION TREE ВЫШЕ ПОКРЫВАЕТ 80% КЕЙСОВ — менеджер решает сам",
      "Эскалация к Кариму ТОЛЬКО: недовольство сервисом, сумма >$500, VIP/корпоратив, угроза отзывом",
      "Погодные отмены = ВСЕГДА полный возврат или бесплатный перенос",
      "Политика 14 дней — жёсткая, не обсуждается",
      "Никогда не спорить с гостем. Предложить варианты, не говорить 'нет'",
      "Каждая отмена → запись причины в Kommo для аналитики",
    ],
    metrics: ["% отмен от общего числа бронирований", "Среднее время обработки отмены", "% кейсов решённых без эскалации (target: 80%)"],
  },
  {
    id: "pricing",
    name: "6. Ценообразование и скидки",
    owner: "Менеджеры → Карим",
    escalation: "Карим (все нестандартные цены)",
    frequency: "10-20/день",
    aiTarget: 80,
    trigger: "Гость просит скидку / нестандартная группа / спецзапрос",
    outcome: "Цена согласована, гость получил предложение",
    steps: [
      { step: "Запрос на скидку", actor: "Менеджер", detail: "Гость просит скидку или цена не покрывается прайсом", decision: {
        question: "Цена есть в прайс-листе?",
        yes: "Применить стандартную цену. Скидки НЕ давать",
        no: "Перейти к шагу 2"
      }},
      { step: "Проверка по правилам", actor: "Менеджер", detail: "Менеджер может сам решить в рамках правил", decision: {
        question: "Кейс подходит под правила?",
        yes: "Повторный клиент → скидка 10%\nГруппа 20+ → скидка по таблице\nНизкий сезон flash-sale → цены из таблицы Карима\nАгент → комиссия 20%",
        no: "ЭСКАЛАЦИЯ → Карим с деталями: кто, сколько человек, дата, запрошенная цена, обоснование"
      }},
      { step: "Решение Карима", actor: "Карим", detail: "Ответ в течение 1 часа. Менеджер передаёт гостю", decision: null },
    ],
    rules: [
      "НИКАКИХ скидок без основания — это не базар",
      "Праздничные дни: цена фиксированная, не обсуждается",
      "Первый контакт: никогда не предлагать скидку первым",
      "Менеджер может сам: стандартная цена, повторный клиент -10%, агентская комиссия",
      "Менеджер НЕ может сам: индивидуальные скидки, корпоративные тарифы, бартер",
    ],
    metrics: ["Средний размер скидки", "% бронирований со скидкой", "% решений без эскалации (target: 70%)"],
  },
  {
    id: "reviews",
    name: "7. Управление отзывами",
    owner: "Aline + Менеджеры",
    escalation: "Дима → Карим (критика)",
    frequency: "840+ отзывов/мес (пик)",
    aiTarget: 85,
    trigger: "Новый отзыв на любой платформе",
    outcome: "Отзыв обработан: ответ опубликован, Guide Race обновлён, негатив отработан",
    steps: [
      { step: "Сбор отзывов", actor: "Система (будущее: AI)", detail: "Мониторинг: TripAdvisor, Viator, Klook, GYG, Airbnb, Google Maps. Сейчас: ручной мониторинг Aline", decision: null },
      { step: "Классификация", actor: "Менеджер / AI", detail: "Определить: рейтинг, имя гида (если есть), ключевые темы, sentiment", decision: {
        question: "Рейтинг?",
        yes: "5★ → шаг 3A (благодарность)\n4★ → шаг 3A (благодарность + анализ)\n3★ → шаг 3B (отработка)\n1-2★ → шаг 3C (критический)",
        no: null
      }},
      { step: "3A: Позитивный (4-5★)", actor: "Менеджер / AI", detail: "Опубликовать благодарственный ответ. Начислить очки Guide Race гиду. Если развёрнутый комплимент → +5 bonus pts", decision: null },
      { step: "3B: Средний (3★)", actor: "Дима", detail: "Связаться с гостём в течение 24ч. Выяснить что не так. Предложить компенсацию (скидка 15-20% на следующий тур)", decision: null },
      { step: "3C: Критический (1-2★)", actor: "Дима → Карим", detail: "МОМЕНТАЛЬНЫЙ алерт Gee (Guide Boss). Связаться с гостём в течение 4ч. Предложить компенсацию (возврат 30% + скидка 50%). Подать заявку на удаление отзыва если нарушает правила платформы", decision: null },
      { step: "Обновление Guide Race", actor: "Система / Aline", detail: "5★ с именем → +10 pts. 4★ с именем → +5 pts. <2★ → -15 pts. Если нет имени → привязка по дате из манифеста", decision: null },
      { step: "Еженедельный дайджест", actor: "Aline", detail: "Сводка: общее кол-во, средний рейтинг, топ-гиды, проблемные паттерны, сравнение с прошлой неделей", decision: null },
    ],
    rules: [
      "Ответ на ВСЕ отзывы в течение 48ч",
      "Негатив ниже 3★ → контакт с гостём в течение 4ч",
      "Airbnb: удаление через поддержку +622150940269",
      "Никогда не спорить в публичном ответе",
      "Guide Race очки начисляются ТОЛЬКО за отзывы с привязкой к гиду",
      "Гид с негативным отзывом → 3 дня только в паре (мягкое правило AI-расписания)",
    ],
    metrics: ["Средний рейтинг по платформам (target: 4.9)", "Время ответа на негатив", "% удалённых негативных отзывов", "Кол-во 5★ в месяц"],
  },
  {
    id: "posttour",
    name: "8. Post-tour follow-up",
    owner: "Менеджеры + Гиды",
    escalation: "Gee (задержка видео)",
    frequency: "30-60/день",
    aiTarget: 90,
    trigger: "Тур завершён, гости вернулись",
    outcome: "Гость получил видео, оставил отзыв, предложен повторный тур",
    steps: [
      { step: "Сбор GoPro видео", actor: "Гиды", detail: "В день тура: загрузить видео на Google Drive в папку формата ГГГГ-ММ-ДД_ИмяГида", decision: null },
      { step: "Обработка видео", actor: "Контент-менеджер", detail: "Проверить качество, разделить по гостям если нужно", decision: null },
      { step: "Отправка видео гостю", actor: "Менеджер / Бот", detail: "T+2 дня: отправить ссылку на Google Drive через WhatsApp", decision: {
        question: "Видео готово в срок?",
        yes: "Отправить ссылку + благодарность за тур",
        no: "Уведомить гостя о задержке. Эскалация → Gee"
      }},
      { step: "Запрос отзыва", actor: "Бот / Менеджер", detail: "T+3 дня: отправить ссылку на отзыв. Платформа зависит от источника бронирования", decision: {
        question: "Какая платформа?",
        yes: "Viator guest → ссылка на Viator\nKlook → Klook\nDirect → TripAdvisor или Google Maps\nAirbnb → Airbnb (автоматически)",
        no: null
      }},
      { step: "Upsell / повторное бронирование", actor: "Бот / Менеджер", detail: "T+5 дней: предложить другой тур (если был shared → предложить private/yacht). Скидка 10% для повторных", decision: null },
    ],
    rules: [
      "GoPro видео: КРАЙНИЙ СРОК загрузки — день тура",
      "Отправка гостю: макс T+3 дня",
      "Если гид не загрузил видео → штраф из Guide Race",
      "Запрос отзыва: отправлять на правильную платформу (не все на TripAdvisor)",
      "Потеря данных на Google Drive → НЕМЕДЛЕННАЯ эскалация",
      "Email для видео: daytripbaligopro@gmail.com",
    ],
    metrics: ["Среднее время доставки видео", "% гостей оставивших отзыв", "Repeat booking rate"],
  },
  {
    id: "transfers",
    name: "9. Координация трансферов",
    owner: "Менеджеры + David",
    escalation: "Дима",
    frequency: "20-40/день",
    aiTarget: 85,
    trigger: "Гость с трансфером забронирован на завтра",
    outcome: "Водитель назначен, время согласовано, гость подобран вовремя",
    steps: [
      { step: "Расчёт времени пикапа", actor: "Менеджер", detail: "Время прибытия в Серанган: 7:30. Рассчитать время в пути от отеля + 30 мин запас", decision: {
        question: "Зона отеля?",
        yes: "Seminyak/Kuta/Legian → пикап 6:00-6:15\nSanur → пикап 6:45-7:00\nCanggu → пикап 5:30-5:45\nUbud → пикап 5:00-5:15\nNusa Dua/Jimbaran → пикап 6:30-6:45",
        no: null
      }},
      { step: "Назначение водителя", actor: "Менеджер / David", detail: "Выбрать водителя по зоне и доступности. Оптимизировать маршрут если несколько пикапов", decision: null },
      { step: "Уведомление гостя", actor: "Менеджер", detail: "Отправить гостю: имя водителя, номер телефона, точное время пикапа, как узнать машину", decision: null },
      { step: "Уведомление водителя", actor: "Менеджер", detail: "Отправить водителю: имя гостя, отель, номер комнаты, телефон, время пикапа, кол-во человек", decision: null },
      { step: "Утренний контроль", actor: "Водитель", detail: "Водитель звонит гостю в 6:00-6:30. Подтверждает что выехал / на месте", decision: {
        question: "Гость на месте?",
        yes: "Забрать и ехать в Серанган",
        no: "Позвонить повторно. Если нет ответа 15 мин → уведомить менеджера"
      }},
    ],
    rules: [
      "МЕСТО ВСТРЕЧИ = СЕРАНГАН. НЕ Sanur Bay (частая ошибка!)",
      "Стандартный трансфер: 200K IDR на машину (до 6 pax)",
      "Дальние зоны: Canggu 300K, Ubud 400K, Amed 600K",
      "Grab/Gojek ЗАПРЕЩЕНЫ для гостей — вызывает конфликты с местными водителями",
      "Максимум гостей в машину: 6 человек",
      "Водитель должен быть в фирменной одежде Bluuu",
    ],
    metrics: ["% пикапов вовремя (target: 95%)", "Жалобы на трансфер", "Средняя загрузка машин"],
  },
];

function StepFlow({ steps }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 12 }}>
      {steps.map((s, i) => (
        <div key={i}>
          <div style={{
            display: "flex",
            gap: 12,
            padding: "10px 14px",
            background: i % 2 === 0 ? "#F9FAFB" : "#fff",
            borderRadius: 6,
            alignItems: "flex-start"
          }}>
            <div style={{
              minWidth: 28, height: 28, borderRadius: "50%",
              background: s.decision ? "#EEF2FF" : "#F3F4F6",
              border: s.decision ? "2px solid #818CF8" : "2px solid #D1D5DB",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
              color: s.decision ? "#4338CA" : "#6B7280",
              flexShrink: 0
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{s.step}</span>
                <span style={{
                  background: "#E5E7EB", color: "#374151",
                  padding: "1px 8px", borderRadius: 10, fontSize: 11
                }}>{s.actor}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#4B5563", lineHeight: 1.5 }}>{s.detail}</p>
              {s.decision && (
                <div style={{
                  marginTop: 8, background: "#EEF2FF", borderRadius: 6,
                  padding: "8px 12px", border: "1px solid #C7D2FE"
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#4338CA", marginBottom: 4 }}>
                    {s.decision.question}
                  </div>
                  {s.decision.yes && (
                    <div style={{ fontSize: 12, color: "#065F46", marginBottom: 2 }}>
                      <span style={{ fontWeight: 600 }}>→ </span>
                      <span style={{ whiteSpace: "pre-line" }}>{s.decision.yes}</span>
                    </div>
                  )}
                  {s.decision.no && (
                    <div style={{ fontSize: 12, color: "#991B1B" }}>
                      <span style={{ fontWeight: 600 }}>✗ </span>
                      <span style={{ whiteSpace: "pre-line" }}>{s.decision.no}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProcessSection({ process, isOpen, toggle }) {
  return (
    <div style={{
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 12,
      boxShadow: isOpen ? "0 4px 12px rgba(0,0,0,0.08)" : "none"
    }}>
      <div
        onClick={toggle}
        style={{
          padding: "14px 20px",
          cursor: "pointer",
          background: isOpen ? "#F9FAFB" : "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 200 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{process.name}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ background: "#DBEAFE", color: "#1E40AF", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
            {process.owner}
          </span>
          <span style={{ background: "#EEF2FF", color: "#4338CA", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
            AI {process.aiTarget}%
          </span>
          <span style={{ background: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
            {process.frequency}
          </span>
          <span style={{ fontSize: 18, color: "#9CA3AF" }}>{isOpen ? "−" : "+"}</span>
        </div>
      </div>

      {isOpen && (
        <div style={{ padding: "0 20px 20px" }}>
          {/* Meta */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            marginBottom: 16,
            padding: "12px 0",
            borderBottom: "1px solid #E5E7EB"
          }}>
            <div>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>Триггер</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{process.trigger}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>Результат</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{process.outcome}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>Эскалация</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{process.escalation}</div>
            </div>
          </div>

          {/* Steps */}
          <h4 style={{ margin: "0 0 4px", fontSize: 14, color: "#111827" }}>Flow процесса</h4>
          <StepFlow steps={process.steps} />

          {/* Rules */}
          <div style={{ marginTop: 16 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#DC2626" }}>Правила (жёсткие)</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {process.rules.map((r, i) => (
                <div key={i} style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 13,
                  color: "#991B1B"
                }}>
                  {r}
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div style={{ marginTop: 16 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#065F46" }}>Метрики (KPI)</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {process.metrics.map((m, i) => (
                <span key={i} style={{
                  background: "#D1FAE5",
                  color: "#065F46",
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 12
                }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuestRelationsSOP() {
  const [openProcesses, setOpenProcesses] = useState(new Set(["new-lead"]));

  const toggle = (id) => {
    setOpenProcesses(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenProcesses(new Set(PROCESSES.map(p => p.id)));
  const collapseAll = () => setOpenProcesses(new Set());

  const totalSteps = PROCESSES.reduce((s, p) => s + p.steps.length, 0);
  const totalDecisions = PROCESSES.reduce((s, p) => s + p.steps.filter(st => st.decision).length, 0);
  const totalRules = PROCESSES.reduce((s, p) => s + p.rules.length, 0);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{
            background: "#2563EB", color: "#fff", padding: "4px 12px",
            borderRadius: 6, fontSize: 12, fontWeight: 700
          }}>ПРИОРИТЕТ #1</div>
          <span style={{ color: "#6B7280", fontSize: 13 }}>Отдел Димы</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>
          Guest Relations — Полная архитектура процессов
        </h1>
        <p style={{ color: "#6B7280", margin: 0, fontSize: 14 }}>
          9 процессов · {totalSteps} шагов · {totalDecisions} decision points · {totalRules} жёстких правил
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Процессов", value: "9", color: "#2563EB" },
          { label: "Шагов", value: totalSteps, color: "#111827" },
          { label: "Decision points", value: totalDecisions, color: "#7C3AED" },
          { label: "Ср. AI потенциал", value: "89%", color: "#059669" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <button onClick={expandAll} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #D1D5DB", background: "#fff", fontSize: 12, cursor: "pointer", color: "#374151" }}>
          Раскрыть все
        </button>
        <button onClick={collapseAll} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #D1D5DB", background: "#fff", fontSize: 12, cursor: "pointer", color: "#374151" }}>
          Свернуть
        </button>
      </div>

      {/* Process list */}
      {PROCESSES.map(p => (
        <ProcessSection
          key={p.id}
          process={p}
          isOpen={openProcesses.has(p.id)}
          toggle={() => toggle(p.id)}
        />
      ))}

      {/* Summary */}
      <div style={{
        background: "#EFF6FF",
        border: "1px solid #BFDBFE",
        borderRadius: 12,
        padding: 20,
        marginTop: 8
      }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 16, color: "#1E40AF" }}>
          Следующий шаг: от архитектуры к SOP документам
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
          Эта архитектура покрывает все 9 процессов Guest Relations с полными flow, decision trees и правилами.
          Следующий шаг — превратить каждый процесс в отдельный SOP-документ (Word/PDF) с чек-листами,
          который менеджер может использовать как руководство. После утверждения — decision trees становятся
          логикой для BLUUU OS модулей 1 (Booking Engine), 2 (WhatsApp Bot), и 6 (Review Engine).
        </p>
      </div>
    </div>
  );
}
