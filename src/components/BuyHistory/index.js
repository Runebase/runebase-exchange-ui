import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { Card } from '@material-ui/core';
import BuyHistoryView from './BuyHistoryView';

@inject('store')
@observer
export default class BuyHistory extends Component {
  handleNext = async () => {
    this.props.store.buyHistoryStore.skip = this.props.store.buyHistoryStore.skip + 10;
    await this.props.store.buyHistoryStore.getBuyHistoryInfo();
  }
  handlePrevious = async () => {
    this.props.store.buyHistoryStore.skip = this.props.store.buyHistoryStore.skip - 10;
    await this.props.store.buyHistoryStore.getBuyHistoryInfo();
  }

  render() {
    const { buyHistoryStore, wallet } = this.props.store;
    return (
      <Fragment>
        <Card className='dashboardOrderBookTitle'>
          <p>Buy History ({ wallet.currentMarket })</p>
        </Card>
        <Trades buyHistoryStore={buyHistoryStore} />
        <div className='centerText'>
          <button
            disabled={!buyHistoryStore.hasLess}
            onClick={this.handlePrevious}
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!buyHistoryStore.hasMore}
          >
            Next Page
          </button>
        </div>
      </Fragment>
    );
  }
}

const Trades = observer(({ buyHistoryStore: { buyHistoryInfo } }) => {
  const buyHistory = (buyHistoryInfo || []).map((event, i) => <BuyHistoryView key={i} index={i} event={event} />); // eslint-disable-line
  return (
    buyHistory
  );
});

