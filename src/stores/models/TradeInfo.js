import _ from 'lodash';

import AddressBalance from './AddressBalance';
import { SortBy } from '../../constants';


export default class SyncInfo {
  percent = 0
  blockNum = 0
  blockTime = ''
  balances = []
  peerNodeCount = 0

  constructor(syncInfo) {
    Object.assign(this, syncInfo);
    const balances = _.map(syncInfo.addressBalances, (addressBalance) => new AddressBalance(addressBalance));
    this.balances = _.orderBy(balances, ['RUNES'], [SortBy.DESCENDING.toLowerCase()]);
  }
}
