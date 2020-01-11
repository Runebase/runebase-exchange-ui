import { observable, action, runInAction, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import { queryAllNewOrders } from '../network/graphql/queries';
import NewOrder from './models/NewOrder';
import AppConfig from '../config/app';
import apolloClient from '../network/graphql';
import { getonCanceledOrderInfoSubscription } from '../network/graphql/subscriptions';

const INIT_VALUES = {
  loading: true,
  loaded: true, // INIT_VALUESial loaded state
  loadingMore: false, // for scroll laoding animation
  canceledOrderInfo: '',
  hasMoreCanceledOrders: false, // has more activeOrders to fetch?
  hasLessCanceledOrders: false, // has more activeOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loading = INIT_VALUES.loading

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
          this.getCanceledOrderInfo();
        }
      }
    );
  }

  @action
  init = async () => {
    Object.assign(this, INIT_VALUES); // reset all properties
    this.app.ui.location = Routes.EXCHANGE;
    runInAction(() => {
      this.loading = false;
    });
  }

  getCanceledOrderInfo = async (limit = this.limit, skip = this.skip) => {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
      this.subscribeCanceledOrderInfo();
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

  @action
  onCanceledOrderInfoSub = (canceledOrderInfo) => {
    console.log('onCanceledOrderInfoSub');
    console.log(canceledOrderInfo);
    console.log(this.skip);
    if (this.canceledOrderInfo === undefined) {
      this.canceledOrderInfo = [];
    }
    if (canceledOrderInfo.error) {
      console.error(canceledOrderInfo.error.message); // eslint-disable-line no-console
    } else {
      if (this.skip === 0 && canceledOrderInfo[0].owner === this.app.wallet.currentAddressSelected) {
        const result = _.uniqBy(canceledOrderInfo, 'txid').map((newOrder) => new NewOrder(newOrder, this.app));
        result.forEach((order) => {
          const index = _.findIndex(this.canceledOrderInfo, { txid: order.txid });
          if (index === -1) {
            this.canceledOrderInfo.push(order);
          } else {
            this.canceledOrderInfo[index] = order;
          }
        });
        this.canceledOrderInfo = _.orderBy(this.canceledOrderInfo, ['time'], 'desc');
        this.canceledOrderInfo = this.canceledOrderInfo.slice(0, this.limit);
        this.app.activeOrderStore.getActiveOrderInfo();
      }
      if (this.skip !== 0 && canceledOrderInfo[0].owner === this.app.wallet.currentAddressSelected) {
        this.getCanceledOrderInfo();
        this.app.activeOrderStore.getActiveOrderInfo();
      }
      if (canceledOrderInfo[0].token === this.app.wallet.market) {
        this.app.sellStore.getSellOrderInfo();
        this.app.buyStore.getBuyOrderInfo();
      }
    }
  }

  subscribeCanceledOrderInfo = () => {
    const self = this;
    console.log('subscribeCanceledOrderInfo');
    this.subscription = apolloClient.subscribe({
      query: getonCanceledOrderInfoSubscription('CANCELED'),
    }).subscribe({
      next({ data, errors }) {
        console.log(data);
        if (errors && errors.length > 0) {
          console.log(errors);
          self.onCanceledOrderInfoSub({ error: errors[0] });
        } else {
          const response = [];
          response.push(data.onCanceledOrderInfo);
          self.onCanceledOrderInfoSub(response);
        }
      },
      error(err) {
        console.log(err);
        self.onCanceledOrderInfoSub({ error: err.message });
      },
    });
  }
}
