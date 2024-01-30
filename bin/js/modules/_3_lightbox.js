// File#: _3_lightbox
// Usage: codyhouse.co/license

(function() {
  var Lightbox = function(element) {
    this.element = element;
    this.id = this.element.getAttribute('id');
    this.slideshow = this.element.getElementsByClassName('js-lightbox__body')[0];
    this.slides = this.slideshow.getElementsByClassName('js-slideshow__item');
    this.thumbWrapper = this.element.getElementsByClassName('js-lightbox_thumb-list');
    lazyLoadLightbox(this);
    initSlideshow(this);
    initThumbPreview(this);
    initThumbEvents(this);
  }

  function lazyLoadLightbox(modal) {
    // add no-transition class to lightbox - used to select the first visible slide
    Util.addClass(modal.element, 'lightbox--no-transition');
    //load first slide media when modal is open
    modal.element.addEventListener('modalIsOpen', function(event){
      setSelectedItem(modal, event);
      var selectedSlide = modal.slideshow.getElementsByClassName('slideshow__item--selected');
      modal.selectedSlide = Util.getIndexInArray(modal.slides, selectedSlide[0]);
      if(selectedSlide.length > 0) {
        if(modal.slideshowObj) modal.slideshowObj.selectedSlide = modal.selectedSlide;
        lazyLoadSlide(modal);
        resetVideos(modal, false);
        resetIframes(modal, false);
        updateThumb(modal);
      }
      Util.removeClass(modal.element, 'lightbox--no-transition');
    });
    modal.element.addEventListener('modalIsClose', function(event){ // add no-transition class
      Util.addClass(modal.element, 'lightbox--no-transition');
    });
    // lazyload media of selected slide/prev slide/next slide
    modal.slideshow.addEventListener('newItemSelected', function(event){
      // 'newItemSelected' is emitted by the Slideshow object when a new slide is selected
      var prevSelected = modal.selectedSlide;
      modal.selectedSlide = event.detail;
      lazyLoadSlide(modal);
      resetVideos(modal, prevSelected); // pause video of previous visible slide and start new video (if present)
      resetIframes(modal, prevSelected);
      updateThumb(modal);
    });
  };

  function lazyLoadSlide(modal) {
    setSlideMedia(modal, modal.selectedSlide);
    setSlideMedia(modal, modal.selectedSlide + 1);
    setSlideMedia(modal, modal.selectedSlide - 1);
  };

  function setSlideMedia(modal, index) {
    if(index < 0) index = modal.slides.length - 1;
    if(index > modal.slides.length - 1) index = 0;
    setSlideImgs(modal, index);
    setSlidesVideos(modal, index, 'video');
    setSlidesVideos(modal, index, 'iframe');
  };

  function setSlideImgs(modal, index) {
    var imgs = modal.slides[index].querySelectorAll('img[data-src]');
    for(var i = 0; i < imgs.length; i++) {
      imgs[i].src = imgs[i].getAttribute('data-src');
    }
  };

  function setSlidesVideos(modal, index, type) {
    var videos = modal.slides[index].querySelectorAll(type+'[data-src]');
    for(var i = 0; i < videos.length; i++) {
      videos[0].src = videos[0].getAttribute('data-src');
      videos[0].removeAttribute('data-src');
    }
  };

  function initSlideshow(modal) { 
    if(modal.slides.length <= 1) {
      hideSlideshowElements(modal);
      return;
    } 
    var swipe = (modal.slideshow.getAttribute('data-swipe') && modal.slideshow.getAttribute('data-swipe') == 'on') ? true : false;
    modal.slideshowObj = new Slideshow({element: modal.slideshow, navigation: false, autoplay : false, swipe : swipe});
  };

  function hideSlideshowElements(modal) { // hide slideshow controls if gallery is composed by one item only
    var slideshowNav = modal.element.getElementsByClassName('js-slideshow__control');
    if(slideshowNav.length > 0) {
      for(var i = 0; i < slideshowNav.length; i++) Util.addClass(slideshowNav[i], 'is-hidden');
    }
    var slideshowThumbs = modal.element.getElementsByClassName('js-lightbox_footer');
    if(slideshowThumbs.length > 0) Util.addClass(slideshowThumbs[0], 'is-hidden');
  };

  function resetVideos(modal, index) {
    if(index) {
      var actualVideo = modal.slides[index].getElementsByTagName('video');
      if(actualVideo.length > 0 ) actualVideo[0].pause();
    }
    var newVideo = modal.slides[modal.selectedSlide].getElementsByTagName('video');
    if(newVideo.length > 0 ) {
      setVideoWidth(modal, modal.selectedSlide, newVideo[0]);
      newVideo[0].play();
    }
  };

  function resetIframes(modal, index) {
    if(index) {
      var actualIframe = modal.slides[index].getElementsByTagName('iframe');
      if(actualIframe.length > 0 ) {
        actualIframe[0].setAttribute('data-src', actualIframe[0].src);
        actualIframe[0].removeAttribute('src');
      }
    }
    var newIframe = modal.slides[modal.selectedSlide].getElementsByTagName('iframe');
    if(newIframe.length > 0 ) {
      setVideoWidth(modal, modal.selectedSlide, newIframe[0]);
    }
  };

  function resizeLightbox(modal) { // executed when window has been resized
    if(!modal.selectedSlide) return; // modal not active
    var video = modal.slides[modal.selectedSlide].getElementsByTagName('video');
    if(video.length > 0 ) setVideoWidth(modal, modal.selectedSlide, video[0]);
    var iframe = modal.slides[modal.selectedSlide].getElementsByTagName('iframe');
    if(iframe.length > 0 ) setVideoWidth(modal, modal.selectedSlide, iframe[0]);
  };

  function setVideoWidth(modal, index, video) {
    var videoContainer = modal.slides[index].getElementsByClassName('js-lightbox__media-outer');
    if(videoContainer.length == 0 ) return;
    var videoWrapper = videoContainer[0].getElementsByClassName('js-lightbox__media-inner');
    var maxWidth = (video.offsetWidth/video.offsetHeight)*videoContainer[0].offsetHeight;
    if(maxWidth < modal.slides[index].offsetWidth) {
      videoWrapper[0].style.width = maxWidth+'px';
      videoWrapper[0].style.paddingBottom = videoContainer[0].offsetHeight+'px';
    } else {
      videoWrapper[0].removeAttribute('style')
    }
  };

  function initThumbPreview(modal) {
    if(modal.thumbWrapper.length < 1) return;
    var content = '';
    for(var i = 0; i < modal.slides.length; i++) {
      var activeClass = Util.hasClass(modal.slides[i], 'slideshow__item--selected') ? ' lightbox__thumb--active': '';
      content = content + '<li class="lightbox__thumb js-lightbox__thumb'+activeClass+'"><img src="'+modal.slides[i].querySelector('[data-thumb]').getAttribute('data-thumb')+'">'+'</li>';
    }
    modal.thumbWrapper[0].innerHTML = content;
  };

  function initThumbEvents(modal) {
    if(modal.thumbWrapper.length < 1) return;
    modal.thumbSlides = modal.thumbWrapper[0].getElementsByClassName('js-lightbox__thumb');
    modal.thumbWrapper[0].addEventListener('click', function(event){
      var selectedThumb = event.target.closest('.js-lightbox__thumb');
      if(!selectedThumb || Util.hasClass(selectedThumb, 'lightbox__thumb--active')) return;
      modal.slideshowObj.showItem(Util.getIndexInArray(modal.thumbSlides, selectedThumb));
    });
  };

  function updateThumb(modal) {
    if(modal.thumbWrapper.length < 1) return;
    // update selected thumb classes
    var selectedThumb = modal.thumbWrapper[0].getElementsByClassName('lightbox__thumb--active');
    if(selectedThumb.length > 0) Util.removeClass(selectedThumb[0], 'lightbox__thumb--active');
    Util.addClass(modal.thumbSlides[modal.selectedSlide], 'lightbox__thumb--active');
    // update thumb list position (if selected thumb is outside viewport)
    var offsetThumb = modal.thumbSlides[modal.selectedSlide].getBoundingClientRect(),
      offsetThumbList = modal.thumbWrapper[0].getBoundingClientRect();
    if(offsetThumb.left < offsetThumbList.left) {
      modal.thumbWrapper[0].scrollTo(modal.thumbSlides[modal.selectedSlide].offsetLeft - offsetThumbList.left, 0);
    } else if(offsetThumb.right > offsetThumbList.right) {
      modal.thumbWrapper[0].scrollTo( (offsetThumb.right - offsetThumbList.right) + modal.thumbWrapper[0].scrollLeft, 0);
    }
  };

  function keyboardNavigateLightbox(modal, direction) {
    if(!Util.hasClass(modal.element, 'modal--is-visible')) return;
    if(!document.activeElement.closest('.js-lightbox__body') && document.activeElement.closest('.js-modal')) return
    (direction == 'next') ? modal.slideshowObj.showNext() : modal.slideshowObj.showPrev();
  };

  function setSelectedItem(modal, event) {
    // if a specific slide was selected -> make sure to show that item first
    var selectedItemId = false;
    if(event.detail) {
      var elTarget = event.detail.closest('[aria-controls="'+modal.id+'"]');
      if(elTarget) selectedItemId = elTarget.getAttribute('data-lightbox-item');
    } 
   
    if(!selectedItemId || !modal.slideshowObj) return;
    var selectedItem = document.getElementById(selectedItemId);
    if(!selectedItem) return;
    var lastSelected = modal.slideshow.getElementsByClassName('slideshow__item--selected');
    if(lastSelected.length > 0 ) Util.removeClass(lastSelected[0], 'slideshow__item--selected');
    Util.addClass(selectedItem, 'slideshow__item--selected');
  };

  window.Lightbox = Lightbox;

  // init Lightbox objects
  var lightBoxes = document.getElementsByClassName('js-lightbox');
  if( lightBoxes.length > 0 ) {
    var lightBoxArray = [];
    for( var i = 0; i < lightBoxes.length; i++) {
      (function(i){ lightBoxArray.push(new Lightbox(lightBoxes[i]));})(i);
      
      // resize video/iframe
      var resizingId = false;
      window.addEventListener('resize', function(event){
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 300);
      });

      function doneResizing() {
        for( var i = 0; i < lightBoxArray.length; i++) {
          (function(i){resizeLightbox(lightBoxArray[i]);})(i);
        };
      };

      // Lightbox gallery navigation with keyboard
      window.addEventListener('keydown', function(event){
        if(event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright') {
          updateLightbox('next');
        } else if(event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
          updateLightbox('prev');
        }
      });

      function updateLightbox(direction) {
        for( var i = 0; i < lightBoxArray.length; i++) {
          (function(i){keyboardNavigateLightbox(lightBoxArray[i], direction);})(i);
        };
      };
    }
  }
}());