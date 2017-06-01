(function(d){

  // APP FUNCTIONALITY
  var openCageDataGeocodeURL = 'http://api.opencagedata.com/geocode/v1/json?q=',
      openCageDataAPIKey = '9f4842edccce418bbc2bd963ebb8d92b';

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
    // promise.then(setupUser);
  }

  function signupHandler() {
    // TODO: check for real email/weak/short password
    var email = txtEmail.value,
        password = txtPassword.value,
        auth = firebase.auth();

    // Sign up
    var promise = auth.createUserWithEmailAndPassword(email, password);
    promise.catch(e => console.log(e.message));
    promise.then(writeUserData);
  }

  function logoutHandler() {
    firebase.auth().signOut();
    clearUserInfo();
  }

  function clearUserInfo() {
    // TODO: get rid of all locations rendered
  }

  btnLogin.addEventListener('click', loginHandler);
  btnSignup.addEventListener('click', signupHandler);
  btnLogout.addEventListener('click', logoutHandler);


  var user,
      db,
      locationsRef;

  function checkAuthState() {
    firebase.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        user = firebaseUser;
        d.body.classList.add('logged-in');
        db  = firebase.database().ref('users/' + user.uid);
        setupUser();
      } else {
        d.body.classList.remove('logged-in');
        console.log('not logged in');
      }
    });
  }

  function setupUser() {
    // SET UP LOCATIONS SCREEN
    locationsRef = db.child('locations');
    if (locationsRef) {
      locationsRef.once('value').then(function(snapshot) {
        snapshot.forEach(renderLocations);
      });
    } else {
      // TODO: locations not existing state
      console.log('No locations found');
    }

    themesRef = db.child('themes');
    if (themesRef) {
      themesRef.once('value').then(function(snapshot) {
        toggleThemeClass(snapshot.val().theme);
      });
    }
  }

  // SAVED LOCATIONS FUNCTIONALITY

  function addLocation() {
    var locationSearchElem = d.getElementById('location-search').value,
        locationsRef = db.child('locations');

    var xhr = new XMLHttpRequest();
    xhr.open('GET', corsHeadersURL + openCageDataGeocodeURL + locationSearchElem + '&key=' + openCageDataAPIKey);
    xhr.addEventListener('load', function(event) {
      locationParams = JSON.parse(event.target.response);
      if (locationParams.results[0]) {
        var lat = locationParams.results[0].geometry.lat,
            lng = locationParams.results[0].geometry.lng;
        saveLocation(locationSearchElem, lat, lng);
        locationsRef.once('value').then(function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            if (childSnapshot.val().name == locationSearchElem){
              renderLocations(childSnapshot);
            }
          });
        });
        d.getElementById('location-search').value = '';
      }
      else {
        // TODO: error state
      }
    });
    xhr.send();
  }

  function saveLocation(locationName, lat, lng) {
    var locationsRef = db.child('locations');

    locationsRef.push({
      name: locationName,
      lat: lat,
      lng: lng
    });
  }

  function renderLocations(snapshot) {
    var node = d.createElement('li'),
        parentNode = d.getElementById('locations-list'),
        refNode = d.getElementById('add-location-anchor');

    node.innerHTML = '<span class="location-name" id="' + snapshot.val().name + '">' + snapshot.val().name + '</span>' + '<span class="delete-location-btn" id="delete-' + snapshot.val().name + '">x</span>';
    node.classList.add('location');
    // node.id = snapshot.val().name;
    parentNode.insertBefore(node, refNode);

    d.getElementById('delete-' + snapshot.val().name).addEventListener('click', function() {
      deleteLocation(this.parentElement);
    });

    d.getElementById(snapshot.val().name).addEventListener('click', function(){
      getWeatherData(snapshot.val().lat, snapshot.val().lng);
      toggleScreenClass('screen-home');
    });
  }

  function deleteLocation(elem) {
    var location,
        parent = elem.parentElement,
        child = elem.firstChild;
    locationsRef.once('value').then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        if (childSnapshot.val().name == child.id){
          childSnapshot.ref.remove();
          parent.removeChild(elem);
        }
      });
    });
  }


  // THEME FUNCTIONALITY

  function toggleThemeClass(newThemeClass) {
    var themeClasses = ['theme-default', 'theme-light', 'theme-dark', 'theme-mono'];

    for (const themeClass of themeClasses) {
      if (d.body.classList.contains(themeClass)){
        d.body.classList.remove(themeClass);
      }
    }

    d.body.classList.add(newThemeClass);
  }

  function setTheme() {
    d.getElementById('theme-default').addEventListener('click', function() {
      toggleThemeClass('theme-default');
      saveTheme('theme-default');
    });
    d.getElementById('theme-light').addEventListener('click', function() {
      toggleThemeClass('theme-light');
      saveTheme('theme-light');
    });
    d.getElementById('theme-dark').addEventListener('click', function() {
      toggleThemeClass('theme-dark');
      saveTheme('theme-dark');
    });
    d.getElementById('theme-mono').addEventListener('click', function() {
      toggleThemeClass('theme-mono');
      saveTheme('theme-mono');
    });
  }

  function saveTheme(theme) {
    db.child('themes').set({
      theme: theme
    });
  }


  // WEATHER FUNCTIONALITY

  var corsHeadersURL = 'https://cors-anywhere.herokuapp.com/',
      owmBaseURL = 'http://api.openweathermap.org/data/2.5/',
      owmAPIKey = '31ed34cbcb1d480a9de746e8a88e71ea',
      darkSkyBaseURL = 'https://api.darksky.net/forecast/',
      darkSkyAPIKey = 'ac6929b61ada094c25ee0e4e1380e6ae',
      weatherData,
      owmWeatherData;

  function getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(locationFound, locationError);
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  function locationFound(position) {
    getWeatherData(position.coords.latitude, position.coords.longitude);
  }

  function locationError(event) {
    d.body.classList.add('location-error');
  }

  function getWeatherData(lat, lng) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', corsHeadersURL + darkSkyBaseURL + darkSkyAPIKey + '/' + lat + ',' + lng + '?units=si&exclude=minutely,alerts,flags');
    xhr.addEventListener('load', function(event) {
      weatherData = JSON.parse(event.target.response);
      console.log(weatherData);
      renderWeatherInfo();
    });
    xhr.send();

    var xhr2 = new XMLHttpRequest();
    xhr2.open('GET', corsHeadersURL + owmBaseURL + "weather?lat=" + lat + "&lon=" + lng + "&units=metric&APPID=" + owmAPIKey);
    // xhr2.open('GET', owmBaseURL + "weather?lat=" + lat + "&lon=" + lng + "&units=metric&APPID=" + owmAPIKey);
    xhr2.addEventListener('load', function(event) {
      owmWeatherData = JSON.parse(event.target.response);
      renderLocation();
    });
    xhr2.send();
  }

  function renderWeatherInfo(){
    var descriptionElem = d.getElementById('description');
    descriptionElem.innerHTML = '';
    descriptionElem.innerHTML += weatherData.currently.summary;
    renderTemp();
    renderWind();
    renderCloud();
    renderPrecip();
  }

  function renderLocation() {
    var locationElem =  d.getElementById('location');
    locationElem.innerHTML = '';
    locationElem.innerHTML += owmWeatherData.name;
  }

  function renderTemp() {
    var gridElem = d.getElementById('gridMain'),
        currentTemp = Math.round(weatherData.currently.temperature),
        maxTemp = Math.round(weatherData.daily.data[0].temperatureMax),
        minTemp = Math.round(weatherData.daily.data[0].temperatureMin);

    gridElem.innerHTML = '';

    gridElem.innerHTML += '<div class="current-temp">' + currentTemp + '<sup>&deg;</sup></div>';

    gridElem.innerHTML += '<div class="forecast-temp"><div class="high">' + maxTemp + '<sup>&deg;</sup></div><div class="low">' + minTemp + '<sup>&deg;</sup></div></div>';
  }

  function renderWind() {
    var gridElem = d.getElementById('grid1'),
        speed = Math.round(weatherData.currently.windSpeed * 3.6),
        degrees = weatherData.currently.windBearing;

    gridElem.innerHTML = '';

    gridElem.innerHTML += '<div class="current-wind"><div class="speed">' + speed + '</div><div class="units">km/h</div></div><img id="direction-icon" src="assets/wind-direction-icon.svg">';

    var directionElem = d.getElementById('direction-icon');
    if(navigator.userAgent.match("Chrome")){
  		directionElem.style.WebkitTransform = "rotate("+degrees+"deg)";
  	} else if(navigator.userAgent.match("Firefox")){
  		directionElem.style.MozTransform = "rotate("+degrees+"deg)";
  	} else if(navigator.userAgent.match("MSIE")){
  		directionElem.style.msTransform = "rotate("+degrees+"deg)";
  	} else if(navigator.userAgent.match("Opera")){
  		directionElem.style.OTransform = "rotate("+degrees+"deg)";
  	} else {
  		directionElem.style.transform = "rotate("+degrees+"deg)";
  	}
  }

  function renderCloud() {
    var gridElem = d.getElementById('grid2'),
        cloudCover = weatherData.currently.cloudCover;

    gridElem.innerHTML = '';

    gridElem.innerHTML += '<img id="cloud-circle" src="assets/circle-icon.svg">'

    if (cloudCover == 0){
      gridElem.innerHTML += '<div class="current-cloud">clear</div>'
    }
    else {
      gridElem.innerHTML += '<div class="canvas-container"><canvas id="cloud-canvas" width="100" height="100"></canvas></div>';

      var c = d.getElementById("cloud-canvas"),
      ctx = c.getContext("2d");

      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(c.width/2, c.height/2);
      ctx.arc(c.width/2, c.height/2, c.height/2, 0, (Math.PI*2*(cloudCover)), false);
      ctx.lineTo(c.width/2, c.height/2);
      ctx.fill();
    }
  }

  function renderPrecip() {
    var gridElem = d.getElementById('grid3'),
        precipIntensity = Math.round(weatherData.hourly.data[0].precipIntensity*10) / 10;

    gridElem.innerHTML = '';

    if (precipIntensity > 0) {
      gridElem.innerHTML += '<div class="current-precip"><div class="intensity">' + precipIntensity + '</div><div class="units">mm</div></div>';

      var precipType = weatherData.hourly.data[0].precipType;
      if (precipType == 'rain'){
        gridElem.innerHTML += '<img id="precip-icon" src="assets/rain-icon.svg">';
      }
      else if (precipType == 'snow') {
        // gridElem.innerHTML += '<img id="precip-icon" src="assets/snow-icon.svg">';
      }
      else if (precipType == 'sleet') {
        // gridElem.innerHTML += '<img id="precip-icon" src="assets/sleet-icon.svg">';
      }
    } else {
      gridElem.innerHTML += '<div class="current-precip"><div class="intensity">0</div><div class="units">mm</div></div><img id="precip-icon" src="assets/rain-icon.svg">';
    }

  }


  // EVENTS

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

  d.getElementById('linkLogin').addEventListener('click', function(){
    d.getElementById('loginScreen').classList.add('login-function');
  });

  d.getElementById('linkSignup').addEventListener('click', function(){
    d.getElementById('loginScreen').classList.add('signup-function');
  });

  d.getElementById('loginBackBtn').addEventListener('click', function(){
    d.getElementById('loginScreen').classList.remove('signup-function');
    d.getElementById('loginScreen').classList.remove('login-function');
  });

  var editLocationsBtn = d.getElementById('edit-locations-btn');
  editLocationsBtn.addEventListener('click', function(){
    d.getElementById('locations-list').classList.toggle('delete-locations');
    if (editLocationsBtn.innerHTML == 'Edit'){
      editLocationsBtn.innerHTML = 'Cancel';
    } else {
      editLocationsBtn.innerHTML = 'Edit'
    }
  });

  d.addEventListener('DOMContentLoaded', function(){
    getUserLocation();
    checkAuthState();
    setTheme();
    d.getElementById('location-search-btn').addEventListener('click', addLocation);
  });
})(document);
