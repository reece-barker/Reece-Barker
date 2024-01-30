// File#: _1_page-transition
// Usage: codyhouse.co/license
(function() {
  var PageTransition = function(opts) {
    if(!('CSS' in window) || !CSS.supports('color', 'var(--color)')) return;
    this.element = document.getElementsByClassName('js-page-trans')[0];
    this.options = Util.extend(PageTransition.defaults , opts);
    this.cachedPages = [];
    this.anchors = false;
    this.clickFunctions = [];
    this.animating = false;
    this.newContent = false;
    this.containerClass = 'js-page-trans__content';
    this.containers = [];
    initSrRegion(this);
    pageTrInit(this);
    initBrowserHistory(this);
  };

  function initSrRegion(element) {
    var liveRegion = document.createElement('p');
    Util.setAttributes(liveRegion, {'class': 'sr-only', 'role': 'alert', 'aria-live': 'polite', 'id': 'page-trans-sr-live'});
    element.element.appendChild(liveRegion);
    element.srLive = document.getElementById('page-trans-sr-live');
  };

  function pageTrInit(element) { // bind click events
    element.anchors = document.getElementsByClassName('js-page-trans-link');
    for(var i = 0; i < element.anchors.length; i++) {
      (function(i){
        element.clickFunctions[i] = function(event) {
          event.preventDefault();
          element.updateBrowserHistory = true;
          bindClick(element, element.anchors[i].getAttribute('href'));
        };

        element.anchors[i].addEventListener('click', element.clickFunctions[i]);
      })(i);
    }
  };

  function bindClick(element, link) {
    if(element.animating) return;
    element.animating = true;
    element.link = link; 
    // most of those links will be removed from the page
    unbindClickEvents(element);
    loadPageContent(element); 
    // code that should run before the leaving animation
    if(element.options.beforeLeave) element.options.beforeLeave(element.link);
    // announce to SR new content is being loaded
    element.srLive.textContent = element.options.srLoadingMessage;
    // leaving animation
    if(!element.options.leaveAnimation) return;
    element.containers.push(element.element.getElementsByClassName(element.containerClass)[0]);
    element.options.leaveAnimation(element.containers[0], element.link, function(){
      leavingAnimationComplete(element, true);
    });
  };

  function unbindClickEvents(element) {
    for(var i = 0; i < element.anchors.length; i++) {
      element.anchors[i].removeEventListener('click', element.clickFunctions[i]);
    }
  };

  function loadPageContent(element) {
    element.newContent = false;
    var pageCache = getCachedPage(element);
    if(pageCache) {
      element.newContent = pageCache;
    } else {
      if(element.options.loadFunction) { // use a custom function to load your data
        element.options.loadFunction(element.link, function(data){
          element.newContent = data;
          element.cachedPages.push({link: element.link, content: element.newContent});
        });
      } else {
        // load page content
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            element.newContent = getContainerHTML(element, xmlHttp.responseText);
            element.cachedPages.push({link: element.link, content: element.newContent});
          }
        };
        xmlHttp.open('GET', element.link);
        xmlHttp.send();
      }
    }
  };

  function leavingAnimationComplete(element, triggerProgress) {
    if(element.newContent) {
      // new content has already been created
      triggerEnteringProcess(element);
    } else {
      // new content is not available yet
      if(triggerProgress && element.options.progressAnimation) element.options.progressAnimation(element.link);
      setTimeout(function(){
        leavingAnimationComplete(element, false);
      }, 200);
    }
  };

  function getCachedPage(element) {
    var cachedContent = false;
    for(var i = 0; i < element.cachedPages.length; i++) {
      if(element.cachedPages[i].link == element.link) {
        cachedContent = element.cachedPages[i].content;
        break;
      }
    }
    return cachedContent;
  };

  function getContainerHTML(element, content) {
    var template = document.createElement('div');
    template.innerHTML = content;
    return template.getElementsByClassName(element.containerClass)[0].outerHTML;
  };

  function triggerEnteringProcess(element) {
    if(element.updateBrowserHistory) updateBrowserHistory(element);
    // inject new content
    element.containers[0].insertAdjacentHTML('afterend', element.newContent);
    element.containers = element.element.getElementsByClassName(element.containerClass);
    if(element.options.beforeEnter) element.options.beforeEnter(element.containers[0], element.containers[1], element.link);
    if(!element.options.enterAnimation) return; // entering animation
    element.options.enterAnimation(element.containers[0], element.containers[1], element.link, function(){
      // move focus to new cntent
      Util.moveFocus(element.containers[1]);
      // remove old content
      element.containers[0].remove();
      if(element.options.afterEnter) element.options.afterEnter(element.containers[1], element.link);
      pageTrInit(element); // bind click event to new anchor elements
      resetPageTransition(element);
      // announce to SR new content is available
      element.srLive.textContent = element.options.srLoadedMessage;
    });
  };

  function resetPageTransition(element) {
    // remove old content
    element.newContent = false;
    element.animating = false;
    element.containers = [];
    element.link = false;
  };

  function updateBrowserHistory(element) {
    if(window.history.state && window.history.state == element.link) return;
    window.history.pushState({path: element.link},'',element.link);
  };

  function initBrowserHistory(element) {
    setTimeout(function() {
      window.addEventListener('popstate', function(event) {
        element.updateBrowserHistory = false;
        if(event.state && event.state.path) {
          bindClick(element, event.state.path);
        } else {
          bindClick(element, document.location);
        }
      });
    }, 10);
  };

  PageTransition.defaults = {
    beforeLeave: false, // run before the leaving animation is triggered
    leaveAnimation: false,
    progressAnimation: false,
    beforeEnter: false, // run before enterAnimation (after new content has been added to the page)
    enterAnimation: false,
    afterEnter: false,
    loadFunction: false,
    srLoadingMessage: 'New content is being loaded',
    srLoadedMessage: 'New content has been loaded' 
  };

  window.PageTransition = PageTransition;
}());