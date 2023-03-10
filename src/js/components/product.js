import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data){
    const thisProduct = this;
    
    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    //   console.log('new Product', thisProduct);
    
  }
  renderInMenu(){
    const thisProduct = this;
    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    // console.log(generatedHTML)
    /* Create element using utilis.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* Find container of menu */
    const menuContainer = document.querySelector(select.containerOf.menu);
    // console.log(menuContainer)
    /* add element to menu container */ 
    menuContainer.appendChild(thisProduct.element);
  }
  getElements(){
    const thisProduct = this;
  
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    
  }
  initAccordion(){
    const thisProduct = this;

    //  console.log(clickableTrigger)
    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();  
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);  
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if(activeProduct && activeProduct != thisProduct.element) {
        activeProduct.classList.remove('active');
      } 
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');
    });
  }
  initOrderForm(){
    const thisProduct = this;
    //  console.log(this.initOrderForm)
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
    
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
    
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.addToCart();
      thisProduct.processOrder();
    });
  }
  processOrder(){
    const thisProduct = this;
    //  console.log(this.processOrder)
    
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData', formData);

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      // console.log(paramId, param);

      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        // console.log(optionId, option);
        // check if there is param with a name of paramId in formData and if it includes optionId
        if(formData[paramId] && formData[paramId].includes(optionId)) {
          // Check if the option is not default //
          if(!option.default == true) {

            // Add option price to price variable //
            price = price += option.price;
          }
          // Check if the the option is default //
          else if(option.default == true){
            // reduce price variable //
            price = price -= option.price;  
          }
        }
        // Look for the image suitable for category and option //
        const suitableImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        //  console.log(suitableImage)
        // Add active class if the option is chosen //
        if(suitableImage){
          if(formData[paramId] && formData[paramId].includes(optionId)){
            suitableImage.classList.add(classNames.menuProduct.imageVisible);
          }
          // Remove active class if the opton is not chosen //
          else {
            suitableImage.classList.remove(classNames.menuProduct.imageVisible);
          }       
        }
      }
    }
    /* Multiply price by amount*/
    price *= thisProduct.amountWidget.value;  
  
    // update calculated price in the HTML
    thisProduct.priceSingle = price;
    thisProduct.priceElem.innerHTML = price;

  }
  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function() {
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;
  
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct()
      }
    });
  
    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct(){
    const thisProduct = this;
    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle*thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams()
    };
    return productSummary;
  }
  prepareCartProductParams(){

    const thisProduct = this;
    //  console.log(this.processOrder)
      
    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData', formData);
    const params = {};

    // for every category (param)...
    for(let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      params[paramId] = {
        label: param.label,
        options: {}
      };
      // console.log(paramId, param);
  
      // for every option in this category
      for(let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        // console.log(optionId, option);
        // check if there is param with a name of paramId in formData and if it includes optionId
        if(formData[paramId] && formData[paramId].includes(optionId)) { 
          params[paramId].options[optionId] = option.label;
        }
      }
    }
    return params;
  } 
      
}

export default Product;