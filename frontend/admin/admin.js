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

  const helpBtn = document.getElementById('helpBtn');
  const closeHelpBtn = document.getElementById('closeHelpBtn');
  const helpSidebar = document.getElementById('helpSidebar');
  const helpOverlay = document.getElementById('helpOverlay');

  function openHelpSidebar() {
    if (!helpSidebar || !helpOverlay) return;
    helpSidebar.classList.add('is-open');
    helpOverlay.classList.add('is-open');
    helpSidebar.setAttribute('aria-hidden', 'false');
    helpOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeHelpSidebar() {
    if (!helpSidebar || !helpOverlay) return;
    helpSidebar.classList.remove('is-open');
    helpOverlay.classList.remove('is-open');
    helpSidebar.setAttribute('aria-hidden', 'true');
    helpOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (helpBtn) {
    helpBtn.addEventListener('click', openHelpSidebar);
  }

  if (closeHelpBtn) {
    closeHelpBtn.addEventListener('click', closeHelpSidebar);
  }

  if (helpOverlay) {
    helpOverlay.addEventListener('click', closeHelpSidebar);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && helpSidebar && helpSidebar.classList.contains('is-open')) {
      closeHelpSidebar();
    }
  });

  // Éléments du DOM
  const questionForm = document.getElementById('questionForm');
  const answersContainer = document.getElementById('answersContainer');
  const addAnswerBtn = document.getElementById('addAnswerBtn');
  const messageBox = document.getElementById('messageBox');

  // Gérer l'ajout d'une nouvelle ligne de réponse
  let answerIndex = 0; // Compteur unique pour chaque réponse afin d'éviter les collisions dans le DOM
  const answerRowTemplate = document.getElementById('answerRowTemplate');

  function addAnswerRow() {
    if (!(answerRowTemplate instanceof HTMLTemplateElement)) {
      console.error('Template answerRowTemplate non trouvé');
      return;
    }

    const fragment = /** @type {DocumentFragment} */ (answerRowTemplate.content.cloneNode(true));
    const row = fragment.querySelector('.answer-row');

    if (!row) {
      console.error('Impossible de cloner le template de réponse');
      return;
    }

    row.id = `answer-${answerIndex}`;

    // Adapt to current type
    const currentType = document.getElementById('type').value;
    const input = row.querySelector('.answer-input');
    if (currentType === 'images') {
      input.type = 'file';
      input.accept = 'image/*';
    }

    const removeBtn = row.querySelector('.answer-remove-btn');
    const currentAnswerIndex = answerIndex;

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        row.remove();
      });
    }

    answersContainer.appendChild(row);
    answerIndex++;
  }

  // Ajouter une première réponse vide par défaut au chargement
  addAnswerRow();

  // Écouteur pour le bouton "Ajouter une réponse"
  addAnswerBtn.addEventListener('click', addAnswerRow);

  // Ecouteur pour changer le type d'input selon le type de question
  document.getElementById('type').addEventListener('change', (e) => {
    const isImages = e.target.value === 'images';
    document.querySelectorAll('.answer-input').forEach(input => {
      if (isImages) {
        input.type = 'file';
        input.accept = 'image/*';
      } else {
        input.type = 'text';
        input.removeAttribute('accept');
      }
    });
  });

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
    const answerRows = Array.from(document.querySelectorAll('.answer-row'));

    // Si c'est le type image, on upload d'abord les fichiers
    const submitBtn = document.getElementById('submitBtn');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'Traitement en cours...';
    submitBtn.disabled = true;

    try {
      for (const row of answerRows) {
        const input = row.querySelector('.answer-input');
        const isCorrect = row.querySelector('.answer-correct').checked;

        if (type === 'images') {
          if (input.files.length > 0) {
            const formData = new FormData();
            formData.append('image', input.files[0]);

            const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
              method: 'POST',
              credentials: 'include',
              body: formData
            });
            const uploadData = await uploadRes.json();

            if (uploadRes.ok) {
              reponses.push({
                intitule: uploadData.filename, // Sauvegarde uniquement le nom
                is_correct: isCorrect,
                type: type
              });
            } else {
              throw new Error(uploadData.error || 'Erreur lors du transfert d\'image');
            }
          }
        } else {
          const inputVal = input.value;
          if (inputVal.trim() !== '') {
            reponses.push({
              intitule: inputVal.trim(),
              is_correct: isCorrect,
              type: type
            });
          }
        }
      }

      // Validation basique (au moins une réponse avec du contenu)
      if (reponses.length === 0 && type !== 'texte') {
        showMessage("Veuillez ajouter au moins une réponse valide.", 'error');
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
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
        // Check if loadAdminQuestions exists before calling it
        if (typeof loadAdminQuestions === 'function') {
          loadAdminQuestions(); // Recharger la liste en bas
        }
      } else {
        showMessage(data.error || 'Erreur lors de la création de la question.', 'error');
      }

    } catch (error) {
      console.error(error);
      showMessage(error.message || 'Impossible de joindre le serveur Backend.', 'error');
    }

    // Restaurer le bouton
    submitBtn.innerText = originalBtnText;
    submitBtn.disabled = false;
  });

  // ========== GESTION DE L'AFFICHAGE DES QUESTIONS ==========

  const questionsListContainer = document.getElementById('questionsList');
  const questionItemTemplate = document.getElementById('questionItemTemplate');

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

    questions.forEach((q) => {
      const qElement = createQuestionElement(q, questions.length);
      questionsListContainer.appendChild(qElement);
    });
  }

  function buildAnswersHtml(question) {
    let filteredReponses = question.reponses || [];

    // Si la question est de type 'texte', on n'affiche que les réponses dont is_correct = true
    if (question.type === 'texte') {
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
    return answersHtml;
  }

  function createQuestionElement(q, totalQuestions) {
    if (!(questionItemTemplate instanceof HTMLTemplateElement)) {
      const fallback = document.createElement('div');
      fallback.className = 'question-item';
      fallback.innerHTML = '<p>Template de question introuvable.</p>';
      return fallback;
    }

    const fragment = /** @type {DocumentFragment} */ (questionItemTemplate.content.cloneNode(true));
    const root = fragment.querySelector('.question-item');

    if (!root) {
      const fallback = document.createElement('div');
      fallback.className = 'question-item';
      fallback.innerHTML = '<p>Erreur de rendu du template.</p>';
      return fallback;
    }

    const canMoveUp = q.ordre > 1;
    const canMoveDown = q.ordre < totalQuestions;

    const titleEl = root.querySelector('.question-title');
    const metaEl = root.querySelector('.question-meta');
    const hintEl = root.querySelector('.question-hint');
    const answersSlot = root.querySelector('.question-answers-slot');

    if (titleEl) {
      titleEl.textContent = `Question ${q.ordre} - ${q.intitule}`;
    }

    if (metaEl) {
      metaEl.textContent = `Type : ${q.type} | ID : ${q.id}`;
    }

    if (hintEl) {
      hintEl.textContent = `Indice : ${q.indice && q.indice.trim() !== '' ? q.indice : 'Aucun'}`;
    }

    if (answersSlot) {
      answersSlot.innerHTML = buildAnswersHtml(q);
    }

    const editHintBtn = /** @type {HTMLButtonElement | null} */ (root.querySelector('.btn-edit-hint'));
    const deleteHintBtn = /** @type {HTMLButtonElement | null} */ (root.querySelector('.btn-delete-hint'));
    const moveUpBtn = /** @type {HTMLButtonElement | null} */ (root.querySelector('.btn-move-up'));
    const moveDownBtn = /** @type {HTMLButtonElement | null} */ (root.querySelector('.btn-move-down'));
    const deleteQuestionBtn = /** @type {HTMLButtonElement | null} */ (root.querySelector('.btn-delete-question'));
    const toggleAnswerBtn = /** @type {HTMLButtonElement | null} */ (root.querySelector('.btn-toggle-answer'));
    const formContainer = /** @type {HTMLDivElement | null} */ (root.querySelector('.add-answer-form'));
    const quickAnswerInput = /** @type {HTMLInputElement | null} */ (root.querySelector('.input-quick-answer'));
    const quickAnswerCorrect = /** @type {HTMLInputElement | null} */ (root.querySelector('.input-quick-correct'));
    const saveQuickAnswerBtn = /** @type {HTMLButtonElement | null} */ (root.querySelector('.btn-save-answer'));

    if (editHintBtn) {
      editHintBtn.setAttribute('onclick', `editQuestionIndice(${q.id})`);
    }

    if (deleteHintBtn) {
      deleteHintBtn.setAttribute('onclick', `deleteQuestionIndice(${q.id})`);
    }

    if (moveUpBtn) {
      moveUpBtn.disabled = !canMoveUp;
      moveUpBtn.setAttribute('onclick', `moveQuestion(${q.id}, ${q.ordre - 1})`);
    }

    if (moveDownBtn) {
      moveDownBtn.disabled = !canMoveDown;
      moveDownBtn.setAttribute('onclick', `moveQuestion(${q.id}, ${q.ordre + 1})`);
    }

    if (deleteQuestionBtn) {
      deleteQuestionBtn.setAttribute('onclick', `deleteQuestion(${q.id})`);
    }

    if (toggleAnswerBtn && formContainer) {
      toggleAnswerBtn.addEventListener('click', () => {
        formContainer.style.display = formContainer.style.display === 'none' ? 'flex' : 'none';
      });
    }

    if (saveQuickAnswerBtn && quickAnswerInput && quickAnswerCorrect) {
      saveQuickAnswerBtn.addEventListener('click', async () => {
        const inputIntitule = quickAnswerInput.value;
        const inputCorrect = quickAnswerCorrect.checked;

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
              ordre: q.ordre,
              intitule: inputIntitule,
              is_correct: inputCorrect
            })
          });

          if (response.ok) {
            showMessage('Nouvelle réponse ajoutée avec succès.', 'success');
            loadAdminQuestions();
          } else {
            const data = await response.json();
            showMessage(data.error || 'Erreur.', 'error');
          }
        } catch (error) {
          showMessage('Impossible de joindre le serveur.', 'error');
        }
      });
    }

    return root;
  }

  window.moveQuestion = async function (id, newOrdre) {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: id,
          new_ordre: newOrdre
        })
      });

      const data = await response.json();
      if (response.ok) {
        showMessage('Ordre des questions mis à jour.', 'success');
        loadAdminQuestions();
      } else {
        showMessage(data.error || 'Erreur lors du réordonnancement.', 'error');
      }
    } catch (error) {
      showMessage('Impossible de joindre le serveur.', 'error');
    }
  }

  window.editQuestionIndice = async function (id) {
    const newIndice = prompt('Entrez le nouvel indice :');
    if (newIndice === null) {
      return;
    }

    const trimmedIndice = newIndice.trim();
    if (trimmedIndice === '') {
      showMessage('Indice vide. Utilisez le bouton Supprimer l\'indice.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/questions/${id}/indice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ indice: trimmedIndice })
      });

      const data = await response.json();
      if (response.ok) {
        showMessage('Indice mis à jour.', 'success');
        loadAdminQuestions();
      } else {
        showMessage(data.error || 'Erreur lors de la mise à jour de l\'indice.', 'error');
      }
    } catch (error) {
      showMessage('Impossible de joindre le serveur.', 'error');
    }
  }

  window.deleteQuestionIndice = async function (id) {
    if (!confirm('Supprimer l\'indice de cette question ?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/questions/${id}/indice`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (response.ok) {
        showMessage('Indice supprimé.', 'success');
        loadAdminQuestions();
      } else {
        showMessage(data.error || 'Erreur lors de la suppression de l\'indice.', 'error');
      }
    } catch (error) {
      showMessage('Impossible de joindre le serveur.', 'error');
    }
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

  // --- GESTION DES CONFIGURATIONS DE LOADING VIA LOCALSTORAGE ---
  function getLoadingConfig() {
    const savedConfig = localStorage.getItem('quiz_loading_config');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    // Par défaut
    return [
      { id: Date.now(), ordre: 1, text: "La visite commence par l'étage...", active: true },
      { id: Date.now() + 1, ordre: 6, text: "La visite continue au rez-de-chaussée...", active: true },
      { id: Date.now() + 2, ordre: 8, text: "Direction l'exposition temporaire !", active: false }
    ];
  }

  function saveLoadingConfig(config) {
    localStorage.setItem('quiz_loading_config', JSON.stringify(config));
    renderLoadingConfig();
  }

  function renderLoadingConfig() {
    const container = document.getElementById('loadingConfigContainer');
    const template = document.getElementById('loadingConfigTemplate');
    if (!container || !template) return;

    container.innerHTML = '';
    const config = getLoadingConfig();

    if (config.length === 0) {
      container.innerHTML = '<p class="help-text">Aucun écran de transition configuré.</p>';
      return;
    }

    config.forEach(item => {
      const fragment = template.content.cloneNode(true);

      const orderInput = fragment.querySelector('.loading-order-input');
      const textInput = fragment.querySelector('.loading-text-input');
      const activeInput = fragment.querySelector('.loading-active-input');
      const removeBtn = fragment.querySelector('.loading-remove-btn');

      // Hydratation des données
      orderInput.value = item.ordre;
      textInput.value = item.text;
      activeInput.checked = item.active;

      // Événements
      orderInput.addEventListener('change', (e) => {
        item.ordre = parseInt(e.target.value);
        saveLoadingConfig(config);
      });
      textInput.addEventListener('change', (e) => {
        item.text = e.target.value;
        saveLoadingConfig(config);
      });
      activeInput.addEventListener('change', (e) => {
        item.active = e.target.checked;
        saveLoadingConfig(config);
      });
      removeBtn.addEventListener('click', () => {
        const newConfig = config.filter(l => l.id !== item.id);
        saveLoadingConfig(newConfig);
      });

      container.appendChild(fragment);
    });
  }

  const addLoadingBtn = document.getElementById('addLoadingBtn');
  if (addLoadingBtn) {
    addLoadingBtn.addEventListener('click', () => {
      const config = getLoadingConfig();
      config.push({
        id: Date.now(),
        ordre: 1,
        text: "Nouvel écran de transition...",
        active: true
      });
      saveLoadingConfig(config);
    });

    renderLoadingConfig();
  }

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