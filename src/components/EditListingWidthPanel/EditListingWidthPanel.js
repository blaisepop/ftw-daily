import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import config from '../../config.js';
import { FormattedMessage } from '../../util/reactIntl';
import { ensureOwnListing } from '../../util/data';
import { findOptionsForSelectFilter } from '../../util/search';

import { ListingLink } from '../../components';
import { EditListingWidthForm } from '../../forms';

// Create this file using EditListingDescriptionPanel.module.css
// as a template.
import css from './EditListingWidthPanel.module.css';

const EditListingWidthPanel = props => {
  const {
    className,
    rootClassName,
    listing,
    onSubmit,
    onChange,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureOwnListing(listing);
  console.log(currentListing.attributes)
  const { publicData } = currentListing.attributes;
  const { dimensions} = publicData;
  const panelTitle = currentListing.id ? (
    <FormattedMessage
      id="EditListingWidthPanel.title"
      values={{ listingTitle: <ListingLink listing={listing} /> }}
    />
  ) : (
    <FormattedMessage id="EditListingWidthPanel.createListingTitle" />
  );
  const widthOptions = findOptionsForSelectFilter(
    'width',
    config.custom.filters
  );
    //console.log(width, height, length)
  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      <EditListingWidthForm
        initialValues={dimensions}

        className={css.form}
        onSubmit={values => {
          const { width, height, length } = values;
          const updateValues = {
            publicData: {
              dimensions:{width: width, height: height, length: length}
            },
          };
          onSubmit(updateValues);
        }}

        onChange={onChange}
        saveActionMsg={submitButtonText}
        updated={panelUpdated}
        updateError={errors.updateListingError}
        updateInProgress={updateInProgress}
        widthOptions={widthOptions}
      />
    </div>
  );
};

const { func, object, string, bool } = PropTypes;

EditListingWidthPanel.defaultProps = {
  className: null,
  rootClassName: null,
  listing: null,
};

EditListingWidthPanel.propTypes = {
  className: string,
  rootClassName: string,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  onSubmit: func.isRequired,
  onChange: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  errors: object.isRequired,
};

export default EditListingWidthPanel;
