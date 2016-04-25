const body = document.body;
const $alert = document.createElement("DIV");
const $alertContainer = document.createElement("DIV");
const $alertClose = document.createElement("BUTTON");
const $alertContent = document.createElement("DIV");

$alertContainer.classList.add("alert__container");
$alertClose.classList.add("alert__close");
$alertClose.addEventListener("click", close);
$alertContent.classList.add("alert__content");
$alertClose.innerHTML = "Close";

$alert.classList.add("alert");
$alert.appendChild($alertContainer);
$alertContainer.appendChild($alertClose);
$alertContainer.appendChild($alertContent);

body.appendChild($alert);

function close() {
  body.classList.remove("alert--open");
}

function open() {
  body.classList.add("alert--open");
}

export default function alert(msg){
  $alertContent.innerHTML = msg;
  setTimeout(function() {
    open();
  },0);
}
