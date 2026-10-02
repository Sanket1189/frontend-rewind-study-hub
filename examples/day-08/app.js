const scenarios = [
  { category: "types", label: "The null exception", expression: "typeof null", value: '"object"', type: "string", boolean: "true", steps: ["null is a primitive value.", "typeof null returns the historical string \"object\".", "That returned string is non-empty, so its Boolean conversion is true."], rule: "Detect null with value === null before using typeof." },
  { category: "types", label: "Arrays are objects", expression: "typeof []", value: '"object"', type: "string", boolean: "true", steps: ["An array is a specialized object.", "typeof does not distinguish arrays from ordinary objects.", "The returned non-empty string is truthy."], rule: "Use Array.isArray(value) when the distinction matters." },
  { category: "types", label: "NaN has numeric type", expression: "typeof NaN", value: '"number"', type: "string", boolean: "true", steps: ["NaN is a special Number value representing an invalid numeric result.", "typeof therefore returns the string \"number\".", "The result string itself is truthy."], rule: "Detect the value with Number.isNaN(value), not value === NaN." },
  { category: "coercion", label: "Plus concatenates", expression: '"2" + 3', value: '"23"', type: "string", boolean: "true", steps: ["One operand is a string.", "The number 3 is converted to the string \"3\".", "The plus operator concatenates the two strings."], rule: "Convert input with Number() before arithmetic." },
  { category: "coercion", label: "Minus converts", expression: '"8" - 3', value: "5", type: "number", boolean: "true", steps: ["The minus operator requests numeric operands.", "The string \"8\" converts to number 8.", "8 minus 3 produces number 5."], rule: "Prefer explicit conversion so the intent is visible." },
  { category: "coercion", label: "Invalid number", expression: 'Number("12px")', value: "NaN", type: "number", boolean: "false", steps: ["Number() attempts to convert the whole string.", "The suffix prevents a valid numeric conversion.", "NaN is falsy even though its type is number."], rule: "Validate conversions with Number.isFinite() or Number.isNaN()." },
  { category: "truthiness", label: "Empty array", expression: "Boolean([])", value: "true", type: "boolean", boolean: "true", steps: ["Every ordinary object is truthy.", "An array is an object, even when it has no items.", "Boolean conversion therefore returns true."], rule: "Check array.length when you mean non-empty." },
  { category: "truthiness", label: "Text that looks false", expression: 'Boolean("false")', value: "true", type: "boolean", boolean: "true", steps: ["Only the empty string is falsy.", "The characters in \"false\" do not change Boolean conversion.", "The non-empty string becomes true."], rule: "Parse external Boolean text according to an explicit contract." },
  { category: "truthiness", label: "AND returns an operand", expression: '0 && "loaded"', value: "0", type: "number", boolean: "false", steps: ["The first operand is falsy.", "&& stops without evaluating the second operand.", "It returns the original number 0, not Boolean false."], rule: "Use Boolean(condition) when the consumer requires an actual Boolean." },
  { category: "equality", label: "Strict types", expression: '3 === "3"', value: "false", type: "boolean", boolean: "false", steps: ["The left operand is a number.", "The right operand is a string.", "Strict equality performs no conversion, so different types are unequal."], rule: "Use strict equality by default." },
  { category: "equality", label: "Loose conversion", expression: '0 == false', value: "true", type: "boolean", boolean: "true", steps: ["Loose equality allows conversion.", "false converts to number 0 for this comparison.", "The two numeric zeros compare equal."], rule: "Avoid casual loose equality; make conversion explicit." },
  { category: "equality", label: "Different objects", expression: "{} === {}", value: "false", type: "boolean", boolean: "false", steps: ["Each object literal creates a new object.", "Strict equality compares object identity.", "The two references point to different objects."], rule: "Compare stable IDs or selected fields when structural meaning matters." },
  { category: "equality", label: "NaN comparison", expression: "NaN === NaN", value: "false", type: "boolean", boolean: "false", steps: ["NaN is defined as unequal to every value under strict equality.", "That includes another NaN value.", "Object.is(NaN, NaN) would return true."], rule: "Use Number.isNaN(value) for the ordinary validation case." },
  { category: "defaults", label: "OR replaces zero", expression: "0 || 5", value: "5", type: "number", boolean: "true", steps: ["Zero is falsy.", "|| therefore evaluates and returns its second operand.", "The valid zero is lost."], rule: "Use ?? when zero, false, or an empty string are valid data." },
  { category: "defaults", label: "Nullish preserves zero", expression: "0 ?? 5", value: "0", type: "number", boolean: "false", steps: ["The nullish values are only null and undefined.", "Zero is not nullish, so evaluation stops.", "The original zero is returned."], rule: "Use ?? for missing-value defaults." },
];

const list = document.querySelector("#scenario-list");
let selected = scenarios[0];
let activeFilter = "all";

function visibleScenarios() { return scenarios.filter((item) => activeFilter === "all" || item.category === activeFilter); }

function renderResult(item) {
  selected = item;
  document.querySelector("#result-category").textContent = item.category;
  document.querySelector("#result-title").textContent = item.label;
  document.querySelector("#result-index").textContent = `${scenarios.indexOf(item) + 1} / ${scenarios.length}`;
  document.querySelector("#result-expression").textContent = item.expression;
  document.querySelector("#result-value").textContent = item.value;
  document.querySelector("#result-type").textContent = item.type;
  document.querySelector("#result-boolean").textContent = item.boolean;
  document.querySelector("#result-rule").textContent = item.rule;
  const steps = document.querySelector("#result-steps");
  steps.replaceChildren(...item.steps.map((text) => { const li = document.createElement("li"); li.textContent = text; return li; }));
  renderList();
}

function renderList() {
  list.replaceChildren(...visibleScenarios().map((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `scenario-button${item === selected ? " is-active" : ""}`;
    button.setAttribute("aria-pressed", String(item === selected));
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const code = document.createElement("code");
    code.textContent = item.expression;
    button.append(number, code);
    button.addEventListener("click", () => renderResult(item));
    return button;
  }));
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    const visible = visibleScenarios();
    if (!visible.includes(selected)) selected = visible[0];
    renderResult(selected);
  });
});

renderResult(selected);

