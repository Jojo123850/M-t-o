// ── Carte Leaflet ──
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

// ── Hook sur AffichageMeteo ──
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

// ── Favoris wrapper ──
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


class Meteo {
    constructor(name, temperature, description, longitude, latitude) {
        this.name = name;
        this.temperature = temperature;
        this.description = description;
        this.longitude = longitude;
        this.latitude = latitude;
    }
}

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
    document.getElementById("city").textContent = "Ville : " + maMeteo.name;
    document.getElementById("temp").textContent = "Température : " + maMeteo.temperature + "°C";
    document.getElementById("desc").textContent = "Description : " + maMeteo.description;
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
    0: "Impossible de déterminer la météo",
    1: "Ciel dégagé",
    2: "Nuages légers",
    3: "Partiellement nuageux",
    4: "Nuageux",
    5: "Pluie",
    6: "Pluie et neige",
    7: "Neige",
    8: "Averse de pluie",
    9: "Averse de neige",
    10: "Averse pluie et neige",
    11: "Brouillard léger",
    12: "Brouillard dense",
    13: "Pluie verglaçante",
    14: "Orage",
    15: "Bruine",
    16: "Tempête de sable"
};
function displayFavoris(){
    let favoris = JSON.parse(localStorage.getItem("favoris")) || [];
    let favList = document.getElementById("favorisList");
    favList.innerHTML = ""; 

    favoris.forEach((fav, index) => {
        const divFav = document.createElement("div");

        let p = document.createElement("span");
        p.textContent = `${fav.name} : ${fav.temperature} °C `;

        const btnDel = document.createElement("button");
        btnDel.textContent = "Supprimer";
        btnDel.onclick = function() {
            favoris.splice(index, 1);
            localStorage.setItem("favoris", JSON.stringify(favoris));
            displayFavoris();
        };

        divFav.appendChild(p);
        divFav.appendChild(btnDel);
        favList.appendChild(divFav);
    });
}


window.onload = function() {
    displayFavoris();
};