import { observable, action, runInAction, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import { queryAllNewOrders } from '../network/graphql/queries';
import NewOrder from './models/NewOrder';
import AppConfig from '../config/app';
import apolloClient from '../network/graphql';
import getSubscription, { channels } from '../network/graphql/subscriptions';

const INIT_VALUES = {
  loading: true,
  loaded: true, // INIT_VALUESial loaded state
  loadingMore: false, // for scroll laoding animation
  fulfilledOrderInfo: '',
  hasMoreFulfilledOrders: false, // has more fulfilledOrders to fetch?
  hasLessFulfilledOrders: false, // has more fulfilledOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loading = INIT_VALUES.loading

  @observable loaded = INIT_VALUES.loaded

  @observable loadingMore = INIT_VALUES.loadingMore

  @observable hasMoreFulfilledOrders = INIT_VALUES.hasMoreFulfilledOrders

  @observable hasLessFulfilledOrders = INIT_VALUES.hasLessFulfilledOrders

  @observable fulfilledOrderInfo = INIT_VALUES.fulfilledOrderInfo

  @computed get hasMore() {
    return this.hasMoreFulfilledOrders;
  }

  @computed get hasLess() {
    return this.hasLessFulfilledOrders;
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
    // Call BuyOrders once to init the wallet addresses used by other stores
    this.getFulfilledOrderInfo();
    this.subscribeFulfilledOrderInfo();
    setInterval(this.getFulfilledOrderInfo, AppConfig.intervals.fulfilledOrderInfo);
  }

  @action
  init = async (limit = this.limit) => {
    Object.assign(this, INIT_VALUES); // reset all properties
    this.app.ui.location = Routes.EXCHANGE;
    this.fulfilledOrderInfo = await this.getFulfilledOrderInfo(limit);
    runInAction(() => {
      this.loading = false;
    });
  }

  getFulfilledOrderInfo = async (limit = this.limit, skip = this.skip) => {
    if (this.app.wallet.currentAddressSelected !== '') {
      const orderBy = { field: 'time', direction: this.app.sortBy };
      let fulfilledOrders = [];
      const filters = [{ owner: this.app.wallet.currentAddressSelected, status: 'FULFILLED' }];
      fulfilledOrders = await queryAllNewOrders(filters, orderBy, limit, skip);
      if (fulfilledOrders.length < limit) this.hasMoreFulfilledOrders = false;
      if (fulfilledOrders.length === limit) this.hasMoreFulfilledOrders = true;
      if (this.skip === 0) this.hasLessFulfilledOrders = false;
      if (this.skip > 0) this.hasLessFulfilledOrders = true;
      this.onFulfilledOrderInfo(fulfilledOrders);
    }
  }

  @action
  onFulfilledOrderInfo = (fulfilledOrderInfo) => {
    if (fulfilledOrderInfo.error) {
      console.error(fulfilledOrderInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(fulfilledOrderInfo, 'txid').map((newOrder) => new NewOrder(newOrder, this.app));
      const resultOrder = _.orderBy(result, ['time'], 'desc');
      this.fulfilledOrderInfo = resultOrder;
    }
  }

  subscribeFulfilledOrderInfo = () => {
    const self = this;
    apolloClient.subscribe({
      query: getSubscription(channels.ON_FULFILLEDORDER_INFO),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.getFulfilledOrderInfo({ error: errors[0] });
        } else {
          self.getFulfilledOrderInfo(data.getFulfilledOrderInfo);
        }
      },
      error(err) {
        self.getFulfilledOrderInfo({ error: err.message });
      },
    });
  }
}
