import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import _ from 'lodash';
import styled, { css } from 'styled-components';
import { FormattedMessage, injectIntl } from 'react-intl';
import {
  AppBar,
  Toolbar,
  Button,
  withStyles,
} from '@material-ui/core';
import cx from 'classnames';
import { Routes } from 'constants';
import { Link } from 'react-router-dom';

import NavLink from './components/NavLink';
import { faqUrls } from '../../config/app';
import styles from './styles';
import Tracking from '../../helpers/mixpanelUtil';
import ImageLocaleWrapper from './components/ImageLocaleWrapper';
import WithdrawExchangeButton from '../WithdrawExchangeButton';
import DepositExchangeButton from '../DepositExchangeButton';

@withStyles(styles, { withTheme: true })
@injectIntl
@inject('store')
export default class NavBar extends Component {
  state = {
    dropdownDirection: 'down',
  }
  componentDidMount() {
    this.props.store.global.getActionableItemCount();
  }
  changeDropDownDirection() {
    if (this.state.dropdownDirection === 'down') this.setState({ dropdownDirection: 'up' });
    if (this.state.dropdownDirection === 'up') this.setState({ dropdownDirection: 'down' });
  }
  render() {
    const { classes } = this.props;
    this.changeDropDownDirection = this.changeDropDownDirection.bind(this);
    return (
      <AppBar position="fixed" className={classes.navBar}>
        <Toolbar className={classes.navBarWrapper}>
          <NavSection>
            <Exchange {...this.props} />
            <DepositExchangeButton />
            <WithdrawExchangeButton />
            <WalletLink {...this.props} />
          </NavSection>
          <MyActivities {...this.props} />
          <Toggle onClick={this.changeDropDownDirection}><div className={`icon iconfont icon-ic_${this.state.dropdownDirection}`}></div></Toggle>
          <Dropdown data-show={this.state.dropdownDirection === 'down'}>
            <Wallet {...this.props} />
            <Link to={Routes.SETTINGS}>
              <Item onClick={this.changeDropDownDirection}>
                <FormattedMessage id="navBar.settings" defaultMessage="Settings" />
              </Item>
            </Link>
            <QAButton {...this.props} changeDropDownDirection={this.changeDropDownDirection} />
          </Dropdown>
        </Toolbar>
      </AppBar>
    );
  }
}

const QAButton = ({ intl, changeDropDownDirection }) => (
  <a
    onClick={() => {
      window.open(faqUrls[intl.locale], '_blank');
      Tracking.track('navBar-helpClick');
    }}
  >
    <Item onClick={changeDropDownDirection}>
      <FormattedMessage id="help" defaultMessage="Help" />
    </Item>
  </a>
);

const NavBarRightButtonContainer = styled.div`
  height: 70px;
  line-height: 70px;
  text-align: center;
  color: white;
  position: absolute;
  right: 70px;
  top: 0px;
  padding-left: 20px;
  padding-right: 20px;
  border-left: 1px solid rgba(0,0,0,0.2);
`;
const NavBarRightButton = styled.div`
  height: 30px;
  margin: 20px auto;
  line-height: 30px;
`;

const MyActivities = observer(({ store: { global } }) => (
  <NavLink to={Routes.ACTIVITY_HISTORY}>
    <NavBarRightButtonContainer>
      <NavBarRightButton>
        <FormattedMessage id="navBar.history" defaultMessage="My History" />
      </NavBarRightButton>
    </NavBarRightButtonContainer>
  </NavLink>
));

const Wallet = styled(({ store: { wallet } }) => {
  const totalRUNES = _.sumBy(wallet.addresses, ({ runebase }) => runebase).toFixed(2) || '0.00';
  const totalPRED = _.sumBy(wallet.addresses, ({ pred }) => pred).toFixed(2) || '0.00';
  const totalFUN = _.sumBy(wallet.addresses, ({ fun }) => fun).toFixed(2) || '0.00';
  return (<Link to={Routes.WALLET}>
    <Item>
      <WalletItem>
        <i className={cx('icon', 'iconfont', 'icon-ic_wallet')}></i>
      </WalletItem>
      <WalletItem>
        <div style={{ paddingPredtom: '10px' }}><b>{totalRUNES}</b> RUNES</div>
        <div><b>{totalPRED}</b> PRED</div>
        <div><b>{totalFUN}</b> FUN</div>
      </WalletItem>
      <WalletItem>{'>'}</WalletItem>
    </Item>
  </Link>);
})``;

const WalletItem = styled.div``;

const Dropdown = styled.div`
  background: white;
  box-shadow: 0px -2px 20px -2px rgba(0,0,0,0.2), 0px -2px 5px rgba(0,0,0,0.1);
  position: absolute;
  right: 0px;
  top: 70px;
  min-width: 275px;
  color: black;
  transition: 0.3s all ease-in-out;
  ${({ ...props }) => Boolean(props['data-show']) && css`
    display: none;
  `}
`;

const Item = styled.div`
  background: white;
  display: flex;
  text-align: left;
  padding: 25px;
  cursor: pointer;
  border-predtom: 1px solid rgba(0,0,0,0.15);
  justify-content: space-between;
  &:hover: {
    background: rgba(0,0,0,0.2);
  }
`;

const Toggle = styled.div`
  text-align: center;
  background: #4244BB !important;
  height: 70px;
  width: 70px;
  line-height: 70px;
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.8;
  }
  &:active {
    opacity: 1;
  }
`;

const RunebaseExchangeLogo = ({ classes }) => (
  <Link to={Routes.EXCHANGE}>
    <ImageLocaleWrapper
      appliedLanguages={['zh-Hans-CN']}
      src="/images/runebaseexchange-logo.svg"
      alt="runebaseexchange-logo"
      className={classes.navBarLogo}
    />
  </Link>
);

const Exchange = observer(({ store: { ui } }) => (
  <NavLink to={Routes.EXCHANGE}>
    <Button
      className={cx(
        'ui',
        'positive',
        'button',
        ui.location === Routes.EXCHANGE ? 'selected' : '',
      )}
    >
      <FormattedMessage id="navbar.exchange" defaultMessage="Exchange" />
    </Button>
  </NavLink>
));

const WalletLink = observer(({ store: { ui, wallet } }) => (
  <NavLink to={Routes.WALLET}>
    <Button
      className={cx(
        'ui',
        'negative',
        'button',
        ui.location === Routes.WALLET ? 'selected' : '',
      )}
    >
      <FormattedMessage id="navbar.wallet" defaultMessage="Wallet" />
    </Button>
  </NavLink>
));

const NavSection = withStyles(styles)(({ classes, ...props }) => <div {...props} className={classes.navSection} />);
