import React from 'react';
import { array, shape, string } from 'prop-types';
import { FormattedMessage } from 'react-intl';

import css from './ListingPage.module.css';

const  SectionDimensions = props => {
    const { publicData} = props;
 
    //const dimensions = publicData.dimensions;

    
    return publicData && publicData.dimensions ? (
        <div className={css.sectionDimensions}>
            <h2 className={css.dimensionsTitle}>
                <FormattedMessage id="ListingPage.dimensionsTitle" />
            </h2>
            <div className={css.dimensionsContainer}>
                <div>
                    <FormattedMessage id="ListingPage.dimensions.lengthTitle" />
                    <FormattedMessage id="ListingPage.dimensions.heightTitle" />
                    <FormattedMessage id="ListingPage.dimensions.lengthTitle" />
                </div>
                <div >
                    <span className={css.dimension}> {publicData.dimensions.width + " cm"}</span>
                    <span className={css.dimension}>{publicData.dimensions.height + " cm"}</span>
                    <span className={css.capadimensioncity}> {publicData.dimensions.length + " cm"}</span>
                </div>
            </div>


        </div>
    ) : null;
};

SectionDimensions.propTypes = {
    options: array.isRequired,
    publicData: shape({
        capacity: string,
    }).isRequired,
};

export default SectionDimensions;