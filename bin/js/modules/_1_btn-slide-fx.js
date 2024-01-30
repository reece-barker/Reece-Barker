// File#: _1_btn-slide-fx
// Usage: codyhouse.co/license
(function() {
  var BtnSlideFx = function(element) {
		this.element = element;
    this.hover = false; 
		btnSlideFxEvents(this);
	};

  function btnSlideFxEvents(btn) {
    btn.element.addEventListener('mouseenter', function(event){ // detect mouse hover
      btn.hover = true;
      triggerBtnSlideFxAnimation(btn.element, 'from');
    });
    btn.element.addEventListener('mouseleave', function(event){ // detect mouse leave
      btn.hover = false;
      triggerBtnSlideFxAnimation(btn.element, 'to');
    });
    btn.element.addEventListener('transitionend', function(event){ // reset btn classes at the end of enter/leave animation
      resetBtnSlideFxAnimation(btn.element);
    });
  };

  function getEnterDirection(element, event) { // return mouse movement direction
    var deltaLeft = Math.abs(element.getBoundingClientRect().left - event.clientX),
      deltaRight = Math.abs(element.getBoundingClientRect().right - event.clientX),
      deltaTop = Math.abs(element.getBoundingClientRect().top - event.clientY),
      deltaBottom = Math.abs(element.getBoundingClientRect().bottom - event.clientY);
    var deltaXDir = (deltaLeft < deltaRight) ? 'left' : 'right',
      deltaX = (deltaLeft < deltaRight) ? deltaLeft : deltaRight,
      deltaYDir = (deltaTop < deltaBottom) ? 'top' : 'bottom',
      deltaY = (deltaTop < deltaBottom) ? deltaTop : deltaBottom;
    return (deltaX < deltaY) ? deltaXDir : deltaYDir;
  };
  
  function triggerBtnSlideFxAnimation(element, direction) { // trigger animation -> apply in/out and direction classes
    var inStep = (direction == 'from') ? '-out' : '',
      outStep = (direction == 'from') ? '' : '-out';
    Util.removeClass(element, 'btn-slide-fx-hover'+inStep);
    resetBtnSlideFxAnimation(element);
    Util.addClass(element, 'btn--slide-fx-'+direction+'-'+getEnterDirection(element, event)); // set direction 
    setTimeout(function(){Util.addClass(element, 'btn-slide-fx-animate');}, 5); // add transition
    setTimeout(function(){Util.addClass(element, 'btn-slide-fx-hover'+outStep);}, 10); // trigger transition
  };

  function resetBtnSlideFxAnimation(element) { // remove animation classes
    Util.removeClass(element, 'btn--slide-fx-from-left btn--slide-fx-from-right btn--slide-fx-from-bottom btn--slide-fx-from-top btn--slide-fx-to-left btn--slide-fx-to-right btn--slide-fx-to-bottom btn--slide-fx-to-top btn-slide-fx-animate');
  };

	//initialize the BtnSlideFx objects
	var btnSlideFx = document.getElementsByClassName('js-btn--slide-fx');
	if( btnSlideFx.length > 0 ) {
		for( var i = 0; i < btnSlideFx.length; i++) {
      (function(i){new BtnSlideFx(btnSlideFx[i]);})(i);
		}
  }
}());