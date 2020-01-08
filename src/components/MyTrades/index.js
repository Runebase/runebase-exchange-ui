/* eslint-disable react/jsx-props-no-spreading, react/destructuring-assignment, operator-assignment, react/jsx-one-expression-per-line, react/jsx-fragments, react/button-has-type */
import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { defineMessages } from 'react-intl';
import { Card } from '@material-ui/core';
import MyTradesView from './MyTradesView';
import LoadingElement from '../Loading';

const messages = defineMessages({
  loadMyTradesMsg: {
    id: 'load.allMyTrades',
    defaultMessage: 'loading',
  },
});

export default @inject('store') @observer class MyTrades extends Component {
  handleNext = async () => {
    this.props.store.myTradeStore.loading = true;
    this.props.store.myTradeStore.skip = this.props.store.myTradeStore.skip + 10;
    await this.props.store.myTradeStore.getMyTradeInfo();
    this.props.store.myTradeStore.loading = false;
  }

  handlePrevious = async () => {
    this.props.store.myTradeStore.loading = true;
    this.props.store.myTradeStore.skip = this.props.store.myTradeStore.skip - 10;
    await this.props.store.myTradeStore.getMyTradeInfo();
    this.props.store.myTradeStore.loading = false;
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
            disabled={!myTradeStore.hasLess || myTradeStore.loading}
            onClick={this.handlePrevious}
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!myTradeStore.hasMore || myTradeStore.loading}
          >
            Next Page
          </button>
        </div>
      </Fragment>
    );
  }
}

const Trades = observer(({ myTradeStore: { myTradeInfo, loading } }) => {
  if (loading) return <Loading />;
  const myTrades = (myTradeInfo || []).map((event, i) => <MyTradesView key={i} index={i} event={event} />); // eslint-disable-line
  return (
    myTrades
  );
});

const Loading = () => <Row><LoadingElement text={messages.loadFundRedeemMsg} /></Row>;

const Row = ({ ...props }) => <div {...props} />;
