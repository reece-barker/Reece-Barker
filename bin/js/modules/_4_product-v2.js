// File#: _4_product-v2
// Usage: codyhouse.co/license
(function() {
  function initColorSwatches(product) {
    var slideshow = product.getElementsByClassName('js-product-v2__slideshow'),
      colorSwatches = product.getElementsByClassName('js-color-swatches__select');
    if(slideshow.length == 0 || colorSwatches.length == 0) return; // no slideshow available

    var slideshowItems = slideshow[0].getElementsByClassName('js-slideshow__item'); // slideshow items
    
    colorSwatches[0].addEventListener('change', function(event){ // new color has been selected
      selectNewSlideshowItem(colorSwatches[0].options[colorSwatches[0].selectedIndex].value, slideshow[0], slideshowItems);
    });
  };

  function selectNewSlideshowItem(value, slideshow, items){
    var selectedItem = document.getElementById('item-'+value);
    if(!selectedItem) return;
    var event = new CustomEvent('selectNewItem', {detail: Util.getIndexInArray(items, selectedItem) + 1});
    slideshow.dispatchEvent(event); // reveal new slide
  };

  var productV2 = document.getElementsByClassName('js-product-v2');
  if(productV2.length > 0) {
    for(var i = 0; i < productV2.length; i++) {(function(i){
      initColorSwatches(productV2[i]);
    })(i);}
  }
}());