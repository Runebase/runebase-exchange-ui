import { observable, action, runInAction, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import { queryAllFundRedeems } from '../network/graphql/queries';
import FundRedeem from './models/FundRedeem';
import apolloClient from '../network/graphql';
import { getOnFundRedeemInfoSubscription } from '../network/graphql/subscriptions';

const INIT_VALUES = {
  loading: true,
  loaded: true, // INIT_VALUESial loaded state
  loadingMore: false, // for scroll laoding animation
  fundRedeemInfo: '',
  hasMoreFundRedeems: false, // has more buyOrders to fetch?
  hasLessFundRedeems: false, // has more buyOrders to fetch?
  skip: 0, // skip
};

export default class {
  @observable loading = INIT_VALUES.loading

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
  }

  @action
  init = async () => {
    Object.assign(this, INIT_VALUES); // reset all properties
    this.app.ui.location = Routes.EXCHANGE;
    runInAction(() => {
      this.loading = false;
    });
  }

  getFundRedeemInfo = async (limit = this.limit, skip = this.skip) => {
    console.log('getFundRedeemInfo');
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
        this.subscribeFundRedeemInfo();
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

  @action
  onFundRedeemInfoSub = (fundRedeemInfo) => {
    console.log(fundRedeemInfo);
    console.log(this.skip);
    if (fundRedeemInfo.error) {
      console.error(fundRedeemInfo.error.message); // eslint-disable-line no-console
    } else if (this.skip === 0) {
      if (this.fundRedeemInfo === undefined) {
        this.fundRedeemInfo = [];
      }
      const result = _.uniqBy(fundRedeemInfo, 'txid').map((fundRedeem) => new FundRedeem(fundRedeem, this.app));
      result.forEach((fundRedeem) => {
        const index = _.findIndex(this.fundRedeemInfo, { txid: fundRedeem.txid });
        if (index === -1) {
          this.fundRedeemInfo.push(fundRedeem);
        } else {
          this.fundRedeemInfo[index] = fundRedeem;
        }
      });
      this.fundRedeemInfo = _.orderBy(this.fundRedeemInfo, ['time'], 'desc');
      this.fundRedeemInfo = this.fundRedeemInfo.slice(0, this.limit);
    }
  }

  subscribeFundRedeemInfo = () => {
    const self = this;
    if (this.app.wallet.currentAddressKey !== '') {
      this.subscription = apolloClient.subscribe({
        query: getOnFundRedeemInfoSubscription(this.app.wallet.addresses[this.app.wallet.currentAddressKey].address),
      }).subscribe({
        next({ data, errors }) {
          console.log(data);
          if (errors && errors.length > 0) {
            self.onFundRedeemInfoSub({ error: errors[0] });
          } else {
            const response = [];
            response.push(data.onFundRedeemInfo);
            self.onFundRedeemInfoSub(response);
          }
        },
        error(err) {
          self.onFundRedeemInfoSub({ error: err.message });
        },
      });
    }
  }
}
