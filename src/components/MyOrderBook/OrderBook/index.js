import React, { PureComponent } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import 'semantic-ui-css/semantic.min.css';
import { inject } from 'mobx-react';
import { injectIntl, defineMessages } from 'react-intl';
import {
  Button,
  Grid,
  Typography,
  withStyles,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CancelOrderTxConfirmDialog from '../CancelOrderTxConfirmDialog';
import { OrderTypeIcon, StatusIcon } from '../../../helpers';
import { satoshiToDecimal } from '../../../helpers/utility';


import styles from './styles';
import './styles.css';
const messages = defineMessages({
  cancelOrderConfirmMsgSendMsg: {
    id: 'cancelOrderConfirmMsg.send',
    defaultMessage: 'send to address {address}',
  },
});

@injectIntl
@inject('store')
@withStyles(styles, { withTheme: true })
export default class OrderBook extends PureComponent {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    orderId: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.state = { openError: false };
  }
  static defaultProps = {
    orderId: undefined,
  };
  onCancelOrder = () => {
    if (this.props.store.wallet.currentAddressSelected === '') {
      this.setState({
        openError: true,
      });
    }
  }

  addressCheck = () => {
    if (this.props.store.wallet.currentAddressSelected === '') {
      this.setState({
        openError: true,
      });
    }
  }

  handleClose = () => {
    this.setState({
      openError: false,
    });
  };

  render() {
    const { classes } = this.props;
    const { store: { wallet, marketStore, baseCurrencyStore } } = this.props;
    const { orderId, txid, amount, startAmount, owner, blockNum, time, price, token, tokenName, type, status } = this.props.order;
    const amountToken = satoshiToDecimal(amount);
    const startAmountToken = satoshiToDecimal(startAmount);
    const filled = parseFloat((startAmountToken - amountToken).toFixed(8));
    let total = amountToken * price;
    total = total.toFixed(8);
    const findImage = _.find(marketStore.marketImages, { market: `${token}` });
    return (
      <div className={`classes.root ${status}`}>
        <Dialog
          open={this.state.openError}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Withdraw</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please select an address first.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose}>Close</Button>
          </DialogActions>
        </Dialog>
        <ExpansionPanel className={status}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container className='centerText' wrap="nowrap">
              <Grid item xs={2} zeroMinWidth>
                <Typography>orderId</Typography>
                <Typography className='fat'>{orderId}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>token</Typography>
                <Typography className='fat'>{token}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>amount</Typography>
                <Typography className='fat'>{amountToken}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>price</Typography>
                <Typography className='fat'>{price}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>type</Typography>
                <Typography className={`fat ${type}COLOR`}>{type}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>status</Typography>
                <Typography className={`fat ${status}COLOR`}>{status}</Typography>
              </Grid>
            </Grid>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.dashboardOrderBookWrapper} >

            <Grid container className='centerText' >
              <Grid item xs={12}>
                <Grid container justify="center">
                  <Grid item xs={3}>
                    <p className='fat'>{token}/{baseCurrencyStore.baseCurrency.pair}</p>
                    <div className='fullwidth'>
                      {findImage ? (<img alt={tokenName} src={`https://ipfs.io/ipfs/${findImage.image}`} />) : (<div>Loading...</div>)}
                    </div>
                  </Grid>
                  <Grid item xs={3} className='inheritHeight'>
                    <p className='fat'>{type}</p>
                    <OrderTypeIcon orderType={type} />
                  </Grid>
                  <Grid item xs={3} className='inheritHeight'>
                    <p className='fat'>{status}</p>
                    <StatusIcon status={status} />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container className='spacingOrderBook vcenter'>
                  <Grid item xs={3} className='inheritHeight ordersRoundBox'>
                    <Typography variant='title' className='ordersPropertyLabel'>amount</Typography>
                    <Typography variant='subheading' className='ordersPropertyContent inheritHeight'>{amountToken}</Typography>
                    <Typography variant='subheading' className='ordersPropertyContent inheritHeight'>{token}</Typography>
                  </Grid>
                  <Grid item xs={3} className='inheritHeight ordersRoundBox'>
                    <Typography variant='title' className='ordersPropertyLabel'>price</Typography>
                    <Typography variant='subheading' className='ordersPropertyContent inheritHeight'>{price}</Typography>
                    <Typography variant='subheading' className='ordersPropertyContent inheritHeight'>{baseCurrencyStore.baseCurrency.pair}</Typography>
                  </Grid>
                  <Grid item xs={3} className='inheritHeight ordersRoundBox'>
                    <Typography variant='title' className='ordersPropertyLabel'>total</Typography>
                    <Typography variant='subheading' className='ordersPropertyContent inheritHeight'>{total}</Typography>
                    <Typography variant='subheading' className='ordersPropertyContent inheritHeight'>{baseCurrencyStore.baseCurrency.pair}</Typography>
                  </Grid>
                  <Grid item xs={3} className='inheritHeight ordersRoundBox'>
                    <Typography variant='title' className='ordersPropertyLabel'>filled</Typography>
                    <div className='ordersPropertyContent inheritHeight'>
                      <Grid container>
                        <Grid item xs={12}>
                          <Typography variant='subheading'>{filled}</Typography>
                        </Grid>
                        <span className='filledDivider'></span>
                        <Grid item xs={12}>
                          <Typography variant='subheading'>{startAmountToken}</Typography>
                        </Grid>
                      </Grid>
                    </div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}className='spacingOrderBook'>
                <Typography variant='subheading' className=''>owner:</Typography>
                <Typography className={classes.root}><a href={`https://explorer.runebase.io/address/${owner}`}>{owner}</a></Typography>
              </Grid>
              <Grid item xs={12} className='spacingOrderBook'>
                <Typography variant='subheading' className={classes.root}>txid:</Typography>
                <Typography className={classes.root}><a href={`https://explorer.runebase.io/tx/${txid}`}>{txid}</a></Typography>
              </Grid>
              <Grid item xs={6} className='spacingOrderBook'>
                <Typography variant='subheading'>created time</Typography>
                <Typography>{time}</Typography>
              </Grid>
              <Grid item xs={6} className='spacingOrderBook'>
                <Typography variant='subheading'>created blockNum</Typography>
                <Typography>{blockNum}</Typography>
              </Grid>
              {status !== 'CANCELED' && status !== 'FULFILLED' ? (
                <Grid item xs={12}>
                  <div>
                    <Button onClick={() => wallet.prepareCancelOrderExchange(orderId)} color="primary">
                      Cancel Order
                    </Button>
                    <CancelOrderTxConfirmDialog onCancelOrder={this.onCancelOrder} id={messages.cancelOrderConfirmMsgSendMsg.id} />
                  </div>
                </Grid>
              ) : (
                <div></div>
              )}
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  }
}
