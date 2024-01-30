// File#: _1_product-tour
// Usage: codyhouse.co/license
(function() {
  var PTour = function(element, bool) {
    this.element = element;
    this.pin = this.element.getElementsByClassName('js-p-tour__pin');
    this.bg = this.element.getElementsByClassName('js-p-tour__background');
    this.steps = this.element.getElementsByClassName('js-p-tour__step');
    this.targets = [];
    this.targetPositions = [];
    this.showPTour = bool;
    this.visibleStep = 0;
    this.isMobile = false;
    this.resizingId = false;
    this.stepTimeout = false;
    // trigger of the entire tour
    this.tourTriggers = document.getElementsByClassName('js-p-tour-start');
    initPTour(this);
  };

  // public methods
  PTour.prototype.show = function() {
    updateLayout(this);
    resetTour(this);
		showTour(this);
	};

  PTour.prototype.hide = function() {
		closeTour(this);
	};

  // private methods
  function initPTour(element) {
    // define position functions
    setPositionFn(element);

    // collect all targets
    collectTargets(element);

    // set layout type
    updateLayout(element);

    // detect click on tour element
    element.element.addEventListener('click', function(event) {
      // check if we need to close tour
      var closeBtn = event.target.closest('.js-p-tour__close');
      if(closeBtn) closeTour(element);

      // check if this was a next/prev button
      var nextStep = event.target.closest('.js-p-tour__btn-next');
      if(nextStep) updateSteps(element, 'next');
      var prevStep = event.target.closest('.js-p-tour__btn-prev');
      if(prevStep) updateSteps(element, 'prev');
    });

    // toggle tour visibility
    element.showPTour ? showTour(element) : closeTour(element);

    // on resize -> update layout type
    window.addEventListener('resize', function(event){
      clearTimeout(element.resizingId);
      element.resizingId = setTimeout(function(){
        updateLayout(element);
        if(!element.mobile) showSelectedStep(element);
      }, 200);
    });

    // start tour using a trigger button
    if(element.tourTriggers.length > 0) {
      for(var i = 0; i < element.tourTriggers.length; i++) {
        element.tourTriggers[i].addEventListener('click', function(event) {
          updateLayout(element);
          resetTour(element);
		      showTour(element);
        });
      }
    }

    // add loaded class
    Util.addClass(element.element, 'p-tour--loaded');
  };

  function setPositionFn(element) {
    element['tooltipBottom'] = tooltipBottom;
    element['tooltipTop'] = tooltipTop;
    element['tooltipLeft'] = tooltipLeft;
    element['tooltipRight'] = tooltipRight;
    element['tooltipBottomLeft'] = tooltipBottomLeft;
    element['tooltipBottomRight'] = tooltipBottomRight;
    element['tooltipTopLeft'] = tooltipTopLeft;
    element['tooltipTopRight'] = tooltipTopRight;
  };

  function collectTargets(element) {
    for(var i = 0; i < element.steps.length; i++) {
      element.targets.push(document.querySelector('[data-p-tour-target="'+(i + 1)+'"]'));
      element.targetPositions.push(element.targets[i].getAttribute('data-p-tour-position') || 'center');
    };
  };

  function showTour(element) {
    Util.removeClass(element.element, 'p-tour--is-hidden');
    // reveal step
    showSelectedStep(element);
    // show background
    animateBg(element);
  };

  function closeTour(element) {
    Util.addClass(element.element, 'p-tour--is-hidden');
    element.element.addEventListener('transitionend', function cb(){
      element.visibleStep = 0;
      element.element.removeEventListener('transitionend', cb);
      updateLayout(element);
      resetTour(element);
    });
  };

  function updateSteps(element, direction) {
    // clear timeout
    if(element.stepTimeout) {
      clearTimeout(element.stepTimeout);
      element.stepTimeout = false;
    }
    var newIndex = direction == 'next' ? element.visibleStep + 1 : element.visibleStep - 1;
    if(newIndex < 0) newIndex = element.steps.length - 1;
    if(newIndex >= element.steps.length) newIndex = 0;
    // reset bg class
    Util.removeClass(element.bg[0], 'p-tour__background--animate');
    // hide old step
    hideStep(element, direction, function(){
      // update index
      element.visibleStep = newIndex;
      // show new step
      showSelectedStep(element, direction);
      // trigger bg animation
      animateBg(element);
    });
  };

  function hideStep(element, direction, cb) {
    Util.removeClass(element.steps[element.visibleStep], 'p-tour__step--current');
    if(element.isMobile) {
      // small screen animation
      var isNext = (direction == 'next');
      Util.toggleClass(element.steps[element.visibleStep], 'p-tour__step--m-right', !isNext);
      Util.toggleClass(element.steps[element.visibleStep], 'p-tour__step--m-left', isNext);
    } else {
      Util.addClass(element.pin[0], 'p-tour__pin--out');
    }
    if(element.isMobile) cb();
    else {
      element.stepTimeout = setTimeout(cb, 300);
    }
  };

  function showSelectedStep(element, direction) {
    // get pin position
    var position = getPinPosition(element); // position = [top, left]
    // update pin position
    setPosition(element.pin[0], position);
    // show pin
    Util.removeClass(element.pin[0], 'p-tour__pin--out');
    // get class position of new step (e.g., p-tour__step--right)
    var classPosition = setTooltipPosition(element, position); 
    // remove all position classes
    Util.removeClass(element.steps[element.visibleStep], 'p-tour__step--top p-tour__step--bottom p-tour__step--left p-tour__step--right p-tour__step--bottom-right p-tour__step--bottom-left p-tour__step--top-right p-tour__step--top-left');
    if(element.isMobile) {
      Util.addClass(element.steps[element.visibleStep], 'p-tour__step--current');
    } else {
      Util.addClass(element.steps[element.visibleStep], 'p-tour__step--current '+classPosition);
    }
    
    if(direction) {
      // mobile animation
      Util.removeClass(element.steps[element.visibleStep], 'p-tour__step--m-left p-tour__step--m-right');
    }
    // move focus to first action button
    var btnAction = element.steps[element.visibleStep].querySelector('button');
    if(btnAction) btnAction.focus();
  };

  function animateBg(element) {
    Util.addClass(element.bg[0], 'p-tour__background--animate');
  };

  function updateLayout(element) {
    var layout = getComputedStyle(element.element).getPropertyValue('--p-tour-layout').replace(/'/g, '').replace(/"/g, '').trim();
    // on resize -> check tour layout type
    element.isMobile = (layout == 'mobile');
    // init steps
    initStepsPosition(element);
  };

  function initStepsPosition(element) {
    if(!element.isMobile) {
      for(var i = 0; i < element.steps.length; i++) Util.removeClass(element.steps[i], 'p-tour__step--m-left p-tour__step--m-right');
    } else {
      for(var i = 0; i < element.steps.length; i++) {
        element.steps[i].style.top = '';
        element.steps[i].style.left = '';
        if(i < element.visibleStep) {
          Util.addClass(element.steps[i], 'p-tour__step--m-left');
          Util.removeClass(element.steps[i], 'p-tour__step--m-right');
        } else if(i > element.visibleStep) {
          Util.addClass(element.steps[i], 'p-tour__step--m-right');
          Util.removeClass(element.steps[i], 'p-tour__step--m-left');
        } else {
          Util.removeClass(element.steps[i], 'p-tour__step--m-right');
          Util.removeClass(element.steps[i], 'p-tour__step--m-left');
        }
      }
    }
  };

  function resetTour(element) {
    for(var i = 0; i < element.steps.length; i++) {
      Util.removeClass(element.steps[i], 'p-tour__step--current');
    }
    Util.removeClass(element.bg[0], 'p-tour__background--animate');
  };

  function getPinPosition(element) {
    var tourPosition = element.targetPositions[element.visibleStep],
      stepTargetPosition = element.targets[element.visibleStep].getBoundingClientRect();
    var position = [0, 0]; // [top, left]

    switch (tourPosition) {
      case 'bottom':
        position[0] = stepTargetPosition.bottom;
        position[1] = stepTargetPosition.left + stepTargetPosition.width/2;
        break;
      case 'top':
        position[0] = stepTargetPosition.top;
        position[1] = stepTargetPosition.left + stepTargetPosition.width/2;
        break;
      case 'left':
        position[0] = stepTargetPosition.top + stepTargetPosition.height/2;
        position[1] = stepTargetPosition.left;
        break;
      case 'right':
        position[0] = stepTargetPosition.top + stepTargetPosition.height/2;
        position[1] = stepTargetPosition.left + stepTargetPosition.width;
        break;
      case 'center':
        position[0] = stepTargetPosition.top + stepTargetPosition.height/2;
        position[1] = stepTargetPosition.left + stepTargetPosition.width/2;
        break;
      case 'bottom-right':
        position[0] = stepTargetPosition.top + stepTargetPosition.height;
        position[1] = stepTargetPosition.left + stepTargetPosition.width;
        break;
      case 'bottom-left':
        position[0] = stepTargetPosition.top + stepTargetPosition.height;
        position[1] = stepTargetPosition.left;
        break;
      case 'top-right':
        position[0] = stepTargetPosition.top;
        position[1] = stepTargetPosition.left + stepTargetPosition.width;
        break;
      case 'top-left':
        position[0] = stepTargetPosition.top;
        position[1] = stepTargetPosition.left;
        break;
    }
    return position;
  };

  function setPosition(element, position) {
    // position = [top, left]
    if(position[0] !== false) element.style.top = position[0]+'px';
    if(position[1] !== false) element.style.left = position[1]+'px';
  };

  function setTooltipPosition(element, position) {
    if(element.isMobile) return false;
    var layout = element.targetPositions[element.visibleStep];
    if(layout == 'center') layout == 'top';
    var tooltipInfo = getTooltipInfo(element, layout, position);
    setPosition(element.steps[element.visibleStep], tooltipInfo[1]);
    return 'p-tour__step--'+tooltipInfo[0];
  };

  function getTooltipInfo(element, layout, position) {
    switch (layout) {
      case 'bottom':
      case 'center':
        var result = checkPosition(element, 'tooltipBottom', 'tooltipTop', 'tooltipLeft', 'tooltipRight', 'tooltipBottomLeft', 'tooltipBottomRight', 'tooltipTopLeft', 'tooltipTopRight', position);
        break;
      case 'top':
        var result = checkPosition(element, 'tooltipTop', 'tooltipBottom', 'tooltipLeft', 'tooltipRight', 'tooltipBottomLeft', 'tooltipBottomRight', 'tooltipTopLeft', 'tooltipTopRight', position);
        break;
      case 'left':
      case 'bottom-left':
      case 'top-left':
        var result = checkPosition(element, 'tooltipLeft', 'tooltipTop', 'tooltipBottom', 'tooltipRight', 'tooltipBottomLeft', 'tooltipBottomRight', 'tooltipTopLeft', 'tooltipTopRight', position);
        break;
      case 'right':
      case 'bottom-right':
      case 'top-right':
        var result = checkPosition(element, 'tooltipRight', 'tooltipLeft', 'tooltipTop', 'tooltipBottom', 'tooltipBottomLeft', 'tooltipBottomRight', 'tooltipTopLeft', 'tooltipTopRight', position);
        break;
    }
    return [result[1], result[0]];
  };

  function checkPosition(element, pos1, pos2, pos3, pos4, pos5, pos6, pos7, pos8, position) {
    var result = element[pos1](element, position);
    if(result[0]) return [result[1], result[2]];
    result = element[pos2](element, position);
    if(result[0]) return [result[1], result[2]];
    result = element[pos3](element, position);
    if(result[0]) return [result[1], result[2]];
    result = element[pos4](element, position);
    if(result[0]) return [result[1], result[2]];
    result = element[pos5](element, position);
    if(result[0]) return [result[1], result[2]];
    result = element[pos6](element, position);
    if(result[0]) return [result[1], result[2]];
    result = element[pos7](element, position);
    if(result[0]) return [result[1], result[2]];
    result = element[pos8](element, position);
    if(result[0]) return [result[1], result[2]];
    return [[position[0], position[1] - element.steps[element.visibleStep].getBoundingClientRect().width], 'bottom'];
  };

  function tooltipBottom(element, position) {
    // check if tooltip can be placed below the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if(tooltipBox.height + position[0] > window.innerHeight && position[0] > tooltipBox.height) {
      return [false, false, false]; 
    }
    if(position[1] - tooltipBox.width/2 < 0 && position[1] + tooltipBox.width < window.innerWidth) {
      return [false, false, false]; 
    }

    if(position[1] + tooltipBox.width > window.innerWidth && position[1] - tooltipBox.width > 0) {
      return [false, false, false]; 
    }
    return [true, [position[0], position[1] - tooltipBox.width/2], 'bottom'];
  };

  function tooltipTop(element, position) {
    // check if tooltip can be placed on top of the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if( position[0] < tooltipBox.height && position[0] + tooltipBox.height < window.innerHeight) {
      return [false, false, false]; 
    }
    if(position[1] - tooltipBox.width/2 < 0 && position[1] + tooltipBox.width < window.innerWidth) {
      return [false, false, false]; 
    }
    
    if(position[1] + tooltipBox.width/2 > window.innerWidth && position[1] - tooltipBox.width > 0) {
      return [false, false, false]; 
    }
    return [true, [position[0] - tooltipBox.height, position[1] - tooltipBox.width/2], 'top'];
  };

  function tooltipLeft(element, position) {
    // check if tooltip can be placed to the left of the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if(position[1] < tooltipBox.width && position[1] + tooltipBox.width < window.innerWidth) return [false, false, false];
    if(position[0] < tooltipBox.height/2 && position[0] + tooltipBox.height < window.innerHeight) return [false, false, false];
    if(position[0] + tooltipBox.height/2 >  window.innerHeight && position[0] > tooltipBox.height) return [false, false, false];
    return [true, [position[0] - tooltipBox.height/2, position[1] - tooltipBox.width], 'left'];
  };

  function tooltipRight(element, position) {
    // check if tooltip can be placed to the right of the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if(position[1] + tooltipBox.width > window.innerWidth && position[1] > tooltipBox.width) return [false, false, false];
    if(position[0] < tooltipBox.height/2 && position[0] + tooltipBox.height < window.innerHeight) return [false, false, false];
    if(position[0] + tooltipBox.height/2 >  window.innerHeight && position[0] > tooltipBox.height) return [false, false, false];
    return [true, [position[0] - tooltipBox.height/2, position[1]], 'right'];
  };

  function tooltipBottomLeft(element, position) {
    // check if tooltip can be placed to the bottom-left of the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if(position[1] < tooltipBox.width && position[1] + tooltipBox.width < window.innerWidth) return [false, false, false];
    if(position[0] + tooltipBox.height > window.innerHeight && position[0] > tooltipBox.height) return [false, false, false];
    return [true, [position[0], position[1] - tooltipBox.width], 'bottom-left'];
  };

  function tooltipTopLeft(element, position) {
    // check if tooltip can be placed to the top-left of the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if(position[1] < tooltipBox.width && position[1] + tooltipBox.width < window.innerWidth) return [false, false, false];
    if(position[0] < tooltipBox.height && position[0] + tooltipBox.height < window.innerHeight) return [false, false, false];
    return [true, [position[0] - tooltipBox.height, position[1] - tooltipBox.width], 'top-left'];
  };

  function tooltipBottomRight(element, position) {
    // check if tooltip can be placed to the bottom-right of the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if(position[1] + tooltipBox.width > window.innerWidth && position[1] > tooltipBox.width) return [false, false, false];
    if(position[0] + tooltipBox.height > window.innerHeight && position[0] > tooltipBox.height) return [false, false, false];
    return [true, [position[0], position[1]], 'bottom-right'];
  };

  function tooltipTopRight(element, position) {
    // check if tooltip can be placed to the top-right of the pin
    var tooltipBox = element.steps[element.visibleStep].getBoundingClientRect();
    if(position[1] + tooltipBox.width > window.innerWidth && position[1] > tooltipBox.width) return [false, false, false];
    if(position[0] < tooltipBox.height && position[0] + tooltipBox.height < window.innerHeight) return [false, false, false];
    return [true, [position[0] - tooltipBox.height, position[1]], 'top-right'];
  };

  window.PTour = PTour;

  //initialize the PTour objects
	var pTour = document.getElementsByClassName('js-p-tour');
	if( pTour.length > 0 ) {
		for( var i = 0; i < pTour.length; i++) {
			(function(i){new PTour(pTour[i], true);})(i);
		}
	};
}());