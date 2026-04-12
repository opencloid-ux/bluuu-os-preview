import { useState } from "react";

const DEPARTMENTS = [
  {
    id: "gr",
    name: "Guest Relations",
    owner: "Дима",
    color: "#2563EB",
    priority: 1,
    osModule: "Модули 1, 2, 6",
    processes: [
      {
        name: "Обработка нового лида",
        desc: "Лид приходит с OTA/сайта/WhatsApp → квалификация → первый контакт → отправка предложения",
        status: "manual",
        automatable: 95,
        escalations: "Цена нестандартная → Карим",
        frequency: "50-100/день",
        painPoints: ["Дублирование лидов в Kommo", "Неправильные номера телефонов (0 после кода)", "Менеджеры не успевают отвечать быстро"]
      },
      {
        name: "Бронирование и подтверждение",
        desc: "Выбор даты → проверка доступности лодок → создание бронирования → отправка инвойса → получение оплаты",
        status: "partial",
        automatable: 90,
        escalations: "Спецзапросы (DJ, торт, фотограф) → Дима",
        frequency: "30-60/день",
        painPoints: ["Ручная проверка доступности лодок", "Платёжные ссылки не работают (EDC)", "Двойные бронирования"]
      },
      {
        name: "Управление OTA-слотами",
        desc: "Открытие/закрытие availability на Viator, Klook, Airbnb, GYG в зависимости от загрузки лодок",
        status: "manual",
        automatable: 95,
        escalations: "Нет — Aline делает сама",
        frequency: "Несколько раз/день",
        painPoints: ["Полностью ручное", "Риск overbooking", "Нет синхронизации между платформами"]
      },
      {
        name: "Pre-tour коммуникация",
        desc: "За 24ч: подтверждение, время пикапа, место встречи, что взять. Утром: водитель звонит",
        status: "partial",
        automatable: 85,
        escalations: "Гость не отвечает → повторный контакт",
        frequency: "30-60/день",
        painPoints: ["Гости не отвечают на сообщения", "Неправильные адреса для трансфера", "Забывают подтвердить"]
      },
      {
        name: "Отмены и возвраты",
        desc: "Гость хочет отменить → проверка политики (14 дней) → решение о возврате → обработка",
        status: "manual",
        automatable: 90,
        escalations: "3,592 упоминания в чате. Каждый случай → Карим",
        frequency: "5-15/день",
        painPoints: ["Каждый случай эскалируется наверх", "Нет чёткого decision tree", "Гости торгуются"]
      },
      {
        name: "Ценообразование и скидки",
        desc: "Запрос нестандартной цены → согласование → применение",
        status: "manual",
        automatable: 80,
        escalations: "759 упоминаний скидок. Каждая → @Карим",
        frequency: "10-20/день",
        painPoints: ["Менеджеры не могут сами решить", "2,842 вопроса типа 'what price?' к Диме"]
      },
      {
        name: "Управление отзывами",
        desc: "Мониторинг отзывов → контакт с недовольным гостем → компенсация → запрос на удаление",
        status: "partial",
        automatable: 85,
        escalations: "Негатив ниже 3★ → MOD → Дима",
        frequency: "840+ отзывов/мес (пик)",
        painPoints: ["Ручной мониторинг 6+ платформ", "Медленная реакция на негатив", "Нет автоответов"]
      },
      {
        name: "Post-tour follow-up",
        desc: "Отправка GoPro видео → запрос отзыва → upsell повторного тура",
        status: "partial",
        automatable: 90,
        escalations: "Задержка видео >3 дней → Gee",
        frequency: "30-60/день",
        painPoints: ["Видео часто задерживается", "Нет системного upsell", "Потеря данных на Google Drive"]
      },
      {
        name: "Координация трансферов",
        desc: "Расчёт времени пикапа → назначение водителя → подтверждение гостю",
        status: "manual",
        automatable: 85,
        escalations: "Дальние расстояния (Canggu 75км) → допцена",
        frequency: "20-40/день",
        painPoints: ["1,121 упоминание в чате", "Ручной расчёт времени", "Гости путают локацию"]
      }
    ]
  },
  {
    id: "ops",
    name: "Operations (День тура)",
    owner: "Gee + David",
    color: "#059669",
    priority: 2,
    osModule: "Модуль 3",
    processes: [
      {
        name: "Манифест дня",
        desc: "Формирование списка гостей по лодкам, назначение гидов, проверка оплат",
        status: "partial",
        automatable: 80,
        frequency: "Ежедневно 6:00",
        painPoints: ["Ручная компиляция из нескольких систем"]
      },
      {
        name: "Погодный мониторинг",
        desc: "Проверка Windy App → решение go/no-go → уведомление гостей при отмене",
        status: "manual",
        automatable: 85,
        frequency: "Ежедневно 5:30-6:00",
        painPoints: ["507 упоминаний погоды", "Субъективное решение", "Поздние уведомления"]
      },
      {
        name: "Check-in гостей",
        desc: "Встреча в офисе Серанган → QR-верификация → welcome drink → брифинг → посадка",
        status: "partial",
        automatable: 60,
        frequency: "Ежедневно 7:00-8:30",
        painPoints: ["Гости не записаны в листе", "Путаница shared/private"]
      },
      {
        name: "Распределение гидов",
        desc: "Назначение гидов на лодки по уровню, языку, нагрузке",
        status: "manual",
        automatable: 85,
        frequency: "Ежедневно",
        painPoints: ["Ручное планирование Gee", "Нет учёта языков и нагрузки"]
      },
      {
        name: "QC чек-листы лодок",
        desc: "Проверка оборудования, безопасности, чистоты перед отправлением",
        status: "partial",
        automatable: 50,
        frequency: "Ежедневно на каждую лодку",
        painPoints: ["Не всегда выполняется", "Нет фото-доказательств"]
      },
      {
        name: "Управление инцидентами",
        desc: "Медицинский случай / поломка / жалоба → протокол → эскалация → компенсация",
        status: "manual",
        automatable: 60,
        frequency: "2-5/день в высокий сезон",
        painPoints: ["Нет чёткого протокола", "Каждый случай решается ad-hoc"]
      },
      {
        name: "Timely Reports (отчёты гидов)",
        desc: "После тура: какие споты посетили, пропущенные, инциденты, манты",
        status: "partial",
        automatable: 70,
        frequency: "Ежедневно после каждого тура",
        painPoints: ["Гиды забывают отправлять", "Нет стандартного формата"]
      }
    ]
  },
  {
    id: "fleet",
    name: "Fleet Management",
    owner: "David",
    color: "#7C3AED",
    priority: 3,
    osModule: "Модуль 8",
    processes: [
      {
        name: "Доступность флота",
        desc: "Отслеживание статуса каждой лодки (работает/ТО/церемония), 25-дневное обязательство",
        status: "partial",
        automatable: 80,
        frequency: "Ежедневно",
        painPoints: ["12,778 упоминаний лодок в чате", "Ручное отслеживание"]
      },
      {
        name: "Плановое ТО",
        desc: "100-часовой сервис, капитальный ремонт, замена деталей",
        status: "manual",
        automatable: 70,
        frequency: "Ежемесячно на лодку",
        painPoints: ["Нет автоматических напоминаний", "Частые поломки двигателей"]
      },
      {
        name: "GPS-мониторинг",
        desc: "Отслеживание местоположения лодок в реальном времени",
        status: "partial",
        automatable: 90,
        frequency: "Непрерывно",
        painPoints: ["GPS не всегда заряжен", "Нет интеграции с дашбордом"]
      },
      {
        name: "Управление экипажами",
        desc: "Контракты капитанов, документы, лицензирование, расписание",
        status: "manual",
        automatable: 50,
        frequency: "Еженедельно",
        painPoints: ["Нехватка квалифицированных капитанов", "Документы не совпадают"]
      }
    ]
  },
  {
    id: "fb",
    name: "F&B Operations",
    owner: "Ibu Rhiry",
    color: "#DC2626",
    priority: 4,
    osModule: "Модуль 3 (часть)",
    processes: [
      {
        name: "Закупки и поставки",
        desc: "Ежедневный заказ фруктов, напитков, выпечки. Просеко, соки для премиум",
        status: "partial",
        automatable: 70,
        frequency: "Ежедневно к 6:00",
        painPoints: ["Порча продуктов", "Проблемы с холодильниками"]
      },
      {
        name: "Комплектация лодок",
        desc: "Сборка наборов по типу тура (standard/premium/private/couples)",
        status: "manual",
        automatable: 60,
        frequency: "Ежедневно к 7:30",
        painPoints: ["Нет стандартных чек-листов по типу тура"]
      },
      {
        name: "Розничные продажи (Серанган PoS)",
        desc: "Продажа кокосов, пива, солнцезащитного крема, мерча в офисе",
        status: "partial",
        automatable: 70,
        frequency: "Непрерывно",
        painPoints: ["Потери инвентаря (24.3M IDR за 2 мес)", "Учёт в Odoo не полный"]
      },
      {
        name: "Управление запасами",
        desc: "Инвентаризация, заказ пополнения, контроль сроков годности",
        status: "manual",
        automatable: 75,
        frequency: "Еженедельно",
        painPoints: ["Потери оборудования (бокалы, вёдра)", "Нет автозаказа"]
      }
    ]
  },
  {
    id: "finance",
    name: "Finance & Revenue",
    owner: "Карим / Shenny",
    color: "#EA580C",
    priority: 5,
    osModule: "Модуль 5",
    processes: [
      {
        name: "Обработка платежей",
        desc: "Xendit, EDC, банковские переводы. Сверка по каналам",
        status: "partial",
        automatable: 80,
        frequency: "Ежедневно",
        painPoints: ["EDC зависают на 10+ дней", "Ручная сверка"]
      },
      {
        name: "OTA-комиссии",
        desc: "Расчёт и отслеживание комиссий Viator (20%), Klook (25%), Airbnb, GYG",
        status: "manual",
        automatable: 90,
        frequency: "Еженедельно/ежемесячно",
        painPoints: ["Ручной расчёт", "Разные ставки на каждой платформе"]
      },
      {
        name: "Payroll и бонусы",
        desc: "Зарплаты команды, бонусы менеджерам (50K/shared booking), Guide Race выплаты",
        status: "manual",
        automatable: 75,
        frequency: "Ежемесячно",
        painPoints: ["Ручной подсчёт бонусов", "Нет связи с Guide Race"]
      },
      {
        name: "P&L и отчётность",
        desc: "Доход по каналам, расходы по категориям, маржинальность по типу тура",
        status: "manual",
        automatable: 85,
        frequency: "Ежемесячно",
        painPoints: ["Данные разбросаны по системам"]
      }
    ]
  },
  {
    id: "lounge",
    name: "Lounge & Front-line",
    owner: "Widya",
    color: "#0891B2",
    priority: 6,
    osModule: "Модуль 3 (часть)",
    processes: [
      {
        name: "Встреча и обслуживание гостей",
        desc: "Welcome drinks, check-in, брифинг, решение проблем в реальном времени",
        status: "manual",
        automatable: 40,
        frequency: "Ежедневно 6:30-9:30 и 16:30-19:30",
        painPoints: ["Требует постоянного присутствия", "Много ситуативных решений"]
      },
      {
        name: "Кофе-станция и самообслуживание",
        desc: "Бесплатный кофе/чай, поддержание запасов, чистота",
        status: "manual",
        automatable: 20,
        frequency: "Непрерывно",
        painPoints: ["Нет стандарта подготовки"]
      }
    ]
  }
];

const statusLabels = { manual: "Ручной", partial: "Частично", automated: "Авто" };
const statusColors = { manual: "#FEE2E2", partial: "#FEF3C7", automated: "#D1FAE5" };
const statusText = { manual: "#991B1B", partial: "#92400E", automated: "#065F46" };

function ProcessCard({ process, expanded, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        padding: "12px 16px",
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: expanded ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{process.name}</span>
        <span style={{
          background: statusColors[process.status],
          color: statusText[process.status],
          padding: "2px 8px",
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600,
          whiteSpace: "nowrap"
        }}>
          {statusLabels[process.status]}
        </span>
        <span style={{
          background: "#EEF2FF",
          color: "#4338CA",
          padding: "2px 8px",
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600,
          whiteSpace: "nowrap"
        }}>
          AI {process.automatable}%
        </span>
      </div>

      {expanded && (
        <div style={{ marginTop: 12, fontSize: 13, color: "#374151" }}>
          <p style={{ margin: "0 0 8px", lineHeight: 1.5 }}>{process.desc}</p>

          {process.frequency && (
            <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
              <span style={{ color: "#6B7280", minWidth: 80 }}>Частота:</span>
              <span>{process.frequency}</span>
            </div>
          )}

          {process.escalations && (
            <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
              <span style={{ color: "#6B7280", minWidth: 80 }}>Эскалация:</span>
              <span>{process.escalations}</span>
            </div>
          )}

          {process.painPoints && (
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "#DC2626", fontWeight: 600, fontSize: 12 }}>Болевые точки:</span>
              <ul style={{ margin: "4px 0 0", paddingLeft: 16 }}>
                {process.painPoints.map((p, i) => (
                  <li key={i} style={{ fontSize: 12, color: "#6B7280", marginBottom: 2 }}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DeptSection({ dept, expandedProcesses, toggleProcess }) {
  const totalProcesses = dept.processes.length;
  const manualCount = dept.processes.filter(p => p.status === "manual").length;
  const avgAutomation = Math.round(dept.processes.reduce((s, p) => s + p.automatable, 0) / totalProcesses);

  return (
    <div style={{
      border: `2px solid ${dept.color}20`,
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 16
    }}>
      <div style={{
        background: `${dept.color}10`,
        padding: "14px 20px",
        borderBottom: `1px solid ${dept.color}20`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            background: dept.color,
            color: "#fff",
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700
          }}>
            {dept.priority}
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: 16, color: dept.color }}>{dept.name}</span>
            <span style={{ color: "#6B7280", fontSize: 13, marginLeft: 8 }}>Owner: {dept.owner}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
          <span style={{ color: "#6B7280" }}>{totalProcesses} процессов</span>
          <span style={{ color: "#991B1B" }}>{manualCount} ручных</span>
          <span style={{ color: "#4338CA" }}>AI потенциал: {avgAutomation}%</span>
          <span style={{ color: "#6B7280" }}>{dept.osModule}</span>
        </div>
      </div>
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        {dept.processes.map((proc, i) => (
          <ProcessCard
            key={i}
            process={proc}
            expanded={expandedProcesses.has(`${dept.id}-${i}`)}
            onClick={() => toggleProcess(`${dept.id}-${i}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default function BluuuProcessArchitecture() {
  const [expandedProcesses, setExpandedProcesses] = useState(new Set());
  const [filter, setFilter] = useState("all");

  const toggleProcess = (id) => {
    setExpandedProcesses(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set();
    DEPARTMENTS.forEach(d => d.processes.forEach((_, i) => all.add(`${d.id}-${i}`)));
    setExpandedProcesses(all);
  };

  const collapseAll = () => setExpandedProcesses(new Set());

  const allProcesses = DEPARTMENTS.flatMap(d => d.processes);
  const totalManual = allProcesses.filter(p => p.status === "manual").length;
  const totalPartial = allProcesses.filter(p => p.status === "partial").length;
  const avgAutomation = Math.round(allProcesses.reduce((s, p) => s + p.automatable, 0) / allProcesses.length);

  const filtered = filter === "all"
    ? DEPARTMENTS
    : DEPARTMENTS.map(d => ({
        ...d,
        processes: d.processes.filter(p => p.status === filter)
      })).filter(d => d.processes.length > 0);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>
          BLUUU TOURS — Архитектура процессов
        </h1>
        <p style={{ color: "#6B7280", margin: 0, fontSize: 14 }}>
          Карта всех операционных процессов. Фундамент для стандартизации → SOP → BLUUU OS
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Всего процессов", value: allProcesses.length, color: "#111827" },
          { label: "Ручных", value: totalManual, color: "#DC2626" },
          { label: "Частично авто", value: totalPartial, color: "#D97706" },
          { label: "Средний AI потенциал", value: `${avgAutomation}%`, color: "#4338CA" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#F9FAFB", borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { key: "all", label: "Все" },
            { key: "manual", label: "Ручные" },
            { key: "partial", label: "Частично" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "1px solid #D1D5DB",
                background: filter === f.key ? "#111827" : "#fff",
                color: filter === f.key ? "#fff" : "#374151",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: filter === f.key ? 600 : 400
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={expandAll} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #D1D5DB", background: "#fff", fontSize: 12, cursor: "pointer", color: "#374151" }}>
            Раскрыть все
          </button>
          <button onClick={collapseAll} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #D1D5DB", background: "#fff", fontSize: 12, cursor: "pointer", color: "#374151" }}>
            Свернуть
          </button>
        </div>
      </div>

      {/* Departments */}
      {filtered.map(dept => (
        <DeptSection
          key={dept.id}
          dept={dept}
          expandedProcesses={expandedProcesses}
          toggleProcess={toggleProcess}
        />
      ))}

      {/* Roadmap */}
      <div style={{
        background: "#F0FDF4",
        border: "1px solid #BBF7D0",
        borderRadius: 12,
        padding: 20,
        marginTop: 8
      }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#065F46" }}>
          Путь: Процессы → SOP → BLUUU OS
        </h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { step: "1", title: "Архитектура", desc: "Карта процессов (сейчас)", done: true },
            { step: "2", title: "SOP Guest Relations", desc: "9 процессов → decision trees", done: false },
            { step: "3", title: "SOP Operations", desc: "7 процессов + чек-листы", done: false },
            { step: "4", title: "SOP остальное", desc: "Fleet, F&B, Finance, Lounge", done: false },
            { step: "5", title: "BLUUU OS MVP", desc: "SOP → AI-модули", done: false },
          ].map((s, i) => (
            <div key={i} style={{
              flex: "1 1 150px",
              background: s.done ? "#065F46" : "#fff",
              color: s.done ? "#fff" : "#374151",
              borderRadius: 8,
              padding: "10px 12px",
              border: s.done ? "none" : "1px solid #D1D5DB",
              minWidth: 140
            }}>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Шаг {s.step}</div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{s.title}</div>
              <div style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
