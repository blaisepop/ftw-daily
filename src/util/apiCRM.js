//in this file we there is functions in link with the CRM API

import axios from "axios";
const config = {
    headers: { 
      'X-User-Token': "HExzbkejGSjXMXKu-HiT",
      //'X-User-Token': " t-wCWAyLtsToftoF9Rrq",
      'X-User-Email': "26.mariusremy@gmail.com"
    }
}
const baseUrl="https://mobile-food-ch.herokuapp.com/api/v1/";
//const baseUrl="http://localhost:5000/api/v1/";
export  const post=(url, object)=>{
    return axios.post(baseUrl+url, object, config)
    .then((resp)=> resp.data)
    .catch(e=>{
        throw(e);
    })
}
export const get=(url)=>{
    return axios.get(baseUrl+url, config)
    .then(resp=>{
         return resp.data
    })
    .catch(e=>{
        throw(e);
    })
}

//get menus
export const getMenus=(id)=>{
    return get("menu_items/?partner_number=" +id);
}
//get bookings
export const getBookings=(id)=>{
    return get("bookings/?partner_number="+ id +"&status=Completed");
}


//post bookings
export const addBooking=(booking)=>{
    return post("bookings", booking);
}

//post clients
export const addClient=(booking)=>{
    return post("clients", booking);
}
export const paymentIntent=(data)=>{
    return post(paymentIntent, data);
}