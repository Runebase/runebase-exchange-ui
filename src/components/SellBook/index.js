/* eslint-disable react/destructuring-assignment, operator-assignment, react/jsx-fragments, react/jsx-one-expression-per-line, react/button-has-type, react/jsx-props-no-spreading */
import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { Card } from '@material-ui/core';
import { defineMessages } from 'react-intl';
import OrderBook from './OrderBook';
import LoadingElement from '../Loading';

const messages = defineMessages({
  loadSellBookMsg: {
    id: 'load.sellBook',
    defaultMessage: 'loading',
  },
});

export default @inject('store') @observer class SellBook extends Component {
  handleNext = async () => {
    this.props.store.sellStore.loading = true;
    this.props.store.sellStore.skip = this.props.store.sellStore.skip + 5;
    await this.props.store.sellStore.getSellOrderInfo();
    this.props.store.sellStore.loading = false;
  }

  handlePrevious = async () => {
    this.props.store.sellStore.loading = true;
    this.props.store.sellStore.skip = this.props.store.sellStore.skip - 5;
    await this.props.store.sellStore.getSellOrderInfo();
    this.props.store.sellStore.loading = false;
  }

  render() {
    const { sellStore, wallet } = this.props.store;
    console.log(sellStore.sellOrderInfo);
    return (
      <Fragment>
        <Card className='dashboardOrderBookTitle'>
          <p>People Selling {wallet.market}</p>
        </Card>
        <SellOrders sellStore={sellStore} />
        <div className='centerText'>
          <button
            disabled={!sellStore.hasLess || sellStore.loading}
            onClick={this.handlePrevious}
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!sellStore.hasMore || sellStore.loading}
          >
            Next Page
          </button>
        </div>
      </Fragment>
    );
  }
}

const SellOrders = observer(({ sellStore: { sellOrderInfo, loading } }) => {
  if (loading) return <Loading />;
  const events = (sellOrderInfo || []).map((event, i) => <OrderBook key={i} index={i} event={event} />); // eslint-disable-line
  return (
    events
  );
});

const Loading = () => <Row><LoadingElement text={messages.loadSellBookMsg} /></Row>;

const Row = ({ ...props }) => <div {...props} />;
