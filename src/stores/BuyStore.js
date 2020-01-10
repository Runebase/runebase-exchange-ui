import { observable, action, runInAction, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import { queryAllNewOrders } from '../network/graphql/queries';
import NewOrder from './models/NewOrder';
import apolloClient from '../network/graphql';
import { getonBuyOrderInfoSubscription } from '../network/graphql/subscriptions';

const INIT_VALUES = {
  loading: true,
  loaded: true, // INIT_VALUESial loaded state
  loadingMore: false, // for scroll laoding animation
  list: [], // data list
  buyOrderInfo: '',
  hasMoreBuyOrders: true, // has more buyOrders to fetch?
  hasLessBuyOrders: true, // has more buyOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loading = INIT_VALUES.loading

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
          this.getBuyOrderInfo();
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


  getBuyOrderInfo = async (limit = this.limit, skip = this.skip) => {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    const orderBy = { field: 'price', direction: 'DESC' };
    let buyOrders = [];
    const filters = [{ orderType: 'BUYORDER', token: this.app.wallet.market, status: 'ACTIVE' }];
    buyOrders = await queryAllNewOrders(filters, orderBy, limit, skip);
    if (buyOrders.length < limit) this.hasMoreBuyOrders = false;
    if (buyOrders.length === limit) this.hasMoreBuyOrders = true;
    if (this.skip === 0) this.hasLessBuyOrders = false;
    if (this.skip > 0) this.hasLessBuyOrders = true;
    this.onBuyOrderInfo(buyOrders);
    this.subscribeBuyOrderInfo();
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

  @action
  onBuyOrderInfoSub = (buyOrderInfo) => {
    console.log('onbuyOrderInfoInfoSub');
    console.log(buyOrderInfo);
    console.log(this.skip);
    if (buyOrderInfo.error) {
      console.error(buyOrderInfo.error.message); // eslint-disable-line no-console
    } else {
      if (this.buyOrderInfo === undefined) {
        this.buyOrderInfo = [];
      }
      const result = _.uniqBy(buyOrderInfo, 'orderId').map((newOrder) => new NewOrder(newOrder, this.app));
      result.forEach((trade) => {
        const index = _.findIndex(this.buyOrderInfo, { txid: trade.txid });
        if (index === -1) {
          this.buyOrderInfo.push(trade);
        } else {
          this.buyOrderInfo[index] = trade;
        }
      });
      this.buyOrderInfo = _.orderBy(this.buyOrderInfo, ['price'], 'desc');
      this.buyOrderInfo = this.buyOrderInfo.slice(0, this.limit);
    }
  }

  subscribeBuyOrderInfo = () => {
    const self = this;
    console.log('subscribeBuyOrderInfo');
    this.subscription = apolloClient.subscribe({
      query: getonBuyOrderInfoSubscription('BUYORDER', this.app.wallet.market, 'ACTIVE'),
    }).subscribe({
      next({ data, errors }) {
        console.log(data);
        if (errors && errors.length > 0) {
          console.log(errors);
          self.onBuyOrderInfoSub({ error: errors[0] });
        } else {
          const response = [];
          response.push(data.onBuyOrderInfo);
          self.onBuyOrderInfoSub(response);
        }
      },
      error(err) {
        console.log(err);
        self.onBuyOrderInfoSub({ error: err.message });
      },
    });
  }
}
