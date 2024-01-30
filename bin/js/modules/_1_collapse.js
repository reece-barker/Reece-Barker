// File#: _1_collapse
// Usage: codyhouse.co/license
(function() {
  var Collapse = function(element) {
    this.element = element;
    this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
    this.animate = this.element.getAttribute('data-collapse-animate') == 'on';
    this.animating = false;
    initCollapse(this);
  };

  function initCollapse(element) {
    if ( element.triggers ) {
      // set initial 'aria-expanded' attribute for trigger elements
      updateTriggers(element, !Util.hasClass(element.element, 'is-hidden'));

      // detect click on trigger elements
			for(var i = 0; i < element.triggers.length; i++) {
				element.triggers[i].addEventListener('click', function(event) {
					event.preventDefault();
					toggleVisibility(element);
				});
			}
    }
    
    // custom event
    element.element.addEventListener('collapseToggle', function(event){
      toggleVisibility(element);
    });
  };

  function toggleVisibility(element) {
    var bool = Util.hasClass(element.element, 'is-hidden');
    if(element.animating) return;
    element.animating = true;
    animateElement(element, bool);
    updateTriggers(element, bool);
  };

  function animateElement(element, bool) {
    // bool === true -> show content
    if(!element.animate || !window.requestAnimationFrame) {
      Util.toggleClass(element.element, 'is-hidden', !bool);
      element.animating = false;
      return;
    }

    // animate content height
    Util.removeClass(element.element, 'is-hidden');
    var initHeight = !bool ? element.element.offsetHeight: 0,
      finalHeight = !bool ? 0 : element.element.offsetHeight;

    Util.addClass(element.element, 'overflow-hidden');
    
    Util.setHeight(initHeight, finalHeight, element.element, 200, function(){
      if(!bool) Util.addClass(element.element, 'is-hidden');
      element.element.removeAttribute("style");
      Util.removeClass(element.element, 'overflow-hidden');
      element.animating = false;
    }, 'easeInOutQuad');
  };

  function updateTriggers(element, bool) {
    for(var i = 0; i < element.triggers.length; i++) {
      bool ? element.triggers[i].setAttribute('aria-expanded', 'true') : element.triggers[i].removeAttribute('aria-expanded');
    };
  };

  window.Collapse = Collapse;

  //initialize the Collapse objects
	var collapses = document.getElementsByClassName('js-collapse');
	if( collapses.length > 0 ) {
    for( var i = 0; i < collapses.length; i++) {
      new Collapse(collapses[i]);
    }
  }
}());