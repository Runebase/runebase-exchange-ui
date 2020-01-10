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
  onSelectedOrderInfo: `
    subscription OnSelectedOrderInfo {
      onSelectedOrderInfo {
        ${getTypeDef('NewOrder')}
      }
    }
  `,
};

export function getSubscription(name) {
  return gql`${subscriptions[name]}`;
}

export function getonSellOrderInfoSubscription(token, orderType, status) {
  return gql`
    subscription OnSellOrderInfo {
      onSellOrderInfo (orderType: "${orderType}", token: "${token}", status: "${status}"){
        ${getTypeDef('NewOrder')}
      }
    }
  `;
}

export function getonBuyOrderInfoSubscription(orderType, token, status) {
  return gql`
    subscription OnBuyOrderInfo {
      onBuyOrderInfo (orderType: "${orderType}", token: "${token}", status: "${status}"){
        ${getTypeDef('NewOrder')}
      }
    }
  `;
}

export function getOnBuyHistoryInfoSubscription(token, orderType) {
  return gql`
    subscription OnBuyHistoryInfo {
      onBuyHistoryInfo (token: "${token}", orderType: "${orderType}"){
        ${getTypeDef('Trade')}
      }
    }
  `;
}

export function getOnSellHistoryInfoSubscription(token, orderType) {
  return gql`
    subscription OnSellHistoryInfo {
      onSellHistoryInfo (token: "${token}", orderType: "${orderType}"){
        ${getTypeDef('Trade')}
      }
    }
  `;
}

export function getOnMyTradeInfoSubscription(Address) {
  return gql`
    subscription OnMyTradeInfo {
      onMyTradeInfo (from: "${Address}", to: "${Address}"){
        ${getTypeDef('Trade')}
      }
    }
  `;
}

export function getOnFundRedeemInfoSubscription(Address) {
  return gql`
    subscription OnFundRedeemInfo {
      onFundRedeemInfo (owner: "${Address}"){
        ${getTypeDef('FundRedeem')}
      }
    }
  `;
}

export const channels = {
  ON_SYNC_INFO: 'onSyncInfo',
  ON_MYORDER_INFO: 'onMyOrderInfo',
  ON_ACTIVEORDER_INFO: 'onActiveOrderInfo',
  ON_FULFILLEDORDER_INFO: 'onFulfilledOrderInfo',
  ON_CANCELEDORDER_INFO: 'onCanceledOrderInfo',
  ON_SELECTEDORDER_INFO: 'onSelectedOrderInfo',
};
