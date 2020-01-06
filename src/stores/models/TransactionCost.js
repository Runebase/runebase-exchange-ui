import { inject, observer } from 'mobx-react';
import { satoshiToDecimal } from '../../helpers/utility';


/*
* Model for TransactionCost.
* Represents the cost for a transaction. This is fetched before the user executes a transaction.
*/
@inject('store')
@observer
export default class TransactionCost {
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
