# Description fonctionnelle
AYA PECHE est une société opérant dans le domonine de pêche. Elle  affretent des bateaux et concluent des conventions avec des capitaines pour faire des marrées qui peuvent se durer une ou deux semaines. a la fin de marrees , les quanitités des captures dot être commercialisé  et les recettes de ventes sera partagé entre le société et le capitaine.
La marrée engendre ensemble des frais qui sont definis comme suit:
1. frais de carburant
2. frais de l'eau
3. frais de nouriture
4. frais de sardine
5. frais de glace
6. frais généreau
7. frais de salaires
8. Frais d'avance
9. frais de salaires
10. frais des PDR
11. reglement part capitaine. 
12. Autres frais
  Le beneficaire d'un paiement peut être un fournisseur , capitaine. Chaque pqiement doit clairement specifier la partie supportant l'imputation, et la marrée objet de la dépense.
Certains frais sera calculé sur la base d'une quantité et un prix unitaire alors que des autres sont forfetaires. 
Les frais peuvent être reglé par une caisse ou via un virement bancaire.
le montant depensé peut analytiquement être repartie entre les rubriques des depenses précisées auparavent.
Les types de paiement sont :
1 Dépense de la marree
2 autres charges

Les especes capturees essentiellement sont :
1 poulpe
2 PG
3 PF
4 PR
5 REJETS

Ces captures peuvent être stocké , ce qui engendre des frais de traitement et de stockage supplementaires. Chaque Journal de pêche doit pointer vers une marrée.
Apres la commercialisation les recettes de captures relatives à une marrees sera vendu conformement aux prix établis. Chaque espece doit avoir un prix conventionnel pour la vente et un prix de vente d'encouragement pour le capitaine.
La recette de vente doit être versé sur un compte bancaire ou recepcionné comme un cash. ce qui donne lieu à une repartition entre le virement et le cash d'une caisse. Chaque recette doit aussi pointer vers une marrée.


La caisse peut être alimenté par un retrait de la banque, ou via une reception de la cash resultant de la vente des captures de la marrees.

A la fin de chaque cycle de vie d'une marrée un bilan  doit etre etablie montrant les entrees (recettes de vente de marree ) et les sorties(depenses de la marrees). Ce bilan est appelle bilan de marrée.
le bilan de marree doit indiquer la repartition de recette en prenant compte les imputations des paiements enregistrées.

# Caisse
Il y a des caisse qui sont geré des caissiers. chaque caissier a un compte avec des privileges.les privileges sont : 
- Depense des marrees
- Alimentation par des recettes des marrees
- ordinaires

 La caisse doit avoir des journaux par mois. chaque journal represente un ensemble des transactions (lignes d imputation).
 ces lignes de deux sortes : ecriture de depense et ecriture de recette.
 chaque ecriture de depense  se refere a un compte de frais de depense , une marree ,un tag qui classe les transactions relative a l activite des marrees et les autres qui sont internes.
 chaque ecriture de depense a un type (reglement fournisseur,facture fournisseur, reglement part capitaine ou autres).
 les ecritures de depense  de type reglement ou facture de fournisseur doit inclue une reference au fournisseur. pour les ecritures de depense  de type Comptant il y aura un libele uniquement.
 Les ecritures d approvisionnement  selon les source  : compte bancaire ,  cash de recette de vente ou autres.
  Les ecritures d approvisionnement dont le source est le compte bancaires sont des alimentation a partir d un compte bancaires internes de l enterprise et elle ne se refere pas a une marree( c est le cash interne de l enterprise).
  Les ecritures d approvisionnement dont le source est une marree sont des recettes de vente . ce genre des ecriture se refere a une marre et une repartition de montant encaisse entre (un compte bancaire interne  de l enterprise + une partiede cash)
  Les ecritures d approvisionnement dont le source est part capitaine se refere a un capitaine et une marre ( le capitaine peut [etre deduit du marree et du bateau )
  Les ecritures d approvisionnement dont le source Depos :  ne se refere pas ni a une marree ni a un compte bancaires.(elle represente des montant empruntee qui ne sont pas une propriete de l enterprise
il est important d elaborer un bilan par marree et un bilan par capitaine.



# Objet des domaines 


## Les enumerations:
```diff
!  EnumTypePaiement : PaiementReglementFournisseur, PaiementComptant
!  EnumObjetDepense : DepenseMarree,  DepenseInterne
!  EnumFacturation: FacturationQuantitatif, FacturationForfaitaire
!  EnumFamilleEspece : POUPLPE, PG, PF, PR, REJETS

!  EnumStatueLogistiqueMarree : PreparationMarree, EnMere , Achevee
!  EnumStatueTresorieMarree: PasDeRecetteARecouvrer,EncoursRecouvrement, clotureeRecouvrement
!  EnumStatueStockVentu : NonEncoreVendu, VenduePartiellement, VendueTotalement

!  EnumStatueBateau: Fonctinnel, EnPanne,EnSommeil
!  EnumCompteFrais : Carburant,Eau, Nouriture, Sardine, Glace,Généreau, Salaires,Avance, PDR, ReglementPartCapitaine,AutreFrais
```
Les objets de domaines :

  ### Logistiques et planification microservice
 
```diff

@@ +(Locataire) @@
- nomLocatire
- 

@@ +(bateau) @@
- nomBateau
- capitaineCourant
- formulePartageRendment
- locataireBateau
- enumStatueBateau


@@  +(Marree) @@
- idBateau
- idCapitaine
- dateDepart
- dateRetour
- enumStatueLogistiqueMarree
- enumStatueTresorieMarree
- enumStatueStockVentu
- enumStatueBateau
- totalRecettesVente
- totalVersementsBancaires
- totalPaiementCash
- totalRestantNonRecouvree


@@ +(Fournisseurs) @@
- idFournisseur
- nomFournisseur

@@ +(Depenses) @@
- dateexecution, LocalDate
- Compte-de-frais, EnumCompteFrais
- Part_imputee_aya ,double
- Part_imputee_capitaine
- Type_paiement  (en terme, cash)
- Fournisseur 
- facture, string
- Objet_depense (marree,  interne)
- maree
- Type_detail (Quantitatif, forfaitaire)
- Qte, double
- PU, double
- gestion de stock (flag)
- Montant_tot, double



@@ +(Paiement_fournisseurs_marrees) @@
- Type_paiement  (en terme, cash)
- objet
- Fournisseur
- Maree
- libelle

@@ +(Paiements_capitaines) @@
- Type_paiement  (en terme, cash)
- objet
- marree
- montant, double
- date, LocalDate


@@ +(Bilan-maree) @@
- Total_recette
- Total_depense
- report_aya
- Report-capitaine
- Justif_report
- Part_du_aya
- Part_du-capitaine

```
### Tresorie et facturation ###

```diff

@@ +(Caisse) @@
code
sessions

@@ +(SessionCaisse) @@
- caisse
- datedebut
- dateFin
- AttributionSold
- journaux

@@ +(AttributionSold) @@
- sessioncaisse
- date de attribution de solde
- montant
- justificatif

@@ +(Journal) @@
- sessioncaisse
- Depenses
- PaiementsFournisseurs
- PaiementsCapitaines
- VirementRecettesMarree
- CashRecettesMarree


@@ + (Recettes_ventes_marrees) @@
- dateEncaissement
- espece
- poidsVendu, double
- Montant_total, double
- Maree
- Date , LocalDate
- libelle

@@ +(VirementRecettesMarree)
- datevirement
- comptebancaire
- montant, double
- justificatif
- comptebancaire
- marree

@@ +(CashRecettesMarree) @@
- datecash
- montant, double
- justificatif
- marree

  
@@ +(Comptebancaire) @@
- numero
- liblle

  ```

### Journaux des captures ###

```Diff

@@ +(famille)
- designation

  
@@ +(Espece)
- nom
- famille

@@ +(Journal_peche)
- dateEtab
- dateJP
- marree
- statue: enumJP
  
@@ +(Captures)
-  journal
-  espece
-  qteEspece ,double
-  puCapitaine , double
-  puSMCP, double
-  ptCapitain , double
-  ptSMCP, double
  


@@ +(capitaine)
- nomBateau

```

### Strategies commerciales
```Diff

+(FormulesPartageRendment)
- designation
- tarifEspecesApplique, 
- strategiePartage
- amortissnas

+(StrategiePartage)
- code
- pourcentageAYA
- pourcentageCapitaine
- active

+(AmortissementNAS)
- codeAmortissement, int
- tauxpourcentage , double
- active
  
+(TarifEspeces)
- codeTarif, int
- active
  
+(detailstarifs)
- espece
- qteComparaisonCapitaine
- puQteInferieurCapitaine
- puQteSupperieurCapitaine
- qteComparaisonSMCP
- puQteInferieurSMCP
- puQteSupperieurSMCP

```


l utilisateur doit avoir une caisse sinon il ne peut pas genere des transactions de caisse. Pour chaque exercice: on peut creer des marree et pour chaque marree on doit avoir les rubriques des depenses standarts et la possibiolite d ajouter un autre depense. la depense genere automatiquement une transaction comptable de type # TransactionsJournal dans le # Journal et si cette depense va etre regler en cash une # TransactionCaisse va etre generee dans la # SessionCaisse de # Caisse de l untilisateur encours.

Selon la depense , et selon le type de la transaction generree dans le journal , ces depense peut aussi generee des # PaiementFournisseurMarree(Facture des fournisseurs). Ces paiement peuevent etre regles via des transaction de caisse.

la caisse permet de gerer un montant pour suivre les entrees et sorties de cash pour un utilisateur specifique.

# Ayaapp

This app was created with Bootify.io - tips on working with the code [can be found here](https://bootify.io/next-steps/).

## Development

Update your local database connection in `application.properties` or create your own `application-local.properties` file to override
settings for development.

During development it is recommended to use the profile `local`. In IntelliJ `-Dspring.profiles.active=local` can be
added in the VM options of the Run Configuration after enabling this property in "Modify options".

After starting the application it is accessible under `localhost:8080`.

## Build

The application can be built using the following command:

```
gradlew clean build
```

Start your application with the following command - here with the profile `production`:

```
java -Dspring.profiles.active=production -jar ./build/libs/ayaapp-0.0.1-SNAPSHOT.jar
```

If required, a Docker image can be created with the Spring Boot plugin. Add `SPRING_PROFILES_ACTIVE=production` as
environment variable when running the container.

```
gradlew bootBuildImage --imageName=com.aya/ayaapp
```

## Further readings

* [Gradle user manual](https://docs.gradle.org/)  
* [Spring Boot reference](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)  
* [Spring Data JPA reference](https://docs.spring.io/spring-data/jpa/reference/jpa.html)
