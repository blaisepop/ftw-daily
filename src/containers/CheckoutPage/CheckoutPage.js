import React, { Component } from 'react';
import axios from 'axios';
import { paymentIntent } from '../../util/apiCRM';

import {
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { bool, func, instanceOf, object, shape, string } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { withRouter } from 'react-router-dom';
import { Form as FinalForm , FormSpy} from 'react-final-form';
import classNames from 'classnames';
import routeConfiguration from '../../routeConfiguration';
import { pathByRouteName, findRouteByRouteName } from '../../util/routes';
import { propTypes, LINE_ITEM_NIGHT, LINE_ITEM_DAY, DATE_TYPE_DATETIME } from '../../util/types';
import {
  ensureListing,
  ensureUser,
  ensureTransaction,
  ensureBooking,
} from '../../util/data';
import * as validators from '../../util/validators';

//import { dateFromLocalToAPI } from '../../util/dates';
import { createSlug } from '../../util/urlHelpers';
import {
  isTransactionInitiateAmountTooLowError,
  isTransactionInitiateListingNotFoundError,
  isTransactionInitiateBookingTimeNotAvailableError,
  isTransactionChargeDisabledError,
  isTransactionZeroPaymentError,
} from '../../util/errors';
import { formatMoney } from '../../util/currency';
import {
  AvatarMedium,
  Button,
  BookingBreakdown,
  Logo,
  NamedLink,
  NamedRedirect,
  Page,
  ResponsiveImage,
  Form,
  PrimaryButton,
  FieldTextInput, Modal,
} from '../../components';
import { CheckoutForm } from '../../forms';

import {isScrollingDisabled, manageDisableScrolling} from '../../ducks/UI.duck';
import {
  initiateOrder,
  setInitialValues,
  speculateTransaction,
  sendMessage, registeringFailed, registeringCRMSuccessed,
} from './CheckoutPage.duck';

import config from '../../config';

import { storeData, storedData, clearData } from './CheckoutPageSessionHelpers';
import css from './CheckoutPage.module.css';
import SectionRulesMaybe from "../ListingPage/SectionRulesMaybe";
import SectionDimensions from "../ListingPage/SectionDimensions";
import {declineSale} from "../TransactionPage/TransactionPage.duck";

const STORAGE_KEY = 'CheckoutPage';
const stripeKey = config.stripe.publishableKey;
console.log("key", stripeKey);
const stripePromise = loadStripe(stripeKey);



export class CheckoutPageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pageData: {},
      dataLoaded: false,
      submitting: false,
      clientSecret: "",
      paymentIntentID: "",
      transac: null,
      formValues:null,
      registerTransactionError:false,
      infosModalOpen:false,
      valuesToSubmit:{}
    };

    this.loadInitialData = this.loadInitialData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.registerBooking = this.registerBooking.bind(this);


  }
  componentDidMount() {
    /*if (window) {
      this.loadInitialData();
    }*/

    console.log(this.state.pageData);



    /*const data = {
      partner_number: partnerNumber
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
        this.setState({ clientSecret: payment_intent.client_secret })
        this.setState({ paymentIntentID: payment_intent.id })
      });*/
  }

  componentWillMount() {
    if (window) {
      this.loadInitialData();
    }
  }

  /**
   * Load initial data for the page
   *
   * Since the data for the checkout is not passed in the URL (there
   * might be lots of options in the future), we must pass in the data
   * some other way. Currently the ListingPage sets the initial data
   * for the CheckoutPage's Redux store.
   *
   * For some cases (e.g. a refresh in the CheckoutPage), the Redux
   * store is empty. To handle that case, we store the received data
   * to window.sessionStorage and read it from there if no props from
   * the store exist.
   *
   * This function also sets of fetching the speculative transaction
   * based on this initial data.
   */
  loadInitialData() {
    const {
      bookingData,
      bookingDates,
      listing,
      enquiredTransaction,
      fetchSpeculatedTransaction,
      history,

    } = this.props;
    console.log(this.props)
    // Browser's back navigation should not rewrite data in session store.
    // Action is 'POP' on both history.back() and page refresh cases.
    // Action is 'PUSH' when user has directed through a link
    // Action is 'REPLACE' when user has directed through login/signup process
    const hasNavigatedThroughLink =
      history.action === 'PUSH' || history.action === 'REPLACE';

    const hasDataInProps =
      !!(bookingData && bookingDates && listing) && hasNavigatedThroughLink;
    if (hasDataInProps) {
      // Store data only if data is passed through props and user has navigated through a link.
      storeData(
        bookingData,
        bookingDates,
        listing,
        enquiredTransaction,
        STORAGE_KEY
      );
    }

    // NOTE: stored data can be empty if user has already successfully completed transaction.
    const pageData = hasDataInProps
      ? { bookingData, bookingDates, listing, enquiredTransaction }
      : storedData(STORAGE_KEY);
    console.log("hasDP", hasDataInProps, pageData,);
    const hasData =
      pageData &&
      pageData.listing &&
      pageData.listing.id &&
      pageData.bookingData &&
      pageData.bookingDates &&
      pageData.bookingDates.bookingStart &&
      pageData.bookingDates.bookingEnd;

    if (hasData) {
      const listingId = pageData.listing.id;
      const { bookingStart, bookingEnd } = pageData.bookingDates;
      console.log('pageData1', pageData);
      // Convert picked date to date that will be converted on the API as
      // a noon of correct year-month-date combo in UTC
      //const bookingStartForAPI = dateFromLocalToAPI(bookingStart);
      //const bookingEndForAPI = dateFromLocalToAPI(bookingEnd);

      // Fetch speculated transaction for showing price in booking breakdown
      // NOTE: if unit type is line-item/units, quantity needs to be added.
      // The way to pass it to checkout page is through pageData.bookingData
      fetchSpeculatedTransaction({
        listingId,
        bookingStart: bookingStart,
        bookingEnd: bookingEnd,
        menus: pageData.bookingData.menus,
        hasFee: pageData.bookingData.fee?.length > 0,
        nbGuest: pageData.bookingData.nbGuest,
      });
    }

    this.setState({ pageData: pageData || {}, dataLoaded: true });
  }


    handleSubmit(values, amount) {
      if (this.state.submitting) {
        return;
      }
      this.setState({infosModalOpen:true})
      this.setState({valuesToSubmit:values})

    }


  handleOnChange(values){
    console.log(this.state.formValues);
    this.setState({formValues:values}) ;

  }
   registerBooking(values, amount){
    if (this.state.submitting) {
      return;
    }
    this.setState({ submitting: true });

    const initialMessage = values.initialMessage;
    const { history, speculatedTransaction, dispatch, onInitiateOrder, onSendMessage,onregisteringCRMSuccessed, onRegisteringFailed } = this.props;

    // Create order aka transaction
    // NOTE: if unit type is line-item/units, quantity needs to be added.
    // The way to pass it to checkout page is through pageData.bookingData
    const requestParams = {
      listingId: this.state.pageData.listing.id,
      bookingStart: speculatedTransaction.booking.attributes.start,
      bookingEnd: speculatedTransaction.booking.attributes.end,
      menus: this.state.pageData.bookingData.menus,
      hasFee: this.state.pageData.bookingData.fee,
      nbGuest: this.state.pageData.bookingData.nbGuest,
    };
    console.log("params",requestParams);
    const enquiredTransaction = this.state.pageData.enquiredTransaction;
    const transactionIdMaybe = enquiredTransaction ? enquiredTransaction.id : null;
    console.log("Transaction ID", transactionIdMaybe);
    const partnerNumber = this.state.pageData.listing.attributes.publicData.partnerNumber


     const currentUser = this.props.currentUser;

   // console.log("VALUES", values)
    //console.log("pagedata", this.state.pageData)

    onInitiateOrder(requestParams, transactionIdMaybe).then(params => {
      const transactionID = params.id.uuid;
      console.log(transactionID)
      const bookingForCRM =
      {
        "booking":
        {
          "address": values.BookingAddress,
          "budget_per_guest": "12",
          "guest_quantity": requestParams.nbGuest,
          "start_time": new Date(this.state.pageData.bookingDates.bookingStart).toISOString(),
          "end_time": new Date(this.state.pageData.bookingDates.bookingEnd).toISOString(),
          "partner_number": partnerNumber,
          "sharetribe_user_id": this.props.currentUser.id.uuid,
          "status": "Sharetribe requested",
          "marketplace_transaction_id": transactionID,
          "payment_intent_id": this.state.paymentIntentID,
          "total_amount":amount
        }
      }
      const conf = {
        headers: {
          'X-User-Token': process.env.REACT_APP_CRM_USER_TOKEN,
          'X-User-Email': "26.mariusremy@gmail.com"
        }
      }
      //axios.post("http://localhost:5000/api/v1/bookings",
        axios.post(process.env.REACT_APP_CRM_LINK+"bookings",
        bookingForCRM
        , conf)
        .then(()=>{
          onregisteringCRMSuccessed(params.id.uuid)
          onSendMessage({ ...params, message: initialMessage })
          .then(values => {
            const { orderId, messageSuccess } = values;
            this.setState({ submitting: false });
            const routes = routeConfiguration();
            const OrderPage = findRouteByRouteName('OrderDetailsPage', routes);

            // Transaction is already created, but if the initial message
            // sending failed, we tell it to the OrderDetailsPage.
            dispatch(
              OrderPage.setInitialValues({
                initialMessageFailedToTransaction: messageSuccess ? null : orderId,
              })
            );
            const orderDetailsPath = pathByRouteName('OrderDetailsPage', routes, {
              id: orderId.uuid,
            });
            clearData(STORAGE_KEY);
            history.push(orderDetailsPath);
          })
          .catch((params) => {

            this.setState({registerTransactionError:true})
            this.setState({ submitting: false });
          });
        })
        .catch((error) => {
          console.log("PARAMS",params);
          onRegisteringFailed(params.id.uuid)
          this.setState({registerTransactionError:true})
          console.log("erreur", this.state.registertransactionError, this.state.submitting)
          this.setState({ submitting: false });
          return;
        });
      console.log("bookingCRM", bookingForCRM);

    });
  }
  render() {


    const {
      scrollingDisabled,
      speculateTransactionInProgress,
      speculateTransactionError,
      speculatedTransaction,
      initiateOrderError,
      intl,
      params,
      currentUser,
      onManageDisableScrolling,
    } = this.props;
    const appearance = {
      theme: 'stripe',
    };
    const clientSecret = this.state.clientSecret
    const options = {
      clientSecret,
      appearance,
    };

    console.log("IIICCII", speculatedTransaction);
    // Since the listing data is already given from the ListingPage
    // and stored to handle refreshes, it might not have the possible
    // deleted or closed information in it. If the transaction
    // initiate or the speculative initiate fail due to the listing
    // being deleted or closec, we should dig the information from the
    // errors and not the listing data.
    const listingNotFound =
      isTransactionInitiateListingNotFoundError(speculateTransactionError) ||
      isTransactionInitiateListingNotFoundError(initiateOrderError);

    const isLoading = !this.state.dataLoaded || speculateTransactionInProgress;

    const { listing, bookingDates, enquiredTransaction } = this.state.pageData;

    const currentTransaction = ensureTransaction(
      speculatedTransaction,
      {},
      null
    );
    const currentBooking = ensureBooking(currentTransaction.booking);
    const currentListing = ensureListing(listing);
    console.log("currentListing", this.state.pageData);
    const currentAuthor = ensureUser(currentListing.author);

    const isOwnListing =
      currentUser &&
      currentUser.id &&
      currentAuthor &&
      currentAuthor.id &&
      currentAuthor.id.uuid === currentUser.id.uuid;

    const hasListingAndAuthor = !!(currentListing.id && currentAuthor.id);
    const hasBookingDates = !!(
      bookingDates &&
      bookingDates.bookingStart &&
      bookingDates.bookingEnd
    );
    const hasRequiredData = hasListingAndAuthor && hasBookingDates;
    const canShowPage = hasRequiredData && !isOwnListing;
    const shouldRedirect = !isLoading && !canShowPage;

    // Redirect back to ListingPage if data is missing.
    // Redirection must happen before any data format error is thrown (e.g. wrong currency)
    if (shouldRedirect) {
      // eslint-disable-next-line no-console
      console.error(
        'Missing or invalid data for checkout, redirecting back to listing page.',
        {
          transaction: currentTransaction,
          bookingDates,
          listing,
        }
      );
      return <NamedRedirect name="ListingPage" params={params} />;
    }
    // Show breakdown only when speculated transaction and booking are loaded
    // (i.e. have an id)
    const tx = currentTransaction.booking ? currentTransaction : null;

    const txBooking = ensureBooking(tx.booking);
    console.log("TTTXXX", tx, txBooking)
    const timeZone = currentListing.attributes.availabilityPlan
      ? currentListing.attributes.availabilityPlan.timezone
      : 'Etc/UTC';
    const breakdown =
      tx.id && txBooking.id ? (
        <BookingBreakdown
          className={css.bookingBreakdown}
          userRole="customer"
          unitType={config.bookingUnitType}
          transaction={tx}
          booking={txBooking}
          dateType={DATE_TYPE_DATETIME}
          timeZone={timeZone}
          onManageDisableScrolling={onManageDisableScrolling}
        />
      ) : null;
    const initialMessageLabel = intl.formatMessage(
      { id: 'StripePaymentForm.messageLabel' },
    );
    const listingTitle = currentListing.attributes.title;
    const title = intl.formatMessage(
      { id: 'CheckoutPage.title' },
      { listingTitle }
    );

    const firstImage =
      currentListing.images && currentListing.images.length > 0
        ? currentListing.images[0]
        : null;
    const publicMedia=(currentListing
      &&currentListing.attributes
      &&currentListing.attributes.publicData
      && currentListing.attributes.publicData.media?
      currentListing.attributes.publicData.media
      :null);
    const listImagesFromMedia=publicMedia && publicMedia.pictures ? publicMedia.pictures:null
    let firstImageFromMedia=null
    if(listImagesFromMedia){
      firstImageFromMedia=listImagesFromMedia[0]

    }
    console.log(currentListing)
    const listingNotFoundErrorMessage = listingNotFound ? (
      <p className={css.notFoundError}>
        <FormattedMessage id="CheckoutPage.listingNotFoundError" />
      </p>
    ) : null;
    const listingLink = currentListing.id ? (
      <NamedLink
        name="ListingPage"
        params={{
          id: currentListing.id.uuid,
          slug: createSlug(listingTitle),
        }}
      >
        <FormattedMessage id="CheckoutPage.errorlistingLinkText" />
      </NamedLink>
    ) : null;

    const isAmountTooLowError = isTransactionInitiateAmountTooLowError(
      initiateOrderError
    );
    const isChargeDisabledError = isTransactionChargeDisabledError(
      initiateOrderError
    );
    const isBookingTimeNotAvailableError = isTransactionInitiateBookingTimeNotAvailableError(
      initiateOrderError
    );

    let initiateOrderErrorMessage = null;

    if (!listingNotFound && isAmountTooLowError) {
      initiateOrderErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage id="CheckoutPage.initiateOrderAmountTooLow" />
        </p>
      );
    } else if (!listingNotFound && isBookingTimeNotAvailableError) {
      initiateOrderErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage id="CheckoutPage.bookingTimeNotAvailableMessage" />
        </p>
      );
    } else if (!listingNotFound && isChargeDisabledError) {
      initiateOrderErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage id="CheckoutPage.chargeDisabledMessage" />
        </p>
      );
    } else if (!listingNotFound && initiateOrderError) {
      initiateOrderErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage
            id="CheckoutPage.initiateOrderError"
            values={{ listingLink }}
          />
        </p>
      );
    }

    const speculateTransactionErrorMessage = speculateTransactionError ? (
      <p className={css.speculateError}>
        <FormattedMessage id="CheckoutPage.speculateTransactionError" />
      </p>
    ) : null;

    const registerErrorMessage = this.state.registerTransactionError ? (
      <p className={css.speculateError}>
        <FormattedMessage id="CheckoutPage.RegisterError" />
      </p>
    ) : null;

    let speculateErrorMessage = null;

    if (
      isTransactionInitiateBookingTimeNotAvailableError(
        speculateTransactionError
      )
    ) {
      speculateErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage id="CheckoutPage.bookingTimeNotAvailableMessage" />
        </p>
      );
    } else if (isTransactionZeroPaymentError(speculateTransactionError)) {
      speculateErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage id="CheckoutPage.initiateOrderAmountTooLow" />
        </p>
      );
    } else if (speculateTransactionError) {
      speculateErrorMessage = (
        <p className={css.orderError}>
          <FormattedMessage id="CheckoutPage.speculateFailedMessage" />
        </p>
      );
    }
    const trans='fr'
    const topbar = (
      <div className={css.topbar}>
        <NamedLink className={css.home} name="LandingPage">
          <Logo
            className={css.logoMobile}
            title={intl.formatMessage({
              id: 'CheckoutPage.goToLandingPage',
            })}
            format="mobile"
          />
          <Logo
            className={css.logoDesktop}
            alt={intl.formatMessage({
              id: 'CheckoutPage.goToLandingPage',
            })}
            format="desktop"
          />
        </NamedLink>
      </div>
    );

    const unitType = config.bookingUnitType;
    const isNightly = unitType === LINE_ITEM_NIGHT;
    const isDaily = unitType === LINE_ITEM_DAY;

    const unitTranslationKey = isNightly
      ? 'CheckoutPage.perNight'
      : isDaily
        ? 'CheckoutPage.perDay'
        : 'CheckoutPage.perUnit';

    const price = currentListing.attributes.price;
    const formattedPrice = formatMoney(intl, price);
    const detailsSubTitle = `${formattedPrice} ${intl.formatMessage({
      id: unitTranslationKey,
    })}`;

    const showInitialMessageInput = !enquiredTransaction;

    const pageProps = { title, scrollingDisabled };

    if (isLoading) {
      return (
        <Page {...pageProps}>
          {topbar}
          <div className={css.loading}>
            <FormattedMessage id="CheckoutPage.loadingData" />
          </div>
        </Page>
      );
    }
    const authorDisplayName = currentAuthor.attributes.profile.displayName;

    const messagePlaceholder = intl.formatMessage(
      { id: 'StripePaymentForm.messagePlaceholder' },
      { name: authorDisplayName },

    );

    const bookingAddressLabel = intl.formatMessage(
      { id: 'StripePaymentForm.addressLabel' },

    );
    const bookingAddressPlaceholder = intl.formatMessage(
      { id: 'StripePaymentForm.addressPlaceholder' },

    );
    const bookingAdressRequiredMessage = intl.formatMessage({
      id: 'StripePaymentForm.addressRequidredMessage',
    });
    const bookingAdressRequired = validators.required(bookingAdressRequiredMessage);
    const amount = tx && tx.attributes && tx.attributes.payinTotal ? tx.attributes.payinTotal.amount : 0;
    console.log("EEERRRUUUURRR", speculateTransactionError)
    const bookingForm = !speculateTransactionError?(
      <FinalForm
        onSubmit={values => {
          this.handleSubmit(values, amount);
        }}
        render={fieldRenderProps => {
          const { handleSubmit } = fieldRenderProps;
          return (
            <Form onSubmit={handleSubmit} id="payment-form">
              <FormSpy
                subscription={{ values: true }}
                onChange={values => {
                  this.handleOnChange(values);
                }}
              />
              {showInitialMessageInput ? (
                <div className={css.messageHeading} >

                  <h3 className={css.addressHeading}>
                    <FormattedMessage id="StripePaymentForm.addressHeading" />
                  </h3>
                  <FieldTextInput
                    type="text"
                    id={`address`}
                    name="BookingAddress"
                    label={bookingAddressLabel}
                    placeholder={bookingAddressPlaceholder}
                    className={css.bookingAddress}
                    validate={bookingAdressRequired}
                  />

                  <h3 className={css.messageHeading}>
                    <FormattedMessage id="StripePaymentForm.messageHeading" />
                  </h3>

                  <FieldTextInput
                    type="textarea"
                    id={`bookingForm-message`}
                    name="initialMessage"
                    label={initialMessageLabel}
                    placeholder={messagePlaceholder}
                    className={css.message}
                  />
                </div>
              ) : null}
              {registerErrorMessage}
              {<PrimaryButton
                  className={css.submitButton}
                  type="submit"
                  inProgress={this.state.submitting}
                >
                <FormattedMessage id="CheckoutPage.submitButton" />
              </PrimaryButton>}
              <Modal
                id="checkout.infos"
                contentClassName={css.infosModalContent}
                isOpen={this.state.infosModalOpen}
                onClose={() => {
                  this.setState({ infosModalOpen: false });
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
                <PrimaryButton onClick={() => {
                  this.setState({ infosModalOpen: false });
                  this.registerBooking(this.state.valuesToSubmit, amount)
                }}>OK</PrimaryButton>
              </Modal>
            </Form>
          );
        }}
      />
    ):null;

    return (
      <Page {...pageProps}>
        {topbar}
        <div className={css.contentContainer}>
          <div className={css.aspectWrapper}>
            <ResponsiveImage
              rootClassName={css.rootForImage}
              alt={listingTitle}
              image={firstImage}
              imageFromMedia={firstImageFromMedia}
              variants={['landscape-crop', 'landscape-crop2x']}
            />

          </div>
          <div className={classNames(css.avatarWrapper, css.avatarMobile)}>
            <AvatarMedium user={currentAuthor} disableProfileLink />
          </div>
          <div className={css.bookListingContainer}>
            <div className={css.heading}>
              <h1 className={css.title}>{title}</h1>
              <div className={css.author}>
                <FormattedMessage
                  id="CheckoutPage.hostedBy"
                  values={{ name: authorDisplayName }}
                />
              </div>
            </div>

            <section className={css.paymentContainer}>
              {initiateOrderErrorMessage}
              {listingNotFoundErrorMessage}
              {speculateErrorMessage}
              {bookingForm}
            </section>
          </div>

          <div className={css.detailsContainerDesktop}>
            <div className={css.detailsAspectWrapper}>
              <ResponsiveImage
                rootClassName={css.rootForImage}
                alt={listingTitle}
                image={firstImage}
                imageFromMedia={firstImageFromMedia}
                variants={['landscape-crop', 'landscape-crop2x']}
              />
            </div>
            <div className={css.avatarWrapper}>
              <AvatarMedium user={currentAuthor} disableProfileLink />
            </div>
            <div className={css.detailsHeadings}>
              <h2 className={css.detailsTitle}>{listingTitle}</h2>
            </div>

            {speculateTransactionErrorMessage}

            {breakdown}
          </div>
        </div>
      </Page>
    );
  }
}

CheckoutPageComponent.defaultProps = {
  initiateOrderError: null,
  listing: null,
  bookingData: {},
  bookingDates: null,
  speculateTransactionError: null,
  speculatedTransaction: null,
  enquiredTransaction: null,
  currentUser: null,
};

CheckoutPageComponent.propTypes = {
  onRegisteringFailed: func.isRequired,
  onregisteringCRMSuccessed: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  scrollingDisabled: bool.isRequired,
  listing: propTypes.listing,
  bookingData: object,
  bookingDates: shape({
    bookingStart: instanceOf(Date).isRequired,
    bookingEnd: instanceOf(Date).isRequired,
  }),
  fetchSpeculatedTransaction: func.isRequired,
  speculateTransactionInProgress: bool.isRequired,
  speculateTransactionError: propTypes.error,
  speculatedTransaction: propTypes.transaction,
  enquiredTransaction: propTypes.transaction,
  initiateOrderError: propTypes.error,
  currentUser: propTypes.currentUser,
  params: shape({
    id: string,
    slug: string,
  }).isRequired,
  sendOrderRequest: func.isRequired,

  // from connect
  dispatch: func.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
};

const mapStateToProps = state => {
  const {
    listing,
    bookingData,
    bookingDates,
    speculateTransactionInProgress,
    speculateTransactionError,
    speculatedTransaction,
    enquiredTransaction,
    initiateOrderError,
  } = state.CheckoutPage;
  const { currentUser } = state.user;

  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUser,
    bookingData,
    bookingDates,
    speculateTransactionInProgress,
    speculateTransactionError,
    speculatedTransaction,
    enquiredTransaction,
    listing,
    initiateOrderError,
  };
};

const mapDispatchToProps = dispatch => ({
  dispatch,
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
  onInitiateOrder: (params, transactionId) =>
    dispatch(initiateOrder(params, transactionId)),
  onSendMessage: params => dispatch(sendMessage(params)),
  fetchSpeculatedTransaction: params => dispatch(speculateTransaction(params)),
  onRegisteringFailed: transactionId => dispatch(registeringFailed(transactionId)),
  onregisteringCRMSuccessed: transactionId => dispatch(registeringCRMSuccessed(transactionId)),
});

const CheckoutPage = compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  injectIntl
)(CheckoutPageComponent);

CheckoutPage.setInitialValues = (initialValues, saveToSessionStorage = false) => {
  if (saveToSessionStorage) {
    const { listing, bookingData, bookingDates } = initialValues;
    storeData(bookingData, bookingDates, listing, null, STORAGE_KEY);
  }

  return setInitialValues(initialValues);
};

CheckoutPage.displayName = 'CheckoutPage';

export default CheckoutPage;
