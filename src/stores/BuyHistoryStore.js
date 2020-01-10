import { observable, action, runInAction, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import { queryAllTrades } from '../network/graphql/queries';
import Trade from './models/Trade';
import apolloClient from '../network/graphql';
import { getOnBuyHistoryInfoSubscription } from '../network/graphql/subscriptions';

const INIT_VALUES = {
  loading: true,
  loaded: true, // INIT_VALUESial loaded state
  loadingMore: false, // for scroll laoding animation
  buyHistoryInfo: '',
  hasMoreBuyHistory: false, // has more buyOrders to fetch?
  hasLessBuyHistory: false, // has more buyOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loading = INIT_VALUES.loading

  @observable loaded = INIT_VALUES.loaded

  @observable loadingMore = INIT_VALUES.loadingMore

  @observable hasMoreBuyHistory = INIT_VALUES.hasMoreBuyHistory

  @observable hasLessBuyHistory = INIT_VALUES.hasLessBuyHistory

  @observable buyHistoryInfo = INIT_VALUES.buyHistoryInfo

  @computed get hasMore() {
    return this.hasMoreBuyHistory;
  }

  @computed get hasLess() {
    return this.hasLessBuyHistory;
  }

  @observable skip = INIT_VALUES.skip

  limit = 10

  constructor(app) {
    this.app = app;
    reaction(
      () => this.app.sortBy + this.app.wallet.addresses + this.app.refreshing,
      () => {
        if (this.app.ui.location === Routes.EXCHANGE) {
          this.init();
          this.getBuyHistoryInfo();
        }
      }
    );
  }

  @action
  init = async () => {
    Object.assign(this, INIT_VALUES); // reset all properties
    runInAction(() => {
      this.loading = false;
    });
  }

  getBuyHistoryInfo = async (limit = this.limit, skip = this.skip) => {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    try {
      const orderBy = { field: 'time', direction: 'DESC' };
      let buyHistoryInfo = [];
      const filters = [{ token: this.app.wallet.currentMarket, orderType: 'BUYORDER' }];
      buyHistoryInfo = await queryAllTrades(filters, orderBy, limit, skip);
      if (buyHistoryInfo.length < limit) this.hasMoreBuyHistory = false;
      if (buyHistoryInfo.length === limit) this.hasMoreBuyHistory = true;
      if (this.skip === 0) this.hasLessBuyHistory = false;
      if (this.skip > 0) this.hasLessBuyHistory = true;
      this.onBuyHistoryInfo(buyHistoryInfo);
      this.subscribeBuyHistoryInfo();
    } catch (error) {
      this.onBuyHistoryInfo({ error });
    }
  }

  @action
  onBuyHistoryInfo = (buyHistoryInfo) => {
    if (buyHistoryInfo.error) {
      console.error(buyHistoryInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(buyHistoryInfo, 'txid').map((trade) => new Trade(trade, this.app));
      const resultOrder = _.orderBy(result, ['time'], 'desc');
      this.buyHistoryInfo = resultOrder;
    }
  }


  @action
  onBuyHistoryInfoSub = (buyHistoryInfo) => {
    console.log('onBuyHistoryInfoSub');
    console.log(buyHistoryInfo);
    console.log(this.skip);
    if (buyHistoryInfo.error) {
      console.error(buyHistoryInfo.error.message); // eslint-disable-line no-console
    } else if (this.skip === 0) {
      if (this.buyHistoryInfo === undefined) {
        this.buyHistoryInfo = [];
      }
      const result = _.uniqBy(buyHistoryInfo, 'txid').map((trade) => new Trade(trade, this.app));
      result.forEach((trade) => {
        const index = _.findIndex(this.buyHistoryInfo, { txid: trade.txid });
        if (index === -1) {
          this.buyHistoryInfo.push(trade);
        } else {
          this.buyHistoryInfo[index] = trade;
        }
      });
      this.buyHistoryInfo = _.orderBy(this.buyHistoryInfo, ['time'], 'desc');
      this.buyHistoryInfo = this.buyHistoryInfo.slice(0, this.limit);
    }
  }

  subscribeBuyHistoryInfo = () => {
    const self = this;
    console.log('subscribeBuyHistoryInfo');
    this.subscription = apolloClient.subscribe({
      query: getOnBuyHistoryInfoSubscription(this.app.wallet.currentMarket, 'BUYORDER'),
    }).subscribe({
      next({ data, errors }) {
        console.log(data);
        if (errors && errors.length > 0) {
          console.log(errors);
          self.onBuyHistoryInfoSub({ error: errors[0] });
        } else {
          const response = [];
          response.push(data.onBuyHistoryInfo);
          self.onBuyHistoryInfoSub(response);
        }
      },
      error(err) {
        console.log(err);
        self.onBuyHistoryInfoSub({ error: err.message });
      },
    });
  }
}
