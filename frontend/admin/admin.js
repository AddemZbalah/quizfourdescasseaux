// L'URL de ton API en production !
// On pointe directement vers le backend sécurisé
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
  ? 'http://localhost/quiz-four_des_casseaux/quizfourdescasseaux/backend/api'
  : 'https://espaceporcelaine.com/Quiz/backend/api';

document.addEventListener('DOMContentLoaded', () => {

  const fetchOptions = { credentials: 'include' };

  // VERIFICATION DE LA SESSION
  async function checkAuth() {
    try {
      const res = await fetch(`${API_BASE_URL}/me`, fetchOptions);
      if (!res.ok) {
        window.location.href = 'login.html';
      }
    } catch (err) {
      console.error('Erreur liaison Backend:', err);
    }
  }
  checkAuth();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetch(`${API_BASE_URL}/logout`, { method: 'POST', credentials: 'include' });
      window.location.href = 'login.html';
    });
  }

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
        }, credentials: 'include', body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(`Succès ! La question a été créée (ID: ${data.question_id}).`, 'success');

        // Réinitialiser le formulaire
        questionForm.reset();
        answersContainer.innerHTML = '';
        addAnswerRow(); // Remet un champ vide
        loadAdminQuestions(); // Recharger la liste en bas
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

  // ========== GESTION DE L'AFFICHAGE DES QUESTIONS ==========

  const questionsListContainer = document.getElementById('questionsList');

  async function loadAdminQuestions() {
    try {
      // { cache: 'no-store' } + paramètre ?t=... force le navigateur et le serveur (Hostinger) à ne pas mettre en cache
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE_URL}/questions-details?t=${timestamp}`, { cache: 'no-store', credentials: 'include' });
      const data = await response.json();

      if (response.ok && data.questions) {
        renderQuestionsList(data.questions);
      } else {
        questionsListContainer.innerHTML = '<p>Erreur lors du chargement des questions.</p>';
      }
    } catch (error) {
      console.error("Erreur HTTP:", error);
      questionsListContainer.innerHTML = '<p>Impossible de joindre le serveur.</p>';
    }
  }

  function renderQuestionsList(questions) {
    if (questions.length === 0) {
      questionsListContainer.innerHTML = '<p>Aucune question pour le moment.</p>';
      return;
    }

    questionsListContainer.innerHTML = '';

    questions.forEach((q, index) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'question-item';

      let filteredReponses = q.reponses || [];
      // Si la question est de type 'texte', on n'affiche que les réponses dont is_correct = true
      if (q.type === 'texte') {
        filteredReponses = filteredReponses.filter(r => r.is_correct);
      }

      let answersHtml = '<ul class="answer-list">';
      if (filteredReponses.length > 0) {
        filteredReponses.forEach(rep => {
          const badge = rep.is_correct ? '<span class="correct-badge">Vrai</span>' : '';
          answersHtml += `
            <li>
              <span>${rep.intitule} ${badge}</span>
              <button class="btn-remove" onclick="deleteAnswer(${rep.id})" title="Supprimer la réponse">✕</button>
            </li>
          `;
        });
      } else {
        answersHtml += '<li><i>Aucune réponse configurée</i></li>';
      }
      answersHtml += '</ul>';

      qDiv.innerHTML = `
        <div class="question-header">
          <div>
            <!-- L'affichage utilise maintenant l'ordre officiel issu de la base de données -->
            <h3 class="question-title">Question ${q.ordre} - ${q.intitule}</h3>
            <span class="help-text">Type : ${q.type} | ID : ${q.id}</span>
          </div>
          <button class="btn-secondary" style="color:var(--danger); border-color:var(--danger);" onclick="deleteQuestion(${q.id})">Supprimer</button>
        </div>
        ${answersHtml}
        <div class="add-quick-answer-container" style="margin-top: 1rem;">
             <button class="btn-secondary" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;" onclick="showAddAnswerForm(${q.ordre}, '${q.type}')">+ Ajouter une réponse</button>
             <div id="add-form-container-${q.ordre}" class="add-answer-form" style="display:none; margin-top: 0.5rem; gap: 0.5rem; flex-wrap: wrap; background: #f9f9f9; padding: 0.5rem; border-radius: 4px;">
                 <input type="text" id="new-answer-text-${q.ordre}" placeholder="Intitulé de la réponse" class="form-input" style="flex:1; min-width:150px;">
                 <label style="display:flex; align-items:center; gap:0.2rem;"><input type="checkbox" id="new-answer-correct-${q.ordre}"> Correct</label>
                 <button class="btn-primary" style="padding: 0.3rem 0.6rem;" onclick="addQuickAnswer(${q.ordre})">Enregistrer</button>
             </div>
        </div>
      `;

      questionsListContainer.appendChild(qDiv);
    });
  }

  // Celles-ci doivent être globales pour les onclick
  window.deleteQuestion = async function (id) {
    if (!confirm('Es-tu sûr de vouloir supprimer cette question (les réponses associées seront également supprimées) ?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/questions/${id}`, { method: 'DELETE', credentials: 'include' });
      if (response.ok) {
        showMessage('Question supprimée avec succès.', 'success');
        loadAdminQuestions(); // Recharger la liste
      } else {
        const data = await response.json();
        showMessage(data.error || 'Erreur lors de la suppression.', 'error');
      }
    } catch (error) {
      showMessage('Impossible de joindre le serveur.', 'error');
    }
  }

  window.deleteAnswer = async function (id) {
    if (!confirm('Es-tu sûr de vouloir supprimer cette réponse ?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/reponses/${id}`, { method: 'DELETE', credentials: 'include' });
      if (response.ok) {
        showMessage('Réponse supprimée avec succès.', 'success');
        loadAdminQuestions(); // Recharger la liste
      } else {
        const data = await response.json();
        showMessage(data.error || 'Erreur lors de la suppression.', 'error');
      }
    } catch (error) {
      showMessage('Impossible de joindre le serveur.', 'error');
    }
  }

  // Permet d'afficher/masquer le petit formulaire d'ajout rapide sous une question
  window.showAddAnswerForm = function (ordre, type) {
    const formContainer = document.getElementById(`add-form-container-${ordre}`);
    formContainer.style.display = formContainer.style.display === 'none' ? 'flex' : 'none';
  }

  // Envoie la requête pour ajouter la nouvelle réponse
  window.addQuickAnswer = async function (ordre) {
    const inputIntitule = document.getElementById(`new-answer-text-${ordre}`).value;
    const inputCorrect = document.getElementById(`new-answer-correct-${ordre}`).checked;

    if (!inputIntitule.trim()) {
      alert('Veuillez entrer un intitulé.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reponses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ordre: ordre,
          intitule: inputIntitule,
          is_correct: inputCorrect
        })
      });

      if (response.ok) {
        showMessage('Nouvelle réponse ajoutée avec succès.', 'success');
        loadAdminQuestions(); // Recharger tout pour voir le changement direct
      } else {
        const data = await response.json();
        showMessage(data.error || 'Erreur.', 'error');
      }
    } catch (error) {
      showMessage('Impossible de joindre le serveur.', 'error');
    }
  }

  // Charger les questions au démarrage de la page
  loadAdminQuestions();

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