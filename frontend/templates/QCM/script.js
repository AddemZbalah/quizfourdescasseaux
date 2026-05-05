const templateFile = await fetch("./frontend/templates/QCM/qcm-template.html");
const template = await templateFile.text();

const templateFile2 = await fetch(
  "./frontend/templates/QCM/qcm-reponse-template.html",
);
const templaterep = await templateFile2.text();

const QCM = {};

QCM.format = function () {
  let html = templaterep;
};

QCM.formatMany = function (data) {
  let html = template;
  let reponsesList = "";
  for (let reponse of data.reponses) {
  }
};

export { QCM };
