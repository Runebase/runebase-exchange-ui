import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { Card, Tab, Tabs, AppBar, withStyles } from '@material-ui/core';
import { defineMessages } from 'react-intl';
import SwipeableViews from 'react-swipeable-views';
import _Loading from '../Loading';
import OrderBook from './OrderBook';

const messages = defineMessages({
  loadAllOrdersMsg: {
    id: 'load.allOrders',
    defaultMessage: 'loading',
  },
});

@inject('store')
@observer
export default class MyOrderBook extends Component {
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
    this.props.store.activeOrderStore.skip = this.props.store.activeOrderStore.skip + 10;
    await this.props.store.activeOrderStore.getActiveOrderInfo();
  }

  handleActivePrevious = async () => {
    this.props.store.activeOrderStore.skip = this.props.store.activeOrderStore.skip - 10;
    await this.props.store.activeOrderStore.getActiveOrderInfo();
  }

  handleFulfilledNext = async () => {
    this.props.store.fulfilledOrderStore.skip = this.props.store.fulfilledOrderStore.skip + 10;
    await this.props.store.fulfilledOrderStore.getFulfilledOrderInfo();
  }

  handleFulfilledPrevious = async () => {
    this.props.store.fulfilledOrderStore.skip = this.props.store.fulfilledOrderStore.skip - 10;
    await this.props.store.fulfilledOrderStore.getFulfilledOrderInfo();
  }

  handleCanceledNext = async () => {
    this.props.store.canceledOrderStore.skip = this.props.store.canceledOrderStore.skip + 10;
    await this.props.store.canceledOrderStore.getCanceledOrderInfo();
  }

  handleCanceledPrevious = async () => {
    this.props.store.canceledOrderStore.skip = this.props.store.canceledOrderStore.skip - 10;
    await this.props.store.canceledOrderStore.getCanceledOrderInfo();
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
                disabled={!activeOrderStore.hasLess}
                onClick={this.handleActivePrevious}
              >
                Previous Page
              </button>
              <button
                onClick={this.handleActiveNext}
                disabled={!activeOrderStore.hasMore}
              >
                Next Page
              </button>
            </div>
          }
          {this.state.value === 1 &&
            <div>
              <button
                disabled={!fulfilledOrderStore.hasLess}
                onClick={this.handleFulfilledPrevious}
              >
                Previous Page
              </button>
              <button
                onClick={this.handleFulfilledNext}
                disabled={!fulfilledOrderStore.hasMore}
              >
                Next Page
              </button>
            </div>
          }
          {this.state.value === 2 &&
            <div>
              <button
                disabled={!canceledOrderStore.hasLess}
                onClick={this.handleCanceledPrevious}
              >
                Previous Page
              </button>
              <button
                onClick={this.handleCanceledNext}
                disabled={!canceledOrderStore.hasMore}
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
  if (loading) return <Loading />;
  const activeOrders = (activeOrderInfo || []).map((order, i) => <OrderBook key={i} index={i} order={order} />); // eslint-disable-line
  return (
    activeOrders
  );
});

const OrdersFulFilled = observer(({ fulfilledOrderStore: { fulfilledOrderInfo, loading } }) => {
  if (loading) return <Loading />;
  const filledOrders = (fulfilledOrderInfo || []).map((order, i) => <OrderBook key={i} index={i} order={order} />); // eslint-disable-line
  return (
    filledOrders
  );
});

const OrdersCanceled = observer(({ canceledOrderStore: { canceledOrderInfo, loading } }) => {
  if (loading) return <Loading />;
  const canceledOrders = (canceledOrderInfo || []).map((order, i) => <OrderBook key={i} index={i} order={order} />); // eslint-disable-line
  return (
    canceledOrders
  );
});

const Loading = withStyles()(() => <Row><_Loading text={messages.loadAllOrdersMsg} /></Row>);

const Row = withStyles()(({ ...props }) => (
  <div {...props} />
));
