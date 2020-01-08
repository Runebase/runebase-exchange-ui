/* eslint-disable react/jsx-props-no-spreading, react/destructuring-assignment, operator-assignment, react/jsx-one-expression-per-line, react/jsx-fragments, react/button-has-type */
import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { defineMessages } from 'react-intl';
import { Card } from '@material-ui/core';
import FundRedeemHistoryView from './FundRedeemHistoryView';
import LoadingElement from '../Loading';

const messages = defineMessages({
  loadFundRedeemMsg: {
    id: 'load.allOrders',
    defaultMessage: 'loading',
  },
});

export default @inject('store') @observer class FundRedeemHistory extends Component {
  handleNext = async () => {
    this.props.store.fundRedeemHistoryStore.loading = true;
    this.props.store.fundRedeemHistoryStore.skip = this.props.store.fundRedeemHistoryStore.skip + 10;
    await this.props.store.fundRedeemHistoryStore.getFundRedeemInfo();
    this.props.store.fundRedeemHistoryStore.loading = false;
  }

  handlePrevious = async () => {
    this.props.store.fundRedeemHistoryStore.loading = true;
    this.props.store.fundRedeemHistoryStore.skip = this.props.store.fundRedeemHistoryStore.skip - 10;
    await this.props.store.fundRedeemHistoryStore.getFundRedeemInfo();
    this.props.store.fundRedeemHistoryStore.loading = false;
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
            disabled={!fundRedeemHistoryStore.hasLess || fundRedeemHistoryStore.loading}
            onClick={this.handlePrevious}
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!fundRedeemHistoryStore.hasMore || fundRedeemHistoryStore.loading}
          >
            Next Page
          </button>
        </div>
      </Fragment>
    );
  }
}

const History = observer(({ fundRedeemHistoryStore: { fundRedeemInfo, loading } }) => {
  if (loading) return <Loading />;
  const fundRedeem = (fundRedeemInfo || []).map((event, i) => <FundRedeemHistoryView key={i} index={i} event={event} />); // eslint-disable-line
  return (
    fundRedeem
  );
});

const Loading = () => <Row><LoadingElement text={messages.loadFundRedeemMsg} /></Row>;

const Row = ({ ...props }) => <div {...props} />;
