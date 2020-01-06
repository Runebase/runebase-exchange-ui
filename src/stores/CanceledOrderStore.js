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
  canceledOrderInfo: '',
  hasMoreCanceledOrders: false, // has more activeOrders to fetch?
  hasLessCanceledOrders: false, // has more activeOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loaded = INIT_VALUES.loaded

  @observable loadingMore = INIT_VALUES.loadingMore

  @observable hasMoreCanceledOrders = INIT_VALUES.hasMoreCanceledOrders

  @observable hasLessCanceledOrders = INIT_VALUES.hasLessCanceledOrders

  @observable canceledOrderInfo = INIT_VALUES.canceledOrderInfo

  @computed get hasMore() {
    return this.hasMoreCanceledOrders;
  }

  @computed get hasLess() {
    return this.hasLessCanceledOrders;
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
    this.getCanceledOrderInfo();
    this.subscribeCanceledOrderInfo();
    setInterval(this.getCanceledOrderInfo, AppConfig.intervals.canceledOrderInfo);
  }

  @action
  init = async (limit = this.limit) => {
    Object.assign(this, INIT_VALUES); // reset all properties
    this.app.ui.location = Routes.EXCHANGE;
    this.canceledOrderInfo = await this.getCanceledOrderInfo(limit);
    runInAction(() => {
      this.loading = false;
    });
  }

  getCanceledOrderInfo = async (limit = this.limit, skip = this.skip) => {
    if (this.app.wallet.currentAddressSelected !== '') {
      const orderBy = { field: 'time', direction: this.app.sortBy };
      let activeOrders = [];
      const filters = [{ owner: this.app.wallet.currentAddressSelected, status: 'CANCELED' }];
      activeOrders = await queryAllNewOrders(filters, orderBy, limit, skip);
      if (activeOrders.length < limit) this.hasMoreCanceledOrders = false;
      if (activeOrders.length === limit) this.hasMoreCanceledOrders = true;
      if (this.skip === 0) this.hasLessCanceledOrders = false;
      if (this.skip > 0) this.hasLessCanceledOrders = true;
      this.onCanceledOrderInfo(activeOrders);
    }
  }

  @action
  onCanceledOrderInfo = (canceledOrderInfo) => {
    if (canceledOrderInfo.error) {
      console.error(canceledOrderInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(canceledOrderInfo, 'txid').map((newOrder) => new NewOrder(newOrder, this.app));
      const resultOrder = _.orderBy(result, ['time'], 'desc');
      this.canceledOrderInfo = resultOrder;
    }
  }

  subscribeCanceledOrderInfo = () => {
    const self = this;
    apolloClient.subscribe({
      query: getSubscription(channels.ON_CANCELEDORDER_INFO),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.getCanceledOrderInfo({ error: errors[0] });
        } else {
          self.getCanceledOrderInfo(data.getCanceledOrderInfo);
        }
      },
      error(err) {
        self.getCanceledOrderInfo({ error: err.message });
      },
    });
  }
}
