/**
 * Money Calendar — mock ledger for September 2026.
 *
 * Hand-tuned fake data: one person, one month in Sydney. The month is built to
 * exact totals so the recap numbers always reconcile with the calendar:
 *   $3,148.00 spent · 83 transactions · 6 no-spend days
 *   Saturday 12 September is the single most expensive day at $486.00
 *   Uber is the repeat offender at 14 rides
 * August 2026 ($3,577) exists only as the previous-month comparison.
 */

(function (global) {
  'use strict';

const MONTH = { year: 2026, month: 9, label: 'September 2026', short: 'SEPTEMBER' };

/** Previous month's total, used for the "vs last month" line. */
const PREVIOUS_MONTH_TOTAL = 3577;

/** Display order + identity for every category in the ledger. */
const CATEGORIES = {
  Food:      { emoji: '\u{1F35C}', tone: 'rose'   },
  Shopping:  { emoji: '\u{1F6CD}\uFE0F', tone: 'plum'   },
  Transport: { emoji: '\u{1F695}', tone: 'ink'    },
  Wellness:  { emoji: '\u{1F486}', tone: 'sage'   },
  Fun:       { emoji: '\u{1F377}', tone: 'punch'  },
  Groceries: { emoji: '\u{1F96C}', tone: 'sage'   },
  Home:      { emoji: '\u{1F56F}\uFE0F', tone: 'amber'  },
  Travel:    { emoji: '\u2708\uFE0F', tone: 'ink'    },
  Gifts:     { emoji: '\u{1F381}', tone: 'amber'  },
};

/** The filter chips shown above the calendar. */
const FILTERS = ['All', 'Food', 'Shopping', 'Transport', 'Fun', 'Wellness'];

/** Every transaction, sorted by day then time. Amounts are AUD. */
const TRANSACTIONS = [
  { id: 't001', day:  1, time: '11:28', merchant: 'Birthday gift',             emoji: '🎁', category: 'Gifts',     amount:    59.00 },
  { id: 't002', day:  1, time: '13:35', merchant: 'Single O',                  emoji: '☕', category: 'Food',      amount:     7.75 },
  { id: 't003', day:  1, time: '14:46', merchant: 'Reuben Hills',              emoji: '☕', category: 'Food',      amount:     5.99 },
  { id: 't004', day:  1, time: '23:30', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    22.00 },
  { id: 't005', day:  3, time: '15:34', merchant: 'Gelato Messina',            emoji: '🍨', category: 'Food',      amount:     9.00 },
  { id: 't006', day:  3, time: '19:49', merchant: 'Chat Thai',                 emoji: '🍜', category: 'Food',      amount:    40.17 },
  { id: 't007', day:  4, time: '19:06', merchant: 'Mary\'s',                   emoji: '🍔', category: 'Food',      amount:    31.45 },
  { id: 't008', day:  5, time: '10:53', merchant: 'Bunnings',                  emoji: '🪴', category: 'Home',      amount:    49.89 },
  { id: 't009', day:  5, time: '14:20', merchant: 'Vans',                      emoji: '👟', category: 'Shopping',  amount:   103.32 },
  { id: 't010', day:  5, time: '18:39', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    22.79 },
  { id: 't011', day:  5, time: '19:27', merchant: 'Mary\'s',                   emoji: '🍔', category: 'Food',      amount:    36.00 },
  { id: 't012', day:  5, time: '20:53', merchant: 'Chin Chin',                 emoji: '🍜', category: 'Food',      amount:    61.50 },
  { id: 't013', day:  5, time: '22:56', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    27.38 },
  { id: 't014', day:  6, time: '09:27', merchant: 'Sonoma',                    emoji: '🥐', category: 'Food',      amount:    13.15 },
  { id: 't015', day:  6, time: '09:30', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    16.04 },
  { id: 't016', day:  6, time: '10:13', merchant: 'Woolworths',                emoji: '🥬', category: 'Groceries', amount:    72.62 },
  { id: 't017', day:  6, time: '11:50', merchant: 'Flowers',                   emoji: '💐', category: 'Home',      amount:    46.50 },
  { id: 't018', day:  6, time: '14:24', merchant: 'Single O',                  emoji: '☕', category: 'Food',      amount:     6.91 },
  { id: 't019', day:  6, time: '17:38', merchant: 'Leather journal',           emoji: '📓', category: 'Gifts',     amount:    66.68 },
  { id: 't020', day:  7, time: '20:53', merchant: 'Ho Jiak',                   emoji: '🍜', category: 'Food',      amount:    48.36 },
  { id: 't021', day:  7, time: '21:30', merchant: 'Gelato Messina',            emoji: '🍨', category: 'Food',      amount:     8.98 },
  { id: 't022', day:  8, time: '15:05', merchant: 'Tokyo Lamington',           emoji: '🍩', category: 'Food',      amount:    10.44 },
  { id: 't023', day: 10, time: '11:16', merchant: 'Fish market',               emoji: '🐟', category: 'Groceries', amount:    30.57 },
  { id: 't024', day: 10, time: '12:11', merchant: 'Poke bowl',                 emoji: '🥗', category: 'Food',      amount:    23.50 },
  { id: 't025', day: 10, time: '18:34', merchant: 'Humming Puppy',             emoji: '🧘', category: 'Wellness',  amount:    32.63 },
  { id: 't026', day: 11, time: '09:41', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    25.00 },
  { id: 't027', day: 11, time: '16:23', merchant: 'Tokyo Lamington',           emoji: '🍩', category: 'Food',      amount:     9.29 },
  { id: 't028', day: 11, time: '18:00', merchant: 'Better Read Than Dead',     emoji: '📚', category: 'Gifts',     amount:    52.12 },
  { id: 't029', day: 11, time: '18:36', merchant: 'Chin Chin',                 emoji: '🍜', category: 'Food',      amount:    64.22 },
  { id: 't030', day: 12, time: '09:42', merchant: 'Single O',                  emoji: '☕', category: 'Food',      amount:     6.50 },
  { id: 't031', day: 12, time: '10:55', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    24.00 },
  { id: 't032', day: 12, time: '12:40', merchant: 'Lunch at Ho Jiak',          emoji: '🍜', category: 'Food',      amount:    68.00 },
  { id: 't033', day: 12, time: '14:20', merchant: 'COS',                       emoji: '🛍', category: 'Shopping',  amount:   248.00 },
  { id: 't034', day: 12, time: '19:05', merchant: 'Dinner at Ester',           emoji: '🍷', category: 'Fun',       amount:   112.00 },
  { id: 't035', day: 12, time: '23:18', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    27.50 },
  { id: 't036', day: 13, time: '09:53', merchant: 'Sonoma',                    emoji: '🥐', category: 'Food',      amount:    11.99 },
  { id: 't037', day: 13, time: '09:58', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    22.19 },
  { id: 't038', day: 13, time: '10:38', merchant: 'Bunnings',                  emoji: '🪴', category: 'Home',      amount:    59.19 },
  { id: 't039', day: 13, time: '10:45', merchant: 'Airbnb Kangaroo Valley',    emoji: '🏨', category: 'Travel',    amount:   191.26 },
  { id: 't040', day: 13, time: '11:34', merchant: 'Norton St Grocer',          emoji: '🧀', category: 'Groceries', amount:    30.50 },
  { id: 't041', day: 13, time: '16:34', merchant: 'Tokyo Lamington',           emoji: '🍩', category: 'Food',      amount:     9.94 },
  { id: 't042', day: 13, time: '17:38', merchant: 'Reformer pilates',          emoji: '🤸', category: 'Wellness',  amount:    39.40 },
  { id: 't043', day: 13, time: '20:13', merchant: 'Golden Age Cinema',         emoji: '🎬', category: 'Fun',       amount:    27.71 },
  { id: 't044', day: 14, time: '07:28', merchant: 'Bourke St Bakery',          emoji: '🥐', category: 'Food',      amount:    10.96 },
  { id: 't045', day: 14, time: '11:01', merchant: 'Harris Farm',               emoji: '🍓', category: 'Groceries', amount:    35.31 },
  { id: 't046', day: 14, time: '13:30', merchant: 'Chat Thai',                 emoji: '🍜', category: 'Food',      amount:    38.50 },
  { id: 't047', day: 15, time: '13:22', merchant: 'Cornersmith',               emoji: '🥪', category: 'Food',      amount:    24.77 },
  { id: 't048', day: 16, time: '10:54', merchant: 'Sauna House',               emoji: '🔥', category: 'Wellness',  amount:    50.28 },
  { id: 't049', day: 16, time: '21:08', merchant: 'Gelato Messina',            emoji: '🍨', category: 'Food',      amount:     8.22 },
  { id: 't050', day: 18, time: '09:15', merchant: 'Single O',                  emoji: '☕', category: 'Food',      amount:     6.13 },
  { id: 't051', day: 18, time: '10:09', merchant: 'Sonoma',                    emoji: '🥐', category: 'Food',      amount:    10.54 },
  { id: 't052', day: 18, time: '21:00', merchant: 'Golden Age Cinema',         emoji: '🎬', category: 'Fun',       amount:    27.83 },
  { id: 't053', day: 19, time: '10:51', merchant: 'Bunnings',                  emoji: '🪴', category: 'Home',      amount:    42.50 },
  { id: 't054', day: 19, time: '13:52', merchant: 'Repressed Records',         emoji: '🎧', category: 'Fun',       amount:    35.00 },
  { id: 't055', day: 19, time: '15:21', merchant: 'Uniqlo',                    emoji: '👕', category: 'Shopping',  amount:    74.00 },
  { id: 't056', day: 19, time: '16:37', merchant: 'Gelato Messina',            emoji: '🍨', category: 'Food',      amount:     9.52 },
  { id: 't057', day: 19, time: '22:10', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    14.58 },
  { id: 't058', day: 20, time: '10:59', merchant: 'Sonoma',                    emoji: '🥐', category: 'Food',      amount:     8.92 },
  { id: 't059', day: 20, time: '17:33', merchant: 'Reformer pilates',          emoji: '🤸', category: 'Wellness',  amount:    41.49 },
  { id: 't060', day: 20, time: '18:14', merchant: 'Norton St Grocer',          emoji: '🧀', category: 'Groceries', amount:    38.00 },
  { id: 't061', day: 21, time: '08:46', merchant: 'Train to Newcastle',        emoji: '🚄', category: 'Travel',    amount:    41.74 },
  { id: 't062', day: 21, time: '13:04', merchant: 'Mary\'s',                   emoji: '🍔', category: 'Food',      amount:    33.68 },
  { id: 't063', day: 21, time: '16:43', merchant: 'Card & wrap',               emoji: '💌', category: 'Gifts',     amount:    15.20 },
  { id: 't064', day: 21, time: '16:45', merchant: 'Kmart',                     emoji: '🕯', category: 'Home',      amount:    29.92 },
  { id: 't065', day: 23, time: '08:28', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    12.98 },
  { id: 't066', day: 23, time: '21:49', merchant: 'Gelato Messina',            emoji: '🍨', category: 'Food',      amount:     7.94 },
  { id: 't067', day: 23, time: '22:39', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    31.64 },
  { id: 't068', day: 25, time: '07:17', merchant: 'Bourke St Bakery',          emoji: '🥐', category: 'Food',      amount:    14.80 },
  { id: 't069', day: 25, time: '15:18', merchant: 'Single O',                  emoji: '☕', category: 'Food',      amount:     7.50 },
  { id: 't070', day: 26, time: '10:33', merchant: 'Tokyo Lamington',           emoji: '🍩', category: 'Food',      amount:     9.63 },
  { id: 't071', day: 26, time: '12:36', merchant: 'COS',                       emoji: '🛍', category: 'Shopping',  amount:   105.35 },
  { id: 't072', day: 26, time: '14:40', merchant: 'Repressed Records',         emoji: '🎧', category: 'Fun',       amount:    40.46 },
  { id: 't073', day: 26, time: '16:50', merchant: 'Sauna House',               emoji: '🔥', category: 'Wellness',  amount:    48.70 },
  { id: 't074', day: 26, time: '20:44', merchant: 'Chin Chin',                 emoji: '🍜', category: 'Food',      amount:    62.00 },
  { id: 't075', day: 27, time: '07:48', merchant: 'Humming Puppy',             emoji: '🧘', category: 'Wellness',  amount:    35.50 },
  { id: 't076', day: 27, time: '08:44', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    22.00 },
  { id: 't077', day: 27, time: '10:06', merchant: 'Harris Farm',               emoji: '🍓', category: 'Groceries', amount:    27.00 },
  { id: 't078', day: 27, time: '13:18', merchant: 'Cornersmith',               emoji: '🥪', category: 'Food',      amount:    22.86 },
  { id: 't079', day: 28, time: '08:46', merchant: 'Reuben Hills',              emoji: '☕', category: 'Food',      amount:     8.21 },
  { id: 't080', day: 28, time: '14:22', merchant: 'Vans',                      emoji: '👟', category: 'Shopping',  amount:   113.33 },
  { id: 't081', day: 30, time: '09:00', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    27.39 },
  { id: 't082', day: 30, time: '19:00', merchant: 'Ho Jiak',                   emoji: '🍜', category: 'Food',      amount:    52.68 },
  { id: 't083', day: 30, time: '22:22', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    19.51 },
];

  global.MC_DATA = { MONTH, PREVIOUS_MONTH_TOTAL, CATEGORIES, FILTERS, TRANSACTIONS };
})(window);
