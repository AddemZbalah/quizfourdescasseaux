# Frontend - Backend Integration Guide

## 🚀 Qu'est-ce qui a été done?

### 1. **Fichier `quiz.js`** (Nouveau)
- Gère toute la logique du quiz
- Fetch les questions depuis l'API backend
- Affiche dynamiquement les templates selon le type de question (qcm, texte, images)
- Gère les événements (clic sur les réponses, boutons suivant/précédent)
- Affiche les réponses correctes/incorrectes avec des couleurs

### 2. **Fichier `main.js`** (Modifié)
- Importé `quiz.js` 
- Au chargement: charge toutes les questions du backend
- Gère les clics sur "Valider" et "Retour"
- Appelle `nextQuestion()` et `previousQuestion()`

### 3. **Templates HTML** (Non modifiés - ils restent comme avant)
- `qcm-template.html` - Pour les questions QCM
- `text-template.html` - Pour les questions texte

---

## 📋 Comment ça marche?

### Flux du Quiz:

```
1. Chargement de la page
   ↓
2. loadQuestions() fetch TOUTES les questions
   ↓
3. displayQuestion(1) affiche la première question
   ↓
4. Le type de question est vérifié
   ├─ Si QCM → displayQCM() affiche les boutons
   ├─ Si Texte → displayTextQuestion() affiche la textarea
   └─ Si Images → displayImageQuestion() affiche les images
   ↓
5. Utilisateur clique sur une réponse
   ├─ La bonne réponse devient verte
   └─ Les mauvaises deviennent rouges
   ↓
6. Utilisateur clique "Valider"
   └─ nextQuestion() passe à la question suivante
```

---

## 🌐 URLs de l'API utilisées

```javascript
API_BASE_URL = 'https://espaceporcelaine.com/Quiz/backend/api'

GET /api/questions                    // Récupère toutes les questions
GET /api/questions/{id}               // Récupère une question avec ses réponses
GET /api/questions/{id}/reponses      // Récupère juste les réponses
```

---

## ✅ Étapes pour que ça marche:

### **1. En LOCAL (pour tester avant de uploader)**
- Si tu veux tester en local avec Vite (`npm run dev`), tu dois aussi lancer le backend en local
- Ou tu utilises l'API sur Hostinger directement (ça marche!)

### **2. Sur HOSTINGER (PRODUCTION)**
Tu dois uploader le dossier `/frontend` dans `/public_html/Quiz/` sur Hostinger

Résultat attendu:
```
/public_html/
├── Quiz/
│   ├── index.html
│   ├── src/
│   │   ├── main.js        ← Modifié pour utiliser quiz.js
│   │   ├── quiz.js        ← NOUVEAU
│   │   ├── style.css
│   │   └── quiz-templates/
│   │       ├── qcm-template.html
│   │       └── text-template.html
│   └── backend/           ← Déjà uploadé
```

---

## 🎯 Ce que le code fait AUTOMATIQUEMENT:

✅ Fetch les questions au chargement  
✅ Affiche le bon type de template  
✅ Affiche/cache les bonnes/mauvaises réponses  
✅ Navigue entre les questions  
✅ Affiche la progression (Question X / Y)  
✅ Gère les clics sur les options  
✅ Affiche les résultats (vert = correct, rouge = incorrect)  

---

## 🔧 Fichiers modifiés:

| Fichier | Action |
|---------|--------|
| `src/quiz.js` | ✅ CRÉÉ |
| `src/main.js` | ✅ MODIFIÉ |
| `src/quiz-templates/qcm-template.html` | ❌ Pas changé |
| `src/quiz-templates/text-template.html` | ❌ Pas changé |
| `vite.config.ts` | ❌ Pas changé |

---

## 📤 Prochaine étape:

**Upload le DOSSIER FRONTEND complet** sur Hostinger:
- À: `/public_html/Quiz/`
- Assure-toi que `quiz.js` et `main.js` sont bien là

Une fois uploadé, teste l'URL:
```
https://espaceporcelaine.com/Quiz/
```

Le quiz devrait fonctionner en parfait harmonie avec le backend! 🚀
