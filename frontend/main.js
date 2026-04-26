// @ts-nocheck
import {
  loadQuestions,
  displayQuestion,
  handleSubmitAction,
  previousQuestion,
  getTotalQuestions,
  allQuestions
} from './quiz.js';

console.log("App initialisée - Connexion au Backend");

const QUIZ_LOADING_FLAG = 'quizLoadingFromAccueil';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function setLoadingPhase(loadingScreen, phase) {
  if (!loadingScreen) {
    return;
  }

  if (phase === 'start') {
    loadingScreen.classList.add('is-active');
    loadingScreen.classList.remove('is-hidden');
    loadingScreen.classList.remove('loading-screen--show-text');
    return;
  }

  if (phase === 'text') {
    loadingScreen.classList.add('loading-screen--show-text');
    return;
  }

  if (phase === 'hide') {
    loadingScreen.classList.remove('is-active');
    loadingScreen.classList.add('is-hidden');
    loadingScreen.classList.remove('loading-screen--show-text');
  }
}

function markLoadingFromAccueil() {
  try {
    sessionStorage.setItem(QUIZ_LOADING_FLAG, '1');
  } catch (error) {
    console.warn('Impossible de stocker le flag de loading:', error);
  }
}

function consumeLoadingFromAccueil() {
  try {
    const value = sessionStorage.getItem(QUIZ_LOADING_FLAG) === '1';
    sessionStorage.removeItem(QUIZ_LOADING_FLAG);
    return value;
  } catch (error) {
    return false;
  }
}

/**
 * Initialiser le quiz au chargement de la page
 */
document.addEventListener('DOMContentLoaded', async () => {
  const startButton = document.querySelector('.accueil-start-btn');
  if (startButton) {
    startButton.addEventListener('click', markLoadingFromAccueil);
  }

  const isQuizPage = !!document.getElementById('question-title');
  if (!isQuizPage) {
    return;
  }

  const loadingScreen = document.getElementById('loadingScreen');
  const mainContent = document.querySelector('.main-content');
  const shouldShowLoading = consumeLoadingFromAccueil() && !!loadingScreen;

  if (shouldShowLoading) {
    if (mainContent) {
      mainContent.classList.add('quiz-content--hidden');
    }
    setLoadingPhase(loadingScreen, 'start');
  } else {
    setLoadingPhase(loadingScreen, 'hide');
  }

  try {
    const loadPromise = loadQuestions();

    if (shouldShowLoading) {
      // Etape 1: logo seul pendant le chargement des questions
      await Promise.all([loadPromise, sleep(700)]);

      // Etape 2: meme ecran avec texte qui apparait
      setLoadingPhase(loadingScreen, 'text');
      await sleep(900);
    } else {
      await loadPromise;
    }

    // Afficher la première question
    if (getTotalQuestions() > 0) {
      await displayQuestion(allQuestions[0].id);
    }

    if (mainContent) {
      mainContent.classList.remove('quiz-content--hidden');
    }

    if (shouldShowLoading) {
      setLoadingPhase(loadingScreen, 'hide');
    }

    // Gestion des boutons de navigation
    const submitButton = document.querySelector('.btn-submit');
    const backButton = document.querySelector('.header__button');

    if (submitButton) {
      submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        handleSubmitAction();
      });
    }

    if (backButton) {
      backButton.addEventListener('click', () => {
        previousQuestion();
      });
    }

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);

    if (mainContent) {
      mainContent.classList.remove('quiz-content--hidden');
    }

    setLoadingPhase(loadingScreen, 'hide');
  }
});

