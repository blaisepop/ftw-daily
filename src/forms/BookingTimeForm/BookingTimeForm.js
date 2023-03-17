import { getMenus, getBookings } from '../../util/apiCRM';
import React, { Component } from 'react';
import { array, bool, func, object, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import classNames from 'classnames';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import { timestampToDate } from '../../util/dates';
import { propTypes } from '../../util/types';
import config from '../../config';
import axios from 'axios';
import { Form, IconSpinner, PrimaryButton, MenuFieldCheckboxGroup, FieldTextInput } from '../../components';
import EstimatedBreakdownMaybe from './EstimatedBreakdownMaybe';
import FieldDateAndTimeInput from './FieldDateAndTimeInput';
import { formatMoney } from '../../util/currency';
import css from './BookingTimeForm.module.css';
import { types as sdkTypes } from '../../util/sdkLoader';
import moment from "moment";
import d from 'final-form-arrays';
const { Money } = sdkTypes;
const label = <h2>Menus</h2>;
export class BookingTimeFormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focusedInput: null,
      commonProps: {
        label: label,
        options: [],
        id: "menus",
        showMinMessage: false,

      },
      bookingList: [],
      showBookedMessage: false,
      showCapacityMessage: false,
    };
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.alreadyBooked = this.alreadyBooked.bind(this);
    this.fetchMenus = this.fetchMenus.bind(this);
    this.totalCost = 0;
    this.url = "https://mobile-food-ch.herokuapp.com/api/v1/menu_items/?partner_number=" + this.props.partnerNumber;
    this.urlBookings = "https://mobile-food-ch.herokuapp.com/api/v1/bookings/?partner_number=" + this.props.partnerNumber + "&status=Cancelled";

  }
  fetchMenus = async () => {
    const data = await getMenus(this.props.partnerNumber);
    var groupedList = this.groupByFoodType(data);
    this.setState({
      commonProps: {
        label: label,
        options: groupedList,
        id: "menus",
      }
    });

  }
  fetchBookings = async () => {
    const data = await getBookings(this.props.partnerNumber);
    this.setState({
      bookingList: data
    });

  }
  componentDidMount() {


    this.fetchMenus();
    this.fetchBookings();

  }

  handleFormSubmit(e) {
  //  console.log-=(this.totalCost)
    if (this.totalCost < 80000/*config.mfCommission*/) {
      this.setState({ showMinMessage: true })
    }
    else if (!this.state.showCapacityMessage && !this.state.showBookedMessage) {
      this.props.onSubmit(e);
    }

  }
  alreadyBooked(start, end) {
    var res = false;
    const momentStart = moment(timestampToDate(start));
    const momentEnd = moment(timestampToDate(end));
    this.state.bookingList.forEach(element => {
      const momentBookingSart = moment(element.start_time);
      const momentBookingEnd = moment(element.end_time);

      if (momentStart.isBetween(momentBookingSart, momentBookingEnd, "[]") || momentEnd.isBetween(momentBookingSart, momentBookingEnd, "[]") || momentBookingEnd.isBetween(momentStart, momentEnd, "[]") || momentBookingEnd.isBetween(momentStart, momentEnd, "[]")) {

        res = true
      }

    });
    return res;
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

    return newList

  }

  // When the values of the form are updated we need to fetch
  // lineItems from FTW backend for the EstimatedTransactionMaybe
  // In case you add more fields to the form, make sure you add
  // the values here to the bookingData object.
  handleOnChange(formValues) {
    const nbGuest = formValues.values && formValues.values.nbGuest ? formValues.values.nbGuest : null;
    const hasFee = this.props.fee != null;
    const menus = formValues.values && formValues.values.menus ? formValues.values.menus : {};
    const { bookingStartTime, bookingEndTime } = formValues.values;
    const startDate = bookingStartTime ? timestampToDate(bookingStartTime) : null;
    const endDate = bookingEndTime ? timestampToDate(bookingEndTime) : null;
    const listingId = this.props.listingId;
    const isOwnListing = this.props.isOwnListing;

    // We expect values bookingStartTime and bookingEndTime to be strings
    // which is the default case when the value has been selected through the form
    const isSameTime = bookingStartTime === bookingEndTime;

    if (bookingStartTime && bookingEndTime && !isSameTime && !this.props.fetchLineItemsInProgress) {


      if (!this.alreadyBooked(bookingStartTime, bookingEndTime)) {
        this.props.onFetchTransactionLineItems({
          bookingData: { startDate, endDate, menus, hasFee, nbGuest },
          listingId,
          isOwnListing,
        });
        this.setState({ showBookedMessage: false })
      }
      else {
        this.setState({ showBookedMessage: true })
      }


    }

    if (nbGuest) {
      if (Number(nbGuest) < Number(this.props.capacity)) {

        this.setState({ showCapacityMessage: true })
      }
      else {

        this.setState({ showCapacityMessage: false })
      }
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
            capacity,

          } = fieldRenderProps;
          const feeName = fee ? fee.name : null
          const formattedFee = fee
            ? formatMoney(
              intl,
              new Money(fee.amount, fee.currency)
            )
            : null;
          const feeLabel = intl.formatMessage(
            { id: 'BookingDatesForm.feeLabel' },
            { fee: formattedFee, name: feeName }


          );
          const totalCostError = this.state.showMinMessage ? (
            <p className={css.sideBarError}>
              <FormattedMessage id={"BookingDatesForm.totalCostError"} />
            </p>
          ) : null;

          const alreadyBookedError = this.state.showBookedMessage ? (
            <p className={css.sideBarError}>
              <FormattedMessage id={"BookingDatesForm.bookedError"} />
            </p>
          ) : null;
          const capacityError = this.state.showCapacityMessage ? (
            <p className={css.sideBarError}>
              <FormattedMessage id={"BookingDatesForm.capacityError"} />
            </p>
          ) : null;
          const startTime = values && values.bookingStartTime ? values.bookingStartTime : null;
          const endTime = values && values.bookingEndTime ? values.bookingEndTime : null;

          const bookingStartLabel = intl.formatMessage({
            id: 'BookingTimeForm.bookingStartTitle',
          });
          const capacityLabel = intl.formatMessage(
            { id: 'BookingTimeForm.capacityTitle' },
            { capacity: capacity },
          );
          const bookingEndLabel = intl.formatMessage({
            id: 'BookingTimeForm.bookingEndTitle',
          });

          const startDate = startTime ? timestampToDate(startTime) : null;
          const endDate = endTime ? timestampToDate(endTime) : null;

          // This is the place to collect breakdown estimation data. See the
          // EstimatedBreakdownMaybe component to change the calculations
          // for customized payment processes.
          const bookingData =
            startDate && endDate
              ? {
                unitType,
                startDate,
                endDate,
                timeZone,
              }
              : null;

          const showEstimatedBreakdown = bookingData && lineItems && !fetchLineItemsInProgress && !fetchLineItemsError;


          if(showEstimatedBreakdown && lineItems){
            //console.log(lineItems);
            let total=0;
            for (let i = 0; i < lineItems.length - 1; i++) {
           //   console.log("boucle", lineItems[i].lineTotal.amount)
              total+=lineItems[i].lineTotal.amount
            }
            this.totalCost=total
          }
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
          const feeMaybe = fee ? (
            <div>

            <FieldTextInput
              id={"fee"}
              name="fee"
              label={feeLabel}
              defaultValue="fee"
              readonly
              type="hidden"

            />
          </div>
          ) : null;

          const submitButtonClasses = classNames(
            submitButtonWrapperClassName || css.submitButtonWrapper
          );

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
              {alreadyBookedError}

              <FieldTextInput
                label={capacityLabel}
                min={capacity}
                name="nbGuest"
                id="nbGuest"
                className={css.capacity}
                type="number"
                defaultValue={capacity}
              />
              {capacityError}
              {<MenuFieldCheckboxGroup {...this.state.commonProps} />}


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



              <div className={submitButtonClasses}>
                <PrimaryButton type="submit">
                  <FormattedMessage id="BookingTimeForm.requestToBook" />
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

export default BookingTimeForm;
