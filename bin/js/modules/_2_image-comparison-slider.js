// File#: _2_image-comparison-slider
// Usage: codyhouse.co/license
(function() {
  var ComparisonSlider = function(element) {
    this.element = element;
    this.modifiedImg = this.element.getElementsByClassName('js-compare-slider__img--modified')[0];
    this.handle = this.element.getElementsByClassName('js-compare-slider__handle')[0];
    this.keyboardHandle = this.element.getElementsByClassName('js-compare-slider__input-handle')[0];
    this.captions = this.element.getElementsByClassName('js-compare-slider__caption');
    // drag
    this.dragStart = false;
    this.animating = false;
    this.leftPosition = 50;
    // store container width
    this.sliderWidth = getSliderWidth(this);
    initComparisonSlider(this);
  };

  function getSliderWidth(slider) {
    return slider.element.offsetWidth;
  };

  function initComparisonSlider(slider) {
    // initial animation
    if(reducedMotion) { // do not animate slider elements
      Util.addClass(slider.element, 'compare-slider--reduced-motion compare-slider--in-viewport');
    } else if(intersectionObserverSupported) { // reveal slider elements when it enters the viewport
      var observer = new IntersectionObserver(sliderObserve.bind(slider), { threshold: [0, 0.3] });
      observer.observe(slider.element);
    } else { // reveal slider elements right away
      Util.addClass(slider.element, 'compare-slider--in-viewport');
    }
    // init drag functionality
    new SwipeContent(slider.element);
    slider.element.addEventListener('dragStart', function(event){
      if(!event.detail.origin.closest('.js-compare-slider__handle')) return;
      Util.addClass(slider.element, 'compare-slider--is-dragging');
      if(!slider.dragStart) {
        slider.dragStart = event.detail.x;
        detectDragEnd(slider);
      }
    });
    // slider.element.addEventListener('dragging', function(event){
    slider.element.addEventListener('mousemove', function(event){
      sliderDragging(slider, event)
    });
    slider.element.addEventListener('touchmove', function(event){
      sliderDragging(slider, event)
    });

    // detect mouse leave
    slider.element.addEventListener('mouseleave', function(event){
      sliderResetDragging(slider, event);
    });
    slider.element.addEventListener('touchend', function(event){
      sliderResetDragging(slider, event);
    });

    // on resize -> update slider width
    window.addEventListener('resize', function(){
      slider.sliderWidth = getSliderWidth(slider);
    });

    // detect change in keyboardHandle input -> allow keyboard navigation
    slider.keyboardHandle.addEventListener('change', function(event){
      slider.leftPosition = Number(slider.keyboardHandle.value);
      updateCompareSlider(slider, 0);
    });
  };

  function sliderDragging(slider, event) {
    if(!slider.dragStart) return;
    var pageX = event.pageX || event.touches[0].pageX;
    if(slider.animating || Math.abs(pageX - slider.dragStart) < 5) return;
    slider.animating = true;
    updateCompareSlider(slider, pageX - slider.dragStart);
    slider.dragStart = pageX;
  };

  function sliderResetDragging(slider, event) {
    if(!slider.dragStart) return;
    if(event.pageX < slider.element.offsetLeft) {
      slider.leftPosition = 0;
      updateCompareSlider(slider, 0);
    }
    if(event.pageX > slider.element.offsetLeft + slider.element.offsetWidth) {
      slider.leftPosition = 100;
      updateCompareSlider(slider, 0);
    }
  };

  function sliderObserve(entries, observer) {
    if(entries[0].intersectionRatio.toFixed(1) > 0) { // reveal slider elements when in viewport
      Util.addClass(this.element, 'compare-slider--in-viewport');
      observer.unobserve(this.element);
    }
  };

  function detectDragEnd(slider) {
    document.addEventListener('click', function cb(event){
      document.removeEventListener('click', cb);
      Util.removeClass(slider.element, 'compare-slider--is-dragging');
      updateCompareSlider(slider, event.detail.x - slider.dragStart);
      slider.dragStart = false;
    });
  };

  function updateCompareSlider(slider, delta) {
    var percentage = (delta*100/slider.sliderWidth);
    if(isNaN(percentage)) return;
    slider.leftPosition = Number((slider.leftPosition + percentage).toFixed(2));
    if(slider.leftPosition < 0) slider.leftPosition = 0;
    if(slider.leftPosition > 100) slider.leftPosition = 100; 
    // update slider elements -> modified img width + handle position + input element (keyboard accessibility)
    slider.keyboardHandle.value = slider.leftPosition;
    slider.handle.style.left = slider.leftPosition + '%';
    slider.modifiedImg.style.width = slider.leftPosition + '%'; 
    updateCompareLabels(slider);
    slider.animating = false;
  };

  function updateCompareLabels(slider) { // update captions visibility
    for(var i = 0; i < slider.captions.length; i++) {
      var delta = ( i == 0 ) 
        ? slider.captions[i].offsetLeft - slider.modifiedImg.offsetLeft - slider.modifiedImg.offsetWidth
        : slider.modifiedImg.offsetLeft + slider.modifiedImg.offsetWidth - slider.captions[i].offsetLeft - slider.captions[i].offsetWidth;
      Util.toggleClass(slider.captions[i], 'compare-slider__caption--is-hidden', delta < 10);
    }
  };
  
  //initialize the ComparisonSlider objects
  var comparisonSliders = document.getElementsByClassName('js-compare-slider'),
    intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
    reducedMotion = Util.osHasReducedMotion();
	if( comparisonSliders.length > 0 ) {
		for( var i = 0; i < comparisonSliders.length; i++) {
			(function(i){
        new ComparisonSlider(comparisonSliders[i]);
      })(i);
    }
	}
}());