/* eslint-disable react/destructuring-assignment */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Chart from './Chart';

export default @inject('store') @observer class ChartComponent extends Component {
  componentDidMount() {
    this.props.store.priceChartStore.getChartInfo();
  }

  render() {
    const { store: { priceChartStore } } = this.props;
    if (priceChartStore.chartInfo == null) {
      return <div>Loading...</div>;
    }
    return (
      <Chart type='svg' data={priceChartStore.chartInfo} />
    );
  }
}