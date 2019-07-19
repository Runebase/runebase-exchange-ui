/*
* Model for Trades
*
*
*/
export default class Trade {
  type = ''
  from = ''
  to = ''
  status = ''
  soldTokens = ''
  boughtTokens = ''
  tokenName = ''
  orderType = ''
  price = ''
  orderId = ''
  time = ''
  amount = ''
  blockNum = ''

  // for invalid option
  localizedInvalid = {};

  constructor(trade, app) {
    Object.assign(this, trade);
    this.app = app;
    this.type = trade.type;
    this.from = trade.from;
    this.to = trade.to;
    this.status = trade.status;
    this.soldTokens = trade.soldTokens;
    this.boughtTokens = trade.boughtTokens;
    this.tokenName = trade.tokenName;
    this.orderType = trade.orderType;
    this.price = trade.price;
    this.orderId = trade.orderId;
    this.time = trade.time;
    this.amount = trade.amount;
    this.blockNum = trade.blockNum;
    this.localizedInvalid = {
      en: 'Invalid',
      zh: '无效',
      ko: '무효의',
      parse(locale) {
        return this[locale.slice(0, 2)];
      },
    };
  }
}
