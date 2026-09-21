/**
 * Money Calendar — mock ledger for September 2026.
 *
 * Hand-tuned fake data: one person, one month in Sydney. The month is built to
 * exact totals so the recap numbers always reconcile with the calendar:
 *   $2,796.00 spent · 77 transactions · 6 no-spend days
 *   Saturday 12 September is the single most expensive day at $486.00
 *   Uber is the repeat offender at 8 rides
 * August 2026 ($3,177) exists only as the previous-month comparison.
 */

(function (global) {
  'use strict';

const MONTH = { year: 2026, month: 9, label: 'September 2026', short: 'SEPTEMBER' };

/** Previous month's total, used for the "vs last month" line. */
const PREVIOUS_MONTH_TOTAL = 3177;

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
  { id: 't001', day:  1, time: '12:59', merchant: 'Birthday gift',             emoji: '🎁', category: 'Gifts',     amount:    93.28 },
  { id: 't002', day:  1, time: '19:43', merchant: 'Chat Thai',                 emoji: '🍜', category: 'Food',      amount:    24.50 },
  { id: 't003', day:  3, time: '07:26', merchant: 'Train to Newcastle',        emoji: '🚄', category: 'Travel',    amount:    29.00 },
  { id: 't004', day:  3, time: '16:39', merchant: 'Gelato Messina',            emoji: '🍨', category: 'Food',      amount:    12.13 },
  { id: 't005', day:  4, time: '08:30', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    29.62 },
  { id: 't006', day:  4, time: '10:07', merchant: 'Lune',                      emoji: '🥐', category: 'Food',      amount:    14.93 },
  { id: 't007', day:  4, time: '11:29', merchant: 'Bunnings',                  emoji: '🪴', category: 'Home',      amount:    23.50 },
  { id: 't008', day:  4, time: '13:09', merchant: 'Poke bowl',                 emoji: '🥗', category: 'Food',      amount:    23.80 },
  { id: 't009', day:  5, time: '10:52', merchant: 'Lune',                      emoji: '🥐', category: 'Food',      amount:    13.73 },
  { id: 't010', day:  5, time: '11:16', merchant: 'Muji',                      emoji: '✏', category: 'Shopping',  amount:    22.00 },
  { id: 't011', day:  5, time: '12:25', merchant: 'Bunnings',                  emoji: '🪴', category: 'Home',      amount:    39.50 },
  { id: 't012', day:  5, time: '15:25', merchant: 'Better Read Than Dead',     emoji: '📚', category: 'Gifts',     amount:    30.28 },
  { id: 't013', day:  5, time: '16:32', merchant: 'Gelato Messina',            emoji: '🍨', category: 'Food',      amount:    10.45 },
  { id: 't014', day:  6, time: '08:47', merchant: 'Sonoma',                    emoji: '🥐', category: 'Food',      amount:     9.60 },
  { id: 't015', day:  6, time: '11:19', merchant: 'Woolworths',                emoji: '🥬', category: 'Groceries', amount:    42.97 },
  { id: 't016', day:  6, time: '18:43', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    19.09 },
  { id: 't017', day:  7, time: '08:27', merchant: 'Reuben Hills',              emoji: '☕', category: 'Food',      amount:     6.14 },
  { id: 't018', day:  7, time: '17:14', merchant: 'Sauna House',               emoji: '🔥', category: 'Wellness',  amount:    42.93 },
  { id: 't019', day:  8, time: '20:11', merchant: 'Chin Chin',                 emoji: '🍜', category: 'Food',      amount:    90.42 },
  { id: 't020', day: 10, time: '20:31', merchant: 'Gelato Messina',            emoji: '🍨', category: 'Food',      amount:    10.03 },
  { id: 't021', day: 11, time: '10:09', merchant: 'Sonoma',                    emoji: '🥐', category: 'Food',      amount:     8.90 },
  { id: 't022', day: 11, time: '11:45', merchant: 'Incu',                      emoji: '🧥', category: 'Shopping',  amount:   184.17 },
  { id: 't023', day: 11, time: '17:38', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    28.50 },
  { id: 't024', day: 11, time: '21:44', merchant: 'Wine bar',                  emoji: '🍷', category: 'Fun',       amount:    41.33 },
  { id: 't025', day: 11, time: '23:17', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    12.11 },
  { id: 't026', day: 12, time: '09:42', merchant: 'Single O',                  emoji: '☕', category: 'Food',      amount:     6.50 },
  { id: 't027', day: 12, time: '10:55', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    24.00 },
  { id: 't028', day: 12, time: '12:40', merchant: 'Lunch at Ho Jiak',          emoji: '🍜', category: 'Food',      amount:    68.00 },
  { id: 't029', day: 12, time: '14:20', merchant: 'COS',                       emoji: '🛍', category: 'Shopping',  amount:   248.00 },
  { id: 't030', day: 12, time: '19:05', merchant: 'Dinner at Ester',           emoji: '🍷', category: 'Fun',       amount:   112.00 },
  { id: 't031', day: 12, time: '23:18', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    27.50 },
  { id: 't032', day: 13, time: '10:34', merchant: 'Sauna House',               emoji: '🔥', category: 'Wellness',  amount:    42.50 },
  { id: 't033', day: 13, time: '10:58', merchant: 'Norton St Grocer',          emoji: '🧀', category: 'Groceries', amount:    20.41 },
  { id: 't034', day: 13, time: '15:09', merchant: 'Reuben Hills',              emoji: '☕', category: 'Food',      amount:     6.64 },
  { id: 't035', day: 14, time: '09:07', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    11.00 },
  { id: 't036', day: 14, time: '12:21', merchant: 'Chat Thai',                 emoji: '🍜', category: 'Food',      amount:    32.32 },
  { id: 't037', day: 15, time: '10:22', merchant: 'Fish market',               emoji: '🐟', category: 'Groceries', amount:    31.00 },
  { id: 't038', day: 15, time: '12:05', merchant: 'Chat Thai',                 emoji: '🍜', category: 'Food',      amount:    27.60 },
  { id: 't039', day: 15, time: '14:47', merchant: 'Reuben Hills',              emoji: '☕', category: 'Food',      amount:     7.01 },
  { id: 't040', day: 16, time: '21:56', merchant: 'Gelato Messina',            emoji: '🍨', category: 'Food',      amount:    10.47 },
  { id: 't041', day: 18, time: '12:23', merchant: 'Card & wrap',               emoji: '💌', category: 'Gifts',     amount:     9.86 },
  { id: 't042', day: 18, time: '15:25', merchant: 'Tokyo Lamington',           emoji: '🍩', category: 'Food',      amount:     7.08 },
  { id: 't043', day: 18, time: '16:14', merchant: 'Bourke St Bakery',          emoji: '🥐', category: 'Food',      amount:     7.75 },
  { id: 't044', day: 18, time: '17:26', merchant: 'Train to Newcastle',        emoji: '🚄', category: 'Travel',    amount:    37.26 },
  { id: 't045', day: 19, time: '08:47', merchant: 'Bourke St Bakery',          emoji: '🥐', category: 'Food',      amount:    12.87 },
  { id: 't046', day: 19, time: '12:55', merchant: 'IKEA',                      emoji: '🪑', category: 'Home',      amount:   100.39 },
  { id: 't047', day: 19, time: '14:38', merchant: 'Reuben Hills',              emoji: '☕', category: 'Food',      amount:     6.78 },
  { id: 't048', day: 19, time: '15:22', merchant: 'Kmart',                     emoji: '🕯', category: 'Home',      amount:    25.50 },
  { id: 't049', day: 19, time: '15:41', merchant: 'Aesop',                     emoji: '🧴', category: 'Shopping',  amount:    59.00 },
  { id: 't050', day: 19, time: '22:10', merchant: 'Wine bar',                  emoji: '🍷', category: 'Fun',       amount:    70.67 },
  { id: 't051', day: 20, time: '15:36', merchant: 'Gelato Messina',            emoji: '🍨', category: 'Food',      amount:    10.16 },
  { id: 't052', day: 20, time: '18:42', merchant: 'Norton St Grocer',          emoji: '🧀', category: 'Groceries', amount:    29.00 },
  { id: 't053', day: 21, time: '11:06', merchant: 'Fish market',               emoji: '🐟', category: 'Groceries', amount:    27.00 },
  { id: 't054', day: 21, time: '11:45', merchant: 'Kmart',                     emoji: '🕯', category: 'Home',      amount:    21.11 },
  { id: 't055', day: 21, time: '20:03', merchant: 'Ho Jiak',                   emoji: '🍜', category: 'Food',      amount:    64.50 },
  { id: 't056', day: 23, time: '09:30', merchant: 'Lune',                      emoji: '🥐', category: 'Food',      amount:    11.06 },
  { id: 't057', day: 23, time: '14:06', merchant: 'Reuben Hills',              emoji: '☕', category: 'Food',      amount:     8.22 },
  { id: 't058', day: 25, time: '16:16', merchant: 'Card & wrap',               emoji: '💌', category: 'Gifts',     amount:    15.83 },
  { id: 't059', day: 25, time: '18:54', merchant: 'Uber',                      emoji: '🚕', category: 'Transport', amount:    18.43 },
  { id: 't060', day: 25, time: '20:07', merchant: 'Ho Jiak',                   emoji: '🍜', category: 'Food',      amount:    46.47 },
  { id: 't061', day: 25, time: '20:12', merchant: 'Mary\'s',                   emoji: '🍔', category: 'Food',      amount:    29.50 },
  { id: 't062', day: 26, time: '11:23', merchant: 'Airbnb Kangaroo Valley',    emoji: '🏨', category: 'Travel',    amount:   113.24 },
  { id: 't063', day: 26, time: '11:57', merchant: 'Glue Store',                emoji: '👟', category: 'Shopping',  amount:    78.83 },
  { id: 't064', day: 26, time: '12:12', merchant: 'Cornersmith',               emoji: '🥪', category: 'Food',      amount:    23.27 },
  { id: 't065', day: 26, time: '15:26', merchant: 'Better Read Than Dead',     emoji: '📚', category: 'Gifts',     amount:    28.75 },
  { id: 't066', day: 26, time: '17:18', merchant: 'Opal top-up',               emoji: '🚇', category: 'Transport', amount:    19.75 },
  { id: 't067', day: 26, time: '21:08', merchant: 'Ho Jiak',                   emoji: '🍜', category: 'Food',      amount:    64.41 },
  { id: 't068', day: 27, time: '08:18', merchant: 'Lune',                      emoji: '🥐', category: 'Food',      amount:    11.83 },
  { id: 't069', day: 27, time: '16:34', merchant: 'Train to Newcastle',        emoji: '🚄', category: 'Travel',    amount:    34.50 },
  { id: 't070', day: 27, time: '17:19', merchant: 'Massage',                   emoji: '💆', category: 'Wellness',  amount:    95.57 },
  { id: 't071', day: 27, time: '19:16', merchant: 'Woolworths',                emoji: '🥬', category: 'Groceries', amount:    30.12 },
  { id: 't072', day: 28, time: '10:12', merchant: 'Fish market',               emoji: '🐟', category: 'Groceries', amount:    34.50 },
  { id: 't073', day: 28, time: '10:54', merchant: 'Sonoma',                    emoji: '🥐', category: 'Food',      amount:    14.21 },
  { id: 't074', day: 28, time: '18:00', merchant: 'Sauna House',               emoji: '🔥', category: 'Wellness',  amount:    47.00 },
  { id: 't075', day: 28, time: '19:27', merchant: 'Mary\'s',                   emoji: '🍔', category: 'Food',      amount:    27.00 },
  { id: 't076', day: 30, time: '09:00', merchant: 'Lune',                      emoji: '🥐', category: 'Food',      amount:    10.23 },
  { id: 't077', day: 30, time: '14:22', merchant: 'Single O',                  emoji: '☕', category: 'Food',      amount:     6.49 },
];

  global.MC_DATA = { MONTH, PREVIOUS_MONTH_TOTAL, CATEGORIES, FILTERS, TRANSACTIONS };
})(window);
