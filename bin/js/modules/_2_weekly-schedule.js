// File#: _2_weekly-schedule
// Usage: codyhouse.co/license
(function () {
  var WSchedule = function (opts) {
    this.options = Util.extend(WSchedule.defaults, opts);
    this.element = this.options.element;
    this.timeline = this.element.getAttribute('data-w-schedule-timeline');
    this.startTime = getStartTime(this);
    this.endTime = getEndTime(this);
    this.gridRows = 1;
    // grid template
    this.grid = this.element.getElementsByClassName('js-w-schedule__grid');
    this.halfHourGrid = '<div class="w-schedule__grid-row"></div>';
    this.hourGrid = '<div class="w-schedule__grid-row"><span class="w-schedule__grid-row-label">XXXX</span></div>';
    // morph animation duration
    this.animationDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--w-schedule-modal-anim-duration')) * 1000 || 300;
    // modal element 
    this.modal = document.getElementsByClassName('js-w-schedule-modal');
    this.morphBg = document.getElementsByClassName('js-w-schedule-morph-bg');
    this.modalCloseBtn = document.getElementsByClassName('js-w-schedule-close-btn');
    initWSchedule(this);
  };

  function initWSchedule(element) {
    // create grid
    createScheduleGrid(element);
    // place events on the grid
    placeEvents(element);
    // init modal
    initModalEvents(element);
  };

  function createScheduleGrid(element) {
    var gridContent = '';
    // check if we need to start with half an hour
    if (element.startTime[1] != 0) {
      gridContent = gridContent + element.halfHourGrid;
      element.startTime[0] = element.startTime[0] + 1;
      element.gridRows = element.gridRows + 1;
    }

    // get index loop
    var index = element.endTime[0] - element.startTime[0];
    for (var i = 0; i < index; i++) {
      gridContent = gridContent + getHourGrid(element, i) + element.halfHourGrid;
    }

    // add the last hour grid line
    gridContent = gridContent + getHourGrid(element, index);

    // update grid height 
    element.gridRows = element.gridRows + 2 * index;

    // check if we need to add an additional half hour
    if (element.endTime[1] != 0) {
      gridContent = gridContent + element.halfHourGrid;
      element.gridRows = element.gridRows + 1;
    }

    // set grid element content
    element.grid[0].innerHTML = gridContent;
    // update grid element height
    element.element.style.setProperty('--w-schedule-row-nr', element.gridRows);
  };

  function placeEvents(element) {
    var events = element.element.getElementsByClassName('js-w-schedule__event');
    for (var i = 0; i < events.length; i++) {
      placeEvent(element, events[i]);
    }
  };

  function placeEvent(element, event) {
    var timeEl = event.getElementsByTagName('time')[0],
      timeInfo = timeEl.getAttribute('datetime');

    var top = getTime(timeInfo.split('PT')[0]),
      duration = getDuration(timeInfo.split('PT')[1]);

    var topDelta = getDelta(top[0] - element.startTime[0], top[1] - element.startTime[1]),
      durationDelta = getDelta(duration[0], duration[1]);

    event.style.setProperty('--w-schedule-event-top', 'calc(var(--w-schedule-row-height) * ' + topDelta + ')');

    event.style.setProperty('--w-schedule-event-height', 'calc(var(--w-schedule-row-height) * ' + durationDelta + ')');

    // now set the label for the event time
    timeEl.innerHTML = formatTime(top) + ' - ' + formatTime([top[0] + duration[0], top[1] + duration[1]]);
  };

  function getStartTime(element) {
    return getTime(element.timeline.split('-')[0]);
  };

  function getEndTime(element) {
    return getTime(element.timeline.split('-')[1]);
  };

  function getTime(time) {
    var array = time.split(':');
    return [parseInt(array[0]), parseInt(array[1])];
  };

  function getHourGrid(element, index) {
    // get the hour format
    var hour = formatHour(element.startTime[0] + index);
    return element.hourGrid.replace('XXXX', hour + ':00');
  };

  function formatTime(time) {
    // first check if minutes >= 60 and increase hours
    if (time[1] >= 60) {
      var remainder = time[1] % 60;
      time[0] = time[0] + (time[1] - remainder) / 60;
      time[1] = remainder;
    }
    return formatHour(time[0]) + ':' + formatMinutes(time[1]);
  };

  function formatHour(hour) {
    // e.g., 9 -> 09; 12 -> 12
    if (hour < 10) return '0' + hour;
    if (hour > 24) return formatHour(hour - 24);
    return hour;
  };

  function formatMinutes(minutes) {
    // e.g., 9 -> 09; 30 -> 30
    if (minutes < 10) return '0' + minutes;
    if (minutes > 60) return formatMinutes(minutes - 60);
    return minutes;
  };

  function getDuration(duration) {
    var hour = 0;
    if (duration.indexOf('H') > -1) {
      var array = duration.split('H');
      duration = array[1];
      hour = parseInt(array[0]);
    }
    var minutes = 0;
    if (duration.indexOf('M') > -1) {
      minutes = parseInt(duration.split('M')[0]);
    }
    return [hour, minutes];
  };

  function getDelta(hour, minutes) {
    // this will return a number; e.g. 1h -> 2; 1h30m -> 3; 1h15m -> 2.5
    return 2 * (hour + minutes / 60);
  };

  function initModalEvents(element) {
    if (element.modal.length < 1 || element.morphBg.length < 1) return;
    // store some modal info
    element.modalContent = element.modal[0].getElementsByClassName('js-w-schedule-modal__content')[0];
    element.skeletonContent = element.modalContent.innerHTML;
    element.modalId = element.modal[0].getAttribute('id');

    // detect modal opening
    element.modal[0].addEventListener('modalIsOpen', function (event) {
      element.target = event.detail.closest('[aria-controls="' + element.modalId + '"]');
      // animate morph bg
      animateMorphBg(element, function () {
        // hide morph element and reset style
        Util.addClass(element.morphBg[0], 'is-hidden');
        element.morphBg[0].style = '';
        Util.removeClass(element.modalContent, 'opacity-0');
      });
      // load event content
      setModalContent(element);
      // show modal close btn
      toggleModalCloseBtn(element, true);
    });

    // detect modal closing
    element.modal[0].addEventListener('modalIsClose', function (event) {
      element.modal[0].addEventListener('transitionend', function cb(event) {
        if (event.propertyName != 'opacity') return;
        resetModalContent(element);

        element.modal[0].removeEventListener('transitionend', cb);
      });
      element.target = false;
      // hide modal close btn
      toggleModalCloseBtn(element, false);
      // reset modal content if reduced motion is on
      if (reducedMotion) resetModalContent(element);
    });

    // close modal clicking on close btn
    if (element.modalCloseBtn.length > 0) {
      element.modalCloseBtn[0].addEventListener('click', function (event) {
        element.modal[0].click();
      });
    }
  };

  function animateMorphBg(element, cb) {
    if (reducedMotion) return cb();
    var startPoint = element.target.getBoundingClientRect(),
      endPoint = element.modalContent.getBoundingClientRect();

    var translateX = endPoint.left - startPoint.left,
      translateY = endPoint.top - startPoint.top,
      scaleX = startPoint.width / endPoint.width,
      scaleY = startPoint.height / endPoint.height;

    var currentTime = null,
      duration = element.animationDuration;

    // init element
    element.morphBg[0].style = 'top: ' + startPoint.top + 'px; left: ' + startPoint.left + 'px; width: ' + endPoint.width + 'px; height: ' + endPoint.height + 'px; transform: scaleX(' + scaleX + ') scaleY(' + scaleY + ')';
    // show element
    Util.removeClass(element.morphBg[0], 'is-hidden');

    // animate from initial to final state
    var animateElement = function (timestamp) {
      if (!currentTime) currentTime = timestamp;
      var progress = timestamp - currentTime;
      if (progress > duration) progress = duration;

      var scaleXPr = Math.easeOutQuart(progress, scaleX, 1 - scaleX, duration),
        scaleYPr = Math.easeOutQuart(progress, scaleY, 1 - scaleY, duration),
        translateXPr = Math.easeOutQuart(progress, 0, translateX, duration),
        translateYPr = Math.easeOutQuart(progress, 0, translateY, duration);

      element.morphBg[0].style.transform = 'translateX(' + translateXPr + 'px) translateY(' + translateYPr + 'px) scaleX(' + scaleXPr + ') scaleY(' + scaleYPr + ')';

      if (progress < duration) {
        window.requestAnimationFrame(animateElement);
      } else if (cb) {
        cb();
      }
    };

    window.requestAnimationFrame(animateElement);
  };

  function toggleModalCloseBtn(element, bool) {
    if (element.modalCloseBtn.length > 0) {
      Util.toggleClass(element.modalCloseBtn[0], 'w-schedule-close-btn--is-visible', bool);
    }
  };

  function setModalContent(element) {
    // load the modal info details - using the searchData custom function the user defines
    element.options.searchData(element.target, function (data) {
      Util.addClass(element.modalContent, 'w-schedule-modal__content--loaded');
      element.modalContent.innerHTML = data;
    });
  };

  function resetModalContent(element) {
    Util.addClass(element.modalContent, 'opacity-0');
    element.modalContent.innerHTML = element.skeletonContent;
    Util.removeClass(element.modalContent, 'w-schedule-modal__content--loaded');
  };

  window.WSchedule = WSchedule;

  WSchedule.defaults = {
    element: '',
    searchData: false, // function used to return results
  };

  if (document.getElementsByClassName('js-w-schedule')[0]) {
    var wSchedule = document.getElementsByClassName('js-w-schedule')[0];
    new WSchedule({
      element: wSchedule,
      searchData: function (target, cb) {
        // custom function used to retrieve the additional info about the selected event
        // target: this is the selected [aria-controls] element
        cb(data); // data is the HTML to be shown
      }
    });
  }

  var reducedMotion = Util.osHasReducedMotion();
}());