// File#: _1_looping_tabs
// Usage: codyhouse.co/license
(function() { 
  var LoopTab = function(opts) {
    this.options = Util.extend(LoopTab.defaults , opts);
		this.element = this.options.element;
		this.tabList = this.element.getElementsByClassName('js-loop-tabs__controls')[0];
		this.listItems = this.tabList.getElementsByTagName('li');
		this.triggers = this.tabList.getElementsByTagName('a');
		this.panelsList = this.element.getElementsByClassName('js-loop-tabs__panels')[0];
    this.panels = Util.getChildrenByClassName(this.panelsList, 'js-loop-tabs__panel');
    this.assetsList = this.element.getElementsByClassName('js-loop-tabs__assets')[0];
		this.assets = this.assetsList.getElementsByTagName('li');
		this.videos = getVideoElements(this);
    this.panelShowClass = 'loop-tabs__panel--selected';
		this.assetShowClass = 'loop-tabs__asset--selected';
		this.assetExitClass = 'loop-tabs__asset--exit';
    this.controlActiveClass = 'loop-tabs__control--selected';
    // autoplay
    this.autoplayPaused = false;
		this.loopTabAutoId = false;
		this.loopFillAutoId = false;
		this.loopFill = 0;
		initLoopTab(this);
	};
	
	function getVideoElements(tab) {
		var videos = [];
		for(var i = 0; i < tab.assets.length; i++) {
			var video = tab.assets[i].getElementsByTagName('video');
			videos[i] = video.length > 0 ? video[0] : false;
		}
		return videos;
	};
  
  function initLoopTab(tab) {
    //set initial aria attributes
		tab.tabList.setAttribute('role', 'tablist');
		for( var i = 0; i < tab.triggers.length; i++) {
			var bool = Util.hasClass(tab.triggers[i], tab.controlActiveClass),
        panelId = tab.panels[i].getAttribute('id');
			tab.listItems[i].setAttribute('role', 'presentation');
			Util.setAttributes(tab.triggers[i], {'role': 'tab', 'aria-selected': bool, 'aria-controls': panelId, 'id': 'tab-'+panelId});
			Util.addClass(tab.triggers[i], 'js-loop-tabs__trigger'); 
      Util.setAttributes(tab.panels[i], {'role': 'tabpanel', 'aria-labelledby': 'tab-'+panelId});
      Util.toggleClass(tab.panels[i], tab.panelShowClass, bool);
			Util.toggleClass(tab.assets[i], tab.assetShowClass, bool);
			
			resetVideo(tab, i, bool); // play/pause video if available

			if(!bool) tab.triggers[i].setAttribute('tabindex', '-1'); 
		}
		// add autoplay-off class if needed
		!tab.options.autoplay && Util.addClass(tab.element, 'loop-tabs--autoplay-off');
		//listen for Tab events
		initLoopTabEvents(tab);
  };

  function initLoopTabEvents(tab) {
		if(tab.options.autoplay) { 
			initLoopTabAutoplay(tab); // init autoplay
			// pause autoplay if user is interacting with the tabs
			tab.element.addEventListener('focusin', function(event){
				pauseLoopTabAutoplay(tab);
				tab.autoplayPaused = true;
			});
			tab.element.addEventListener('focusout', function(event){
				tab.autoplayPaused = false;
				initLoopTabAutoplay(tab);
			});
		}

    //click on a new tab -> select content
		tab.tabList.addEventListener('click', function(event) {
			if( event.target.closest('.js-loop-tabs__trigger') ) triggerLoopTab(tab, event.target.closest('.js-loop-tabs__trigger'), event);
		});
		
    //arrow keys to navigate through tabs 
		tab.tabList.addEventListener('keydown', function(event) {
			if( !event.target.closest('.js-loop-tabs__trigger') ) return;
			if( event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright' ) {
				pauseLoopTabAutoplay(tab);
				selectNewLoopTab(tab, 'next', true);
			} else if( event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft' ) {
				pauseLoopTabAutoplay(tab);
				selectNewLoopTab(tab, 'prev', true);
			}
		});
  };

  function initLoopTabAutoplay(tab) {
		if(!tab.options.autoplay || tab.autoplayPaused) return;
		tab.loopFill = 0;
		var selectedTab = tab.tabList.getElementsByClassName(tab.controlActiveClass)[0];
		// reset css variables
		for(var i = 0; i < tab.triggers.length; i++) {
			if(cssVariableSupport) tab.triggers[i].style.setProperty('--loop-tabs-filling', 0);
		}
		
		tab.loopTabAutoId = setTimeout(function(){
      selectNewLoopTab(tab, 'next', false);
		}, tab.options.autoplayInterval);
		
		if(cssVariableSupport) { // tab fill effect
			tab.loopFillAutoId = setInterval(function(){
				tab.loopFill = tab.loopFill + 0.005;
				selectedTab.style.setProperty('--loop-tabs-filling', tab.loopFill);
			}, tab.options.autoplayInterval/200);
		}
  };

  function pauseLoopTabAutoplay(tab) { // pause autoplay
    if(tab.loopTabAutoId) {
			clearTimeout(tab.loopTabAutoId);
			tab.loopTabAutoId = false;
			clearInterval(tab.loopFillAutoId);
			tab.loopFillAutoId = false;
			// make sure the filling line is scaled up
			var selectedTab = tab.tabList.getElementsByClassName(tab.controlActiveClass);
			if(selectedTab.length > 0) selectedTab[0].style.setProperty('--loop-tabs-filling', 1);
		}
  };

  function selectNewLoopTab(tab, direction, bool) {
    var selectedTab = tab.tabList.getElementsByClassName(tab.controlActiveClass)[0],
			index = Util.getIndexInArray(tab.triggers, selectedTab);
		index = (direction == 'next') ? index + 1 : index - 1;
		//make sure index is in the correct interval 
		//-> from last element go to first using the right arrow, from first element go to last using the left arrow
		if(index < 0) index = tab.listItems.length - 1;
		if(index >= tab.listItems.length) index = 0;	
		triggerLoopTab(tab, tab.triggers[index]);
		bool && tab.triggers[index].focus();
  };

  function triggerLoopTab(tab, tabTrigger, event) {
		pauseLoopTabAutoplay(tab);
		event && event.preventDefault();	
		var index = Util.getIndexInArray(tab.triggers, tabTrigger);
		//no need to do anything if tab was already selected
		if(Util.hasClass(tab.triggers[index], tab.controlActiveClass)) return;
		
		for( var i = 0; i < tab.triggers.length; i++) {
			var bool = (i == index),
				exit = Util.hasClass(tab.triggers[i], tab.controlActiveClass);
			Util.toggleClass(tab.triggers[i], tab.controlActiveClass, bool);
      Util.toggleClass(tab.panels[i], tab.panelShowClass, bool);
			Util.toggleClass(tab.assets[i], tab.assetShowClass, bool);
			Util.toggleClass(tab.assets[i], tab.assetExitClass, exit);
			tab.triggers[i].setAttribute('aria-selected', bool);
			bool ? tab.triggers[i].setAttribute('tabindex', '0') : tab.triggers[i].setAttribute('tabindex', '-1');

			resetVideo(tab, i, bool); // play/pause video if available

			// listen for the end of animation on asset element and remove exit class
			if(exit) {(function(i){
				tab.assets[i].addEventListener('transitionend', function cb(event){
					tab.assets[i].removeEventListener('transitionend', cb);
					Util.removeClass(tab.assets[i], tab.assetExitClass);
				});
			})(i);}
		}
    
    // restart tab autoplay
    initLoopTabAutoplay(tab);
	};

	function resetVideo(tab, i, bool) {
		if(tab.videos[i]) {
			if(bool) {
				tab.videos[i].play();
			} else {
				tab.videos[i].pause();
				tab.videos[i].currentTime = 0;
			} 
		}
	};

  LoopTab.defaults = {
    element : '',
    autoplay : true,
    autoplayInterval: 5000
  };

  //initialize the Tab objects
	var loopTabs = document.getElementsByClassName('js-loop-tabs');
	if( loopTabs.length > 0 ) {
		var reducedMotion = Util.osHasReducedMotion(),
			cssVariableSupport = ('CSS' in window) && Util.cssSupports('color', 'var(--var)');
		for( var i = 0; i < loopTabs.length; i++) {
			(function(i){
        var autoplay = (loopTabs[i].getAttribute('data-autoplay') && loopTabs[i].getAttribute('data-autoplay') == 'off' || reducedMotion) ? false : true,
        autoplayInterval = (loopTabs[i].getAttribute('data-autoplay-interval')) ? loopTabs[i].getAttribute('data-autoplay-interval') : 5000;
        new LoopTab({element: loopTabs[i], autoplay : autoplay, autoplayInterval : autoplayInterval});
      })(i);
		}
	}
}());