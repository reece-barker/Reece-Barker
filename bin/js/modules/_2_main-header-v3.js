// File#: _2_main-header-v3
// Usage: codyhouse.co/license
(function() {
	var mainHeader = document.getElementsByClassName('js-header-v3');
	if(mainHeader.length > 0) {
		var menuTrigger = mainHeader[0].getElementsByClassName('js-toggle-menu')[0],
			searchTrigger = mainHeader[0].getElementsByClassName('js-toggle-search'),
			navigation = mainHeader[0].getElementsByClassName('header-v3__nav')[0];

		// we'll use these to store the node that needs to receive focus when the mobile menu/search input are closed 
		var focusSearch = false,
			focusMenu = false;
			
		// set delays for list items inside navigation -> mobile animation
		var navItems = Util.getChildrenByClassName(navigation.getElementsByClassName('header-v3__nav-list')[0], 'header-v3__nav-item');
		for(var i = 0; i < navItems.length; i++) {
			setTransitionDelay(navItems[i], i);
		}
		// toggle navigation on mobile
		menuTrigger.addEventListener('switch-icon-clicked', function(event){ // toggle menu visibility an small devices
			toggleNavigation(event.detail);
		});
		// toggle search on desktop
		if(searchTrigger.length > 0) {
			searchTrigger[0].addEventListener('switch-icon-clicked', function(event){ // toggle menu visibility an small devices
				toggleSearch(event.detail);
			});
		}
		
		window.addEventListener('keyup', function(event){
			// listen for esc key events
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
					focusMenu = menuTrigger; // move focus to menu trigger when menu is close
					menuTrigger.click();
				}
				// close search if open
				if(searchTrigger.length > 0 && searchTrigger[0].getAttribute('aria-expanded') == 'true' && isVisible(searchTrigger[0])) {
					focusSearch = searchTrigger[0]; // move focus to search trigger when search is close
					searchTrigger[0].click();
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-header-v3')) menuTrigger.click();
			}
		});

		// listen for resize
		var resizingId = false;
		window.addEventListener('resize', function() {
			clearTimeout(resizingId);
			resizingId = setTimeout(doneResizing, 300);
		});

		function toggleNavigation(bool) {
			Util.addClass(navigation, 'header-v3__nav--is-visible');
			Util.addClass(menuTrigger, 'switch-icon--disabled');
			menuTrigger.setAttribute('aria-expanded', bool);
			// animate navigation height
			var finalHeight = bool ? window.innerHeight: 0,
				initHeight = bool ? 0 : window.innerHeight; 
			navigation.style.height = initHeight+'px';

			setTimeout(function(){
				navigation.style.height = finalHeight+'px';
				Util.toggleClass(navigation, 'header-v3__nav--animate-children', bool);
			}, 50);

			navigation.addEventListener('transitionend', function cb(event){
				if (event.propertyName !== 'height') return;
				if(finalHeight > 0) {
					var firstFocusableElement = getMenuFirstFocusable();
					firstFocusableElement.focus(); // move focus to first focusable element
				} else {
					Util.removeClass(navigation, 'header-v3__nav--is-visible header-v3__nav--animate-children');
					if(focusMenu) { // we may need to move the focus to a new element
						focusMenu.focus();
						focusMenu = false;
					}
				}
				
				navigation.removeEventListener('transitionend', cb);
				navigation.removeAttribute('style');
				Util.removeClass(menuTrigger, 'switch-icon--disabled');
			});
			// toggle expanded class to header
			Util.toggleClass(mainHeader[0], 'header-v3--expanded', bool);
		};

		function toggleSearch(bool){
			Util.addClass(searchTrigger[0], 'switch-icon--disabled');
			Util.toggleClass(mainHeader[0], 'header-v3--show-search', bool);
			searchTrigger[0].setAttribute('aria-expanded', bool);
			mainHeader[0].addEventListener('transitionend', function cb(){
				mainHeader[0].removeEventListener('transitionend', cb);
				Util.removeClass(searchTrigger[0], 'switch-icon--disabled');
				if(bool) mainHeader[0].getElementsByClassName('header-v3__nav-item--search-form')[0].getElementsByTagName('input')[0].focus();
				else if(focusSearch) {// move focus to a new element when closing the search
					focusSearch.focus();
					focusSearch = false;
				}
			});

			// toggle expanded class to header
			Util.toggleClass(mainHeader[0], 'header-v3--expanded', bool);
		};

		function doneResizing() {
			// check if main nav is visible (small devices only)
			if( !isVisible(menuTrigger) && menuTrigger.getAttribute('aria-expanded') == 'true') menuTrigger.click();
			// check if search input is visible
			if( searchTrigger.length > 0 && !isVisible(searchTrigger[0]) && searchTrigger[0].getAttribute('aria-expanded') == 'true') searchTrigger[0].click();
		};

		function getMenuFirstFocusable() {
			var focusableEle = mainHeader[0].getElementsByClassName('header-v3__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
			for(var i = 0; i < focusableEle.length; i++) {
				if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
					firstFocusable = focusableEle[i];
					break;
				}
			}

			return firstFocusable;
		};

		function setTransitionDelay(element, index) {
			element.style.transitionDelay = parseFloat((index/20) + 0.1).toFixed(2)+'s';
		};

		function isVisible(element) {
			return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
		};
	}
}());