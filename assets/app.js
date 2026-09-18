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

  /* ---------- day sheet ------------------------------------------------- */

  var sheet = document.getElementById('sheet');
  var sheetBody = document.getElementById('sheetBody');
  var prevBtn = document.getElementById('prevDay');
  var nextBtn = document.getElementById('nextDay');

  /** At most two, most interesting first. */
  function badgesFor(day, total) {
    var out = [];
    if (day === MONTH_FACTS.worst) out.push(['💀', 'Most expensive day this month', true]);
    if (day === MONTH_FACTS.quietest) out.push(['🐌', 'Your quietest spend day', false]);
    var wd = weekdayOf(day);
    if (out.length === 0 && total > MONTH_FACTS.average * 1.5) {
      out.push(['🔥', 'Heavier than most of your days', true]);
    }
    if (out.length < 2 && (wd === 5 || wd === 6) && total > MONTH_FACTS.average) {
      out.push(['🎪', 'Classic weekend behaviour', false]);
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
      return ['🕰', 'You started spending at ' + clock(first.time) + ' and never really stopped.'];
    }
    if (biggest.amount / total >= 0.5) {
      return ['🫠', 'One purchase took ' + Math.round((biggest.amount / total) * 100) +
        '% of the day. ' + biggest.merchant + ', obviously.'];
    }
    if (ubers >= 2) {
      return ['🚕', ubers + ' Ubers in one day. Your legs are reportedly fine.'];
    }
    if (food >= 4) {
      return ['🍽', food + ' separate food decisions. A tasting menu of your own design.'];
    }
    if (txns.length === 1) {
      return ['🧊', 'One transaction, all day. Frankly, heroic.'];
    }
    if (lateHour >= 22) {
      return ['🌙', 'The ' + clock(last.time) + ' ' + biggest.merchant.toLowerCase() +
        ' run is the one to think about.'];
    }
    if (+last.time.split(':')[0] < 14) {
      return ['☀️', 'All of it before 2pm. The afternoon cost you nothing.'];
    }
    return ['📎', txns.length + ' transactions across ' + Object.keys(cats).length +
      ' categories. A perfectly ordinary day.'];
  }

  function renderSheet(day) {
    var txns = txnsFor(day, false);
    var total = sum(txns);
    sheetBody.textContent = '';

    document.getElementById('sheetDate').textContent =
      WEEKDAYS[weekdayOf(day)] + ', September ' + day;

    /* whole dollars here, to match the figure on the calendar tile — the
       itemised rows below still carry the exact cents */
    var totalEl = el('p', 'sheet-total');
    totalEl.innerHTML = money(Math.round(total)) + '<sub>spent</sub>';
    sheetBody.appendChild(totalEl);

    if (!txns.length) {
      var empty = el('div', 'empty-day');
      empty.innerHTML = '<span class="big">🧘</span><strong>A no-spend day.</strong><br>' +
        'One of ' + MONTH_FACTS.noSpend.length + ' this month. Nothing happened, financially.';
      sheetBody.appendChild(empty);
      wire(day);
      return;
    }

    var badges = el('div');
    badgesFor(day, total).forEach(function (b) {
      var badge = el('span', 'badge' + (b[2] ? ' hot' : ''));
      badge.innerHTML = '<span aria-hidden="true">' + b[0] + '</span> ' + b[1];
      badges.appendChild(badge);
      badges.appendChild(document.createTextNode(' '));
    });
    sheetBody.appendChild(badges);

    /* grouped by category, biggest spend first, chronological inside each group */
    var groups = {};
    txns.forEach(function (t) { (groups[t.category] = groups[t.category] || []).push(t); });
    Object.keys(groups)
      .sort(function (a, b) { return sum(groups[b]) - sum(groups[a]); })
      .forEach(function (cat) {
        var box = el('div', 'cat-group');
        var head = el('div', 'cat-head');
        head.innerHTML = '<span>' + (D.CATEGORIES[cat] ? D.CATEGORIES[cat].emoji + ' ' : '') + cat +
          '</span><b>' + money(sum(groups[cat])) + '</b>';
        box.appendChild(head);

        groups[cat].forEach(function (t) {
          var row = el('div', 'txn');
          row.innerHTML =
            '<span class="emoji" aria-hidden="true">' + t.emoji + '</span>' +
            '<span class="who">' + t.merchant + '<span class="when">' + clock(t.time) + '</span></span>' +
            '<span class="how-much">' + money(t.amount) + '</span>';
          box.appendChild(row);
        });
        sheetBody.appendChild(box);
      });

    var line = insightFor(day, txns, total);
    var insight = el('p', 'insight', line[1]);
    insight.dataset.mark = line[0];
    sheetBody.appendChild(insight);

    wire(day);
  }

  function wire(day) {
    prevBtn.disabled = day <= 1;
    nextBtn.disabled = day >= DAYS_IN_MONTH;
  }

  function openSheet(day) {
    state.day = day;
    renderSheet(day);
    if (!sheet.open) sheet.showModal();
    document.getElementById('closeSheet').focus();
  }

  function closeSheet() {
    if (!sheet.open) return;
    if (reducedMotion()) { sheet.close(); return; }
    sheet.classList.add('closing');
    setTimeout(function () {
      sheet.classList.remove('closing');
      sheet.close();
    }, 170);
  }

  function stepDay(delta) {
    var next = state.day + delta;
    if (next < 1 || next > DAYS_IN_MONTH) return;
    state.day = next;
    renderSheet(next);
  }

  document.getElementById('closeSheet').addEventListener('click', closeSheet);
  prevBtn.addEventListener('click', function () { stepDay(-1); });
  nextBtn.addEventListener('click', function () { stepDay(1); });

  sheet.addEventListener('cancel', function (e) { e.preventDefault(); closeSheet(); });
  sheet.addEventListener('click', function (e) {
    if (e.target === sheet) closeSheet();          /* click the backdrop */
  });
  sheet.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); stepDay(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); stepDay(1); }
  });

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

  document.getElementById('heroMonth').textContent = D.MONTH.label;
  document.getElementById('recapEyebrow').textContent = 'Your ' + D.MONTH.short;
  heroTotal.dataset.value = 0;
  renderHero();
  renderCalendar();
})();
