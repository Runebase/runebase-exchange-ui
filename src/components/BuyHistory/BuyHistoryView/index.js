/* eslint-disable react/jsx-one-expression-per-line, react/destructuring-assignment */
import React, { PureComponent } from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import {
  Grid,
  Typography,
  withStyles } from '@material-ui/core';
import styles from './styles';
import { satoshiToDecimal } from '../../../helpers/utility';

@injectIntl
@inject('store')
@withStyles(styles, { withTheme: true })
class BuyHistoryView extends PureComponent {
  renderTrade(boughtTokens, amountToken, totalToken, token, orderType, baseCurrency) {
    return (<Typography className='bought fat'>Buy {amountToken} {token} for {totalToken} {baseCurrency}</Typography>);
  }

  render() {
    const { txid, boughtTokens, amount, price, token, orderType, date, status, gasUsed } = this.props.event;
    const { store: { baseCurrencyStore } } = this.props;
    const amountToken = satoshiToDecimal(amount);
    const totalToken = parseFloat((amountToken / price).toFixed(8));
    const actualGasUsed = gasUsed * 0.0000004;

    return (
      <div className={`classes.root ${orderType}`}>
        <Grid container className='myTradeContainer'>
          <Grid item xs={8} className='breakWord'>
            <p>{date}</p>
          </Grid>
          <Grid item xs={4} className='breakWord'>
            <p className={`fat ${status}COLOR`}>{status}</p>
          </Grid>
          <Grid item xs={12}>
            {this.renderTrade(boughtTokens, amountToken, totalToken, token, orderType, baseCurrencyStore.baseCurrency.pair)}
          </Grid>
          <Grid item xs={4} className='breakWord'>
            <Typography className='listLabel'>price</Typography>
            <Typography className='listInfo'>{price} RUNES</Typography>
          </Grid>
          <Grid item xs={4} className='breakWord'>
            <Typography className='listLabel'>amount</Typography>
            <Typography className='listInfo'>{amount}</Typography>
          </Grid>
          <Grid item xs={4} className='breakWord'>
            <Typography className='listLabel'>gasUsed</Typography>
            <Typography className='listInfo'>{actualGasUsed} RUNES</Typography>
          </Grid>
          <Grid item xs={12} className='breakWord'>
            <Typography variant="caption" gutterBottom><a href={`https://explorer.runebase.io/tx/${txid}`}>{txid}</a></Typography>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default BuyHistoryView;
