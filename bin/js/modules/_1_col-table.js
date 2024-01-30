// File#: _1_col-table
// Usage: codyhouse.co/license
(function() {
  var ColTable = function(element) {
    this.element = element;
    this.header = this.element.getElementsByTagName('thead')[0];
    this.body = this.element.getElementsByTagName('tbody')[0];
    this.headerRows = this.header.getElementsByTagName('th');
    this.tableRows = this.body.getElementsByTagName('tr');
    this.collapsedLayoutClass = 'cl-table--collapsed';
    this.mainColCellClass = 'cl-table__th-inner';
    initTable(this);
  };

  function initTable(table) {
    // create additional table content + set table roles
    addTableContent(table);
    setTableRoles(table);

    // custom event emitted when window is resized
    table.element.addEventListener('update-col-table', function(event){
      checkTableLayour(table);
    });

    // mobile version - listent to click/key enter on the row -> expand it
    table.element.addEventListener('click', function(event){
      revealColDetails(table, event);
    });
    table.element.addEventListener('keydown', function(event){
      if(event.keyCode && event.keyCode == 13 || event.key && event.key.toLowerCase() == 'enter') {
        revealColDetails(table, event);
      }
    });
  };

  function checkTableLayour(table) {
    var layout = getComputedStyle(table.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    Util.toggleClass(table.element, table.collapsedLayoutClass, layout != 'expanded');
  };

  function addTableContent(table) {
    // for the collapsed version, add a ul with list of details for each table column heading
    var content = [];
    for(var i = 0; i < table.tableRows.length; i++) {
      var cells = table.tableRows[i].getElementsByClassName('cl-table__cell');
      for(var j = 1; j < cells.length; j++) {
        if( i == 0) content[j] = '';
        content[j] = content[j] + '<li class="cl-table__item"><span class="cl-table__label">'+cells[0].innerHTML+':</span><span>'+cells[j].innerHTML+'</span></li>';
      }
    }
    // append new content to each col th
    for(var j = 1; j < table.headerRows.length; j++) {
      var colContent = '<input type="text" class="cl-table__input" aria-hidden="true"><span class="cl-table__th-inner">'+table.headerRows[j].innerHTML+'<i class="cl-table__th-icon" aria-hidden="true"></i></span><ul class="cl-table__list" aria-hidden="true">'+content[j]+'</ul>';
      table.headerRows[j].innerHTML = colContent;
      Util.addClass(table.headerRows[j], 'js-'+table.mainColCellClass);
    }
  };

  function setTableRoles(table) {
    var trElements = table.header.getElementsByTagName('tr');
    for(var i=0; i < trElements.length; i++) {
      trElements[i].setAttribute('role', 'row');
    }
    var thElements = table.header.getElementsByTagName('th');
    for(var i=0; i < thElements.length; i++) {
      thElements[i].setAttribute('role', 'cell');
    }
  };

  function revealColDetails(table, event) {
    var col = event.target.closest('.js-'+table.mainColCellClass);
    if(!col || event.target.closest('.cl-table__list')) return;
    Util.toggleClass(col, 'cl-table__cell--show-list', !Util.hasClass(col, 'cl-table__cell--show-list'));
  };

  //initialize the ColTable objects
	var colTables = document.getElementsByClassName('js-cl-table');
	if( colTables.length > 0 ) {
    var j = 0,
    colTablesArray = [];
		for( var i = 0; i < colTables.length; i++) {
      var beforeContent = getComputedStyle(colTables[i], ':before').getPropertyValue('content');
      if(beforeContent && beforeContent !='' && beforeContent !='none') {
        (function(i){colTablesArray.push(new ColTable(colTables[i]));})(i);
        j = j + 1;
      }
    }
    
    if(j > 0) {
      var resizingId = false,
        customEvent = new CustomEvent('update-col-table');
      window.addEventListener('resize', function(event){
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 300);
      });

      function doneResizing() {
        for( var i = 0; i < colTablesArray.length; i++) {
          (function(i){colTablesArray[i].element.dispatchEvent(customEvent)})(i);
        };
      };

      (window.requestAnimationFrame) // init table layout
        ? window.requestAnimationFrame(doneResizing)
        : doneResizing();
    }
	}
}());