/* eslint-disable react/destructuring-assignment, operator-assignment, react/jsx-one-expression-per-line, react/jsx-fragments, react/button-has-type */
import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { Card } from '@material-ui/core';
import MyTradesView from './MyTradesView';

export default @inject('store') @observer class MyTrades extends Component {
  handleNext = async () => {
    this.props.store.myTradeStore.skip = this.props.store.myTradeStore.skip + 10;
    await this.props.store.myTradeStore.getMyTradeInfo();
  }

  handlePrevious = async () => {
    this.props.store.myTradeStore.skip = this.props.store.myTradeStore.skip - 10;
    await this.props.store.myTradeStore.getMyTradeInfo();
  }

  render() {
    const { myTradeStore } = this.props.store;
    return (
      <Fragment>
        <Card className='dashboardOrderBookTitle'>
          <p>My Trades</p>
        </Card>
        <Trades myTradeStore={myTradeStore} />
        <div className='centerText'>
          <button
            disabled={!myTradeStore.hasLess}
            onClick={this.handlePrevious}
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!myTradeStore.hasMore}
          >
            Next Page
          </button>
        </div>
      </Fragment>
    );
  }
}

const Trades = observer(({ myTradeStore: { myTradeInfo } }) => {
  const myTrades = (myTradeInfo || []).map((event, i) => <MyTradesView key={i} index={i} event={event} />); // eslint-disable-line
  return (
    myTrades
  );
});
