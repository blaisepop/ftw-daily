import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { lazyLoadWithDimensions } from '../../util/contextHelpers';

import { NamedLink } from '../../components';

import css from './SectionLocations.module.css';

import genevaImage from './images/geneva.jpg';
import lausanneImage from './images/lausanne.jpg';
import zurichImage from './images/zurich.jpg';

class LocationImage extends Component {
  render() {
    const { alt, ...rest } = this.props;
    return <img alt={alt} {...rest} />;
  }
}
const LazyImage = lazyLoadWithDimensions(LocationImage);
const trans='fr'
const locationLink = (name, image, searchQuery) => {
  const nameText = <span className={css.locationName}>{name}</span>;
  return (
    <NamedLink name="SearchPage" to={{ search: searchQuery }} className={css.location} >
      <div className={css.imageWrapper}>
        <div className={css.aspectWrapper}>
          <LazyImage src={image} alt={name} className={css.locationImage} />
        </div>
      </div>
      <div className={css.linkText}>
        <FormattedMessage
          id="SectionLocations.listingsInLocation"
          values={{ location: nameText }}
        />
      </div>
    </NamedLink>
  );
};

const SectionLocations = props => {
  const { rootClassName, className } = props;

  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <div className={css.title}>
        <FormattedMessage id="SectionLocations.title" />
      </div>
      <div className={css.locations}>
        {locationLink(
          'Genève',
          genevaImage,
          '?address=Genève%2C%20canton%20de%20Genève%2C%20Suisse&bounds=46.250648%2C6.17583%2C46.177774%2C6.086979'
        )}
        {locationLink(
          'Lausanne',
          lausanneImage,
          '?address=Lausanne%2C%20canton%20de%20Vaud%2C%20Suisse&bounds=46.591708%2C6.720815%2C46.504313%2C6.560625'
        )}
        {locationLink(
          'Zurich',
          zurichImage,
          '?address=Zurich%2C%20canton%20de%20Zurich%2C%20Suisse&bounds=47.434662%2C8.625334%2C47.320258%2C8.447982'
        )}
      </div>
    </div>
  );
};

SectionLocations.defaultProps = { rootClassName: null, className: null };

const { string } = PropTypes;

SectionLocations.propTypes = {
  rootClassName: string,
  className: string,
};

export default SectionLocations;
