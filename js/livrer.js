export function lancerLivraison(livraison){

    if (livraison.length >= 1){
      $.each(livraison, function(_, e){
          const depart = e.adresse_depart.numero_rue + " " + e.adresse_depart.nom_rue + " " + e.adresse_depart.ville;
          const dest = e.client.adresse_livraison.numero_rue + " " + e.client.adresse_livraison.nom_rue + " " + e.client.adresse_livraison.ville;
          const nomLivreur = e.livreur.nom + " " + e.livreur. prenom;
          const infoLivr = e.commande;
          const waitpoint = e.arrets;
          lancerCourse(depart, dest, waitpoint, nomLivreur, infoLivr, new Date());
        })
      }
}