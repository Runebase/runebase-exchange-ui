/* eslint-disable react/destructuring-assignment, react/jsx-fragments, react/jsx-props-no-spreading */
import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { injectIntl, defineMessages } from 'react-intl';
import { withStyles } from '@material-ui/core';
import MarketView from './MarketView';
import _Loading from '../Loading';

const messages = defineMessages({
  loadAllMarketsMsg: {
    id: 'load.allMarkets',
    defaultMessage: 'loading',
  },
});

export default @injectIntl @observer @inject('store') class Markets extends Component {
  render() {
    const { marketStore } = this.props.store;

    return (
      <Fragment>
        <Events marketStore={marketStore} />
      </Fragment>
    );
  }
}

const Events = observer(({ marketStore: { marketInfo, loading } }) => {
  if (loading) return <Loading />;
  const markets = (marketInfo || []).map((event, i) => <MarketView key={i} index={i} event={event} />); // eslint-disable-line
  return (
    markets
  );
});

const Loading = withStyles(({ classes }) => <Row><_Loading className={classes.loading} text={messages.loadAllMarketsMsg} /></Row>);

const Row = withStyles(({ classes, ...props }) => (
  <div className={classes.row} {...props} />
));
