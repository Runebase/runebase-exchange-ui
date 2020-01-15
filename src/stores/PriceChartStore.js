import { observable, action, runInAction, computed, reaction } from 'mobx';
import _ from 'lodash';
import { Routes } from 'constants';
import Ohlc from './models/Ohlc';
import Volume from './models/Volume';
import { queryAllCharts } from '../network/graphql/queries';
import { getChartData } from '../helpers/utility';

const INIT_VALUES = {
  ohlcInfo: null,
  volumeInfo: null,
  loading: true,
};

export default class {
  @observable ohlcInfo = INIT_VALUES.ohlcInfo

  @observable volumeInfo = INIT_VALUES.volumeInfo

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

  getChartInfo = async (limit = 500, skip = 0) => {
    try {
      this.ohlcInfo = null;
      this.volumeInfo = null;
      const orderBy = { field: 'time', direction: 'ASC' };
      let chartInfo = [];
      const filters = [
        { timeTable: '1h', tokenAddress: this.app.wallet.tokenAddress },
      ];
      chartInfo = await queryAllCharts(filters, orderBy, limit, skip);
      console.log(chartInfo);
      this.onChartInfo(chartInfo);
    } catch (error) {
      this.onChartInfo({ error });
    }
  }

  @action
  onChartInfo = (chartInfo) => {
    if (chartInfo.error) {
      console.error(chartInfo.error.message); // eslint-disable-line no-console
    } else {
      console.log('onChartInfo');
      const result = _.uniqBy(chartInfo, 'time').map((chart) => new Ohlc(chart, this.app));
      this.ohlcInfo = _.orderBy(result, ['time'], 'desc');
      const result2 = _.uniqBy(chartInfo, 'time').map((chart) => new Volume(chart, this.app));
      this.volumeInfo = _.orderBy(result2, ['time'], 'desc');

      console.log(this.ohlcInfo);
      console.log(this.volumeInfo);
    }
  }
}
