import _ from 'lodash';

class GraphParser {
  static getParser(requestName) {
    const PARSER_MAPPINGS = {
      SyncInfo: this.parseSyncInfo,
      Transaction: this.parseTransaction,
      NewOrder: this.parseNewOrder,
      Trade: this.parseTrade,
      Market: this.parseMarket,
      FundRedeem: this.parseFundRedeem,
    };
    return PARSER_MAPPINGS[requestName];
  }

  static parseFundRedeem(data) {
    return data.map((entry) => ({
      txid: entry.txid,
      type: entry.type,
      token: entry.token,
      tokenName: entry.tokenName,
      status: entry.status,
      owner: entry.owner,
      time: entry.time,
      date: entry.date,
      amount: entry.amount,
      blockNum: entry.blockNum,
    }));
  }

  static parseNewOrder(data) {
    return data.map((entry) => ({
      txid: entry.txid,
      orderId: entry.orderId,
      owner: entry.owner,
      status: entry.status,
      type: entry.type,
      token: entry.token,
      tokenName: entry.tokenName,
      orderType: entry.orderType,
      price: entry.price,
      sellToken: entry.sellToken,
      buyToken: entry.buyToken,
      priceMul: entry.priceMul,
      priceDiv: entry.priceDiv,
      time: entry.time,
      amount: entry.amount,
      startAmount: entry.startAmount,
      blockNum: entry.blockNum,
    }));
  }

  static parseMarket(data) {
    return data.map((entry) => ({
      market: entry.market,
      tokenName: entry.tokenName,
      price: entry.price,
      change: entry.change,
      volume: entry.volume,
    }));
  }

  static parseTrade(data) {
    return data.map((entry) => ({
      txid: entry.txid,
      type: entry.type,
      date: entry.date,
      from: entry.from,
      to: entry.to,
      status: entry.status,
      soldTokens: entry.soldTokens,
      boughtTokens: entry.boughtTokens,
      tokenName: entry.tokenName,
      orderType: entry.orderType,
      price: entry.price,
      orderId: entry.orderId,
      time: entry.time,
      amount: entry.amount,
      blockNum: entry.blockNum,
    }));
  }

  static parseSyncInfo(data) {
    return _.pick(data, [
      'syncBlockNum',
      'syncBlockTime',
      'syncPercent',
      'peerNodeCount',
      'addressBalances',
    ]);
  }

  static parseTransaction(data) {
    return data.map((entry) => ({
      type: entry.type,
      txid: entry.txid,
      status: entry.status,
      createdTime: entry.createdTime,
      blockNum: entry.blockNum,
      blockTime: entry.blockTime,
      gasLimit: entry.gasLimit,
      gasPrice: entry.gasPrice,
      gasUsed: entry.gasUsed,
      version: entry.version,
      senderAddress: entry.senderAddress,
      receiverAddress: entry.receiverAddress,
      name: entry.name,
      token: entry.token,
      amount: entry.amount,
    }));
  }
}

export default GraphParser;
