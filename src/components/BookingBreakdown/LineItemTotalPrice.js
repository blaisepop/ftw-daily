import React from 'react';
import { bool } from 'prop-types';
import { FormattedMessage, intlShape } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { txIsCanceled, txIsDelivered, txIsDeclined } from '../../util/transaction';
import { propTypes } from '../../util/types';
const _ = require('lodash');

import css from './BookingBreakdown.module.css';
import config from '../../config';

const LineItemUnitPrice = props => {
  const { transaction, isProvider, intl } = props;

  let providerTotalMessageId = 'BookingBreakdown.providerTotalDefault';
  if (txIsDelivered(transaction)) {
    providerTotalMessageId = 'BookingBreakdown.providerTotalDelivered';
  } else if (txIsDeclined(transaction)) {
    providerTotalMessageId = 'BookingBreakdown.providerTotalDeclined';
  } else if (txIsCanceled(transaction)) {
    providerTotalMessageId = 'BookingBreakdown.providerTotalCanceled';
  }

  const totalLabel = isProvider ? (
    <FormattedMessage id={providerTotalMessageId} />
  ) : (
    <FormattedMessage id="BookingBreakdown.total" />
  );
  
   
    const firstPaymentLabel=<FormattedMessage id="BookingBreakdown.totalFirstPayment" />;
  

    const secondPaymentLabel=<FormattedMessage id="BookingBreakdown.totalSecondPayment" />;

  const totalPrice = isProvider
    ? transaction.attributes.payoutTotal
    : transaction.attributes.payinTotal;
  
  let firstPaymentPrice=_.cloneDeep(totalPrice);
  let secondPaymentPrice=_.cloneDeep(totalPrice);
  firstPaymentPrice.amount*=config.mfCommission;
  secondPaymentPrice.amount*=1-config.mfCommission;

  const formattedTotalPrice = formatMoney(intl, totalPrice);
  const formattedFirstPaymentPrice= formatMoney(intl, firstPaymentPrice);
  const formattedsecondPaymentPrice= formatMoney(intl, secondPaymentPrice);


  return (
    <>
      <hr className={css.totalDivider} />
      <div className={css.lineItemTotal}>
        <div className={css.totalLabel}>{totalLabel}</div>
        <div className={css.totalPrice}>{formattedTotalPrice}</div>
      </div>
      <div className={css.lineItemTotal}>
        <div className={css.totalLabel}>{firstPaymentLabel}</div>
        <div className={css.itemValue}>{formattedFirstPaymentPrice}</div>
      </div>
      <div className={css.lineItemTotal}>
        <div className={css.totalLabel}>{secondPaymentLabel}</div>
        <div className={css.itemValue}>{formattedsecondPaymentPrice}</div>
      </div>
    </>
  );
};

LineItemUnitPrice.propTypes = {
  transaction: propTypes.transaction.isRequired,
  isProvider: bool.isRequired,
  intl: intlShape.isRequired,
};

export default LineItemUnitPrice;
