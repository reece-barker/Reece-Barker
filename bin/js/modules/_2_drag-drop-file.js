// File#: _2_drag-drop-file
// Usage: codyhouse.co/license
(function() {
  var Ddf = function(opts) {
    this.options = Util.extend(Ddf.defaults , opts);
    this.element = this.options.element;
    this.area = this.element.getElementsByClassName('js-ddf__area');
    this.input = this.element.getElementsByClassName('js-ddf__input');
    this.label = this.element.getElementsByClassName('js-ddf__label');
    this.labelEnd = this.element.getElementsByClassName('js-ddf__files-counter');
    this.labelEndMessage = this.labelEnd.length > 0 ? this.labelEnd[0].innerHTML.split('%') : false;
    this.droppedFiles = [];
    this.lastDroppedFiles = [];
    this.options.acceptFile = [];
    this.progress = false;
    this.progressObj = [];
    this.progressCompleteClass = 'ddf__progress--complete';
    initDndMessageResponse(this);
    initProgress(this, 0, 1, false);
    initDdf(this);
  };

  function initDndMessageResponse(element) { 
    // use this function to initilise the response of the Ddf when files are dropped (e.g., show list of files, update label message, show loader)
    if(element.options.showFiles) {
      element.filesList = element.element.getElementsByClassName('js-ddf__list');
      if(element.filesList.length == 0) return;
      element.fileItems = element.filesList[0].getElementsByClassName('js-ddf__item');
      if(element.fileItems.length > 0) Util.addClass(element.fileItems[0], 'is-hidden');+
      // listen for click on remove file action
      initRemoveFile(element);
    } else { // do not show list of files
      if(element.label.length == 0) return;
      if(element.options.upload) element.progress = element.element.getElementsByClassName('js-ddf__progress');
    }
  };

  function initDdf(element) {
    if(element.input.length > 0 ) { // store accepted file format
      var accept = element.input[0].getAttribute('accept');
      if(accept) element.options.acceptFile = accept.split(',').map(function(element){ return element.trim();})
    }

    initDndInput(element);
    initDndArea(element);
  };

  function initDndInput(element) { // listen to changes in the input file element
    if(element.input.length == 0 ) return;
    element.input[0].addEventListener('change', function(event){
      if(element.input[0].value == '') return; 
      storeDroppedFiles(element, element.input[0].files);
      element.input[0].value = '';
      updateDndArea(element);
    });
  };

  function initDndArea(element) { //drag event listeners
    element.element.addEventListener('dragenter', handleEvent.bind(element));
    element.element.addEventListener('dragover', handleEvent.bind(element));
    element.element.addEventListener('dragleave', handleEvent.bind(element));
    element.element.addEventListener('drop', handleEvent.bind(element));
  };

  function handleEvent(event) {
    switch(event.type) {
      case 'dragenter': 
      case 'dragover':
        preventDefaults(event);
        Util.addClass(this.area[0], 'ddf__area--file-hover');
        break;
      case 'dragleave':
        preventDefaults(event);
        Util.removeClass(this.area[0], 'ddf__area--file-hover');
        break;
      case 'drop':
        preventDefaults(event);
        storeDroppedFiles(this, event.dataTransfer.files);
        updateDndArea(this);
        break;
    }
  };

  function storeDroppedFiles(element, fileData) { // check files size/format/number
    element.lastDroppedFiles = [];
    if(element.options.replaceFiles) element.droppedFiles = [];
    Array.prototype.push.apply(element.lastDroppedFiles, fileData);
    filterUploadedFiles(element); // remove files that do not respect format/size
    element.droppedFiles = element.droppedFiles.concat(element.lastDroppedFiles);
    if(element.options.maxFiles) filterMaxFiles(element); // check max number of files
  };

  function updateDndArea(element) { // update UI + emit events
    if(element.options.showFiles) updateDndList(element);
    else {
      updateDndAreaMessage(element);
      Util.addClass(element.area[0], 'ddf__area--file-dropped');
    }
    Util.removeClass(element.area[0], 'ddf__area--file-hover');
    emitCustomEvents(element, 'filesUploaded', false);
  };

  function preventDefaults(event) {
    event.preventDefault();
    event.stopPropagation();
  };

  function filterUploadedFiles(element) {
    // check max weight
    if(element.options.maxSize) filterMaxWeight(element);
    // check file format
    if(element.options.acceptFile.length > 0) filterAcceptFile(element);
  };

  function filterMaxWeight(element) { // filter files by size
    var rejected = [];
    for(var i = element.lastDroppedFiles.length - 1; i >= 0; i--) {
      if(element.lastDroppedFiles[i].size > element.options.maxSize*1000) {
        var rejectedFile = element.lastDroppedFiles.splice(i, 1);
        rejected.push(rejectedFile[0].name);
      }
    }
    if(rejected.length > 0) {
      emitCustomEvents(element, 'rejectedWeight', rejected);
    }
  };

  function filterAcceptFile(element) { // filter files by format
    var rejected = [];
    for(var i = element.lastDroppedFiles.length - 1; i >= 0; i--) {
      if( !formatInList(element, i) ) {
        var rejectedFile = element.lastDroppedFiles.splice(i, 1);
        rejected.push(rejectedFile[0].name);
      }
    }

    if(rejected.length > 0) {
      emitCustomEvents(element, 'rejectedFormat', rejected);
    }
  };

  function formatInList(element, index) {
    var formatArray = element.lastDroppedFiles[index].type.split('/'),
      type = formatArray[0]+'/*',
      extension = formatArray.length > 1 ? formatArray[1]: false;

    var accepted = false;
    for(var i = 0; i < element.options.acceptFile.length; i++) {
      if(element.lastDroppedFiles[index].type == element.options.acceptFile[i] || type == element.options.acceptFile[i] || (extension && extension == element.options.acceptFile[i]) ) {
        accepted = true;
        break;
      }

      if(extension && extensionInList(extension, element.options.acceptFile[i])) { // extension could be list of format; e.g. for the svg it is svg+xml
        accepted = true;
        break;
      }
    }
    return accepted;
  };

  function extensionInList(extensionList, extension) {
    // extension could be .svg, .pdf, ..
    // extensionList could be png, svg+xml, ...
    if('.'+extensionList  == extension) return true;
    var accepted = false;
    var extensionListArray = extensionList.split('+');
    for(var i = 0; i < extensionListArray.length; i++) {
      if('.'+extensionListArray[i] == extension) {
        accepted = true;
        break;
      }
    }
    return accepted;
  }

  function filterMaxFiles(element) { // check number of uploaded files
    if(element.options.maxFiles >= element.droppedFiles.length) return; 
    var rejected = [];
    while (element.droppedFiles.length > element.options.maxFiles) {
      var rejectedFile = element.droppedFiles.pop();
      element.lastDroppedFiles.pop();
      rejected.push(rejectedFile.name);
    }

    if(rejected.length > 0) {
      emitCustomEvents(element, 'rejectedNumber', rejected);
    }
  };

  function updateDndAreaMessage(element) {
    if(element.progress && element.progress[0]) { // reset progress bar 
      element.progressObj[0].setProgressBarValue(0);
      Util.toggleClass(element.progress[0], 'is-hidden', element.droppedFiles.length == 0);
      Util.removeClass(element.progress[0], element.progressCompleteClass);
    }

    if(element.droppedFiles.length > 0 && element.labelEndMessage) {
      var finalMessage = element.labelEnd.innerHTML;
      if(element.labelEndMessage.length > 3) {
        finalMessage = element.droppedFiles.length > 1 
          ? element.labelEndMessage[0] + element.labelEndMessage[2] + element.labelEndMessage[3]
          : element.labelEndMessage[0] + element.labelEndMessage[1] + element.labelEndMessage[3];
      }
      element.labelEnd[0].innerHTML = finalMessage.replace('{n}', element.droppedFiles.length);
    }
  };

  function updateDndList(element) {
    // create new list of files to be appended
    if(!element.fileItems || element.fileItems.length == 0) return
    var clone = element.fileItems[0].cloneNode(true),
      string = '';
    Util.removeClass(clone, 'is-hidden');
    for(var i = 0; i < element.lastDroppedFiles.length; i++) {
      clone.getElementsByClassName('js-ddf__file-name')[0].textContent = element.lastDroppedFiles[i].name;
      string = clone.outerHTML + string;
    }

    if(element.options.replaceFiles) { // replace all files in list with new files
      string = element.fileItems[0].outerHTML + string;
      element.filesList[0].innerHTML = string;
    } else {
      element.fileItems[0].insertAdjacentHTML('afterend', string);
    }

    if(element.options.upload) storeMultipleProgress(element);

    Util.toggleClass(element.filesList[0], 'is-hidden', element.droppedFiles.length == 0);
  };

  function initRemoveFile(element) { // if list of files is visible - option to remove file from list
    element.filesList[0].addEventListener('click', function(event){
      if(!event.target.closest('.js-ddf__remove-btn')) return;
      event.preventDefault();
      var item = event.target.closest('.js-ddf__item'),
        index = Util.getIndexInArray(element.filesList[0].getElementsByClassName('js-ddf__item'), item);
      
      var removedFile = element.droppedFiles.splice(element.droppedFiles.length - index, 1);
      if(element.progress && element.progress.length > element.droppedFiles.length - index) {
        element.progress.splice();
      }
      // check if we need to remove items form the lastDroppedFiles array
      var lastDroppedIndex = element.lastDroppedFiles.length - index;
      if(lastDroppedIndex >= 0 && lastDroppedIndex < element.lastDroppedFiles.length - 1) {
        element.lastDroppedFiles.splice(element.lastDroppedFiles.length - index, 1);
      }
      item.remove();
      emitCustomEvents(element, 'fileRemoved', removedFile);
    });

  };

  function storeMultipleProgress(element) { // handle progress bar elements
    element.progress = [];
    var delta = element.droppedFiles.length - element.lastDroppedFiles.length;
    for(var i = 0; i < element.lastDroppedFiles.length; i++) {
      element.progress[i] = element.fileItems[element.droppedFiles.length - delta - i].getElementsByClassName('js-ddf__progress')[0];
    }
    initProgress(element, 0, element.lastDroppedFiles.length, true);
  };

  function initProgress(element, start, end, bool) {
    element.progressObj = [];
    if(!element.progress || element.progress.length == 0) return;
    for(var i = start; i < end; i++) {(function(i){
      element.progressObj.push(new CProgressBar(element.progress[i]));
      if(bool) Util.removeClass(element.progress[i], 'is-hidden');
      // listen for 100% progress
      element.progress[i].addEventListener('updateProgress', function(event){
        if(event.detail.value == 100 ) Util.addClass(element.progress[i], element.progressCompleteClass);
      });
    })(i);}
  };

  function emitCustomEvents(element, eventName, detail) {
		var event = new CustomEvent(eventName, {detail: detail});
		element.element.dispatchEvent(event);
  };
  
  Ddf.defaults = {
    element : '',
    maxFiles: false, // max number of files
    maxSize: false, // max weight - set in kb
    showFiles: false, // show list of selected files
    replaceFiles: true, // when new files are loaded -> they replace the old ones
    upload: false // show progress bar for the upload process
  };

  window.Ddf = Ddf;
}());