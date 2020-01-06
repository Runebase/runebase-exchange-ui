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
  sellHistoryInfo: '',
  hasMoreSellHistory: false, // has more buyOrders to fetch?
  hasLessSellHistory: false, // has more buyOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loaded = INIT_VALUES.loaded

  @observable loadingMore = INIT_VALUES.loadingMore

  @observable hasMoreSellHistory = INIT_VALUES.hasMoreSellHistory

  @observable hasLessSellHistory = INIT_VALUES.hasLessSellHistory

  @observable sellHistoryInfo = INIT_VALUES.sellHistoryInfo

  @computed get hasMore() {
    return this.hasMoreSellHistory;
  }

  @computed get hasLess() {
    return this.hasLessSellHistory;
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
    this.getSellHistoryInfo();
    this.subscribeSellHistoryInfo();
    setInterval(this.getSellHistoryInfo, AppConfig.intervals.sellHistoryInfo);
  }

  @action
  init = async (limit = this.limit) => {
    Object.assign(this, INIT_VALUES); // reset all properties
    this.app.ui.location = Routes.EXCHANGE;
    this.sellHistoryInfo = await this.getSellHistoryInfo(limit);
    runInAction(() => {
      this.loading = false;
    });
  }

  getSellHistoryInfo = async (limit = this.limit, skip = this.skip) => {
    try {
      let sellHistoryInfo = [];
      const orderBy = { field: 'time', direction: 'DESC' };
      const filters = [{ token: this.app.wallet.currentMarket, orderType: 'SELLORDER' }];
      /* Filter From and To,  unique by txid */
      sellHistoryInfo = await queryAllTrades(filters, orderBy, limit, skip);
      if (sellHistoryInfo.length < limit) this.hasMoreSellHistory = false;
      if (sellHistoryInfo.length === limit) this.hasMoreSellHistory = true;
      if (this.skip === 0) this.hasLessSellHistory = false;
      if (this.skip > 0) this.hasLessSellHistory = true;
      this.onSellHistoryInfo(sellHistoryInfo);
    } catch (error) {
      this.onSellHistoryInfo({ error });
    }
  }

  @action
  onSellHistoryInfo = (sellHistoryInfo) => {
    if (sellHistoryInfo.error) {
      console.error(sellHistoryInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(sellHistoryInfo, 'txid').map((trade) => new Trade(trade, this.app));
      const resultOrder = _.orderBy(result, ['time'], 'desc');
      this.sellHistoryInfo = resultOrder;
    }
  }


  subscribeSellHistoryInfo = () => {
    const self = this;
    apolloClient.subscribe({
      query: getSubscription(channels.ON_SELLHISTORY_INFO),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.onSellHistoryInfo({ error: errors[0] });
        } else {
          self.onSellHistoryInfo(data.onSellHistoryInfo);
        }
      },
      error(err) {
        self.onSellHistoryInfo({ error: err.message });
      },
    });
  }
}
