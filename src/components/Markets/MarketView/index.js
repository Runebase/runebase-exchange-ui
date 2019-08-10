import React, { PureComponent } from 'react';
import _ from 'lodash';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';
import { Card, Grid, Typography } from '@material-ui/core';
import classNames from 'classnames/bind';
import './styles.css';

@injectIntl
@inject('store')
export default class MarketView extends PureComponent {
  render() {
    const { market, tokenName, price, change, volume } = this.props.event;
    const { store: { wallet, marketStore, baseCurrencyStore } } = this.props;
    const fixedVolume = parseFloat(volume).toFixed(2);
    let active = false;
    let changePos = false;
    let changeNeg = false;
    if (market === wallet.market) {
      active = true;
    }
    const triggerActive = classNames(
      'marketCard',
      {
        activeCard: active,
        notSelected: !active,
      }
    );
    if (change.charAt(0) === '-') {
      changePos = false;
      changeNeg = true;
    } else {
      changePos = true;
      changeNeg = false;
    }
    const changeClass = classNames({
      positiveChange: changePos,
      negativeChange: changeNeg,
    });
    const findImage = _.find(marketStore.marketImages, { market: `${market}` });

    return (
      <div>
        <Card className={triggerActive} onClick={() => wallet.changeMarket(market, wallet.addresses)}>
          <Grid container>
            <Grid item xs={3}>
              <p className='textCenter fat'>{tokenName}</p>
            </Grid>
            <Grid item xs={9}>
              <p className='textCenter fat'>{market}/{baseCurrencyStore.baseCurrency.pair}</p>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={3} className='fullheight'>
              <div className='fullWidth'>
                {findImage ? (<img alt={market} src={`https://ipfs.io/ipfs/${findImage.image}`} />) : (<div>Loading...</div>)}
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className="like-table">
                <div className="like-table-row">
                  <div className="like-table-cell valign-middle">
                    <Typography variant="body2" className='textCenter'>Price</Typography>
                    <Typography variant="body2" className='textCenter fat'>{price}</Typography>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className="like-table">
                <div className="like-table-row">
                  <div className="like-table-cell valign-middle">
                    <Typography variant="body2" className='textCenter'>Change</Typography>
                    <Typography variant="body2" className={`textCenter fat ${changeClass}`}>{change}%</Typography>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className="like-table">
                <div className="like-table-row">
                  <div className="like-table-cell valign-middle">
                    <Typography variant="body2" className='textCenter'>Volume</Typography>
                    <Typography variant="body2" className='textCenter fat'>{fixedVolume}</Typography>
                  </div>
                </div>
              </div>
            </Grid>
          </Grid>
        </Card>
      </div>
    );
  }
}
