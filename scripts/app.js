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
  }

  function signupHandler() {
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
    clearUserInfo();
  }

  function clearUserInfo() {
    // Remove all locations rendered on signout
    var locElems = d.querySelectorAll('.location');
    for (const locElem of locElems) {
      locElem.parentNode.removeChild(locElem);
    }
  }

  btnLogin.addEventListener('click', loginHandler);
  btnSignup.addEventListener('click', signupHandler);
  btnLogout.addEventListener('click', logoutHandler);


  var user,
      db,
      locationsRef,
      themesRef,
      componentsRef;

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
        if (snapshot.val()) {
          toggleThemeClass(snapshot.val().theme);
        }
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
    locationsRef = db.child('locations');

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

    node.innerHTML = '<span class="location-name" id="' + snapshot.val().name + '">' + snapshot.val().name + '</span>' + '<span class="delete-location-btn" id="delete-' + snapshot.val().name + '"><img src="assets/icons/remove.svg"></span>';
    node.classList.add('location');
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

  // EDITOR FUNCTIONALITY

  function setComponents() {
    var primary = 'temp',
        secondary1 = 'wind',
        secondary2 = 'cloud',
        secondary3 = 'rain';

    d.getElementById('primary-select').addEventListener('change', function() {
      primary = event.target.value;
      saveComponents(primary, secondary1, secondary2, secondary3);
    });
    d.getElementById('secondary1-select').addEventListener('change', function() {
      secondary1 = event.target.value;
      saveComponents(primary, secondary1, secondary2, secondary3);
    });
    d.getElementById('secondary2-select').addEventListener('change', function() {
      secondary2 = event.target.value;
      saveComponents(primary, secondary1, secondary2, secondary3);
    });
    d.getElementById('secondary3-select').addEventListener('change', function() {
      secondary3 = event.target.value;
      saveComponents(primary, secondary1, secondary2, secondary3);
    });

  }

  function saveComponents(primary, secondary1, secondary2, secondary3) {
    componentsRef = db.child('components');

    componentsRef.set({
      primary: primary,
      secondary1: secondary1,
      secondary2: secondary2,
      secondary3: secondary3
    });

    componentsRef.once('value').then(function(snapshot) {
      renderGridModules(snapshot.val());
    });
  }


  // THEME FUNCTIONALITY

  function toggleThemeClass(newThemeClass) {
    var themeClasses = ['theme-default', 'theme-day', 'theme-night', 'theme-mono', 'theme-ocean', 'theme-divide', 'theme-element', 'theme-torchlight', 'theme-azure', 'theme-lavender', 'theme-pink', 'theme-warmth', 'theme-obscure', 'theme-morninglawn'];

    for (const themeClass of themeClasses) {
      if (d.body.classList.contains(themeClass)){
        d.body.classList.remove(themeClass);
        d.getElementById(themeClass).classList.remove('selected');
      }
    }
    d.getElementById(newThemeClass).classList.add('selected');
    d.body.classList.add(newThemeClass);
  }

  function setTheme() {
    d.getElementById('theme-default').addEventListener('click', function() {
      toggleThemeClass('theme-default');
      saveTheme('theme-default');
    });
    d.getElementById('theme-day').addEventListener('click', function() {
      toggleThemeClass('theme-day');
      saveTheme('theme-day');
    });
    d.getElementById('theme-night').addEventListener('click', function() {
      toggleThemeClass('theme-night');
      saveTheme('theme-night');
    });
    d.getElementById('theme-mono').addEventListener('click', function() {
      toggleThemeClass('theme-mono');
      saveTheme('theme-mono');
    });
    d.getElementById('theme-ocean').addEventListener('click', function() {
      toggleThemeClass('theme-ocean');
      saveTheme('theme-ocean');
    });
    d.getElementById('theme-divide').addEventListener('click', function() {
      toggleThemeClass('theme-divide');
      saveTheme('theme-divide');
    });
    d.getElementById('theme-element').addEventListener('click', function() {
      toggleThemeClass('theme-element');
      saveTheme('theme-element');
    });
    d.getElementById('theme-torchlight').addEventListener('click', function() {
      toggleThemeClass('theme-torchlight');
      saveTheme('theme-torchlight');
    });
    d.getElementById('theme-azure').addEventListener('click', function() {
      toggleThemeClass('theme-azure');
      saveTheme('theme-azure');
    });
    d.getElementById('theme-lavender').addEventListener('click', function() {
      toggleThemeClass('theme-lavender');
      saveTheme('theme-lavender');
    });
    d.getElementById('theme-pink').addEventListener('click', function() {
      toggleThemeClass('theme-pink');
      saveTheme('theme-pink');
    });
    d.getElementById('theme-warmth').addEventListener('click', function() {
      toggleThemeClass('theme-warmth');
      saveTheme('theme-warmth');
    });
    d.getElementById('theme-obscure').addEventListener('click', function() {
      toggleThemeClass('theme-obscure');
      saveTheme('theme-obscure');
    });
    d.getElementById('theme-morninglawn').addEventListener('click', function() {
      toggleThemeClass('theme-morninglawn');
      saveTheme('theme-morninglawn');
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
    xhr2.addEventListener('load', function(event) {
      owmWeatherData = JSON.parse(event.target.response);
      renderLocation();
    });
    xhr2.send();
  }

  function renderLocation() {
    var locationElem =  d.getElementById('location');
    locationElem.innerHTML = '';
    locationElem.innerHTML += owmWeatherData.name;
  }

  function renderWeatherInfo(){
    var descriptionElem = d.getElementById('description');
    descriptionElem.innerHTML = '';
    descriptionElem.innerHTML += weatherData.currently.summary;
    componentsRef = db.child('components');
    if (componentsRef) {
      componentsRef.once('value').then(function(snapshot) {
        renderGridModules(snapshot.val());
      });
    }
  }

  function renderGridModules(components) {
    var primaryModule = d.getElementById('gridMainContent'),
        secondary1Module = d.getElementById('grid1Content'),
        secondary2Module = d.getElementById('grid2Content'),
        secondary3Module = d.getElementById('grid3Content'),
        primaryComponent = components.primary,
        secondary1Component = components.secondary1,
        secondary2Component = components.secondary2,
        secondary3Component = components.secondary3;

    if (primaryComponent == 'temp'){renderTemp(primaryModule);}
    else if (primaryComponent == 'rain'){renderPrecip(primaryModule);}
    else if (primaryComponent == 'wind'){renderWind(primaryModule);}
    else if (primaryComponent == 'cloud'){renderCloud(primaryModule);}
    else if (primaryComponent == 'humidity'){renderHumidity(primaryModule);}
    else if (primaryComponent == 'pressure'){renderPressure(primaryModule);}

    if (secondary1Component == 'temp'){renderTemp(secondary1Module);}
    else if (secondary1Component == 'rain'){renderPrecip(secondary1Module);}
    else if (secondary1Component == 'wind'){renderWind(secondary1Module);}
    else if (secondary1Component == 'cloud'){renderCloud(secondary1Module);}
    else if (secondary1Component == 'humidity'){renderHumidity(secondary1Module);}
    else if (secondary1Component == 'pressure'){renderPressure(secondary1Module);}

    if (secondary2Component == 'temp'){renderTemp(secondary2Module);}
    else if (secondary2Component == 'rain'){renderPrecip(secondary2Module);}
    else if (secondary2Component == 'wind'){renderWind(secondary2Module);}
    else if (secondary2Component == 'cloud'){renderCloud(secondary2Module);}
    else if (secondary2Component == 'humidity'){renderHumidity(secondary2Module);}
    else if (secondary2Component == 'pressure'){renderPressure(secondary2Module);}

    if (secondary3Component == 'temp'){renderTemp(secondary3Module);}
    else if (secondary3Component == 'rain'){renderPrecip(secondary3Module);}
    else if (secondary3Component == 'wind'){renderWind(secondary3Module);}
    else if (secondary3Component == 'cloud'){renderCloud(secondary3Module);}
    else if (secondary3Component == 'humidity'){renderHumidity(secondary3Module);}
    else if (secondary3Component == 'pressure'){renderPressure(secondary3Module);}
  }

  function renderTemp(gridElem) {
    var currentTemp = Math.round(weatherData.currently.temperature),
        maxTemp = Math.round(weatherData.daily.data[0].temperatureMax),
        minTemp = Math.round(weatherData.daily.data[0].temperatureMin);

    gridElem.innerHTML = '';
    gridElem.innerHTML += '<div id="temp-container"><div class="current-temp">' + currentTemp + '<sup>&deg;</sup></div><div class="forecast-temp"><div class="high">' + maxTemp + '<sup>&deg;</sup></div><div class="low">' + minTemp + '<sup>&deg;</sup></div></div></div>';
    setMainComponentDivHeight();
  }

  function setMainComponentDivHeight() {
    var containerHeight = d.getElementById('gridMain').clientHeight,
        contentContainer = d.getElementById('gridMainContent'),
        tempContainer = d.getElementById('temp-container');

    contentContainer.style.height = containerHeight + 'px';
    tempContainer.style.height = containerHeight + 'px';
  }

  function renderWind(gridElem) {
    var speed = Math.round(weatherData.currently.windSpeed * 3.6),
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

  function renderCloud(gridElem) {
    var cloudCover = weatherData.currently.cloudCover;

    gridElem.innerHTML = '';
    gridElem.innerHTML += '<img id="cloud-outline" src="assets/icons/cloud-outline.svg">';

    if (cloudCover == 0){
      gridElem.innerHTML += '<div class="current-cloud">clear</div>';
    } else {
      gridElem.innerHTML += '<img id="cloud-icon" src="assets/icons/cloud-icon.svg">';
      var cloud = d.getElementById('cloud-icon'),
          cloudWidth = cloud.offsetWidth,
          cloudHeight = cloud.offsetHeight,
          clippingHeight = cloudHeight * (1 - cloudCover);

      cloud.style.clip = 'rect(' + clippingHeight + 'px,' + cloudWidth + 'px,' + cloudHeight + 'px,0px)';
    }
  }


  function renderPrecip(gridElem) {
    var precipIntensity = Math.round(weatherData.hourly.data[0].precipIntensity*10) / 10;

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

  function renderHumidity(gridElem) {
    var humidity = weatherData.currently.humidity * 100;

    gridElem.innerHTML = '';

    gridElem.innerHTML += '<div class="current-humidity"><div class="humidity-value">' + humidity + '</div><span class="percent">%</span></div><img id="humidity-icon" src="assets/icons/humidity-icon.svg">';
  }

  function renderPressure(gridElem) {
    var pressure = Math.round(weatherData.currently.pressure);

    gridElem.innerHTML = '';

    gridElem.innerHTML += '<div class="current-pressure"><div class="pressure">' + pressure + '</div><div class="units">hPa</div></div><img id="pressure-outline" src="assets/icons/pressure-outline.svg"><img id="pressure-pointer" src="assets/icons/pressure-pointer.svg">';

    var pointerElem = d.getElementById('pressure-pointer'),
        rotateVal;

    if (pressure <= 1000){
      rotateVal = 337.5;
    } else if (pressure >= 1030) {
      rotateVal = 22.5;
    }

    if(navigator.userAgent.match("Chrome")){
  		pointerElem.style.WebkitTransform = "rotate("+rotateVal+"deg)";
  	} else if(navigator.userAgent.match("Firefox")){
  		pointerElem.style.MozTransform = "rotate("+rotateVal+"deg)";
  	} else if(navigator.userAgent.match("MSIE")){
  		pointerElem.style.msTransform = "rotate("+rotateVal+"deg)";
  	} else if(navigator.userAgent.match("Opera")){
  		pointerElem.style.OTransform = "rotate("+rotateVal+"deg)";
  	} else {
  		pointerElem.style.transform = "rotate("+rotateVal+"deg)";
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
    setComponents();
    d.getElementById('user-location-btn').addEventListener('click', function(){
      getUserLocation();
      toggleScreenClass('screen-home');
    });
    d.getElementById('location-search-btn').addEventListener('click', addLocation);
    window.addEventListener('resize', setMainComponentDivHeight);
  });
})(document);
