/* eslint-disable react/jsx-one-expression-per-line, react/destructuring-assignment */
import React, { PureComponent } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import {
  withMobileDialog,
  Grid,
  Typography,
  withStyles } from '@material-ui/core';
import styles from './styles';
import { satoshiToDecimal } from '../../../helpers/utility';

@injectIntl
@inject('store')
@withStyles(styles, { withTheme: true })
class BuyHistoryView extends PureComponent {
  renderTrade(from, to, boughtTokens, amountToken, totalToken, totalToken2, token, orderType, baseCurrency) {
    if (boughtTokens !== '0000000000000000000000000000000000000000' && orderType === 'SELLORDER') {
      return (<Typography className='sold fat'>Sell {amountToken} {token} for {totalToken} {baseCurrency}</Typography>);
    }
    if (boughtTokens !== '0000000000000000000000000000000000000000' && orderType === 'BUYORDER') {
      return (<Typography className='bought fat'>Buy {amountToken} {token} for {totalToken2} {baseCurrency}</Typography>);
    }
    if (boughtTokens !== '0000000000000000000000000000000000000000' && orderType === 'SELLORDER') {
      return (<Typography className='bought fat'>Buy {amountToken} {token} for {totalToken} {baseCurrency}</Typography>);
    }
    if (boughtTokens !== '0000000000000000000000000000000000000000' && orderType === 'BUYORDER') {
      return (<Typography className='sold fat'>Sell {totalToken2} {token} for {amountToken} {baseCurrency}</Typography>);
    }
  }

  render() {
    const { txid, from, to, boughtTokens, amount, price, token, orderType, date } = this.props.event;
    const { store: { baseCurrencyStore } } = this.props;
    const amountToken = satoshiToDecimal(amount);
    const totalToken = amountToken * price;
    const totalToken2 = parseFloat((amountToken / price).toFixed(8));

    return (
      <div className={`classes.root ${orderType}`}>
        <Grid container className='myTradeContainer'>
          <Grid item xs={12}>
            <p>{date}</p>
          </Grid>
          <Grid item xs={12}>
            {this.renderTrade(from, to, boughtTokens, amountToken, totalToken, totalToken2, token, orderType, baseCurrencyStore.baseCurrency.pair)}
          </Grid>
          <Grid item xs={12} className='breakWord'>
            <Typography variant="caption" gutterBottom><a href={`https://explorer.runebase.io/tx/${txid}`}>{txid}</a></Typography>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withMobileDialog()(BuyHistoryView);
