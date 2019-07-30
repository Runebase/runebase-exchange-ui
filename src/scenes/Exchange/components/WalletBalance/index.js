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
    const { classes, store: { wallet } } = this.props;
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
                      <Grid item xs={3}>
                        <Typography variant="body2">RUNES(GAS)</Typography>
                        <Typography variant="body2">{wallet.addresses[wallet.currentAddressKey].RUNES}</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">PRED</Typography>
                        <Typography variant="body2">{wallet.addresses[wallet.currentAddressKey].pred}</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">FUN</Typography>
                        <Typography variant="body2">{wallet.addresses[wallet.currentAddressKey].fun}</Typography>
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
