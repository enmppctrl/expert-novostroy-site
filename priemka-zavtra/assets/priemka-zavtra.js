(() => {
  const calculator = document.getElementById("tomorrow-calculator");
  const areaInput = document.getElementById("tomorrow-area");
  const priceResult = document.getElementById("tomorrow-price-result");

  calculator?.addEventListener("submit", event => {
    event.preventDefault();
    const area = Number.parseFloat((areaInput.value || "").replace(",", "."));
    if (!Number.isFinite(area) || area <= 0) {
      priceResult.textContent = "Введите площадь больше нуля";
      return;
    }
    const price = Math.max(area * 130, 6900);
    priceResult.textContent = "Базовая стоимость: " + new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(price) + " ₽";
  });

  const form = document.getElementById("tomorrow-lead-form");
  form?.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const lines = [
      "Здравствуйте! Хочу уточнить возможность приёмки квартиры завтра.",
      "Имя: " + (data.get("name") || ""),
      "Телефон: " + (data.get("phone") || "")
    ];
    const complex = (data.get("complex") || "").toString().trim();
    const area = (data.get("area") || "").toString().trim();
    const comment = (data.get("comment") || "").toString().trim();
    const scenarios = data.getAll("scenario[]");
    if (complex) lines.push("ЖК / адрес: " + complex);
    if (area) lines.push("Площадь: " + area + " м²");
    if (comment) lines.push("Дата, время или комментарий: " + comment);
    if (scenarios.length) lines.push("Дополнительно: " + scenarios.join(", "));
    window.location.href = "https://wa.me/74951528580?text=" + encodeURIComponent(lines.join("\n"));
  });
})();
