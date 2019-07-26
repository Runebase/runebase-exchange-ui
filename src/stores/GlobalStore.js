import { observable, action, reaction, runInAction } from 'mobx';
import { Token } from 'constants';
import _ from 'lodash';

import SyncInfo from './models/SyncInfo';
import Market from './models/Market';
import { querySyncInfo, queryAllNewOrders, queryAllMarkets } from '../network/graphql/queries';
import getSubscription, { channels } from '../network/graphql/subscriptions';
import apolloClient from '../network/graphql';
import AppConfig from '../config/app';


const INIT_VALUES = {
  marketInfo: '',
  selectedOrderInfo: '',
  selectedOrderId: 0,
  syncPercent: 0,
  syncBlockNum: 0,
  syncBlockTime: '',
  peerNodeCount: 1,
};
let syncInfoInterval;

export default class GlobalStore {
  @observable selectedOrderId = INIT_VALUES.selectedOrderId
  @observable selectedOrderInfo = INIT_VALUES.selectedOrderInfo
  @observable marketInfo = INIT_VALUES.marketInfo
  @observable syncPercent = INIT_VALUES.syncPercent
  @observable syncBlockNum = INIT_VALUES.syncBlockNum
  @observable syncBlockTime = INIT_VALUES.syncBlockTime
  @observable peerNodeCount = INIT_VALUES.peerNodeCount

  constructor(app) {
    this.app = app;
    // Disable the syncInfo polling since we will get new syncInfo from the subscription
    reaction(
      () => this.syncPercent,
      () => {
        if (this.syncPercent >= 100) {
          clearInterval(syncInfoInterval);
        }
      },
    );

    // Call syncInfo once to init the wallet addresses used by other stores
    this.getSyncInfo();
    this.subscribeSyncInfo();

    // Call Selected Order info
    this.getSelectedOrderInfo();
    this.subscribeSelectedOrderInfo();

    // Start syncInfo long polling
    // We use this to update the percentage of the loading screen
    syncInfoInterval = setInterval(this.getSyncInfo, AppConfig.intervals.syncInfo);
    setInterval(this.getSelectedOrderInfo, AppConfig.intervals.selectedOrderInfo);
  }

  /*
  *
  *
  */
  @action
  setSelectedOrderId = (orderId) => {
    this.selectedOrderId = orderId;
  }

  /*
  *
  *
  */
  @action
  onSelectedOrderInfo = (selectedOrderInfo) => {
    if (selectedOrderInfo.error) {
      console.error(selectedOrderInfo.error.message); // eslint-disable-line no-console
    } else {
      this.selectedOrderInfo = selectedOrderInfo[0]; // eslint-disable-line
    }
  }

  /*
  *
  *
  */
  @action
  getSelectedOrderInfo = async () => {
    try {
      if (this.selectedOrderId !== 0) {
        const orderBy = { field: 'price', direction: 'ASC' };
        const filters = [{ orderId: this.selectedOrderId }];
        const selectedOrderInfo = await queryAllNewOrders(filters, orderBy, 0, 0);
        this.onSelectedOrderInfo(selectedOrderInfo);
      }
    } catch (error) {
      this.onSelectedOrderInfo({ error });
    }
  }

  /*
  *
  *
  */
  subscribeSelectedOrderInfo = () => {
    const self = this;
    apolloClient.subscribe({
      query: getSubscription(channels.ON_SELECTEDORDER_INFO),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.onSelectedOrderInfo({ error: errors[0] });
        } else {
          self.onSelectedOrderInfo(data.onSelectedOrderInfo);
        }
      },
      error(err) {
        self.onSelectedOrderInfo({ error: err.message });
      },
    });
  }


  /*
  *
  *
  */
  subscribeMarketInfo = () => {
    const self = this;
    apolloClient.subscribe({
      query: getSubscription(channels.ON_MARKET_INFO),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.onMarketInfo({ error: errors[0] });
        } else {
          self.onMarketInfo(data);
        }
      },
      error(err) {
        self.onMarketInfo({ error: err.message });
      },
    });
  }

  /*
  *
  *
  */
  @action
  onSyncInfo = (syncInfo) => {
    if (syncInfo.error) {
      console.error(syncInfo.error.message); // eslint-disable-line no-console
    } else {
      const { percent, blockNum, blockTime, balances, exchangeBalances, peerNodeCount } = new SyncInfo(syncInfo);
      this.syncPercent = percent;
      this.syncBlockNum = blockNum;
      this.syncBlockTime = blockTime;
      this.peerNodeCount = peerNodeCount || 0;
      this.app.wallet.addresses = balances;
      this.app.wallet.exchangeAddresses = exchangeBalances;
    }
  }

  /**
   * Queries syncInfo by GraphQL call.
   * This is long-polled in the beginning while the server is syncing the blockchain.
   */
  @action
  getSyncInfo = async () => {
    try {
      const includeBalances = this.syncPercent === 0 || this.syncPercent >= 98;
      const syncInfo = await querySyncInfo(includeBalances);
      this.onSyncInfo(syncInfo);
    } catch (error) {
      this.onSyncInfo({ error });
    }
  }

  /**
   * Subscribe to syncInfo subscription.
   * This is meant to be used after the long-polling getSyncInfo is finished.
   * This subscription will return a syncInfo on every new block.
   */
  subscribeSyncInfo = () => {
    const self = this;
    apolloClient.subscribe({
      query: getSubscription(channels.ON_SYNC_INFO),
    }).subscribe({
      next({ data, errors }) {
        if (errors && errors.length > 0) {
          self.onSyncInfo({ error: errors[0] });
        } else {
          self.onSyncInfo(data.onSyncInfo);
        }
      },
      error(err) {
        self.onSyncInfo({ error: err.message });
      },
    });
  }
}
