class Itineraire{

    constructor(tab){
        this.tab = tab.livraisons;
    }

    getItineraireWithDate(date, tab){
        if (tab == undefined) tab = this.tab;
        return tab.filter(element => element.date == date);
    }

    getItineraireWithHour(hour, tab){
        if (tab == undefined) tab = this.tab;
        return tab.filter(element => element.heure == hour);
    }

    getItineraireWithDateAndHour(date, hour, tab){
        if (tab == undefined) tab = this.tab;
        tab = this.getItineraireWithDate(date);
        return this.getItineraireWithHour(hour, tab);
    }

    getItineraireWithDateAndLivreur(date, livreur, tab){
        if (tab == undefined) tab = this.tab;
        tab = this.getItineraireWithDate(date);
        return this.getItineraireWithLivreur(livreur, tab);
    }

    //retourne les livraisons d'un/des livreurs qui ont le nom/prénom qui comprennent val
    getItineraireWithLivreur(livreur, tab){
        if (tab == undefined) tab = this.tab;

        if (livreur.trim() == "") return tab;
  
        let tabNomPrenom = livreur.toLowerCase().split(' ').filter(element=> element!='');
        if (tabNomPrenom.length >1){
          return tab.filter(element => (element.livreur.nom.toLowerCase().includes(tabNomPrenom[0])||
              element.livreur.nom.toLowerCase().includes(tabNomPrenom[1])) &&
              (element.livreur.prenom.toLowerCase().includes(tabNomPrenom[1]) ||
              element.livreur.prenom.toLowerCase().includes(tabNomPrenom[0])));
        } else return tab.filter(element => element.livreur.nom.toLowerCase().includes(tabNomPrenom[0]) || element.livreur.prenom.toLowerCase().includes(tabNomPrenom[0]));
      }

      getListeLivreurs(tab){
        if (tab == undefined) tab = this.tab;
        let livreurs=[];
        tab.forEach(e => {
          let tabbe=livreurs.filter(elemen=> elemen.toLowerCase().includes(e.livreur.nom.toLowerCase() +" "+ e.livreur.prenom.toLowerCase()));
          if (tabbe.length == 0) livreurs.push(e.livreur.nom +" "+ e.livreur.prenom);
        })
        return livreurs;
      }

    get getTab(){
        return this.tab;
    }

}