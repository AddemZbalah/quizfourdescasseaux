const timestamp = Date.now();
const templateFile = await fetch(
  `./frontend/templates/Remerciements/remerciements-template.html?v=${timestamp}`
);
const template = await templateFile.text();

const Remerciements = {};

Remerciements.render = function () {
  return template;
};

export { Remerciements };