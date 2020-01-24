import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { injectIntl, defineMessages } from 'react-intl';
import MarketView from './MarketView';
import LoadingElement from '../Loading';

const messages = defineMessages({
  loadAllMarketsMsg: {
    id: 'load.allMarkets',
    defaultMessage: 'loading',
  },
});

export default @injectIntl @observer @inject('store') class Markets extends Component {
  render() {
    const {
      store: {
        marketStore,
      },
    } = this.props;

    return (
      <>
        <Events marketStore={marketStore} />
      </>
    );
  }
}

const Events = observer(({ marketStore: { marketInfo, loading } }) => {
  if (loading) return <LoadingElement text={messages.loadAllMarketsMsg} />;
  const markets = (marketInfo || []).map((event, i) => <MarketView key={i} index={i} event={event} />); // eslint-disable-line
  return (
    markets
  );
});
