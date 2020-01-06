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
  myTradeInfo: '',
  hasMoreMyTrades: false, // has more buyOrders to fetch?
  hasLessMyTrades: false, // has more buyOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loaded = INIT_VALUES.loaded

  @observable loadingMore = INIT_VALUES.loadingMore

  @observable hasMoreMyTrades = INIT_VALUES.hasMoreMyTrades

  @observable hasLessMyTrades = INIT_VALUES.hasLessMyTrades

  @observable myTradeInfo = INIT_VALUES.myTradeInfo

  @computed get hasMore() {
    return this.hasMoreMyTrades;
  }

  @computed get hasLess() {
    return this.hasLessMyTrades;
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
    this.getMyTradeInfo();
    this.subscribeMyTradeInfo();
    setInterval(this.getMyTradeInfo, AppConfig.intervals.myTradeInfo);
  }

  @action
  init = async (limit = this.limit) => {
    Object.assign(this, INIT_VALUES); // reset all properties
    this.app.ui.location = Routes.EXCHANGE;
    this.myTradeInfo = await this.getMyTradeInfo(limit);
    runInAction(() => {
      this.loading = false;
    });
  }

  getMyTradeInfo = async (limit = this.limit, skip = this.skip) => {
    try {
      if (this.app.wallet.currentAddressKey !== '') {
        const orderBy = { field: 'time', direction: 'DESC' };
        let myTradeInfo = [];
        const filters = [{ from: this.app.wallet.addresses[this.app.wallet.currentAddressKey].address }, { to: this.app.wallet.addresses[this.app.wallet.currentAddressKey].address }]; /* Filter From and To,  unique by txid */
        myTradeInfo = await queryAllTrades(filters, orderBy, limit, skip);
        if (myTradeInfo.length < limit) this.hasMoreMyTrades = false;
        if (myTradeInfo.length === limit) this.hasMoreMyTrades = true;
        if (this.skip === 0) this.hasLessMyTrades = false;
        if (this.skip > 0) this.hasLessMyTrades = true;
        this.onMyTradeInfo(myTradeInfo);
      }
    } catch (error) {
      this.onMyTradeInfo({ error });
    }
  }

  @action
  onMyTradeInfo = (myTradeInfo) => {
    if (myTradeInfo.error) {
      console.error(myTradeInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(myTradeInfo, 'txid').map((trade) => new Trade(trade, this.app));
      const resultOrder = _.orderBy(result, ['time'], 'desc');
      this.myTradeInfo = resultOrder;
    }
  }

  subscribeMyTradeInfo = () => {
    const self = this;
    apolloClient.subscribe({
      query: getSubscription(channels.ON_MYTRADE_INFO),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.onMyTradeInfo({ error: errors[0] });
        } else {
          self.onMyTradeInfo(data.onMyTradeInfo);
        }
      },
      error(err) {
        self.onMyTradeInfo({ error: err.message });
      },
    });
  }
}
