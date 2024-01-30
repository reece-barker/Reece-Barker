// File#: _1_3d-drawer
// Usage: codyhouse.co/license
(function () {
	var TdDrawer = function (element) {
		this.element = element;
		this.mianContent = document.getElementsByClassName('js-td-drawer-main');
		this.content = document.getElementsByClassName('js-td-drawer__body');
		this.triggers = document.querySelectorAll('[aria-controls="' + this.element.getAttribute('id') + '"]');
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.selectedTrigger = null;
		this.showClass = "td-drawer--is-visible";
		this.showMainClass = "td-drawer-main--drawer-is-visible";
		initDrawer(this);
	};

	function initDrawer(drawer) {
		// open drawer when clicking on trigger buttons
		if (drawer.triggers) {
			for (var i = 0; i < drawer.triggers.length; i++) {
				drawer.triggers[i].addEventListener('click', function (event) {
					event.preventDefault();
					if (Util.hasClass(drawer.element, drawer.showClass)) {
						closeDrawer(drawer);
						return;
					}
					drawer.selectedTrigger = event.target;
					showDrawer(drawer);
					initDrawerEvents(drawer);
				});
			}
		}

		// if drawer is already open -> we should initialize the drawer events
		if (Util.hasClass(drawer.element, drawer.showClass)) initDrawerEvents(drawer);
	};

	function showDrawer(drawer) {
		if (drawer.content.length > 0) drawer.content[0].scrollTop = 0;
		if (drawer.mianContent.length > 0) Util.addClass(drawer.mianContent[0], drawer.showMainClass);
		Util.addClass(drawer.element, drawer.showClass);
		getFocusableElements(drawer);
		Util.moveFocus(drawer.element);
		// wait for the end of transitions before moving focus
		drawer.element.addEventListener("transitionend", function cb(event) {
			Util.moveFocus(drawer.element);
			drawer.element.removeEventListener("transitionend", cb);
		});
		emitDrawerEvents(drawer, 'drawerIsOpen');
	};

	function closeDrawer(drawer) {
		if (drawer.mianContent.length > 0) Util.removeClass(drawer.mianContent[0], drawer.showMainClass);
		Util.removeClass(drawer.element, drawer.showClass);
		drawer.firstFocusable = null;
		drawer.lastFocusable = null;
		if (drawer.selectedTrigger) drawer.selectedTrigger.focus();
		//remove listeners
		cancelDrawerEvents(drawer);
		emitDrawerEvents(drawer, 'drawerIsClose');
	};

	function initDrawerEvents(drawer) {
		//add event listeners
		drawer.element.addEventListener('keydown', handleEvent.bind(drawer));
		drawer.element.addEventListener('click', handleEvent.bind(drawer));
	};

	function cancelDrawerEvents(drawer) {
		//remove event listeners
		drawer.element.removeEventListener('keydown', handleEvent.bind(drawer));
		drawer.element.removeEventListener('click', handleEvent.bind(drawer));
	};

	function handleEvent(event) {
		switch (event.type) {
			case 'click': {
				initClick(this, event);
			}
			case 'keydown': {
				initKeyDown(this, event);
			}
		}
	};

	function initKeyDown(drawer, event) {
		if (event.keyCode && event.keyCode == 27 || event.key && event.key == 'Escape') {
			//close drawer window on esc
			closeDrawer(drawer);
		} else if (event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab') {
			//trap focus inside drawer
			trapFocus(drawer, event);
		}
	};

	function initClick(drawer, event) {
		//close drawer when clicking on close button or drawer bg layer 
		if (!event.target.closest('.js-td-drawer__close') && !Util.hasClass(event.target, 'js-td-drawer')) return;
		event.preventDefault();
		closeDrawer(drawer);
	};

	function trapFocus(drawer, event) {
		if (drawer.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of drawer
			event.preventDefault();
			drawer.lastFocusable.focus();
		}
		if (drawer.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of drawer
			event.preventDefault();
			drawer.firstFocusable.focus();
		}
	};

	function getFocusableElements(drawer) {
		//get all focusable elements inside the drawer
		var allFocusable = drawer.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		getFirstVisible(drawer, allFocusable);
		getLastVisible(drawer, allFocusable);
	};

	function getFirstVisible(drawer, elements) {
		//get first visible focusable element inside the drawer
		for (var i = 0; i < elements.length; i++) {
			if (elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length) {
				drawer.firstFocusable = elements[i];
				return true;
			}
		}
	};

	function getLastVisible(drawer, elements) {
		//get last visible focusable element inside the drawer
		for (var i = elements.length - 1; i >= 0; i--) {
			if (elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length) {
				drawer.lastFocusable = elements[i];
				return true;
			}
		}
	};

	function emitDrawerEvents(drawer, eventName) {
		var event = new CustomEvent(eventName, {
			detail: drawer.selectedTrigger
		});
		drawer.element.dispatchEvent(event);
	};

	//initialize the Drawer objects
	var drawer = document.getElementsByClassName('js-td-drawer');
	if (drawer.length > 0) {
		for (var i = 0; i < drawer.length; i++) {
			(function (i) {
				new TdDrawer(drawer[i]);
			})(i);
		}
	}
}());