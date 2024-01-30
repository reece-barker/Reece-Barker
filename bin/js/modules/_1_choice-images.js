// File#: _1_choice-images
// Usage: codyhouse.co/license
(function() {
  var ChoiceImgs = function(element) {
    this.element = element;
    this.imgs = this.element.getElementsByClassName('js-choice-img');
    this.isRadio = this.imgs[0].getAttribute('role') == 'radio';
    resetChoiceImgs(this); // set initial aria values
    initChoiceImgsEvent(this);
  };

  function initChoiceImgsEvent(choiceImgs) {
    // on click -> select new item
    choiceImgs.element.addEventListener('click', function(event){
      var selectedImg = event.target.closest('.js-choice-img');
      if(!selectedImg) return;
      var index = Util.getIndexInArray(choiceImgs.imgs, selectedImg);
      if(choiceImgs.isRadio) {
        setRadio(choiceImgs, selectedImg, index);
      } else {
        setCheckbox(choiceImgs, selectedImg, index);
      }
    });

    // keyboard events
    choiceImgs.element.addEventListener('keydown', function(event){
      var selectedImg = event.target.closest('.js-choice-img');
      if(!selectedImg) return;
      
      if( (event.keyCode && event.keyCode == 32) || (event.key && event.key.toLowerCase() == ' ') ) {
        // spacebar ->if this is a checkbox choice, toggle the state
        if(choiceImgs.isRadio) return;
        event.preventDefault();
        var index = Util.getIndexInArray(choiceImgs.imgs, selectedImg);
        setCheckbox(choiceImgs, selectedImg, index);
      } else if((event.keyCode && (event.keyCode == 40 || event.keyCode == 39) ) || (event.key && (event.key.toLowerCase() == 'arrowdown' || event.key.toLowerCase() == 'arrowright'))) {
        // arrow right/arrow down
        if(!choiceImgs.isRadio) return;
        event.preventDefault();
        navigateRadioImgs(choiceImgs, 1);
      } else if((event.keyCode && (event.keyCode == 38 || event.keyCode == 37) ) || (event.key && (event.key.toLowerCase() == 'arrowup' || event.key.toLowerCase() == 'arrowleft'))) {
        // arrow left/up down
        if(!choiceImgs.isRadio) return;
        event.preventDefault();
        navigateRadioImgs(choiceImgs, -1);
      }
    });
  };

  function setCheckbox(choiceImgs, selectedImg, index) {
    var check = selectedImg.getAttribute('aria-checked') == 'false' ? 'true' : 'false';
    selectedImg.setAttribute('aria-checked', check);
    selectedImg.focus(); // move focus to input element
  };

  function setRadio(choiceImgs, selectedImg, index) {
    var check = selectedImg.getAttribute('aria-checked') == 'false' ? 'true' : 'false';
    if(check == 'true') {
      selectedImg.setAttribute('aria-checked', check);
      selectedImg.setAttribute('tabindex', '0');
      for(var i = 0; i < choiceImgs.imgs.length; i++) {
        if(i != index) {
          choiceImgs.imgs[i].setAttribute('aria-checked', 'false');
          choiceImgs.imgs[i].removeAttribute('tabindex');
        }
      }
    }
    selectedImg.focus(); // move focus to input element
  };

  function navigateRadioImgs(choiceImgs, increment) {
    // navigate radio items with keyboard
    var selectedImg = choiceImgs.element.querySelector('[aria-checked="true"]');
    if(!selectedImg) return;
    var index = Util.getIndexInArray(choiceImgs.imgs, selectedImg);
    index = index + increment;
    if(index < 0) index =  choiceImgs.imgs.length - 1;
    if(index >= choiceImgs.imgs.length) index = 0;
    setRadio(choiceImgs, choiceImgs.imgs[index], index);
  };

  function resetChoiceImgs(choiceImgs) {
    for(var i = 0; i < choiceImgs.imgs.length; i++) {
      var check = choiceImgs.imgs[i].getAttribute('aria-checked');
      if(check == 'true') {
        choiceImgs.imgs[i].setAttribute('tabindex', '0'); // make it focusable
      } else {
        // if radio -> element not focusable
        // if checkbox -> element still focusable
        choiceImgs.isRadio ? choiceImgs.imgs[i].removeAttribute('tabindex') : choiceImgs.imgs[i].setAttribute('tabindex', '0');
      }
    }
  };

  //initialize the ChoiceImgs objects
	var choiceImg = document.getElementsByClassName('js-choice-imgs');
	if( choiceImg.length > 0 ) {
		for( var i = 0; i < choiceImg.length; i++) {
			(function(i){new ChoiceImgs(choiceImg[i]);})(i);
		}
	};
}());