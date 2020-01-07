/* eslint-disable react/static-property-placement, react/destructuring-assignment, react/no-access-state-in-setstate, react/jsx-props-no-spreading, react/jsx-one-expression-per-line, react/jsx-tag-spacing */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { inject, observer } from 'mobx-react';
import {
  Typography,
  Grid,
  FormLabel,
  InputLabel,
  Card,
  withStyles,
} from '@material-ui/core';
import Form from 'muicss/lib/react/form';
import Input from 'muicss/lib/react/input';
import styles from './styles';
import OrderExchange from './OrderExchange';

export default @injectIntl @withStyles(styles, { withTheme: true }) @inject('store') @observer class SellOrder extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      amount: 0,
      price: 0,
      total: 0,
      orderType: 'sell',
      hasError: false,
    };
  }

  changeAmount = (event, tokenAmount) => {
    const validateTotal = event.target.value * this.state.price;
    if (event.target.value === '' || /^\d+(\.\d{1,8})?$/.test(event.target.value)) {
      this.setState({
        amount: event.target.value,
        total: event.target.value * this.state.price,
        hasError: false,
      });
    }
    if (tokenAmount < validateTotal) {
      const newAmount = tokenAmount / this.state.price;
      this.setState({
        amount: newAmount,
        total: newAmount * this.state.price,
        hasError: false,
      });
    }
    if (this.props.store.wallet.currentAddressSelected === '') {
      this.setState({
        hasError: true,
      });
    }
  }

  changePrice = (event, tokenAmount) => {
    const validateTotal = event.target.value * this.state.amount;
    if (event.target.value === '' || /^\d+(\.\d{1,8})?$/.test(event.target.value)) {
      this.setState({
        price: event.target.value,
        total: event.target.value * this.state.amount,
        hasError: false,
      });
    }
    if (tokenAmount < validateTotal) {
      const newPrice = tokenAmount / this.state.amount;
      this.setState({
        price: newPrice,
        total: newPrice * this.state.amount,
        hasError: false,
      });
    }
    if (this.props.store.wallet.currentAddressSelected === '') {
      this.setState({
        hasError: true,
      });
    }
  }

  total = () => this.amount * this.price;


  render() {
    const { classes, store: { wallet, marketStore, baseCurrencyStore } } = this.props;
    const market = wallet.currentMarket;
    const isEnabled = wallet.currentAddressSelected !== '';
    let tokenAmount;

    if (wallet.currentAddressKey !== '') {
      Object.keys(marketStore.marketInfo).forEach((key) => {
        if (market === marketStore.marketInfo[key].market) {
          tokenAmount = wallet.addresses[wallet.currentAddressKey].Exchange[market];
        }
      });
    }

    return (
      <div>
        <Card className={classes.dashboardOrderBookTitle}>
          <p>Create Sell Order ({wallet.currentMarket})</p>
        </Card>
        <Card className={classes.dashboardOrderBook}>
          <Grid container className={classes.dashboardOrderBookWrapper}>
            <Grid item xs={12}>
              <Form className={classes.tokenSelect} onSubmit={this.handleSubmit}>
                <h3>{wallet.currentMarket}/{baseCurrencyStore.baseCurrency.pair}</h3>
                {(() => {
                  if (wallet.currentAddressKey !== '') {
                    return (<Typography variant="body2" className='fat'>{tokenAmount} {wallet.market}</Typography>);
                  }
                  return (
                    <p>...</p>
                  );
                })()}
                {this.state.hasError && <span>Please select an address</span>}
                <Grid container>
                  <Grid item xs={2}>
                    <InputLabel className='inputLabels'>
                      Amount:
                    </InputLabel>
                  </Grid>
                  <Grid item xs={8}>
                    <Input disabled={!isEnabled} className='inputWidth' type="number" step="0.00000001" min="0" value={this.state.amount} onChange={(event) => { this.changeAmount(event, tokenAmount); }} name="amount" />
                  </Grid>
                  <Grid item xs={2}>
                    <InputLabel className='inputLabels'>
                      {wallet.market}
                    </InputLabel>
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item xs={2}>
                    <FormLabel className='inputLabels'>
                      Price:
                    </FormLabel>
                  </Grid>
                  <Grid item xs={8}>
                    <Input disabled={!isEnabled} className='inputWidth' type="number" step="0.00000001" min="0" value={this.state.price} onChange={(event) => { this.changePrice(event, tokenAmount); }} name="price" />
                  </Grid>
                  <Grid item xs={2} >
                    <InputLabel className='inputLabels'>
                      RUNES
                    </InputLabel>
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item xs={2}>
                    <FormLabel className='inputLabels'>
                      Total:
                    </FormLabel>
                  </Grid>
                  <Grid item xs={8}>
                    <Input disabled className='inputWidth' value={this.state.total} name="total" />
                  </Grid>
                  <Grid item xs={2}>
                    <FormLabel className={`inputLabels ${classes.orderLabel}`}>
                      RUNES
                    </FormLabel>
                  </Grid>
                </Grid>
                <OrderExchange tokenAmount={tokenAmount} {...this.state} />
              </Form>
            </Grid>
          </Grid>
        </Card>
      </div>
    );
  }
}
