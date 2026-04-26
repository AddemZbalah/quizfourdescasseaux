// @ts-nocheck
/**
 * Gestionnaire du Quiz - Relie le Frontend et le Backend
 */

const API_BASE_URL = 'https://espaceporcelaine.com/Quiz/backend/api';
const CHECK_ICON_SRC = '../assets/Check.png';
const ERROR_ICON_SRC = '../assets/Icon.png';
let currentQuestionIndex = 0;
export let allQuestions = [];
let totalQuestions = 0;
let currentQuestionData = null;
let selectedAnswerId = null;
let submitMode = 'validate';

function setSubmitButtonLabel(label, reverse = false) {
  const submitButton = document.querySelector('.btn-submit');
  if (submitButton) {
    const labelElement = submitButton.querySelector('.btn-submit__text');
    if (labelElement) {
      labelElement.textContent = label;
    } else {
      submitButton.textContent = label;
    }

    submitButton.classList.toggle('btn-submit--reverse', reverse);
  }
}

function setFeedbackMessage(type) {
  const card = document.querySelector('.card');
  if (!card) {
    return;
  }

  let feedback = document.getElementById('quiz-feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.id = 'quiz-feedback';
    feedback.className = 'quiz-feedback';
    card.appendChild(feedback);
  }

  feedback.classList.remove('quiz-feedback--success', 'quiz-feedback--error');

  if (type === 'success') {
    feedback.textContent = 'BONNE REPONSE !';
    feedback.classList.add('quiz-feedback--success');
    feedback.hidden = false;
    return;
  }

  if (type === 'error') {
    feedback.textContent = 'MAUVAISE REPONSE...';
    feedback.classList.add('quiz-feedback--error');
    feedback.hidden = false;
    return;
  }

  feedback.hidden = true;
}

function resetQcmState() {
  selectedAnswerId = null;
  submitMode = 'validate';
  setSubmitButtonLabel('Valider', false);
  setFeedbackMessage('none');
}

function selectQcmOption(button) {
  const allButtons = document.querySelectorAll('.qcm-option');
  allButtons.forEach((btn) => {
    btn.classList.remove('qcm-option--active');
  });

  button.classList.add('qcm-option--active');
  selectedAnswerId = Number(button.dataset.repId);
}

function setOptionResultIcon(button, isCorrect) {
  const marker = button.querySelector('.qcm-option__marker');
  if (!marker) {
    return;
  }

  marker.innerHTML = '';
  const icon = document.createElement('img');
  icon.src = isCorrect ? CHECK_ICON_SRC : ERROR_ICON_SRC;
  icon.alt = '';
  icon.className = 'qcm-option__marker-icon';
  marker.appendChild(icon);
}

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
  currentQuestionData = data;

  // Mettre à jour l'index courant
  const index = allQuestions.findIndex((q) => Number(q.id) === Number(questionId));
  if (index >= 0) {
    currentQuestionIndex = index;
  }

  // Récupérer les éléments HTML
  const progressIndicator = document.getElementById('progress-indicator');
  const questionTitle = document.getElementById('question-title');
  const questionHint = document.getElementById('question-hint');
  if (progressIndicator) {
    progressIndicator.textContent = `${question.ordre}/${totalQuestions}`;
  }

  if (questionTitle) {
    const cleanedQuestion = String(question.intitule || '').replace(/^\s*\d+\.\s*/, '');
    questionTitle.textContent = `${question.ordre}. ${cleanedQuestion}`;
  }

  if (questionHint) {
    const indice = (question.indice || '').trim();
    if (indice) {
      questionHint.hidden = false;
      questionHint.textContent = `(${indice})`;
    } else {
      questionHint.hidden = true;
    }
  }

  resetQcmState();

  if (question.type === 'qcm') {
    displayQCM(reponses);
  } else if (question.type === 'texte') {
    displayTextQuestion(question, reponses);
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

  container.innerHTML = '';

  reponses.forEach((reponse) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'qcm-option';
    button.innerHTML = `
      <span class="qcm-option__text">${reponse.intitule}</span>
      <span class="qcm-option__marker" aria-hidden="true"></span>
    `;
    button.dataset.repId = reponse.id;
    button.dataset.isCorrect = reponse.is_correct ? 'true' : 'false';

    button.addEventListener('click', () => {
      if (submitMode !== 'validate') {
        return;
      }
      selectQcmOption(button);
    });

    container.appendChild(button);
  });
}

/**
 * Gérer le bouton principal (Valider/Corriger/Suivant)
 */
export function handleSubmitAction() {
  if (!currentQuestionData || !currentQuestionData.question) {
    return;
  }

  if (submitMode === 'next') {
    nextQuestion();
    return;
  }

  if (submitMode === 'retry') {
    displayQuestion(currentQuestionData.question.id);
    return;
  }

  if (currentQuestionData.question.type !== 'qcm') {
    nextQuestion();
    return;
  }

  if (!selectedAnswerId) {
    return;
  }

  const allButtons = document.querySelectorAll('.qcm-option');
  const selectedButton = Array.from(allButtons).find(
    (btn) => Number(btn.dataset.repId) === selectedAnswerId
  );

  if (!selectedButton) {
    return;
  }

  const isCorrect = selectedButton.dataset.isCorrect === 'true';
  allButtons.forEach((btn) => {
    btn.disabled = true;
    btn.classList.remove('qcm-option--active');
  });

  if (isCorrect) {
    selectedButton.classList.add('qcm-option--correct');
    setOptionResultIcon(selectedButton, true);
    setFeedbackMessage('success');
    submitMode = 'next';
    setSubmitButtonLabel('Suivant', false);
  } else {
    selectedButton.classList.add('qcm-option--incorrect');
    setOptionResultIcon(selectedButton, false);
    setFeedbackMessage('error');
    submitMode = 'retry';
    setSubmitButtonLabel('Corriger', true);
  }
}

/**
 * Afficher une question texte
 */
function displayTextQuestion(question, reponses) {
  const textarea = document.getElementById('text-answer-input');
  const templateAnswers = document.getElementById('text-answers-template');

  if (templateAnswers) {
    templateAnswers.textContent = reponses.map((reponse) => reponse.intitule).join(' | ');
  }

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
    button.className = 'qcm-option';
    button.innerHTML = `
      <span class="qcm-option__text">${reponse.intitule}</span>
      <span class="qcm-option__marker" aria-hidden="true"></span>
    `;
    button.dataset.repId = reponse.id;
    button.dataset.isCorrect = reponse.is_correct ? 'true' : 'false';

    button.addEventListener('click', () => {
      if (submitMode !== 'validate') {
        return;
      }
      selectQcmOption(button);
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
    window.location.href = './remerciements-template.html';
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
 * Obtenir le nombre total de questions
 */
export function getTotalQuestions() {
  return totalQuestions;
}
