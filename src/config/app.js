module.exports = {
  intervals: { // in MS
    syncInfo: 5000,
    chartInfo: 30000,
    myOrderInfo: 10000,
    activeOrderInfo: 30000,
    fulfilledOrderInfo: 30000,
    canceledOrderInfo: 30000,
    buyOrderInfo: 30000,
    myTradeInfo: 3000,
    fundRedeemInfo: 3000,
    sellHistoryInfo: 30000,
    buyHistoryInfo: 30000,
    sellOrderInfo: 30000,
    selectedOrderInfo: 30000,
    marketInfo: 30000,
    tooltipDelay: 300,
    snackbarLong: 5000,
    snackbarShort: 2000,
  },
  defaults: {
    averageBlockTime: 142.01324503311258,
    unlockWalletMins: 1440,
  },
  maxTransactionFee: 0.1,
  faqUrls: {
    'en-US': 'https://www.runebase.io/exchange/faq',
  },
  debug: {
    // Set to false if in test environment and Insight API is down
    // and loading screen is blocking the view.
    showAppLoad: true,
  },
};
