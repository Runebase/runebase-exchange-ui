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

import RedeemExchange from './RedeemExchange';
import styles from './styles.css';

@injectIntl
@withStyles(styles, { withTheme: true })
@inject('store')
@observer
export default class myBalance extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
  };
  render() {
    const { classes, store: { wallet } } = this.props;
    const hasPred = (wallet.market === 'PRED') ? 'MarketBalanceActive' : 'NotSoActive';
    const hasFun = (wallet.market === 'FUN') ? 'MarketBalanceActive' : 'NotSoActive';

    return (
      <div>
        <Grid container>
          <Grid item xs={12}>
            <RedeemExchange />
          </Grid>
          <Grid container>
            <Grid item xs={12}>
              <Card className='dashboardOrderBookTitle'>
                <p>My Exchange Balances</p>
              </Card>
            </Grid>
            {(() => {
              if (wallet.currentAddressKey !== '') {
                return (
                  <Grid item xs={12}>
                    <Card className='dashboardOrderBook fat'>
                      <Grid container className='marginTopBot'>
                        <Grid item xs={3}>
                          <Typography variant="body2">RUNES</Typography>
                          <Typography variant="body2">{wallet.addresses[wallet.currentAddressKey].exchangerunes}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" className={`${hasPred}`}>PRED</Typography >
                          <Typography variant="body2" className={`${hasPred}`}>{wallet.addresses[wallet.currentAddressKey].exchangepred}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" className={`${hasFun}`}>FUN</Typography>
                          <Typography variant="body2" className={`${hasFun}`}>{wallet.addresses[wallet.currentAddressKey].exchangefun}</Typography>
                        </Grid>
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
