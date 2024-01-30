// File#: _2_grid-switch
// Usage: codyhouse.co/license
(function() {
  var GridSwitch = function(element) {
    this.element = element;
    this.controller = this.element.getElementsByClassName('js-grid-switch__controller')[0];
    this.items = this.element.getElementsByClassName('js-grid-switch__item');
    this.contentElements = this.element.getElementsByClassName('js-grid-switch__content');
    // store custom classes
    this.classList = [[this.element.getAttribute('data-gs-item-class-1'), this.element.getAttribute('data-gs-content-class-1')], [this.element.getAttribute('data-gs-item-class-2'), this.element.getAttribute('data-gs-content-class-2')]];
    initGridSwitch(this);
  };

  function initGridSwitch(element) {
    // get selected state and apply style
    var selectedInput = element.controller.querySelector('input:checked');
    if(selectedInput) {
      setGridAppearance(element, selectedInput.value);
    }
    // reveal grid
    Util.addClass(element.element, 'grid-switch--is-visible');
    // a new layout has been selected 
    element.controller.addEventListener('change', function(event) {
      setGridAppearance(element, event.target.value);
    });
  };

  function setGridAppearance(element, value) {
    var newStatus = parseInt(value) - 1,
      oldStatus = newStatus == 1 ? 0 : 1;
      
    for(var i = 0; i < element.items.length; i++) {
      Util.removeClass(element.items[i], element.classList[oldStatus][0]);
      Util.removeClass(element.contentElements[i], element.classList[oldStatus][1]);
      Util.addClass(element.items[i], element.classList[newStatus][0]);
      Util.addClass(element.contentElements[i], element.classList[newStatus][1]);
    }
  };

  //initialize the GridSwitch objects
	var gridSwitch = document.getElementsByClassName('js-grid-switch');
	if( gridSwitch.length > 0 ) {
		for( var i = 0; i < gridSwitch.length; i++) {
			(function(i){new GridSwitch(gridSwitch[i]);})(i);
    }
  }
}());