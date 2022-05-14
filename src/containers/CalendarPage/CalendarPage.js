import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import Calendar from "./Calendar.js"
import { StaticPage, TopbarContainer } from '../../containers';
import 'react-calendar/dist/Calendar.css';
import {
    LayoutSingleColumn,
    LayoutWrapperTopbar,
    LayoutWrapperMain,
    LayoutWrapperFooter,
    Footer,

} from '../../components';
import localization from 'moment/locale/fr';
import css from './CalendarPage.module.css';
import { element } from 'prop-types';
function CalendarPage(props) {

    moment.locale('fr', localization)
    const [value, setValue] = useState('');
    const [bookingList, setBookingList]=useState([])
    const [dateSelected, setDateSelected] = useState(new moment());
    
    console.log(props);
    const url = "https://mobile-food-ch.herokuapp.com/api/v1/bookings?partner_number="+props.params.partnerNumber+"&status=Completed"
     useEffect(() => {       
       let config = {
            headers: {
              'X-User-Token':"HExzbkejGSjXMXKu-HiT",
              'X-User-Email':"26.mariusremy@gmail.com"
            }
          }
        axios.get(url, config)
          .then((resp) => {
           setBookingList(resp.data);
          })
          .catch(function () {
          });
        
    },  [value]);
  
       
    function formatBookingList(list) {
        var newList = [];
        list.forEach((booking) => {

            const start = booking.start_time.slice(0, -1)
            const end = booking.end_time.slice(0, -1)

            newList.push(
                {
                    start: start,
                    end: end
                })
        });
        console.log(newList);
        return newList;
    }


    var finalBookingList = formatBookingList(bookingList)
    return (
        <StaticPage
            title="Calendar"
            schema={{
                '@context': 'http://schema.org',
                '@type': 'CalendarPage',
                description: 'Partner\'s Calendar',
                name: 'Partner\'s Calendar',
            }}
        >
            <LayoutSingleColumn>
                <LayoutWrapperTopbar>
                    <TopbarContainer />
                </LayoutWrapperTopbar>

                <LayoutWrapperMain className={css.staticPageWrapper}>
                    <div className={css.calendarContainer}>
                        <Calendar onChange={setDateSelected} value={dateSelected} bookingList={finalBookingList}></Calendar>
                        <div className={css.informations}>

                            <h2>Bookings du {dateSelected.format('L')} :</h2>
                            {bookingList.map((booking) => {
                                const start = booking.start_time.slice(0, -1);
                                const end = booking.end_time.slice(0, -1)

                                if (dateSelected.isBetween(start, end, "day", '[]') || dateSelected.isSame(start, "day")) {
                                    var formatedStart = moment(start);
                                    var formatedEnd = moment(end);

                                    return (
                                        <div className={css.booking}>
                                            <h3 className={css.bookingTitle}>Booking {booking.booking_reference}</h3>
                                            <div className={css.infoContainer}>
                                                <div className={css.bookingInfos}>
                                                    <span><b>Début:</b></span>
                                                    <span><b>Fin:</b></span>
                                                    <span><b>Adresse:</b></span>
                                                </div>
                                                <div className={css.bookingInfos}>

                                                    <span>{formatedStart.format("LLLL")}</span>
                                                    <span>{formatedEnd.format("LLLL")}</span>
                                                    <span>{booking.address}</span>
                                                </div>
                                            </div>

                                        </div>


                                    )
                                }
                            })}
                        </div>
                    </div>

                </LayoutWrapperMain>

                <LayoutWrapperFooter>
                    <Footer />
                </LayoutWrapperFooter>
            </LayoutSingleColumn>
        </StaticPage >
    );


};

export default CalendarPage;
