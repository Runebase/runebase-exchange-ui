import { inject, observer } from 'mobx-react';
import { satoshiToDecimal } from '../../helpers/utility';


/*
* Model for TransactionCost.
* Represents the cost for a transaction. This is fetched before the user executes a transaction.
*/

export default @inject('store') @observer class TransactionCost {
  type

  token

  amount

  gasLimit

  gasCost

  constructor(txCost) {
    Object.assign(this, txCost);
    const { store: { baseCurrencyStore } } = this.props;

    if (this.token !== baseCurrencyStore.baseCurrency.pair) {
      this.amount = satoshiToDecimal(this.amount);
    }
  }
}
