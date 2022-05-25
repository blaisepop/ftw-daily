import React from 'react';
import classNames from 'classnames';
import { ExternalLink } from '../../components';

import css from './TransactionPanel.module.css';

// Functional component as a helper to build AddressLinkMaybe
const AddressLinkMaybe = props => {
  const { className, rootClassName, location, geolocation, showAddress } = props;
  const { address} = location || {};
  const { lat, lng } = geolocation || {};
  const hrefToGoogleMaps = geolocation
    ? `https://maps.google.com/?q=${lat},${lng}`
    : address
    ? `https://maps.google.com/?q=${encodeURIComponent(address)}`
    : null;

  const fullAddress =
     address;

  const classes = classNames(rootClassName || css.address, className);
  return showAddress && hrefToGoogleMaps ? (
    <p className={classes}>
      <ExternalLink href={hrefToGoogleMaps}>{fullAddress}</ExternalLink>
    </p>
  ) : null;
};

export default AddressLinkMaybe;
