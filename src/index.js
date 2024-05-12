import { Engine } from "@babylonjs/core";
import Game from "./game";
import backgroundImage from "../assets/images/backgroundMenu.png";
import { GlobalManager } from "./globalmanager";


let canvas;
let engine;


window.onload = () => {

  document.getElementById("backgroundImage").src = backgroundImage;

  const menu = document.getElementById("menu");
  const playButton = document.getElementById("playButton");
  const controlsButton = document.getElementById("controlsButton");
  const creditsButton = document.getElementById("creditsButton");

  const choicesUser = document.getElementById("choicesUser");
  

  playButton.addEventListener("click", () => {
    menu.style.display = "none";
    choicesUser.style.display = "flex";

  });

  // controlsButton.addEventListener("click", () => {
  //   menu.style.display = "none";
  // });

  // creditsButton.addEventListener("click", () => {
  //   menu.style.display = "none";
  // });



  document.getElementById("sunny").addEventListener("click", () => {
    GlobalManager.weatherChoice = 1;
  });
  document.getElementById("rainy").addEventListener("click", () => {
    GlobalManager.weatherChoice = 2;
  });



  document.getElementById("buttonGo").addEventListener("click", () => {
    document.getElementById("gui").style.display = "none";
    GlobalManager.changeGameState(GlobalManager.States.STATE_RUNNING);
      babylonInit().then(() => {
        const game = new Game(canvas, engine);
        game.start();
      });

  });






};


const babylonInit = async () => {
  canvas = document.getElementById("renderCanvas");

  engine = new Engine(canvas, false, {
    adaptToDeviceRatio: true,
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });

};


