(function(d) {

  // Initialize Firebase
  var config = {
    apiKey: 'AIzaSyCExaGjNOS1oqxA0XxCbFOPrWFz3hZpjwI',
    authDomain: 'foresee-26ee4.firebaseapp.com',
    databaseURL: 'https://foresee-26ee4.firebaseio.com',
    projectId: 'foresee-26ee4',
    storageBucket: 'foresee-26ee4.appspot.com',
    messagingSenderId: '627989867921'
  };
  firebase.initializeApp(config);

  // Get elements
  var txtEmail = d.getElementById('txtEmail'),
      txtPassword = d.getElementById('txtPassword'),
      btnLogin = d.getElementById('btnLogin'),
      btnSignup = d.getElementById('btnSignup'),
      btnLogout = d.getElementById('btnLogout');

  function loginHandler() {
    // Get email and password
    var email = txtEmail.value,
        password = txtPassword.value,
        auth = firebase.auth();

    // Sign in
    var promise = auth.signInWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message));
  }

  function signupHandler() {
    // Get email and password
    // TODO: check for real email/weak/short password
    var email = txtEmail.value,
        password = txtPassword.value,
        auth = firebase.auth();

    // Sign up
    var promise = auth.createUserWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message));
  }

  function logoutHandler() {
    firebase.auth().signOut();
  }

  btnLogin.addEventListener('click', loginHandler);
  btnSignup.addEventListener('click', signupHandler);
  btnLogout.addEventListener('click', logoutHandler);


  // assign firebaseUser variable
  var user;
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      user = firebaseUser;
      d.body.classList.add('logged-in');
      console.log(user);
      // check to see writing data works
      // writeUserData(user);
    } else {
      d.body.classList.remove('logged-in');
      console.log('not logged in');
    }
  });

  function writeUserData() {
    firebase.database().ref('users/' + user.uid).set({
      username: 'Sammy G'
    });
  }



})(document);
