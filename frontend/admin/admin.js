// Configuration de l'URL du Backend API
const API_BASE_URL = 'http://localhost/quiz-four_des_casseaux/backend/api';
// (Ajuster localhost si ton backend est sur un port / nom de domaine différent)

document.addEventListener('DOMContentLoaded', () => {

  // Éléments du DOM
  const questionForm = document.getElementById('questionForm');
  const answersContainer = document.getElementById('answersContainer');
  const addAnswerBtn = document.getElementById('addAnswerBtn');
  const messageBox = document.getElementById('messageBox');

  // Gérer l'ajout d'une nouvelle ligne de réponse
  let answerIndex = 0; // Compteur unique pour chaque réponse afin d'éviter les collisions dans le DOM

  function addAnswerRow() {
    const row = document.createElement('div');
    row.className = 'answer-row';
    row.id = `answer-${answerIndex}`;

    row.innerHTML = `
            <input type="text" class="answer-input" placeholder="Intitulé de la réponse" required>
            
            <label>
                <input type="checkbox" class="answer-correct">
                Correct ?
            </label>
            
            <button type="button" class="btn-remove" onclick="removeAnswerRow(${answerIndex})" title="Supprimer">✕</button>
        `;

    answersContainer.appendChild(row);
    answerIndex++;
  }

  // Supprimer une réponse (rendu global pour le onclick)
  window.removeAnswerRow = function (id) {
    const row = document.getElementById(`answer-${id}`);
    if (row) {
      row.remove();
    }
  }

  // Ajouter une première réponse vide par défaut au chargement
  addAnswerRow();

  // Écouteur pour le bouton "Ajouter une réponse"
  addAnswerBtn.addEventListener('click', addAnswerRow);

  // Gérer la soumission du formulaire
  questionForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // On empêche le rechargement de la page
    hideMessage();

    // 1. Récupérer les données de la question
    const intitule = document.getElementById('intitule').value;
    const indice = document.getElementById('indice').value;
    const type = document.getElementById('type').value;

    // 2. Parcourir et récupérer les réponses dynamiques
    const reponses = [];
    const answerRows = document.querySelectorAll('.answer-row');

    answerRows.forEach(row => {
      const inputVal = row.querySelector('.answer-input').value;
      const isCorrect = row.querySelector('.answer-correct').checked;

      if (inputVal.trim() !== '') {
        reponses.push({
          intitule: inputVal.trim(),
          is_correct: isCorrect,
          type: type // Le backend peut aussi prendre ce type
        });
      }
    });

    // Validation basique (au moins une réponse avec du texte)
    if (reponses.length === 0 && type !== 'texte') {
      showMessage("Veuillez ajouter au moins une réponse valide.", 'error');
      return;
    }

    // 3. Préparer le Payload JSON
    const payload = {
      intitule: intitule,
      indice: indice,
      type: type,
      reponses: reponses
    };

    // 4. Envoyer avec fetch()
    try {
      // Afficher le bouton en mode chargement
      const submitBtn = document.getElementById('submitBtn');
      const originalBtnText = submitBtn.innerText;
      submitBtn.innerText = 'Création en cours...';
      submitBtn.disabled = true;

      const response = await fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(`Succès ! La question a été créée (ID: ${data.question_id}).`, 'success');

        // Réinitialiser le formulaire
        questionForm.reset();
        answersContainer.innerHTML = '';
        addAnswerRow(); // Remet un champ vide
      } else {
        showMessage(data.error || 'Erreur lors de la création de la question.', 'error');
      }

      // Restaurer le bouton
      submitBtn.innerText = originalBtnText;
      submitBtn.disabled = false;

    } catch (error) {
      console.error(error);
      showMessage('Impossible de joindre le serveur Backend.', 'error');

      document.getElementById('submitBtn').innerText = 'Enregistrer la question';
      document.getElementById('submitBtn').disabled = false;
    }
  });

  // Fonctions utilitaires d'affichage de messages
  function showMessage(message, type = 'error') {
    messageBox.innerText = message;
    messageBox.className = `message ${type}`;
  }

  function hideMessage() {
    messageBox.innerText = '';
    messageBox.className = 'message hidden';
  }
});