import React, {useEffect, useState} from 'react';
import { array, arrayOf, bool, func, object, oneOf, shape, string, number } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import {
  createResourceLocatorString,
  findRouteByRouteName,
  pathByRouteName
} from '../../util/routes';
import routeConfiguration from '../../routeConfiguration';
import {DATE_TYPE_DATETIME, propTypes} from '../../util/types';
import {ensureBooking, ensureListing, ensureTransaction, ensureUser} from '../../util/data';
import { timestampToDate, calculateQuantityFromHours } from '../../util/dates';
import { createSlug } from '../../util/urlHelpers';
import { txIsPaymentPending } from '../../util/transaction';
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { isScrollingDisabled, manageDisableScrolling } from '../../ducks/UI.duck';
import { initializeCardPaymentData } from '../../ducks/stripe.duck.js';
import { CheckoutForm } from '../../forms';
import {
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  NamedRedirect,
  TransactionPanel,
  Page,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer, ResponsiveImage, AvatarMedium, BookingBreakdown, Form, FieldTextInput, PrimaryButton,
} from '../../components';
import { TopbarContainer } from '../../containers';

import {
  acceptSale,
  declineSale,
  sendMessage,
  sendReview,
  fetchMoreMessages,
  fetchTimeSlots,
  fetchTransactionLineItems, firstPayment,
} from './PaymentPage.duck';
import css from './PaymentPage.module.css';
import axios from 'axios';
import config from "../../config";
import {Form as FinalForm, FormSpy} from "react-final-form";


const PROVIDER = 'provider';
const CUSTOMER = 'customer';
const stripeKey = config.stripe.publishableKey;
// console.log("key", stripeKey);
const stripePromise = loadStripe(stripeKey);
// PaymentPage handles data loading for Sale and Order views to transaction pages in Inbox.
export const TransactionPageComponent = props => {
  const {
    currentUser,
    initialMessageFailedToTransaction,
    savePaymentMethodFailed,
    fetchMessagesError,
    fetchMessagesInProgress,
    totalMessagePages,
    oldestMessagePageFetched,
    fetchTransactionError,
    history,
    intl,
    messages,
    onFetchTimeSlots,
    onManageDisableScrolling,
    onSendMessage,
    onSendReview,
    onShowMoreMessages,
    params,
    scrollingDisabled,
    sendMessageError,
    sendMessageInProgress,
    sendReviewError,
    sendReviewInProgress,
    transaction,
    transactionRole,
    acceptInProgress,
    acceptSaleError,
    declineInProgress,
    declineSaleError,
    onAcceptSale,
    onDeclineSale,
    monthlyTimeSlots,
    processTransitions,
    callSetInitialValues,
    onInitializeCardPaymentData,
    onFetchTransactionLineItems,
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    onFirstPayment,
  } = props;
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentID, setPaymentIntentID] = useState(null);
  // const [partnerNumber, setPartnerNumber]=useState(null)
  let isDataAvailable=false;
  useEffect(()=>{


    if(isDataAvailable&&!clientSecret&&!paymentIntentID
      &&currentListing
      &&currentListing.attributes
      &&currentListing.attributes.publicData
      &&currentListing.attributes.publicData.partnerNumber){

      console.log("aaaaa",currentListing);
      const conf = {
        headers: {
          'X-User-Token': "HExzbkejGSjXMXKu-HiT",
   //       'X-User-Token': " t-wCWAyLtsToftoF9Rrq",
          'X-User-Email': "26.mariusremy@gmail.com"
        }
      }

      console.log(currentListing);
      const data = {
        partner_number: currentListing.attributes.publicData.partnerNumber
      }
      axios.post("https://mobile-food-ch.herokuapp.com/api/v1/paymentIntent",
      //axios.post("http://localhost:5000/api/v1/paymentIntent",
        data
        , conf)
        .then((res) => res.data)
        .then((data) =>
          data.payment_intent
        )
        .then((payment_intent) => {
          console.log("aaaa", payment_intent);
          setClientSecret(payment_intent.client_secret )
          setPaymentIntentID(payment_intent.id)
        });
    }


  })
  const routes = routeConfiguration();
  function handleFirstPayment(){
    console.log("transaction",currentTransaction);
    onFirstPayment(currentTransaction.id.uuid)

    const orderDetailsPath = pathByRouteName('OrderDetailsPage', routes, {
      id: currentTransaction.id.uuid,
    });

    history.push(orderDetailsPath);
  }
  function handleSubmit(values){

  }
  const appearance = {
    theme: 'stripe',
  };

  const options = {
    clientSecret,
    appearance,
  };
  const currentTransaction = ensureTransaction(transaction);
  //console.log(transaction);
  const currentListing = ensureListing(currentTransaction.listing);
  const isProviderRole = transactionRole === PROVIDER;
  const isCustomerRole = transactionRole === CUSTOMER;




  const redirectToCheckoutPageWithInitialValues = (initialValues, listing) => {
    const routes = routeConfiguration();
    // Customize checkout page state with current listing and selected bookingDates
    const { setInitialValues } = findRouteByRouteName('CheckoutPage', routes);
    callSetInitialValues(setInitialValues, initialValues);

    // Clear previous Stripe errors from store if there is any
    onInitializeCardPaymentData();

    // Redirect to CheckoutPage
    history.push(
      createResourceLocatorString(
        'CheckoutPage',
        routes,
        { id: currentListing.id.uuid, slug: createSlug(currentListing.attributes.title) },
        {}
      )
    );
  };

  // If payment is pending, redirect to CheckoutPage
  if (
    txIsPaymentPending(currentTransaction) &&
    isCustomerRole &&
    currentTransaction.attributes.lineItems
  ) {
    const currentBooking = ensureListing(currentTransaction.booking);

    const initialValues = {
      listing: currentListing,
      // Transaction with payment pending should be passed to CheckoutPage
      transaction: currentTransaction,
      // Original bookingData content is not available,
      // but it is already used since booking is created.
      // (E.g. quantity is used when booking is created.)
      bookingData: {},
      bookingDates: {
        bookingStart: currentBooking.attributes.start,
        bookingEnd: currentBooking.attributes.end,
      },
    };

    redirectToCheckoutPageWithInitialValues(initialValues, currentListing);
  }

  // Customer can create a booking, if the tx is in "enquiry" state.
  const handleSubmitBookingRequest = values => {
    const { bookingStartTime, bookingEndTime, ...restOfValues } = values;
    const bookingStart = timestampToDate(bookingStartTime);
    const bookingEnd = timestampToDate(bookingEndTime);

    const bookingData = {
      quantity: calculateQuantityFromHours(bookingStart, bookingEnd),
      ...restOfValues,
    };

    const initialValues = {
      listing: currentListing,
      // enquired transaction should be passed to CheckoutPage
      transaction: currentTransaction,
      bookingData,
      bookingDates: {
        bookingStart,
        bookingEnd,
      },
      confirmPaymentError: null,
    };

    redirectToCheckoutPageWithInitialValues(initialValues, currentListing);
  };

  const deletedListingTitle = intl.formatMessage({
    id: 'PaymentPage.deletedListing',
  });
  const listingTitle = currentListing.attributes.deleted
    ? deletedListingTitle
    : currentListing.attributes.title;

  // Redirect users with someone else's direct link to their own inbox/sales or inbox/orders page.
  isDataAvailable =
    currentUser &&
    currentTransaction.id &&
    currentTransaction.id.uuid === params.id &&
    currentTransaction.attributes.lineItems &&
    currentTransaction.customer &&
    currentTransaction.provider &&
    !fetchTransactionError;

  const isOwnSale =
    isDataAvailable &&
    isProviderRole &&
    currentUser.id.uuid === currentTransaction.provider.id.uuid;
  const isOwnOrder =
    isDataAvailable &&
    isCustomerRole &&
    currentUser.id.uuid === currentTransaction.customer.id.uuid;

  if (isDataAvailable && isProviderRole && !isOwnSale) {
    // eslint-disable-next-line no-console
    console.error('Tried to access a sale that was not owned by the current user');
    return <NamedRedirect name="InboxPage" params={{ tab: 'sales' }} />;
  } else if (isDataAvailable && isCustomerRole && !isOwnOrder) {
    // eslint-disable-next-line no-console
    console.error('Tried to access an order that was not owned by the current user');
    return <NamedRedirect name="InboxPage" params={{ tab: 'orders' }} />;
  }

  const detailsClassName = classNames(css.tabContent, css.tabContentVisible);

  const fetchErrorMessage = isCustomerRole
    ? 'PaymentPage.fetchOrderFailed'
    : 'PaymentPage.fetchSaleFailed';
  const loadingMessage = isCustomerRole
    ? 'PaymentPage.loadingOrderData'
    : 'PaymentPage.loadingSaleData';

  const loadingOrFailedFetching = fetchTransactionError ? (
    <p className={css.error}>
      <FormattedMessage id={`${fetchErrorMessage}`} />
    </p>
  ) : (
    <p className={css.loading}>
      <FormattedMessage id={`${loadingMessage}`} />
    </p>
  );

  const initialMessageFailed = !!(
    initialMessageFailedToTransaction &&
    currentTransaction.id &&
    initialMessageFailedToTransaction.uuid === currentTransaction.id.uuid
  );
  /*const speculateTransactionErrorMessage = speculateTransactionError ? (
    <p className={css.speculateError}>
      <FormattedMessage id="CheckoutPage.speculateTransactionError" />
    </p>
  ) : null;*/
  // TransactionPanel is presentational component
  // that currently handles showing everything inside layout's main view area.
  const firstImage =
    currentListing.images && currentListing.images.length > 0
      ? currentListing.images[0]
      : null;
  const currentAuthor = ensureUser(currentListing.author);
  // Show breakdown only when speculated transaction and booking are loaded
  // (i.e. have an id)
  // console.log(currentTransaction)

  const tx = currentTransaction.booking  && isDataAvailable ? currentTransaction : null;
  const amount = tx && tx.attributes && tx.attributes.payinTotal ? tx.attributes.payinTotal.amount : 0;

  const txBooking = isDataAvailable ? ensureBooking(tx.booking):null;
  console.log(currentListing);
  const title = intl.formatMessage(
    { id: 'PaymentPage.title' },
    { listingTitle }
  );

  const timeZone =  currentListing.attributes.availabilityPlan
    ? currentListing.attributes.availabilityPlan.timezone
    : 'Etc/UTC';
  const breakdown =
    tx&&txBooking&&tx.id && txBooking.id ? (
      <BookingBreakdown
        className={css.bookingBreakdown}
        userRole="customer"
        unitType={config.bookingUnitType}
        transaction={tx}
        booking={txBooking}
        dateType={DATE_TYPE_DATETIME}
        timeZone={timeZone}
      />
    ) : null;

  const panel = isDataAvailable ? (
    <div className={css.detailsContainerDesktop}>
      <div className={css.detailsAspectWrapper}>
        <ResponsiveImage
          rootClassName={css.rootForImage}
          alt={listingTitle}
          image={firstImage}
          variants={['landscape-crop', 'landscape-crop2x']}
        />
      </div>
      <div className={css.avatarWrapper}>
        <AvatarMedium user={currentAuthor} disableProfileLink/>
      </div>
      <div className={css.detailsHeadings}>
        <h2 className={css.detailsTitle}>{listingTitle}</h2>
      </div>

      {/*speculateTransactionErrorMessage*/}

      {breakdown}
    </div>
  ) : (
    loadingOrFailedFetching
  );
  const bookingForm = clientSecret&&isDataAvailable?(
    <FinalForm
      onSubmit={values => handleSubmit(values)}
      render={fieldRenderProps => {
        const { handleSubmit } = fieldRenderProps;
        return (
          <Form onSubmit={handleSubmit} id="payment-form">

            <div className={css.submitContainer}>
              <h3 className={css.messageHeading}>
                <FormattedMessage id="StripePaymentForm.cardHeading" />
              </h3>

              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm
                  paymentIntentID={paymentIntentID}
                  amount={amount*config.mfCommission}
                  handleFunction={handleFirstPayment}
                  transaction={currentTransaction}
                />
              </Elements>
            </div>
            {/*registerErrorMessage*/}

          </Form>
        );
      }}
    />
  ):null;
  return (
    <Page
      title={intl.formatMessage({ id: 'PaymentPage.title' }, { title: listingTitle })}
      scrollingDisabled={scrollingDisabled}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer />
        </LayoutWrapperTopbar>

        <LayoutWrapperMain>
          <div className={css.contentContainer}>
            <div className={css.bookListingContainer}>
              <div className={css.heading}>
                <h1 className={css.title}>{title}</h1>

              </div>
              <section className={css.paymentContainer}>
                {bookingForm}
              </section>
            </div>

              {panel}

          </div>


        </LayoutWrapperMain>
        <LayoutWrapperFooter className={css.footer}>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </Page>
);
};

TransactionPageComponent.defaultProps = {
    currentUser: null,
      fetchTransactionError: null,
      acceptSaleError: null,
      declineSaleError: null,
      transaction: null,
      fetchMessagesError: null,
      initialMessageFailedToTransaction: null,
      savePaymentMethodFailed: false,
      sendMessageError: null,
      monthlyTimeSlots: null,
      lineItems: null,
      fetchLineItemsError: null,
  };

TransactionPageComponent.propTypes = {
    params: shape({ id: string }).isRequired,
      transactionRole: oneOf([PROVIDER, CUSTOMER]).isRequired,
      currentUser: propTypes.currentUser,
      fetchTransactionError: propTypes.error,
      acceptSaleError: propTypes.error,
      declineSaleError: propTypes.error,
      acceptInProgress: bool.isRequired,
      declineInProgress: bool.isRequired,
      onAcceptSale: func.isRequired,
      onDeclineSale: func.isRequired,
      scrollingDisabled: bool.isRequired,
      transaction: propTypes.transaction,
      fetchMessagesError: propTypes.error,
      totalMessagePages: number.isRequired,
      oldestMessagePageFetched: number.isRequired,
      messages: arrayOf(propTypes.message).isRequired,
      initialMessageFailedToTransaction: propTypes.uuid,
      savePaymentMethodFailed: bool,
      sendMessageInProgress: bool.isRequired,
      sendMessageError: propTypes.error,
      onShowMoreMessages: func.isRequired,
      onSendMessage: func.isRequired,
      onFetchTimeSlots: func.isRequired,
      monthlyTimeSlots: object,
      onFirstPayment:func.isRequired,
      // monthlyTimeSlots could be something like:
      // monthlyTimeSlots: {
      //   '2019-11': {
      //     timeSlots: [],
      //     fetchTimeSlotsInProgress: false,
      //     fetchTimeSlotsError: null,
      //   }
      // }
      callSetInitialValues: func.isRequired,
      onInitializeCardPaymentData: func.isRequired,
      onFetchTransactionLineItems: func.isRequired,

      // line items
      lineItems: array,
      fetchLineItemsInProgress: bool.isRequired,
      fetchLineItemsError: propTypes.error,

      // from withRouter
      history: shape({
      push: func.isRequired,
    }).isRequired,
      location: shape({
      search: string,
    }).isRequired,

      // from injectIntl
      intl: intlShape.isRequired,
  };

const mapStateToProps = state => {
    const {
      fetchTransactionError,
      acceptSaleError,
      declineSaleError,
      acceptInProgress,
      declineInProgress,
      transactionRef,
      fetchMessagesInProgress,
      fetchMessagesError,
      totalMessagePages,
      oldestMessagePageFetched,
      messages,
      initialMessageFailedToTransaction,
      savePaymentMethodFailed,
      sendMessageInProgress,
      sendMessageError,
      sendReviewInProgress,
      sendReviewError,
      monthlyTimeSlots,
      processTransitions,
      lineItems,
      fetchLineItemsInProgress,
      fetchLineItemsError,
    } = state.TransactionPage;
    const { currentUser } = state.user;

    const transactions = getMarketplaceEntities(state, transactionRef ? [transactionRef] : []);
    const transaction = transactions.length > 0 ? transactions[0] : null;

    return {
      currentUser,
      fetchTransactionError,
      acceptSaleError,
      declineSaleError,
      acceptInProgress,
      declineInProgress,
      scrollingDisabled: isScrollingDisabled(state),
      transaction,
      fetchMessagesInProgress,
      fetchMessagesError,
      totalMessagePages,
      oldestMessagePageFetched,
      messages,
      initialMessageFailedToTransaction,
      savePaymentMethodFailed,
      sendMessageInProgress,
      sendMessageError,
      sendReviewInProgress,
      sendReviewError,
      monthlyTimeSlots,
      processTransitions,
      lineItems,
      fetchLineItemsInProgress,
      fetchLineItemsError,
    };
  };

const mapDispatchToProps = dispatch => {
    return {
      onAcceptSale: (transactionId,bookingForCRM) => dispatch(acceptSale(transactionId, bookingForCRM)),
      onFirstPayment: (transactionId) => dispatch(firstPayment(transactionId)),
      onDeclineSale: transactionId => dispatch(declineSale(transactionId)),
      onShowMoreMessages: txId => dispatch(fetchMoreMessages(txId)),
      onSendMessage: (txId, message) => dispatch(sendMessage(txId, message)),
      onManageDisableScrolling: (componentId, disableScrolling) =>
        dispatch(manageDisableScrolling(componentId, disableScrolling)),
      onSendReview: (role, tx, reviewRating, reviewContent) =>
        dispatch(sendReview(role, tx, reviewRating, reviewContent)),
      callSetInitialValues: (setInitialValues, values) => dispatch(setInitialValues(values)),
      onInitializeCardPaymentData: () => dispatch(initializeCardPaymentData()),
      onFetchTimeSlots: (listingId, start, end, timeZone) =>
        dispatch(fetchTimeSlots(listingId, start, end, timeZone)),
      onFetchTransactionLineItems: (bookingData, listingId, isOwnListing) =>
        dispatch(fetchTransactionLineItems(bookingData, listingId, isOwnListing)),
    };
  };

const PaymentPage = compose(
withRouter,
connect(
mapStateToProps,
mapDispatchToProps
),
injectIntl
)(TransactionPageComponent);

export default PaymentPage;
