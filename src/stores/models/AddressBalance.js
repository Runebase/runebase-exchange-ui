import _ from 'lodash';
import { satoshiToDecimal } from '../../helpers/utility';

export default class AddressBalance {
  address = ''
  balance = ''
  Wallet = {}
  Exchange = {}
  RUNES = ''
  PRED = ''


  constructor(addressBalance) {
    Object.assign(this, addressBalance);
    this.address = this.address;
    try {
      this.balance = _.omit(JSON.parse(addressBalance.balance), ['balance']);
    } catch (e) {
      return false;
    }

    if (!_.isEmpty(this.balance.Wallet)) {
      Object.keys(this.balance.Wallet).forEach((key) => {
        this.Wallet[key] = this.balance.Wallet[key];
      });
    }

    if (!_.isEmpty(this.balance.Exchange)) {
      Object.keys(this.balance.Exchange).forEach((key) => {
        this.Exchange[key] = this.balance.Exchange[key];
      });
    }
    if (!_.isEmpty(addressBalance.balance)) {
      this.RUNES = satoshiToDecimal(this.balance.RUNES);
      this.PRED = satoshiToDecimal(this.balance.Wallet.PRED);
      this.FUN = satoshiToDecimal(this.balance.Wallet.FUN);
      this.exchangerunes = satoshiToDecimal(this.balance.Exchange.RUNES);
      this.exchangepred = satoshiToDecimal(this.balance.Exchange.PRED);
      this.exchangefun = satoshiToDecimal(this.balance.Exchange.FUN);
      this.Exchange.RUNES = satoshiToDecimal(this.balance.Exchange.RUNES);
    }

    console.log('Address Balance Model:');
    console.log(this);
  }
}
