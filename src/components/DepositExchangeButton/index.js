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
import { FastRewind, AccountBalanceWallet } from '@material-ui/icons';
import { TxSentDialog } from 'components';
import DepositExchangeTxConfirmDialog from '../DepositExchangeTxConfirmDialog';

const messages = defineMessages({
  fundConfirmMsgSendMsg: {
    id: 'fundConfirmMsg.send',
    defaultMessage: 'send to address {address}',
  },
});

@injectIntl
@inject('store')
@observer
export default class DepositExchangeButton extends Component {
  constructor(props) {
    super(props);
    this.hasWallet = [];
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

  handleClickOpenDepositChoice = (addresses, currentAddressKey, currentAddressSelected) => {
    Object.keys(addresses[currentAddressKey].Wallet).forEach((depositChoice) => {
      this.hasWallet[depositChoice] = addresses[currentAddressKey].Wallet[depositChoice] > 0;
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

  handleClickOpenDepositDialog = (event, addresses, currentAddressKey, currentAddressSelected) => {
    Object.keys(addresses[currentAddressKey].Wallet).forEach((currency) => {
      if (event.currentTarget.value === currency) {
        this.setState({
          tokenChoice: currency,
          available: addresses[currentAddressKey].Wallet[currency],
        });
      }
    });

    this.setState({
      open: false,
      open2: true,
      address: this.props.store.wallet.currentAddressSelected,
    });
  };

  handleClose = () => {
    this.props.store.wallet.hasEnoughGasCoverage = false;
    this.setState({
      open: false,
      open2: false,
      openError: false,
      amount: '',
      tokenChoice: '',
      address: '',
      available: '',
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

    // Keep atleast 2 RUNES for gasCoverage.
    if (this.state.tokenChoice === this.props.store.baseCurrencyStore.baseCurrency.pair) {
      if (this.state.available > 2 && this.state.available < event.target.value) {
        this.setState({
          [name]: this.state.available - 2,
        });
      }
    }
  };

  onWithdraw = () => {
    this.setState({
      open: false,
      open2: false,
    });
  }

  closeAll = () => {
    this.setState({
      open: false,
      open2: false,
    });
    this.props.store.wallet.closeTxDialog();
  }

  render() {
    const { store: { wallet, baseCurrencyStore, marketStore: { marketInfo } } } = this.props;
    const isEnabledFund = wallet.currentAddressSelected !== '';
    const rows = [];

    rows.push(<Button
      key='depositBaseCurrency'
      value={baseCurrencyStore.baseCurrency.pair}
      disabled={!this.hasWallet[baseCurrencyStore.baseCurrency.pair]}
      onClick={(event) => this.handleClickOpenDepositDialog(event, wallet.addresses, wallet.currentAddressKey, wallet.currentAddressSelected)}
    >
      {baseCurrencyStore.baseCurrency.pair}
    </Button>);

    Object.keys(marketInfo).forEach((key) => {
      rows.push(<Button
        key={marketInfo[key].market}
        value={marketInfo[key].market}
        disabled={!this.hasWallet[marketInfo[key].market]}
        onClick={(event) => this.handleClickOpenDepositDialog(event, wallet.addresses, wallet.currentAddressKey, wallet.currentAddressSelected)}
      >
        {marketInfo[key].market}
      </Button>);
    });

    return (
      <div>
        <button
          disabled={!isEnabledFund}
          className="ui positive button"
          onClick={() => this.handleClickOpenDepositChoice(wallet.addresses, wallet.currentAddressKey, wallet.currentAddressSelected)}
        >
          <FastRewind className='verticalTextButton'></FastRewind>
          <AccountBalanceWallet className='verticalTextButton'></AccountBalanceWallet>
          <span className='verticalTextButton leftPadMidBut'>Deposit</span>
        </button>

        <Dialog
          open={this.state.openError}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Deposit to Exchange Contract</DialogTitle>
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
          <DialogTitle id="form-dialog-title">Deposit to Exchange Contract</DialogTitle>
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
          <DialogTitle id="form-dialog-title2">Deposit {this.state.tokenChoice} to Exchange Contract</DialogTitle>
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
              type="number"
              min={0}
              max={this.state.available}
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => wallet.prepareDepositExchange(this.state.address, this.state.amount, this.state.tokenChoice)} color="primary">
              Deposit
            </Button>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={wallet.hasEnoughGasCoverage}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title2"
        >
          <DialogTitle id="form-dialog-title2">Warning</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You need to leave atleast 2 RUNES in your wallet to cover GAS fees.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
        <DepositExchangeTxConfirmDialog onWithdraw={this.onWithdraw} id={messages.fundConfirmMsgSendMsg.id} />
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
