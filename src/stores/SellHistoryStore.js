import { observable, action, runInAction, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import { queryAllTrades } from '../network/graphql/queries';
import Trade from './models/Trade';
import apolloClient from '../network/graphql';
import { getOnSellHistoryInfoSubscription } from '../network/graphql/subscriptions';

const INIT_VALUES = {
  loading: true,
  loaded: true, // INIT_VALUESial loaded state
  loadingMore: false, // for scroll laoding animation
  sellHistoryInfo: '',
  hasMoreSellHistory: false, // has more buyOrders to fetch?
  hasLessSellHistory: false, // has more buyOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loading = INIT_VALUES.loading

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
          this.getSellHistoryInfo();
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

  getSellHistoryInfo = async (limit = this.limit, skip = this.skip) => {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
      this.subscribeSellHistoryInfo();
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

  @action
  onSellHistoryInfoSub = (sellHistoryInfo) => {
    console.log('onSellHistoryInfoSub');
    console.log(sellHistoryInfo);
    console.log(this.skip);
    if (sellHistoryInfo.error) {
      console.error(sellHistoryInfo.error.message); // eslint-disable-line no-console
    } else if (this.skip === 0) {
      if (this.sellHistoryInfo === undefined) {
        this.sellHistoryInfo = [];
      }
      const result = _.uniqBy(sellHistoryInfo, 'txid').map((trade) => new Trade(trade, this.app));
      result.forEach((trade) => {
        const index = _.findIndex(this.sellHistoryInfo, { txid: trade.txid });
        if (index === -1) {
          this.sellHistoryInfo.push(trade);
        } else {
          this.sellHistoryInfo[index] = trade;
        }
      });
      this.sellHistoryInfo = _.orderBy(this.sellHistoryInfo, ['time'], 'desc');
      this.sellHistoryInfo = this.sellHistoryInfo.slice(0, this.limit);
    }
  }

  subscribeSellHistoryInfo = () => {
    const self = this;
    console.log('subscribeSellHistoryInfo');
    this.subscription = apolloClient.subscribe({
      query: getOnSellHistoryInfoSubscription(this.app.wallet.currentMarket, 'SELLORDER'),
    }).subscribe({
      next({ data, errors }) {
        console.log(data);
        if (errors && errors.length > 0) {
          console.log(errors);
          self.onSellHistoryInfoSub({ error: errors[0] });
        } else {
          const response = [];
          response.push(data.onSellHistoryInfo);
          self.onSellHistoryInfoSub(response);
        }
      },
      error(err) {
        console.log(err);
        self.onSellHistoryInfoSub({ error: err.message });
      },
    });
  }
}
