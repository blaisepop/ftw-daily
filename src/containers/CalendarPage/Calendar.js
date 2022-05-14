import React, { useState, useEffect } from "react"
import moment from 'moment';
import css from './Calendar.module.css';
import { text } from "body-parser";
import localization from 'moment/locale/fr';
export default function Calendar(props) {
    moment.locale('fr', localization)
    const [calendar, setCalendar] = useState([]);
    const [value, setValue] = useState(props.value);
    
    const startDay = value.clone().startOf("month").startOf("week");
    const endDay = value.clone().endOf("month").endOf("week");


    useEffect(() => {
        const day = startDay.clone().subtract(1, "day");
        const a = []
        while (day.isBefore(endDay, "day")) {
            a.push(
                Array(7).fill(0).map(() => day.add(1, "day").clone())
            )
        }
        setCalendar(a);
    }, [value])

    function isSelected(day) {
        return value.isSame(day, "day");
    }

    function beforeToday(day) {


        return day.isBefore(new Date(), "day");
    }

    function isToday(day) {
        return day.isSame(new Date(), "day")
    }
    function hasBooking(day) {
        var res = false

        props.bookingList.forEach(element => {

           // if (day.isSame(element.start, "day")) res = true;
             if (day.isBetween(element.start, element.end, "day",'[]')) res = true;

        });
        return res

    }
    function dayStyles(day) {  
        if (isSelected(day)) return css.selected
        if (beforeToday(day)) return css.beforeToday
        if (isToday(day)) return css.today
        // if(hasBooking(day)) return css.booked
    }
    function currMonthame() {
        return value.format("MMMM")
    }
    function currYear() {
        return value.format("YYYY")
    }
    function prevMonth() { return value.clone().subtract(1, "month") }
    function nextMonth() { return value.clone().add(1, "month") }
    function onChangeDate(day) {
        setValue(day)
        props.onChange(day)
    }
    return (
        <div className={css.calendar}>
            <div className={css.root}>
                <div className={css.header}>
                    <div className={css.previous} onClick={() => onChangeDate(prevMonth())}>{String.fromCharCode(171)}</div>
                    <div className={css.mounthYear}><h3>{currMonthame()}  {currYear()}</h3></div>
                    <div className={css.next} onClick={() => onChangeDate(nextMonth())}>{String.fromCharCode(187)} </div>


                </div>

                <div className={css.body}>
                    <div className={css.dayNames}>
                        {["D", "L", "M", "M", "J", "V", "S"].map((d) => (<div className={css.week}><b>{d}</b></div>))}
                    </div>
                    {calendar.map((week) => (
                        <div >
                            {week.map((day) => (
                                <div className={css.day} onClick={() => onChangeDate(day)}>
                                    <div className={dayStyles(day)} Style={hasBooking(day) ? "text-decoration:underline var(--marketplaceColor) 5px;" : "text-decoration:none;"}>

                                        {day.format("D").toString()}
                                    </div>
                                </div>
                            ))
                            }
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}