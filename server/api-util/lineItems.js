const { calculateQuantityFromHours, calculateTotalFromLineItems } = require('./lineItemHelpers');
const { types } = require('sharetribe-flex-sdk');
const { Money } = types;

// This bookingUnitType needs to be one of the following:
// line-item/night, line-item/day or line-item/units
const bookingUnitType = 'line-item/units';
const PROVIDER_COMMISSION_PERCENTAGE = -100;
const MOBILE_FOOD_COMMISSION=1;
const resolveMenuPrice = key => {
  const mount=Number(key.split('-')[2])
    return new Money( mount*MOBILE_FOOD_COMMISSION, "CHF"); 
};
const getId = key=>{
  return  key.split('-')[1];
}
const getName=key=>{
  return  key.split('-')[0];
}
const resolveFeePrice = listing => {
  const publicData = listing.attributes.publicData;
  const fee = publicData && publicData.fee;
  const { amount, currency } = fee;

  if (amount && currency) {
    return new Money(amount*MOBILE_FOOD_COMMISSION, currency);
  }

  return null;
};
const resolveFeeName=listing=>{
  const publicData = listing.attributes.publicData;
  const fee = publicData && publicData.fee;
  const { name } = fee;

  if (name) {
    return name;
  }
  return null;
};

/** Returns collection of lineItems (max 50)
 *
 * Each line items has following fields:
 * - `code`: string, mandatory, indentifies line item type (e.g. \"line-item/cleaning-fee\"), maximum length 64 characters.
 * - `unitPrice`: money, mandatory
 * - `lineTotal`: money
 * - `quantity`: number
 * - `percentage`: number (e.g. 15.5 for 15.5%)
 * - `seats`: number
 * - `units`: number
 * - `includeFor`: array containing strings \"customer\" or \"provider\", default [\":customer\"  \":provider\" ]
 *
 * Line item must have either `quantity` or `percentage` or both `seats` and `units`.
 *
 * `includeFor` defines commissions. Customer commission is added by defining `includeFor` array `["customer"]` and provider commission by `["provider"]`.
 *
 * @param {Object} listing
 * @param {Object} bookingData
 * @returns {Array} lineItems
 */
exports.transactionLineItems = (listing, bookingData) => {
  
  const unitPrice = listing.attributes.price;
  const { startDate, endDate, menus, hasFee, nbGuest } = bookingData;

  /**
   * If you want to use pre-defined component and translations for printing the lineItems base price for booking,
   * you should use code line-item/units
   *
   * Pre-definded commission components expects line item code to be one of the following:
   * 'line-item/provider-commission', 'line-item/customer-commission'
   *
   * By default BookingBreakdown prints line items inside LineItemUnknownItemsMaybe if the lineItem code is not recognized. */

  const booking = {
    code: bookingUnitType,
    unitPrice,
    quantity: calculateQuantityFromHours(startDate, endDate),
    includeFor: ['customer', 'provider'],
  };
  
  const menus1=[];
  if(menus){
    
  }
  if(menus){
    Object.keys(menus).forEach(key => {
      if(menus[key]>0){
        menus1.push({
        code: 'line-item/'+getName(key),
        unitPrice: resolveMenuPrice(key),
        quantity: menus[key],
        includeFor: ['customer', 'provider'],
        type:"menu",
        id:getId(key),
      });
      }
      
    });
  }
  else{
    
  }
  
  const feePrice = hasFee ? resolveFeePrice(listing) : null;
 const fee = feePrice
   ? [
       {
         code: 'line-item/'+resolveFeeName(listing),
         unitPrice: feePrice,
         quantity: 1,
         includeFor: ['customer', 'provider'],
       },
     ]
   : [];
  

  const guests=
    {
      code:'line-item/Personnes',
      unitPrice: new Money(0,"CHF"),
      quantity:nbGuest,
      includeFor: ['customer', 'provider'],

    }
  
  const providerCommission = {
    code: 'line-item/provider-commission',
    unitPrice: calculateTotalFromLineItems([ ...menus1, ...fee, guests]),
    percentage: PROVIDER_COMMISSION_PERCENTAGE,
    includeFor: ['provider'],
  };
  const lineItems = [ ...menus1,...fee, guests, providerCommission];
 
  return lineItems;
};