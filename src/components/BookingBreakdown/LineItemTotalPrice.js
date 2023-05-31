import React, {useState} from 'react';
import {bool, func} from 'prop-types';
import { FormattedMessage, intlShape } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { txIsCanceled, txIsDelivered, txIsDeclined } from '../../util/transaction';
import { propTypes } from '../../util/types';
const _ = require('lodash');

import css from './BookingBreakdown.module.css';
import config from '../../config';
import Button from "../Button/Button";
import {Modal} from "../../components";
const LineItemUnitPrice = props => {
  const { transaction, isProvider, intl ,onManageDisableScrolling} = props;
  const [showModal,  setShowModal]=useState(false)
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
  const buttonInfo= <a onClick={()=>setShowModal(true)} className={css.infoButton}>?</a>

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
  const modalInfo=<Modal
    id="lineItem.infosPayment"
    contentClassName={css.infosModalContent}
    isOpen={showModal}
    onClose={() => {
      setShowModal(false);
    }}
    onManageDisableScrolling={onManageDisableScrolling}
  >
    <div style={{ margin: '1rem' }}>
      <h2>
        <FormattedMessage id="CheckoutPage.modalInfosPaymentsTitle"  />
      </h2>
      <p>
        <FormattedMessage id="CheckoutPage.modalInfosPaymentsPart1"  />
      </p>
      <p>
        <FormattedMessage id="CheckoutPage.modalInfosPaymentsPart2"  />
      </p>

    </div>
  </Modal>
  return (
    <>
      <hr className={css.totalDivider} />
      <div className={css.lineItemTotal}>
        <div className={css.totalLabel}>{totalLabel}{buttonInfo}</div>

        <div className={css.totalPrice}>{formattedTotalPrice}</div>
      </div>
      <div className={css.lineItemTotal}>
        <div className={css.totalLabel}>{firstPaymentLabel}

        </div>

        <div className={css.itemValue}>{formattedFirstPaymentPrice}</div>
      </div>
      <div className={css.lineItemTotal}>
        <div className={css.totalLabel}>{secondPaymentLabel}</div>
        <div className={css.itemValue}>{formattedsecondPaymentPrice}</div>
      </div>
      {modalInfo}
    </>
  );
};

LineItemUnitPrice.propTypes = {
  onManageDisableScrolling: func.isRequired,
  transaction: propTypes.transaction.isRequired,
  isProvider: bool.isRequired,
  intl: intlShape.isRequired,
};


export default LineItemUnitPrice;
