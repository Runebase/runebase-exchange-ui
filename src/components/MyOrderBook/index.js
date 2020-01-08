/* eslint-disable react/jsx-props-no-spreading, react/button-has-type, react/jsx-curly-newline, react/destructuring-assignment, operator-assignment, operator-linebreak, react/jsx-wrap-multilines, react/jsx-fragments */
import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { Card, Tab, Tabs, AppBar } from '@material-ui/core';
import { defineMessages } from 'react-intl';
import SwipeableViews from 'react-swipeable-views';
import LoadingElement from '../Loading';
import OrderBook from './OrderBook';

const messages = defineMessages({
  loadCurrentOrdersMsg: {
    id: 'load.currentOrders',
    defaultMessage: 'loading',
  },
  loadFulfilledOrdersMsg: {
    id: 'load.fulfilledOrders',
    defaultMessage: 'loading',
  },
  loadCanceledOrdersMsg: {
    id: 'load.canceledOrders',
    defaultMessage: 'loading',
  },
});

export default @inject('store') @observer class MyOrderBook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
    };
  }

  componentDidMount() {
    this.props.store.activeOrderStore.init();
    this.props.store.fulfilledOrderStore.init();
    this.props.store.canceledOrderStore.init();
  }

  handleActiveNext = async () => {
    this.props.store.activeOrderStore.loading = true;
    this.props.store.activeOrderStore.skip = this.props.store.activeOrderStore.skip + 10;
    await this.props.store.activeOrderStore.getActiveOrderInfo();
    this.props.store.activeOrderStore.loading = false;
  }

  handleActivePrevious = async () => {
    this.props.store.activeOrderStore.loading = true;
    this.props.store.activeOrderStore.skip = this.props.store.activeOrderStore.skip - 10;
    await this.props.store.activeOrderStore.getActiveOrderInfo();
    this.props.store.activeOrderStore.loading = false;
  }

  handleFulfilledNext = async () => {
    this.props.store.fulfilledOrderStore.loading = true;
    this.props.store.fulfilledOrderStore.skip = this.props.store.fulfilledOrderStore.skip + 10;
    await this.props.store.fulfilledOrderStore.getFulfilledOrderInfo();
    this.props.store.fulfilledOrderStore.loading = false;
  }

  handleFulfilledPrevious = async () => {
    this.props.store.fulfilledOrderStore.loading = true;
    this.props.store.fulfilledOrderStore.skip = this.props.store.fulfilledOrderStore.skip - 10;
    await this.props.store.fulfilledOrderStore.getFulfilledOrderInfo();
    this.props.store.fulfilledOrderStore.loading = false;
  }

  handleCanceledNext = async () => {
    this.props.store.canceledOrderStore.loading = true;
    this.props.store.canceledOrderStore.skip = this.props.store.canceledOrderStore.skip + 10;
    await this.props.store.canceledOrderStore.getCanceledOrderInfo();
    this.props.store.canceledOrderStore.loading = false;
  }

  handleCanceledPrevious = async () => {
    this.props.store.canceledOrderStore.loading = true;
    this.props.store.canceledOrderStore.skip = this.props.store.canceledOrderStore.skip - 10;
    await this.props.store.canceledOrderStore.getCanceledOrderInfo();
    this.props.store.canceledOrderStore.loading = false;
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  render() {
    const { activeOrderStore, fulfilledOrderStore, canceledOrderStore } = this.props.store;

    return (
      <Fragment>
        <Card className='dashboardOrderBookTitle'>
          <p>My Orders</p>
        </Card>
        <AppBar position="static" color="default">
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            fullWidth
          >
            <Tab label="Current" />
            <Tab label="FulFilled" />
            <Tab label="Canceled" />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis='x-reverse'
          index={this.state.value}
          onChangeIndex={this.handleChangeIndex}
        >
          <Orders activeOrderStore={activeOrderStore} />
          <OrdersFulFilled fulfilledOrderStore={fulfilledOrderStore} />
          <OrdersCanceled canceledOrderStore={canceledOrderStore} />
        </SwipeableViews>
        <div className='centerText'>
          {this.state.value === 0 &&
            <div>
              <button
                disabled={!activeOrderStore.hasLess || activeOrderStore.loading}
                onClick={this.handleActivePrevious}
              >
                Previous Page
              </button>
              <button
                onClick={this.handleActiveNext}
                disabled={!activeOrderStore.hasMore || activeOrderStore.loading}
              >
                Next Page
              </button>
            </div>
          }
          {this.state.value === 1 &&
            <div>
              <button
                disabled={!fulfilledOrderStore.hasLess || fulfilledOrderStore.loading}
                onClick={this.handleFulfilledPrevious}
              >
                Previous Page
              </button>
              <button
                onClick={this.handleFulfilledNext}
                disabled={!fulfilledOrderStore.hasMore || fulfilledOrderStore.loading}
              >
                Next Page
              </button>
            </div>
          }
          {this.state.value === 2 &&
            <div>
              <button
                disabled={!canceledOrderStore.hasLess || canceledOrderStore.loading}
                onClick={this.handleCanceledPrevious}
              >
                Previous Page
              </button>
              <button
                onClick={this.handleCanceledNext}
                disabled={!canceledOrderStore.hasMore || canceledOrderStore.loading}
              >
                Next Page
              </button>
            </div>
          }
        </div>
      </Fragment>
    );
  }
}

const Orders = observer(({ activeOrderStore: { activeOrderInfo, loading } }) => {
  if (loading) return <Loading1 />;
  const activeOrders = (activeOrderInfo || []).map((order, i) => <OrderBook key={i} index={i} order={order} />); // eslint-disable-line
  return (
    activeOrders
  );
});

const OrdersFulFilled = observer(({ fulfilledOrderStore: { fulfilledOrderInfo, loading } }) => {
  if (loading) return <Loading2 />;
  const filledOrders = (fulfilledOrderInfo || []).map((order, i) => <OrderBook key={i} index={i} order={order} />); // eslint-disable-line
  return (
    filledOrders
  );
});

const OrdersCanceled = observer(({ canceledOrderStore: { canceledOrderInfo, loading } }) => {
  if (loading) return <Loading3 />;
  const canceledOrders = (canceledOrderInfo || []).map((order, i) => <OrderBook key={i} index={i} order={order} />); // eslint-disable-line
  return (
    canceledOrders
  );
});

const Loading1 = () => <Row><LoadingElement text={messages.loadCurrentOrdersMsg} /></Row>;

const Loading2 = () => <Row><LoadingElement text={messages.loadFulfilledOrdersMsg} /></Row>;

const Loading3 = () => <Row><LoadingElement text={messages.loadCanceledOrdersMsg} /></Row>;

const Row = ({ ...props }) => <div {...props} />;
