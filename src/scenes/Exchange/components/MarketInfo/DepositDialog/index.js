/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  TextField,
  Button,
  Typography,
  withStyles,
  FormControl,
  FormHelperText,
} from '@material-ui/core';
import { inject, observer } from 'mobx-react';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import { Token } from 'constants';

import styles from './styles';


const messages = defineMessages({
  to: {
    id: 'str.to',
    defaultMessage: 'To',
  },
  amount: {
    id: 'str.amount',
    defaultMessage: 'Amount',
  },
  youCanDeposit: {
    id: 'depositDialog.youCanDeposit',
    defaultMessage: 'You can deposit up to:',
  },
  confirmSendMsg: {
    id: 'txConfirmMsg.send',
    defaultMessage: 'send to address {address}',
  },
});

@injectIntl
@withStyles(styles, { withTheme: true })
@inject('store')
@observer
export default class DepositDialog extends Component {
  static propTypes = {
    intl: intlShape.isRequired, // eslint-disable-line react/no-typos
    classes: PropTypes.object.isRequired,
    dialogVisible: PropTypes.bool.isRequired,
    walletAddress: PropTypes.string,
    predAmount: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    onDeposit: PropTypes.func.isRequired,
  };

  static defaultProps = {
    walletAddress: undefined,
    predAmount: undefined,
  };

  render() {
    const { dialogVisible, walletAddress, onClose, store: { wallet } } = this.props;

    if (!walletAddress) {
      return null;
    }

    return (
      <Dialog
        open={dialogVisible}
        onEnter={wallet.resetDepositDialog}
        onClose={onClose}
      >
        <DialogTitle>
          <FormattedMessage id="depositDialog.title" defaultMessage="Deposit RUNES/PRED" />
        </DialogTitle>
        <DialogContent>
          <FromToField walletAddress={walletAddress} />
          <AmountField />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            <FormattedMessage id="str.close" defaultMessage="Close" />
          </Button>
          <Button color="primary" onClick={wallet.prepareDeposit.bind(this, walletAddress)} disabled={wallet.depositDialogHasError}>
            <FormattedMessage id="depositDialog.send" defaultMessage="Send" />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

@injectIntl
@withStyles(styles, { withTheme: true })
@inject('store')
@observer
class FromToField extends Component {
  render() {
    const { classes, walletAddress, intl, store: { wallet } } = this.props;
    const { toAddress } = wallet;

    return (
      <div>
        <Typography variant="body1" className={classes.fromLabel}>
          <FormattedMessage id="str.from" defaultMessage="From" />
        </Typography>
        <Typography variant="title" className={classes.fromAddress}>{walletAddress}</Typography>
        <div className={classes.toAddressInputContainer}>
          <TextField
            autoFocus
            margin="dense"
            id="toAddress"
            label={intl.formatMessage(messages.to)}
            type="string"
            fullWidth
            value={toAddress}
            onChange={e => wallet.toAddress = e.target.value}
            onBlur={wallet.validateDepositDialogWalletAddress}
            error={wallet.depositDialogError.walletAddress !== ''}
            required
          />
          {!!wallet.depositDialogError.walletAddress && <FormHelperText error>{intl.formatMessage({ id: wallet.depositDialogError.walletAddress })}</FormHelperText>}
        </div>
      </div>
    );
  }  
}

@injectIntl
@withStyles(styles, { withTheme: true })
@inject('store')
@observer
class AmountField extends Component {
  render() {
    const {
      classes,
      intl,
      store: { wallet },
    } = this.props;

    const depositAmountText = intl.formatMessage(messages.youCanDeposit);

    return (
      <div>
        <div className={classes.amountInputContainer}>
          <TextField
            margin="dense"
            id="amount"
            label={intl.formatMessage(messages.amount)}
            type="number"
            className={classes.amountInput}
            value={wallet.depositAmount}
            onChange={e => wallet.depositAmount = e.target.value}
            onBlur={wallet.validateDepositDialogAmount}
            error={wallet.depositDialogError.depositAmount !== ''}
            required
          />
          <Select
            value={wallet.selectedToken}
            onChange={e => wallet.selectedToken = e.target.value} // eslint-disable-line
            onBlur={wallet.validateDepositDialogAmount}
            inputProps={{ name: 'selectedToken', id: 'selectedToken' }}
          >
            <MenuItem value={Token.RUNES}>RUNES</MenuItem>
            <MenuItem value={Token.PRED}>PRED</MenuItem>
            <MenuItem value={Token.FUN}>FUN</MenuItem>
          </Select>
          {!!wallet.depositDialogError.depositAmount && <FormHelperText error>{intl.formatMessage({ id: wallet.depositDialogError.depositAmount })}</FormHelperText>}
        </div>
        <Typography variant="body1">
          {`${depositAmountText} ${wallet.lastAddressDepositLimit[wallet.selectedToken]}`}
        </Typography>
      </div>
    );
  }
}
