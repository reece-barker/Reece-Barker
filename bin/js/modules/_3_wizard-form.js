// File#: _3_wizard-form
// Usage: codyhouse.co/license
(function() {
  var WizardForm = function(element) {
    this.element = element;
    this.steps = this.element.getElementsByClassName('js-wiz-form__step');
    this.currentIndex = 0;
    this.stepPrevClass = 'wiz-form__step--prev';
    this.stepNextClass = 'wiz-form__step--next';
    this.currentClass = 'js-wiz-form__step--current';
    // navigation
    this.navPrev = this.element.getElementsByClassName('js-wiz-form__prev');
    this.navNext = this.element.getElementsByClassName('js-wiz-form__next');
    this.formSubmit = this.element.getElementsByClassName('js-wiz-form__submit');
    // step bar
    this.stepsBar = this.element.getElementsByClassName('js-wiz-form__step-indicator');
    if(this.stepsBar.length > 0) {
      this.stepsBarCurrent = this.stepsBar[0].getElementsByClassName('js-steps-v2__current-step');
      this.stepsBarTot = this.stepsBar[0].getElementsByClassName('js-steps-v2__tot-steps');
    }
    
    initWizardForm(this);
  };

  WizardForm.prototype.showStep = function(index) {
    this.currentIndex = index - 1;
		updateForm(this)
	};

  function initWizardForm(form) {
    // get selected step
    getSelectedStep(form);
    // reset navigation
    resetNav(form);
    setBarTotalSteps(form);
    resetStepBar(form);
    // update form steps
    form.element.addEventListener('click', function(event) {
      if(event.target.closest('.js-wiz-form__next')) updateFormStep(form, 'next');
      if(event.target.closest('.js-wiz-form__prev')) updateFormStep(form, 'prev');
    });
  };

  function getSelectedStep(form) {
    var selectedStep = form.element.getElementsByClassName(form.currentClass);
    form.currentIndex = (selectedStep.length > 0) ? Util.getIndexInArray(form.steps, selectedStep[0]): 0;
    setStepsClass(form);
  };

  function setStepsClass(form) {
    for(var i = 0; i < form.steps.length; i++) {
      if(i < form.currentIndex) {
        Util.addClass(form.steps[i], form.stepPrevClass);
        Util.removeClass(form.steps[i], form.stepNextClass+' '+form.currentClass);
      } else if( i > form.currentIndex) {
        Util.addClass(form.steps[i], form.stepNextClass);
        Util.removeClass(form.steps[i], form.stepPrevClass+' '+form.currentClass);
      } else {
        Util.addClass(form.steps[i], form.currentClass);
        Util.removeClass(form.steps[i], form.stepNextClass+' '+form.stepPrevClass);
      }
    }
  };

  function resetNav(form) {
    if(form.navPrev.length > 0) {
      form.currentIndex > 0 ? Util.removeClass(form.navPrev[0], 'is-hidden') : Util.addClass(form.navPrev[0], 'is-hidden');
    }
    if(form.navNext.length > 0 && form.formSubmit.length > 0) {
      if(form.currentIndex == (form.steps.length - 1)) {
        Util.addClass(form.navNext[0], 'is-hidden');
        Util.removeClass(form.formSubmit[0], 'is-hidden');
      } else {
        Util.removeClass(form.navNext[0], 'is-hidden');
        Util.addClass(form.formSubmit[0], 'is-hidden');
      }
    }
  };

  function setBarTotalSteps(form) {
    if(form.stepsBarTot && form.stepsBarTot.length > 0) {
      form.stepsBarTot[0].textContent = form.steps.length;
      form.stepsBar[0].style.setProperty('--steps-v2-steps-nr', form.steps.length);
    }
  };

  function resetStepBar(form) {
    if(form.stepsBarCurrent && form.stepsBarCurrent.length > 0) {
      form.stepsBar[0].style.setProperty('--step-v2-current-step', form.currentIndex + 1);
      form.stepsBarCurrent[0].textContent = form.currentIndex + 1;
    }
  };

  function updateFormStep(form, direction) {
    // update current step
    if(direction == 'next') form.currentIndex = form.currentIndex + 1;
    else form.currentIndex = form.currentIndex - 1;
    updateForm(form);
  };

  function updateForm(form) {
    if(form.currentIndex < 0) form.currentIndex = 0;
    if(form.currentIndex > form.steps.length) form.currentIndex = form.steps.length;
    if(form.currentIndex < form.steps.length) {
      setStepsClass(form); // update form visible step
      resetNav(form);
      resetStepBar(form);
    } else {
      form.currentIndex = form.steps.length - 1;
      // form will be submitted here
    }
  };

  window.WizardForm = WizardForm;
}());