import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import {
  Typography,
  Card,
  Grid,
  withStyles,
} from '@material-ui/core';
import 'semantic-ui-css/semantic.min.css';
import styles from './styles';
import FundExchange from './FundExchange';
import './mystyle.css';
import DropDownAddresses from './DropDownAddresses';

@injectIntl
@withStyles(styles, { withTheme: true })
@inject('store')
@observer
export default class MarketInfo extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
  }

  handleSelectChange = (key, event) => {
    this.props.store.wallet.changeAddress(key, event);
    this.setState({ show: false });
  }

  handleToggle = (e) => {
    e.target.focus();
    this.setState({ show: !this.state.show });
  }

  handleBlur = (e) => {
    if (e.nativeEvent.explicitOriginalTarget &&
        e.nativeEvent.explicitOriginalTarget === e.nativeEvent.originalTarget) {
      return;
    }

    if (this.state.show) {
      setTimeout(() => {
        this.setState({ show: false });
      }, 200);
    }
  }

  render() {
    const { classes, store: { wallet } } = this.props;
    return (
      <div>
        <Grid container>
          <Grid item xs={3}>
            <Grid container>
              <Grid item xs={12}>
                <FundExchange />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={9}>
            <Grid container>
              <Grid item xs={12}>
                <DropDownAddresses
                  show={this.state.show}
                  handleToggle={this.handleToggle}
                  handleBlur={this.handleBlur}
                  handleSelectChange={this.handleSelectChange}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Card className={classes.dashboardOrderBookTitle}>
          <p>My Wallet Balances</p>
        </Card>
        <Grid container>
          {(() => {
            if (wallet.currentAddressKey !== '') {
              return (
                <Grid item xs={12}>
                  <Card className={classes.dashboardOrderBook}>
                    <Grid container className='marginTopBot fat'>
                      <Grid item xs={3}>
                        <Typography variant="body2">RUNES(GAS)</Typography>
                        <Typography variant="body2">{wallet.addresses[wallet.currentAddressKey].runebase}</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">PRED</Typography>
                        <Typography variant="body2">{wallet.addresses[wallet.currentAddressKey].pred}</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body2">FUN</Typography>
                        <Typography variant="body2">{wallet.addresses[wallet.currentAddressKey].fun}</Typography>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              );
            }
            return (
              <Grid item xs={12}>
                <Card className={classes.dashboardOrderBook}>
                  <Grid container>
                    <Grid item xs={12}>
                      <p>...</p>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            );
          })()}
          <Grid item xs={12}>
            <div>{wallet.market}/RUNES</div>
          </Grid>
          <Grid item xs={12}>
            <div>Contract Address: {wallet.currentMarketContract}</div>
          </Grid>
        </Grid>
      </div>
    );
  }
}
