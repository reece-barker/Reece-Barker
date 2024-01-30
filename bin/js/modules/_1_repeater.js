// File#: _1_repeater
// Usage: codyhouse.co/license
(function() {
  var Repeater = function(element) {
    this.element = element;
    this.blockWrapper = this.element.getElementsByClassName('js-repeater__list');
    if(this.blockWrapper.length < 1) return;
    this.blocks = false;
    getBlocksList(this);
    this.firstBlock = false;
    this.addNew = this.element.getElementsByClassName('js-repeater__add');
    this.cloneClass = this.element.getAttribute('data-repeater-class');
    this.inputName = this.element.getAttribute('data-repeater-input-name');
    initRepeater(this);
  };

  function initRepeater(element) {
    if(element.addNew.length < 1 || element.blocks.length < 1 || element.blockWrapper.length < 1 ) return;
    element.firstBlock = element.blocks[0].cloneNode(true);
    
    // detect click on a Remove button
    element.element.addEventListener('click', function(event) {
      var deleteBtn = event.target.closest('.js-repeater__remove');
      if(deleteBtn) {
        event.preventDefault();
        removeBlock(element, deleteBtn);
      }
    });

    // detect click on Add button
    element.addNew[0].addEventListener('click', function(event) {
      event.preventDefault();
      addBlock(element);
    });
  };

  function addBlock(element) {
    if(element.blocks.length > 0) {
      var clone = element.blocks[element.blocks.length - 1].cloneNode(true),
        nameToReplace = element.inputName.replace('[n]', '['+(element.blocks.length - 1)+']'),
        newName = element.inputName.replace('[n]', '['+element.blocks.length+']');
    } else {
      var clone =  element.firstBlock.cloneNode(true),
      nameToReplace = element.inputName.replace('[n]', '[0]'),
      newName = element.inputName.replace('[n]', '[0]');
    }
    
    if(element.cloneClass) Util.addClass(clone, element.cloneClass);
    // modify name/for/id attributes
    updateBlockAttrs(clone, nameToReplace, newName, true);

    element.blockWrapper[0].appendChild(clone);
    // update blocks list
    getBlocksList(element)
  };

  function removeBlock(element, trigger) {
    var block = trigger.closest('.js-repeater__item');
    if(block) {
      var index = Util.getIndexInArray(element.blocks, block);
      block.remove();
      // update blocks list
      getBlocksList(element);
      // need to reset all blocks after that -> name/for/id values
      for(var i = index; i < element.blocks.length; i++) {
        updateBlockAttrs(element.blocks[i], element.inputName.replace('[n]', '['+(i+1)+']'), element.inputName.replace('[n]', '['+i+']'));
      }
    }
  };

  function updateBlockAttrs(block, nameToReplace, newName, reset) {
    var nameElements = block.querySelectorAll('[name^="'+nameToReplace+'"]'),
      forElements = block.querySelectorAll('[for^="'+nameToReplace+'"]'),
      idElements = block.querySelectorAll('[id^="'+nameToReplace+'"]');

    for(var i = 0; i < nameElements.length; i++) {
      var nameAttr = nameElements[i].getAttribute('name');
      nameElements[i].setAttribute('name', nameAttr.replace(nameToReplace, newName));
      if(reset && nameElements[i].value) nameElements[i].value = '';
    }

    for(var i = 0; i < forElements.length; i++) {
      var forAttr = forElements[i].getAttribute('for');
      forElements[i].setAttribute('for', forAttr.replace(nameToReplace, newName));
    }

    for(var i = 0; i < idElements.length; i++) {
      var idAttr = idElements[i].getAttribute('id');
      idElements[i].setAttribute('id', idAttr.replace(nameToReplace, newName));
    }
  };

  function getBlocksList(element) {
    element.blocks = Util.getChildrenByClassName(element.blockWrapper[0], 'js-repeater__item');
  };

  //initialize the Repeater objects
	var repeater = document.getElementsByClassName('js-repeater');
	if( repeater.length > 0 ) {
		for( var i = 0; i < repeater.length; i++) {
			(function(i){new Repeater(repeater[i]);})(i);
		}
	};
}());