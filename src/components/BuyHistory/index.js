/* eslint-disable react/jsx-props-no-spreading, react/destructuring-assignment, operator-assignment, react/jsx-one-expression-per-line, react/jsx-fragments, react/button-has-type */
import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { Card } from '@material-ui/core';
import { defineMessages } from 'react-intl';
import BuyHistoryView from './BuyHistoryView';
import LoadingElement from '../Loading';

const messages = defineMessages({
  loadBuyHistoryMsg: {
    id: 'load.buyHistory',
    defaultMessage: 'loading',
  },
});

export default @inject('store') @observer class BuyHistory extends Component {
  handleNext = async () => {
    this.props.store.buyHistoryStore.loading = true;
    this.props.store.buyHistoryStore.skip = this.props.store.buyHistoryStore.skip + 10;
    await this.props.store.buyHistoryStore.getBuyHistoryInfo();
    this.props.store.buyHistoryStore.loading = false;
  }

  handlePrevious = async () => {
    this.props.store.buyHistoryStore.loading = true;
    this.props.store.buyHistoryStore.skip = this.props.store.buyHistoryStore.skip - 10;
    await this.props.store.buyHistoryStore.getBuyHistoryInfo();
    this.props.store.buyHistoryStore.loading = false;
  }

  render() {
    const { buyHistoryStore, wallet } = this.props.store;
    const { currentMarket } = wallet;
    return (
      <Fragment>
        <Card className='dashboardOrderBookTitle'>
          <p>Buy History ({ currentMarket })</p>
        </Card>
        <Trades buyHistoryStore={buyHistoryStore} />
        <div className='centerText'>
          <button
            disabled={!buyHistoryStore.hasLess || buyHistoryStore.loading}
            onClick={this.handlePrevious}
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!buyHistoryStore.hasMore || buyHistoryStore.loading}
          >
            Next Page
          </button>
        </div>
      </Fragment>
    );
  }
}

const Trades = observer(({ buyHistoryStore: { buyHistoryInfo, loading } }) => {
  if (loading) return <Loading />;
  const buyHistory = (buyHistoryInfo || []).map((event, i) => <BuyHistoryView key={i} index={i} event={event} />); // eslint-disable-line
  return (
    buyHistory
  );
});

const Loading = () => <Row><LoadingElement text={messages.loadBuyBookMsg} /></Row>;

const Row = ({ ...props }) => <div {...props} />;
