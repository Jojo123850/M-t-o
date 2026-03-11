#  Météo du monde

##  Description
Cette application web permet de consulter la météo en temps réel pour n'importe quelle ville dans le monde.

L'utilisateur peut :
- rechercher une ville
- voir la température actuelle
- voir la description du temps avec une icône
- enregistrer des villes dans ses favoris et les supprimer

Les données météo proviennent de l'API Open-Meteo.

---

##  Fonctionnalités

-  Recherche d'une ville
- Affichage de la température
-  Description du temps
-  Latitude et longitude
-  Ajout aux favoris
- Sauvegarde des favoris avec localStorage
- Suppression des favoris

---

## Technologies utilisées

- HTML
- CSS
- JavaScript
- API Open-Meteo

---

## API utilisée

Géocodage :

https://geocoding-api.open-meteo.com/v1/search?name=VILLE&count=1&language=fr&format=json

Météo :

https://api.open-meteo.com/v1/forecast?latitude=LATITUDE&longitude=LONGITUDE&current_weather=true

---

## Structure du projet

Météo du Monde 
│  
├── index.html  
├── style.css  
├── script.js  
└── README.md  

---

## Auteur

Projet réalisé par Giovanie Andrianirina.