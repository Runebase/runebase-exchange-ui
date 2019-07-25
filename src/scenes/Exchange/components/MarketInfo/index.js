import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { inject, observer } from 'mobx-react';
import {
  Grid,
  withStyles,
} from '@material-ui/core';
import 'semantic-ui-css/semantic.min.css';
import styles from './styles';

@injectIntl
@withStyles(styles, { withTheme: true })
@inject('store')
@observer
export default class MarketInfo extends Component {
  render() {
    const { store: { wallet } } = this.props;
    return (
      <div>
        <Grid container>
          <Grid item xs={12}>
            <div>{wallet.market}/RUNES</div>
          </Grid>
          <Grid item xs={12}>
            <div>Contract Address: {wallet.currentMarketContract}</div>
          </Grid>
        </Grid>
      </div>
    );
  }
}
