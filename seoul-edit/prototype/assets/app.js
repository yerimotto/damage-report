/**
 * The Seoul Edit — a capsule outfit planner for December in Seoul.
 *
 * One page, no framework, no build. Screens are drawn from SE_DATA plus
 * whatever the viewer has saved, and every tap is a data-* attribute handled
 * by one delegated listener. The current screen lives in memory only, so the
 * page never touches the URL or the browser's history.
 */
(function () {
  'use strict';

  var D = window.SE_DATA;
  /* The single-file build fills this with embedded copies of the images. */
  var IMAGES = window.SE_IMAGES || {};
  var CATEGORIES = ['Outer', 'Tops', 'Bottoms', 'Shoes', 'Bags', 'Extras'];
  var MIN_PIECES = 2;
  var STORE_KEY = 'seoul-edit-proto:v1';

  /* ---------- icons (lucide, inlined) ------------------------------------ */

  var ICONS = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
    snow: '<path d="M12 2v20M4.9 4.9l14.2 14.2M2 12h20M4.9 19.1 19.1 4.9M9 4l3 3 3-3M9 20l3-3 3 3M4 9l3 3-3 3M20 9l-3 3 3 3"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M17 5h4"/>',
    shirt: '<path d="M20.4 6.6 16 4a4 4 0 0 1-8 0L3.6 6.6a1 1 0 0 0-.5 1.2l1 3a1 1 0 0 0 1.3.6L7 11v9h10v-9l1.6.4a1 1 0 0 0 1.3-.6l1-3a1 1 0 0 0-.5-1.2z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    luggage: '<rect x="6" y="6" width="12" height="14" rx="2"/><path d="M9 6V3h6v3M10 10v6M14 10v6M8 20v1M16 20v1"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>'
  };
  function icon(name) {
    return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[name] + '</svg>';
  }

  /* ---------- little helpers --------------------------------------------- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }
  function src(piece) { return IMAGES[piece.image] || piece.image; }

  /** "−7° / 2°" → "−7° to 2°C" */
  function tempLabel(trip) {
    return trip.tempRange.split('/').map(function (s) { return s.trim(); }).join(' to ') + 'C';
  }

  /* ---------- stickers --------------------------------------------------- */

  /* Emoji are drawn as die-cut stickers: a white edge, a lip and a soft
     shadow (see .sticker). They're decoration, so screen readers skip them. */
  var CATEGORY_EMOJI = { All: '✨', Outer: '🧥', Tops: '👚', Bottoms: '👖', Shoes: '👢', Bags: '👜', Extras: '🧣' };

  function sticker(emoji, cls) {
    return '<span class="sticker' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + emoji + '</span>';
  }

  /** Snow when the lows drop below freezing, a scarf when it's cold, leaves when it's mild. */
  function weatherEmoji(trip) {
    var low = parseFloat(trip.tempRange.replace('−', '-'));
    return low < 0 ? '❄️' : low <= 10 ? '🧣' : '🍂';
  }

  /* ---------- state ------------------------------------------------------ */

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  var trips = D.TRIPS;
  function tripById(id) {
    for (var i = 0; i < trips.length; i++) if (trips[i].id === id) return trips[i];
    return null;
  }

  function load() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { /* private window or corrupt data */ }
    var list = saved && Array.isArray(saved.fits) ? saved.fits : [];
    /* Fits saved before there were several trips all belong to Seoul. */
    list.forEach(function (f) { if (!f.tripId) f.tripId = D.START_TRIP; });

    /* Each trip gets its starter fits once. A save from before trips existed
       already holds Seoul's, so only the newer trips are filled in; a trip
       whose fits the viewer has since deleted stays as they left it. */
    var seeded = saved && Array.isArray(saved.seeded) ? saved.seeded : saved && Array.isArray(saved.fits) ? [D.START_TRIP] : [];
    trips.forEach(function (t) {
      if (seeded.indexOf(t.id) !== -1) return;
      D.FITS.forEach(function (f) {
        if (f.tripId === t.id && !list.some(function (g) { return g.id === f.id; })) list.push(clone(f));
      });
      seeded.push(t.id);
    });

    var trip = saved && tripById(saved.tripId) ? saved.tripId : D.START_TRIP;
    return { fits: list, tripId: trip, seeded: seeded };
  }

  var pieces = D.PIECES;
  var byId = {};
  pieces.forEach(function (p) { byId[p.id] = p; });

  var loaded = load();
  var fits = loaded.fits;
  /* The trip shown on the home screen; new fits are added to it. */
  var tripId = loaded.tripId;
  var seeded = loaded.seeded;
  var route = { name: 'fits' };
  /* Which title word's trip menu is open: 'month', 'city' or null. */
  var menu = null;
  /* Set for one redraw after switching trip, so the trip's sticker pops in. */
  var justSwitched = false;
  /* The fit being built or edited; null outside the builder. */
  var draft = null;

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ fits: fits, tripId: tripId, seeded: seeded })); } catch (e) { /* storage blocked */ }
  }

  function trip() { return tripById(tripId); }
  function tripFits(id) {
    return fits.filter(function (f) { return f.tripId === (id || tripId); });
  }

  function fitById(id) {
    for (var i = 0; i < fits.length; i++) if (fits[i].id === id) return fits[i];
    return null;
  }
  function piecesOf(ids) {
    return ids.map(function (id) { return byId[id]; }).filter(Boolean);
  }
  function nextFitName() {
    var max = 0;
    tripFits().forEach(function (f) {
      var m = /^Fit (\d+)$/.exec(f.name);
      if (m) max = Math.max(max, Number(m[1]));
    });
    return 'Fit ' + (max + 1);
  }

  /** "Also worn in Fit 1 · 4", or "Only here". */
  function alsoWornIn(pieceId, fit) {
    var others = tripFits(fit.tripId).filter(function (f) { return f.id !== fit.id && f.pieceIds.indexOf(pieceId) !== -1; });
    if (!others.length) return 'Only here';
    var nums = others.map(function (f) { var m = /^Fit (\d+)$/.exec(f.name); return m && m[1]; });
    if (nums.every(Boolean)) return 'Also worn in Fit ' + nums.join(' · ');
    return 'Also worn in ' + others.map(function (f) { return f.name; }).join(' · ');
  }

  /* ---------- flat lay --------------------------------------------------- */

  /* Pinterest-style slots in a 384×340 box. Extras stack down a narrow
     right-hand column; a second piece in any other slot shifts by 22px. */
  var BOX_W = 384, BOX_H = 340, DUP = 22;
  var SLOTS = {
    Outer:   { x: 0,   y: 0,   w: 185, h: 215, z: 2 },
    Bags:    { x: 0,   y: 205, w: 140, h: 130, z: 3 },
    Shoes:   { x: 140, y: 262, w: 95,  h: 72,  z: 4 },
    Tops:    { x: 188, y: 0,   w: 135, h: 128, z: 3 },
    Bottoms: { x: 205, y: 118, w: 100, h: 222, z: 1 }
  };

  /** `fresh` is the id of a piece that just landed, so only it animates in. */
  function flatLay(list, empty, fresh) {
    if (!list.length) return '<div class="flatlay">' + (empty || '') + '</div>';
    var seen = {};
    var items = list.map(function (p) {
      var i = seen[p.category] || 0;
      seen[p.category] = i + 1;
      var s = p.category === 'Extras'
        ? { x: 326, y: 6 + i * 92, w: 56, h: 84, z: 5 }
        : { x: SLOTS[p.category].x + i * DUP, y: SLOTS[p.category].y + i * DUP,
            w: SLOTS[p.category].w, h: SLOTS[p.category].h, z: SLOTS[p.category].z + i };
      return '<div class="flatlay-item' + (p.id === fresh ? ' is-new' : '') + '" style="left:' + (s.x / BOX_W * 100) + '%;top:' +
        (s.y / BOX_H * 100) + '%;width:' + (s.w / BOX_W * 100) + '%;height:' + (s.h / BOX_H * 100) +
        '%;z-index:' + s.z + '"><img src="' + src(p) + '" alt="" draggable="false"></div>';
    });
    var names = list.map(function (p) { return esc(p.name); }).join(', ');
    return '<div class="flatlay" role="img" aria-label="Flat lay: ' + names + '">' + items.join('') + '</div>';
  }

  /* ---------- screens ---------------------------------------------------- */

  /* The home screen. The month and the city in the title are buttons: either
     one opens a menu of trips, led by whichever word was tapped. */
  function fitsScreen() {
    var t = trip();
    var dim = menu ? ' is-dim' : '';
    function word(kind, text) {
      var open = menu === kind;
      return '<button type="button" class="title-word' + (menu && !open ? ' is-dim' : '') + (open ? ' is-open' : '') + '" data-menu="' + kind + '"' +
        ' aria-haspopup="menu" aria-expanded="' + open + '" aria-label="' + esc(text) + ', change ' + (kind === 'month' ? 'month' : 'city') + '">' +
        esc(text) + '<span class="word-chev" aria-hidden="true">' + icon(open ? 'up' : 'down') + '</span></button>';
    }

    return '<header class="topbar label"><span>The Seoul Edit</span><span class="soft temp">' + sticker(weatherEmoji(t), 'sticker-xs') + tempLabel(t) + '</span></header>' +
      '<div class="trip-head">' +
        '<h1 class="serif trip-title">' + word('month', t.month) + '<span class="title-in' + dim + '"> in</span><br>' + word('city', t.city) +
          sticker(t.emoji, 'sticker-title' + dim + (justSwitched ? ' is-pop' : '')) + '</h1>' +
        (menu ? tripMenu() : '') +
      '</div>' +
      (menu ? '<div class="menu-scrim" data-action="close-menu"></div>' : '') +
      tripBody();
  }

  /** The trip menu. Each row leads with the word that was tapped (month or city). */
  function tripMenu() {
    var rows = trips.map(function (t) {
      var n = tripFits(t.id).length;
      var big = menu === 'month' ? t.month : t.city;
      var small = (menu === 'month' ? t.city : t.month) + ' · ' + tempLabel(t) + ' · ' + (n ? plural(n, 'fit') : 'no fits yet');
      var on = t.id === tripId;
      return '<button type="button" class="menu-item" role="menuitemradio" aria-checked="' + on + '" data-trip="' + t.id + '">' +
        sticker(t.emoji, 'sticker-menu') +
        '<span class="menu-text"><span class="serif menu-big">' + esc(big) + '</span><span class="menu-small">' + esc(small) + '</span></span>' +
        (on ? '<span class="menu-check">' + icon('check') + '</span>' : '') + '</button>';
    }).join('');
    return '<div class="trip-menu" role="menu" aria-label="Switch trip"><p class="label muted menu-head">Switch trip</p>' + rows + '</div>';
  }

  function tripBody() {
    var list = tripFits();
    var packed = {};
    list.forEach(function (f) { f.pieceIds.forEach(function (id) { packed[id] = true; }); });

    var cards = list.map(function (f) {
      return '<li><button type="button" class="fit-card" data-go="fit" data-id="' + f.id + '" aria-label="' + esc(f.name) + ', ' + plural(f.pieceIds.length, 'piece') + '">' +
        flatLay(piecesOf(f.pieceIds)) +
        '<p class="serif name">' + esc(f.name) + '</p>' +
        '<p class="count">' + plural(f.pieceIds.length, 'piece') + '</p></button></li>';
    }).join('');

    return '<p class="home-sub">' + (list.length
        ? plural(list.length, 'fit') + ' · ' + plural(Object.keys(packed).length, 'piece') + ' in the suitcase'
        : 'No fits for ' + esc(trip().city) + ' yet') + '</p>' +
      '<ul class="fit-grid">' +
        '<li class="new-fit-cell"><button type="button" class="new-fit" data-go="new">' + sticker('✨', 'sticker-corner') + icon('plus') + '<span class="label">New fit</span></button></li>' +
        cards +
      '</ul>';
  }

  /** Makes `id` the current trip, closes the menu and redraws in place. */
  function setTrip(id) {
    menu = null;
    if (tripById(id)) { justSwitched = id !== tripId; tripId = id; save(); }
    render(true);
    justSwitched = false;
    var w = screenEl.querySelector('.title-word');
    if (w) w.focus({ preventScroll: true });
  }

  function openMenu(kind) {
    menu = menu === kind ? null : kind;
    render(true);
    if (!menu) return;
    /* Hang the menu just under the word that opened it. */
    var btn = screenEl.querySelector('.title-word[data-menu="' + kind + '"]');
    var box = screenEl.querySelector('.trip-menu');
    box.style.top = (btn.offsetTop + btn.offsetHeight + 10) + 'px';
    var current = box.querySelector('[aria-checked="true"]') || box.querySelector('.menu-item');
    current.focus({ preventScroll: true });
  }

  function closeMenu() {
    var kind = menu;
    menu = null;
    render(true);
    var w = screenEl.querySelector('.title-word[data-menu="' + kind + '"]');
    if (w) w.focus({ preventScroll: true });
  }

  function detailScreen(fit) {
    var siblings = tripFits(fit.tripId);
    var index = siblings.indexOf(fit);
    var list = piecesOf(fit.pieceIds);
    var rows = list.map(function (p) {
      return '<li class="piece-row"><img class="cutout thumb" src="' + src(p) + '" alt="">' +
        '<div><p class="name">' + esc(p.name) + '</p><p class="worn">' + alsoWornIn(p.id, fit) + '</p></div></li>';
    }).join('');

    return '<header class="topbar">' +
        '<button type="button" class="icon-btn" data-go="fits" aria-label="Back to all fits">' + icon('back') + '</button>' +
        '<span class="label muted">' + esc(tripById(fit.tripId).city) + ' · ' + (index + 1) + ' of ' + siblings.length + '</span>' +
      '</header>' +
      '<h1 class="serif detail-name">' + esc(fit.name) + '</h1>' +
      '<span class="chip label">' + sticker(weatherEmoji(tripById(fit.tripId)), 'sticker-xs') + tempLabel(tripById(fit.tripId)) + '</span>' +
      (fit.note ? '<p class="vibe">' + esc(fit.note) + '</p>' : '') +
      '<div class="detail-lay">' + flatLay(list) + '</div>' +
      '<section class="piece-list"><h2 class="label">' + plural(list.length, 'piece') + '</h2><ul>' + rows + '</ul></section>' +
      '<div class="actionbar">' +
        '<button type="button" class="btn btn-secondary" data-go="fits">All fits</button>' +
        '<button type="button" class="btn btn-primary" data-go="edit" data-id="' + fit.id + '">Edit fit</button>' +
      '</div>';
  }

  function builderScreen() {
    var editing = draft.id ? fitById(draft.id) : null;
    var selected = piecesOf(draft.pieceIds);
    var n = draft.pieceIds.length;

    var filters = ['All'].concat(CATEGORIES).map(function (c) {
      return '<button type="button" class="filter label" data-filter="' + c + '" aria-pressed="' + (draft.filter === c) + '">' + sticker(CATEGORY_EMOJI[c], 'sticker-pill') + c + '</button>';
    }).join('');

    var grid = pieces.filter(function (p) { return draft.filter === 'All' || p.category === draft.filter; }).map(function (p) {
      var on = draft.pieceIds.indexOf(p.id) !== -1;
      return '<li><button type="button" class="closet-item" data-toggle="' + p.id + '" aria-pressed="' + on + '" aria-label="' + esc(p.name) + '">' +
        '<img class="cutout" src="' + src(p) + '" alt="" draggable="false">' +
        '<span class="name">' + esc(p.name) + '</span>' +
        '<span class="check">' + icon('check') + '</span></button></li>';
    }).join('');

    var del = editing
      ? '<button type="button" class="icon-btn delete-btn' + (draft.armed ? ' is-armed' : '') + '" data-action="delete" aria-label="' +
          (draft.armed ? 'Tap again to delete ' : 'Delete ') + esc(editing.name) + '">' + icon('trash') +
          (draft.armed ? '<span class="label">Delete</span>' : '') + '</button>'
      : '<span style="width:44px"></span>';

    return '<header class="topbar">' +
        '<button type="button" class="icon-btn" data-action="close" aria-label="Close">' + icon('close') + '</button>' +
        '<span class="label muted">' + (editing ? 'Edit fit' : 'New fit') + '</span>' + del +
      '</header>' +
      '<div class="builder-head"><h1 class="serif">' + esc(editing ? editing.name : nextFitName()) + '</h1>' +
        '<span class="label muted">' + plural(n, 'piece') + '</span></div>' +
      '<div class="preview">' + flatLay(selected,
        '<div class="preview-empty">' + sticker('🧥', 'sticker-hero') + '<p class="serif">Start with a coat</p><p>Tap pieces below to build the flat lay</p></div>', draft.fresh) + '</div>' +
      '<input class="vibe-input" id="vibe" maxlength="80" placeholder="The vibe, in one line" value="' + esc(draft.note) + '">' +
      '<div class="filters" role="group" aria-label="Filter by category">' + filters + '</div>' +
      '<ul class="closet-grid">' + grid + '</ul>' +
      '<div class="actionbar"><button type="button" class="btn btn-primary" data-action="save"' + (n < MIN_PIECES ? ' disabled' : '') + '>' +
        'Save fit · ' + plural(n, 'piece') + '</button></div>';
  }

  var SOON = {
    closet: ['Closet', 'Upload your own pieces, backgrounds removed for you.'],
    days: ['Days', 'A fit for every day of the trip, with no back-to-back repeats.'],
    pack: ['Pack', 'A packing list built from every fit, ticked off as you go.']
  };
  function soonScreen(tab) {
    return '<header class="topbar label">The Seoul Edit</header>' +
      '<h1 class="serif soon-title">' + SOON[tab][0] + '</h1>' +
      '<p class="label soon-tag">Coming soon</p>' +
      '<p class="soon-line">' + SOON[tab][1] + '</p>';
  }

  /* ---------- render + navigation --------------------------------------- */

  var screenEl = document.getElementById('screen');
  var tabbar = document.getElementById('tabbar');

  /** Draws the current screen. `swap` redraws in place (no entry animation, no scroll reset). */
  function render(swap) {
    var html;
    var fit = route.id ? fitById(route.id) : null;
    if (route.name === 'fit' && fit) html = detailScreen(fit);
    else if (route.name === 'builder') html = builderScreen();
    else if (SOON[route.name]) html = soonScreen(route.name);
    else { route = { name: 'fits' }; html = fitsScreen(); }

    /* A redraw in place keeps the filter row where the viewer scrolled it. */
    var row = swap && screenEl.querySelector('.filters');
    var rowScroll = row ? row.scrollLeft : 0;

    screenEl.classList.toggle('is-swap', !!swap);
    if (!swap) { screenEl.style.animation = 'none'; void screenEl.offsetWidth; screenEl.style.animation = ''; }
    screenEl.innerHTML = html;
    if (row) screenEl.querySelector('.filters').scrollLeft = rowScroll;

    var tab = route.name === 'fit' || route.name === 'builder' ? null : route.name;
    tabbar.hidden = !tab;
    tabbar.querySelectorAll('.tab').forEach(function (b) {
      if (b.dataset.go === tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (!swap) window.scrollTo(0, 0);
  }

  function go(name, id) {
    if (name === 'new' || name === 'edit') {
      var fit = id ? fitById(id) : null;
      draft = { id: fit ? fit.id : null, pieceIds: fit ? fit.pieceIds.slice() : [], note: fit ? fit.note : '', filter: 'All', armed: false, fresh: null };
      route = { name: 'builder' };
    } else {
      draft = null;
      menu = null;
      route = { name: name, id: id };
    }
    render(false);
  }

  function saveDraft() {
    if (draft.pieceIds.length < MIN_PIECES) return;
    var note = draft.note.trim();
    var fit = draft.id ? fitById(draft.id) : null;
    if (fit) {
      fit.pieceIds = draft.pieceIds.slice();
      fit.note = note;
    } else {
      fit = { id: 'fit-' + Date.now().toString(36), tripId: tripId, name: nextFitName(), note: note, dates: [], pieceIds: draft.pieceIds.slice() };
      fits.push(fit);
    }
    save();
    go('fit', fit.id);
  }

  function deleteDraft() {
    if (!draft.armed) { draft.armed = true; render(true); return; }
    fits = fits.filter(function (f) { return f.id !== draft.id; });
    save();
    go('fits');
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-go],[data-menu],[data-trip],[data-toggle],[data-filter],[data-action]');
    if (!t || t.disabled) return;

    if (t.dataset.go) return go(t.dataset.go, t.dataset.id);
    if (t.dataset.menu) return openMenu(t.dataset.menu);
    if (t.dataset.trip) return setTrip(t.dataset.trip);
    if (t.dataset.action === 'close-menu') return closeMenu();

    if (!draft) return;
    if (draft.armed && t.dataset.action !== 'delete') draft.armed = false;
    draft.fresh = null;

    if (t.dataset.toggle) {
      var id = t.dataset.toggle;
      var at = draft.pieceIds.indexOf(id);
      if (at === -1) { draft.pieceIds.push(id); draft.fresh = id; } else draft.pieceIds.splice(at, 1);
      render(true);
    } else if (t.dataset.filter) {
      draft.filter = t.dataset.filter;
      render(true);
    } else if (t.dataset.action === 'save') saveDraft();
    else if (t.dataset.action === 'delete') deleteDraft();
    else if (t.dataset.action === 'close') go(draft.id ? 'fit' : 'fits', draft.id || undefined);
  });

  /* Escape closes the trip menu; arrow keys move through it. */
  document.addEventListener('keydown', function (e) {
    if (!menu) return;
    if (e.key === 'Escape') { e.preventDefault(); return closeMenu(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      var items = Array.prototype.slice.call(screenEl.querySelectorAll('.menu-item'));
      var i = items.indexOf(document.activeElement);
      var next = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
      if (next) { e.preventDefault(); next.focus(); }
    }
  });

  /* The vibe line is typed straight into the draft, without a redraw. */
  document.addEventListener('input', function (e) {
    if (e.target.id === 'vibe' && draft) draft.note = e.target.value;
  });

  /* ---------- phone frame ----------------------------------------------- */

  /* On a phone the page is the app. On a desktop it opens standing in a
     device frame; the toggle switches to full width and remembers it. */
  var FRAME_KEY = 'seoul-edit-frame';
  var frameBtn = document.getElementById('frameToggle');
  var narrow = window.matchMedia('(max-width: 620px)');
  var framePref = 'phone';
  try { framePref = localStorage.getItem(FRAME_KEY) || 'phone'; } catch (e) { /* private window */ }

  function applyFrame() {
    var mode = narrow.matches ? 'phone' : framePref;
    document.documentElement.dataset.frame = mode;
    frameBtn.setAttribute('aria-pressed', String(mode === 'phone'));
    frameBtn.innerHTML = icon(mode === 'phone' ? 'monitor' : 'phone');
    frameBtn.setAttribute('aria-label', mode === 'phone' ? 'Show full width' : 'Show in a phone frame');
    frameBtn.title = frameBtn.getAttribute('aria-label');
  }
  frameBtn.addEventListener('click', function () {
    framePref = document.documentElement.dataset.frame === 'phone' ? 'wide' : 'phone';
    try { localStorage.setItem(FRAME_KEY, framePref); } catch (e) { /* private window */ }
    applyFrame();
  });
  if (narrow.addEventListener) narrow.addEventListener('change', applyFrame);
  applyFrame();

  tabbar.querySelectorAll('[data-icon]').forEach(function (el) { el.outerHTML = icon(el.dataset.icon); });
  render(false);
})();
