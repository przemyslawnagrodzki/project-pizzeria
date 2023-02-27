import {select} from '../settings.js'
import AmountWidget from './AmountWidget.js'

export default Booking

class Booking {
    constructor(){
        thisBooking = this

        thisBooking.element = element
        thisBooking.render()
        thisBooking.initWidgets()
    }

    render(element){
        thisBooking = this

       generatedHTML = templates.bookingWidget()
       thisBooking.dom = {} 
       thisBooking.dom.wrapper = element
        thisBooking.dom.wrapper.innerHTML = generatedHTML

        dom.peopleAmount = document.querySelector(select.booking.peopleAmount)
        dom.hoursAmount = document.querySelector(select.booking.hoursAmount)
    }

    initWidgets(){
        const thisApp = this

        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.dom.peopleAmount.addEventListener()

        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.dom.hoursAmount.addEventListener()
    }
}