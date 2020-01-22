/* eslint-disable react/jsx-one-expression-per-line, react/destructuring-assignment, lines-between-class-members */
import React, { PureComponent } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import {
  withMobileDialog,
  Grid,
  Typography } from '@material-ui/core';
import { satoshiToDecimal, gasToRunebase } from '../../../helpers/utility';

@injectIntl
@inject('store')
class MyTradesView extends PureComponent {
  renderTrade(from, to, boughtTokens, myaddress, amountToken, totalToken, totalToken2, token, orderType, baseCurrency) {
    if (to === myaddress && boughtTokens !== '0000000000000000000000000000000000000000' && orderType === 'SELLORDER') {
      return (<Typography className='sold fat'>Sell {amountToken} {token} for {totalToken} {baseCurrency}</Typography>);
    }
    if (to === myaddress && boughtTokens !== '0000000000000000000000000000000000000000' && orderType === 'BUYORDER') {
      return (<Typography className='bought fat'>Buy {amountToken} {token} for {totalToken2} {baseCurrency}</Typography>);
    }
    if (from === myaddress && boughtTokens !== '0000000000000000000000000000000000000000' && orderType === 'SELLORDER') {
      return (<Typography className='bought fat'>Buy {amountToken} {token} for {totalToken} {baseCurrency}</Typography>);
    }
    if (from === myaddress && boughtTokens !== '0000000000000000000000000000000000000000' && orderType === 'BUYORDER') {
      return (<Typography className='sold fat'>Sell {totalToken2} {token} for {amountToken} {baseCurrency}</Typography>);
    }
  }
  render() {
    const { store: { wallet, baseCurrencyStore } } = this.props;
    const { txid, status, from, to, boughtTokens, amount, price, token, orderType, date, gasUsed } = this.props.event;
    const amountToken = satoshiToDecimal(amount, 8);
    const totalToken = parseFloat((amountToken * price).toFixed(8));
    const totalToken2 = parseFloat((amountToken / price).toFixed(8));
    const myaddress = wallet.addresses[wallet.currentAddressKey].address;
    const baseCurrency = baseCurrencyStore.baseCurrency.pair;
    const actualGasUsed = gasToRunebase(gasUsed);

    return (
      <div className={`${status}`}>
        <Grid container className='myTradeContainer'>
          <Grid item xs={8} className='breakWord'>
            <p>{date}</p>
          </Grid>
          <Grid item xs={4} className='breakWord'>
            <p className={`fat ${status}COLOR`}>{status}</p>
          </Grid>
          <Grid item xs={12} className='fat'>
            {this.renderTrade(from, to, boughtTokens, myaddress, amountToken, totalToken, totalToken2, token, orderType, baseCurrency)}
          </Grid>
          <Grid item xs={4} className='breakWord'>
            <Typography className='listLabel'>price</Typography>
            <Typography className='listInfo'>{price} RUNES</Typography>
          </Grid>
          <Grid item xs={4} className='breakWord'>
            <Typography className='listLabel'>amount</Typography>
            <Typography className='listInfo'>{amount} {token}</Typography>
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

export default withMobileDialog()(MyTradesView);
