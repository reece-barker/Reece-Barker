// File#: _1_article-preview-v3
// Usage: codyhouse.co/license
(function() {
  var Story3 = function(element) {
    this.element = element;
    // data attributes
    this.src = this.element.getAttribute('data-story-img-src');
    this.align = this.element.getAttribute('data-story-img-align') ? this.element.getAttribute('data-story-img-align') : 'right';
    this.offset = this.element.getAttribute('data-story-img-offset-x') ? this.element.getAttribute('data-story-img-offset-x') : '0px';
    this.width = this.element.getAttribute('data-story-img-width') ? this.element.getAttribute('data-story-img-width') : '30%';
    this.customClasses = this.element.getAttribute('data-story-img-class') ? this.element.getAttribute('data-story-img-class') : 'display@lg';
    // preview classes
    this.previewClass = 'story-v3__preview-img js-story-v3__preview-img'+' '+this.customClasses;
    this.previewVisibleClass = 'story-v3__preview-img--is-visible';
    this.preview = false; // will use this to store the preview img element
    // params needed for event listening
    this.eventBind = false;
    this.mousePosition = false;
    // used during mousemove
    this.previewMoving = false;
    initStory3(this);
  };

  function initStory3(story) {
    // create img preview element
    createPreview(story);
    // bind events
    story.eventBind = handleEvent.bind(story);
    story.element.addEventListener('mouseenter', story.eventBind);
  };

  function createPreview(story) {
    story.preview = document.createElement('img');
    story.element.appendChild(story.preview);
    Util.addClass(story.preview, story.previewClass);
    Util.setAttributes(story.preview, {'aria-hidden': true, 'src': story.src});
  };

  function handleEvent(event) {
    switch(event.type) {
      case 'mouseenter': {
        showPreview(this, event);
        break;
      }
      case 'mouseleave': {
        hidePreview(this, event);
        break;
      }
      case 'mousemove': {
        movePreview(this, event);
        break;
      }
    }
  };

  function showPreview(story, event) {
    // show preview
    story.preview.setAttribute('style', getPreviewStyle(story));
    Util.addClass(story.preview, story.previewVisibleClass);
    // bind events
    story.element.addEventListener('mouseleave', story.eventBind);
    story.element.addEventListener('mousemove', story.eventBind);
    // store mouse position
    story.mousePosition = [event.clientX, event.clientY];
  };

  function hidePreview(story, event) {
    // hide image
    Util.removeClass(story.preview, story.previewVisibleClass);
    story.preview.style.transform = '';
    // remove events
    story.element.removeEventListener('mouseleave', story.eventBind);
		story.element.removeEventListener('mousemove', story.eventBind);
  };

  function movePreview(story, event) { // parallax effect
    if(story.previewMoving) return;
    story.previewMoving = true;
    window.requestAnimationFrame(function(){
      updatePreviewPosition(story, event);
      story.previewMoving = false;
    });
  };

  function updatePreviewPosition(story, event) {
    // move preview image
    var translateX = event.clientX - story.mousePosition[0],
      translateY = event.clientY - story.mousePosition[1];
    translateX = resetTranslateValue(translateX);
    translateY = resetTranslateValue(translateY); 
    story.preview.style.transform = 'translateY(calc(-50% + '+translateY+'px)) translateX('+translateX+'px)';
  };

  function getPreviewStyle(story) {
    var storyRect = story.element.getBoundingClientRect(),
      horizontalStyle = '';
    if(story.align == 'right') {
      horizontalStyle = 'right:'+getValue(storyRect.width, story.offset)+'px;';
    } else {
      horizontalStyle = 'left:'+getValue(storyRect.width, story.offset)+'px;';
    }
    var style = 'width: '+getValue(storyRect.width, story.width)+'px;'+horizontalStyle;

    return style;
  };

  function getValue(width, val) {
    if(val.indexOf('%') > -1) {
      return width*parseInt(val)/100;
    } else {
      return parseInt(val);
    }
  };

  function resetTranslateValue(val) {
    return parseInt(val/30);
  };

  window.Story3 = Story3;

  // init the Story3 objects
  var story3 = document.getElementsByClassName('js-story-v3');
  if(story3.length > 0) {
    for( var i = 0; i < story3.length; i++) {
      (function(i){ new Story3(story3[i]);})(i);
    }
  }
}());