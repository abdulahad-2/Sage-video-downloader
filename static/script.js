const $ = (s) => document.querySelector(s);

const log = (m) => {
  const el = $("#log");
  el.textContent += (m + "\n");
};

$("#go").addEventListener("click", async () => {
  const url = $("#url").value.trim();
  $("#result").innerHTML = "";
  $("#log").textContent = "";
  if (!url) {
    log("Enter a URL");
    return;
  }
  log("Sending request...");
  try {
    const r = await fetch("/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    log("Status: " + r.status);
    log(JSON.stringify(data, null, 2));
    if (r.ok && data.download_url) {
      $("#result").innerHTML = `<a href="${data.download_url}" target="_blank">Download file</a>`;
    }
  } catch (e) {
    log("Error: " + e.message);
  }
});


