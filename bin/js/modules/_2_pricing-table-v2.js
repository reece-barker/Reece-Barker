// File#: _2_pricing-table-v2
// Usage: codyhouse.co/license
(function() {
	var pTable = document.getElementsByClassName('js-p-table-v2');
	if(pTable.length > 0) {
		for(var i = 0; i < pTable.length; i++) {
			(function(i){ addPTableEvent(pTable[i]);})(i);
		}

		function addPTableEvent(element) {
			// switcher monthly/yearly plan
      var pSwitch = element.getElementsByClassName('js-p-table-v2__switch');
			if(pSwitch.length > 0) {
				pSwitch[0].addEventListener('change', function(event) {
          Util.toggleClass(element, 'p-table-v2--monthly-plan', (event.target.value == 'monthly'));
				});
			}

			// volume selector for multiple-users plan
			var pSelect = element.getElementsByClassName('js-p-table-v2__select'),
				pVolumeBtn = element.getElementsByClassName('js-p-table-v2__btn-volume');
			if(pSelect.length > 0 && pVolumeBtn.length > 0) {
				var volumeOptions = pVolumeBtn[0].querySelectorAll('[data-value]');
				updatePTableTeam(volumeOptions, pSelect[0].value); // init multiple-users plan price
				pSelect[0].addEventListener('change', function(event) {
          updatePTableTeam(volumeOptions, pSelect[0].value);
				});
			}
		}

		function updatePTableTeam(volumeOpt, value) {
			for(var i = 0; i < volumeOpt.length; i++) {
				volumeOpt[i].getAttribute('data-value') == value
					? volumeOpt[i].removeAttribute('style')
					: volumeOpt[i].setAttribute('style', 'display: none;');
			}
		};
	}
}());