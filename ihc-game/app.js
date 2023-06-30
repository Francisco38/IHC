const mapData = {
  minX: 0,
  maxX: 20,
  minY: 0,
  maxY: 20,
};

var pixelSize = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue(
    "--pixel-size"
  )
);

// Options for Player Colors... these are in the same order as our sprite sheet
const playerColors = ["blue", "red", "orange", "yellow", "skeleton"];

let GLOBAL_VOLUME;
const start_audio = document.querySelector("#music");

//Misc Helpers
function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}
function getKeyString(x, y) {
  return `${x}x${y}`;
}
function sound(path) {
  return new Audio(path);
}
function createName() {
  const prefix = randomFromArray([
    "COOL",
    "SUPER",
    "HIP",
    "SMUG",
    "COOL",
    "SILKY",
    "GOOD",
    "SAFE",
    "DEAR",
    "DAMP",
    "WARM",
    "RICH",
    "LONG",
    "DARK",
    "SOFT",
    "BUFF",
    "DOPE",
  ]);
  const animal = randomFromArray([
    "BEAR",
    "DOG",
    "CAT",
    "FOX",
    "LAMB",
    "LION",
    "BOAR",
    "GOAT",
    "VOLE",
    "SEAL",
    "PUMA",
    "MULE",
    "BULL",
    "BIRD",
    "BUG",
  ]);
  return `${prefix} ${animal}`;
}

function isSolid(x, y) {
  return (
    x >= mapData.maxX ||
    x < mapData.minX ||
    y >= mapData.maxY ||
    y < mapData.minY
  );
}

function getRandomSafeSpot() {
  //We don't look things up by key here, so just return an x/y
  return { x: Math.floor((Math.random() * 20)), y: Math.floor((Math.random() * 20)) };
}

let gameStarted = false;

function startGame() {
  start_audio.pause();
  toggleScreen('startScreen', false);
  toggleScreen('gameScreen', true);
}

function homeScreen() {
  window.location.reload();
}

function goToMenu(xp) {
  toggleScreen('gameScreen', false);
  let element = document.getElementById('deathScreen')
  let display = ''
  const playerXp = document.querySelector("#endExp");
  playerXp.textContent = "Xp:" + xp;
  element.style.display = display
}


function mute() {
  const mute_button = document.querySelector(".mute");
  if (start_audio.volume == 0) {
    start_audio.volume = 1;
    mute_button.style.backgroundImage = "url('/images/settings/mute.png')";
  }
  else {
    start_audio.volume = 0;
    mute_button.style.backgroundImage = "url('/images/settings/muted.png')";
  }
  start_audio.play;
}

function toggleScreen(id, toggle) {
  let element = document.getElementById(id)
  let display = (toggle) ? 'block' : 'none'
  element.style.display = display
  if (id == 'gameScreen' && toggle) {
    gameStarted = true
  }
}

(function () {
  let playerId;
  let playerRef;
  let players = {};
  let playerElements = {};
  let cells = {};
  let cellElements = {};
  let playerpos = {};
  let ArrowUp;
  let ArrowDown;
  let ArrowLeft;
  let ArrowRight;

  const gameContainer = document.querySelector(".game-container");
  const playerNameInput = document.querySelector("#player-name");
  const playerColorButton = document.querySelector("#player-color");
  const playerLife = document.querySelector(".character_life_bar_value");
  const playerLifeBar = document.querySelector(".character_life_bar_fill");
  const playerXp = document.querySelector("#exp");
  const muteButton = document.querySelector("#mute_button");
  const playerTopButton = document.querySelector("#top");
  const playerLeftButton = document.querySelector("#left");
  const playerRightButton = document.querySelector("#right");
  const playerDownButton = document.querySelector("#down");
  const playerLeftSkill = document.querySelector("#leftSkill");
  const playerRightSkill = document.querySelector("#rightSkill");
  const playerDownSkill = document.querySelector("#downSkill");
  const playerFightSkill = document.querySelector("#fightSkill");
  const playerFleeSkill = document.querySelector("#fleeSkill");
  const playerStealSkill = document.querySelector("#stealSkill");
  const playerShareSkill = document.querySelector("#shareSkill");

  function checkForDeadPlayers() {
    if (players[playerId].life <= 0) {
      const xp = players[playerId].xp;
      playerRef.remove();
      goToMenu(xp);
      ArrowDown.unbind();
      ArrowUp.unbind();
      ArrowRight.unbind();
      ArrowLeft.unbind();
    }
  }

  function checkForDuels() {
    playerpos = {};
    Object.keys(players).forEach((key) => {
      const characterState = players[key];
      playerpos[characterState.x * 100 + characterState.y] = 1;
    });
    const characterState = players[playerId];
    if (
      playerpos[(characterState.x + 1) * 100 + characterState.y] == 1 ||
      playerpos[(characterState.x - 1) * 100 + characterState.y] == 1 ||
      playerpos[characterState.x * 100 + characterState.y + 1] == 1 ||
      playerpos[(characterState.x + 1) * 100 + characterState.y - 1] == 1 ||
      playerpos[(characterState.x - 1) * 100 + characterState.y + 1] == 1 ||
      playerpos[(characterState.x - 1) * 100 + characterState.y + 1] == 1 ||
      playerpos[(characterState.x - 1) * 100 + characterState.y - 1] == 1 ||
      playerpos[characterState.x * 100 + characterState.y - 1] == 1 ||
      playerpos[characterState.x * 100 + characterState.y + 1] == 1
    ) {
      if (characterState.duel == false) {
        playerRef.update({
          duel: true,
        });
        document.getElementById("fightSkill").style.display = "block";
        document.getElementById("fleeSkill").style.display = "block";
        document.getElementById("stealSkill").style.display = "block";
        document.getElementById("shareSkill").style.display = "block";

        document.getElementById("leftSkill").style.display = "none";
        document.getElementById("rightSkill").style.display = "none";
        document.getElementById("downSkill").style.display = "none";
      }
    } else {
      if (characterState.duel == true) {
        playerRef.update({
          duel: false,
        });
        document.getElementById("fightSkill").style.display = "none";
        document.getElementById("fleeSkill").style.display = "none";
        document.getElementById("stealSkill").style.display = "none";
        document.getElementById("shareSkill").style.display = "none";

        document.getElementById("leftSkill").style.display = "block";
        document.getElementById("rightSkill").style.display = "block";
        document.getElementById("downSkill").style.display = "block";
      }
    }

  }

  function checkEnvolvedPlayers() {
    let envolvedPlayers = {};
    Object.keys(players).forEach((key) => {
      if (players[playerId] != players[key]) {
        dX = players[playerId].x - players[key].x;
        if (dX <= 1 && dX >= -1) {
          dY = players[playerId].y - players[key].y;
          if (dY <= 1 && dY >= -1) {
            envolvedPlayers[players[key].x * 100 + players[key].y] = key;
          }
        }
      }
    });
    return envolvedPlayers;
  }

  function SetCellLife() {
    for (let x = mapData.minX; x < mapData.maxX; x++) {
      for (let y = mapData.minY; y < mapData.maxY; y++) {
        const cellRef = firebase.database().ref(`cells/${getKeyString(x, y)}`);
        cellRef.set({
          x,
          y,
          life: 10,
        });
      }
    }
    setTimeout(() => {
      cellLife();
    }, 30000);
  }

  function cellLife() {
    for (let x = mapData.minX; x < mapData.maxX; x++) {
      for (let y = mapData.minY; y < mapData.maxY; y++) {
        addLiveValue(x, y, 10);
      }
    }
    setTimeout(() => {
      cellLife();
    }, 30000);
  }

  function addLiveValue(x, y, value) {
    const cellRef = firebase.database().ref(`cells/${getKeyString(x, y)}`);
    cellRef.once("value").then(function (snapshot) {
      n = snapshot.val().life;
      if (0 < n < 100) {
        if (n + value > 100) {
          cellRef.update({
            life: 100,
          });
        } else {
          cellRef.update({
            life: n + value,
          });
        }
      }
    });
  }

  function damage() {
    setTimeout(() => {
      changeLife(-1);
      damage();
    }, 5000);
  }

  function changeXp(quantity) {
    playerRef.update({
      xp: players[playerId].xp + quantity,
    });
    playerXp.textContent = players[playerId].xp;
  }

  function changeLife(quantity) {
    if (players[playerId].life + quantity > 100) {
      n = 100 - players[playerId].life;
      playerRef.update({
        life: 100,
      });
    } else {
      n = quantity;
      playerRef.update({
        life: players[playerId].life + quantity,
      });
    }
    playerLife.textContent = players[playerId].life + "%";
    playerLifeBar.style.width = players[playerId].life + "%";

    return n;
  }

  function handleArrowPress(xChange = 0, yChange = 0) {
    const newX = players[playerId].x + xChange;
    const newY = players[playerId].y + yChange;
    console.log(players[playerId].duel);
    if (!isSolid(newX, newY) && !players[playerId].duel) {
      //move to the next space
      players[playerId].x = newX;
      players[playerId].y = newY;
      if (xChange === 1) {
        players[playerId].direction = "right";
      }
      if (xChange === -1) {
        players[playerId].direction = "left";
      }
      playerRef.set(players[playerId]);
      changeLife(-1);
    }
  }

  const startmusic = new Audio("sounds/timetofight.mp3");
  function initGame() {
    startmusic.volume = 0;
    startmusic.loop = true;
    startmusic.play();

    ArrowUp = new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1));
    ArrowDown = new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1));
    ArrowLeft = new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0));
    ArrowRight = new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0));

    const allPlayersRef = firebase.database().ref(`players`);
    const allCellsRef = firebase.database().ref(`cells`);

    allPlayersRef.on("value", (snapshot) => {
      //Fires whenever a change occurs
      players = snapshot.val() || {};
      checkForDuels();
      checkForDeadPlayers();
      Object.keys(players).forEach((key) => {
        const characterState = players[key];
        let el = playerElements[key];
        // Now update the DOM
        el.querySelector(".Character_name").innerText = characterState.name;
        el.setAttribute("data-color", characterState.color);
        el.setAttribute("data-direction", characterState.direction);
        const left = 16 * characterState.x + "px";
        const top = 16 * characterState.y - 4 + "px";
        el.style.transform = `translate3d(${left}, ${top}, 0)`;
        if (characterState.id == playerId) {
          var camera_left = pixelSize * 8;
          var camera_top = pixelSize * 10;

          const left = 16 * -players[playerId].x + camera_left + "px";
          const top = 16 * -players[playerId].y - 4 + camera_top + "px";

          gameContainer.style.transform = `translate3d( ${left}, ${top}, 0 )`;
        }
      });
    });
    allPlayersRef.on("child_added", (snapshot) => {
      //Fires whenever a new node is added the tree
      const addedPlayer = snapshot.val();
      const characterElement = document.createElement("div");
      characterElement.classList.add("Character", "grid-cell");
      if (addedPlayer.id === playerId) {
        characterElement.classList.add("you");
      }
      characterElement.innerHTML = `
        <div class="Character_shadow grid-cell"></div>
        <div class="Character_sprite grid-cell"></div>
        <div class="Character_name-container">
          <div class="Character_name"></div>
        </div>
      `;
      playerElements[addedPlayer.id] = characterElement;
      var pixelSize = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--pixel-size"
        )
      );

      //Fill in some initial state
      characterElement.querySelector(".Character_name").innerText =
        addedPlayer.name;
      characterElement.setAttribute("data-color", addedPlayer.color);
      characterElement.setAttribute("data-direction", addedPlayer.direction);
      const left = 16 * addedPlayer.x;
      const top = 16 * addedPlayer.y - 4;

      characterElement.style.transform = `translate3d(${left}"px", ${top}"px", 0)`;
      gameContainer.appendChild(characterElement);
    });

    //Remove character DOM element after they leave
    allPlayersRef.on("child_removed", (snapshot) => {
      const removedKey = snapshot.val().id;
      gameContainer.removeChild(playerElements[removedKey]);
      delete playerElements[removedKey];
    })

    allCellsRef.on("child_added", (snapshot) => {
      const seed = snapshot.val();
      const key = getKeyString(seed.x, seed.y);
      cells[key] = true;

      // Create the DOM Element
      const cellElement = document.createElement("div");
      cellElement.classList.add("Cell", "grid-cell");
      cellElement.innerHTML = `
      <div class="seeds_sprite grid-cell"></div>
      `;

      cellElement.setAttribute("state", "0");

      // Position the Element
      const left = 16 * seed.x + "px";
      const top = 16 * seed.y - 4 + "px";
      cellElement.style.transform = `translate3d(${left}, ${top}, 0)`;

      // Keep a reference for removal later and add to DOM
      cellElements[key] = cellElement;
      gameContainer.appendChild(cellElement);
    });

    allCellsRef.on("value", (snapshot) => {
      cells = snapshot.val() || {};
      Object.keys(cells).forEach((key) => {
        const CellState = cells[key];
        let el = cellElements[key];
        // Now update the DOM
        if (CellState.life == 100) {
          el.setAttribute("state", "4");
        } else if (CellState.life > 75) {
          el.setAttribute("state", "3");
        } else if (CellState.life > 50) {
          el.setAttribute("state", "2");
        } else if (CellState.life > 25) {
          el.setAttribute("state", "1");
        } else if (CellState.life > 0) {
          el.setAttribute("state", "0");
        } else {
          el.setAttribute("state", "5");
        }
      });
    });

    //Mute Music
    muteButton.addEventListener("click", () => {
      if (GLOBAL_VOLUME) GLOBAL_VOLUME = 0;
      else GLOBAL_VOLUME = 0.2;

      startmusic.volume = GLOBAL_VOLUME;
    });

    //Updates player name with text input
    playerNameInput.addEventListener("change", (e) => {
      const newName = e.target.value || createName();
      playerNameInput.value = newName;
      playerRef.update({
        name: newName,
      });
    });

    //Update player color on button click
    playerColorButton.addEventListener("click", () => {
      const mySkinIndex = playerColors.indexOf(players[playerId].color);
      const nextColor = playerColors[mySkinIndex + 1] || playerColors[0];
      playerRef.update({
        color: nextColor,
      });
    });

    playerTopButton.addEventListener("click", () => {
      handleArrowPress(0, -1);
    });

    playerLeftButton.addEventListener("click", () => {
      handleArrowPress(-1, 0);
    });

    playerRightButton.addEventListener("click", () => {
      handleArrowPress(1, 0);
    });

    playerDownButton.addEventListener("click", () => {
      handleArrowPress(0, 1);
    });

    playerLeftSkill.addEventListener("click", () => {
      const key = getKeyString(players[playerId].x, players[playerId].y);
      if (cells[key]) {
        // Remove this key from data, then uptick Player's coin count
        const cellRef = firebase.database().ref(`cells/${key}`);
        cellRef.once("value").then(function (snapshot) {
          n = snapshot.val().life - changeLife(snapshot.val().life);
          cellRef.update({
            life: n,
          });
        });
      }
    });

    playerRightSkill.addEventListener("click", () => {
      //IMPLEMENT SOW
      if (players[playerId].life < 33) {
        return;
      }
      changeLife(-33);
      addLiveValue(players[playerId].x, players[playerId].y, 3);
      addLiveValue(players[playerId].x, players[playerId].y - 1, 3);
      addLiveValue(players[playerId].x, players[playerId].y + 1, 3);
      addLiveValue(players[playerId].x + 1, players[playerId].y, 3);
      addLiveValue(players[playerId].x + 1, players[playerId].y + 1, 3);
      addLiveValue(players[playerId].x + 1, players[playerId].y - 1, 3);
      addLiveValue(players[playerId].x - 1, players[playerId].y + 1, 3);
      addLiveValue(players[playerId].x - 1, players[playerId].y - 1, 3);
      addLiveValue(players[playerId].x - 1, players[playerId].y, 3);
    });

    playerDownSkill.addEventListener("click", () => {
      if (players[playerId].life < 50) {
        return;
      }
      changeXp(50);
      changeLife(-50);
    });

    function GetSafeLocation() {
      while (true) {
        const { x, y } = getRandomSafeSpot();
        if (!(playerpos[(x + 1) * 100 + y] == 1 ||
          playerpos[(x - 1) * 100 + y] == 1 ||
          playerpos[x * 100 + y + 1] == 1 ||
          playerpos[(x + 1) * 100 + y - 1] == 1 ||
          playerpos[(x - 1) * 100 + y + 1] == 1 ||
          playerpos[(x - 1) * 100 + y + 1] == 1 ||
          playerpos[(x - 1) * 100 + y - 1] == 1 ||
          playerpos[x * 100 + y - 1] == 1 ||
          playerpos[x * 100 + y + 1] == 1 ||
          playerpos[x * 100 + y] == 1)
        ) {
          return { x: x, y: y };
        }
      }
    }

    //DUEL
    playerFightSkill.addEventListener("click", () => {
      let duels = checkEnvolvedPlayers();
      let percentage = 50;

      Object.keys(duels).forEach((key) => {
        let playerRefTemp = firebase.database().ref(`players/${duels[key]}`);
        const { x, y } = GetSafeLocation();
        let random = Math.floor(Math.random() * 100) + 1;
        if (random < percentage) {
          playerRefTemp.update({
            life: players[duels[key]].life - 50,
            x: x,
            y: y,
          });
        } else {
          playerRef.update({
            life: players[playerId].life - 50,
          });
          playerRefTemp.update({
            x: x,
            y: y,
          });
        }
      });
      const { x, y } = GetSafeLocation();
      playerRef.update({
        x: x,
        y: y,
      });
    });

    //Flee
    playerFleeSkill.addEventListener("click", () => {
      let duels = checkEnvolvedPlayers();
      let percentage = 20;
      const { x, y } = GetSafeLocation();
      let random = Math.floor(Math.random() * 100) + 1;
      if (random < percentage) {
        playerRef.update({
          x: x,
          y: y,
        });
      } else {
        playerRef.update({
          life: players[playerId].life - 20,
          x: x,
          y: y,
        });
      }
      Object.keys(duels).forEach((key) => {
        let playerRefTemp = firebase.database().ref(`players/${duels[key]}`);
        playerRefTemp.update({
        });
      })
    })

    //Steal
    playerStealSkill.addEventListener("click", () => {
      let duels = checkEnvolvedPlayers();
      let percentage = 25;
      const { x, y } = GetSafeLocation();
      let random = Math.floor(Math.random() * 100) + 1;
      if (random < percentage) {
        console.log("success");
        playerRef.update({
          x: x,
          y: y,
          life: players[playerId].life + 25,
        });
        Object.keys(duels).forEach((key) => {
          const { x, y } = GetSafeLocation();
          let playerRefTemp = firebase.database().ref(`players/${duels[key]}`);
          playerRefTemp.update({
            x: x,
            y: y,
            life: players[duels[key]].life - 25,
          });
        })
      } else {
        console.log("lost");
        playerRef.update({
          x: x,
          y: y,
          life: players[playerId].life - 100,
        });
      }

    })

    playerShareSkill.addEventListener("click", () => {
      let duels = checkEnvolvedPlayers();
      Object.keys(duels).forEach((key) => {
        players[duels[key]].life = Math.floor(players[playerId].life / 2 + players[duels[key]].life / 2)
        const { x, y } = GetSafeLocation();
        let playerRefTemp = firebase.database().ref(`players/${duels[key]}`);
        playerRefTemp.update({
          x: x,
          y: y,
          life: players[duels[key]].life,
        });
      })
      const { x, y } = GetSafeLocation();
      playerRef.update({
        x: x,
        y: y,
        life: players[duels[key]].life,
      });
    })

    damage();
    SetCellLife();
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      //You're logged in!
      playerId = user.uid;
      playerRef = firebase.database().ref(`players/${playerId}`);

      const name = createName();
      playerNameInput.value = name;
      playerLife.textContent = 100 + "%";
      playerLifeBar.style.width = 100 + "%";
      playerXp.textContent = 0;
      const { x, y } = getRandomSafeSpot();

      playerRef.set({
        id: playerId,
        name,
        direction: "right",
        color: randomFromArray(playerColors),
        x,
        y,
        life: 100,
        xp: 0,
        duel: false,
      });
      //Remove me from Firebase when I diconnect
      playerRef.onDisconnect().remove();

      //Begin the game now that we are signed in
      while (!gameStarted) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      initGame();
    } else {
      //You're logged out.
    }
  });

  firebase
    .auth()
    .signInAnonymously()
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      // ...
      console.log(errorCode, errorMessage);
    });
})();