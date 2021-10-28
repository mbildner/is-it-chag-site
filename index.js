import { getNow, addZips, handleIsChagQuery } from "./run.js";

const submitQuery = () => {
  const maybeZip = document.getElementById("zipInput").value.trim();
  const maybeTimestamp = document.getElementById("dateTimeLocalInput").value;
  const result = handleIsChagQuery(
    maybeTimestamp,
    maybeZip
  );
  document.getElementById("readout").textContent = result;

  let niceTime = maybeTimestamp;
  try {
      const d = new Date(niceTime);
      niceTime = `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  } catch (e) {
      console.error(`failed to parse datestamp ${maybeTimestamp}`);
  }

  document.getElementById('currentDateInputFormatted')
    .textContent = niceTime;
};


window.document.addEventListener("DOMContentLoaded", () => {
  addZips();

  document.getElementById("dateTimeLocalInput").value = getNow();

  document
    .getElementById("dateTimeLocalInput")
    .addEventListener("input", submitQuery);

  document.getElementById("zipInput").value = "07666";

  document.getElementById("zipInput").addEventListener("input", submitQuery);

  window.setTimeout(() => {
    submitQuery();
  }, 0);
});

export { handleIsChagQuery, addZips, getNow };
