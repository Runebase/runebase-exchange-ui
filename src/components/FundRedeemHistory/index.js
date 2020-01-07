/* eslint-disable react/destructuring-assignment, operator-assignment, react/jsx-one-expression-per-line, react/jsx-fragments, react/button-has-type */
import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { Card } from '@material-ui/core';
import FundRedeemHistoryView from './FundRedeemHistoryView';

export default @inject('store') @observer class FundRedeemHistory extends Component {
  handleNext = async () => {
    this.props.store.fundRedeemHistoryStore.skip = this.props.store.fundRedeemHistoryStore.skip + 10;
    await this.props.store.myTradeStore.getMyTradeInfo();
  }

  handlePrevious = async () => {
    this.props.store.fundRedeemHistoryStore.skip = this.props.store.fundRedeemHistoryStore.skip - 10;
    await this.props.store.myTradeStore.getMyTradeInfo();
  }

  render() {
    const { fundRedeemHistoryStore } = this.props.store;
    return (
      <Fragment>
        <Card className='dashboardOrderBookTitle'>
          <p>Fund/Redeem History</p>
        </Card>
        <History fundRedeemHistoryStore={fundRedeemHistoryStore} />
        <div className='centerText'>
          <button
            disabled={!fundRedeemHistoryStore.hasLess}
            onClick={this.handlePrevious}
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!fundRedeemHistoryStore.hasMore}
          >
            Next Page
          </button>
        </div>
      </Fragment>
    );
  }
}

const History = observer(({ fundRedeemHistoryStore: { fundRedeemInfo } }) => {
  const fundRedeem = (fundRedeemInfo || []).map((event, i) => <FundRedeemHistoryView key={i} index={i} event={event} />); // eslint-disable-line
  return (
    fundRedeem
  );
});
