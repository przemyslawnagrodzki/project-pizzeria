import { templates } from '../settings.js';

class MainPage {
    constructor(element) {
        const thisMainPage = this

        thisMainPage.render(element)
        thisMainPage.initWidgets()
    }

    render(element){
    const thisMainPage = this

    const generatedHTML = templates.mainPage(element);

    thisMainPage.dom = {};

    thisMainPage.dom.wrapper = element;

    thisMainPage.dom.wrapper.innerHTML = generatedHTML;

  }

  initWidgets(){
    const thisMainPage = this;
  }
}

export default MainPage