html = """<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BLUUU OS — Dashboard Preview</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
:root{--p:#14b8c8;--pd:#117e9e;--sec:#ffb35f;--bg:#0e1823;--sf:#17222b;--sf2:#1e2e3d;--ok:#20c997;--warn:#f6c244;--err:#f2434a;--info:#3197e8;--txt:#f3f7fa;--txt2:#98a8b5;--bdr:#253041;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--txt);min-height:100vh;}
.nav{position:fixed;top:0;left:0;right:0;background:#0a1220;border-bottom:1px solid var(--bdr);z-index:100;display:flex;align-items:center;height:56px;}
.nav-logo{padding:0 24px;border-right:1px solid var(--bdr);height:100%;display:flex;align-items:center;font-weight:700;font-size:17px;color:var(--p);}
.nav-logo em{color:#fff;font-style:normal;font-weight:400;font-size:11px;opacity:.4;margin-left:4px;}
.nav-tabs{display:flex;height:100%;}
.tab{display:flex;align-items:center;gap:7px;padding:0 20px;font-size:13px;font-weight:500;color:var(--txt2);cursor:pointer;border:none;border-bottom:2px solid transparent;background:none;height:100%;transition:all .2s;}
.tab:hover{color:var(--txt);background:rgba(255,255,255,.03);}
.tab.active{color:var(--p);border-bottom:2px solid var(--p);}
.dot{width:7px;height:7px;border-radius:50%;background:currentColor;opacity:.6;}
.nav-r{margin-left:auto;display:flex;align-items:center;gap:14px;padding:0 24px;}
.nclock{font-size:12px;color:var(--txt2);font-family:'Roboto Mono',monospace;}
.bell{position:relative;cursor:pointer;font-size:17px;}
.bbadge{position:absolute;top:-4px;right:-6px;background:var(--err);color:#fff;font-size:9px;font-weight:700;border-radius:10px;padding:1px 4px;animation:blink 2s infinite;}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:.4;}}
.avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--p),var(--pd));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;cursor:pointer;}
.page{display:none;padding:72px 24px 40px;}
.page.active{display:block;}
.badge{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:.3px;}
.bg{background:rgba(32,201,151,.12);color:var(--ok);border:1px solid rgba(32,201,151,.3);}
.bn{background:rgba(242,67,74,.12);color:var(--err);border:1px solid rgba(242,67,74,.3);}
.bw{background:rgba(246,194,68,.12);color:var(--warn);border:1px solid rgba(246,194,68,.3);}
.bi{background:rgba(49,151,232,.12);color:var(--info);border:1px solid rgba(49,151,232,.3);}
.bp{background:rgba(20,184,200,.12);color:var(--p);border:1px solid rgba(20,184,200,.3);}
.krow{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px;}
.kpi{background:var(--sf);border:1px solid var(--bdr);border-radius:14px;padding:18px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;}
.kpi:hover{border-color:var(--p);transform:translateY(-1px);}
.kpi.lg{border-left:3px solid var(--ok);}.kpi.ly{border-left:3px solid var(--warn);}.kpi.lr{border-left:3px solid var(--err);}.kpi.lb{border-left:3px solid var(--p);}
.kico{font-size:18px;margin-bottom:10px;}.kval{font-family:'Roboto Mono',monospace;font-size:24px;font-weight:700;line-height:1;margin-bottom:4px;}.klbl{font-size:11px;color:var(--txt2);margin-bottom:6px;}.kdelta{font-size:11px;font-weight:600;}
.up{color:var(--ok);}.dn{color:var(--err);}.neu{color:var(--txt2);}
.kbar{position:absolute;bottom:0;left:0;right:0;height:3px;background:var(--bdr);}.kbar-f{height:100%;background:var(--p);}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:18px;}
.g64{display:grid;grid-template-columns:60% 40%;gap:14px;margin-bottom:18px;}
.card{background:var(--sf);border:1px solid var(--bdr);border-radius:14px;padding:18px;}
.ch{font-size:11px;font-weight:600;color:var(--txt2);text-transform:uppercase;letter-spacing:.7px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;}
.ca{font-size:11px;color:var(--p);text-transform:none;letter-spacing:0;cursor:pointer;}
.chart{height:155px;display:flex;align-items:flex-end;gap:6px;}
.bwrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;}
.bar{width:100%;border-radius:4px 4px 0 0;cursor:pointer;transition:opacity .2s;position:relative;}
.bar:hover{opacity:.72;}
.btip{display:none;position:absolute;bottom:calc(100% + 4px);left:50%;transform:translateX(-50%);background:#0a1220;border:1px solid var(--bdr);padding:3px 7px;border-radius:4px;font-size:10px;white-space:nowrap;font-family:'Roboto Mono',monospace;z-index:10;}
.bar:hover .btip{display:block;}
.blbl{font-size:9px;color:var(--txt2);}
.fleet{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.boat{background:var(--sf2);border:1px solid var(--bdr);border-radius:8px;padding:10px;cursor:pointer;transition:border-color .2s;}
.boat:hover{border-color:var(--p);}
.boat.bt{border-left:3px solid var(--p);}.boat.bm{border-left:3px solid var(--warn);}.boat.br2{border-left:3px solid var(--ok);}.boat.bb{border-left:3px solid var(--err);}
.bn2{font-size:12px;font-weight:600;margin-bottom:3px;}.bs{font-size:11px;color:var(--txt2);}
.ota-row{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.oname{font-size:12px;color:var(--txt2);width:80px;flex-shrink:0;}
.otrack{flex:1;height:5px;background:var(--bdr);border-radius:3px;overflow:hidden;}
.ofill{height:100%;border-radius:3px;background:var(--p);}
.osc{font-family:'Roboto Mono',monospace;font-size:13px;font-weight:600;width:32px;text-align:right;}
.ocnt{font-size:10px;color:var(--txt2);width:48px;}
.feed{display:flex;flex-direction:column;gap:7px;max-height:190px;overflow-y:auto;}
.fi{display:flex;align-items:flex-start;gap:8px;padding:9px 10px;background:var(--sf2);border-radius:7px;border:1px solid var(--bdr);font-size:12px;}
.fdot{width:7px;height:7px;border-radius:50%;margin-top:3px;flex-shrink:0;}
.fg{background:var(--ok);}.fy{background:var(--warn);}.fr{background:var(--err);}.fb{background:var(--info);}
.ft{flex:1;}.fts{font-size:10px;color:var(--txt2);font-family:'Roboto Mono',monospace;}
.weather{display:flex;align-items:center;justify-content:space-between;background:rgba(32,201,151,.07);border:1px solid rgba(32,201,151,.25);border-radius:14px;padding:18px 24px;margin-bottom:18px;cursor:pointer;}
.weather:hover{background:rgba(32,201,151,.12);}
.wl{display:flex;align-items:center;gap:16px;}.wico{font-size:38px;}.wdec{font-size:28px;font-weight:800;color:var(--ok);letter-spacing:2px;}.wsub{font-size:12px;color:var(--txt2);margin-top:2px;}
.wms{display:flex;gap:28px;}.wm{text-align:center;}.wmv{font-family:'Roboto Mono',monospace;font-size:20px;font-weight:700;}.wml{font-size:10px;color:var(--txt2);margin-top:1px;}.wok{color:var(--ok);}.wwarn{color:var(--warn);}
.ttable{width:100%;border-collapse:collapse;}
.ttable th{text-align:left;font-size:10px;font-weight:600;color:var(--txt2);text-transform:uppercase;letter-spacing:.5px;padding:7px 10px;border-bottom:1px solid var(--bdr);}
.ttable td{padding:9px 10px;font-size:12px;border-bottom:1px solid rgba(37,48,65,.4);vertical-align:middle;}
.ttable tr:hover td{background:var(--sf2);}
.tbd{padding:2px 7px;border-radius:20px;font-size:10px;font-weight:600;}
.tsh{background:rgba(49,151,232,.12);color:var(--info);}.tpr{background:rgba(255,179,95,.12);color:var(--sec);}.tpm{background:rgba(20,184,200,.12);color:var(--p);}
.tact{padding:3px 8px;border-radius:5px;font-size:10px;font-weight:600;border:none;cursor:pointer;margin-right:3px;}
.tp{background:rgba(20,184,200,.1);color:var(--p);border:1px solid rgba(20,184,200,.3);}
.td2{background:rgba(242,67,74,.1);color:var(--err);border:1px solid rgba(242,67,74,.3);}
.prow{display:flex;align-items:center;gap:10px;padding:7px 10px;background:var(--sf2);border-radius:7px;border:1px solid var(--bdr);margin-bottom:6px;}
.pname{flex:1;font-size:12px;}
.pinput{background:var(--bg);border:1px solid var(--bdr);border-radius:5px;color:var(--txt);font-family:'Roboto Mono',monospace;font-size:12px;font-weight:600;padding:3px 7px;width:110px;text-align:right;}
.pinput:focus{outline:none;border-color:var(--p);}
.alrt{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:8px;border:1px solid;cursor:pointer;margin-bottom:8px;transition:transform .2s;}
.alrt:hover{transform:translateX(2px);}
.alrt.ac{background:rgba(242,67,74,.07);border-color:rgba(242,67,74,.25);}
.alrt.aw{background:rgba(246,194,68,.07);border-color:rgba(246,194,68,.25);}
.aico{font-size:18px;}.atxt{flex:1;font-size:12px;}.atxt strong{display:block;margin-bottom:1px;}.atxt span{color:var(--txt2);font-size:11px;}
.abtn{padding:3px 10px;border-radius:5px;font-size:11px;font-weight:600;cursor:pointer;background:rgba(20,184,200,.1);color:var(--p);border:1px solid rgba(20,184,200,.25);}
.wcd{display:flex;align-items:center;justify-content:space-between;background:rgba(20,184,200,.07);border:1px solid rgba(20,184,200,.25);border-radius:14px;padding:16px 24px;margin-bottom:18px;}
.cdtime{font-family:'Roboto Mono',monospace;font-size:34px;font-weight:800;color:var(--p);}
.cdlbl{font-size:11px;color:var(--txt2);margin-top:2px;}
.cdstats{display:flex;gap:24px;}.cdstat .v{font-family:'Roboto Mono',monospace;font-size:22px;font-weight:700;text-align:center;}.cdstat .l{font-size:10px;color:var(--txt2);text-align:center;margin-top:2px;}
.gtable{width:100%;border-collapse:collapse;}
.gtable th{text-align:left;font-size:10px;font-weight:600;color:var(--txt2);text-transform:uppercase;letter-spacing:.5px;padding:7px 10px;border-bottom:1px solid var(--bdr);}
.gtable td{padding:9px 10px;font-size:12px;border-bottom:1px solid rgba(37,48,65,.4);vertical-align:middle;}
.gtable .garr td{background:rgba(32,201,151,.04);}.gtable .glate td{background:rgba(242,67,74,.04);}.gtable tr:hover td{background:var(--sf2);}
.sdot{width:9px;height:9px;border-radius:50%;display:inline-block;margin-right:5px;}
.sarr{background:var(--ok);}.sexp{background:var(--warn);}.slate{background:var(--err);animation:blink 1.5s infinite;}
.req{display:flex;gap:3px;font-size:14px;}
.qbtn{padding:2px 8px;border-radius:5px;font-size:10px;font-weight:600;background:rgba(20,184,200,.1);color:var(--p);border:1px solid rgba(20,184,200,.25);cursor:pointer;}
.chk{display:flex;flex-direction:column;gap:6px;}
.chkitem{display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--sf2);border-radius:7px;border:1px solid var(--bdr);cursor:pointer;font-size:12px;transition:border-color .2s;}
.chkitem:hover{border-color:var(--p);}
.chkitem input{width:15px;height:15px;accent-color:var(--p);cursor:pointer;}
.modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:200;align-items:center;justify-content:center;}
.modal.open{display:flex;}
.mbox{background:var(--sf);border:1px solid var(--bdr);border-radius:14px;padding:24px;max-width:380px;width:90%;}
.mtitle{font-size:15px;font-weight:700;margin-bottom:10px;}.mbody{font-size:13px;color:var(--txt2);margin-bottom:18px;line-height:1.6;}
.mact{display:flex;gap:8px;justify-content:flex-end;}
.mbtn{padding:7px 16px;border-radius:7px;font-size:12px;font-weight:600;border:none;cursor:pointer;}
.mghost{background:transparent;color:var(--txt2);border:1px solid var(--bdr);}.mok{background:var(--ok);color:#fff;}.merr{background:var(--err);color:#fff;}
::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:2px;}
@media(max-width:900px){.krow{grid-template-columns:1fr 1fr;}.g2,.g3,.g64{grid-template-columns:1fr;}.fleet{grid-template-columns:repeat(2,1fr);}.wms{gap:14px;}}
</style>
</head>
<body>
<nav class="nav">
  <div class="nav-logo">BLUUU<em>OS</em></div>
  <div class="nav-tabs">
    <button class="tab active" onclick="show('alex',this)"><span class="dot"></span>Alex (CEO)</button>
    <button class="tab" onclick="show('karim',this)"><span class="dot"></span>Карим (OPS)</button>
    <button class="tab" onclick="show('widia',this)"><span class="dot"></span>Widia (Лаунж)</button>
  </div>
  <div class="nav-r">
    <span class="nclock" id="clk">--:--</span>
    <div class="bell">&#x1F514;<span class="bbadge">3</span></div>
    <div class="avatar">A</div>
  </div>
</nav>

<!-- ====== ALEX ====== -->
<div class="page active" id="page-alex">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
    <div>
      <div style="font-size:22px;font-weight:700;">&#x1F44B; Доброе утро, Alex</div>
      <div style="font-size:13px;color:var(--txt2);margin-top:2px;">Четверг, 2 апреля 2026</div>
    </div>
    <div style="display:flex;gap:8px;"><span class="badge bg">&#x2705; GO сегодня</span><span class="badge bi">&#x2600;&#xFE0F; Ясно, 29°C</span></div>
  </div>
  <div class="krow">
    <div class="kpi lg" onclick="openM('revenue')">
      <div class="kico">&#x1F4B0;</div>
      <div class="kval">Rp 47.2M</div>
      <div class="klbl">Выручка сегодня</div>
      <div class="kdelta up">&#x2191; +12% vs вчера &nbsp;·&nbsp; 94% плана</div>
      <div class="kbar"><div class="kbar-f" style="width:94%"></div></div>
    </div>
    <div class="kpi lb" onclick="openM('tours')">
      <div class="kico">&#x26F5;</div>
      <div class="kval">14 <span class="badge bg" style="font-size:10px;vertical-align:middle;">GO</span></div>
      <div class="klbl">Туров сегодня</div>
      <div class="kdelta neu">12 идут · 2 завершены · 0 отмен</div>
    </div>
    <div class="kpi lb">
      <div class="kico">&#x1F9D1;&#x200D;&#x1F91D;&#x200D;&#x1F9D1;</div>
      <div class="kval">87</div>
      <div class="klbl">Гостей на воде</div>
      <div class="kdelta neu">из 142 сегодня · 17 вернулись</div>
    </div>
    <div class="kpi ly" onclick="openM('alerts')">
      <div class="kico">&#x26A0;&#xFE0F;</div>
      <div class="kval">3</div>
      <div class="klbl">Открытых алертов</div>
      <div class="kdelta dn">&#x2191; 1 новый за час</div>
    </div>
  </div>
  <div class="g64">
    <div class="card">
      <div class="ch">График выручки
        <div style="display:flex;gap:6px;">
          <span class="badge bp" style="cursor:pointer;">Нед</span>
          <span class="badge" style="cursor:pointer;opacity:.4;border:1px solid var(--bdr);">Мес</span>
          <span class="badge" style="cursor:pointer;opacity:.4;border:1px solid var(--bdr);">Год</span>
        </div>
      </div>
      <div class="chart">
        <div class="bwrap"><div class="bar" style="height:55%;background:rgba(20,184,200,.25);"><div class="btip">Пн: Rp 38M</div></div><div class="blbl">Пн</div></div>
        <div class="bwrap"><div class="bar" style="height:70%;background:rgba(20,184,200,.25);"><div class="btip">Вт: Rp 48M</div></div><div class="blbl">Вт</div></div>
        <div class="bwrap"><div class="bar" style="height:45%;background:rgba(20,184,200,.25);"><div class="btip">Ср: Rp 31M</div></div><div class="blbl">Ср</div></div>
        <div class="bwrap"><div class="bar" style="height:63%;background:rgba(20,184,200,.25);"><div class="btip">Чт: Rp 43M</div></div><div class="blbl">Чт</div></div>
        <div class="bwrap"><div class="bar" style="height:68%;background:var(--p);"><div class="btip">Пт: Rp 47.2M (сегодня)</div></div><div class="blbl">Пт</div></div>
        <div class="bwrap"><div class="bar" style="height:80%;background:var(--p);opacity:.45;border:1px dashed var(--p);"><div class="btip">Сб: Rp 55M (прогноз)</div></div><div class="blbl">Сб</div></div>
        <div class="bwrap"><div class="bar" style="height:72%;background:var(--p);opacity:.35;border:1px dashed var(--p);"><div class="btip">Вс: Rp 50M (прогноз)</div></div><div class="blbl">Вс</div></div>
      </div>
    </div>
    <div class="card">
      <div class="ch">OTA Рейтинги <span class="ca">Все &#x2192;</span></div>
      <div class="ota-row"><div class="oname">Viator</div><div class="otrack"><div class="ofill" style="width:97%"></div></div><div class="osc">4.9</div><div class="ocnt">6,204</div></div>
      <div class="ota-row"><div class="oname">TripAdvisor</div><div class="otrack"><div class="ofill" style="width:95%"></div></div><div class="osc">4.7</div><div class="ocnt">1,841</div></div>
      <div class="ota-row"><div class="oname">Klook</div><div class="otrack"><div class="ofill" style="width:92%"></div></div><div class="osc">4.6</div><div class="ocnt">487</div></div>
      <div class="ota-row"><div class="oname">GetYourGuide</div><div class="otrack"><div class="ofill" style="width:88%"></div></div><div class="osc">4.4</div><div class="ocnt">300</div></div>
      <div style="border-top:1px solid var(--bdr);padding-top:12px;margin-top:6px;">
        <div style="font-size:11px;color:var(--txt2);margin-bottom:4px;">ОБЩИЙ РЕЙТИНГ</div>
        <div style="font-family:'Roboto Mono',monospace;font-size:28px;font-weight:800;color:var(--ok);">4.8 &#x2B50;</div>
        <div style="font-size:11px;color:var(--txt2);margin-top:2px;">8,832 отзывов</div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-bottom:18px;">
    <div class="ch">Флот — реальное время <span class="ca">GPS карта &#x2192;</span></div>
    <div class="fleet">
      <div class="boat bt"><div class="bn2">Lady Manta</div><div class="bs"><span class="badge bp" style="font-size:10px;">В туре</span></div><div class="bs" style="margin-top:4px;">22 гостя · возврат 16:30</div></div>
      <div class="boat bt"><div class="bn2">Blue Wave</div><div class="bs"><span class="badge bp" style="font-size:10px;">В туре</span></div><div class="bs" style="margin-top:4px;">18 гостей · возврат 15:45</div></div>
      <div class="boat bt"><div class="bn2">Sea Spirit</div><div class="bs"><span class="badge bp" style="font-size:10px;">В туре</span></div><div class="bs" style="margin-top:4px;">14 гостей · возврат 17:00</div></div>
      <div class="boat br2"><div class="bn2">Coral Queen</div><div class="bs"><span class="badge bg" style="font-size:10px;">Готова</span></div><div class="bs" style="margin-top:4px;">Завтра 08:30</div></div>
      <div class="boat bm"><div class="bn2">Manta King</div><div class="bs"><span class="badge bw" style="font-size:10px;">ТО</span></div><div class="bs" style="margin-top:4px;">Готова до 15:00</div></div>
      <div class="boat bt"><div class="bn2">Ocean Dream</div><div class="bs"><span class="badge bp" style="font-size:10px;">В туре</span></div><div class="bs" style="margin-top:4px;">20 гостей · возврат 16:00</div></div>
      <div class="boat br2"><div class="bn2">Sunset Star</div><div class="bs"><span class="badge bg" style="font-size:10px;">Готова</span></div><div class="bs" style="margin-top:4px;">Свободна</div></div>
      <div class="boat bb"><div class="bn2">Pearl Diver</div><div class="bs"><span class="badge bn" style="font-size:10px;">Поломка</span></div><div class="bs" style="margin-top:4px;">Ждём запчасти</div></div>
    </div>
  </div>
  <div class="card">
    <div class="ch">Лента событий <span class="ca">Все &#x2192;</span></div>
    <div class="feed">
      <div class="fi"><div class="fdot fg"></div><div class="ft">Lady Manta вышла из Серангана — 22 гостя на борту</div><div class="fts">08:31</div></div>
      <div class="fi"><div class="fdot fb"></div><div class="ft">Новое бронирование: Premium Private — 4 чел, 5 апреля</div><div class="fts">08:28</div></div>
      <div class="fi"><div class="fdot fy"></div><div class="ft">Manta King: ТО, ожидание запчастей, отчёт подан Дэвидом</div><div class="fts">08:15</div></div>
      <div class="fi"><div class="fdot fg"></div><div class="ft">Новый отзыв Viator 5&#x2B50;: "Лучший тур в Бали!"</div><div class="fts">07:54</div></div>
      <div class="fi"><div class="fdot fr"></div><div class="ft">Pearl Diver — поломка двигателя, тур перенесён</div><div class="fts">07:30</div></div>
      <div class="fi"><div class="fdot fg"></div><div class="ft">Погода GO — волны 0.8м, ветер 12 уз, видимость отличная</div