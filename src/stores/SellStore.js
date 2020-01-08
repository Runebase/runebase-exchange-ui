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
  sellOrderInfo: '',
  hasMoreSellOrders: true, // has more sellOrders to fetch?
  hasLessSellOrders: true, // has more sellOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loading = INIT_VALUES.loading

  @observable loaded = INIT_VALUES.loaded

  @observable loadingMore = INIT_VALUES.loadingMore

  @observable hasMoreSellOrders = INIT_VALUES.hasMoreSellOrders

  @observable hasLessSellOrders = INIT_VALUES.hasLessSellOrders

  @observable sellOrderInfo = INIT_VALUES.sellOrderInfo

  @computed get hasMore() {
    return this.hasMoreSellOrders;
  }

  @computed get hasLess() {
    return this.hasLessSellOrders;
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

    reaction(
      () => this.app.sortBy + this.app.wallet.addresses + this.app.refreshing + this.app.global.syncBlockNum,
      () => {
        if (this.app.ui.location === Routes.EXCHANGE) {
          this.getSellOrderInfo();
        }
      }
    );

    // Call BuyOrders once to init the wallet addresses used by other stores
    // this.getSellOrderInfo();
    // this.subscribeSellOrderInfo();
    // setInterval(this.getSellOrderInfo, AppConfig.intervals.sellOrderInfo);
    // this.getSellOrderInfo();
  }


  @action
  init = async (limit = this.limit) => {
    Object.assign(this, INIT_VALUES); // reset all properties
    this.app.ui.location = Routes.EXCHANGE;
    // this.sellOrderInfo = await this.getSellOrderInfo(limit);
    runInAction(() => {
      this.loading = false;
    });
  }

  @action
  getSellOrderInfo = async (limit = this.limit, skip = this.skip) => {
    this.skip = skip;
    const orderBy = { field: 'price', direction: 'ASC' };
    let sellOrders = [];
    const filters = [{ orderType: 'SELLORDER', token: this.app.wallet.market, status: 'ACTIVE' }];
    sellOrders = await queryAllNewOrders(filters, orderBy, limit, skip);
    this.onSellOrderInfo(sellOrders);
    runInAction(() => {
      if (sellOrders.length < limit) this.hasMoreSellOrders = false;
      if (sellOrders.length === limit) this.hasMoreSellOrders = true;
      if (this.skip === 0) this.hasLessSellOrders = false;
      if (this.skip > 0) this.hasLessSellOrders = true;
    });
  }

  @action
  onSellOrderInfo = (sellOrderInfo) => {
    if (sellOrderInfo.error) {
      console.error(sellOrderInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(sellOrderInfo, 'orderId').map((newOrder) => new NewOrder(newOrder, this.app));
      const resultOrder = _.orderBy(result, ['price'], 'asc');
      console.log(resultOrder);
      this.sellOrderInfo = resultOrder;
    }
  }

  subscribeSellOrderInfo = () => {
    const self = this;
    apolloClient.subscribe({
      query: getSubscription(channels.ON_SELLORDER_INFO),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.onSellOrderInfo({ error: errors[0] });
        } else {
          self.onSellOrderInfo(data.onSellOrderInfo);
        }
      },
      error(err) {
        self.onSellOrderInfo({ error: err.message });
      },
    });
  }
}
