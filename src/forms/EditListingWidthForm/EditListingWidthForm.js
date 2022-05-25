import React from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

// These relative imports need to point to correct directories
import {
  intlShape,
  injectIntl,
  FormattedMessage,
} from '../../util/reactIntl';
import { propTypes } from '../../util/types';

import { Form, Button, FieldTextInput } from '../../components';

// Create this file using EditListingFeaturesForm.module.css
// as a template.
import css from './EditListingWidthForm.module.css';

export const EditListingWidthFormComponent = props => (
  <FinalForm
    {...props}
    render={formRenderProps => {
      const {
        className,
        disabled,
        handleSubmit,
        intl,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateError,
        updateInProgress,
       
      } = formRenderProps;

      const widthPlaceholderMessage = intl.formatMessage({
        id: 'EditListingWidthForm.widthPlaceholder',
      });
      const heightPlaceholderMessage = intl.formatMessage({
        id: 'EditListingWidthForm.heightPlaceholder',
      });
      const lengthPlaceholderMessage = intl.formatMessage({
        id: 'EditListingWidthForm.lengthPlaceholder',
      });


      const widthLabelMessage = intl.formatMessage({
        id: 'EditListingWidthForm.widthLabel',
      });
      const heightLabelMessage = intl.formatMessage({
        id: 'EditListingWidthForm.heightLabel',
      });
      const lengthLabelMessage = intl.formatMessage({
        id: 'EditListingWidthForm.lengthLabel',
      });
      const errorMessage = updateError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingWidthForm.updateFailed" />
        </p>
      ) : null;

      

      const classes = classNames(css.root, className);
      const submitReady = updated && pristine;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessage}
 
          <FieldTextInput
            id="width"
            name="width"
            className={css.textField}
            type="text"
            label={widthLabelMessage}
            placeholder={widthPlaceholderMessage}
          />
          <FieldTextInput
            id="height"
            name="height"
            className={css.textField}
            type="text"
            label={heightLabelMessage}
            placeholder={heightPlaceholderMessage}
          />
          <FieldTextInput
            id="length"
            name="length"
            className={css.textField}
            type="text"
            label={lengthLabelMessage}
            placeholder={lengthPlaceholderMessage}
          />


          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

EditListingWidthFormComponent.defaultProps = {
  selectedPlace: null,
  updateError: null,
};

EditListingWidthFormComponent.propTypes = {
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  updated: bool.isRequired,
  updateError: propTypes.error,
  updateInProgress: bool.isRequired,
  widthOptions: arrayOf(
    shape({
      key: string.isRequired,
      label: string.isRequired,
    })
  ).isRequired,
};

export default compose(injectIntl)(EditListingWidthFormComponent);
