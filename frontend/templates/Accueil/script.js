const timestamp = Date.now();
const templateFile = await fetch(
  `./frontend/templates/Accueil/accueil-template.html?v=${timestamp}`,
);
const template = await templateFile.text();

const Accueil = {};

Accueil.format = function (handler) {
  let html = template;
  html = html.replace("{{handler}}", handler);

  return html;
};

export { Accueil };
