import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { ListingLink } from '../../components';
import { EditListingPricingForm } from '../../forms';
import { ensureOwnListing } from '../../util/data';
import { types as sdkTypes } from '../../util/sdkLoader';
import config from '../../config';
import {
  convertUnitToSubUnit,
  ensureDotSeparator,
  unitDivisor,
} from '../../util/currency';

import css from './EditListingPricingPanel.module.css';

const { Money } = sdkTypes;

const EditListingPricingPanel = props => {

  const {
    className,
    rootClassName,
    listing,
    disabled,
    ready,
    onSubmit,
    onChange,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureOwnListing(listing);
  const { price, publicData } = currentListing.attributes;
  const fee =publicData && publicData.fee ? publicData.fee : null;
  const feeName=fee?fee.name:null
  const feeAsMoney = fee
    ? new Money(fee.amount, fee.currency)
    : null;
  const initialValues = { price, fee: feeAsMoney, feeName };
  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
  const panelTitle = isPublished ? (
    <FormattedMessage
      id="EditListingPricingPanel.title"
      values={{
        listingTitle: (
          <ListingLink listing={listing}/>
          
           
        ),
      }}
    />
  ) : (
    <FormattedMessage id="EditListingPricingPanel.createListingTitle" />
  );

  const getPrice = (unformattedValue, currencyConfig) => {
    const isEmptyString = unformattedValue === '';
    console.log("isempty", isEmptyString);
    try {
      return isEmptyString
      
        ? null
        : new Money(
            convertUnitToSubUnit(unformattedValue, unitDivisor(currencyConfig.currency)),
            currencyConfig.currency
          );
    } catch (e) {
      console.log("incatch", e);
      return null;
    }
  };
  const priceCurrencyValid = price instanceof Money ? price.currency === config.currency : true;
  const form = priceCurrencyValid ? (
    <EditListingPricingForm
      className={css.form}
      initialValues={initialValues}
      onSubmit={values => {
       
        const {fee = null , feeName=null} = values;
       
        
        
        const price = getPrice(ensureDotSeparator("0"), config.currencyConfig);
        console.log(price); 
        const updatedValues = {
          price,
          publicData: {
            fee: { name:feeName ,amount: fee.amount, currency: fee.currency },
          },
        };
        onSubmit(updatedValues);
      }}
      onChange={onChange}
      saveActionMsg={submitButtonText}
      disabled={disabled}
      ready={ready}
      updated={panelUpdated}
      updateInProgress={updateInProgress}
      fetchErrors={errors}
    />
  ) : (
    <div className={css.priceCurrencyInvalid}>
      <FormattedMessage id="EditListingPricingPanel.listingPriceCurrencyInvalid" />
    </div>
  );

  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      {form}
    </div>
  );
};

const { func, object, string, bool } = PropTypes;

EditListingPricingPanel.defaultProps = {
  className: null,
  rootClassName: null,
  listing: null,
};

EditListingPricingPanel.propTypes = {
  className: string,
  rootClassName: string,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  disabled: bool.isRequired,
  ready: bool.isRequired,
  onSubmit: func.isRequired,
  onChange: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  errors: object.isRequired,
};

export default EditListingPricingPanel;
