import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import {
  Typography,
  Card,
  Grid,
  withStyles,
} from '@material-ui/core';
import 'semantic-ui-css/semantic.min.css';
import styles from './styles';
import './mystyle.css';

@injectIntl
@withStyles(styles, { withTheme: true })
@inject('store')
@observer
export default class WalletBalance extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
  };

  render() {
    const { classes, store: { wallet, baseCurrencyStore } } = this.props;
    const rows = [];
    if (wallet.currentAddressKey !== '') {
      Object.keys(wallet.addresses[wallet.currentAddressKey].Wallet).forEach((key) => {
        if (key === baseCurrencyStore.baseCurrency.pair) {
          rows.push(<Grid item xs={3} key={key}>
            <Typography variant="body2">{key}(GAS)</Typography>
            <Typography variant="body2">{wallet.addresses[wallet.currentAddressKey].Wallet[key]}</Typography>
          </Grid>);
        } else {
          rows.push(<Grid item xs={3} key={key}>
            <Typography variant="body2">{key}</Typography>
            <Typography variant="body2">{wallet.addresses[wallet.currentAddressKey].Wallet[key]}</Typography>
          </Grid>);
        }
      });
    }
    return (
      <div>
        <Card className={classes.dashboardOrderBookTitle}>
          <p>My Wallet Balances</p>
        </Card>
        <Grid container>
          {(() => {
            if (wallet.currentAddressKey !== '') {
              return (
                <Grid item xs={12}>
                  <Card className={classes.dashboardOrderBook}>
                    <Grid container className='marginTopBot fat'>
                      {rows}
                    </Grid>
                  </Card>
                </Grid>
              );
            }
            return (
              <Grid item xs={12}>
                <Card className={classes.dashboardOrderBook}>
                  <Grid container>
                    <Grid item xs={12}>
                      <p>...</p>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            );
          })()}
        </Grid>
      </div>
    );
  }
}
