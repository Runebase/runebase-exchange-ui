import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles, Card } from '@material-ui/core';
import { defineMessages } from 'react-intl';

import OrderBook from './OrderBook';
import _Loading from '../Loading';
import styles from './style.css';


const messages = defineMessages({
  loadAllNewOrdersMsg: {
    id: 'load.allNewOrders',
    defaultMessage: 'loading',
  },
});

@inject('store')
@observer
export default class SellBook extends Component {
  componentDidMount() {
    this.props.store.sellStore.getSellOrderInfo();
  }
  handleNext = async () => {
    this.props.store.sellStore.skip = this.props.store.sellStore.skip + 5;
    await this.props.store.sellStore.getSellOrderInfo();
  }
  handlePrevious = async () => {
    this.props.store.sellStore.skip = this.props.store.sellStore.skip - 5;
    await this.props.store.sellStore.getSellOrderInfo();
  }

  render() {
    const { sellStore, wallet } = this.props.store;
    return (
      <Fragment>
        <Card className='dashboardOrderBookTitle'>
          <p>People Selling {wallet.market}</p>
        </Card>
        <SellOrders sellStore={sellStore} />
        <div className='centerText'>
          <button
            disabled={!sellStore.hasLess}
            onClick={this.handlePrevious}
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!sellStore.hasMore}
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

const Loading = withStyles(styles)(({ classes }) => <Row><_Loading className={classes.loading} text={messages.loadAllNewOrdersMsg} /></Row>);

const Row = withStyles(styles)(({ classes, ...props }) => (
  <div className={classes.row} {...props} />
));

