(function(d){
  function toggleScreenClass(newScreenClass) {
    var screenClasses = ['screen-settings', 'screen-theme', 'screen-locations', 'screen-editor', 'screen-home'];

    for (const screenClass of screenClasses) {
      if (d.body.classList.contains(screenClass)){
        d.body.classList.remove(screenClass);
      }
    }

    d.body.classList.add(newScreenClass);
  }

  d.getElementById('settings').addEventListener('click', function() {
    toggleScreenClass('screen-settings');
  });
  d.getElementById('theme').addEventListener('click', function() {
    toggleScreenClass('screen-theme');
  });
  d.getElementById('home').addEventListener('click', function() {
    toggleScreenClass('screen-home');
  });
  d.getElementById('locations').addEventListener('click', function() {
    toggleScreenClass('screen-locations');
  });
  d.getElementById('editor').addEventListener('click', function() {
    toggleScreenClass('screen-editor');
  });
  // function toggleMenuClass() {
  //   d.body.classList.toggle('slideout-open');
  //   if (d.body.classList.contains('dropdown-open')) {
  //     d.body.classList.remove('dropdown-open');
  //   }
  // }
  // d.getElementById('menu-icon').addEventListener('click', toggleMenuClass);
  // d.getElementById('menu-mask').addEventListener('click', toggleMenuClass);
  //
  // function toggleEditClass() {
  //   d.body.classList.toggle('dropdown-open');
  //   if (d.body.classList.contains('slideout-open')) {
  //     d.body.classList.remove('slideout-open');
  //   }
  // }
  // d.getElementById('settings-icon').addEventListener('click', toggleEditClass);
  // d.getElementById('settings-mask').addEventListener('click', toggleEditClass);
  //
  // function toggleSettingsClass() {
  //   d.body.classList.add('settings-open');
  //   toggleMenuClass();
  // }
  // d.getElementById('settings-link').addEventListener('click', toggleSettingsClass);
  //
  // function resetHomescreen() {
  //   d.body.classList.remove('settings-open');
  //   toggleMenuClass();
  // }
  // d.getElementById('user-location-link').addEventListener('click', resetHomescreen);
  //
  // d.getElementById('close-location-error-mask').addEventListener('click', function(){
  //   d.body.classList.remove('location-error');
  // });
})(document);
