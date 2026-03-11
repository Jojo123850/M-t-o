// Pour la carte
const map = L.map('france-map', {
  center: [46.5, 2.5],
  zoom: 5,
  scrollWheelZoom: true
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap © CARTO',
  maxZoom: 18
}).addTo(map);

let currentMarker = null;

const weatherIcon = L.divIcon({
  className: '',
  html: `<div class="map-pin">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

const _origAffichage = AffichageMeteo;
window.AffichageMeteo = function(meteo) {
  _origAffichage(meteo);

  document.querySelector('.weather-card-empty').style.display = 'none';
  document.querySelector('.weather-card-content').style.display = 'block';

  updateFavWrapper();

  if (currentMarker) map.removeLayer(currentMarker);
  currentMarker = L.marker([meteo.latitude, meteo.longitude], { icon: weatherIcon })
    .addTo(map)
    .bindPopup(`<div class="popup-content"><strong>${meteo.name}</strong><br>🌡️ ${meteo.temperature}°C</div>`)
    .openPopup();

  map.flyTo([meteo.latitude, meteo.longitude], 8, { animate: true, duration: 1.2 });
};


function updateFavWrapper() {
  const favs = JSON.parse(localStorage.getItem('favoris') || '[]');
  document.getElementById('favoritesWrapper').style.display = favs.length ? 'block' : 'none';
}

const _origDisplay = displayFavoris;
window.displayFavoris = function() {
  _origDisplay();
  updateFavWrapper();
};

window.addEventListener('load', updateFavWrapper);



// Météo
class Meteo {
    constructor(name, temperature, description, longitude, latitude) {
        this.name = name;
        this.temperature = temperature;
        this.description = description;
        this.longitude = longitude;
        this.latitude = latitude;
    }
}

//
let lastMeteo = null;

async function getWeather() {
    let ville = document.getElementById("ville").value;
    if (!ville) return alert("Veuillez saisir une ville");

    try {
       
        let geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${ville}&count=1&language=fr&format=json`;
        
        let geoCoding = await fetch(geoUrl);
        let geodatas = await geoCoding.json();

        if (!geodatas.results || geodatas.results.length === 0) {
            throw new Error("Ville introuvable");
        }

        let latitude = geodatas.results[0].latitude;
        let longitude = geodatas.results[0].longitude;
        let nomVille = geodatas.results[0].name;

       
        let meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
        
        let meteoResponse = await fetch(meteoUrl);
        let meteoData = await meteoResponse.json();

        let codeMeteo = meteoData.current_weather.weathercode;
        let description = weatherDescriptions[codeMeteo];

        let temperature = meteoData.current_weather.temperature;
     

        let maMeteo = new Meteo(nomVille, temperature, description, longitude, latitude);

        lastMeteo = maMeteo; 
        AffichageMeteo(maMeteo);
        afficherBoutonFavoris();

    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}


function AffichageMeteo(maMeteo){
    document.getElementById("city").textContent =  maMeteo.name;
    document.getElementById("temp").textContent = "Température : " + maMeteo.temperature + "°C";
    document.getElementById("desc").textContent = maMeteo.description;
    document.getElementById("coord").textContent = `Latitude : ${maMeteo.latitude}, Longitude : ${maMeteo.longitude}`;
}


function afficherBoutonFavoris() {
    const favDiv = document.getElementById("favorites");
    favDiv.innerHTML = ""; 

    const buttonAdd = document.createElement("button");
    buttonAdd.textContent = "Ajouter aux favoris";
    buttonAdd.onclick = function() {
        addFavorites(lastMeteo);
    };
    favDiv.appendChild(buttonAdd);
}

function addFavorites(maMeteo){
    if (!maMeteo) return;

    let favoris = JSON.parse(localStorage.getItem("favoris")) || [];

    if (!favoris.some(f => f.name === maMeteo.name)) {
        favoris.push(maMeteo);
        localStorage.setItem("favoris", JSON.stringify(favoris));

        displayFavoris();
        alert(`${maMeteo.name} ajoutée aux favoris !`);
        
    } else {
        alert("Cette ville est déjà dans vos favoris");
    }
}

const weatherDescriptions = {
  0: "🔆 Soleil et ciel bleu",
        1: "🌤️ Soleil, légèrement nuageux",
        2: "⛅ En partie nuageux",
        3: "☁️ Couvert",
        45: "🌫️ Brouillard",
        48: "🧊 Gros brouilard",
        51: "🌦️ Légères averses",
        53: "🌦️ Bruine",
        55: "🌦️ Forte bruine",
        56: "🌧️ Bruine froide",
        57: "🌧️ Bruine glacée",
        61: "🌧️ Pluie légère",
        63: "🌧️ Pluie",
        65: "🌧️ Forte pluie",
        66: "🌧️ Pluie froide",
        67: "🌧️ Pluie glacée",
        71: "🌨️ Neige légère",
        73: "🌨️ Neige",
        75: "🌨️ Forte Neige",
        80: "🌦️ Drache légère",
        81: "🌧️ Drache",
        83: "🌧️ Forte drache",
        86: "🌨️ Pluie de neige",
        95: "⛈️ Orage",
        96: "⛈️ Orages légers avec grêle",
        99: "⛈️ Orages avec grêle"
}


function displayFavoris(){
    let favoris = JSON.parse(localStorage.getItem("favoris")) || [];
    let favList = document.getElementById("favorisList");
    favList.innerHTML = ""; 

    favoris.forEach((fav, index) => {
        const divFav = document.createElement("div");
        
        let p = document.createElement("span");
        p.textContent = `${fav.name} : ${fav.temperature} °C
         `;

        const btnDel = document.createElement("button");
        btnDel.textContent = "Supprimer";
        btnDel.onclick = function() {
            favoris.splice(index, 1);
            localStorage.setItem("favoris", JSON.stringify(favoris));
            displayFavoris();
        };

       const btnSee = document.createElement("button");
        btnSee.textContent = "Voir";

        btnSee.onclick = function() {
            AffichageMeteo(fav);
        };
       

        divFav.appendChild(p);
        divFav.appendChild(btnDel);
        favList.appendChild(divFav);
        divFav.appendChild(btnSee);
    });
}


window.onload = function() {
    displayFavoris();
};