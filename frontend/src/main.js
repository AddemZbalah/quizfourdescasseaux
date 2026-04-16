import './style.css';

console.log("App initialisée");

// Simulation de ce que nous renverrait la base de données (backend API)
const mockDataQCM = {
  current_question_number: 3,
  total_questions: 7,
  question_title: "Qu'avez-vous préféré lors de votre visite aujourd'hui ?",
  type: "qcm",
  choix: [
    { id: 1, texte: "Le majestueux Four à porcelaine" },
    { id: 2, texte: "L'histoire ouvrière du site" },
    { id: 3, texte: "L'architecture industrielle du bâtiment" },
    { id: 4, texte: "Tu connais" }
  ]
};

const mockDataText = {
  current_question_number: 4,
  total_questions: 7,
  question_title: "Quelles sont vos recommandations pour nous améliorer ?",
  type: "text",
  placeholder: "Écrivez votre réponse ici..."
};

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;

  // On vérifie sur quelle page on se trouve pour injecter les bonnes données
  if (currentPath.includes('qcm-template.html')) {
    renderQuestion(mockDataQCM);
  } else if (currentPath.includes('text-template.html')) {
    renderQuestion(mockDataText);
  }
});

function renderQuestion(data) {
  // 1. Remplir l'indicateur de progression (ex: 3/7)
  const progressIndicator = document.getElementById('progress-indicator');
  if (progressIndicator) {
    progressIndicator.textContent = `${data.current_question_number}/${data.total_questions}`;
  }

  // 2. Mettre à jour le numéro de base (attribut start du <ol>)
  const questionList = document.getElementById('question-list');
  if (questionList) {
    questionList.setAttribute('start', data.current_question_number);
  }

  // 3. Remplir l'intitulé de la question
  const questionTitle = document.getElementById('question-title');
  if (questionTitle) {
    questionTitle.textContent = data.question_title;
  }

  // 4. Si c'est un QCM, on génère les divs HTML pour chaque choix
  if (data.type === 'qcm') {
    const qcmContainer = document.getElementById('qcm-options-container');
    if (qcmContainer) {
      qcmContainer.innerHTML = ''; // on vide au cas où
      data.choix.forEach(choix => {
        // Création de l'élément HTML comme on le faisait en "dur" avant
        const optionDiv = document.createElement('div');
        optionDiv.className = 'qcm-option';

        optionDiv.innerHTML = `
          <span class="qcm-option__text">${choix.texte}</span>
          <div class="qcm-option__checkbox"></div>
        `;

        // Petit bonus pour le fun : pouvoir cliquer sur les options pour colorer la case!
        optionDiv.addEventListener('click', () => {
          // On retire la classe "active" de toutes les options
          document.querySelectorAll('.qcm-option').forEach(el => {
            el.classList.remove('qcm-option--active');
            el.classList.remove('border-brique', 'border-[1.5px]'); // Nettoyage de Tailwind si on ne l'utilise qu'en BEM
          });
          // Et on l'ajoute uniquement à l'option cliquée
          optionDiv.classList.add('qcm-option--active');
        });

        qcmContainer.appendChild(optionDiv);
      });
    }
  }

  // 5. Si c'est du Texte, on met le petit message d'aide (placeholder)
  if (data.type === 'text') {
    const textInput = document.getElementById('text-answer-input');
    if (textInput && data.placeholder) {
      textInput.setAttribute('placeholder', data.placeholder);
    }
  }
}

