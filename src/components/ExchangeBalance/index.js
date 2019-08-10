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
import styles from './styles.css';

@injectIntl
@withStyles(styles, { withTheme: true })
@inject('store')
@observer
export default class ExchangeBalance extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
  };
  render() {
    const { classes, store: { wallet } } = this.props;
    const rows = [];
    if (wallet.currentAddressKey !== '') {
      Object.keys(wallet.addresses[wallet.currentAddressKey].Exchange).forEach((key) => {
        const isActive = (wallet.market === key) ? 'MarketBalanceActive' : 'NotSoActive';
        rows.push(<Grid item xs={3} key={key}>
          <Typography variant="body2" className={`${isActive}`}>{key}</Typography>
          <Typography variant="body2" className={`${isActive}`}>{wallet.addresses[wallet.currentAddressKey].Exchange[key]}</Typography>
        </Grid>);
      });
    }

    return (
      <div>
        <Grid container>
          <Grid container>
            <Grid item xs={12}>
              <Card className='dashboardOrderBookTitle'>
                <p>My Exchange Balances</p>
              </Card>
            </Grid>
            {(() => {
              if (wallet.currentAddressKey !== '') {
                return (
                  <Grid item xs={12} className='dashboardOrderBook'>
                    <Card className='dashboardOrderBook fat'>
                      <Grid container className='marginTopBot'>
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
                      <Grid item xs={12} className='dashboardOrderBook'>
                        <p className='textCenter'>...</p>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              );
            })()}
          </Grid>
        </Grid>
      </div>
    );
  }
}
