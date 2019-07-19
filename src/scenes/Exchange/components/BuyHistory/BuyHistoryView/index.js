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
import './styles.css';
import { satoshiToDecimal } from '../../../../../helpers/utility';

@injectIntl
@inject('store')
@withStyles(styles, { withTheme: true })
class BuyHistoryView extends PureComponent {
  renderTrade(from, to, boughtTokens, amountToken, totalToken, totalToken2, tokenName, orderType) {
    if (boughtTokens !== '0000000000000000000000000000000000000000' && orderType === 'SELLORDER') {
      return (<Typography className='sold fat'>Sell {amountToken} {tokenName} for {totalToken} RUNES</Typography>);
    }
    if (boughtTokens !== '0000000000000000000000000000000000000000' && orderType === 'BUYORDER') {
      return (<Typography className='bought fat'>Buy {amountToken} {tokenName} for {totalToken2} RUNES</Typography>);
    }
    if (boughtTokens !== '0000000000000000000000000000000000000000' && orderType === 'SELLORDER') {
      return (<Typography className='bought fat'>Buy {amountToken} {tokenName} for {totalToken} RUNES</Typography>);
    }
    if (boughtTokens !== '0000000000000000000000000000000000000000' && orderType === 'BUYORDER') {
      return (<Typography className='sold fat'>Sell {totalToken2} {tokenName} for {amountToken} RUNES</Typography>);
    }
  }
  render() {
    const { txid, from, to, boughtTokens, amount, price, tokenName, orderType, date } = this.props.event;
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
            {this.renderTrade(from, to, boughtTokens, amountToken, totalToken, totalToken2, tokenName, orderType)}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" gutterBottom><a href={`https://explorer.runebase.io/tx/${txid}`}>{txid}</a></Typography>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withMobileDialog()(BuyHistoryView);
