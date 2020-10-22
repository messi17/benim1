const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let img = new Image();
let fileName = "";

const downloadBtn = document.getElementById("download-btn");
const uploadFile = document.getElementById("upload-file");
const revertBtn = document.getElementById("revert-btn");

// Filter & Effect Handlers
document.addEventListener("click", e => {
  if (e.target.classList.contains("filter-btn")) {
    if (e.target.classList.contains("brightness-add")) {
      Caman("#canvas", img, function() {
        this.brightness(5).render();
      });
    } else if (e.target.classList.contains("brightness-remove")) {
      Caman("#canvas", img, function() {
        this.brightness(-5).render();
      });
    } else if (e.target.classList.contains("contrast-add")) {
      Caman("#canvas", img, function() {
