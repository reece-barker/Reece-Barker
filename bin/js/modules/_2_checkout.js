// File#: _2_checkout
// Usage: codyhouse.co/license
(function() {
  // update billing info visibility
  var billingCheckBox = document.getElementsByClassName('js-billing-checkbox');
  if(billingCheckBox.length > 0) {
    var billingInfo = document.getElementsByClassName('js-billing-info');
    if(billingInfo.length == 0) return;
    resetBillingInfo(billingCheckBox[0], billingInfo[0]);
    
    billingCheckBox[0].addEventListener('change', function(){
      resetBillingInfo(billingCheckBox[0], billingInfo[0]);
    });
  }

  function resetBillingInfo(input, content) {
    Util.toggleClass(content, 'is-visible', !input.checked);
  };
}());