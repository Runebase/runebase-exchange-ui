import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { injectIntl, defineMessages } from 'react-intl';
import { withStyles } from '@material-ui/core';
import MarketView from './MarketView';
import _Loading from '../../../../components/Loading';

const messages = defineMessages({
  loadAllBuyOrdersMsg: {
    id: 'load.allNewOrders',
    defaultMessage: 'loading',
  },
});

@injectIntl
@inject('store')
@observer
export default class Markets extends Component {
  render() {
    const { global } = this.props.store;

    return (
      <Fragment>
        <Events global={global} />
      </Fragment>
    );
  }
}

const Events = observer(({ global: { marketInfo, loading } }) => {
  if (loading) return <Loading />;
  const markets = (marketInfo || []).map((event, i) => <MarketView key={i} index={i} event={event} />); // eslint-disable-line
  return (
    markets
  );
});

const Loading = withStyles(({ classes }) => <Row><_Loading className={classes.loading} text={messages.loadAllBuyOrdersMsg} /></Row>);

const Row = withStyles(({ classes, ...props }) => (
  <div className={classes.row} {...props} />
));
