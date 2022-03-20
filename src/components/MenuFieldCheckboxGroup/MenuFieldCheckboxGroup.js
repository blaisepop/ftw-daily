/*
 * Renders a group of checkboxes that can be used to select
 * multiple values from a set of options.
 *
 * The corresponding component when rendering the selected
 * values is PropertyGroup.
 *
 */

import React from 'react';
import { arrayOf, node, shape, string } from 'prop-types';
import classNames from 'classnames';
import { MenuFieldCheckbox, ValidationError } from '../../components';

import css from './MenuFieldCheckboxGroup.module.css';

const MenuFieldCheckboxComponent = props => {
  const { className, rootClassName, label, id, fields, options, meta } = props;

  const classes = classNames(rootClassName || css.root, className);
  const listClasses = css.list;

  return (
    <div className={classes}>
      {label ? <legend>{label}</legend> : null}
      <div className={css.scroll}>
      <ul className={listClasses}>
        {options.map((option, index) => {
          const fieldId = `${id}.${option.key}`;
          return (
            <li key={fieldId} className={css.item}>
            
              <MenuFieldCheckbox
                id={fieldId}
                name={fieldId}
                label={option.label}
                value={option.key}
                price={option.item_price}
                description={option.description}
                defaultValue="0"
                
              />
               
            </li>
          );
        })}
      </ul>
      </div>
      
      <ValidationError fieldMeta={{ ...meta }} />
    </div>
  );
};

MenuFieldCheckboxComponent.defaultProps = {
  rootClassName: null,
  className: null,
  label: null,
 
};

MenuFieldCheckboxComponent.propTypes = {
  rootClassName: string,
  className: string,
  id: string.isRequired,
  label: node,
  options: arrayOf(
    shape({
      key: string.isRequired,
      label: node.isRequired,
    })
  ).isRequired,
   name: string.isRequired,
};  


// Name and component are required fields for FieldArray.
// Component-prop we define in this file, name needs to be passed in

export default MenuFieldCheckboxComponent;
