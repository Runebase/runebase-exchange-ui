module.exports = {
  Routes: {
    EXCHANGE: '/',
    SETTINGS: '/settings',
    WALLET: '/wallet',
    ACTIVITY_HISTORY: '/activities/history',
  },

  Phases: {
    UNCONFIRMED: 'UNCONFIRMED', // BETTING
    BETTING: 'BETTING',
    PENDING: 'PENDING', // VOTING
    WITHDRAWING: 'WITHDRAWING',
  },

  EventWarningType: {
    INFO: 'INFO',
    ERROR: 'ERROR',
    HIGHLIGHT: 'HIGHLIGHT',
  },

  /* GraphQL Constants */
  Token: {
    RUNES: 'RUNES',
    PRED: 'PRED',
    FUN: 'FUN',
  },

  TransactionType: {
    TRANSFER: 'TRANSFER',
    DEPOSITEXCHANGE: 'DEPOSITEXCHANGE',
    WITHDRAWEXCHANGE: 'WITHDRAWEXCHANGE',
    BUYORDER: 'BUYORDER',
    SELLORDER: 'SELLORDER',
    CANCELORDER: 'CANCELORDER',
    EXECUTEORDER: 'EXECUTEORDER',
  },

  TransactionStatus: {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAIL: 'FAIL', // not used
  },

  SortBy: {
    DEFAULT: 'DESC',
    ASCENDING: 'ASC',
    DESCENDING: 'DESC',
  },
};
