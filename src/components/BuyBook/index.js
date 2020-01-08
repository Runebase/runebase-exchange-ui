/* eslint-disable react/destructuring-assignment, operator-assignment, react/jsx-fragments, react/jsx-one-expression-per-line, react/button-has-type, react/jsx-props-no-spreading */
import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { Card } from '@material-ui/core';
import { defineMessages } from 'react-intl';
import OrderBook from './OrderBook';
import LoadingElement from '../Loading';

const messages = defineMessages({
  loadBuyBookMsg: {
    id: 'load.buyBook',
    defaultMessage: 'loading',
  },
});

export default @inject('store') @observer class BuyBook extends Component {
  handleNext = async () => {
    this.props.store.buyStore.loading = true;
    this.props.store.buyStore.skip = this.props.store.buyStore.skip + 5;
    await this.props.store.buyStore.getBuyOrderInfo();
    this.props.store.buyStore.loading = false;
  }

  handlePrevious = async () => {
    this.props.store.buyStore.loading = true;
    this.props.store.buyStore.skip = this.props.store.buyStore.skip - 5;
    await this.props.store.buyStore.getBuyOrderInfo();
    this.props.store.buyStore.loading = false;
  }

  render() {
    const { buyStore, wallet } = this.props.store;
    return (
      <Fragment>
        <Card className='dashboardOrderBookTitle'>
          <p>People Buying {wallet.market}</p>
        </Card>
        <Events buyStore={buyStore} />
        <div className='centerText'>
          <button
            disabled={!buyStore.hasLess || buyStore.loading}
            onClick={this.handlePrevious}
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!buyStore.hasMore || buyStore.loading}
          >
            Next Page
          </button>
        </div>
      </Fragment>
    );
  }
}

const Events = observer(({ buyStore: { buyOrderInfo, loading } }) => {
  if (loading) return <Loading />;
  const events = (buyOrderInfo || []).map((event, i) => <OrderBook key={i} index={i} event={event} />); // eslint-disable-line
  return (
    events
  );
});

const Loading = () => <Row><LoadingElement text={messages.loadBuyBookMsg} /></Row>;

const Row = ({ ...props }) => <div {...props} />;
