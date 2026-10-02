const form = document.querySelector("#interest-form");
const errorSummary = document.querySelector("#error-summary");
const errorList = document.querySelector("#error-list");
const dialog = document.querySelector("#review-dialog");
const reviewDetails = document.querySelector("#review-details");
const status = document.querySelector("#save-status");

const rules = [
  { id: "name", message: "Enter your full name." },
  { id: "email", message: "Enter a valid email address." },
  { id: "role", message: "Choose a preferred role." },
];

function clearErrors() {
  errorList.replaceChildren();
  errorSummary.hidden = true;
  rules.forEach(({ id }) => {
    const field = document.querySelector(`#${id}`);
    const error = document.querySelector(`#${id}-error`);
    field.removeAttribute("aria-invalid");
    field.setAttribute("aria-describedby", `${id}-hint`);
    error.hidden = true;
    error.textContent = "";
  });
}

function invalidFields() {
  return rules.filter(({ id }) => !document.querySelector(`#${id}`).checkValidity());
}

function showErrors(errors) {
  errors.forEach(({ id, message }) => {
    const field = document.querySelector(`#${id}`);
    const error = document.querySelector(`#${id}-error`);
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", `${id}-hint ${id}-error`);
    error.textContent = message;
    error.hidden = false;

    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${id}`;
    link.textContent = message;
    item.append(link);
    errorList.append(item);
  });
  errorSummary.hidden = false;
  errorSummary.focus();
}

function openReview() {
  const data = new FormData(form);
  const rows = [
    ["Name", data.get("name")],
    ["Email", data.get("email")],
    ["Role", data.get("role")],
    ["Work", data.get("work")],
  ];
  reviewDetails.replaceChildren();
  rows.forEach(([term, value]) => {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = value;
    reviewDetails.append(dt, dd);
  });
  dialog.showModal();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  status.textContent = "";
  clearErrors();
  const errors = invalidFields();
  if (errors.length) showErrors(errors);
  else openReview();
});

document.querySelector("#cancel-review").addEventListener("click", () => dialog.close("cancel"));
document.querySelector("#confirm-review").addEventListener("click", () => {
  dialog.close("confirm");
  status.textContent = "Details confirmed. This learning example did not send any data.";
});

