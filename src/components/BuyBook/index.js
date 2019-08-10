import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { withStyles, Card } from '@material-ui/core';
import { defineMessages } from 'react-intl';

import OrderBook from './OrderBook';
import _Loading from '../Loading';


const messages = defineMessages({
  loadAllEventsMsg: {
    id: 'load.allEvents',
    defaultMessage: 'loading',
  },
});

@inject('store')
@observer
export default class BuyBook extends Component {
  componentDidMount() {
    this.props.store.buyStore.getBuyOrderInfo();
  }
  handleNext = async () => {
    this.props.store.buyStore.skip = this.props.store.buyStore.skip + 5;
    await this.props.store.buyStore.getBuyOrderInfo();
  }
  handlePrevious = async () => {
    this.props.store.buyStore.skip = this.props.store.buyStore.skip - 5;
    await this.props.store.buyStore.getBuyOrderInfo();
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
            disabled={!buyStore.hasLess}
            onClick={this.handlePrevious}
          >
            Previous Page
          </button>
          <button
            onClick={this.handleNext}
            disabled={!buyStore.hasMore}
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

const Loading = withStyles()(() => <Row><_Loading text={messages.loadAllEventsMsg} /></Row>);

const Row = withStyles()(({ ...props }) => (
  <div {...props} />
));
