// Initialize Firebase
  var config = {
    apiKey: "AIzaSyBNTKQti3lzzJB2cWoo7oMR6rUJWw7J558",
    authDomain: "mddn-352-project-3.firebaseapp.com",
    databaseURL: "https://mddn-352-project-3.firebaseio.com",
    projectId: "mddn-352-project-3",
    storageBucket: "mddn-352-project-3.appspot.com",
    messagingSenderId: "425887671924"
  };
  firebase.initializeApp(config);

  const messaging = firebase.messaging();
  messaging.requestPermission()
  .then(function() {
    console.log('Have Permission');
    return messaging.getToken();
  })
  .then(function(token) {
    console.log(token);
  })
  .catch(function(err) {
    console.log('Error Occured.');
  })

messaging.onMessage(function(payload) {
  console.log('onMessage: ', payload);
});








(function(d){
  function toggleMenuClass() {
    d.body.classList.toggle('slideout-open');
    if (d.body.classList.contains('dropdown-open')) {
      d.body.classList.remove('dropdown-open');
    }
  }
  d.getElementById('menu-icon').addEventListener('click', toggleMenuClass);
  d.getElementById('menu-mask').addEventListener('click', toggleMenuClass);

  function toggleEditClass() {
    d.body.classList.toggle('dropdown-open');
    if (d.body.classList.contains('slideout-open')) {
      d.body.classList.remove('slideout-open');
    }
  }
  d.getElementById('settings-icon').addEventListener('click', toggleEditClass);
  d.getElementById('settings-mask').addEventListener('click', toggleEditClass);

  function toggleSettingsClass() {
    d.body.classList.add('settings-open');
    toggleMenuClass();
  }
  d.getElementById('settings-link').addEventListener('click', toggleSettingsClass);

  function resetHomescreen() {
    d.body.classList.remove('settings-open');
    toggleMenuClass();
  }
  d.getElementById('user-location-link').addEventListener('click', resetHomescreen);

  d.getElementById('close-location-error-mask').addEventListener('click', function(){
    d.body.classList.remove('location-error');
  });
})(document);
