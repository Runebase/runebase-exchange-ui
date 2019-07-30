import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Divider } from 'semantic-ui-react';
import {
  Grid,
} from '@material-ui/core';
import './styles.css';

@inject('store')
@observer
export default class DropDownAddresses extends Component {
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
    const { store: { wallet } } = this.props;
    const addressSelectBoolean = wallet.currentAddressSelected === '';
    return (
      <div className='dropdown-container'>
        <div className={`arrow ${addressSelectBoolean ? 'pulsate' : 'notPulsate'}`} htmlFor='selectAddress'>
          <div
            id='selectAddress'
            type='button'
            value={wallet.currentAddressSelected !== '' ? wallet.currentAddressSelected : 'Please Select An Address'}
            className='dropdown-btn'
            onClick={this.handleToggle}
            onBlur={this.handleBlur}
          >
            {wallet.currentAddressSelected !== '' ? wallet.currentAddressSelected : 'Please Select An Address'}
          </div>

        </div>
        <ul className="dropdown-list" hidden={!this.state.show}>
          {wallet.addresses.map((addressData, key) => {
            if (addressData.fun > 0 || addressData.RUNES > 0 || addressData.pred > 0 || addressData.exchangerunes > 0 || addressData.exchangepred > 0 || addressData.exchangefun > 0) {
              return (
                <li
                  className="option"
                  onClick={this.handleSelectChange.bind(this, key) /* eslint-disable-line */ }
                  key={key}
                  address={addressData.address}
                  runes={addressData.RUNES}
                  pred={addressData.pred}
                  fun={addressData.fun}
                  role='presentation'
                >
                  <Grid container className='centerText'>
                    <Grid item xs={12}>
                      {addressData.address}
                    </Grid>
                  </Grid>
                  <Divider horizontal>Wallet</Divider>
                  <Grid container className='centerText'>
                    <Grid item xs={3}>
                      <div className='fullWidth'>
                        RUNES
                      </div>
                      <div className='fullWidth fat'>
                        {addressData.RUNES}
                      </div>
                    </Grid>
                    <Grid item xs={3} address={addressData.address}>
                      <div className='fullWidth'>
                        PRED
                      </div>
                      <div className='fullWidth fat'>
                        {addressData.pred}
                      </div>
                    </Grid>
                    <Grid item xs={3} address={addressData.address}>
                      <div className='fullWidth'>
                        FUN
                      </div>
                      <div className='fullWidth fat'>
                        {addressData.fun}
                      </div>
                    </Grid>
                  </Grid>
                  <Divider horizontal>Exchange</Divider>
                  <Grid container className='centerText'>
                    <Grid item xs={3} >
                      <div className='fullWidth'>
                        RUNES
                      </div>
                      <div className='fullWidth fat'>
                        {addressData.exchangerunes}
                      </div>
                    </Grid>
                    <Grid item xs={3} address={addressData.address}>
                      <div className='fullWidth'>
                        PRED
                      </div>
                      <div className='fullWidth fat'>
                        {addressData.exchangepred}
                      </div>
                    </Grid>
                    <Grid item xs={3} address={addressData.address}>
                      <div className='fullWidth'>
                        FUN
                      </div>
                      <div className='fullWidth fat'>
                        {addressData.exchangefun}
                      </div>
                    </Grid>
                  </Grid>
                </li>
              );
            }
            return null;
          })}
        </ul>
      </div>
    );
  }
}
