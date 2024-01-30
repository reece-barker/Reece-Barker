// File#: _1_scrolling-animations
// Usage: codyhouse.co/license
(function () {
  var ScrollFx = function (element, scrollableSelector) {
    this.element = element;
    this.options = [];
    this.boundingRect = this.element.getBoundingClientRect();
    this.windowHeight = window.innerHeight;
    this.scrollingFx = [];
    this.animating = [];
    this.deltaScrolling = [];
    this.observer = [];
    this.scrollableSelector = scrollableSelector; // if the scrollable element is not the window 
    this.scrollableElement = false;
    initScrollFx(this);
    // ToDo - option to pass two selectors to target the element start and stop animation scrolling values -> to be used for sticky/fixed elements
  };

  function initScrollFx(element) {
    // do not animate if reduced motion is on
    if (Util.osHasReducedMotion()) return;
    // get scrollable element
    setScrollableElement(element);
    // get animation params
    var animation = element.element.getAttribute('data-scroll-fx');
    if (animation) {
      element.options.push(extractAnimation(animation));
    } else {
      getAnimations(element, 1);
    }
    // set Intersection Observer
    initObserver(element);
    // update params on resize
    initResize(element);
  };

  function setScrollableElement(element) {
    if (element.scrollableSelector) element.scrollableElement = document.querySelector(element.scrollableSelector);
  };

  function initObserver(element) {
    for (var i = 0; i < element.options.length; i++) {
      (function (i) {
        element.scrollingFx[i] = false;
        element.deltaScrolling[i] = getDeltaScrolling(element, i);
        element.animating[i] = false;

        element.observer[i] = new IntersectionObserver(
          function (entries, observer) {
            scrollFxCallback(element, i, entries, observer);
          },
          {
            rootMargin: (element.options[i][5] - 100) + "% 0px " + (0 - element.options[i][4]) + "% 0px"
          }
        );

        element.observer[i].observe(element.element);

        // set initial value
        animateScrollFx.bind(element, i)();
      })(i);
    }
  };

  function scrollFxCallback(element, index, entries, observer) {
    if (entries[0].isIntersecting) {
      if (element.scrollingFx[index]) return; // listener for scroll event already added
      // reset delta
      resetDeltaBeforeAnim(element, index);
      triggerAnimateScrollFx(element, index);
    } else {
      if (!element.scrollingFx[index]) return; // listener for scroll event already removed
      window.removeEventListener('scroll', element.scrollingFx[index]);
      element.scrollingFx[index] = false;
    }
  };

  function triggerAnimateScrollFx(element, index) {
    element.scrollingFx[index] = animateScrollFx.bind(element, index);
    (element.scrollableElement)
      ? element.scrollableElement.addEventListener('scroll', element.scrollingFx[index])
      : window.addEventListener('scroll', element.scrollingFx[index]);
  };

  function animateScrollFx(index) {
    // if window scroll is outside the proper range -> return
    if (getScrollY(this) < this.deltaScrolling[index][0]) {
      setCSSProperty(this, index, this.options[index][1]);
      return;
    }
    if (getScrollY(this) > this.deltaScrolling[index][1]) {
      setCSSProperty(this, index, this.options[index][2]);
      return;
    }
    if (this.animating[index]) return;
    this.animating[index] = true;
    window.requestAnimationFrame(updatePropertyScroll.bind(this, index));
  };

  function updatePropertyScroll(index) { // get value
    // check if this is a theme value or a css property
    if (isNaN(this.options[index][1])) {
      // this is a theme value to update
      (getScrollY(this) >= this.deltaScrolling[index][1])
        ? setCSSProperty(this, index, this.options[index][2])
        : setCSSProperty(this, index, this.options[index][1]);
    } else {
      // this is a CSS property
      var value = this.options[index][1] + (this.options[index][2] - this.options[index][1]) * (getScrollY(this) - this.deltaScrolling[index][0]) / (this.deltaScrolling[index][1] - this.deltaScrolling[index][0]);
      // update css property
      setCSSProperty(this, index, value);
    }

    this.animating[index] = false;
  };

  function setCSSProperty(element, index, value) {
    if (isNaN(value)) {
      // this is a theme value that needs to be updated
      setThemeValue(element, value);
      return;
    }
    if (element.options[index][0] == '--scroll-fx-skew' || element.options[index][0] == '--scroll-fx-scale') {
      // set 2 different CSS properties for the transformation on both x and y axis
      element.element.style.setProperty(element.options[index][0] + '-x', value + element.options[index][3]);
      element.element.style.setProperty(element.options[index][0] + '-y', value + element.options[index][3]);
    } else {
      // set single CSS property
      element.element.style.setProperty(element.options[index][0], value + element.options[index][3]);
    }
  };

  function setThemeValue(element, value) {
    // if value is different from the theme in use -> update it
    if (element.element.getAttribute('data-theme') != value) {
      Util.addClass(element.element, 'scroll-fx--theme-transition');
      element.element.offsetWidth;
      element.element.setAttribute('data-theme', value);
      element.element.addEventListener('transitionend', function cb() {
        element.element.removeEventListener('transitionend', cb);
        Util.removeClass(element.element, 'scroll-fx--theme-transition');
      });
    }
  };

  function getAnimations(element, index) {
    var option = element.element.getAttribute('data-scroll-fx-' + index);
    if (option) {
      // multiple animations for the same element - iterate through them
      element.options.push(extractAnimation(option));
      getAnimations(element, index + 1);
    }
    return;
  };

  function extractAnimation(option) {
    var array = option.split(',').map(function (item) {
      return item.trim();
    });
    var propertyOptions = getPropertyValues(array[1], array[2]);
    var animation = [getPropertyLabel(array[0]), propertyOptions[0], propertyOptions[1], propertyOptions[2], parseInt(array[3]), parseInt(array[4])];
    return animation;
  };

  function getPropertyLabel(property) {
    var propertyCss = '--scroll-fx-';
    for (var i = 0; i < property.length; i++) {
      propertyCss = (property[i] == property[i].toUpperCase())
        ? propertyCss + '-' + property[i].toLowerCase()
        : propertyCss + property[i];
    }
    if (propertyCss == '--scroll-fx-rotate') {
      propertyCss = '--scroll-fx-rotate-z';
    } else if (propertyCss == '--scroll-fx-translate') {
      propertyCss = '--scroll-fx-translate-x';
    }
    return propertyCss;
  };

  function getPropertyValues(val1, val2) {
    var nbVal1 = parseFloat(val1),
      nbVal2 = parseFloat(val2),
      unit = val1.replace(nbVal1, '');
    if (isNaN(nbVal1)) {
      // property is a theme value
      nbVal1 = val1;
      nbVal2 = val2;
      unit = '';
    }
    return [nbVal1, nbVal2, unit];
  };

  function getDeltaScrolling(element, index) {
    // this retrieve the max and min scroll value that should trigger the animation
    var topDelta = getScrollY(element) - (element.windowHeight - (element.windowHeight + element.boundingRect.height) * element.options[index][4] / 100) + element.boundingRect.top,
      bottomDelta = getScrollY(element) - (element.windowHeight - (element.windowHeight + element.boundingRect.height) * element.options[index][5] / 100) + element.boundingRect.top;
    return [topDelta, bottomDelta];
  };

  function initResize(element) {
    var resizingId = false;
    window.addEventListener('resize', function () {
      clearTimeout(resizingId);
      resizingId = setTimeout(resetResize.bind(element), 500);
    });
    // emit custom event -> elements have been initialized
    var event = new CustomEvent('scrollFxReady');
    element.element.dispatchEvent(event);
  };

  function resetResize() {
    // on resize -> make sure to update all scrolling delta values
    this.boundingRect = this.element.getBoundingClientRect();
    this.windowHeight = window.innerHeight;
    for (var i = 0; i < this.deltaScrolling.length; i++) {
      this.deltaScrolling[i] = getDeltaScrolling(this, i);
      animateScrollFx.bind(this, i)();
    }
    // emit custom event -> elements have been resized
    var event = new CustomEvent('scrollFxResized');
    this.element.dispatchEvent(event);
  };

  function resetDeltaBeforeAnim(element, index) {
    element.boundingRect = element.element.getBoundingClientRect();
    element.windowHeight = window.innerHeight;
    element.deltaScrolling[index] = getDeltaScrolling(element, index);
  };

  function getScrollY(element) {
    if (!element.scrollableElement) return window.scrollY;
    return element.scrollableElement.scrollTop;
  }

  window.ScrollFx = ScrollFx;
}());