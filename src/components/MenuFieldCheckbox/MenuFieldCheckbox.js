import React, { Component } from 'react';
import { node, string } from 'prop-types';
import classNames from 'classnames';
import { Field } from 'react-final-form';
import { MenuFieldTextInput, SecondaryButton } from '../../components';
import css from './MenuFieldCheckbox.module.css';




class MenuFieldCheckboxComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { value: 0 };
    this.increment = this.increment.bind(this);
    this.decrement = this.decrement.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);

  }
  onChange = (e, input) => {
    this.setState({ value: e.target.value });
    const { onBlur, onChange } = input;
    onChange(e);
    onBlur(e);
  }
  handleOnChange(input, event) {

  };
  increment(input) { //this function increment value
    const { value } = this.state;
    const nextValue = Number(value) + 1;
    const changeEvent = {
      target: {
        value: nextValue
      }
    };
    this.onChange(changeEvent, input);
  }
  decrement(input) { //this function a a number to value
    const { value } = this.state;
    const nextValue = Number(value) - 1;
    const changeEvent = {
      target: {
        value: nextValue
      }
    };
    this.onChange(changeEvent, input);
  }
  render() {
    const { value } = this.state;
    var {
      rootClassName,
      className,
      svgClassName,
      textClassName,
      descClassName,
      id,
      label,
      input,
      useSuccessColor,
      price,
      description,
      ...rest
    } = this.props;

    if (label && !id) {
      throw new Error('id required when a label is given');
    }
    const classes = classNames(rootClassName || css.root, className);


    return (
      <div className={classes}>

        <label htmlFor={id} className={css.label}>

          <div className={classNames(css.descriptionRoot)}>
            <span className={classNames(css.text, textClassName || css.textRoot)}>{label}  <span>({price} CHF)</span> </span>
            <span className={classNames(css.description)}> {description} </span>
          </div>

        </label>
        <div className={css.stepper}>
          <button type="button" onClick={() => this.decrement(input)} className={css.stepperButton}>-</button>
    
          <input
            
            className={css.input}
            type="number"
            id={this.props.id}

            {...input}

            value={value}
            onChange={event=>this.onChange(event, input)}
            

          ></input>
            <button type="button" onClick={() => this.increment(input)} className={css.stepperButton}>+</button>
        </div>

      </div>
    );
  }

};

MenuFieldCheckboxComponent.defaultProps = {
  className: null,
  rootClassName: null,
  svgClassName: null,
  textClassName: null,
  label: null,
};

MenuFieldCheckboxComponent.propTypes = {
  className: string,
  rootClassName: string,
  svgClassName: string,
  textClassName: string,

  // Id is needed to connect the label with input.
  id: string.isRequired,
  label: node,



  // Checkbox needs a value that is passed forward when user checks the checkbox
  value: string.isRequired,
};
class MenuFieldCheckbox extends Component {
  componentWillUnmount() {
    // Unmounting happens too late if it is done inside Field component
    // (Then Form has already registered its (new) fields and
    // changing the value without corresponding field is prohibited in Final Form
    if (this.props.onUnmount) {
      this.props.onUnmount();
    }
  }

  render() {

    return <Field component={MenuFieldCheckboxComponent} {...this.props} />;
  }
}

export default MenuFieldCheckbox;

