import { observable, action, runInAction, computed, reaction } from 'mobx';
import { Routes } from 'constants';
import { getChartData } from '../helpers/utility';

const INIT_VALUES = {
  chartInfo: null, // INIT_VALUESial loaded state
  loading: true,
};

export default class {
  @observable chartInfo = INIT_VALUES.chartInfo
  @computed get hasChartInfo() {
    return this.chartInfo;
  }

  constructor(app) {
    this.app = app;
    reaction(
      () => this.app.sortBy + this.app.wallet.addresses + this.app.refreshing + this.app.global.syncBlockNum,
      () => {
        if (this.app.ui.location === Routes.EXCHANGE) {
          this.getChartInfo();
        }
      }
    );
  }

  @action
  getChartInfo = async () => {
    this.app.ui.location = Routes.EXCHANGE;
    const currentMarket = `http://localhost:8989/${this.app.wallet.currentMarket}.tsv`;
    getChartData(currentMarket).then(data => {
      this.onChartInfo(data);
    });
    runInAction(() => {
      this.loading = false;
    });
  }

  @action
  onChartInfo = (data) => {
    if (data.error) {
      console.error(data.error.message); // eslint-disable-line no-console
    } else {
      this.chartInfo = data;
    }
  }
}
