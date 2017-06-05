var pckry;

function initModules() {
  pckry = new Packery('.grid', {
    itemSelector: '.grid-item',
    gutter: '.gutter-sizer',
    columnWidth: '.grid-sizer',
    rowHeight: '.grid-sizer',
    percentPosition: true
  });

  var itemElem = '.grid-item';
  pckry.getItemElements().forEach(function(itemElem) {
    var draggie = new Draggabilly(itemElem, {
      handle: '.handle'
    });
    pckry.bindDraggabillyEvents(draggie);
  });
}

function enableResize() {
  var gridItems = document.querySelectorAll('.grid-item'),
      minWidth;
  for (const gridItem of gridItems) {
    minWidth = gridItem.offsetWidth;
    $(gridItem).resizable({
      containment: 'parent',
      minWidth: minWidth,
      resize: function() {
        pckry.shiftLayout();
      }
    });
  }
}
document.addEventListener('DOMContentLoaded', function(){
  initModules();
  enableResize();
});
