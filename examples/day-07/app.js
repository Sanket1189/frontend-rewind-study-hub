const dialog = document.querySelector("#layer-dialog");
document.querySelector("#open-help").addEventListener("click", () => dialog.showModal());
document.querySelector("#close-help").addEventListener("click", () => dialog.close());

document.querySelectorAll(".card-actions button").forEach((button) => {
  button.addEventListener("click", () => {
    const role = button.closest(".role-card").querySelector("h3").textContent;
    document.querySelector("#save-status").textContent = `${role} saved locally for this demonstration.`;
    button.textContent = "Saved";
    button.disabled = true;
  });
});

