# Broadway à Strasbourg — V8.5

Version de travail locale, non publiée sur GitHub.

Cette version reprend le prototype frontend du formulaire de candidature et intègre la relecture complète du parcours :
- suppression du hero et de la colonne latérale : arrivée directe sur le formulaire ;
- formulaire réduit de 5 à 4 étapes : Informations, Parcours, Profil vocal, Validation ;
- suppression de l’étape Disponibilités ;
- suppression du choix du morceau solo dans la candidature initiale ;
- ajout de « Je ne sais pas encore » pour le type de voix ;
- étape Profil vocal recentrée sur les matériaux et le Guide de préparation ;
- simplification des champs facultatifs et de leurs libellés ;
- récapitulatif final allégé ;
- bouton « Envoyer ma candidature » visible uniquement à la dernière étape ;
- messages d’erreur intégrés au formulaire au lieu des alertes navigateur ;
- amélioration du comportement mobile (progression compacte, CTA principal pleine largeur, retour discret) ;
- écran final simplifié : Merci, information sur l’e-mail de confirmation, spam/contact, lien vers les matériaux ;
- correction des espacements du bloc de validation et de l’alignement des champs en grille.

Le formulaire reste un prototype frontend : aucun backend n’est connecté, aucun e-mail n’est envoyé et aucune donnée n’est enregistrée. Le lien vers les matériaux reste provisoire. La Politique de confidentialité est désormais intégrée au site.


## V9.3
La section « Le projet » utilise une mosaïque de photographies réelles. La photo de l’orchestre au Palais universitaire est créditée à Mustafa Antoine. Les autres images sont chargées depuis Wikimedia Commons et leurs crédits sont accessibles sous la mosaïque.


## V9.3
- Ajout de la page `mentions-legales/`.
- Lien « Mentions légales » activé dans tous les footers.


## V9.3
- Ajout de la page `/conditions-generales-de-vente/`, transcription fidèle des CGV adoptées du 27 janvier 2026.
- Activation du lien « Conditions générales de vente » dans tous les footers.

- `confidentialite/` : Politique de confidentialité du site et des candidatures


## V10-3 — formulaire connecté

- API de production : `https://broadway-api.artsculturealsace.eu/apply`
- Base : Cloudflare D1 (juridiction UE)
- Anti-spam : Cloudflare Turnstile, site key publique intégrée au frontend
- E-mails transactionnels : Brevo
- Le bouton des matériaux reste volontairement inactif tant que `/auditions/materiaux/` n’est pas finalisé.
- Ne jamais placer de secret Turnstile ou de clé API Brevo dans le dépôt frontend.


### V10-1
- Nouveau favicon Broadway simplifié : B sans-serif doré sur fond sombre.


### V10-3
- HOME / section « Le projet » harmonisée à partir de la V10-1, sans changement d’architecture.
- NYC Light Painting devient l’image principale en haut à gauche.
- Ajout du BBC Symphony Orchestra, recadré/zoomé sur l’orchestre.
- Photo du Palais universitaire conservée ; mosaïque ramenée à cinq images.
- Bloc texte légèrement resserré et paragraphe structuré par un filet doré discret.

### V10-4
- Ajout de la photo de Julian Bigg dirigeant *Psychose* (photo Luis Calcurian, droits Arts Culture Alsace), optimisée pour le web.
- Ajustement léger de la rangée basse de la mosaïque « Le projet » pour accueillir la nouvelle image sans modifier la composition générale.
- Logo Arts Culture Alsace du footer rendu cliquable vers https://artsculturealsace.eu/ sur toutes les pages.


### V10-5
- Suppression de la photo de l’orchestre au Palais universitaire dans la mosaïque « Le projet ».
- Ajout d’une photo du trio de chanteuses (Excellence Concerts).
- Ajout de la photo PxHere n°932935 (CC0).
- Composition de la mosaïque ajustée sans modifier la structure générale de la section.


### V10-6
- Retrait de la photo PxHere n°932935 de la mosaïque « Le projet ».
- Rééquilibrage de la rangée basse : la photo Psychose est légèrement élargie et la photo du trio occupe l’espace restant.


### V10-7
- Page `/auditions/` allégée : retrait des sections « Qui peut participer ? », « Distribution » et « Le jour de l’audition » afin d’éviter les répétitions avec les modalités, le règlement et le futur guide de préparation.


### V10-8
- Page Auditions : séparateurs fins ajoutés entre L’EXPÉRIENCE / PRÉPARER TON AUDITION et PRÉPARER TON AUDITION / COMMENT ÇA SE PASSE ?.
- Page Modalités : suppression des petits surtitres de section ; les grands titres restent seuls.


### V11
- Micro-corrections de la page Modalités : clarification des deux morceaux imposés, mention du guide de préparation, lien de confidentialité mis en évidence, séparateurs entre sections sombres et bloc règlement simplifié.
- Le titre « Broadway à Strasbourg » du header et du footer renvoie désormais systématiquement au HOME / hero.


### V11-1
- Footer : rétablissement de la disposition verticale d’origine (Broadway au-dessus, logo ACA en dessous), tout en conservant le lien vers l’accueil.
- Modalités : ajout d’un bouton « Voir la page auditions » sous le bouton du règlement complet.
