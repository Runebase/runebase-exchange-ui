/* eslint-disable react/jsx-one-expression-per-line */
import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';
import {
  Grid,
  withStyles,
} from '@material-ui/core';
import 'semantic-ui-css/semantic.min.css';
import styles from './styles';

export default @injectIntl @withStyles(styles, { withTheme: true }) @inject('store') @observer class MarketInfo extends Component {
  render() {
    const { store: { wallet, marketStore, baseCurrencyStore } } = this.props;
    const findContractAddress = _.find(marketStore.marketInfo, { market: `${wallet.market}` });
    return (
      <div>
        <Grid container>
          <Grid item xs={12}>
            <div>{wallet.market}/{baseCurrencyStore.baseCurrency.pair}</div>
          </Grid>
          <Grid item xs={12}>
            {findContractAddress ? (<div>Contract Address: {findContractAddress.address}</div>) : (<div>Loading...</div>)}
          </Grid>
        </Grid>
      </div>
    );
  }
}
