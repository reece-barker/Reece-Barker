// File#: _1_adv-multiple-custom-select
// Usage: codyhouse.co/license
(function() {
  var AdvMultiSelect = function(element) {
    this.element = element;
    this.select = this.element.getElementsByTagName('select')[0];
    this.optGroups = this.select.getElementsByTagName('optgroup');
    this.options = this.select.getElementsByTagName('option');
    this.optionData = getOptionsData(this); // create custom templates
    this.selectId = this.select.getAttribute('id');
    this.selectLabel = document.querySelector('[for='+this.selectId+']')
    this.list = this.element.getElementsByClassName('js-advm-select__list')[0];
    // used for keyboard/mouse multiple selection
    this.startSelection = false; 
    this.latestSelection = false;
    // detect touch device
    this.touchDevice = false;
    // reset buttons
    this.resetBtns = (this.selectId) ? document.querySelectorAll('[aria-controls="'+this.selectId +'"]') : [];

    initAdvMultiSelect(this); // init markup
    initAdvMultiSelectEvents(this); // init event listeners
  };

  function getOptionsData(select) {
    var obj = [],
      dataset = select.options[0].dataset;

    function camelCaseToDash( myStr ) {
      return myStr.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
    }
    for (var prop in dataset) {
      if (Object.prototype.hasOwnProperty.call(dataset, prop)) {
        obj.push(camelCaseToDash(prop));
      }
    }
    return obj;
  };

  function initAdvMultiSelect(select) {
    // create custom structure
    createAdvStructure(select);
    // store all custom options and labels
    select.customOptions = select.list.getElementsByClassName('js-advm-select__option');
    select.customLabels = select.list.getElementsByClassName('js-advm-select__label');
    // make custom list focusable
    select.list.setAttribute('tabindex', 0);
    // hide native select and show custom structure
    Util.addClass(select.select, 'is-hidden');
    Util.removeClass(select.list, 'is-hidden');
  };

  function initAdvMultiSelectEvents(select) {
    if(select.selectLabel) {
      // move focus to custom select list when clicking on <select> label
      select.selectLabel.addEventListener('click', function(){
        select.list.focus();
      });
    }

    // new option is selected in custom list
    select.list.addEventListener('click', function(event){
      var target = event.target,
        option = target.closest('.js-advm-select__option');
      if(!option) return;
      mouseSelection(select, option, event);
      select.touchDevice = false;
    });

    select.list.addEventListener('touchend', function(event){ // touch devices
      select.touchDevice = true;
    });

    // keyboard navigation
    select.list.addEventListener('keydown', function(event){
      // use up/down arrows or space key to select new options
      if(event.keyCode && event.keyCode == 38 || event.key && event.key.toLowerCase() == 'arrowup') {
        event.preventDefault();
        keyboardSelection(select, 'prev', event);
      } else if(event.keyCode && event.keyCode == 40 || event.key && event.key.toLowerCase() == 'arrowdown') {
        event.preventDefault();
        keyboardSelection(select, 'next', event);
      } else if(event.keyCode && event.keyCode == 32 || event.key && event.key.toLowerCase() == ' ') {
        event.preventDefault();
        var option = document.activeElement.closest('.js-advm-select__option');
        if(!option) return;
        selectOption([option], !(option.hasAttribute('aria-selected') && option.getAttribute('aria-selected') == 'true'));
        select.startSelection = option;
        select.latestSelection = select.startSelection;
      }
    });

    // reset selection
    if(select.resetBtns.length > 0) {
      for(var i = 0; i < select.resetBtns.length; i++) {
        select.resetBtns[i].addEventListener('click', function(event){
          event.preventDefault();
          resetSelect(select);
        });
      }
    }
  };

  function createAdvStructure(select) {
    // store optgroup and option structure
    var optgroup = select.list.querySelector('[role="group"]'),
      option = select.list.querySelector('.js-advm-select__option'),
      optgroupClone = false,
      optgroupLabel = false,
      optionClone = false;
    if(optgroup) {
      optgroupClone = optgroup.cloneNode();
      optgroupLabel = select.list.querySelector('.js-advm-select__label');
    }
    if(option) optionClone = option.cloneNode(true);

    var listCode = '';

    if(select.optGroups.length > 0) {
      for(var i = 0; i < select.optGroups.length; i++) {
        listCode = listCode + getOptGroupCode(select, select.optGroups[i], optgroupClone, optionClone, optgroupLabel, i);
      }
    } else {
      for(var i = 0; i < select.options.length; i++) {
        listCode = listCode + getOptionCode(select, select.options[i], optionClone);
      }
    }

    select.list.innerHTML = listCode;
  };

  function getOptGroupCode(select, optGroup, optGroupClone, optionClone, optgroupLabel, index) {
    if(!optGroupClone || !optionClone) return '';
    var code = '';
    var options = optGroup.getElementsByTagName('option');
    for(var i = 0; i < options.length; i++) {
      code = code + getOptionCode(select, options[i], optionClone);
    }
    if(optgroupLabel) {
      var label = optgroupLabel.cloneNode(true);
      var id = label.getAttribute('id') + '-'+index;
      label.setAttribute('id', id);
      optGroupClone.setAttribute('describedby', id);
      code = label.outerHTML.replace('{optgroup-label}', optGroup.getAttribute('label')) + code;
    } 
    optGroupClone.innerHTML = code;
    return optGroupClone.outerHTML;
  };

  function getOptionCode(select, option, optionClone) {
    optionClone.setAttribute('data-value', option.value);
    option.selected ? optionClone.setAttribute('aria-selected', 'true') : optionClone.removeAttribute('aria-selected');
    var optionHtml = optionClone.outerHTML;
    optionHtml = optionHtml.replace('{option-label}', option.text);
    for(var i = 0; i < select.optionData.length; i++) {
      optionHtml = optionHtml.replace('{'+select.optionData[i]+'}', option.getAttribute('data-'+select.optionData[i]));
    }
    return optionHtml;
  };

  function mouseSelection(select, option, event) {
    var isSelected = (option.hasAttribute('aria-selected') && option.getAttribute('aria-selected') == 'true'); // option already selected
    if((event.ctrlKey || event.metaKey) && !select.touchDevice) {
      // add/remove clicked element from the selection 
      selectOption([option], !isSelected);
      if(!isSelected) {
        select.startSelection = option;
        select.latestSelection = select.startSelection;
      }
    } else if(event.shiftKey && !isSelected) {
      // select all options between latest selected and clicked option 
      selectInBetween(select, option);
    } else {
      if(!select.touchDevice) {
        // deselect all others and select this one only
        singleSelect(select, option);
      } else {
        // add this item to the selection or deselect it
       selectOption([option], !isSelected);
      }
    }
    select.startSelection = option;
    select.latestSelection = select.startSelection;
    // reset tabindex
    resetTabindex(select);
    // new option has been selected -> update native <select> element
    updateNativeSelect(select);
  };

  function keyboardSelection(select, direction, event) {
    var lastSelectedIndex = -1;
    if(select.latestSelection) {
      lastSelectedIndex = Util.getIndexInArray(select.customOptions, select.latestSelection);
    }
    if(event.ctrlKey || event.metaKey) {
      // in this case we are only moving the focus, so take latest focused option
      var focusedOption = document.activeElement.closest('.js-advm-select__option');
      if(focusedOption) lastSelectedIndex = Util.getIndexInArray(select.customOptions, focusedOption);
    }
    var index = (direction == 'next') ? lastSelectedIndex + 1: lastSelectedIndex - 1;
    if(index < 0 || index >= select.customOptions.length) return;
    var option = select.customOptions[index];

    if(event.ctrlKey || event.metaKey) {
      // ctrl/command + up/down -> move focus
      Util.moveFocus(option);
    } else if(event.shiftKey) {
      // shift + up/down -> select new item
      //remove previously selected options
      selectOption(select.list.querySelectorAll('[aria-selected="true"]'), false);
      // select new options
      selectInBetween(select, option);
      select.latestSelection = option;
    } else {
      // only up/down -> deselect all others and select this one only
      singleSelect(select, option);
      select.startSelection = option;
      select.latestSelection = select.startSelection;
    }
    // reset tabindex
    if(!event.ctrlKey && !event.metaKey) resetTabindex(select);
    // new option has been selected -> update native <select> element
    updateNativeSelect(select);
  };

  function selectInBetween(select, option) {
    // keyboard/mouse navigation + shift -> select optiong between to elements
    var optionsBetween = getOptionsBetween(select, option);
    selectOption(optionsBetween, true);
  };

  function singleSelect(select, option) {
    // select a single option, deselecting all the others
    var selectedOptions = select.list.querySelectorAll('[aria-selected="true"]');
    selectOption(selectedOptions, false);
    selectOption([option], true);
  };

  function selectOption(options, bool) {
    for(var i = 0; i < options.length; i++) {
      (bool) ? options[i].setAttribute('aria-selected', 'true') : options[i].removeAttribute('aria-selected');
    }
    if(bool) options[options.length - 1].scrollIntoView({block: 'nearest'});
  };

  function getOptionsBetween(select, option) {
    var options = [];
    var optIndex = Util.getIndexInArray(select.customOptions, option),
      latestOptIndex = 0;
    if(select.startSelection) {
      latestOptIndex = Util.getIndexInArray(select.customOptions, select.startSelection);
    }
    var min = Math.min(optIndex, latestOptIndex),
      max = Math.max(optIndex, latestOptIndex);
    for(var i = min; i <= max; i++) {
      options.push(select.customOptions[i]);
    }
    return options;
  };

  function updateNativeSelect(select) {
    // update native select element
    for(var i = 0; i < select.customOptions.length; i++) {
      select.options[i].selected = (select.customOptions[i].hasAttribute('aria-selected') && select.customOptions[i].getAttribute('aria-selected') == 'true')
    }
    select.select.dispatchEvent(new CustomEvent('change', {bubbles: true})); // trigger change event
  };

  function resetTabindex(select) {
    var focusableEl = select.list.querySelectorAll('[tabindex]');
    for(var i = 0; i < focusableEl.length; i++) {
      focusableEl[i].removeAttribute('tabindex');
    }
    // move focus on list
    select.list.focus();
  };

  function resetSelect(select) {
    selectOption(select.list.querySelectorAll('[aria-selected="true"]'), false);
    updateNativeSelect(select);
  };

  //initialize the AdvMultiSelect objects
  var advMultiSelect = document.getElementsByClassName('js-advm-select');
  if( advMultiSelect.length > 0 ) {
    for( var i = 0; i < advMultiSelect.length; i++) {
      (function(i){new AdvMultiSelect(advMultiSelect[i]);})(i);
    }
  }
}());