/* eslint-disable react/jsx-props-no-spreading, react/destructuring-assignment, operator-assignment, react/jsx-one-expression-per-line, react/jsx-fragments, react/button-has-type */
import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { Card } from '@material-ui/core';
import { defineMessages } from 'react-intl';
import SellHistoryView from './SellHistoryView';
import LoadingElement from '../Loading';

const messages = defineMessages({
  loadSellHistoryMsg: {
    id: 'load.sellHistory',
    defaultMessage: 'loading',
  },
});

export default @inject('store') @observer class SellHistory extends Component {
  handleNext = async () => {
    this.props.store.sellHistoryStore.loading = true;
    this.props.store.sellHistoryStore.skip = this.props.store.sellHistoryStore.skip + 10;
    await this.props.store.sellHistoryStore.getSellHistoryInfo();
    this.props.store.sellHistoryStore.loading = false;
  }

  handlePrevious = async () => {
    this.props.store.sellHistoryStore.loading = true;
    this.props.store.sellHistoryStore.skip = this.props.store.sellHistoryStore.skip - 10;
    await this.props.store.sellHistoryStore.getSellHistoryInfo();
    this.props.store.sellHistoryStore.loading = false;
  }

  render() {
    const { sellHistoryStore, wallet } = this.props.store;
    return (
      <Fragment>
        <Card className='dashboardOrderBookTitle'>
          <p>Sell History ({ wallet.currentMarket })</p>
        </Card>
        <Trades sellHistoryStore={sellHistoryStore} />
        <div className='centerText'>
          <button
            disabled={!sellHistoryStore.hasLess || sellHistoryStore.loading}
            onClick={this.handlePrevious}
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!sellHistoryStore.hasMore || sellHistoryStore.loading}
          >
            Next Page
          </button>
        </div>
      </Fragment>
    );
  }
}

const Trades = observer(({ sellHistoryStore: { sellHistoryInfo, loading } }) => {
  if (loading) return <Loading />;
  const sellHistory = (sellHistoryInfo || []).map((event, i) => <SellHistoryView key={i} index={i} event={event} />); // eslint-disable-line
  return (
    sellHistory
  );
});

const Loading = () => <Row><LoadingElement text={messages.loadSellHistoryMsg} /></Row>;

const Row = ({ ...props }) => <div {...props} />;
