import React, { useState, useEffect } from 'react';
import { bool, func, object, number, string } from 'prop-types';
import { FormattedMessage, intlShape } from '../../util/reactIntl';
import classNames from 'classnames';
import { ACCOUNT_SETTINGS_PAGES } from '../../routeConfiguration';
import { propTypes } from '../../util/types';
import {
  Avatar,
  InlineTextButton,
  Logo,
  Menu,
  MenuLabel,
  MenuContent,
  MenuItem,
  NamedLink,
  ListingLink,
  OwnListingLink,
} from '../../components';
import { TopbarSearchForm } from '../../forms';

import css from './TopbarDesktop.module.css';
import { Link } from 'react-router-dom';
import {forceLoad} from "@sentry/browser";

const TopbarDesktop = props => {
  const {
    className,
    currentUser,
    currentPage,
    rootClassName,
    currentUserHasListings,
    currentUserListing,
    currentUserListingFetched,
    notificationCount,
    intl,
    isAuthenticated,
    onLogout,
    onSearchSubmit,
    initialSearchFormValues,
  } = props;
  function changeLanguage(lang){
    if (typeof window !== 'undefined') {

      localStorage.setItem("mobile_food_language", lang)
      console.log("CLIQUE")
      location.reload()
    }
  }
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const authenticatedOnClientSide = mounted && isAuthenticated;
  const isAuthenticatedOrJustHydrated = isAuthenticated || !mounted;
  const isAdmin=isAuthenticated&&currentUser!=null&&currentUser.attributes.profile.publicData.admin!=null?currentUser.attributes.profile.publicData.admin:false
  const classes = classNames(rootClassName || css.root, className);

  const search = (
    <TopbarSearchForm
      className={css.searchLink}
      desktopInputRoot={css.topbarSearchWithLeftPadding}
      onSubmit={onSearchSubmit}
      initialValues={initialSearchFormValues}
    />
  );

  const createListingMaybe=isAdmin?
        <NamedLink className={css.createListingLink} name="NewListingPage">
          <span className={css.createListing}>
            <FormattedMessage id="TopbarDesktop.createListing" />
          </span>
        </NamedLink>
      :null
  const specialRequest=(
  <a className={css.specialRequestLink} href="https://mobile-food.typeform.com/to/uSX7xIRN?utm_source=nav">
    <span className={css.specialRequest}>
            <FormattedMessage id="TopBarDesktop.specialRequest" />
    </span>
  </a>)
  const notificationDot = notificationCount > 0 ? <div className={css.notificationDot} /> : null;

  const inboxLink = authenticatedOnClientSide ? (
    <NamedLink
      className={css.inboxLink}
      name="InboxPage"
      params={{ tab: currentUserHasListings ? 'sales' : 'orders' }}
    >
      <span className={css.inbox}>
        <FormattedMessage id="TopbarDesktop.inbox" />
        {notificationDot}
      </span>
    </NamedLink>
  ) : null;

  const currentPageClass = page => {
    const isAccountSettingsPage =
      page === 'AccountSettingsPage' && ACCOUNT_SETTINGS_PAGES.includes(currentPage);
    return currentPage === page || isAccountSettingsPage ? css.currentPage : null;
  };
  const languageSelector=(
    <Menu>
      <MenuLabel className={css.languageMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <span>{   typeof window !== 'undefined'? localStorage.getItem("mobile_food_language"):"FR"}</span>

      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
        <MenuItem key="FRLanguage" >
          <div className={css.languageItem} onClick={()=>changeLanguage("FR")}>
            <span className={css.menuItemBorder} />
            <span  >FR</span>

          </div>
        </MenuItem>
        <MenuItem key="DELanguage" >
          <div className={css.languageItem} onClick={()=>changeLanguage("DE")}>
            <span className={css.menuItemBorder} />
            <span  >DE</span>
          </div>

        </MenuItem>

      </MenuContent>
    </Menu>
  )
  const profileMenu = authenticatedOnClientSide ? (
    <Menu>
      <MenuLabel className={css.profileMenuLabel} isOpenClassName={css.profileMenuIsOpen}>
        <Avatar className={css.avatar} user={currentUser} disableProfileLink />
      </MenuLabel>
      <MenuContent className={css.profileMenuContent}>
      {isAdmin?<MenuItem key="ManageListingsPage">
      <NamedLink
        className={classNames(css.yourListingsLink, currentPageClass('ManageListingsPage'))}
        name="ManageListingsPage">
        <span className={css.menuItemBorder} />
        <FormattedMessage id="TopbarDesktop.yourListingsLink" />
      </NamedLink>

          </MenuItem> :null}
        <MenuItem key="ProfileSettingsPage">
          <NamedLink
            className={classNames(css.profileSettingsLink, currentPageClass('ProfileSettingsPage'))}
            name="ProfileSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.profileSettingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="AccountSettingsPage">
          <NamedLink
            className={classNames(css.yourListingsLink, currentPageClass('AccountSettingsPage'))}
            name="AccountSettingsPage"
          >
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
          </NamedLink>
        </MenuItem>
        <MenuItem key="logout">
          <InlineTextButton rootClassName={css.logoutButton} onClick={onLogout}>
            <span className={css.menuItemBorder} />
            <FormattedMessage id="TopbarDesktop.logout" />
          </InlineTextButton>
        </MenuItem>
      </MenuContent>
    </Menu>
  ) : null;

  const signupLink = isAuthenticatedOrJustHydrated ? null : (
    <NamedLink name="SignupPage" className={css.signupLink}>
      <span className={css.signup}>
        <FormattedMessage id="TopbarDesktop.signup" />
      </span>
    </NamedLink>
  );

  const loginLink = isAuthenticatedOrJustHydrated ? null : (
    <NamedLink name="LoginPage" className={css.loginLink}>
      <span className={css.login}>
        <FormattedMessage id="TopbarDesktop.login" />
      </span>
    </NamedLink>
  );

  const listingLink =
    authenticatedOnClientSide && currentUserListingFetched && currentUserListing ? (
      <ListingLink
        className={css.createListingLink}
        listing={currentUserListing}
        children={
          <span className={css.createListing}>
            <FormattedMessage id="TopbarDesktop.viewListing" />
          </span>
        }
      />
    ) : null;

  const createListingLink =
    isAuthenticatedOrJustHydrated && !(currentUserListingFetched && !currentUserListing) ? null : (
      <NamedLink className={css.createListingLink} name="NewListingPage">
        <span className={css.createListing}>
          <FormattedMessage id="TopbarDesktop.createListing" />
        </span>
      </NamedLink>
    );
  const trans='fr'
  return (
    <nav className={classes}>
      <NamedLink className={css.logoLink} name="LandingPage" >
        <Logo
          format="desktop"
          className={css.logo}
          alt={intl.formatMessage({ id: 'TopbarDesktop.logo' })}
        />
      </NamedLink>
      {search}
      {languageSelector}
      {specialRequest}

      {createListingMaybe}

      {inboxLink}
      {profileMenu}
      {signupLink}
      {loginLink}
    </nav>
  );
};

TopbarDesktop.defaultProps = {
  rootClassName: null,
  className: null,
  currentUser: null,
  currentPage: null,
  notificationCount: 0,
  initialSearchFormValues: {},
  currentUserListing: null,
  currentUserListingFetched: false,
};

TopbarDesktop.propTypes = {
  rootClassName: string,
  className: string,
  currentUserHasListings: bool.isRequired,
  currentUserListing: propTypes.ownListing,
  currentUserListingFetched: bool,
  currentUser: propTypes.currentUser,
  currentPage: string,
  isAuthenticated: bool.isRequired,
  onLogout: func.isRequired,
  notificationCount: number,
  onSearchSubmit: func.isRequired,
  initialSearchFormValues: object,
  intl: intlShape.isRequired,
};

export default TopbarDesktop;
