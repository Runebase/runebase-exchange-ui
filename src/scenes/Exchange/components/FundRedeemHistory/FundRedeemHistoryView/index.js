import React, { PureComponent } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import {
  withMobileDialog,
  Grid,
  Typography,
  withStyles } from '@material-ui/core';
import styles from './styles.css';

@injectIntl
@inject('store')
@withStyles(styles, { withTheme: true })
class FundRedeemHistoryView extends PureComponent {
  render() {
    const { txid, type, token, status, date, amount } = this.props.event;
    let renderType;
    if (type === 'DEPOSITEXCHANGE') {
      renderType = 'Deposit';
    } else if (type === 'WITHDRAWEXCHANGE') {
      renderType = 'Withdraw';
    }

    return (
      <div className={`${status}`}>
        <Grid container className='myTradeContainer'>
          <Grid item xs={8} className='breakWord'>
            <p>{date}</p>
          </Grid>
          <Grid item xs={4} className='breakWord'>
            <p className={`fat ${status}COLOR`}>{status}</p>
          </Grid>
          <Grid item xs={12} className={`${type} fat`}>
            {renderType} {amount} {token}
          </Grid>
          <Grid item xs={12} className='breakWord'>
            <Typography variant="caption" gutterBottom><a href={`https://explorer.runebase.io/tx/${txid}`}>{txid}</a></Typography>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withMobileDialog()(FundRedeemHistoryView);
