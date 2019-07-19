import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { Grid } from '@material-ui/core';
import Loading from '../../components/EventListLoading';
import MyOrderBook from './components/MyOrderBook';
import PriceChart from './components/PriceChart';
import MyTrades from './components/MyTrades';
import Markets from './components/Markets';
import MarketInfo from './components/MarketInfo';
import MyBalance from './components/MyBalance';
import BuyOrder from './components/BuyOrder';
import SellOrder from './components/SellOrder';
import BuyBook from './components/BuyBook';
import SellBook from './components/SellBook';
import SellHistory from './components/SellHistory';
import BuyHistory from './components/BuyHistory';
import FundRedeemHistory from './components/FundRedeemHistory';

@inject('store')
@observer
export default class Exchange extends Component {
  render() {
    const { loading } = this.props.store.global;
    if (loading) return <Loading />;
    return (
      <Fragment>
        <Grid container>
          <Grid item xs={4}>
            <MyBalance />
            <Markets />
            <MyOrderBook />
            <MyTrades />
            <FundRedeemHistory />
          </Grid>
          <Grid item xs={8}>
            <Grid container>
              <Grid item xs={12}>
                <MarketInfo />
              </Grid>
              <Grid item xs={12}>
                <PriceChart
                  id="chart"
                />
              </Grid>
            </Grid>
            <Grid container>
              <BuyOrder />
              <SellOrder />
            </Grid>
            <Grid container>
              <Grid item xs={6}>
                <SellBook />
              </Grid>
              <Grid item xs={6}>
                <BuyBook />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={6}>
                <SellHistory />
              </Grid>
              <Grid item xs={6}>
                <BuyHistory />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}
