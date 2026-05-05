import { API } from "../../lib/api.js";

const template = await fetch("/Quiz/frontend/templates/QCM/qcm-template.html")
  .then((response) => {
    if (!response.ok) throw new Error("");
    return response.text();
  })
  .catch((err) => {
    return "";
  });

const repTemplate = await fetch("/Quiz/frontend/templates/QCM/qcm-reponse-template.html")
  .then((response) => {
    if (!response.ok) throw new Error("");
    return response.text();
  })
  .catch((err) => {
    return "";
  });

const QCM = {
  /**
  * @param {string|number} questionId
  */
  async render(questionId) {
    const container = document.querySelector("#content");
    if (!container) {
      return;
    }

    const questionsData = await API.getAllQuestions();

    const found = questionsData.questions?.find((q) => Number(q.ordre) === Number(questionId));

    if (!found) return;

    const questionIdResolved = found.id;

    const questionData = await API.getQuestion(questionIdResolved);
    const reponsesData = await API.getAnswers(questionIdResolved);

    const question = questionData.question ?? questionData;
    let reponsesHtml = "";

    if (Array.isArray(reponsesData.reponses)) {
      for (const reponse of reponsesData.reponses) {
        reponsesHtml += repTemplate.replaceAll("{{reponse}}", String(reponse.intitule ?? ""));
      }
    }

    const html = template
      .replaceAll("{{ordre}}", String(question.ordre ?? "N/A"))
      .replaceAll("{{total}}", String(Array.isArray(questionsData.questions) ? questionsData.questions.length : 0))
      .replaceAll("{{question}}", String(question.intitule ?? "Pas de question"))
      .replaceAll("{{indice}}", String(question.indice ?? ""))
      .replaceAll("{{reponses}}", reponsesHtml)
      .replaceAll("{{action}}", "Valider");

    container.innerHTML = html;
  },
};

export { QCM };
