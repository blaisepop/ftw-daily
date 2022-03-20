import React, { Component } from 'react';
import { bool, func, object, shape, string } from 'prop-types';
import { Field } from 'react-final-form';
import classNames from 'classnames';
import { ValidationError, ExpandingTextarea, SecondaryButton } from '../../components';

import css from './MenuFieldTextInput.module.css';

const CONTENT_MAX_LENGTH = 5000;

class MenuFieldTextInputComponent extends Component {
  
  render() {
   
    
    /* eslint-disable no-unused-vars */
    const {
      rootClassName,
      className,
      inputRootClass,
      customErrorText,
      id,
      label,
      input,
      meta,
      onUnmount,
      isUncontrolled,
      inputRef,
      ...rest
    } = this.props;
    /* eslint-enable no-unused-vars */

    if (label && !id) {
      throw new Error('id required when a label is given');
    }
    console.log(input);
    const { valid, invalid, touched, error } = meta;
    const isTextarea = input.type === 'textarea';

    const errorText = customErrorText || error;

    // Error message and input error styles are only shown if the
    // field has been touched and the validation has failed.
    const hasError = !!customErrorText || !!(touched && invalid && error);

    const fieldMeta = { touched: hasError, error: errorText };

    // Textarea doesn't need type.
    
    // Uncontrolled input uses defaultValue instead of value.
    
    // Use inputRef if it is passed as prop.
    const refMaybe = inputRef ? { ref: inputRef } : {};

    const inputClasses =
      inputRootClass ||
      classNames(css.input, {
        [css.inputSuccess]: valid,
        [css.inputError]: hasError,
        [css.textarea]: isTextarea,
      });
    const maxLength = CONTENT_MAX_LENGTH;
    const inputProps = isTextarea
      ? {
          className: inputClasses,
          id,
          rows: 1,
          maxLength,
          ...refMaybe,
          ...inputWithoutType,
          ...rest,
        }
      : isUncontrolled
      ? {
          className: inputClasses,
          id,
          type,

        }
      : { className: inputClasses, id, ...refMaybe, ...input, ...rest };

    const classes = classNames(rootClassName || css.root, className);
    
    return (
      <div className={classes}>
        
        {label ? <label htmlFor={id}>{label}</label> : null}
       
     <input  {...inputProps} />
        
        
        <ValidationError fieldMeta={fieldMeta} />

      </div>
    );
  }
}

MenuFieldTextInputComponent.defaultProps = {
  rootClassName: null,
  className: null,
  inputRootClass: null,
  onUnmount: null,
  customErrorText: null,
  id: null,
  label: null,
  isUncontrolled: false,
  inputRef: null,
};

MenuFieldTextInputComponent.propTypes = {
  rootClassName: string,
  className: string,
  inputRootClass: string,

  onUnmount: func,

  // Error message that can be manually passed to input field,
  // overrides default validation message
  customErrorText: string,

  // Label is optional, but if it is given, an id is also required so
  // the label can reference the input in the `for` attribute
  id: string,
  label: string,

  // Uncontrolled input uses defaultValue prop, but doesn't pass value from form to the field.
  // https://reactjs.org/docs/uncontrolled-components.html#default-values
  isUncontrolled: bool,
  // a ref object passed for input element.
  inputRef: object,

  // Generated by final-form's Field component
  input: shape({
    onChange: func.isRequired,
    // Either 'textarea' or something that is passed to the input element
    type: string.isRequired,
  }).isRequired,
  meta: object.isRequired,
};

class MenuFieldTextInput extends Component {
  componentWillUnmount() {
    // Unmounting happens too late if it is done inside Field component
    // (Then Form has already registered its (new) fields and
    // changing the value without corresponding field is prohibited in Final Form
    if (this.props.onUnmount) {
      this.props.onUnmount();
    }
  }

  render() {
    return <Field component={MenuFieldTextInputComponent} {...this.props} />;
  }
}

export default MenuFieldTextInput;
