let voiture;
let directionsRenderer;
let directionsService;
let map;

//initialiser la carte
function initMap() {
  directionsRenderer = new google.maps.DirectionsRenderer({
    polylineOptions:{strokeColor : 'rgb(78, 233, 200)'}
  });
  directionsService = new google.maps.DirectionsService();

  //carte google map
  map = new google.maps.Map(document.getElementById("map"),
  {
    center: {lat : 0, lng : 0},
      zoom: 4,
  });
}

//si on click a coté de la carte de la liste, désélectionne le trajet visualisé
$(function(){
  let dedans = false;

  $('#map, #liste').hover(function(){
    dedans=true;
  }, function(){
    dedans=false;
  });

  $("body").mouseup(function(){
    if(!dedans) directionsRenderer.setMap(null);
  });
})

async function lancerCourse(depart, destination, waitpoint, nomLivreur, infoLivr, dateDepart){
  let localisation = await trouverLocalisation(depart, destination, waitpoint, false)
  //donner une couleur différente a chaque livreur (et donc a chaque voiture)
  $("#liste summary").each(function(){
    if ($(this).text() == nomLivreur) {
      let color = $(this).children("span").css("background-color");
      if (color == "rgba(0, 0, 0, 0)") {
        color = `rgb(${(Voiture.markers*100)%255}, ${(Voiture.markers*80)%255}, ${(Voiture.markers*56)%255})`;
        $(this).children("span").css("background-color", color);
      }
      voiture = new Voiture(map, nomLivreur, infoLivr, dateDepart, localisation.start_pos, localisation.duration, color);
      voiture.ajouterDirections = localisation.itineraire;
      voiture.rouler();
    }
  });
}

//cherche toutes les localisation et les itinéraires et les affiches sur la carte
async function trouverLocalisation(start, end, waitpoints, recherche){
  let directionRenderMap;
  if (!recherche) directionRenderMap = new google.maps.DirectionsRenderer();
  else directionRenderMap = directionsRenderer;

  directionRenderMap.setMap(map);
  let start_pos = await getAddresse(start);
  let end_pos = await getAddresse(end);
  let waitpointPosition = [];
  for await (i of waitpoints) {
    let point = await getAddresse(i.adresse.numero_rue + " " + i.adresse.nom_rue + " " + i.adresse.ville + " " + i.adresse.pays);
    waitpointPosition.push(
      {
        location : {lat : point.lat(), lng : point.lng()},
        stopover : true
      }
    );
  }
  let itineraire = await calulerItineraire(start_pos, end_pos, waitpointPosition, directionRenderMap);
  return ({start_pos : start_pos, itineraire : itineraire.tab, duration: itineraire.duration})
}

function getAddresse(address) {
  return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({address: address}, (results, status) => {
          if (status === 'OK') resolve(results[0].geometry.location);
          else reject(status);
      });
  });
};

//calculer itinéraire
function calulerItineraire(start_pos, end_pos, waitpointPosition, directionsRenderer) {
  return new Promise((resolve, reject) => {
    let tab = []
    directionsService.route(
      {
        origin: start_pos,
        destination: end_pos,
        travelMode: google.maps.TravelMode["DRIVING"],
        optimizeWaypoints: true,
        waypoints: waitpointPosition
      },
      (response, status) => {
        if (status == "OK") {
          tab.push({lat : start_pos.lat(), lng : start_pos.lng()})
          $.each(response.routes[0].legs, function(_, leg){
            $.each(leg.steps, function(_, step){
              $.each(step.path, function(_, e){
                tab.push({lat : e.lat(), lng : e.lng()});
              })
            })
          })
          tab.push({lat : end_pos.lat(), lng : end_pos.lng()});
          directionsRenderer.setDirections(response);
          resolve({tab: tab, duration: response.routes[0].legs[0].duration.value});
        } else reject(status);
      }
    );
  })
}
