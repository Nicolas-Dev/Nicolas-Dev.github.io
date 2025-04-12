document.addEventListener('DOMContentLoaded', function() {
    // Configuration de base
    const configuration = {
        API_PREDIGGO: 'https://electrodepot-prod.prediggo.services/prod-ed-K5mGEwsPU2Sr6Dtu/3.0/autoComplete',
        MODELES_CARTES: {
            'neuf.png': 'neuf.png',
            'reconditionne.png': 'reconditionne.png',
            'NeufBlackfrayday.png': 'NeufBlackfrayday.png',
            'ReconBlackfrayday.png': 'ReconBlackfrayday.png'
        },
        IMAGES_OPTIONS: {
            'chargeur.png': 'chargeur.png',
            'cable.png': 'cable.png',
            'ecouteur.png': 'ecouteur.png',
            'coque.png': 'coque.png',
            'verretrempe.png': 'verretrempe.png'
        },
        VARIATIONS_MODELE: {
            'basique': [],
            'communes': ['', 'plus', 'pro', 'max', 'mini', 'lite', 'ultra'],
            'toutes': ['', 'plus', 'pro', 'max', 'mini', 'lite', 'ultra', 'edge', 'neo', 'fe', '5g', '4g', 'xl']
        }
    };

    // Éléments DOM
    const elements = {
        champRecherche: document.getElementById('champ-recherche'),
        boutonRecherche: document.getElementById('bouton-recherche'),
        resultatsProduits: document.getElementById('resultats-produits'),
        sectionGenerateur: document.getElementById('section-generateur-carte'),
        boutonRetourCarte: document.getElementById('bouton-retour-carte'),
        messageEtat: document.getElementById('message-etat'),
        boutonImprimer: document.getElementById('imprimer-carte'),
        imageTelephone: document.getElementById('image-telephone'),
        texteTelephone: document.getElementById('texte-telephone'),
        conteneurImageTelephone: document.getElementById('conteneur-image-telephone'),
        previsualisationCarte: document.getElementById('previsualisation-carte'),
        etatExport: document.getElementById('etat-export'),
        tailleImage: document.getElementById('taille-image'),
        positionX: document.getElementById('position-x'),
        positionY: document.getElementById('position-y'),
        tailleTexte: document.getElementById('taille-texte'),
        positionYTexte: document.getElementById('position-y-texte'),
        typeCarte: document.getElementById('type-carte'),
        templateImpression: document.getElementById('template-impression'),
        boutonRafraichir: document.getElementById('rafraichir-carte'),
        basculeTheme: document.getElementById('bascule-theme'),
        conteneurSuperposition: document.getElementById('conteneur-superposition'),
        boutonsOption: document.querySelectorAll('.bouton-option'),
        textePersonnalise: document.getElementById('texte-personnalise'),
        boutonRechercheAvancee: document.getElementById('bouton-recherche-avancee'),
        rechercheAvancee: document.getElementById('recherche-avancee'),
        champMarque: document.getElementById('champ-marque'),
        champModele: document.getElementById('champ-modele'),
        variantesRecherche: document.getElementById('variantes-recherche'),
        boutonRechercheAvanceeExecuter: document.getElementById('bouton-recherche-avancee-executer'),
        barreProgressionRecherche: document.getElementById('barre-progression-recherche'),
        progressionRecherche: document.getElementById('progression-recherche'),
        boutonDeconnexion: document.getElementById('bouton-deconnexion')
    };
    
    // État de l'application
    const etat = {
        produitSelectionne: null,
        imagesModeles: {},
        imagesOptions: {},
        produits: [],
        modeleActuel: 'neuf.png',
        modeSombre: false,
        optionsSelectionnees: [],
        fileRecherche: [],
        indexRechercheActuel: 0,
        resultatsRecherche: []
    };
    
    // Initialisation de l'application
    function initialiser() {
        configurerEcouteurs();
        chargerToutesImagesModeles();
        chargerToutesImagesOptions();
        rechercherProduits('');
        verifierPreferenceTheme();
    }
    
    // Configuration des écouteurs d'événements
    function configurerEcouteurs() {
        // Recherche de base
        elements.boutonRecherche.addEventListener('click', gererRecherche);
        elements.champRecherche.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') gererRecherche();
        });
        
        // Navigation
        elements.boutonRetourCarte.addEventListener('click', () => {
            elements.sectionGenerateur.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        
        // Paramètres de la carte
        elements.typeCarte.addEventListener('change', function() {
            etat.modeleActuel = this.value;
            mettreAJourPrevisualisationCarte();
        });
        
        // Mise à jour de la prévisualisation
        elements.tailleImage.addEventListener('input', mettreAJourPrevisualisation);
        elements.positionX.addEventListener('input', mettreAJourPrevisualisation);
        elements.positionY.addEventListener('input', mettreAJourPrevisualisation);
        elements.tailleTexte.addEventListener('input', mettreAJourPrevisualisation);
        elements.positionYTexte.addEventListener('input', mettreAJourPrevisualisation);
        elements.textePersonnalise.addEventListener('input', mettreAJourPrevisualisation);
        
        // Actions
        elements.boutonImprimer.addEventListener('click', imprimerCarte);
        elements.boutonRafraichir.addEventListener('click', rafraichirCarte);
        
        // Thème
        elements.basculeTheme.addEventListener('change', basculerModeSombre);
        
        // Options supplémentaires
        elements.boutonsOption.forEach(bouton => {
            bouton.addEventListener('click', function() {
                const option = this.getAttribute('data-option');
                basculerOption(option, this);
            });
        });
        
        // Recherche avancée
        elements.boutonRechercheAvancee.addEventListener('click', function() {
            this.classList.toggle('actif');
            elements.rechercheAvancee.classList.toggle('actif');
        });
        
        elements.boutonRechercheAvanceeExecuter.addEventListener('click', gererRechercheAvancee);
        
        // Déconnexion
        elements.boutonDeconnexion.addEventListener('click', function() {
            localStorage.removeItem('estConnecte');
            window.location.href = 'login.html';
        });
    }
    
    // Vérifie la préférence de thème de l'utilisateur
    function verifierPreferenceTheme() {
        const prefereSombre = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const themeEnregistre = localStorage.getItem('theme');
        
        if (themeEnregistre === 'dark' || (!themeEnregistre && prefereSombre)) {
            activerModeSombre();
        }
    }
    
    // Bascule entre les modes clair et sombre
    function basculerModeSombre() {
        if (etat.modeSombre) {
            desactiverModeSombre();
        } else {
            activerModeSombre();
        }
    }
    
    // Active le mode sombre
    function activerModeSombre() {
        document.documentElement.setAttribute('data-theme', 'dark');
        elements.basculeTheme.checked = true;
        etat.modeSombre = true;
        localStorage.setItem('theme', 'dark');
    }
    
    // Désactive le mode sombre
    function desactiverModeSombre() {
        document.documentElement.removeAttribute('data-theme');
        elements.basculeTheme.checked = false;
        etat.modeSombre = false;
        localStorage.setItem('theme', 'light');
    }
    
    // Active/désactive une option supplémentaire
    function basculerOption(option, bouton) {
        const index = etat.optionsSelectionnees.indexOf(option);
        
        if (index === -1) {
            etat.optionsSelectionnees.push(option);
            bouton.classList.add('actif');
        } else {
            etat.optionsSelectionnees.splice(index, 1);
            bouton.classList.remove('actif');
        }
        
        mettreAJourImagesSuperposition();
    }
    
    // Met à jour les images des options supplémentaires
    function mettreAJourImagesSuperposition() {
        elements.conteneurSuperposition.innerHTML = '';
        
        etat.optionsSelectionnees.forEach(option => {
            if (etat.imagesOptions[option]) {
                const img = document.createElement('img');
                img.className = 'image-superposition';
                img.src = etat.imagesOptions[option].src;
                img.alt = option.replace('.png', '');
                elements.conteneurSuperposition.appendChild(img);
            }
        });
    }
    
    // Charge toutes les images des options supplémentaires
    function chargerToutesImagesOptions() {
        const promesses = Object.entries(configuration.IMAGES_OPTIONS).map(([cle, url]) => {
            return new Promise((resoudre) => {
                const img = new Image();
                img.onload = () => {
                    etat.imagesOptions[cle] = img;
                    resoudre();
                };
                img.onerror = () => {
                    console.error("Erreur de chargement de l'option:", url);
                    resoudre();
                };
                img.src = url;
            });
        });
        
        Promise.all(promesses).then(() => {
            mettreAJourImagesSuperposition();
        });
    }
    
    // Rafraîchit l'image du produit dans la carte
    function rafraichirCarte() {
        if (!etat.produitSelectionne) return;
        
        const imgProduit = new Image();
        imgProduit.onload = function() {
            elements.imageTelephone.src = this.src;
            afficherEtatExport("Carte actualisée", 'succes');
        };
        imgProduit.onerror = function() {
            afficherEtatExport("Erreur de chargement de l'image", 'erreur');
        };
        imgProduit.src = etat.produitSelectionne.image + '?t=' + new Date().getTime();
    }
    
    // Gère la recherche de base
    function gererRecherche() {
        const requete = elements.champRecherche.value.trim();
        if (requete) {
            etat.resultatsRecherche = [];
            rechercherProduits(requete);
        }
    }
    
    // Gère la recherche avancée
    function gererRechercheAvancee() {
        const marque = elements.champMarque.value.trim();
        const modele = elements.champModele.value.trim();
        const niveauVariation = elements.variantesRecherche.value;
        
        if (!marque || !modele) {
            afficherMessageEtat("Veuillez entrer une marque et un modèle", 'erreur');
            return;
        }
        
        etat.resultatsRecherche = [];
        elements.barreProgressionRecherche.style.display = 'block';
        elements.progressionRecherche.style.width = '0%';
        
        // Générer les requêtes de recherche
        const variations = configuration.VARIATIONS_MODELE[niveauVariation];
        etat.fileRecherche = variations.map(variation => {
            const requete = `${marque} ${modele}${variation ? ' ' + variation : ''}`.trim();
            return requete;
        });
        
        etat.indexRechercheActuel = 0;
        traiterFileRecherche();
    }
    
    // Traite la file d'attente des recherches
    function traiterFileRecherche() {
        if (etat.indexRechercheActuel >= etat.fileRecherche.length) {
            // Toutes les recherches sont terminées
            elements.barreProgressionRecherche.style.display = 'none';
            afficherTousProduits();
            return;
        }
        
        const requete = etat.fileRecherche[etat.indexRechercheActuel];
        const progression = (etat.indexRechercheActuel / etat.fileRecherche.length) * 100;
        elements.progressionRecherche.style.width = `${progression}%`;
        
        rechercherProduits(requete).then(() => {
            etat.indexRechercheActuel++;
            setTimeout(traiterFileRecherche, 500); // Petit délai entre les requêtes
        });
    }
    
    // Charge tous les modèles de carte
    function chargerToutesImagesModeles() {
        const promesses = Object.entries(configuration.MODELES_CARTES).map(([cle, url]) => {
            return new Promise((resoudre) => {
                const img = new Image();
                img.onload = () => {
                    etat.imagesModeles[cle] = img;
                    resoudre();
                };
                img.onerror = () => {
                    console.error("Erreur de chargement du modèle:", url);
                    resoudre();
                };
                img.src = url;
            });
        });
        
        Promise.all(promesses).then(() => {
            mettreAJourPrevisualisationCarte();
        });
    }
    
    // Met à jour la prévisualisation de la carte
    function mettreAJourPrevisualisationCarte() {
        if (etat.imagesModeles[etat.modeleActuel]) {
            elements.previsualisationCarte.src = etat.imagesModeles[etat.modeleActuel].src;
            mettreAJourPrevisualisation();
        }
    }
    
    // Génère un ID de session unique
    function genererIdSession() {
        return 'prediggo-ed-' + crypto.randomUUID();
    }

    // Récupère les en-têtes pour la requête API
    function obtenirEnTetes(idSession) {
        return {
            'accept': 'application/json, text/plain, */*',
            'content-type': 'application/json',
            'x-prediggo-session': idSession
        };
    }

    // Prépare le corps de la requête API
    function obtenirCorpsRequete(requete, idSession) {
        return JSON.stringify({
            moduleVersion: "VueJs_1.0.0",
            sessionId: idSession,
            region: "fr_FR",
            query: requete
        });
    }
    
    // Nettoie le nom du produit pour l'affichage
    function nettoyerNomProduit(nom) {
        if (!nom) return '';
        return nom.replace(/\b(smartphone|reconditionné|reconditionne|reconditionnée|reconditionnee)\b/gi, '').trim();
    }
    
    // Effectue une recherche de produits
    async function rechercherProduits(requete) {
        try {
            if (etat.indexRechercheActuel === 0) {
                afficherChargement();
            }
            
            const idSession = genererIdSession();
            const enTetes = obtenirEnTetes(idSession);
            const corps = obtenirCorpsRequete(requete, idSession);

            const reponse = await fetch(configuration.API_PREDIGGO, {
                method: 'POST',
                headers: enTetes,
                body: corps,
                mode: 'cors',
                credentials: 'omit'
            });

            if (!reponse.ok) {
                throw new Error(`Erreur HTTP: ${reponse.status}`);
            }

            const donnees = await reponse.json();
            traiterResultatsRecherche(donnees, requete);
            
        } catch (erreur) {
            console.error('Erreur:', erreur);
            if (etat.indexRechercheActuel === 0) {
                afficherAucunResultat();
            }
        }
    }
    
    // Traite les résultats de la recherche
    function traiterResultatsRecherche(donnees, requete) {
        if (donnees.items && donnees.items.length > 0) {
            donnees.items.forEach(item => {
                if (item.itemType === "PRODUCT" && item.matches) {
                    item.matches.forEach(produit => {
                        const attributs = produit.attributeInfo || [];
                        const nom = obtenirValeurAttribut(attributs, 'name');
                        const image = obtenirValeurAttribut(attributs, 'imageUrl');
                        const reference = obtenirValeurAttribut(attributs, 'refCode');
                        const prix = obtenirValeurAttribut(attributs, 'price');
                        const note = obtenirValeurAttribut(attributs, 'rating');
                        const grade = obtenirValeurAttribut(attributs, 'grade');
                        const reparabilite = obtenirValeurAttribut(attributs, 'indice_reparabilite');
                        
                        const caracteristiques = [];
                        for (let i = 1; i <= 3; i++) {
                            const carac = obtenirValeurAttribut(attributs, `cle_attribut_${i}`);
                            if (carac) {
                                caracteristiques.push(carac);
                            }
                        }
                        
                        if (nom) {
                            // Vérifier si le produit existe déjà
                            const indexProduitExistant = etat.resultatsRecherche.findIndex(p => p.reference === reference);
                            
                            if (indexProduitExistant === -1) {
                                etat.resultatsRecherche.push({
                                    id: reference || Math.random().toString(36).substr(2, 9),
                                    nom: nom,
                                    nomPropre: nettoyerNomProduit(nom),
                                    image: image || 'https://via.placeholder.com/200x200?text=Image+non+disponible',
                                    reference: reference || 'N/A',
                                    prix: prix ? parseFloat(prix).toFixed(2) + '€' : 'N/A',
                                    note: note ? parseFloat(note) : null,
                                    grade: grade || null,
                                    reparabilite: reparabilite ? parseFloat(reparabilite) : null,
                                    caracteristiques: caracteristiques,
                                    requeteRecherche: requete
                                });
                            }
                        }
                    });
                }
            });
        }
        
        if (etat.indexRechercheActuel === 0 || etat.indexRechercheActuel >= etat.fileRecherche.length) {
            afficherTousProduits();
        }
    }
    
    // Affiche tous les produits trouvés
    function afficherTousProduits() {
        if (etat.resultatsRecherche.length === 0) {
            afficherAucunResultat();
            return;
        }
        
        elements.resultatsProduits.innerHTML = '';
        
        // Trier les résultats par note (si disponible)
        const produitsTries = [...etat.resultatsRecherche].sort((a, b) => {
            if (a.note && b.note) {
                return b.note - a.note;
            }
            return 0;
        });
        
        produitsTries.forEach((produit, index) => {
            const carte = document.createElement('div');
            carte.className = 'carte-produit';
            carte.style.setProperty('--delai', `${index * 0.05}s`);
            
            let etoilesNote = '';
            if (produit.note) {
                const etoilesPleines = Math.floor(produit.note);
                const aDemiEtoile = produit.note % 1 >= 0.5;
                
                for (let i = 0; i < 5; i++) {
                    if (i < etoilesPleines) {
                        etoilesNote += '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
                    } else if (i === etoilesPleines && aDemiEtoile) {
                        etoilesNote += '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><defs><linearGradient id="half-star" x1="0" x2="100%" y1="0" y2="0"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#half-star)"></polygon></svg>';
                    } else {
                        etoilesNote += '<svg width="14" height="14" viewBox="0 0 24 24" fill="transparent" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
                    }
                }
            }
            
            let badgeGrade = '';
            if (produit.grade) {
                badgeGrade = `<div class="grade-produit">Grade ${produit.grade}</div>`;
            }
            
            let infoReparabilite = '';
            if (produit.reparabilite) {
                infoReparabilite = `
                    <div class="reparabilite">
                        <span>Indice réparabilité:</span>
                        <span class="score-reparabilite">${produit.reparabilite.toFixed(1)}/10</span>
                    </div>
                `;
            }
            
            let htmlCaracteristiques = '';
            if (produit.caracteristiques && produit.caracteristiques.length > 0) {
                htmlCaracteristiques = `
                    <div class="caracteristiques">
                        ${produit.caracteristiques.map(carac => `<div class="element-caracteristique">${carac}</div>`).join('')}
                    </div>
                `;
            }
            
            carte.innerHTML = `
                <div class="conteneur-image-produit">
                    <img src="${produit.image}" 
                         alt="${produit.nom}" 
                         class="image-produit"
                         onerror="this.src='https://via.placeholder.com/200x200?text=Image+non+disponible'">
                </div>
                <div class="infos-produit">
                    <div class="nom-produit">${produit.nom}</div>
                    ${badgeGrade}
                    <div class="prix-produit">${produit.prix}</div>
                    ${produit.note ? `
                        <div class="note-produit">
                            <div class="etoiles-note">${etoilesNote}</div>
                            <div class="valeur-note">${produit.note.toFixed(1)}/5</div>
                        </div>
                    ` : ''}
                    <div class="ref-produit">Ref: ${produit.reference}</div>
                    ${infoReparabilite}
                    ${htmlCaracteristiques}
                </div>
            `;
            carte.addEventListener('click', () => {
                etat.produitSelectionne = produit;
                elements.textePersonnalise.value = produit.nomPropre;
                afficherGenerateurCarte();
            });
            elements.resultatsProduits.appendChild(carte);
        });
    }
    
    // Affiche l'état "Aucun résultat"
    function afficherAucunResultat() {
        elements.resultatsProduits.innerHTML = `
            <div class="aucun-resultat">
                <img src="https://www.electrodepot.fr/static/version1742483201/frontend/Pictime/electrodepot/fr_FR/images/logo_ed.svg" 
                     alt="Electro Dépôt" 
                     class="logo-aucun-resultat">
                <svg class="icone-aucun-resultat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>Aucun produit trouvé</h3>
                <p>Essayez avec d'autres termes de recherche</p>
            </div>
        `;
    }
    
    // Affiche le générateur de carte
    function afficherGenerateurCarte() {
        if (!etat.produitSelectionne) return;
        
        elements.imageTelephone.src = etat.produitSelectionne.image;
        elements.texteTelephone.textContent = elements.textePersonnalise.value || etat.produitSelectionne.nomPropre;
        
        etat.optionsSelectionnees = [];
        elements.boutonsOption.forEach(btn => btn.classList.remove('actif'));
        
        elements.sectionGenerateur.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Met à jour la prévisualisation
    function mettreAJourPrevisualisation() {
        if (!etat.produitSelectionne) return;
        
        elements.imageTelephone.src = etat.produitSelectionne.image;
        elements.texteTelephone.textContent = elements.textePersonnalise.value || etat.produitSelectionne.nomPropre;
        elements.texteTelephone.style.fontSize = `${elements.tailleTexte.value}px`;
        
        elements.conteneurImageTelephone.style.width = `${elements.tailleImage.value}px`;
        elements.conteneurImageTelephone.style.height = `${elements.tailleImage.value}px`;
        elements.conteneurImageTelephone.style.left = `${elements.positionX.value}px`;
        elements.conteneurImageTelephone.style.top = `${elements.positionY.value}px`;
        
        elements.texteTelephone.style.top = `${elements.positionYTexte.value}px`;
    }
    
    // Imprime la carte
    async function imprimerCarte() {
        if (!etat.produitSelectionne) {
            afficherEtatExport("Veuillez sélectionner un produit", 'erreur');
            return;
        }
        
        try {
            elements.boutonImprimer.disabled = true;
            afficherEtatExport("Préparation de l'impression...");
            
            elements.templateImpression.innerHTML = '';
            
            const conteneurImpression = document.createElement('div');
            conteneurImpression.className = 'conteneur-impression';
            
            for (let i = 0; i < 2; i++) {
                const divCarte = document.createElement('div');
                divCarte.className = 'carte-impression';
                
                const imgCarte = document.createElement('img');
                imgCarte.src = etat.imagesModeles[etat.modeleActuel].src;
                
                const conteneurImgTel = document.createElement('div');
                conteneurImgTel.className = 'conteneur-image-telephone-impression';
                conteneurImgTel.style.width = `${elements.tailleImage.value}px`;
                conteneurImgTel.style.height = `${elements.tailleImage.value}px`;
                conteneurImgTel.style.left = `${elements.positionX.value}px`;
                conteneurImgTel.style.top = `${elements.positionY.value}px`;
                
                const imgTel = document.createElement('img');
                imgTel.className = 'image-telephone-impression';
                imgTel.src = elements.imageTelephone.src;
                imgTel.onerror = function() {
                    this.src = 'https://via.placeholder.com/200x200?text=Image+non+disponible';
                };
                
                const texteTel = document.createElement('div');
                texteTel.className = 'texte-telephone-impression';
                texteTel.textContent = elements.textePersonnalise.value || etat.produitSelectionne.nomPropre;
                texteTel.style.fontSize = `${elements.tailleTexte.value}px`;
                texteTel.style.top = `${elements.positionYTexte.value}px`;
                
                etat.optionsSelectionnees.forEach(option => {
                    if (etat.imagesOptions[option]) {
                        const imgSuperposition = document.createElement('img');
                        imgSuperposition.className = 'image-superposition-impression';
                        imgSuperposition.src = etat.imagesOptions[option].src;
                        divCarte.appendChild(imgSuperposition);
                    }
                });
                
                conteneurImgTel.appendChild(imgTel);
                divCarte.appendChild(imgCarte);
                divCarte.appendChild(conteneurImgTel);
                divCarte.appendChild(texteTel);
                
                conteneurImpression.appendChild(divCarte);
            }
            
            elements.templateImpression.appendChild(conteneurImpression);
            
            await new Promise(resoudre => setTimeout(resoudre, 500));
            
            const fenetreImpression = window.open('', '_blank');
            fenetreImpression.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Impression de cartes</title>
                    <style>
                        @page {
                            size: A4 landscape;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            background: white;
                        }
                        .conteneur-impression {
                            width: 100%;
                            height: 100vh;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            gap: 20px;
                            padding: 20px;
                            box-sizing: border-box;
                        }
                        .carte-impression {
                            width: 340px;
                            height: 453px;
                            position: relative;
                        }
                        .carte-impression img {
                            width: 100%;
                            height: 100%;
                            object-fit: contain;
                        }
                        .conteneur-image-telephone-impression {
                            position: absolute;
                            width: ${elements.tailleImage.value}px;
                            height: ${elements.tailleImage.value}px;
                            top: ${elements.positionY.value}px;
                            left: ${elements.positionX.value}px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            border: 1px solid #eee;
                            background: white;
                        }
                        .image-telephone-impression {
                            max-width: 95%;
                            max-height: 95%;
                            object-fit: contain;
                        }
                        .texte-telephone-impression {
                            position: absolute;
                            top: ${elements.positionYTexte.value}px;
                            width: 100%;
                            text-align: center;
                            font-weight: 600;
                            padding: 0 20px;
                            box-sizing: border-box;
                            font-family: 'Inter', sans-serif;
                            color: #333;
                            font-size: ${elements.tailleTexte.value}px;
                        }
                        .image-superposition-impression {
                            position: absolute;
                            width: 100%;
                            height: 100%;
                            top: 0;
                            left: 0;
                            object-fit: contain;
                        }
                    </style>
                </head>
                <body>
                    ${conteneurImpression.outerHTML}
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                setTimeout(function() {
                                    window.close();
                                }, 100);
                            }, 200);
                        };
                    <\/script>
                </body>
                </html>
            `);
            fenetreImpression.document.close();
            
            afficherEtatExport("Impression lancée", 'succes');
            
        } catch (erreur) {
            console.error("Erreur lors de l'impression:", erreur);
            afficherEtatExport("Erreur lors de l'impression", 'erreur');
        } finally {
            elements.boutonImprimer.disabled = false;
        }
    }
    
    // Récupère la valeur d'un attribut produit
    function obtenirValeurAttribut(attributs, nom) {
        if (!attributs) return null;
        const attr = attributs.find(a => a.attributeName === nom);
        return attr ? attr.vals[0].value : null;
    }

    // Affiche l'état de chargement
    function afficherChargement() {
        elements.resultatsProduits.innerHTML = `
            <div class="chargement">
                <div class="indicateur-chargement"></div>
                <div>Recherche en cours...</div>
            </div>
        `;
    }
    
    // Affiche un message d'état
    function afficherMessageEtat(message, type) {
        elements.messageEtat.textContent = message;
        elements.messageEtat.className = `message-etat ${type || ''}`;
        elements.messageEtat.style.display = 'block';
        
        if (type) {
            setTimeout(() => {
                elements.messageEtat.style.display = 'none';
            }, 5000);
        }
    }
    
    // Affiche un message d'état pour l'export
    function afficherEtatExport(message, type) {
        elements.etatExport.textContent = message;
        elements.etatExport.className = `message-etat ${type || ''}`;
        elements.etatExport.style.display = 'block';
        
        if (type) {
            setTimeout(() => {
                elements.etatExport.style.display = 'none';
            }, 5000);
        }
    }

    // Initialisation de l'application
    initialiser();
});