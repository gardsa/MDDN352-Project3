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
    // Get email and password
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
      console.log('User Details:');
      console.log(user);
    } else {
      d.body.classList.remove('logged-in');
      console.log('not logged in');
    }
  });

  function setupUser() {
    renderLocations();
  }

  function saveLocation(locationName, lat, lng) {
    var locationsRef = firebase.database().ref('users/' + user.uid).child('locations');

    locationsRef.push({
      name: locationName,
      lat: lat,
      lng: lng
    });
  }

  function renderLocations() {
    var locationsRef = firebase.database().ref('users/' + user.uid).child('locations');

    if (locationsRef) {
      firebase.database().ref('/users/' + user.uid + '/locations/').once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var node = d.createElement('li'),
          parentNode = d.getElementById('menu-options'),
          refNode = d.getElementById('settings-link');

          node.classList.add('menu-elem');
          node.innerHTML = '<p>' + childSnapshot.val().name + '</p>';
          parentNode.insertBefore(node, refNode);
        });
      });
    }
    else {
      // TODO: locations not existing state
      console.log('No locations found');
    }

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

  function addLocation() {
    var locationSearchElem = d.getElementById('location-search').value;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', openCageDataGeocodeURL + locationSearchElem + '&key=' + openCageDataAPIKey);
    xhr.addEventListener('load', function(event) {
      locationParams = JSON.parse(event.target.response);
      if (locationParams.results[0]) {
        var lat = locationParams.results[0].geometry.lat,
            lng = locationParams.results[0].geometry.lng;
        getWeatherData(lat, lng);
        saveLocation(locationSearchElem, lat, lng);
        renderLocations();
      }
      else {
        // TODO: error state
      }
    });
    xhr.send();
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
    // xhr2.open('GET', corsHeadersURL + owmBaseURL + "weather?lat=" + lat + "&lon=" + lng + "&units=metric&APPID=" + owmAPIKey);
    xhr2.open('GET', owmBaseURL + "weather?lat=" + lat + "&lon=" + lng + "&units=metric&APPID=" + owmAPIKey);
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

  d.addEventListener('DOMContentLoaded', function(){
    // d.getElementById('user-location-link').addEventListener('click', getUserLocation);
    getUserLocation();
    // d.getElementById('location-search-btn').addEventListener('click', addLocation);
  });
})(document);
