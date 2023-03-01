import {select, templates, settings } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.element = element;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData()
  }

  getData(){
    const thisBooking = this

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate)
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate)

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ]
    }

   // console.log('getData params', params)

    const urls ={
      booking:                    settings.db.url + '/' + settings.db.bookings
                                   + '?' + params.bookings.join('&'),
      
      eventsCurrent:              settings.db.url + '/' + settings.db.events
                                   + '?' + params.events.join('&'),
    
      eventsRepeat:               settings.db.url + '/' + settings.db.events
                                   + '?' + params.events.join('&')
                                 
    }

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingResponse = allResponses(0);
        const eventsCurrentResponse = allResponses(1);
        const eventsRepeatResponse = allResponses(2);
        return Promise.all([
          bookingResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json()
        ])
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        
      })

  }

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {}; 
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = document.querySelector(select.widgets.datePicker.wrapper)
    thisBooking.dom.hourPicker = document.querySelector(select.widgets.hourPicker.wrapper)
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerWidget = new AmountWidget(thisBooking.dom.datePicker)
    thisBooking.hourPickerWidget = new AmountWidget(thisBooking.dom.hourPicker)
  }
}

export default Booking;
