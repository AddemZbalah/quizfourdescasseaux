const templateFile = await fetch("./frontend/templates/QCM/qcm-template.html");
const template = await templateFile.text();

const templateFile2 = await fetch(
  "./frontend/templates/QCM/qcm-reponse-template.html",
);
const templaterep = await templateFile2.text();

// const QCM = {};

// QCM.format = function (id, ordre, intitule, type, is_correct) {
//   let html = templaterep;
//   html = html.replace("{{id}}", id);
//   html = html.replace("{{ordre}}", ordre);
//   html = html.replace("{{intitule}}", intitule);
//   html = html.replace("{{type}}", type);
//   html = html.replace("{{is_correct}}", is_correct);

//   return html;
// };

// QCM.formatMany = function (data) {
//   let html = template;
//   let reponsesList = "";

//   html = html.replaceAll("{{ordre}}", reponse.ordre);
//   html = html.replace("{{total}}", data.total);
//   html = html.replace("{{question}}", data.question);
//   html = html.replace("{{indice}}", data.indice);
//   html = html.replace("{{handler}}", "#");

//   for (let reponse of data.reponses) {
//     reponsesList += QCM.format(
//       reponse.id,
//       reponse.ordre,
//       reponse.intitule,
//       reponse.type,
//       reponse.is_correct,
//     );

//     html = html.replace("{{reponses}}", reponsesList);
//   }
// };

const QCM = template;

export { QCM };
