import { observable, action, runInAction, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import { queryAllTrades } from '../network/graphql/queries';
import Trade from './models/Trade';
import AppConfig from '../config/app';
import apolloClient from '../network/graphql';
import getSubscription, { channels } from '../network/graphql/subscriptions';

const INIT_VALUES = {
  loaded: true, // INIT_VALUESial loaded state
  loadingMore: false, // for scroll laoding animation
  buyHistoryInfo: '',
  hasMoreBuyHistory: false, // has more buyOrders to fetch?
  hasLessBuyHistory: false, // has more buyOrders to fetch?
  skip: 0, // skip
};

export default class {
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
        }
      }
    );
    // Call mytrades once to init the wallet addresses used by other stores
    this.getBuyHistoryInfo();
    this.subscribeBuyHistoryInfo();
    setInterval(this.getBuyHistoryInfo, AppConfig.intervals.buyHistoryInfo);
  }

  @action
  init = async (limit = this.limit) => {
    Object.assign(this, INIT_VALUES); // reset all properties
    this.app.ui.location = Routes.EXCHANGE;
    this.buyHistoryInfo = await this.getBuyHistoryInfo(limit);
    runInAction(() => {
      this.loading = false;
    });
  }

  getBuyHistoryInfo = async (limit = this.limit, skip = this.skip) => {
    try {
      const orderBy = { field: 'time', direction: 'DESC' };
      let buyHistoryInfo = [];
      const filters = [{ tokenName: this.app.wallet.currentMarket, orderType: 'BUYORDER' }]; /* Filter From and To,  unique by txid */
      buyHistoryInfo = await queryAllTrades(filters, orderBy, limit, skip);
      if (buyHistoryInfo.length < limit) this.hasMoreBuyHistory = false;
      if (buyHistoryInfo.length === limit) this.hasMoreBuyHistory = true;
      if (this.skip === 0) this.hasLessBuyHistory = false;
      if (this.skip > 0) this.hasLessBuyHistory = true;

      this.onBuyHistoryInfo(buyHistoryInfo);
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


  subscribeBuyHistoryInfo = () => {
    const self = this;
    apolloClient.subscribe({
      query: getSubscription(channels.ON_BUYHISTORY_INFO),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.onBuyHistoryInfo({ error: errors[0] });
        } else {
          self.onBuyHistoryInfo(data.onBuyHistoryInfo);
        }
      },
      error(err) {
        self.onBuyHistoryInfo({ error: err.message });
      },
    });
  }
}
