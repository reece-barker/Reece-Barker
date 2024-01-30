// File#: _1_newsletter-input
// Usage: codyhouse.co/license
(function() {
  var NewsInput = function(opts) {
    this.options = Util.extend(NewsInput.defaults, opts);
    this.element = this.options.element;
    this.input = this.element.getElementsByClassName('js-news-form__input');
    this.button = this.element.getElementsByClassName('js-news-form__btn');
    this.submitting = false;
    initNewsInput(this);
  };

  function initNewsInput(element) {
    if(element.input.length < 1 || element.input.button < 1) return;
    // check email value
    element.input[0].addEventListener('input', function(event){
      // hide success/error messages
      Util.removeClass(element.element, 'news-form--success news-form--error');
      // enable/disable form
      checkEmailFormat(element);
    });

    // animate newsletter when submitting form 
    element.element.addEventListener('submit', function(event){
      event.preventDefault();
      if(element.submitting) return;
      element.submitting = true;
      element.response = false;
      
      // start button animation
      Util.addClass(element.element, 'news-form--loading news-form--circle-loop');
      // at the end of each animation cicle, restart animation if there was no response from the submit function yet
      element.element.addEventListener('animationend', function cb(event){
        if(element.response) { // complete button animation
          element.element.removeEventListener('animationend', cb);
          showResponseMessage(element, element.response);
        } else { // keep loading animation going
          Util.removeClass(element.element, 'news-form--circle-loop');
          element.element.offsetWidth;
          Util.addClass(element.element, 'news-form--circle-loop');
        }
      });
      
      // custom submit function
      element.options.submit(element.input[0].value, function(response){
        element.response = response;
        element.submitting = false;
        if(!animationSupported) showResponseMessage(element, response);
      });
    });
  };

  function showResponseMessage(element, response) {
    Util.removeClass(element.element, 'news-form--loading news-form--circle-loop');
    (response == 'success')
      ? Util.addClass(element.element, 'news-form--success')
      : Util.addClass(element.element, 'news-form--error');
  };

  function checkEmailFormat(element) {
    var email = element.input[0].value;
    var atPosition = email.indexOf("@"),
      dotPosition = email.lastIndexOf("."); 
    var enableForm = (atPosition >= 1 && dotPosition >= atPosition + 2 && dotPosition < email.length - 1);
    if(enableForm) {
      Util.addClass(element.element, 'news-form--enabled');
      element.button[0].removeAttribute('disabled');
    } else {
      Util.removeClass(element.element, 'news-form--enabled');
      element.button[0].setAttribute('disabled', true);
    }
  };

  window.NewsInput = NewsInput;

  NewsInput.defaults = {
    element : '',
    submit: false, // function used to return results
  };

  var animationSupported = Util.cssSupports('animation', 'name');
}());