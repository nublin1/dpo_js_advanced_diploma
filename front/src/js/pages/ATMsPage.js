import { el } from "redom";

export function renderATMsPage(banks) {
  const container = el("div", { class: "container atm-container" });

  const title = el("h1", { class: "" }, "Карта банкоматов");

  const map = el("div", {
    class: "ya-map",
    id: "map",
    style: {
      width: "100%",
      height: "1000px",
    },
  });

  // Функция ymaps.ready() будет вызвана, когда
  // загрузятся все компоненты API, а также когда будет готово DOM-дерево.
  ymaps.ready(() => {
    const myMap = new ymaps.Map("map", {
      // Координаты центра карты.
      // Порядок по умолчанию: «широта, долгота».
      // Чтобы не определять координаты центра карты вручную,
      // воспользуйтесь инструментом Определение координат.
      center: [55.753994, 37.622093],
      // Уровень масштабирования. Допустимые значения:
      // от 0 (весь мир) до 19.
      zoom: 11,
      controls: [],
    });

    for (let i = 0; i < banks.length; i++) {
      const placeMaker = new ymaps.Placemark([banks[i].lat, banks[i].lon], {
        iconLayout: "default#image",
        iconImageSize: [50, 50],
      });
      myMap.geoObjects.add(placeMaker);
    }
  });

  container.append(title, map);
  const main = document.getElementById("main");
  main.innerHTML = "";
  main.appendChild(container);
}