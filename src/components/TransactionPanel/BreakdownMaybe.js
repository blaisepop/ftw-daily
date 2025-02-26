import React from 'react';
import classNames from 'classnames';
import config from '../../config';
import { DATE_TYPE_DATETIME } from '../../util/types';
import { ensureListing } from '../../util/data';
import { BookingBreakdown } from '../../components';

import css from './TransactionPanel.module.css';
import {func} from "prop-types";
import {BookingBreakdownComponent} from "../BookingBreakdown/BookingBreakdown";

// Functional component as a helper to build BookingBreakdown
const BreakdownMaybe = props => {
  const { className, rootClassName, breakdownClassName, transaction, transactionRole,onManageDisableScrolling } = props;
  const loaded = transaction && transaction.id && transaction.booking && transaction.booking.id;
  const listingAttributes = ensureListing(transaction.listing).attributes;
  const timeZone =
    loaded && listingAttributes.availabilityPlan
      ? listingAttributes.availabilityPlan.timezone
      : 'Etc/UTC';

  const classes = classNames(rootClassName || css.breakdownMaybe, className);
  const breakdownClasses = classNames(breakdownClassName || css.breakdown);

  return loaded ? (
    <div className={classes}>
      <BookingBreakdown
        className={breakdownClasses}
        userRole={transactionRole}
        unitType={config.bookingUnitType}
        transaction={transaction}
        booking={transaction.booking}
        dateType={DATE_TYPE_DATETIME}
        timeZone={timeZone}
        onManageDisableScrolling={onManageDisableScrolling}
      />
    </div>
  ) : null;
};
BreakdownMaybe.propTypes = {
  onManageDisableScrolling: func.isRequired
}
export default BreakdownMaybe;
