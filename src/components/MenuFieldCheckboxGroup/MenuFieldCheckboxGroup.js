/*
 * Renders a group of MenuFieldCheckBox that can be used to select
 * multiple values .
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
  const  listClasses= css.list;
  console.log(options)

  return (
    <div className={classes}>
      {label ? <legend className={css.title}>{label}</legend> : null}
      <div className={css.scroll}>
        <ul className={listClasses}>
          {Object.keys(options).map((key) => {
              

            return (
              <li className={css.typeItem}>
                <h3 className={css.title}>{key}</h3>
              <ul className={listClasses}>
                {

                  options[key].map((option) => {

                    const price = option.item_price == null ? "0.0" : option.item_price

                    const key = option.name + "-" + option.id + "-" + price * 100
                    const menu = {
                      key: key,
                      description: option.description,
                      label: option.name,
                      item_price: price,
                    };
                    const fieldId = `${id}.${menu.key}`;
                    return (

                      <li key={fieldId} className={css.item}>

                        <MenuFieldCheckbox
                          id={fieldId}
                          name={fieldId}
                          label={menu.label}
                          value={menu.key}
                          price={menu.item_price}
                          description={menu.description}
                          defaultValue="0"


                        />

                      </li>

                    );
                  })}
              </ul>
              </li>
            );
          }
          )
          }
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
