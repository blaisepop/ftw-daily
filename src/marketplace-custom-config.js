import axios from "axios";
import { FormattedMessage} from './util/reactIntl.js';
import React  from 'react';

/*
 * Marketplace specific configuration.
 *
 * Every filter needs to have following keys:
 * - id:     Unique id of the filter.
 * - label:  The default label of the filter.
 * - type:   String that represents one of the existing filter components:
 *           BookingDateRangeFilter, KeywordFilter, PriceFilter,
 *           SelectSingleFilter, SelectMultipleFilter.
 * - group:  Is this 'primary' or 'secondary' filter?
 *           Primary filters are visible on desktop layout by default.
 *           Secondary filters are behind "More filters" button.
 *           Read more from src/containers/SearchPage/README.md
 * - queryParamNames: Describes parameters to be used with queries
 *                    (e.g. 'price' or 'pub_amenities'). Most of these are
 *                    the same between webapp URLs and API query params.
 *                    You can't change 'dates', 'price', or 'keywords'
 *                    since those filters are fixed to a specific attribute.
 * - config: Extra configuration that the filter component needs.
 *
 * Note 1: Labels could be tied to translation file
 *         by importing FormattedMessage:
 *         <FormattedMessage id="some.translation.key.here" />
 *
 * Note 2: If you need to add new custom filter components,
 *         you need to take those into use in:
 *         src/containers/SearchPage/FilterComponent.js
 *
 * Note 3: If you just want to create more enum filters
 *         (i.e. SelectSingleFilter, SelectMultipleFilter),
 *         you can just add more configurations with those filter types
 *         and tie them with correct extended data key
 *         (i.e. pub_<key> or meta_<key>).
 */
/*
var opt=[]
axios.get("https://mobile-food-ch.herokuapp.com/api/v1/food_types") .then(resp=>{
 var listeFiltersType=resp.data
  listeFiltersType.forEach(element => {
   const obj={key: element.name.toLowerCase(), label: element.name};
    opt.push(obj);
  });
})
.catch(e=>{
 throw(e);
})*/
export const filters = [
  {
    id: 'dates-length',
    label: 'Dates',
    type: 'BookingDateRangeFilter',
    group: 'primary',
    // Note: BookingDateRangeFilter is fixed filter,
    // you can't change "queryParamNames: ['dates'],"
    queryParamNames: ['dates'],
    config: {
      // A global time zone to use in availability searches. As listings
      // can be in various time zones, we must decide what time zone we
      // use in search when looking for available listings within a
      // certain time interval.
      //
      // If you have all/most listings in a certain time zone, change this
      // config value to that.
      //
      // See: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
      searchTimeZone: 'Etc/UTC',

      // Options for the minimum duration of the booking

    },
  },
  /* {
    id: 'price',
    label: 'Prix',
    type: 'PriceFilter',
    group: 'primary',
    // Note: PriceFilter is fixed filter,
    // you can't change "queryParamNames: ['price'],"
    queryParamNames: ['price'],
    // Price filter configuration
    // Note: unlike most prices this is not handled in subunits
    config: {
      min: 0,
      max: 1000,
      step: 5,
    },
  },
 {
    id: 'capacity',
    label: 'Capacity',
    type: 'PriceFilter',
    group: 'primary',
    // Note: PriceFilter is fixed filter,
    // you can't change "queryParamNames: ['price'],"
    queryParamNames: ['capacity'],
    // Price filter configuration
    // Note: unlike most prices this is not handled in subunits
    config: {
      min: 0,
      max: 2000,
      step: 5,
    },
  },*/
  {
    id: 'keyword',
    label:  <FormattedMessage id="filter.keyword.title" />,
    type: 'KeywordFilter',
    group: 'primary',
    // Note: KeywordFilter is fixed filter,
    // you can't change "queryParamNames: ['keywords'],"
    queryParamNames: ['keywords'],
    // NOTE: If you are ordering search results by distance
    // the keyword search can't be used at the same time.
    // You can turn on/off ordering by distance from config.js file.
    config: {},
  },
  {

    id: 'category',
    label: <FormattedMessage id="filter.category.title" />,
    type: 'SelectSingleFilter',
    group: 'primary',
    queryParamNames: ['pub_category'],

    config: {
      // Optional modes: 'has_all', 'has_any'
      // https://www.sharetribe.com/api-reference/marketplace.html#extended-data-filtering
      schemaType: 'enum',


    //  options: opt,
     options:[

      { key: 'burger', label: <FormattedMessage id="filter.category.burger" /> },
      { key: 'pizza', label: <FormattedMessage id="filter.category.pizza" /> },
      { key: 'crepe', label: <FormattedMessage id="filter.category.crepe" /> },
      { key: 'thai', label: <FormattedMessage id="filter.category.thai" /> },

    ],
    },
  },
  {
    id: 'amenities',
    label: <FormattedMessage id="filter.amenities.title" />,
    type: 'SelectMultipleFilter',
    group: 'primary',
    queryParamNames: ['pub_amenities'],
    config: {
      // Optional modes: 'has_all', 'has_any'
      // https://www.sharetribe.com/api-reference/marketplace.html#extended-data-filtering

      schemaType: 'enum',
      // "key" is the option you see in Flex Console.
      // "label" is set here for this web app's UI only.
      // Note: label is not added through the translation files
      // to make filter customizations a bit easier.
      options: [
        {
          key: 'starter',
          label: <FormattedMessage id="filter.amenities.starter" />,
        },
        {
          key: 'main',
          label: <FormattedMessage id="filter.amenities.main" />,
        },
        {
          key: 'drinks',
          label: <FormattedMessage id="filter.amenities.drinks" />,
        },
        {
          key: 'dessert',
          label: <FormattedMessage id="filter.amenities.dessert" />,
        },
        {
          key: 'aperitive',
          label: <FormattedMessage id="filter.amenities.aperitive" />,
        },
      ],
    },
  },



];

export const sortConfig = {
  // Enable/disable the sorting control in the SearchPage
  active: true,

  // Note: queryParamName 'sort' is fixed,
  // you can't change it since Flex API expects it to be named as 'sort'
  queryParamName: 'sort',

  // Internal key for the relevance option, see notes below.
  relevanceKey: 'relevance',

  // Keyword filter is sorting the results already by relevance.
  // If keyword filter is active, we need to disable sorting.
  conflictingFilters: ['keyword'],

  options: [
    { key: 'createdAt', label: <FormattedMessage id="filter.sort.mostRecent" /> },
    { key: '-createdAt', label: <FormattedMessage id="filter.sort.lessRecent" /> },


    // The relevance is only used for keyword search, but the
    // parameter isn't sent to the Marketplace API. The key is purely
    // for handling the internal state of the sorting dropdown.
   // { key: 'relevance', label: 'Relevance', longLabel: 'Relevance (Keyword search)' },
  ],
};
