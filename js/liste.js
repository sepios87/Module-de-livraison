import {lancerLivraison} from './livrer.js';

$(function(){

    let itineraire;

    //Récupère les villes de l'api et la liste dans un tableau.
    $.ajax({url: "donnees.json", dataType : 'json', success: function(result){
      itineraire = new Itineraire(result);
      let livraisonsDates = itineraire.getItineraireWithDate(new Date().toLocaleDateString('en-CA'));
      let livreurs = itineraire.getListeLivreurs(livraisonsDates,livraisonsDates);
      afficherListeLivreur(livreurs, livraisonsDates);
    }});

    //vérifier toute les minutes si un livreur doit partir
    setInterval(() => {
      let time = new Date();
      lancerLivraison(itineraire.getItineraireWithDateAndHour(time.toLocaleDateString('en-CA'), time.getHours() + "h" + time.getMinutes().toString().padStart(2, "0")));
    }, 60000);

    //recherche en fonction de la date
    $("#datepicker").datepicker({
        showOn: "button",
        buttonImage: "image/calendar.png",
        buttonImageOnly: true,
        buttonText: "Select date"
      }).val(new Date().toLocaleDateString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'}));
    $("#datepicker").on("change", function(){
      let livraisons = itineraire.getItineraireWithDate(new Date($(this).val()).toLocaleDateString('en-CA'));
      let livreurs = itineraire.getListeLivreurs(livraisons);
      afficherListeLivreur(livreurs, livraisons);
    });

    //recherche par livreurs
    $("#search").on("keyup", () => rechercherItineraireLivreurs());

    function rechercherItineraireLivreurs(){
      let livraisons = itineraire.getItineraireWithDateAndLivreur(new Date($("#datepicker").val()).toLocaleDateString('en-CA'), ($("#search").val()));
      let livreurs = itineraire.getListeLivreurs(livraisons);
      afficherListeLivreur(livreurs, livraisons);
    }

    function afficherListeLivreur(livreurs, livraisonsDates){
      $("details").remove();
      $.each(livreurs, function(_, item){
        let livraisonsLivreurs = itineraire.getItineraireWithLivreur(item, livraisonsDates);
        afficherLivreur(item, livraisonsLivreurs);
      })
    }

    function afficherLivreur(elem, table){
      let nomLivreur = $(`<summary>${elem}<span></span></summary>`);
      let divList = $('<details class="detailLivreurs"></details>');

      divList.append(nomLivreur);

      $.each(table, function(_, e){
        const div= $(`<div class="livraison"></div>`);

        div.append($(`<p>Client: ${e.client.nom} </p>
          <p>Date de livraison: ${e.date} - ${e.heure} </p>
          <p>Détail de la livraison: ${e.commande} </p>`));

        if (e.arrets.length>0) {
          const details = $('<details> </details>'); 
          
          if (e.arrets.length==1) details.append($(`<summary> L'arret : </summary>`));
          else details.append($(`<summary> Les arrets : </summary>`));
          
          $.each(e.arrets, function(_, elem){
            details.append($(`<p class="arret">${elem.adresse.numero_rue}, ${elem.adresse.nom_rue}, </br> ${elem.adresse.code_postal} ${elem.adresse.ville} </br>${elem.adresse.pays}</p>`));
          })

          div.append(details); 
        }

        const btn_visualiser = $(
        `<div class="buttons btn_trajet">
            <div class="container">
              <a class="btn effect04" data-sm-link-text="C'est parti !" target="_blank">
              <span>Visualiser trajet</span></a>
            </div>
        </div>`);

        $(".detailLivreurs").on("click", function () {
          $(".detailLivreurs[open]").not(this).removeAttr("open");
        });

        //visualiser le trajet
        $(btn_visualiser).on('click', function(){
          trouverLocalisation(
            e.adresse_depart.numero_rue + " " + e.adresse_depart.nom_rue + " " + e.adresse_depart.ville,
            e.client.adresse_livraison.numero_rue + " " + e.client.adresse_livraison.nom_rue + " " + e.client.adresse_livraison.ville,
            e.arrets,
            true
          )
        });

        div.append(btn_visualiser);
        divList.append(div);
      });
      $("#liste").append(divList);
    }
  });
