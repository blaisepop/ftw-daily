import React from 'react';
import { useState } from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { PrimaryButton, SecondaryButton } from '../../components';
import css from './TransactionPanel.module.css';
import axios from 'axios';
// Functional component as a helper to build ActionButtons for
// provider when state is preauthorized
const SaleActionButtonsMaybe = props => {
  const {
    className,
    rootClassName,
    showButtons,
    acceptInProgress,
    declineInProgress,
    acceptSaleError,
    declineSaleError,
    onAcceptSale,
    onDeclineSale,
    booking,
    transactionId
  } = props;


  const [captureInProgress, setCaptureInProgress] = useState(false);


  function handleAccept() {
    setCaptureInProgress(true)
    const config = {
      headers: {
        'X-User-Token': "t-wCWAyLtsToftoF9Rrq",
        'X-User-Email': "26.mariusremy@gmail.com"
      }
    }
    const data={
      "marketplace_transaction_id":transactionId.uuid
    }
    axios.post("http://localhost:5000/api/v1/confirmPayment",
      data
      , config)
      .then(()=>{
        onAcceptSale(transactionId);
      })
      .catch(() => {
       // this.setState({ submitting: false });
       setCaptureInProgress(false)
        return;
      });
    
   
  }
  const buttonsDisabled = acceptInProgress || declineInProgress || captureInProgress;

  const acceptErrorMessage = acceptSaleError ? (
    <p className={css.actionError}>
      <FormattedMessage id="TransactionPanel.acceptSaleFailed" />
    </p>
  ) : null;
  const declineErrorMessage = declineSaleError ? (
    <p className={css.actionError}>
      <FormattedMessage id="TransactionPanel.declineSaleFailed" />
    </p>
  ) : null;

  const classes = classNames(rootClassName || css.actionButtons, className);

  return showButtons ? (
    <div className={classes}>
      <div className={css.actionErrors}>
        {acceptErrorMessage}
        {declineErrorMessage}
      </div>
      <div className={css.actionButtonWrapper}>
        <SecondaryButton
          inProgress={declineInProgress}
          disabled={buttonsDisabled}
          onClick={()=>onDeclineSale(transactionId)}
        >
          <FormattedMessage id="TransactionPanel.declineButton" />
        </SecondaryButton>
        <PrimaryButton
          inProgress={acceptInProgress||captureInProgress}
          disabled={buttonsDisabled}
          onClick={handleAccept}
        >
          <FormattedMessage id="TransactionPanel.acceptButton" />
        </PrimaryButton>
      </div>
    </div>
  ) : null;
};

export default SaleActionButtonsMaybe;
