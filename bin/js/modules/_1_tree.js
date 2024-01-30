// File#: _1_tree
// Usage: codyhouse.co/license
(function() {
  var Tree = function(element) {
    this.element = element;
    this.contentEditable = treeIsEditable(this);
    initTree(this);
  };

  function treeIsEditable(element) {
    var editableAttr = element.element.getAttribute('data-tree-content-editable');
    return editableAttr && editableAttr == 'true';
  };

  function initTree(element) {
    element.element.addEventListener('click', function(event){
      var control = event.target.closest('.js-tree__node-control');
      if(control) {
        var node = control.closest('.tree__node');
        if(node) Util.toggleClass(node, 'tree__node--expanded', !Util.hasClass(node, 'tree__node--expanded'));
      } else if(element.contentEditable) {
        selectItem(element, event.target);
      }
    });

    if(element.contentEditable) initContentEditable(element);

    // keyboard navigation
    initKeyboardNav(element);
  };

  function selectItem(element, target) {
    var item = target.closest('.tree__item');
    if(item) {
      var selectedItem = element.element.getElementsByClassName('tree__item--selected');
      if(selectedItem.length > 0) Util.removeClass(selectedItem[0], 'tree__item--selected');
      Util.addClass(item, 'tree__item--selected');
    }
  };

  function initContentEditable(element) {
    element.element.addEventListener('dblclick', function(event){
      // make label editable on double-click
      var label = event.target.closest('.tree__label');
      if(label) resetEditing(element, label, true);
    });

    element.element.addEventListener('focusout', function(event){
      // if label loses focus -> remove the contenteditable attribute
      var editingLabel = event.target.closest('.tree__label[contenteditable="true"]');
      if(editingLabel) resetEditing(element, editingLabel, false);
    });
  };

  function initKeyboardNav(element) {
    element.element.addEventListener('keydown', function(event) {
      var focusedNode = document.activeElement.closest('.tree__node');
      if(!focusedNode) return;
      var isGroupNode = focusedNode.querySelector('.tree__nodes'),
        nodeIsEditing = event.target.closest('.tree__label[contenteditable="true"]');
      
      if((event.key && event.key.toLowerCase() === "arrowright") || (event.keyCode && event.keyCode === "39")) {
        if(!isGroupNode || nodeIsEditing) return;
        event.preventDefault();
        // if this is a group -> open it
        Util.addClass(focusedNode, 'tree__node--expanded');
      } else if ((event.key && event.key.toLowerCase() === "arrowleft") || (event.keyCode && event.keyCode === "37")) {
        if(!isGroupNode || nodeIsEditing) return;
        event.preventDefault();
        // if this is a group -> close it
        Util.removeClass(focusedNode, 'tree__node--expanded');
      } else if ((event.key && event.key.toLowerCase() === "arrowdown") || (event.keyCode && event.keyCode === "40")) {
        event.preventDefault();
        var nextNode = getNextNode(focusedNode, isGroupNode);
        moveTreeFocused(element, nextNode);
      } else if ((event.key && event.key.toLowerCase() === "arrowup") || (event.keyCode && event.keyCode === "38")) {
        event.preventDefault();
        var prevNode = getPrevNode(focusedNode);
        moveTreeFocused(element, prevNode);
			} else if ( element.contentEditable && (event.key && event.key.toLowerCase() === "enter") || (event.keyCode && event.keyCode === "13")) {
        // user pressed the Enter key - only for content editable 
        var editingLabel = event.target.closest('.tree__label[contenteditable="true"]'),
          labelToEdit = event.target.closest('.tree__label');
        if(editingLabel) { // label was being edited
          event.preventDefault();
          resetEditing(element, editingLabel, false);
        } else if(labelToEdit) { // lable was in focus -> allow editing
          event.preventDefault();
          resetEditing(element, labelToEdit, true);
        } 
      } else if ( element.contentEditable && (event.key && event.key.toLowerCase() === "escape") || (event.keyCode && event.keyCode === "27")) {
        // if user was editing an element -> resetEditing
        var editingLabel = event.target.closest('.tree__label[contenteditable="true"]');
        if(editingLabel) { // label was being edited
          event.preventDefault();
          resetEditing(element, editingLabel, false);
        }
      }
    });
  };

  function getPrevNode(node) {
    var prevSibling = node.previousElementSibling;
    if(!prevSibling) {
      // get parent
      var parent = node.parentElement;
      if(!parent) return false;
      return parent.closest('.tree__node');
    } else if(prevSibling.classList.contains('tree__node--expanded')) {
      return getLastChild(prevSibling);
    } else {
      return prevSibling;
    }
  };

  function getLastChild(node) { // recursive function used to grab the prev element to select
    var children = Util.getChildrenByClassName(node.querySelector('.tree__nodes'), 'tree__node');
    if(children.length > 0) {
      var lastChild = children[children.length - 1];
      console.log(lastChild);
      if(lastChild.classList.contains('tree__node--expanded')) {
        return getLastChild(lastChild);
      } else {
        return lastChild;
      }
    } else {
      return node;
    }
  };

  function getNextNode(node, isGroupNode) {
    var nextSibling = false;
    if(isGroupNode && Util.hasClass(node, 'tree__node--expanded')) {
      // expanded group -> take children if any
      var children = node.getElementsByClassName('tree__node');
      if(children.length > 0) {
        nextSibling = children[0];
      } else {
        nextSibling = node.nextElementSibling;
      }
    } else {
      nextSibling = node.nextElementSibling;
    }
    return getNotFalseNextElement(node, nextSibling);
  };

  function getNotFalseNextElement(node, nextSibling) { // recursive function used to grab the next element to select
    if(nextSibling) return nextSibling;
    // element does not have siblings to return -> get parent and check for next not false sibling
    var parent = node.parentElement;
    if(!parent) return false;
    var parentItem = parent.closest('.tree__node');
    if(parentItem) return getNotFalseNextElement(parentItem, parentItem.nextElementSibling);
    else return false;
  };

  function moveTreeFocused(element, node) { // new node has been selected using the keyboard (up/down arrows)
    if(!node) return;
    var isGroupNode = node.querySelector('.tree__nodes');
    // move focus to anchor/button or to span (content-editable variation)
    var focusEl;
    if(element.contentEditable) {
      focusEl = node.querySelector('.tree__label');
    } else {
      focusEl = isGroupNode ? node.querySelector('.js-tree__node-control') : node.querySelector('a');
    }
    if(focusEl) focusEl.focus();
    // content-editable -> move also the selected class
    if(element.contentEditable) selectItem(element, focusEl);
  };

  function resetEditing(element, label, bool) {
    if(!label) return;
    Util.toggleClass(label.closest('.tree__item'), 'tree__item--editing', bool);
    if(bool) { // make label editable
      label.setAttribute('contenteditable', 'true');
      selectText(label);
    } else { // label not editable
      label.removeAttribute('contenteditable');
      // emit custom event to keep track of the updated labels
		  element.element.dispatchEvent(new CustomEvent('labelEdited', {detail: label}));
    }
  };

  function selectText(element) {
    // when label is being editied -> select all its text
    if (document.body.createTextRange) {
      var range = document.body.createTextRange();
      range.moveToElementText(element);
      range.select();
    } else if (window.getSelection) {
      var selection = window.getSelection();        
      var range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  //initialize the Tree objects
  var trees = document.getElementsByClassName('js-tree');
	if( trees.length > 0) {
		for( var i = 0; i < trees.length; i++) {
      new Tree(trees[i]);
    }
	}
}());