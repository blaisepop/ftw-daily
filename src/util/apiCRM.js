import axios from "axios";
const config = {
    headers: { 
      'X-User-Token': "HExzbkejGSjXMXKu-HiT",
      'X-User-Email': "26.mariusremy@gmail.com"
    }
}
const baseUrl="https://mobile-food-ch.herokuapp.com/";

export  const post=(url, object)=>{
    return axios.post(baseUrl+url, object, config)
}
export const get=(url)=>{
    return axios.get(baseUrl+url, config)
}

//get menus

