import { observable, action, runInAction, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import { queryAllFundRedeems } from '../network/graphql/queries';
import FundRedeem from './models/FundRedeem';
import AppConfig from '../config/app';
import apolloClient from '../network/graphql';
import getSubscription, { channels } from '../network/graphql/subscriptions';

const INIT_VALUES = {
  loaded: true, // INIT_VALUESial loaded state
  loadingMore: false, // for scroll laoding animation
  fundRedeemInfo: '',
  hasMoreFundRedeems: false, // has more buyOrders to fetch?
  hasLessFundRedeems: false, // has more buyOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loaded = INIT_VALUES.loaded
  @observable loadingMore = INIT_VALUES.loadingMore
  @observable hasMoreFundRedeems = INIT_VALUES.hasMoreFundRedeems
  @observable hasLessFundRedeems = INIT_VALUES.hasLessFundRedeems
  @observable fundRedeemInfo = INIT_VALUES.fundRedeemInfo
  @computed get hasMore() {
    return this.hasMoreFundRedeems;
  }
  @computed get hasLess() {
    return this.hasLessFundRedeems;
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
    this.getFundRedeemInfo();
    this.subscribeFundRedeemInfo();
    setInterval(this.getFundRedeemInfo, AppConfig.intervals.fundRedeemInfo);
  }

  @action
  init = async (limit = this.limit) => {
    Object.assign(this, INIT_VALUES); // reset all properties
    this.app.ui.location = Routes.EXCHANGE;
    this.fundRedeemInfo = await this.getFundRedeemInfo(limit);
    runInAction(() => {
      this.loading = false;
    });
  }

  getFundRedeemInfo = async (limit = this.limit, skip = this.skip) => {
    try {
      if (this.app.wallet.currentAddressKey !== '') {
        const orderBy = { field: 'time', direction: 'DESC' };
        let fundRedeemInfo = [];
        const filters = [{ owner: this.app.wallet.addresses[this.app.wallet.currentAddressKey].address }];
        fundRedeemInfo = await queryAllFundRedeems(filters, orderBy, limit, skip);
        if (fundRedeemInfo.length < limit) this.hasMoreFundRedeems = false;
        if (fundRedeemInfo.length === limit) this.hasMoreFundRedeems = true;
        if (this.skip === 0) this.hasLessFundRedeems = false;
        if (this.skip > 0) this.hasLessFundRedeems = true;
        this.onFundRedeemInfo(fundRedeemInfo);
      }
    } catch (error) {
      this.onFundRedeemInfo({ error });
    }
  }

  @action
  onFundRedeemInfo = (fundRedeemInfo) => {
    if (fundRedeemInfo.error) {
      console.error(fundRedeemInfo.error.message); // eslint-disable-line no-console
    } else {
      const result = _.uniqBy(fundRedeemInfo, 'txid').map((fundRedeem) => new FundRedeem(fundRedeem, this.app));
      const resultOrder = _.orderBy(result, ['time'], 'desc');
      this.fundRedeemInfo = resultOrder;
    }
  }

  subscribeFundRedeemInfo = () => {
    const self = this;
    apolloClient.subscribe({
      query: getSubscription(channels.ON_FUNDREDEEM_INFO),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.onFundRedeemInfo({ error: errors[0] });
        } else {
          self.onFundRedeemInfo(data.onFundRedeemInfo);
        }
      },
      error(err) {
        self.onFundRedeemInfo({ error: err.message });
      },
    });
  }
}
