import {select, templates, settings, classNames } from '../settings.js';
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
    thisBooking.chooseTable()
  }

  getData(){
    const thisBooking = this

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate)
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate)

    const params = {
      bookings: [
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
      bookings:                    settings.db.url + '/' + settings.db.bookings
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
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat)
      })
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this

    thisBooking.booked = {}

    for(let item of bookings){
      thisBooking.makeBooked(utils.dateToStr(loopDate), item.date, item.hour, item.duration, item.table)
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
    }

    const minDate = thisBooking.datePicker.minDate
    const maxDate = thisBooking.datePicker.maxDate

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1))
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table)
    }}

    thisBooking.updateDOM()
  }

    thisBooking.makeBooked(date, hour, duration, table){
      const thisBooking = this

      if(typeof thisBooking.booked[date] == 'undefined'){
        thisBooking.booked[date] = {}
      }

      const startHour =  utils.hourToNumber(hour)

      for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
        if(typeof thisBooking.booked[date][startHour] == 'undefined'){
          thisBooking.booked[date][startHour] = []
        }

      thisBooking.booked[date][hourBlock].push(table)
      }
    }

    updateDOM(){
      const thisBooking = this

      thisBooking.date = thisBooking.datePicker.value
      thisBooking.hour  = utils.hourToNumber(thisBooking.hourPicker.value)

      let allAvaliable = false

      if(
        typeof thisBooking.booked[thisBooking.date] == 'undefined'
        || 
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
      ){
        allAvaliable = true
      }

      for(let table of thisBooking.dom.tables){
        let tableId = table.getAttribute(settings.booking.tableIdAttribute)
        if(!isNaN(tableId)){
          tableId = parseInt(tableId)
        }

        if(
          !allAvaliable
          &&
          thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId > -1)
        ){
          table.classList.add(classNames.booking.tableBooked)
        } else {
          table.classList.remove(classNames.booking.tableBooked)
        }
      }
    }

    chooseTable(event){
      const thisBooking = this

      const clickedElement = event.target
      event.preventDefault()

      const tableId = clickedElement.getAttribute(settings.booking.tableIdAttribute)

      if(tableId){
        if(clickedElement.contains(classNames.booking.tableBooked)){
          alert('stolik zajęty!')
        }
        else {
          if(clickedElement.classList.contains(classNames.chosenTable)){
          clickedElement.classList.remove('chosenTable')
          }
          else{
            thisBooking.table.classList.remove('chosenTable')
            clickedElement.classList.add('chosenTable')
          }
          thisBooking.chosenTable = tableId
        }
      }
      if(thisBooking.updateDOM){
        thisBooking.table.classList.remove('chosenTable')
      }


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

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables)
  
    thisBooking.dom.tablesWarapper = thisBooking.dom.wrapper.querySelector(select.booking.allTables)
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerWidget = new AmountWidget(thisBooking.dom.datePicker)
    thisBooking.hourPickerWidget = new AmountWidget(thisBooking.dom.hourPicker)
    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM

    thisBooking.dom.wrapper.addEventListener('click', function(event){
      event.preventDefault()
      chooseTable(event)
    })
    })
  }
}

export default Booking;
