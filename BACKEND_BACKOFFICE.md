# Four des Casseaux - Spécifications Backend & Backoffice

Ce document sert de feuille de route pour le développement du Backend (API) et du Backoffice (Administration) de l'application de questionnaire "Four des Casseaux".

## 1. Architecture Générale
L'application est séparée en deux parties :
- **Frontend** : Code source dans le dossier `/frontend` (Vite, HTML/CSS/JS, Tailwind V4). Le frontend gère l'affichage et consomme l'API.
- **Backend** : API REST (langage au choix : Node.js, PHP, Python, etc.) qui gère la logique métier, la base de données, et fournit l'interface d'administration (Backoffice).

---

## 2. Base de Données (Rappel)
Le script SQL complet est disponible dans `schema.sql`.
- `questionnaire` : Les différents sondages/visites.
- `question` : Les questions liées à un questionnaire (`type` = 'qcm' ou 'text').
- `reponse_possible` : Les choix disponibles (uniquement pour les questions de type 'qcm').
- `reponse_utilisateur` : Les participations des visiteurs (avec soit un ID de réponse choisie, soit du texte libre).

---

## 3. L'API REST à créer (Côté Client)
Pour relier le Frontend actuel à la base de données, le backend devra exposer ces routes :

### `GET /api/questionnaires/{id}/questions/{ordre}`
- **Rôle** : Récupérer une question spécifique pour l'afficher à l'utilisateur.
- **Retour attendu (JSON)** :
```json
{
  "current_question_number": 3,
  "total_questions": 7,
  "question_title": "Qu'avez-vous préféré ?",
  "type": "qcm",
  "choix": [
    { "id": 1, "texte": "Le majestueux Four à porcelaine" },
    { "id": 2, "texte": "L'histoire ouvrière du site" }
  ]
}
```

### `POST /api/reponses`
- **Rôle** : Sauvegarder la réponse de l'utilisateur quand il clique sur "Valider".
- **Payload attendu (JSON)** :
```json
{
  "question_id": 3,
  "visiteur_id": "session_12345",
  "reponse_choisie_id": 1, 
  "texte_libre": null 
}
```

---

## 4. Le Backoffice (Administration)
Pour que les administrateurs du "Four des Casseaux" puissent gérer les formulaires sans toucher au code ou à la base de données, il faudra créer une interface web sécurisée.

### Fonctionnalités requises :
1. **Authentification**
   - Page de connexion (identifiant / mot de passe).
   - Sécurisation des routes (vérification de session/token JWT pour l'accès aux pages admin).

2. **Gestion des Questionnaires (CRUD)**
   - Lister les questionnaires existants.
   - Créer, modifier, désactiver ou supprimer un questionnaire.

3. **Gestion des Questions**
   - Ajouter des questions à un questionnaire.
   - Choisir le type (`qcm` ou `text`).
   - Gérer l'ordre d'affichage des questions (glisser-déposer ou numéros).
   - Pour les QCM : Ajouter / Modifier / Supprimer les choix possibles (`reponse_possible`).

4. **Analyse des Résultats**
   - Consulter la liste des réponses utilisateurs pour un questionnaire donné.
   - (Bonus) Statistiques : Pourcentage de réponses pour chaque choix de QCM.
   - (Bonus) Export CSV/Excel des réponses en texte libre pour analyse.

---

## 5. Points d'attention techniques
- **CORS (Cross-Origin Resource Sharing)** : Le backend devra autoriser les requêtes provenant du frontend (ex: `http://localhost:5173` en développement).
- **Sécurité** : 
  - Protéger l'API contre les injections SQL (utiliser des requêtes préparées ou un ORM).
  - Sécuriser le Backoffice contre les failles XSS et CSRF.
  - S'assurer qu'un utilisateur ne puisse pas tricher (ex: envoyer une réponse QCM pour une question de type Texte).

---

## 6. Architecture du Code Backend (Pattern Controller-Repository-Entity)
Pour un code propre, structuré, et facilement maintenable, il est fortement recommandé d'organiser son code selon le modèle en couches suivant (standard sur Symfony, Spring Boot, NestJS, etc.) :

### 1. Les Entités (Entities)
Ce sont les représentations exactes en code ('objets') des tables SQL.
- Exemple d'entités à créer : `Questionnaire`, `Question`, `ReponsePossible` et `ReponseUtilisateur`.
- Rôle : Contenir les propriétés de la base de données (id, titre, type) et définir les relations (ex: "Une question a plusieurs réponses possibles").

### 2. Les Repositories
Couche qui gère unilatéralement la Base de Données.
- Au lieu de mettre des requêtes SQL partout dans le code, chaque entité possède son *Repository* (ex: `QuestionRepository`).
- Rôle : Effectuer des actions comme `findById(id)` ou `save(reponse)`, c'est la seule place autorisée pour écrire la syntaxe de base de données.

### 3. Les Controllers
La ligne de front Web de ton API.
- C'est le chef d'orchestre : il définit les routes d'API, par exemple le contrôleur attrape `GET /api/questions/3`.
- Rôle : Recevoir ce que t'envoie le Frontend (JavaScript Fetch), transmettre la demande aux *Repositories* pour avoir la bonne entité, la formatter en JSON pur, et la renvoyer au Frontend.

*Note (Les Services)* : Pour de la logique plus complexe (calcul de statistiques, envoi d'emails, vérification si un utilisateur a déjà répondu), il est conseillé de créer une 4ème couche intermédiaire (la couche de **Service**), placée entre le Controller et le Repository.
