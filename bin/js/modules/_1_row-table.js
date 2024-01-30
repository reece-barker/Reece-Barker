// File#: _1_row-table
// Usage: codyhouse.co/license
(function() {
	var RowTable = function(element) {
    this.element = element;
    this.headerRows = this.element.getElementsByTagName('thead')[0].getElementsByTagName('th');
    this.tableRows = this.element.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    this.collapsedLayoutClass = 'row-table--collapsed';
    this.mainRowCellClass = 'row-table__th-inner';
    initTable(this);
  };

  function initTable(table) {
    checkTableLayour(table); // switch from a collapsed to an expanded layout

    // create additional table content
    addTableContent(table);

    // custom event emitted when window is resized
    table.element.addEventListener('update-row-table', function(event){
      checkTableLayour(table);
    });

    // mobile version - listent to click/key enter on the row -> expand it
    table.element.addEventListener('click', function(event){
      revealRowDetails(table, event);
    });
    table.element.addEventListener('keydown', function(event){
      if(event.keyCode && event.keyCode == 13 || event.key && event.key.toLowerCase() == 'enter') {
        revealRowDetails(table, event);
      }
    });
  };

  function checkTableLayour(table) {
    var layout = getComputedStyle(table.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
    Util.toggleClass(table.element, table.collapsedLayoutClass, layout == 'expanded');
  };

  function addTableContent(table) {
    // for the expanded version, add a ul with list of details for each table row
    for(var i = 0; i < table.tableRows.length; i++) {
      var content = '';
      var cells = table.tableRows[i].getElementsByClassName('row-table__cell');
      for(var j = 0; j < cells.length; j++) {
        if(j == 0 ) {
          Util.addClass(cells[j], 'js-'+table.mainRowCellClass);
          var cellLabel = cells[j].getElementsByClassName('row-table__th-inner');
          if(cellLabel.length > 0 ) cellLabel[0].innerHTML = cellLabel[0].innerHTML + '<i class="row-table__th-icon" aria-hidden="true"></i>'
        } else {
          content = content + '<li class="row-table__item"><span class="row-table__label">'+table.headerRows[j].innerHTML+':</span><span>'+cells[j].innerHTML+'</span></li>';
        }
      }
      content = '<ul class="row-table__list" aria-hidden="true">'+content+'</ul>';
      cells[0].innerHTML = '<input type="text" class="row-table__input" aria-hidden="true">'+cells[0].innerHTML + content;
    }
  };

  function revealRowDetails(table, event) {
    if(!event.target.closest('.js-'+table.mainRowCellClass) || event.target.closest('.row-table__list')) return;
    var row = event.target.closest('.js-'+table.mainRowCellClass);
    Util.toggleClass(row, 'row-table__cell--show-list', !Util.hasClass(row, 'row-table__cell--show-list'));
  };

  //initialize the RowTable objects
	var rowTables = document.getElementsByClassName('js-row-table');
	if( rowTables.length > 0 ) {
    var j = 0,
    rowTablesArray = [];
		for( var i = 0; i < rowTables.length; i++) {
      var beforeContent = getComputedStyle(rowTables[i], ':before').getPropertyValue('content');
      if(beforeContent && beforeContent !='' && beforeContent !='none') {
        (function(i){rowTablesArray.push(new RowTable(rowTables[i]));})(i);
        j = j + 1;
      }
    }
    
    if(j > 0) {
      var resizingId = false,
        customEvent = new CustomEvent('update-row-table');
      window.addEventListener('resize', function(event){
        clearTimeout(resizingId);
        resizingId = setTimeout(doneResizing, 300);
      });

      function doneResizing() {
        for( var i = 0; i < rowTablesArray.length; i++) {
          (function(i){rowTablesArray[i].element.dispatchEvent(customEvent)})(i);
        };
      };

      (window.requestAnimationFrame) // init table layout
        ? window.requestAnimationFrame(doneResizing)
        : doneResizing();
    }
	}
}());