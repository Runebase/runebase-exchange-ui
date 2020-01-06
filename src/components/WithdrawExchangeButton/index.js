/* eslint-disable react/destructuring-assignment, react/no-access-state-in-setstate, react/button-has-type, react/jsx-one-expression-per-line */
import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import {
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { injectIntl, defineMessages } from 'react-intl';
import { inject, observer } from 'mobx-react';
import { FastForward, AccountBalance } from '@material-ui/icons';
import { TxSentDialog } from 'components';
import RedeemExchangeTxConfirmDialog from '../WithdrawExchangeTxConfirmDialog';

const messages = defineMessages({
  redeemConfirmMsgSendMsg: {
    id: 'redeemConfirmMsg.send',
    defaultMessage: 'send to address {address}',
  },
});

@injectIntl
@inject('store')
@observer
export default class WithdrawExchangeButton extends Component {
  constructor(props) {
    super(props);
    this.hasExchange = [];
    this.state = {
      open: false,
      open2: false,
      openError: false,
      amount: 0,
      tokenChoice: '',
      address: '',
      available: '',
    };
  }

  handleClickOpenRedeemChoice = (addresses, currentAddressKey, currentAddressSelected) => {
    Object.keys(addresses[currentAddressKey].Exchange).forEach((currency) => {
      this.hasExchange[currency] = addresses[currentAddressKey].Exchange[currency] > 0;
    });
    if (this.props.store.wallet.currentAddressSelected === '') {
      this.setState({
        open: false,
        open2: false,
        openError: true,
      });
      return;
    }
    this.setState({
      open: true,
      open2: false,
    });
  };

  handleClickOpenRedeemDialog = (event, addresses, currentAddressKey, currentAddressSelected) => {
    Object.keys(addresses[currentAddressKey].Exchange).forEach((currency) => {
      if (event.currentTarget.value === currency) {
        this.setState({
          tokenChoice: currency,
          available: addresses[currentAddressKey].Exchange[currency],
        });
      }
    });

    this.setState({
      open: false,
      open2: true,
      address: currentAddressSelected,
    });
  };

  handleClose = () => {
    this.setState({
      open: false,
      open2: false,
      openError: false,
      amount: '',
    });
  };

  handleChange = name => event => {
    if (event.target.value === '' || /^\d+(\.\d{1,8})?$/.test(event.target.value)) {
      this.setState({
        [name]: event.target.value,
      });
    }
    if (event.target.value > this.state.available) {
      this.setState({
        [name]: this.state.available,
      });
    }
  };

  onRedeem = () => {
    this.setState({
      open: false,
      open2: false,
      amount: '',
    });
  }

  closeAll = () => {
    this.setState({
      open: false,
      open2: false,
      amount: '',
    });
    this.props.store.wallet.closeTxDialog();
  }

  render() {
    const { store: { wallet, baseCurrencyStore, marketStore: { marketInfo } } } = this.props;
    const isEnabledRedeem = wallet.currentAddressSelected !== '';

    const rows = [];

    rows.push(<Button
      key='withdrawBaseCurrency'
      value={baseCurrencyStore.baseCurrency.pair}
      disabled={!this.hasExchange[baseCurrencyStore.baseCurrency.pair]}
      onClick={(event) => this.handleClickOpenRedeemDialog(event, wallet.addresses, wallet.currentAddressKey, wallet.currentAddressSelected)}
    >
      {baseCurrencyStore.baseCurrency.pair}
    </Button>);

    Object.keys(marketInfo).forEach((key) => {
      rows.push(<Button
        key={marketInfo[key].market}
        value={marketInfo[key].market}
        disabled={!this.hasExchange[marketInfo[key].market]}
        onClick={(event) => this.handleClickOpenRedeemDialog(event, wallet.addresses, wallet.currentAddressKey, wallet.currentAddressSelected)}
      >
        {marketInfo[key].market}
      </Button>);
    });

    return (
      <div>
        <div className='positionbutton'>
          <button
            disabled={!isEnabledRedeem}
            className="ui negative button withdrawButton"
            onClick={() => this.handleClickOpenRedeemChoice(wallet.addresses, wallet.currentAddressKey, wallet.currentAddressSelected)}
          >
            <span className='verticalTextButton rightPadMidBut'>Withdraw</span>
            <AccountBalance className='verticalTextButton'></AccountBalance>
            <FastForward className='verticalTextButton'></FastForward>
          </button>
        </div>
        <Dialog
          open={this.state.openError}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Withdraw from Exchange Contract</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please select an address first.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Withdraw from Exchange Contract</DialogTitle>
          <DialogContent>
          </DialogContent>
          <DialogActions>
            {rows}
            <Button onClick={this.handleClose}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.open2}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title2"
        >
          <DialogTitle id="form-dialog-title2">Withdraw {this.state.tokenChoice} from Exchange Contract</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Current Address:
            </DialogContentText>
            <DialogContentText>
              {this.state.address}
            </DialogContentText>
            <DialogContentText>
              Available:
            </DialogContentText>
            <DialogContentText>
              {this.state.available} {this.state.tokenChoice}
            </DialogContentText>
            <TextField
              id="standard-number"
              label="Amount"
              value={this.state.amount}
              onChange={this.handleChange('amount')}
              type='number'
              min={0}
              max={20}
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => wallet.prepareRedeemExchange(this.state.address, this.state.amount, this.state.tokenChoice)} color="primary">
              Withdraw
            </Button>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
        <RedeemExchangeTxConfirmDialog onRedeem={this.onRedeem} id={messages.redeemConfirmMsgSendMsg.id} />
        {wallet.txSentDialogOpen && (
          <TxSentDialog
            txid={wallet.txid}
            open={wallet.txSentDialogOpen}
            onClose={this.closeAll}
          />
        )}
      </div>
    );
  }
}
