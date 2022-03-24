import React, { Component } from 'react';
import { node, string } from 'prop-types';
import classNames from 'classnames';
import { Field } from 'react-final-form';
import { MenuFieldTextInput, SecondaryButton } from '../../components';
import css from './MenuFieldCheckbox.module.css';




class MenuFieldCheckboxComponent extends Component {
  constructor(props) {
    super(props);
   // this.state = { value: 6 };
    this.increment = this.increment.bind(this);
    this.decrement = this.decrement.bind(this);

  }
  increment() { //this function increment value
    document.getElementById(this.props.id).stepUp();
    //this.setState({value: 2});
  }
  decrement() { //this function add a number to value
    document.getElementById(this.props.id).stepDown();
    //this.setState({value: 2});
  }
  render() {
   
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

    // This is a workaround for a bug in Firefox & React Final Form.
    // https://github.com/final-form/react-final-form/issues/134




    // inputProps.value=this.state.value.toString();
    //console.log(input);

    return (
      <div className={classes}>

        <label htmlFor={id} className={css.label}>

          <div className={classNames(css.descriptionRoot)}>
            <span className={classNames(css.text, textClassName || css.textRoot)}>{label}  <span>({price} CHF)</span> </span>
            <span className={classNames(css.description)}> {description} </span>
          </div>

        </label>
        <div className={css.stepper}>
          <button type="button"  onClick={() => this.decrement()} className={css.stepperButton}>-</button>
          
          {<input className={css.input} type="number"
            id={this.props.id}         
           {...input}
           />}
          <button  type="button" onClick={()=>this.increment()} className={css.stepperButton}>+</button>
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
    //console.log("ici");
    return <Field component={MenuFieldCheckboxComponent} {...this.props} />;
  }
}

export default MenuFieldCheckbox;

