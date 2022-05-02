import React, { Component } from 'react';
import { array, bool, func, object, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import classNames from 'classnames';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import { timestampToDate } from '../../util/dates';
import { propTypes } from '../../util/types';
<<<<<<< HEAD:src/forms/BookingDatesForm/BookingDatesForm.js
import axios from 'axios';
//
import { formatMoney } from '../../util/currency';
import { types as sdkTypes } from '../../util/sdkLoader';
//
import { Form, IconSpinner, PrimaryButton, FieldDateRangeInput, MenuFieldCheckboxGroup, FieldCheckbox, } from '../../components';
=======
import config from '../../config';
import { Form, IconSpinner, PrimaryButton } from '../../components';
>>>>>>> upstream/master:src/forms/BookingTimeForm/BookingTimeForm.js
import EstimatedBreakdownMaybe from './EstimatedBreakdownMaybe';
import FieldDateAndTimeInput from './FieldDateAndTimeInput';

<<<<<<< HEAD:src/forms/BookingDatesForm/BookingDatesForm.js
import css from './BookingDatesForm.module.css';

const { Money } = sdkTypes;
const identity = v => v;
const label = <h2>Menus</h2>;


///REQUETE POUR LES MENUS

=======
import css from './BookingTimeForm.module.css';
>>>>>>> upstream/master:src/forms/BookingTimeForm/BookingTimeForm.js

export class BookingTimeFormComponent extends Component {
  constructor(props) {
    super(props);

<<<<<<< HEAD:src/forms/BookingDatesForm/BookingDatesForm.js
    this.state = {
      focusedInput: null,
      commonProps: {
        label: label,
        options: [],
        id: "menus",
        showMinMessage: false,

      }
    };
=======
>>>>>>> upstream/master:src/forms/BookingTimeForm/BookingTimeForm.js
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.totalCost = 0;
    this.url = "https://mobile-food-ch.herokuapp.com/api/v1/menu_items/?partner_number=" + this.props.partnerNumber;
  }
  componentDidMount() {
    axios.get(this.url)
      .then((resp) => {
        var groupedList = this.groupByFoodType(resp.data)
        console.log("grouped", groupedList)
        this.setState({
          commonProps: {
            label: label,
            options: groupedList,
            id: "menus",
          }
        });
      })
      .catch(function () {
      });

<<<<<<< HEAD:src/forms/BookingDatesForm/BookingDatesForm.js

  }
  // Function that can be passed to nested components
  // so that they can notify this component when the
  // focused input changes.
  onFocusedInputChange(focusedInput) {
    this.setState({ focusedInput });
  }
  groupByFoodType(liste) {

    var newList = [];

    liste.map((element) => {

      if (newList[element.item_type]) {

        newList[element.item_type].push(element)
      }
      else {

        newList[element.item_type] = [element]
      }
    });
    //console.log("newList",newList)
    return newList

  }

  // In case start or end date for the booking is missing
  // focus on that input, otherwise continue with the
  // default handleSubmit function.
  handleFormSubmit(e) {

    const { startDate, endDate } = e.bookingDates || {};



    console.log(e)
    if (!startDate) {
      e.preventDefault();
      this.setState({ focusedInput: START_DATE });
    } else if (!endDate) {
      e.preventDefault();
      this.setState({ focusedInput: END_DATE });
    }
    else if (this.totalCost < 80000) {

      this.setState({ showMinMessage: true })

    }
    else {
      this.props.onSubmit(e);
    }
=======
  handleFormSubmit(e) {
    this.props.onSubmit(e);
>>>>>>> upstream/master:src/forms/BookingTimeForm/BookingTimeForm.js
  }

  // When the values of the form are updated we need to fetch
  // lineItems from FTW backend for the EstimatedTransactionMaybe
  // In case you add more fields to the form, make sure you add
  // the values here to the bookingData object.
  handleOnChange(formValues) {
<<<<<<< HEAD:src/forms/BookingDatesForm/BookingDatesForm.js

    console.log(formValues)
    const menus = formValues.values && formValues.values.menus ? formValues.values.menus : {};



    const { startDate, endDate } =
      formValues.values && formValues.values.bookingDates ? formValues.values.bookingDates : {};
      const hasFee =this.props.fee!=null;
    const listingId = this.props.listingId;
    const isOwnListing = this.props.isOwnListing;

    if (startDate && endDate && !this.props.fetchLineItemsInProgress) {

=======
    const { bookingStartTime, bookingEndTime } = formValues.values;
    const startDate = bookingStartTime ? timestampToDate(bookingStartTime) : null;
    const endDate = bookingEndTime ? timestampToDate(bookingEndTime) : null;

    const listingId = this.props.listingId;
    const isOwnListing = this.props.isOwnListing;

    // We expect values bookingStartTime and bookingEndTime to be strings
    // which is the default case when the value has been selected through the form
    const isSameTime = bookingStartTime === bookingEndTime;

    if (bookingStartTime && bookingEndTime && !isSameTime && !this.props.fetchLineItemsInProgress) {
>>>>>>> upstream/master:src/forms/BookingTimeForm/BookingTimeForm.js
      this.props.onFetchTransactionLineItems({
        bookingData: { startDate, endDate, menus ,hasFee},
        listingId,
        isOwnListing,
      });
    }
  }

  render() {
    const { rootClassName, className, price: unitPrice, ...rest } = this.props;
    const classes = classNames(rootClassName || css.root, className);

    if (!unitPrice) {
      return (
        <div className={classes}>
          <p className={css.error}>
            <FormattedMessage id="BookingTimeForm.listingPriceMissing" />
          </p>
        </div>
      );
    }
    if (unitPrice.currency !== config.currency) {
      return (
        <div className={classes}>
          <p className={css.error}>
            <FormattedMessage id="BookingTimeForm.listingCurrencyInvalid" />
          </p>
        </div>
      );
    }

    return (
      <FinalForm
        {...rest}
        unitPrice={unitPrice}
        onSubmit={this.handleFormSubmit}
        render={fieldRenderProps => {
          const {
            endDatePlaceholder,
            startDatePlaceholder,
            form,
            pristine,
            handleSubmit,
            intl,
            isOwnListing,
            listingId,
            submitButtonWrapperClassName,
            unitType,
            values,
            monthlyTimeSlots,
            onFetchTimeSlots,
            timeZone,
            lineItems,
            fetchLineItemsInProgress,
            fetchLineItemsError,
            fee,
          } = fieldRenderProps;
<<<<<<< HEAD:src/forms/BookingDatesForm/BookingDatesForm.js
          const feeName=fee?fee.name:null
          const formattedFee = fee
            ? formatMoney(
              intl,
              new Money(fee.amount, fee.currency)
            )
            : null;

          const feeLabel = intl.formatMessage(
            { id: 'BookingDatesForm.feeLabel' },
            { fee: formattedFee, name:feeName}
            
            
          );
          const { startDate, endDate } = values && values.bookingDates ? values.bookingDates : {};
=======

          const startTime = values && values.bookingStartTime ? values.bookingStartTime : null;
          const endTime = values && values.bookingEndTime ? values.bookingEndTime : null;
>>>>>>> upstream/master:src/forms/BookingTimeForm/BookingTimeForm.js

          const bookingStartLabel = intl.formatMessage({
            id: 'BookingTimeForm.bookingStartTitle',
          });
          const bookingEndLabel = intl.formatMessage({
            id: 'BookingTimeForm.bookingEndTitle',
          });
<<<<<<< HEAD:src/forms/BookingDatesForm/BookingDatesForm.js
          const endDateErrorMessage = intl.formatMessage({
            id: 'FieldDateRangeInput.invalidEndDate',
          });
          const timeSlotsError = fetchTimeSlotsError ? (
            <p className={css.sideBarError}>
              <FormattedMessage id="BookingDatesForm.timeSlotsError" />
            </p>
          ) : null;
          const totalCostError = this.state.showMinMessage ? (
            <p className={css.sideBarError}>
              <FormattedMessage id={"BookingDatesForm.totalCostError"} />
            </p>
          ) : null;

=======
>>>>>>> upstream/master:src/forms/BookingTimeForm/BookingTimeForm.js

          const startDate = startTime ? timestampToDate(startTime) : null;
          const endDate = endTime ? timestampToDate(endTime) : null;

          // This is the place to collect breakdown estimation data. See the
          // EstimatedBreakdownMaybe component to change the calculations
          // for customized payment processes.
          const bookingData =
            startDate && endDate
              ? {
<<<<<<< HEAD:src/forms/BookingDatesForm/BookingDatesForm.js
                unitType,
                startDate,
                endDate,
              }
=======
                  unitType,
                  startDate,
                  endDate,
                  timeZone,
                }
>>>>>>> upstream/master:src/forms/BookingTimeForm/BookingTimeForm.js
              : null;

          const showEstimatedBreakdown =
            bookingData && lineItems && !fetchLineItemsInProgress && !fetchLineItemsError;
          //console.log(this.totalCost);
          //console.log(lineItems);
          showEstimatedBreakdown && lineItems ? this.totalCost = lineItems[lineItems.length - 1].unitPrice.amount : null;

          const bookingInfoMaybe = showEstimatedBreakdown ? (
            <div className={css.priceBreakdownContainer}>
              <h3 className={css.priceBreakdownTitle}>
                <FormattedMessage id="BookingTimeForm.priceBreakdownTitle" />
              </h3>
              <EstimatedBreakdownMaybe bookingData={bookingData} lineItems={lineItems} />
            </div>
          ) : null;

          const loadingSpinnerMaybe = fetchLineItemsInProgress ? (
            <IconSpinner className={css.spinner} />
          ) : null;

          const bookingInfoErrorMaybe = fetchLineItemsError ? (
            <span className={css.sideBarError}>
              <FormattedMessage id="BookingDatesForm.fetchLineItemsError" />
            </span>
          ) : null;
<<<<<<< HEAD:src/forms/BookingDatesForm/BookingDatesForm.js
          const feeMaybe = fee ? (
            <div>
              <p>{feeLabel}</p>
              
            <input type="hidden"
             id="fee"
             name="fee"
             label={feeLabel}
             value="fee"></input>
            </div>
            
            
          ) : null;
          const dateFormatOptions = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          };

          const now = moment();
          const today = now.startOf('day').toDate();
          const tomorrow = now
            .startOf('day')
            .add(1, 'days')
            .toDate();
          const startDatePlaceholderText =
            startDatePlaceholder || intl.formatDate(today, dateFormatOptions);
          const endDatePlaceholderText =
            endDatePlaceholder || intl.formatDate(tomorrow, dateFormatOptions);
=======

>>>>>>> upstream/master:src/forms/BookingTimeForm/BookingTimeForm.js
          const submitButtonClasses = classNames(
            submitButtonWrapperClassName || css.submitButtonWrapper
          );

<<<<<<< HEAD:src/forms/BookingDatesForm/BookingDatesForm.js
          //console.log(this.state.commonProps)
=======
          const startDateInputProps = {
            label: bookingStartLabel,
            placeholderText: startDatePlaceholder,
          };
          const endDateInputProps = {
            label: bookingEndLabel,
            placeholderText: endDatePlaceholder,
          };

          const dateInputProps = {
            startDateInputProps,
            endDateInputProps,
          };

>>>>>>> upstream/master:src/forms/BookingTimeForm/BookingTimeForm.js
          return (
            <Form onSubmit={handleSubmit} className={classes} enforcePagePreloadFor="CheckoutPage">
              <FormSpy
                subscription={{ values: true }}
                onChange={values => {
                  this.handleOnChange(values);

                }}
              />
              {monthlyTimeSlots && timeZone ? (
                <FieldDateAndTimeInput
                  {...dateInputProps}
                  className={css.bookingDates}
                  listingId={listingId}
                  bookingStartLabel={bookingStartLabel}
                  onFetchTimeSlots={onFetchTimeSlots}
                  monthlyTimeSlots={monthlyTimeSlots}
                  values={values}
                  intl={intl}
                  form={form}
                  pristine={pristine}
                  timeZone={timeZone}
                />
              ) : null}

              <MenuFieldCheckboxGroup {...this.state.commonProps} />


              {feeMaybe}
              {bookingInfoMaybe}
              {loadingSpinnerMaybe}
              {bookingInfoErrorMaybe}
              {totalCostError}
              {
                <p className={css.smallPrint}>

                  <FormattedMessage
                    id={
                      isOwnListing
                        ? 'BookingDatesForm.ownListing'
                        : 'BookingDatesForm.youWontBeChargedInfo'
                    }
                  />
                </p>

              }


<<<<<<< HEAD:src/forms/BookingDatesForm/BookingDatesForm.js
              <div className={submitButtonClasses}>

                <PrimaryButton >

                  <FormattedMessage id="BookingDatesForm.requestToBook" />
=======
              <p className={css.smallPrint}>
                <FormattedMessage
                  id={
                    isOwnListing
                      ? 'BookingTimeForm.ownListing'
                      : 'BookingTimeForm.youWontBeChargedInfo'
                  }
                />
              </p>
              <div className={submitButtonClasses}>
                <PrimaryButton type="submit">
                  <FormattedMessage id="BookingTimeForm.requestToBook" />
>>>>>>> upstream/master:src/forms/BookingTimeForm/BookingTimeForm.js
                </PrimaryButton>
              </div>

            </Form>
          );
        }}
      />
    );
  }
}

BookingTimeFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  submitButtonWrapperClassName: null,
  price: null,
  isOwnListing: false,
  listingId: null,
  startDatePlaceholder: null,
  endDatePlaceholder: null,
  monthlyTimeSlots: null,
  lineItems: null,
  fetchLineItemsError: null,
};

BookingTimeFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  submitButtonWrapperClassName: string,

  unitType: propTypes.bookingUnitType.isRequired,
  price: propTypes.money,
  isOwnListing: bool,
  listingId: propTypes.uuid,
  monthlyTimeSlots: object,
  onFetchTimeSlots: func.isRequired,

  onFetchTransactionLineItems: func.isRequired,
  lineItems: array,
  fetchLineItemsInProgress: bool.isRequired,
  fetchLineItemsError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,

  // for tests
  startDatePlaceholder: string,
  endDatePlaceholder: string,
};

const BookingTimeForm = compose(injectIntl)(BookingTimeFormComponent);
BookingTimeForm.displayName = 'BookingTimeForm';

<<<<<<< HEAD:src/forms/BookingDatesForm/BookingDatesForm.js
export default BookingDatesForm;
=======
export default BookingTimeForm;
>>>>>>> upstream/master:src/forms/BookingTimeForm/BookingTimeForm.js
