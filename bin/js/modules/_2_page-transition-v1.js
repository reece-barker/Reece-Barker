// File#: _2_page-transition-v1
// Usage: codyhouse.co/license
(function() {
  var pageTransitionWrapper = document.getElementsByClassName('js-page-trans');
  if(pageTransitionWrapper.length < 1) return;
  
  var transPanel = document.getElementsByClassName('page-trans-v1'),
    loaderScale = '--page-trans-v1-loader-scale',
    timeoutId = false,
    loaderScaleDown = 0.2;

  var timeLeaveAnim = 0;
  
  new PageTransition({
    leaveAnimation: function(initContent, link, cb) {
      timeLeaveAnim = 0;
      Util.addClass(transPanel[0], 'page-trans-v1--is-visible');
      transPanel[0].addEventListener('transitionend', function cbLeave(){
        transPanel[0].removeEventListener('transitionend', cbLeave);
        setTimeout(function(){
          animateLoader(300, 1, loaderScaleDown, function(){
            Util.addClass(initContent, 'is-hidden');
            timeLeaveAnim = new Date().getTime();
            cb();
          });
        }, 100);
      });
    },
    enterAnimation: function(initContent, newContent, link, cb) {
      if(timeoutId) {
        window.cancelAnimationFrame(timeoutId);
        timeoutId = false;
      }

      // set a minimum loader animation duration of 0.75s
      var duration = Math.max((750 - new Date().getTime() + timeLeaveAnim), 300);
  
      // complete page-trans-v1__loader scale animation
      animateLoader(duration, parseFloat(getComputedStyle(transPanel[0]).getPropertyValue(loaderScale)), 1, function() {
        Util.removeClass(transPanel[0], 'page-trans-v1--is-visible');
        transPanel[0].addEventListener('transitionend', function cbEnter(){
          transPanel[0].removeEventListener('transitionend', cbEnter);
          cb();
        });
      });
    },
    progressAnimation: function(link) {
      animateLoader(3000, loaderScaleDown, 0.9);
    }
  });

  function animateLoader(duration, startValue, finalValue, cb) {
    // takes care of animating the loader element
    var currentTime = false;

    var animateScale = function(timestamp) {
      if (!currentTime) currentTime = timestamp;        
      var progress = timestamp - currentTime;
      if(progress > duration) progress = duration;
      var val = Math.easeInOutQuart(progress, startValue, finalValue - startValue, duration);
      transPanel[0].style.setProperty(loaderScale, val);
      if(progress < duration) {
        timeoutId = window.requestAnimationFrame(animateScale);
      } else {
        // reveal page content
        if(cb) cb();
      }
    };
    timeoutId = window.requestAnimationFrame(animateScale);
  };
}());