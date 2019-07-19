/* eslint-disable */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { FundConfirmDialog } from 'components';


const DepositTxConfirmDialog = inject('store')(injectIntl(observer(({ store: { wallet }, intl, id, onWithdraw }) => {
  return (
    /* eslint-disable */
    <FundConfirmDialog
      onClose={() => wallet.fundConfirmDialogOpen = false /* eslint-disable-line no-param-reassign */}
      onConfirm={wallet.confirmFundExchange.bind(this, onWithdraw) /* eslint-disable-line no-param-reassign */}
      txFees={wallet.txFees}
      open={wallet.fundConfirmDialogOpen}
      txToken={wallet.selectedToken}
      txAmount={wallet.depositAmount}
      txDesc={intl.formatMessage({ id }, { address: wallet.toAddress })}
    />
    /* eslint-enable */
  );
})));
export default DepositTxConfirmDialog;
