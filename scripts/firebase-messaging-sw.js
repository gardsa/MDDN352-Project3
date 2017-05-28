importScripts('https://www.gstatic.com/firebasejs/4.0.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.0.0/firebase-messaging.js');


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
