import './style.css';
import {
  loadQuestions,
  displayQuestion,
  nextQuestion,
  previousQuestion,
  getTotalQuestions
} from './quiz.js';

console.log("App initialisée - Connexion au Backend");

/**
 * Initialiser le quiz au chargement de la page
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Charger toutes les questions depuis l'API
    await loadQuestions();

    // Afficher la première question
    if (getTotalQuestions() > 0) {
      await displayQuestion(1); // Commencer par la question 1
    }

    // Gestion des boutons de navigation
    const submitButton = document.querySelector('.btn-submit');
    const backButton = document.querySelector('.header__button');

    if (submitButton) {
      submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        nextQuestion();
      });
    }

    if (backButton) {
      backButton.addEventListener('click', () => {
        previousQuestion();
      });
    }

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
  }
});

