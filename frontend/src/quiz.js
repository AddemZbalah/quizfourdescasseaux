/**
 * Gestionnaire du Quiz - Relie le Frontend et le Backend
 */

const API_BASE_URL = 'https://espaceporcelaine.com/Quiz/backend/api';
let currentQuestionIndex = 0;
let allQuestions = [];
let totalQuestions = 0;

/**
 * Récupérer toutes les questions depuis l'API
 */
export async function loadQuestions() {
  try {
    const response = await fetch(`${API_BASE_URL}/questions`);
    const data = await response.json();
    allQuestions = data.questions;
    totalQuestions = allQuestions.length;
    console.log(`✅ ${totalQuestions} questions chargées`);
    return allQuestions;
  } catch (error) {
    console.error('❌ Erreur lors du chargement des questions:', error);
    return [];
  }
}

/**
 * Récupérer une question avec ses réponses depuis l'API
 */
export async function getQuestionWithAnswers(questionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/${questionId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Erreur lors du chargement de la question:', error);
    return null;
  }
}

/**
 * Afficher une question
 */
export async function displayQuestion(questionId) {
  const data = await getQuestionWithAnswers(questionId);

  if (!data) {
    console.error('Question not found');
    return;
  }

  const question = data.question;
  const reponses = data.reponses;

  // Mettre à jour le titre et la progression
  const questionTitle = document.getElementById('question-title');
  const progressIndicator = document.getElementById('progress-indicator');

  if (questionTitle) {
    questionTitle.textContent = question.intitule;
  }

  if (progressIndicator) {
    progressIndicator.textContent = `Question ${currentQuestionIndex + 1} / ${totalQuestions}`;
  }

  // Afficher la bonne template selon le type de question
  if (question.type === 'qcm') {
    displayQCM(reponses);
  } else if (question.type === 'texte') {
    displayTextQuestion(question);
  } else if (question.type === 'images') {
    displayImageQuestion(reponses);
  }
}

/**
 * Afficher les options QCM
 */
function displayQCM(reponses) {
  const container = document.getElementById('qcm-options-container');

  if (!container) return;

  // Vider le container
  container.innerHTML = '';

  // Créer les boutons pour chaque réponse
  reponses.forEach((reponse) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'qcm-option';
    button.textContent = reponse.intitule;
    button.dataset.repId = reponse.id;
    button.dataset.isCorrect = reponse.is_correct ? 'true' : 'false';

    // Ajouter les styles básicos
    button.style.cssText = `
      display: block;
      width: 100%;
      padding: 12px;
      margin: 8px 0;
      background-color: #f5f1ee;
      border: 2px solid #864b1e;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
    `;

    // Ajouter des événements
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#e8dfd5';
    });

    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = '#f5f1ee';
    });

    button.addEventListener('click', () => {
      handleQCMAnswer(button, reponses);
    });

    container.appendChild(button);
  });
}

/**
 * Gérer la réponse QCM
 */
function handleQCMAnswer(button, allOptions) {
  // Désactiver tous les boutons
  const allButtons = document.querySelectorAll('.qcm-option');
  allButtons.forEach(btn => btn.disabled = true);

  // Ajouter couleur selon si correct ou pas
  if (button.dataset.isCorrect === 'true') {
    button.style.backgroundColor = '#4caf50'; // Vert
    button.style.color = 'white';
  } else {
    button.style.backgroundColor = '#f44336'; // Rouge
    button.style.color = 'white';
  }

  // Afficher la bonne réponse
  allButtons.forEach(btn => {
    if (btn.dataset.isCorrect === 'true') {
      btn.style.backgroundColor = '#4caf50';
      btn.style.color = 'white';
    }
  });

  console.log(`Réponse sélectionnée: ${button.textContent}, Correct: ${button.dataset.isCorrect}`);
}

/**
 * Afficher une question texte
 */
function displayTextQuestion(question) {
  const textarea = document.getElementById('text-answer-input');

  if (textarea) {
    textarea.placeholder = 'Écrivez votre réponse ici...';
    textarea.value = '';
  }
}

/**
 * Afficher une question images
 */
function displayImageQuestion(reponses) {
  const container = document.getElementById('qcm-options-container');

  if (!container) return;

  container.innerHTML = '';

  reponses.forEach((reponse) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'image-option';
    button.textContent = `Image: ${reponse.intitule}`;
    button.dataset.repId = reponse.id;
    button.dataset.isCorrect = reponse.is_correct ? 'true' : 'false';

    button.style.cssText = `
      display: block;
      width: 100%;
      padding: 12px;
      margin: 8px 0;
      background-color: #f5f1ee;
      border: 2px solid #864b1e;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s ease;
    `;

    button.addEventListener('click', () => {
      handleQCMAnswer(button, reponses);
    });

    container.appendChild(button);
  });
}

/**
 * Passer à la question suivante
 */
export function nextQuestion() {
  if (currentQuestionIndex < totalQuestions - 1) {
    currentQuestionIndex++;
    const nextQuestionId = allQuestions[currentQuestionIndex].id;
    displayQuestion(nextQuestionId);
  } else {
    console.log('✅ Quiz terminé!');
    alert('Quiz terminé! Merci pour votre participation.');
  }
}

/**
 * Revenir à la question précédente
 */
export function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    const prevQuestionId = allQuestions[currentQuestionIndex].id;
    displayQuestion(prevQuestionId);
  }
}

/**
 * Obtenir la question actuelle
 */
export function getCurrentQuestion() {
  if (currentQuestionIndex < allQuestions.length) {
    return allQuestions[currentQuestionIndex];
  }
  return null;
}

/**
 * Obtenir l'index de la question actuelle
 */
export function getCurrentQuestionIndex() {
  return currentQuestionIndex;
}

/**
 * Obtenir le nombre total de questions
 */
export function getTotalQuestions() {
  return totalQuestions;
}
