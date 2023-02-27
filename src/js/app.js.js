import {settings, select, classNames} from './settings.js'
import Product from './components/product.js'
import Cart from './components/Cart.js'
import Booking from './components/Booking.js'

  const app = {   
    initPages: function(){
      const thisApp = this

      thisApp.pages = document.querySelector(select.containerOf.pages).children
      thisApp.navLinks = document.querySelector(select.nav.links)

      const idFromHash = window.location.hash.replace('#/', '')
     // console.log('idFromHash', idFromHash)

      let pageMatchinHash = thisApp.pages[0].id

      for( let page of thisApp.pages){
        if(page.id == idFromHash)
        pageMatchinHash = page.id
        break
      }

      thisApp.activatePage(pageMatchinHash)

      for( let link of thisApp.navLinks){
        link.addEventLstener('click', function(event){
          const clickedElement = this
          event.preventDefault()

          /* get page Id from href */
          const id = clickedElement.getAttribute('href').replace('#', '')

          /* run thisApp activatePage with that id */
          thisApp.activatePage(id)

          /* change url hash */
          window.location.hash = '#/' + id
        })
      }
    },
    activatePage: function(pageId){
      const thisApp = this

      /* add class 'active' to matching pages, remove from non-matching */
      for( let page of thisApp.pages){        
          page.classList.toggle(classNames.pages.active, page.id == pageId)           
      }

      /* add class 'active' to matching links, remove from non-matching */
      for( let link of thisApp.navLinks){       
          link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId)            
      }
    },

    initMenu: function(){
      const thisApp = this;
      // console.log('thisApp.data:', thisApp.data);
      
      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },
    
    initData: function(){
      const thisApp = this;
      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;
    

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          /* save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;
          /* execute initMenu method */
          thisApp.initMenu();
        });

      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

      thisApp.productList = document.querySelector(select.containerOf.menu)

      thisApp.productList.addEventLstener('add-to-cart', function(){
        app.cart.add(event.detail.Product);
      })
    },

    initBooking: function(){
      const thisApp = this

      thisApp.bookingWidget = document.querySelector(select.containerOf.booking)
      new Booking(thisApp.bookingWidget)
    },

    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      //  console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);
      
      thisApp.initData();
      thisApp.initCart();
      thisApp.initPages();
      thisApp.initBooking()
    },

    
  };

  app.init();