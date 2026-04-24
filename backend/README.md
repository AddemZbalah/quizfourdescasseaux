# API Quiz Four des Casseaux

## Configuration

### 1. Configurer le .env
Edit `.env` et remplissez les informations:
```
DB_HOST=localhost
DB_USER=u894554401_Admin
DB_PASSWORD=ton_mot_de_passe
DB_NAME=u894554401_quizcasseaux
```

### 2. Upload sur Hostinger
- Upload le dossier `/backend` sur ton serveur Hostinger
- Exemple: `espaceporcelaine.com/backend/`

---

## Routes API

### 1. **Récupérer TOUTES les questions**
```
GET /backend/api/questions
```
Réponse:
```json
{
  "questions": [
    {
      "id": 1,
      "intitule": "Quelle est la capitale de la France ?",
      "indice": "ça commence par un P",
      "type": "qcm"
    }
  ]
}
```

### 2. **Récupérer UNE question avec ses réponses**
```
GET /backend/api/questions/{id}
```
Exemple: `GET /backend/api/questions/1`

Réponse:
```json
{
  "question": {
    "id": 1,
    "intitule": "Quelle est la capitale de la France ?",
    "indice": "ça commence par un P",
    "type": "qcm"
  },
  "reponses": [
    {
      "id": 1,
      "question_id": 1,
      "intitule": "Paris",
      "type": "qcm",
      "is_correct": true
    },
    {
      "id": 2,
      "question_id": 1,
      "intitule": "Lyon",
      "type": "qcm",
      "is_correct": false
    }
  ]
}
```

### 3. **Récupérer les réponses possibles d'une question**
```
GET /backend/api/questions/{id}/reponses
```
Exemple: `GET /backend/api/questions/1/reponses`

Réponse:
```json
{
  "reponses": [
    {
      "id": 1,
      "question_id": 1,
      "intitule": "Paris",
      "type": "qcm",
      "is_correct": true
    }
  ]
}
```

---

## Structure du Projet

```
backend/
├── config/
│   └── Database.php          # Connexion à la BDD
├── models/
│   ├── Question.php          # Entité Question
│   └── Reponse.php           # Entité Réponse
├── repositories/
│   ├── QuestionRepository.php # CRUD Questions
│   └── ReponseRepository.php  # CRUD Réponses
├── controllers/
│   └── QuestionController.php # Logique des routes
├── index.php                  # Point d'entrée (Routeur)
├── .env                       # Configuration (variables sensibles)
├── .htaccess                  # Redirection Apache
└── README.md                  # Ce fichier
```

---

## Tests depuis le Frontend

Depuis ton frontend Vite, tu peux fetch les données comme ça:

```javascript
// Récupérer une question
fetch('https://espaceporcelaine.com/backend/api/questions/1')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));

// Récupérer toutes les questions
fetch('https://espaceporcelaine.com/backend/api/questions')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

---

## Points importants

✅ CORS activé - tu peux appeler depuis n'importe quel domaine  
✅ Sécurité SQL - Requêtes préparées avec PDO  
✅ Code structuré - Models, Repositories, Controllers  
✅ Simple et efficace - Juste le nécessaire  

---

## Troubleshooting

**Erreur 404?**
- Vérifie que le `.htaccess` est uploadé
- Vérifie que `mod_rewrite` est activé sur Hostinger

**Erreur de connexion BDD?**
- Vérifie les identifiants dans `.env`
- Le host est peut-être pas `localhost` - cherche dans phpMyAdmin Hostinger

**CORS errors?**
- C'est normal en développement local, les headers CORS sont activés par défaut
