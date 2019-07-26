import gql from 'graphql-tag';

import { getTypeDef } from './schema';

const subscriptions = {
  onSyncInfo: `
    subscription OnSyncInfo {
      onSyncInfo {
        ${getTypeDef('SyncInfo')}
      }
    }
  `,
  onActiveOrderInfo: `
    subscription OnActiveOrderInfo {
      onActiveOrderInfo {
        ${getTypeDef('NewOrder')}
      }
    }
  `,
  onFulfilledOrderInfo: `
    subscription OnFulfilledOrderInfo {
      onFulfilledOrderInfo {
        ${getTypeDef('NewOrder')}
      }
    }
  `,
  onCanceledOrderInfo: `
    subscription OnCanceledOrderInfo {
      onCanceledOrderInfo {
        ${getTypeDef('NewOrder')}
      }
    }
  `,
  onMyTradeInfo: `
    subscription OnMyTradeInfo {
      onMyTradeInfo {
        ${getTypeDef('Trade')}
      }
    }
  `,
  onBuyHistoryInfo: `
    subscription OnBuyHistoryInfo {
      onBuyHistoryInfo {
        ${getTypeDef('Trade')}
      }
    }
  `,
  onSellHistoryInfo: `
    subscription OnSellHistoryInfo {
      onSellHistoryInfo {
        ${getTypeDef('Trade')}
      }
    }
  `,
  onBuyOrderInfo: `
    subscription OnBuyOrderInfo {
      onBuyOrderInfo {
        ${getTypeDef('NewOrder')}
      }
    }
  `,
  onSellOrderInfo: `
    subscription OnSellOrderInfo {
      onSellOrderInfo {
        ${getTypeDef('NewOrder')}
      }
    }
  `,
  onFundRedeemInfo: `
    subscription OnFundRedeemInfo {
      onFundRedeemInfo {
        ${getTypeDef('FundRedeem')}
      }
    }
  `,
  onSelectedOrderInfo: `
    subscription OnSelectedOrderInfo {
      onSelectedOrderInfo {
        ${getTypeDef('NewOrder')}
      }
    }
  `,
};

function getSubscription(name) {
  return gql`${subscriptions[name]}`;
}

export default getSubscription;
export const channels = {
  ON_SYNC_INFO: 'onSyncInfo',
  ON_FUNDREDEEM_INFO: 'onFundRedeemInfo',
  ON_MYORDER_INFO: 'onMyOrderInfo',
  ON_ACTIVEORDER_INFO: 'onActiveOrderInfo',
  ON_FULFILLEDORDER_INFO: 'onFulfilledOrderInfo',
  ON_CANCELEDORDER_INFO: 'onCanceledOrderInfo',
  ON_MYTRADE_INFO: 'onMyTradeInfo',
  ON_SELLHISTORY_INFO: 'onSellHistoryInfo',
  ON_BUYHISTORY_INFO: 'onBuyHistoryInfo',
  ON_BUYORDER_INFO: 'onBuyOrderInfo',
  ON_SELLORDER_INFO: 'onSellOrderInfo',
  ON_SELECTEDORDER_INFO: 'onSelectedOrderInfo',
};
