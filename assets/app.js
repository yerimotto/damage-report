/**
 * Money Calendar — a spending diary for September 2026.
 *
 * Everything on screen is derived from MC_DATA.TRANSACTIONS: the tiers on the
 * calendar, the badges and one-liners in the day sheet, and every figure in the
 * recap. Nothing is hardcoded, so changing the ledger changes the whole app.
 */
(function () {
  'use strict';

  var D = window.MC_DATA;
  var TX = D.TRANSACTIONS;
  var DAYS_IN_MONTH = 30;
  var WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  /* ---------- little helpers ------------------------------------------- */

  /** Sept 2026 starts on a Tuesday; 0 = Monday. */
  function weekdayOf(day) {
    var js = new Date(Date.UTC(D.MONTH.year, D.MONTH.month - 1, day)).getUTCDay();
    return (js + 6) % 7;
  }

  /** "$4,821" when it's a round figure, "$6.50" when the cents matter. */
  function money(n) {
    var round = Math.abs(n - Math.round(n)) < 0.005;
    return '$' + n.toLocaleString('en-AU', {
      minimumFractionDigits: round ? 0 : 2,
      maximumFractionDigits: round ? 0 : 2
    });
  }

  function ordinal(n) {
    if (n % 100 >= 11 && n % 100 <= 13) return n + 'th';
    return n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  }

  /** "09:42" -> "9:42am" */
  function clock(hhmm) {
    var p = hhmm.split(':');
    var h = +p[0];
    var suffix = h < 12 ? 'am' : 'pm';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + p[1] + suffix;
  }

  function sum(list) {
    return list.reduce(function (t, x) { return t + x.amount; }, 0);
  }

  /** Deterministic per-day PRNG, so a day's blob keeps its shape across renders. */
  function seeded(day, salt) {
    var x = Math.sin(day * 127.1 + salt * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  /** An organic, hand-inked blob rather than a perfect circle. */
  function blobShape(day) {
    var r = [];
    for (var i = 0; i < 8; i++) r.push(Math.round(42 + seeded(day, i + 1) * 17) + '%');
    return r.slice(0, 4).join(' ') + ' / ' + r.slice(4).join(' ');
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- derived month data ---------------------------------------- */

  var state = { filter: 'All', view: 'calendar', day: null };

  function inFilter(t) {
    return state.filter === 'All' || t.category === state.filter;
  }

  function txnsFor(day, filtered) {
    return TX.filter(function (t) {
      return t.day === day && (filtered === false || inFilter(t));
    });
  }

  /** day -> total, for whichever category filter is active. */
  function dayTotals() {
    var out = {};
    for (var d = 1; d <= DAYS_IN_MONTH; d++) out[d] = sum(txnsFor(d));
    return out;
  }

  /* Blob sizes are a share of the ink box's height, so the day number — which
   owns its own row — is never covered. Phone cells are tiny and centre the
   number inside the blob instead, so they get their own scale. */
var TIER_SIZE = ['0%', '44%', '62%', '82%', '100%'];
var TIER_SIZE_SM = ['0%', '40%', '56%', '74%', '90%'];

  function tierOf(amount, max) {
    if (amount <= 0) return 0;
    var r = amount / max;
    if (r < 0.25) return 1;
    if (r < 0.5) return 2;
    if (r < 0.8) return 3;
    return 4;
  }

  /* Month-wide facts — computed once from the full ledger, filter-independent. */
  var MONTH_FACTS = (function () {
    var totals = {};
    var d;
    for (d = 1; d <= DAYS_IN_MONTH; d++) totals[d] = sum(txnsFor(d, false));

    var spendDays = [];
    var noSpend = [];
    for (d = 1; d <= DAYS_IN_MONTH; d++) (totals[d] > 0 ? spendDays : noSpend).push(d);

    var worst = spendDays.reduce(function (a, b) { return totals[a] >= totals[b] ? a : b; });
    var quietest = spendDays.reduce(function (a, b) { return totals[a] <= totals[b] ? a : b; });

    var byCategory = {};
    var byMerchant = {};
    TX.forEach(function (t) {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
      byMerchant[t.merchant] = byMerchant[t.merchant] || { count: 0, total: 0, emoji: t.emoji };
      byMerchant[t.merchant].count++;
      byMerchant[t.merchant].total += t.amount;
    });

    var repeat = Object.keys(byMerchant).sort(function (a, b) {
      return byMerchant[b].count - byMerchant[a].count;
    })[0];

    var byWeekday = [0, 0, 0, 0, 0, 0, 0];
    var weekdayCount = [0, 0, 0, 0, 0, 0, 0];
    for (d = 1; d <= DAYS_IN_MONTH; d++) {
      byWeekday[weekdayOf(d)] += totals[d];
      weekdayCount[weekdayOf(d)]++;
    }
    var dangerous = byWeekday.indexOf(Math.max.apply(null, byWeekday));

    return {
      totals: totals,
      total: sum(TX),
      spendDays: spendDays,
      noSpend: noSpend,
      worst: worst,
      quietest: quietest,
      average: sum(TX) / spendDays.length,
      byCategory: byCategory,
      byMerchant: byMerchant,
      repeat: repeat,
      byWeekday: byWeekday,
      weekdayCount: weekdayCount,
      dangerous: dangerous
    };
  })();

  /* ---------- hero ------------------------------------------------------ */

  var heroTotal = document.getElementById('heroTotal');
  var heroDelta = document.getElementById('heroDelta');
  var tweenId = 0;

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Count the headline up to its new value when the filter changes. */
  function setHeroTotal(value, label) {
    var sub = '<sub>' + label + '</sub>';
    if (reducedMotion()) {
      heroTotal.innerHTML = money(Math.round(value)) + sub;
      return;
    }
    var from = parseFloat((heroTotal.dataset.value || 0));
    var start = performance.now();
    var id = ++tweenId;
    heroTotal.dataset.value = value;
    (function step(now) {
      if (id !== tweenId) return;
      var p = Math.min(1, (now - start) / 420);
      var eased = 1 - Math.pow(1 - p, 3);
      heroTotal.innerHTML = money(Math.round(from + (value - from) * eased)) + sub;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  function renderHero() {
    var shown = sum(TX.filter(inFilter));
    if (state.filter === 'All') {
      setHeroTotal(shown, 'spent');
      var change = Math.round((1 - shown / D.PREVIOUS_MONTH_TOTAL) * 100);
      heroDelta.innerHTML = '<span class="arrow" aria-hidden="true">' + (change >= 0 ? '↓' : '↑') +
        '</span> <b>' + Math.abs(change) + '%</b> vs last month';
    } else {
      setHeroTotal(shown, 'on ' + state.filter.toLowerCase());
      var share = Math.round((shown / MONTH_FACTS.total) * 100);
      var count = TX.filter(inFilter).length;
      heroDelta.innerHTML = '<span class="arrow" aria-hidden="true">✳</span> <b>' + share +
        '%</b> of the month, across ' + count + ' transactions';
    }
  }

  /* ---------- calendar -------------------------------------------------- */

  var grid = document.getElementById('grid');

  function renderCalendar() {
    var totals = dayTotals();
    var max = Math.max.apply(null, Object.keys(totals).map(function (d) { return totals[d]; }));
    if (max <= 0) max = 1;

    grid.textContent = '';
    var lead = weekdayOf(1);
    for (var i = 0; i < lead; i++) grid.appendChild(el('div', 'pad'));

    var shown = 0;
    for (var d = 1; d <= DAYS_IN_MONTH; d++) {
      var amount = totals[d];
      var tier = tierOf(amount, max);
      var btn = el('button', 'day');
      btn.type = 'button';
      btn.dataset.tier = tier;
      btn.dataset.day = d;
      btn.setAttribute('aria-label', WEEKDAYS[weekdayOf(d)] + ' ' + ordinal(d) + ', ' +
        (amount > 0 ? money(amount) + ' spent' : 'no spending'));

      btn.appendChild(el('span', 'date', String(d)));

      var ink = el('span', 'ink');
      if (tier > 0) {
        var blob = el('span', 'blob');
        blob.style.setProperty('--size', TIER_SIZE[tier]);
        blob.style.setProperty('--size-sm', TIER_SIZE_SM[tier]);
        blob.style.setProperty('--shape', blobShape(d));
        blob.style.setProperty('--spin', Math.round(-14 + seeded(d, 9) * 28) + 'deg');
        blob.style.setProperty('--tone', 'var(--spend-' + tier + ')');
        blob.style.setProperty('--tone-echo', 'var(--spend-' + Math.max(1, tier - 2) + ')');
        blob.style.setProperty('--delay', Math.min(shown * 22, 620) + 'ms');
        ink.appendChild(blob);
        shown++;
      }
      if (amount > 0) ink.appendChild(el('span', 'amt', money(Math.round(amount))));
      btn.appendChild(ink);
      if (d === MONTH_FACTS.worst && state.filter === 'All') {
        var skull = el('span', 'skull', '💀');
        skull.setAttribute('aria-hidden', 'true');
        btn.appendChild(skull);
      }
      grid.appendChild(btn);
    }
  }

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.day');
    if (btn) openSheet(+btn.dataset.day);
  });

  /* Arrow keys walk the grid the way a calendar should. */
  grid.addEventListener('keydown', function (e) {
    var btn = e.target.closest('.day');
    if (!btn) return;
    var step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!step) return;
    e.preventDefault();
    var next = grid.querySelector('.day[data-day="' + (+btn.dataset.day + step) + '"]');
    if (next) next.focus();
  });

  /* ---------- day receipt drawer ---------------------------------------- */

  var sheet = document.getElementById('sheet');
  var sheetBody = document.getElementById('sheetBody');
  var scroller = document.getElementById('sheetScroll');
  var handle = document.getElementById('sheetHandle');
  var prevBtn = document.getElementById('prevDay');
  var nextBtn = document.getElementById('nextDay');

  /** Bare receipt figures: no currency symbol, always two decimals. */
  function amt(n) {
    return n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function stampsFor(day, total) {
    var out = [];
    if (day === MONTH_FACTS.worst) out.push(['💀', 'Most expensive day', true]);
    if (day === MONTH_FACTS.quietest) out.push(['🐌', 'Quietest spend day', false]);
    var wd = weekdayOf(day);
    if (out.length === 0 && total > MONTH_FACTS.average * 1.5) {
      out.push(['🔥', 'Heavier than most', true]);
    }
    if (out.length < 2 && (wd === 5 || wd === 6) && total > MONTH_FACTS.average) {
      out.push(['🎪', 'Weekend behaviour', false]);
    }
    if (out.length === 0 && total < MONTH_FACTS.average * 0.5) {
      out.push(['🌱', 'A gentle one', false]);
    }
    return out.slice(0, 2);
  }

  /** One playful line, picked from what actually happened that day. */
  function insightFor(day, txns, total) {
    var first = txns[0];
    var last = txns[txns.length - 1];
    var biggest = txns.reduce(function (a, b) { return a.amount >= b.amount ? a : b; });
    var lateHour = +last.time.split(':')[0];
    var earlyHour = +first.time.split(':')[0];
    var ubers = txns.filter(function (t) { return t.merchant === 'Uber'; }).length;
    var food = txns.filter(function (t) { return t.category === 'Food'; }).length;
    var cats = {};
    txns.forEach(function (t) { cats[t.category] = true; });

    if (earlyHour < 10 && lateHour >= 22) {
      return 'You started spending at ' + clock(first.time) + ' and never really stopped.';
    }
    if (biggest.amount / total >= 0.5) {
      return 'One purchase took ' + Math.round((biggest.amount / total) * 100) +
        '% of the day. ' + biggest.merchant + ', obviously.';
    }
    if (ubers >= 2) return ubers + ' Ubers in one day. Your legs are reportedly fine.';
    if (food >= 4) return food + ' separate food decisions. A tasting menu of your own design.';
    if (txns.length === 1) return 'One transaction, all day. Frankly, heroic.';
    if (lateHour >= 22) {
      return 'The ' + clock(last.time) + ' ' + biggest.merchant.toLowerCase() +
        ' run is the one to think about.';
    }
    if (lateHour < 14) return 'All of it before 2pm. The afternoon cost you nothing.';
    return txns.length + ' transactions across ' + Object.keys(cats).length +
      ' categories. A perfectly ordinary day.';
  }

  /** Bars seeded from the day, so each receipt carries its own barcode. */
  function barcode(day) {
    var bars = '';
    for (var i = 0; i < 46; i++) {
      var w = 1 + Math.round(seeded(day, 40 + i) * 2.4);
      bars += '<i style="--w:' + w + 'px"></i>';
    }
    return bars;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function renderSheet(day) {
    var txns = txnsFor(day, false);
    var total = sum(txns);
    var wd = WEEKDAYS[weekdayOf(day)];
    var html = '';

    html += '<header class="r-head">' +
      '<p class="r-brand">MONEY CALENDAR</p>' +
      '<p class="r-meta">12 DIARY LANE · SURRY HILLS</p>' +
      '<p class="r-meta">TEL 1800 NO SPEND</p>' +
      '<div class="r-rule"></div>' +
      '<div class="r-kv"><span>Date</span><b>' + pad(day) + '-09-2026</b></div>' +
      '<div class="r-kv"><span>Day</span><b>' + wd + '</b></div>';

    if (txns.length) {
      html += '<div class="r-kv"><span>Opened</span><b>' + txns[0].time + '</b></div>' +
        '<div class="r-kv"><span>Closed</span><b>' + txns[txns.length - 1].time + '</b></div>' +
        '<div class="r-kv"><span>Items</span><b>' + txns.length + '</b></div>';
    } else {
      html += '<div class="r-kv"><span>Status</span><b>Closed for business</b></div>';
    }
    html += '<div class="r-rule"></div></header>';

    if (!txns.length) {
      html += '<p class="r-empty">— NO ITEMS —</p><div class="r-rule"></div>';
    } else {
      var groups = {};
      txns.forEach(function (t) { (groups[t.category] = groups[t.category] || []).push(t); });
      Object.keys(groups)
        .sort(function (a, b) { return sum(groups[b]) - sum(groups[a]); })
        .forEach(function (cat) {
          html += '<section class="r-sec"><div class="r-sec-head"><span>' + cat +
            '</span><span>' + groups[cat].length +
            (groups[cat].length === 1 ? ' item' : ' items') + '</span></div>';
          groups[cat].forEach(function (t) {
            html += '<div class="r-item">' +
              '<span class="e" aria-hidden="true">' + t.emoji + '</span>' +
              '<span class="n">' + t.merchant + '<span class="t">' + clock(t.time) + '</span></span>' +
              '<span class="a">' + amt(t.amount) + '</span></div>';
          });
          html += '<div class="r-sub"><span>Subtotal</span><b>' + amt(sum(groups[cat])) +
            '</b></div></section>';
        });
      html += '<div class="r-rule"></div>';
    }

    html += '<div class="r-total"><span class="k">TOTAL</span><span class="v">$' +
      amt(total) + '</span></div>' +
      '<div class="r-rule"></div>' +
      '<div class="r-kv"><span>Card ····4821</span><span>' +
      (txns.length ? 'Approved' : 'Untouched') + '</span></div>' +
      '<div class="r-kv"><span>Currency</span><span>AUD</span></div>';

    var stamps = txns.length
      ? stampsFor(day, total)
      : [['🧘', 'No-spend day', false]];
    if (stamps.length) {
      html += '<div class="r-stamps">';
      stamps.forEach(function (st) {
        html += '<span class="stamp' + (st[2] ? ' hot' : '') + '">' +
          '<span aria-hidden="true">' + st[0] + '</span> ' + st[1] + '</span>';
      });
      html += '</div>';
    }

    html += '<div class="r-note"><span class="k">NOTE</span><p>' +
      (txns.length
        ? insightFor(day, txns, total)
        : 'One of ' + MONTH_FACTS.noSpend.length +
          ' no-spend days this month. Nothing happened, financially.') +
      '</p></div>';

    html += '<p class="r-thanks">THANK YOU</p>' +
      '<div class="r-barcode" aria-hidden="true">' + barcode(day) + '</div>' +
      '<p class="r-fine">NO REFUNDS · NO REGRETS · MOCK DATA</p>';

    /* the tab rides above the paper, so the figure is always one glance away */
    document.getElementById('sheetDate').innerHTML =
      wd.slice(0, 3) + ' ' + day + ' Sep · <b>$' + amt(total) + '</b>';

    sheetBody.innerHTML = html;
    sheetBody.classList.remove('printing');
    void sheetBody.offsetWidth;                  /* restart the print animation */
    sheetBody.classList.add('printing');
    scroller.scrollTop = 0;

    prevBtn.disabled = day <= 1;
    nextBtn.disabled = day >= DAYS_IN_MONTH;
  }

  function setDim(p) {
    sheet.style.setProperty('--sheet-dim', p);
    document.documentElement.style.setProperty('--sheet-dim', p);
  }

  function openSheet(day) {
    state.day = day;
    sheet.style.transition = '';
    sheet.style.transform = '';
    setDim(1);
    renderSheet(day);
    if (!sheet.open) sheet.showModal();
    handle.focus();
  }

  function closeSheet() {
    if (!sheet.open) return;
    if (reducedMotion()) { sheet.close(); setDim(1); return; }
    sheet.style.transition = 'transform .26s cubic-bezier(.32, .72, 0, 1)';
    sheet.style.transform = 'translateY(100%)';
    setDim(0);
    setTimeout(function () {
      sheet.close();
      sheet.style.transition = '';
      sheet.style.transform = '';
      setDim(1);
    }, 250);
  }

  function stepDay(delta) {
    var next = state.day + delta;
    if (next < 1 || next > DAYS_IN_MONTH) return;
    state.day = next;
    renderSheet(next);
  }

  handle.addEventListener('click', closeSheet);
  prevBtn.addEventListener('click', function () { stepDay(-1); });
  nextBtn.addEventListener('click', function () { stepDay(1); });

  sheet.addEventListener('cancel', function (e) { e.preventDefault(); closeSheet(); });
  sheet.addEventListener('click', function (e) {
    if (e.target === sheet) closeSheet();          /* tap the backdrop */
  });
  sheet.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); stepDay(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); stepDay(1); }
  });

  /* Torn paper edges. Tooth depth wanders so it reads as hand-torn rather
     than die-cut; built once and shared by every receipt. */
  (function tearEdge() {
    var teeth = 42;
    var top = [];
    var bottom = [];
    for (var i = 0; i <= teeth; i++) {
      var x = (i / teeth * 100).toFixed(2) + '%';
      var depth = (2 + seeded(i, 77) * 5.5).toFixed(1) + 'px';
      top.push(x + ' ' + (i % 2 ? depth : '0px'));
      bottom.push(x + ' calc(100% - ' + (i % 2 ? '0px' : depth) + ')');
    }
    document.documentElement.style.setProperty(
      '--tear', 'polygon(' + top.join(',') + ',' + bottom.reverse().join(',') + ')');
  })();

  /* ---- swipe down to dismiss ------------------------------------------- */

  var drag = null;
  var DISMISS_DISTANCE = 110;   /* px dragged before it lets go */
  var DISMISS_VELOCITY = 0.5;   /* or a flick this fast, in px/ms */

  sheet.addEventListener('pointerdown', function (e) {
    if (e.button) return;
    if (e.target.closest('.r-nav-btn')) return;
    var onGrip = !!e.target.closest('.r-top');
    /* from the list you can only drag once it's scrolled to the top */
    if (!onGrip && scroller.scrollTop > 0) return;
    drag = { y: e.clientY, t: performance.now(), dy: 0, active: onGrip, id: e.pointerId };
    if (onGrip) sheet.setPointerCapture(e.pointerId);
  });

  sheet.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dy = e.clientY - drag.y;

    if (!drag.active) {
      if (dy > 6 && scroller.scrollTop <= 0) {
        drag.active = true;
        drag.y = e.clientY;                        /* start from here, no jump */
        dy = 0;
        sheet.setPointerCapture(e.pointerId);
      } else if (dy < -2) {
        drag = null;                               /* they meant to scroll */
        return;
      } else {
        return;
      }
    }

    drag.dy = dy;
    e.preventDefault();
    sheet.style.transition = 'none';
    /* pulling up past the top gets resistance, never real movement */
    sheet.style.transform = 'translateY(' + (dy > 0 ? dy : Math.max(dy * 0.2, -22)) + 'px)';
    setDim(Math.max(0.15, 1 - Math.max(dy, 0) / 420));
  }, { passive: false });

  function endDrag() {
    if (!drag) return;
    var dy = drag.dy;
    var velocity = dy / Math.max(performance.now() - drag.t, 1);
    var letGo = drag.active && (dy > DISMISS_DISTANCE || (velocity > DISMISS_VELOCITY && dy > 36));
    drag = null;

    if (letGo) { closeSheet(); return; }
    sheet.style.transition = 'transform .32s cubic-bezier(.22, 1, .36, 1)';
    sheet.style.transform = '';
    setDim(1);
  }

  sheet.addEventListener('pointerup', endDrag);
  sheet.addEventListener('pointercancel', endDrag);

  /* ---------- recap ----------------------------------------------------- */

  function renderRecap() {
    var bars = document.getElementById('catBars');
    bars.textContent = '';
    var cats = Object.keys(MONTH_FACTS.byCategory).sort(function (a, b) {
      return MONTH_FACTS.byCategory[b] - MONTH_FACTS.byCategory[a];
    });
    var top = MONTH_FACTS.byCategory[cats[0]];

    cats.forEach(function (cat, i) {
      var amount = MONTH_FACTS.byCategory[cat];
      var row = el('div', 'cat-row');
      var tone = i < 2 ? 3 : i < 4 ? 2 : 1;
      row.innerHTML =
        '<span class="emoji" aria-hidden="true">' + D.CATEGORIES[cat].emoji + '</span>' +
        '<span><span class="name">' + cat + '</span>' +
        '<span class="bar" style="--w:' + ((amount / top) * 100).toFixed(1) + '%;--tone:var(--spend-' +
        tone + ');--delay:' + (i * 60) + 'ms"></span></span>' +
        '<span class="money">' + money(Math.round(amount)) + '</span>';
      bars.appendChild(row);
    });

    document.getElementById('recapTotal').textContent = money(Math.round(MONTH_FACTS.total));
    document.getElementById('recapSub').textContent =
      TX.length + ' transactions · ' + MONTH_FACTS.spendDays.length + ' days with spending · ' +
      'an average of ' + money(Math.round(MONTH_FACTS.average)) + ' on the days you spent';

    var worstDay = MONTH_FACTS.worst;
    var repeat = MONTH_FACTS.byMerchant[MONTH_FACTS.repeat];
    var dangerIndex = MONTH_FACTS.dangerous;
    var cards = [
      ['💀', 'Most expensive day', WEEKDAYS[weekdayOf(worstDay)] + ' ' + ordinal(worstDay),
        money(Math.round(MONTH_FACTS.totals[worstDay]))],
      ['🧘', 'No-spend days', MONTH_FACTS.noSpend.length + ' days',
        'the ' + MONTH_FACTS.noSpend.map(ordinal).join(', ')],
      ['🔁', 'Repeat offender', MONTH_FACTS.repeat, repeat.count + ' transactions · ' +
        money(Math.round(repeat.total))],
      ['📅', 'Most dangerous day', WEEKDAYS[dangerIndex],
        money(Math.round(MONTH_FACTS.byWeekday[dangerIndex])) + ' across ' +
        MONTH_FACTS.weekdayCount[dangerIndex] + ' of them']
    ];

    var wrap = document.getElementById('insights');
    wrap.textContent = '';
    cards.forEach(function (c) {
      var card = el('div', 'i-card');
      card.innerHTML = '<span class="mark" aria-hidden="true">' + c[0] + '</span>' +
        '<span class="k">' + c[1] + '</span><span class="v">' + c[2] + '</span>' +
        '<span class="n">' + c[3] + '</span>';
      wrap.appendChild(card);
    });
  }

  /* ---------- share (prototype: nothing leaves the page) ----------------- */

  var toast = document.getElementById('toast');
  var toastTimer;

  document.getElementById('share').addEventListener('click', function () {
    var btn = this;
    btn.classList.add('done');
    btn.innerHTML = '<span aria-hidden="true">✓</span> Shared with nobody';
    toast.textContent = 'Nothing actually left this page — it’s a prototype.';
    toast.classList.add('up');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('up');
      btn.classList.remove('done');
      btn.innerHTML = '<span aria-hidden="true">✻</span> Share my month';
    }, 2800);
  });

  /* ---------- views + filters ------------------------------------------- */

  function setView(view) {
    state.view = view;
    document.querySelectorAll('.view-tab').forEach(function (tab) {
      tab.setAttribute('aria-selected', String(tab.dataset.view === view));
    });
    document.getElementById('viewCalendar').hidden = view !== 'calendar';
    document.getElementById('viewRecap').hidden = view !== 'recap';
    if (view === 'recap') renderRecap();
    window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  document.querySelectorAll('.view-tab').forEach(function (tab) {
    tab.addEventListener('click', function () { setView(tab.dataset.view); });
  });

  var filters = document.getElementById('filters');
  D.FILTERS.forEach(function (name) {
    var chip = el('button', 'chip', name);
    chip.type = 'button';
    chip.dataset.filter = name;
    chip.setAttribute('aria-pressed', String(name === state.filter));
    filters.appendChild(chip);
  });

  filters.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (!chip || chip.dataset.filter === state.filter) return;
    state.filter = chip.dataset.filter;
    filters.querySelectorAll('.chip').forEach(function (c) {
      c.setAttribute('aria-pressed', String(c.dataset.filter === state.filter));
    });
    renderHero();
    renderCalendar();
  });

  /* ---------- boot ------------------------------------------------------ */

  /* The recap story (assets/recap.js) reads the same facts, so the two
     surfaces can never disagree about the month. */
  window.MC = {
    facts: MONTH_FACTS,
    money: money,
    ordinal: ordinal,
    clock: clock,
    weekdayOf: weekdayOf,
    seeded: seeded,
    blobShape: blobShape,
    WEEKDAYS: WEEKDAYS,
    openDay: openSheet
  };

  document.getElementById('heroMonth').textContent = D.MONTH.label;
  document.getElementById('recapEyebrow').textContent = 'Your ' + D.MONTH.short;
  heroTotal.dataset.value = 0;
  renderHero();
  renderCalendar();
})();
