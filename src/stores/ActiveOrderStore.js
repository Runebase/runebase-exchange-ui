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
  activeOrderInfo: '',
  hasMoreActiveOrders: false, // has more activeOrders to fetch?
  hasLessActiveOrders: false, // has more activeOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loaded = INIT_VALUES.loaded
  @observable loadingMore = INIT_VALUES.loadingMore
  @observable hasMoreActiveOrders = INIT_VALUES.hasMoreActiveOrders
  @observable hasLessActiveOrders = INIT_VALUES.hasLessActiveOrders
  @observable activeOrderInfo = INIT_VALUES.activeOrderInfo
  @computed get hasMore() {
    return this.hasMoreActiveOrders;
  }
  @computed get hasLess() {
    return this.hasLessActiveOrders;
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
    this.getActiveOrderInfo();
    this.subscribeActiveOrderInfo();
    setInterval(this.getActiveOrderInfo, AppConfig.intervals.activeOrderInfo);
    if (this.app.wallet.currentAddressSelected === '') {
      this.hasLessActiveOrders = false;
      this.hasMoreActiveOrders = false;
    }
  }

  @action
  init = async (limit = this.limit) => {
    Object.assign(this, INIT_VALUES); // reset all properties
    this.app.ui.location = Routes.EXCHANGE;
    this.activeOrderInfo = await this.getActiveOrderInfo(limit, 0);
    runInAction(() => {
      this.loading = false;
    });
  }

  @action
  getActiveOrderInfo = async (limit = this.limit, skip = this.skip) => {
    if (this.app.wallet.currentAddressSelected !== '') {
      const orderBy = { field: 'time', direction: this.app.sortBy };
      let activeOrders = [];
      const filters = [
        { owner: this.app.wallet.currentAddressSelected, status: 'ACTIVE' },
        { owner: this.app.wallet.currentAddressSelected, status: 'PENDING' },
        { owner: this.app.wallet.currentAddressSelected, status: 'PENDINGCANCEL' },
      ];
      activeOrders = await queryAllNewOrders(filters, orderBy, limit, skip);
      if (activeOrders.length < limit) this.hasMoreActiveOrders = false;
      if (activeOrders.length === limit) this.hasMoreActiveOrders = true;
      if (this.skip === 0) this.hasLessActiveOrders = false;
      if (this.skip > 0) this.hasLessActiveOrders = true;
      this.onActiveOrderInfo(activeOrders);
    }
  }

  @action
  onActiveOrderInfo = (activeOrderInfo) => {
    if (activeOrderInfo.error) {
      console.error(activeOrderInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(activeOrderInfo, 'txid').map((newOrder) => new NewOrder(newOrder, this.app));
      const resultOrder = _.orderBy(result, ['time'], 'desc');
      this.activeOrderInfo = resultOrder;
    }
  }

  subscribeActiveOrderInfo = () => {
    const self = this;
    apolloClient.subscribe({
      query: getSubscription(channels.ON_ACTIVEORDER_INFO),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.getActiveOrderInfo({ error: errors[0] });
        } else {
          self.getActiveOrderInfo(data.getActiveOrderInfo);
        }
      },
      error(err) {
        self.getActiveOrderInfo({ error: err.message });
      },
    });
  }
}
