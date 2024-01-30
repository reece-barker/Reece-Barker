// File#: _2_full-screen-select
(function() {
	var CustomSelect = function(element) {
		this.element = element;
		this.items = this.element.children;
		initCustomSelect(this);
	};

	function initCustomSelect(select) {
		// arrow navigation
		select.element.addEventListener('keydown', function(event){
			if( event.keyCode && event.keyCode == 40 || event.key && event.key.toLowerCase() == 'arrowdown' ) {
				selectOption(select, 1); // go to next option
			} else if( event.keyCode && event.keyCode == 38 || event.key && event.key.toLowerCase() == 'arrowup' ) {
				selectOption(select, -1); // go to prev option
			}
		});
	};

	function selectOption(select, direction) {
		var focusElement = document.activeElement,
			index = Util.getIndexInArray(select.items, focusElement.closest('li'));
		if(index < 0) return;
		index = index + direction;
		if( index < 0 ) index = select.items.length - 1;
		if( index >= select.items.length) index = 0;
		Util.moveFocus(select.items[index].getElementsByTagName(focusElement.tagName)[0]);
	};

	//initialize the CustomSelect objects
	var customSelect = document.getElementsByClassName('js-full-screen-select');
	if( customSelect.length > 0 ) {
		for( var i = 0; i < customSelect.length; i++) {
			(function(i){new CustomSelect(customSelect[i]);})(i);
		}
	}
}());