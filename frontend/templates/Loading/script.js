const templateFile = await fetch(
  "./frontend/templates/Loading/loading-template.html",
);
const template = await templateFile.text();

const Loading = template;

export { Loading };
