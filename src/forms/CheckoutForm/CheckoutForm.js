import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import css from './CheckoutForm.module.css';
import { FormattedMessage } from '../../util/reactIntl';

import {PrimaryButton} from '../../components';
import axios from "axios";
export default function CheckoutForm(props) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [speculateTransactionError, setError]=useState(false)

  const speculateTransactionErrorMessage = speculateTransactionError ? (
    <p className={css.speculateError}>
      <FormattedMessage id="CheckoutForm.ConfirmPaymentError" />
    </p>
  ) : null;
  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("EEEE", elements.getElement('payment'));
    setIsLoading(true);

    const config = {
      headers: {
        'X-User-Token':process.env.REACT_APP_CRM_USER_TOKEN,
        //'X-User-Token': " t-wCWAyLtsToftoF9Rrq",
        'X-User-Email': "26.mariusremy@gmail.com"
      }
    }

    console.log("number", props.amount);
    var data={
      "amount": props.amount,
      "payment_id":props.paymentIntentID
    }
    axios.post(process.env.REACT_APP_CRM_LINK+"updatePaymentAmount" ,
      data
      ,config)
      .then(async ()=>{
        console.log("ELEMENTS",elements)
        const { error } = await stripe.confirmPayment({

          elements,
          confirmParams: {
            // Make sure to change this to your payment completion page
            return_url: "https://marketplace.mobile-food.ch/",
          },
          redirect: 'if_required'
        });
        if(error){
          if (error.type === "card_error" || error.type === "validation_error") {
            setError(true);
          } else {
            setError(true);
          }
          setIsLoading(false);
        }
        else {

          setIsLoading(false);

          props.handleFunction();
              setError(true)
              setIsLoading(false)
      }})
      .catch((error) => {
        setError(true)
        setIsLoading(false);
      })
    ;

  };

  const paymentElementOptions = {
    layout: "tabs"
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit} className={css.root}>
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      {/*<button disabled={isLoading || !stripe || !elements} id="submit">
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
        </span>
  </button>*/}
      {speculateTransactionErrorMessage}
      <PrimaryButton
        className={css.submitButton}
        type="submit"
        inProgress={isLoading }
      >
        <FormattedMessage
          id="CheckoutForm.submitButton"
        />
      </PrimaryButton>
      {/* Show any error or success messages */}

    </form>
  );
}
