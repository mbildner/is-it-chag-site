import { getNow, addZips, handleIsChagQuery } from "./run.js";

const submitQuery = () => {
  const maybeZip = document.getElementById("zipInput").value.trim();
  const result = handleIsChagQuery(
    document.getElementById("dateTimeLocalInput").value,
    maybeZip
  );
  document.getElementById("readout").textContent = result;
};

window.document.addEventListener("DOMContentLoaded", () => {
  addZips();

  document.getElementById("dateTimeLocalInput").value = getNow();

  document
    .getElementById("dateTimeLocalInput")
    .addEventListener("input", submitQuery);

  document.getElementById("zipInput").value = "07666";

  document.getElementById("zipInput").addEventListener("input", submitQuery);

  document
    .getElementById("zipChooseButton")
    .addEventListener("click", submitQuery);

  window.setTimeout(() => {
    submitQuery();
  }, 0);
});

export { handleIsChagQuery, addZips, getNow };
