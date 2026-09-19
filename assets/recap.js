/**
 * The September recap — five full-screen beats, then a creature.
 *
 * Every figure, badge and trait is read out of the same ledger the calendar
 * uses (via window.MC), so the story can never drift from the receipts.
 */
(function () {
  'use strict';

  var MC = window.MC;
  var D = window.MC_DATA;
  var TX = D.TRANSACTIONS;
  var F = MC.facts;
  var money = MC.money;

  var STEPS = 5;
  var TREAT_MAX = 15;                               /* a coffee, a lamington */
  var TREAT_CATEGORIES = ['Food', 'Fun', 'Gifts'];

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- what the month actually says ------------------------------ */

  var STORY = (function () {
    var total = F.total;

    var weekendSpend = TX.reduce(function (t, x) {
      return MC.weekdayOf(x.day) >= 4 ? t + x.amount : t;   /* Fri, Sat, Sun */
    }, 0);
    var weekendShare = Math.round((weekendSpend / total) * 100);

    var treats = TX.filter(function (t) {
      return t.amount <= TREAT_MAX && TREAT_CATEGORIES.indexOf(t.category) >= 0;
    });

    var categories = Object.keys(F.byCategory)
      .sort(function (a, b) { return F.byCategory[b] - F.byCategory[a]; })
      .slice(0, 5)
      .map(function (name) {
        return {
          name: name,
          emoji: D.CATEGORIES[name].emoji,
          amount: F.byCategory[name],
          pct: Math.round((F.byCategory[name] / total) * 100)
        };
      });

    var worstTotal = F.totals[F.worst];
    var peak = F.dangerous;

    /* the rarer the skew, the rarer the creature */
    var rarity = weekendShare >= 85 ? ['LEGENDARY', 4]
      : weekendShare >= 70 ? ['RARE', 3]
      : weekendShare >= 50 ? ['UNCOMMON', 2]
      : ['COMMON', 1];

    return {
      total: total,
      count: TX.length,
      change: Math.round((1 - total / D.PREVIOUS_MONTH_TOTAL) * 100),
      weekendShare: weekendShare,
      weekendSpend: weekendSpend,
      peak: peak,
      peakName: MC.WEEKDAYS[peak],
      treats: treats.length,
      treatSpend: treats.reduce(function (t, x) { return t + x.amount; }, 0),
      categories: categories,
      worst: F.worst,
      worstTotal: worstTotal,
      worstMultiple: (worstTotal / F.average).toFixed(1),
      rarity: rarity[0],
      rarityPips: rarity[1],
      badges: [
        ['✨', 'Little Treat Enjoyer',
          treats.length + ' little treats this month, ' + money(Math.round(treats.reduce(
            function (t, x) { return t + x.amount; }, 0))) + ' of small joy'],
        ['🔥', 'Weekend Menace',
          weekendShare + '% of your spending happened Friday to Sunday'],
        ['💀', 'Financial Jumpscare',
          'One day hit ' + money(Math.round(worstTotal)) + ' — ' +
          (worstTotal / F.average).toFixed(1) + '× an ordinary day']
      ]
    };
  })();

  /* ---------- markup for each beat -------------------------------------- */

  function blobStyle(tone, size, seed, delay) {
    return '--tone:var(--s-' + tone + ');--size:' + size + 'px;--shape:' + MC.blobShape(seed) +
      ';--spin:' + Math.round(-12 + MC.seeded(seed, 9) * 24) + 'deg;--delay:' + delay + 'ms';
  }

  var SCREENS = [

    /* 1 · the number */
    function () {
      return '<p class="rc-eyebrow">Money Calendar · 2026</p>' +
        '<h2 class="rc-h">September,<br>done.</h2>' +
        '<p class="rc-money">' + money(Math.round(STORY.total)) + '<sub>spent</sub></p>' +
        '<ul class="rc-facts">' +
          '<li><b>' + STORY.count + '</b> transactions</li>' +
          '<li><b>' + F.spendDays.length + '</b> days with damage</li>' +
          '<li>↓ <b>' + Math.abs(STORY.change) + '%</b> from August</li>' +
        '</ul>';
    },

    /* 2 · the pattern */
    function () {
      var peakTotal = Math.max.apply(null, F.byWeekday);
      var letters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      var week = F.byWeekday.map(function (v, i) {
        var share = v / peakTotal;
        var tone = share > .8 ? 4 : share > .45 ? 3 : share > .25 ? 2 : 1;
        return '<span class="rc-day' + (i === STORY.peak ? ' peak' : '') + '">' +
          '<i class="rc-blob" style="' + blobStyle(tone, 0, i + 3, 80 + i * 70) +
          ';--scale:' + Math.max(.26, Math.sqrt(share)).toFixed(2) + '"></i>' +
          '<span>' + letters[i] + '</span></span>';
      }).join('');

      return '<p class="rc-eyebrow">The pattern</p>' +
        '<h2 class="rc-say">September was a <em>weekend</em> month.</h2>' +
        '<div class="rc-week">' + week + '</div>' +
        '<p class="rc-p"><b>' + STORY.weekendShare + '%</b> of everything you spent happened ' +
          'between Friday and Sunday. That is ' + money(Math.round(STORY.weekendSpend)) +
          ' of weekend.</p>' +
        '<p class="rc-p">Your most dangerous day: <b>' + STORY.peakName + ' 💀</b></p>';
    },

    /* 3 · the DNA */
    function () {
      var cells = STORY.categories.map(function (c, i) {
        var size = Math.round(30 + 3.6 * c.pct);
        var tone = i === 0 ? 4 : i === 1 ? 3 : i === 2 ? 2 : 1;
        return '<span class="rc-cell">' +
          '<i style="' + blobStyle(tone, size, i + 11, 90 + i * 90) + '">' + c.emoji + '</i>' +
          '<b>' + c.name + '<em>' + c.pct + '%</em></b></span>';
      }).join('');

      return '<p class="rc-eyebrow">Spending DNA</p>' +
        '<h2 class="rc-say">This is what you are made of.</h2>' +
        '<div class="rc-dna">' + cells + '</div>' +
        '<p class="rc-p">' + STORY.categories[0].name + ' took <b>' +
          STORY.categories[0].pct + '%</b> — roughly one dollar in every ' +
          Math.round(100 / STORY.categories[0].pct) + '.</p>';
    },

    /* 4 · badges, one at a time */
    function (state) {
      var cards = STORY.badges.map(function (b, i) {
        return '<div class="rc-badge' + (i < state.badge ? ' on' : '') + '">' +
          '<span class="rc-medal" aria-hidden="true">' + b[0] + '</span>' +
          '<span><p class="rc-badge-t">' + b[1] + '</p>' +
          '<p class="rc-badge-s">' + b[2] + '</p></span></div>';
      }).join('');

      return '<p class="rc-eyebrow">Badge unlock</p>' +
        '<h2 class="rc-say">You earned some hardware.</h2>' +
        '<div class="rc-badges">' + cards + '</div>' +
        (state.badge >= 3
          ? '<p class="rc-tally">✦ 3 new badges added to your collection</p>'
          : '<p class="rc-tally" style="color:var(--s-dim)">' + state.badge + ' of 3 unlocked</p>');
    },

    /* 5 · your Spendy */
    function () {
      var traits = [
        ['✨', 'Little Treat Enjoyer'],
        [STORY.categories[0].emoji, STORY.categories[0].name + ' Motivated'],
        ['🔥', 'Weekend Energy']
      ];
      var pips = '';
      for (var i = 0; i < 4; i++) {
        pips += '<i class="' + (i < STORY.rarityPips ? 'full' : '') + '"></i>';
      }

      return '<p class="rc-eyebrow">Your September character</p>' +
        '<div class="rc-creature" role="img" aria-label="A round pink creature with big eyes">' +
          '<span class="rc-body"></span>' +
          '<span class="rc-eye l"></span><span class="rc-eye r"></span>' +
          '<span class="rc-cheek l"></span><span class="rc-cheek r"></span>' +
          '<span class="rc-mouth"></span>' +
          traits.map(function (t, i) {
            return '<span class="rc-trait-orbit t' + (i + 1) + '" aria-hidden="true">' +
              t[0] + '</span>';
          }).join('') +
        '</div>' +
        '<h2 class="rc-name">The Weekend Menace</h2>' +
        '<p class="rc-quote">“Lives for dinner reservations and believes Saturday ' +
          'has no consequences.”</p>' +
        '<div class="rc-traits">' + traits.map(function (t) {
          return '<span class="rc-chip"><span aria-hidden="true">' + t[0] + '</span> ' + t[1] + '</span>';
        }).join('') + '</div>' +
        '<p class="rc-rarity">' + STORY.rarity + ' <span class="rc-pips">' + pips + '</span></p>' +
        '<div class="rc-actions">' +
          '<button type="button" class="rc-btn" id="rcCollect">Add to collection</button>' +
          '<button type="button" class="rc-btn rc-btn--ghost" id="rcShare">Share my Spendy</button>' +
        '</div>';
    }
  ];

  var HINTS = [
    'tap to continue',
    'tap to continue',
    'tap to continue',
    'tap to unlock',
    'tap left to go back'
  ];

  /* ---------- the player ------------------------------------------------ */

  var rc = document.getElementById('recap');
  var stage = document.getElementById('rcStage');
  var dots = document.getElementById('rcDots');
  var hint = document.getElementById('rcHint');
  var state = { step: 0, badge: 0, open: false };

  for (var i = 0; i < STEPS; i++) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'rc-dot';
    dot.dataset.step = i;
    dot.setAttribute('aria-label', 'Part ' + (i + 1) + ' of ' + STEPS);
    dots.appendChild(dot);
  }

  function paintDots() {
    Array.prototype.forEach.call(dots.children, function (d, i) {
      d.setAttribute('aria-current', String(i === state.step));
      d.classList.toggle('done', i < state.step);
    });
  }

  function render(direction) {
    stage.innerHTML = SCREENS[state.step](state);
    stage.classList.toggle('back', direction === -1);
    hint.textContent = state.step === 3 && state.badge < 3 ? HINTS[3] : HINTS[state.step];
    paintDots();
    stage.scrollTop = 0;
    if (state.step === 4) wireFinal();
  }

  /** Badges land one by one without replaying the whole screen. */
  function revealBadge() {
    var cards = stage.querySelectorAll('.rc-badge');
    if (!cards.length) return render(1);
    for (var i = 0; i < cards.length; i++) cards[i].classList.toggle('on', i < state.badge);
    var tally = stage.querySelector('.rc-tally');
    if (tally) {
      if (state.badge >= 3) {
        tally.textContent = '✦ 3 new badges added to your collection';
        tally.style.color = '';
      } else {
        tally.textContent = state.badge + ' of 3 unlocked';
      }
    }
    hint.textContent = state.badge < 3 ? HINTS[3] : HINTS[4];
  }

  function go(delta) {
    /* screen 4 holds us while the badges come out */
    if (state.step === 3) {
      if (delta > 0 && state.badge < 3) { state.badge++; return revealBadge(); }
      if (delta < 0 && state.badge > 0) { state.badge--; return revealBadge(); }
    }
    var next = state.step + delta;
    if (next < 0 || next >= STEPS) return;
    if (next === 3 && delta < 0) state.badge = 3;     /* coming back: all shown */
    if (next === 3 && delta > 0) state.badge = 0;
    state.step = next;
    render(delta);
  }

  function jump(step) {
    if (step === state.step) return;
    var delta = step > state.step ? 1 : -1;
    state.badge = step === 3 ? (delta > 0 ? 0 : 3) : state.badge;
    state.step = step;
    render(delta);
  }

  function open() {
    state.step = 0;
    state.badge = 0;
    state.open = true;
    rc.hidden = false;
    document.body.style.overflow = 'hidden';
    render(1);
    document.getElementById('rcClose').focus();
  }

  function close() {
    state.open = false;
    rc.hidden = true;
    document.body.style.overflow = '';
    var launch = document.getElementById('playRecap');
    if (launch) launch.focus();
  }

  /* ---------- the last screen's buttons ---------------------------------- */

  function collected() {
    try {
      return JSON.parse(localStorage.getItem('spendy-collection') || '[]');
    } catch (e) {
      return [];
    }
  }

  function wireFinal() {
    var collect = document.getElementById('rcCollect');
    var share = document.getElementById('rcShare');
    var already = collected().indexOf('2026-09') >= 0;

    if (already) {
      collect.classList.add('got');
      collect.textContent = '✓ In your collection';
    }

    collect.addEventListener('click', function () {
      var have = collected();
      if (have.indexOf('2026-09') < 0) have.push('2026-09');
      try {
        localStorage.setItem('spendy-collection', JSON.stringify(have));
      } catch (e) { /* private window — the button still does its bit */ }
      collect.classList.add('got');
      collect.textContent = '✓ In your collection';
      toast(have.length === 1
        ? 'The Weekend Menace joins your collection. 1 Spendy so far.'
        : 'The Weekend Menace joins your collection. ' + have.length + ' Spendys so far.');
    });

    share.addEventListener('click', function () {
      toast('Your Spendy stayed right here — it’s a prototype.');
    });
  }

  var toastEl = document.getElementById('toast');
  var toastTimer;
  function toast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('up');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('up'); }, 2800);
  }

  /* ---------- navigation ------------------------------------------------- */

  document.getElementById('rcNext').addEventListener('click', function () { go(1); });
  document.getElementById('rcBack').addEventListener('click', function () { go(-1); });
  document.getElementById('rcClose').addEventListener('click', close);
  dots.addEventListener('click', function (e) {
    var dot = e.target.closest('.rc-dot');
    if (dot) jump(+dot.dataset.step);
  });

  document.addEventListener('keydown', function (e) {
    if (!state.open) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });

  /* swipe sideways, the way a story should move */
  var swipe = null;
  rc.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button')) return;
    swipe = { x: e.clientX, y: e.clientY };
  });
  rc.addEventListener('pointerup', function (e) {
    if (!swipe) return;
    var dx = e.clientX - swipe.x;
    var dy = e.clientY - swipe.y;
    swipe = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  });

  var launch = document.getElementById('playRecap');
  if (launch) launch.addEventListener('click', open);
})();
