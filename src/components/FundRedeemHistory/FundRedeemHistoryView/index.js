/* eslint-disable react/destructuring-assignment, react/jsx-one-expression-per-line */
import React, { PureComponent } from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import {
  Grid,
  Typography } from '@material-ui/core';
import { getShortLocalDateTimeString } from '../../../helpers/utility';

@injectIntl
@inject('store')
class FundRedeemHistoryView extends PureComponent {
  render() {
    const { txid, type, token, status, time, amount } = this.props.event;
    const dateTime = getShortLocalDateTimeString(time);
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
            <p>{dateTime}</p>
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

export default FundRedeemHistoryView;
