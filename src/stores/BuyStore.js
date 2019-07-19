import { observable, action, runInAction, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import { queryAllNewOrders } from '../network/graphql/queries';
import NewOrder from './models/NewOrder';
import AppConfig from '../config/app';
import apolloClient from '../network/graphql';
import getSubscription, { channels } from '../network/graphql/subscriptions';

const INIT_VALUES = {
  loaded: true, // INIT_VALUESial loaded state
  loadingMore: false, // for scroll laoding animation
  list: [], // data list
  buyOrderInfo: '',
  hasMoreBuyOrders: true, // has more buyOrders to fetch?
  hasLessBuyOrders: true, // has more buyOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loaded = INIT_VALUES.loaded
  @observable loadingMore = INIT_VALUES.loadingMore
  @observable hasMoreBuyOrders = INIT_VALUES.hasMoreBuyOrders
  @observable hasLessBuyOrders = INIT_VALUES.hasLessBuyOrders
  @observable buyOrderInfo = INIT_VALUES.buyOrderInfo
  @computed get hasMore() {
    return this.hasMoreBuyOrders;
  }
  @computed get hasLess() {
    return this.hasLessBuyOrders;
  }
  @observable skip = INIT_VALUES.skip
  limit = 5

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
    // Call BuyOrders once to init the wallet addresses used by other stores
    this.getBuyOrderInfo();
    this.subscribeBuyOrderInfo();
    setInterval(this.getBuyOrderInfo, AppConfig.intervals.buyOrderInfo);
  }

  @action
  init = async (limit = this.limit) => {
    Object.assign(this, INIT_VALUES); // reset all properties
    this.app.ui.location = Routes.EXCHANGE;
    this.buyOrderInfo = await this.getBuyOrderInfo(limit);
    runInAction(() => {
      this.loading = false;
    });
  }


  getBuyOrderInfo = async (limit = this.limit, skip = this.skip) => {
    const orderBy = { field: 'price', direction: 'DESC' };
    let buyOrders = [];
    const filters = [{ orderType: 'BUYORDER', tokenName: this.app.wallet.market, status: 'ACTIVE' }];
    buyOrders = await queryAllNewOrders(filters, orderBy, limit, skip);
    if (buyOrders.length < limit) this.hasMoreBuyOrders = false;
    if (buyOrders.length === limit) this.hasMoreBuyOrders = true;
    if (this.skip === 0) this.hasLessBuyOrders = false;
    if (this.skip > 0) this.hasLessBuyOrders = true;
    this.onBuyOrderInfo(buyOrders);
  }

  @action
  onBuyOrderInfo = (buyOrderInfo) => {
    if (buyOrderInfo.error) {
      console.error(buyOrderInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(buyOrderInfo, 'orderId').map((newOrder) => new NewOrder(newOrder, this.app));
      const resultOrder = _.orderBy(result, ['price'], 'desc');
      this.buyOrderInfo = resultOrder;
    }
  }

  subscribeBuyOrderInfo = () => {
    const self = this;
    apolloClient.subscribe({
      query: getSubscription(channels.ON_BUYORDER_INFO),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.onBuyOrderInfo({ error: errors[0] });
        } else {
          self.onBuyOrderInfo(data.onBuyOrderInfo);
        }
      },
      error(err) {
        self.onBuyOrderInfo({ error: err.message });
      },
    });
  }
}
