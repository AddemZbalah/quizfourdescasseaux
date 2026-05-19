const templateFile = await fetch(
  "./frontend/templates/Remerciements/remerciements-template.html"
);
const template = await templateFile.text();

const Remerciements = {};

Remerciements.render = function () {
  return template;
};

export { Remerciements };