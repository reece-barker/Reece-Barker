// File#: _3_drop-menu
// Usage: codyhouse.co/license
(function() {
  var DropMenu = function(element) {
    this.element = element;
    this.innerElement = this.element.getElementsByClassName('js-drop-menu__inner');
    this.trigger = document.querySelector('[aria-controls="'+this.element.getAttribute('id')+'"]');
    this.autocompleteInput = false;
    this.autocompleteList = false;
    this.animationDuration = parseFloat(getComputedStyle(this.element).getPropertyValue('--drop-menu-transition-duration')) || 0.3;
    // store some basic classes
    this.menuIsVisibleClass = 'drop-menu--is-visible';
    this.menuLevelClass = 'js-drop-menu__list';
    this.menuBtnInClass = 'js-drop-menu__btn--sublist-control';
    this.menuBtnOutClass = 'js-drop-menu__btn--back';
    this.levelInClass = 'drop-menu__list--in';
    this.levelOutClass = 'drop-menu__list--out';
    // store the max height of the element
    this.maxHeight = false;
    // store drop menu layout 
    this.layout = false;
    // vertical gap - desktop layout
    this.verticalGap = parseInt(getComputedStyle(this.element).getPropertyValue('--drop-menu-gap-y')) || 4;
    // store autocomplete search results
    this.searchResults = [];
    // focusable elements
    this.focusableElements = [];
    initDropMenu(this);
  };

  function initDropMenu(menu) {
    // trigger drop menu opening/closing
    toggleDropMenu(menu);
    // toggle sublevels
    menu.element.addEventListener('click', function(event){
      // check if we need to show a new sublevel
      var menuBtnIn = event.target.closest('.'+menu.menuBtnInClass);
      if(menuBtnIn) showSubLevel(menu, menuBtnIn);
      // check if we need to go back to a previous level
      var menuBtnOut = event.target.closest('.'+menu.menuBtnOutClass);
      if(menuBtnOut) hideSubLevel(menu, menuBtnOut);
    });
    // init automplete search
    initAutocomplete(menu);
    // close drop menu on focus out
    initFocusOut(menu);
  };

  function toggleDropMenu(menu) { // toggle drop menu
    if(!menu.trigger) return;
    // actions to be performed when closing the drop menu
    menu.dropMenuClosed = function(event) {
      if(event.propertyName != 'visibility') return;
      if(getComputedStyle(menu.element).getPropertyValue('visibility') != 'hidden') return;
      menu.element.removeEventListener('transitionend', menu.dropMenuClosed);
      menu.element.removeAttribute('style');
      resetAllLevels(menu); // go back to main list
      resetAutocomplete(menu); // if autocomplte is enabled -> reset input fields
    };

    // on mobile - close drop menu when clicking on close btn
    menu.element.addEventListener('click', function(event){
      var target = event.target.closest('.js-drop-menu__close-btn');
      if(!target || !dropMenuVisible(menu)) return;
      menu.trigger.click();
    });

    // click on trigger
    menu.trigger.addEventListener('click', function(event){
      menu.element.removeEventListener('transitionend', menu.dropMenuClosed);
      var isVisible = dropMenuVisible(menu);
      Util.toggleClass(menu.element, menu.menuIsVisibleClass, !isVisible);
      isVisible ? menu.trigger.removeAttribute('aria-expanded') : menu.trigger.setAttribute('aria-expanded', true);
      if(isVisible) {
        menu.element.addEventListener('transitionend', menu.dropMenuClosed);
      } else {
        menu.element.addEventListener('transitionend', function cb(){
          menu.element.removeEventListener('transitionend', cb);
          focusFirstElement(menu, menu.element);
        });
        getLayoutValue(menu);
        setDropMenuMaxHeight(menu); // set max-height
        placeDropMenu(menu); // desktop only
      }
    });
  };

  function dropMenuVisible(menu) {
    return Util.hasClass(menu.element, menu.menuIsVisibleClass);
  };

  function showSubLevel(menu, menuBtn) {
    var mainLevel = menuBtn.closest('.'+menu.menuLevelClass),
      subLevel = Util.getChildrenByClassName(menuBtn.parentNode, menu.menuLevelClass);
    if(!mainLevel || subLevel.length == 0 ) return;
    // trigger classes
    Util.addClass(subLevel[0], menu.levelInClass);
    Util.addClass(mainLevel, menu.levelOutClass);
    Util.removeClass(mainLevel, menu.levelInClass);
    // animate height of main element
    animateDropMenu(menu, mainLevel.offsetHeight, subLevel[0].offsetHeight, function(){
      focusFirstElement(menu, subLevel[0]);
    });
  };

  function hideSubLevel(menu, menuBtn) {
    var subLevel = menuBtn.closest('.'+menu.menuLevelClass),
      mainLevel = subLevel.parentNode.closest('.'+menu.menuLevelClass);
    if(!mainLevel || !subLevel) return;
    // trigger classes
    Util.removeClass(subLevel, menu.levelInClass);
    Util.addClass(mainLevel, menu.levelInClass);
    Util.removeClass(mainLevel, menu.levelOutClass);
    // animate height of main element
    animateDropMenu(menu, subLevel.offsetHeight, mainLevel.offsetHeight, function(){
      var menuBtnIn = Util.getChildrenByClassName(subLevel.parentNode, menu.menuBtnInClass);
      if(menuBtnIn.length > 0) menuBtnIn[0].focus();
      // if primary level -> reset height of element + inner element
      if(Util.hasClass(mainLevel, 'js-drop-menu__list--main') && menu.layout == 'desktop') {
        menu.element.style.height = '';
        if(menu.innerElement.length > 0) menu.innerElement[0].style.height = '';
      }
    });
  };

  function animateDropMenu(menu, initHeight, finalHeight, cb) {
    if(menu.innerElement.length < 1 || menu.layout == 'mobile') {
      if(cb) setTimeout(function(){cb();}, menu.animationDuration*1000);
      return;
    }
    var resetHeight = false;
    // make sure init and final height are smaller than max height
    if(initHeight > menu.maxHeight) initHeight = menu.maxHeight;
    if(finalHeight > menu.maxHeight) {
      resetHeight = finalHeight;
      finalHeight = menu.maxHeight;
    }
    var change = finalHeight - initHeight,
      currentTime = null,
      duration = menu.animationDuration*1000;

    var animateHeight = function(timestamp){  
      if (!currentTime) currentTime = timestamp;         
      var progress = timestamp - currentTime;
      if(progress > duration) progress = duration;
      var val = Math.easeOutQuart(progress, initHeight, change, duration);
      menu.element.style.height = val+"px";
      if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
      } else {
        menu.innerElement[0].style.height = resetHeight ? resetHeight+'px' : '';
        if(cb) cb();
      }
    };
    
    //set the height of the element before starting animation -> fix bug on Safari
    menu.element.style.height = initHeight+"px";
    window.requestAnimationFrame(animateHeight);
  };

  function resetAllLevels(menu) {
    var openLevels = menu.element.getElementsByClassName(menu.levelInClass),
      closeLevels = menu.element.getElementsByClassName(menu.levelOutClass);
    while(openLevels[0]) {
      Util.removeClass(openLevels[0], menu.levelInClass);
    }
    while(closeLevels[0]) {
      Util.removeClass(closeLevels[0], menu.levelOutClass);
    }
  };

  function focusFirstElement(menu, level) {
    var element = getFirstFocusable(level);
    element.focus();
  };

  function getFirstFocusable(element) {
    var elements = element.querySelectorAll(focusableElString);
    for(var i = 0; i < elements.length; i++) {
			if(elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length) {
				return elements[i];
			}
		}
  };

  function getFocusableElements(menu) { // all visible focusable elements
    var elements = menu.element.querySelectorAll(focusableElString);
    menu.focusableElements = [];
    for(var i = 0; i < elements.length; i++) {
			if( isVisible(menu, elements[i]) ) menu.focusableElements.push(elements[i]);
		}
  };

  function isVisible(menu, element) {
    var elementVisible = false;
    if( (element.offsetWidth || element.offsetHeight || element.getClientRects().length) && getComputedStyle(element).getPropertyValue('visibility') == 'visible') {
      elementVisible = true;
      if(menu.element.contains(element) && element.parentNode) elementVisible = isVisible(menu, element.parentNode);
    }
    return elementVisible;
  };

  function initAutocomplete(menu) {
    if(!Util.hasClass(menu.element, 'js-autocomplete')) return;
    // get list of search results
    getSearchResults(menu);
    var autocompleteCharacters = 1;
    menu.autocompleteInput = menu.element.getElementsByClassName('js-autocomplete__input');
    menu.autocompleteList = menu.element.getElementsByClassName('js-autocomplete__results');
    new Autocomplete({
      element: menu.element,
      characters: autocompleteCharacters,
      searchData: function(query, cb) {
        var data = [];
        if(query.length >= autocompleteCharacters) {
          data = menu.searchResults.filter(function(item){
            return item['label'].toLowerCase().indexOf(query.toLowerCase()) > -1;
          });
        }
        cb(data);
      }
    });
  };

  function resetAutocomplete(menu) {
    if(menu.autocompleteInput && menu.autocompleteInput.length > 0) {
      menu.autocompleteInput[0].value = '';
    }
  };

  function getSearchResults(menu) {
    var anchors = menu.element.getElementsByClassName('drop-menu__link');
    for(var i = 0; i < anchors.length; i++) {
      menu.searchResults.push({label: anchors[i].textContent, url: anchors[i].getAttribute('href')});
    }
  };

  function setDropMenuMaxHeight(menu) {
    if(!menu.trigger) return;
    if(menu.layout == 'mobile') {
      menu.maxHeight = '100%';
      menu.element.style.maxHeight = menu.maxHeight;
      if(menu.autocompleteList.length > 0) menu.autocompleteList[0].style.maxHeight = 'calc(100% - '+menu.autocompleteInput[0].offsetHeight+'px)';
    } else {
      menu.maxHeight = window.innerHeight - menu.trigger.getBoundingClientRect().bottom - menu.verticalGap - 15;
      menu.element.style.maxHeight = menu.maxHeight + 'px';
      if(menu.autocompleteList.length > 0) menu.autocompleteList[0].style.maxHeight = (menu.maxHeight - menu.autocompleteInput[0].offsetHeight) + 'px';
    }
  };

  function getLayoutValue(menu) {
    menu.layout = getComputedStyle(menu.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
  };

  function placeDropMenu(menu) {
    if(menu.layout == 'mobile') {
      menu.element.style.top = menu.element.style.left = menu.element.style.right = '';
    } else {
      var selectedTriggerPosition = menu.trigger.getBoundingClientRect();
			
      var left = selectedTriggerPosition.left,
        right = (window.innerWidth - selectedTriggerPosition.right),
        isRight = (window.innerWidth < selectedTriggerPosition.left + menu.element.offsetWidth);

      var rightVal = 'auto', leftVal = 'auto';
      if(isRight) {
        rightVal = right+'px';
      } else {
        leftVal = left+'px';
      }

      var topVal = (selectedTriggerPosition.bottom+menu.verticalGap)+'px';
      if( isRight && (right + menu.element.offsetWidth) > window.innerWidth) {
        rightVal = 'auto';
        leftVal = parseInt((window.innerWidth - menu.element.offsetWidth)/2)+'px';
      }
      menu.element.style.top = topVal;
      menu.element.style.left = leftVal;
      menu.element.style.right = rightVal;
    }
  };

  function closeOnResize(menu) {
    getLayoutValue(menu);
    if(menu.layout == 'mobile' || !dropMenuVisible(menu)) return;
    menu.trigger.click();
  };

  function closeOnClick(menu, target) {
    if(menu.layout == 'mobile' || !dropMenuVisible(menu)) return;
    if(menu.element.contains(target) || menu.trigger.contains(target)) return;
    menu.trigger.click();
  };

  function initFocusOut(menu) {
    menu.element.addEventListener('keydown', function(event){
      if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
        getFocusableElements(menu);
        if( (menu.focusableElements[0] == document.activeElement && event.shiftKey) || (menu.focusableElements[menu.focusableElements.length - 1] == document.activeElement && !event.shiftKey)) {
          menu.trigger.click();
        }
      } else if(event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape' && dropMenuVisible(menu)) {
        menu.trigger.click();
			}
    });
  };

  // init DropMenu objects
  var dropMenus = document.getElementsByClassName('js-drop-menu');
  var focusableElString = '[href], input:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable], summary';
  if( dropMenus.length > 0 ) {
    var dropMenusArray = [];
    for( var i = 0; i < dropMenus.length; i++) {(function(i){
      dropMenusArray.push(new DropMenu(dropMenus[i]));
    })(i);}

    // on resize -> close all drop menu elements
		window.addEventListener('resize', function(event){
			dropMenusArray.forEach(function(element){
				closeOnResize(element);
			});
    });
    
    // close drop menu when clicking outside it
		window.addEventListener('click', function(event){
      dropMenusArray.forEach(function(element){
				closeOnClick(element, event.target);
			});
		});
  }
}());