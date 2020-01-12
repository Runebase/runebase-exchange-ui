import { inject, observer } from 'mobx-react';
import { satoshiToDecimal } from '../../helpers/utility';


/*
* Model for TransactionCost.
* Represents the cost for a transaction. This is fetched before the user executes a transaction.
*/

export default class TransactionCost {
  type

  token

  amount

  gasLimit

  gasCost

  constructor(txCost, baseCurrencyPair) {
    Object.assign(this, txCost);
    console.log('txCost');
    console.log(txCost);
    console.log(baseCurrencyPair);

    if (this.token !== baseCurrencyPair) {
      this.amount = satoshiToDecimal(this.amount);
    }
  }
}
