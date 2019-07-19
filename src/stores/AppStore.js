import { observable, runInAction } from 'mobx';
import { RouterStore } from 'mobx-react-router';

import GlobalStore from './GlobalStore';
import UiStore from './UiStore';
import RefreshingStore from './RefreshingStore';
import ActivityHistoryStore from '../scenes/Activities/ActivityHistory/store';
import WalletStore from './WalletStore';
import GlobalSnackbarStore from '../components/GlobalSnackbar/store';
import WalletUnlockDialogStore from '../components/WalletUnlockDialog/store';
import PendingTxsSnackbarStore from '../components/PendingTxsSnackbar/store';
import WalletHistoryStore from '../scenes/Wallet/History/store';
import BuyStore from './BuyStore';
import SellStore from './SellStore';
import MyTradeStore from './MyTradeStore';
import ActiveOrderStore from './ActiveOrderStore';
import FulfilledOrderStore from './FulfilledOrderStore';
import CanceledOrderStore from './CanceledOrderStore';
import BuyHistoryStore from './BuyHistoryStore';
import SellHistoryStore from './SellHistoryStore';
import PriceChartStore from './PriceChartStore';
import FundRedeemHistoryStore from './FundRedeemHistoryStore';

class AppStore {
  @observable loading = true;
  @observable sortBy = 'ASC' // TODO: have each store have their own sortBy

  global = {}
  ui = {}
  wallet = {}
  globalSnackbar = {}
  walletUnlockDialog = {}
  pendingTxsSnackbar = {}
  refreshing = {}
  activities = {}
  buyStore = {}
  sellStore = {}
  myTradeStore = {}
  sellHistoryStore = {}
  buyHistoryStore = {}
  activeOrderStore = {}
  fulfilledOrderStore = {}
  canceledOrderStore = {}
  priceChartStore = {}
  FundRedeemHistoryStore = {}

  constructor() {
    // block content until all stores are initialized
    this.loading = true;

    this.router = new RouterStore();
    this.global = new GlobalStore(this);
    this.ui = new UiStore();
    this.wallet = new WalletStore(this);
    this.globalSnackbar = new GlobalSnackbarStore();
    this.walletUnlockDialog = new WalletUnlockDialogStore(this);
    this.pendingTxsSnackbar = new PendingTxsSnackbarStore(this);
    this.refreshing = new RefreshingStore();

    runInAction(() => {
      this.fundRedeemHistoryStore = new FundRedeemHistoryStore(this);
      this.priceChartStore = new PriceChartStore(this);
      this.buyStore = new BuyStore(this);
      this.sellStore = new SellStore(this);
      this.myTradeStore = new MyTradeStore(this);
      this.sellHistoryStore = new SellHistoryStore(this);
      this.buyHistoryStore = new BuyHistoryStore(this);
      this.canceledOrderStore = new CanceledOrderStore(this);
      this.fulfilledOrderStore = new FulfilledOrderStore(this);
      this.activeOrderStore = new ActiveOrderStore(this);
      this.activities = {
        history: new ActivityHistoryStore(this),
      };
      this.myWallet = {
        history: new WalletHistoryStore(this),
      };

      // finished loading all stores, show UI
      this.loading = false;
    });
  }
}

const store = new AppStore();
if (process.env.REACT_APP_ENV === 'dev') {
  window.xstore = store;
}

export default store;
