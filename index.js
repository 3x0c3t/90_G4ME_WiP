/* =============================================================
   90_G4ME_WiP
   Main Game Interface
============================================================= */


/* =============================================================
   CONFIGURATION
============================================================= */

const GAME_CONFIG = {

    octagonRows: 7,
    octagonColumns: 7,

    squareRows: 8,
    squareColumns: 8,

    octagonSize: 52,
    squareSize: 34,

    zoomMin: 70,
    zoomMax: 140,
    zoomStep: 10,

    initialZoom: 100

};


/* =============================================================
   GAME STATE
============================================================= */

const gameState = {

    player: 1,

    turn: 1,

    round: 1,

    players: 2,

    selectedCell: null,

    selectedType: null,

    zoom: GAME_CONFIG.initialZoom

};


/* =============================================================
   DOM
============================================================= */

const DOM = {

    map:
        document.getElementById("map"),

    mapContainer:
        document.getElementById("map-container"),

    octagonGrid:
        document.getElementById("octagon-grid"),

    squareGrid:
        document.getElementById("square-grid"),

    turnValue:
        document.getElementById("turn-value"),

    roundValue:
        document.getElementById("round-value"),

    playersValue:
        document.getElementById("players-value"),

    selectedCell:
        document.getElementById("selected-cell"),

    selectedType:
        document.getElementById("selected-type"),

    octagonCount:
        document.getElementById("octagon-count"),

    squareCount:
        document.getElementById("square-count"),

    positionX:
        document.getElementById("position-x"),

    positionY:
        document.getElementById("position-y"),

    zoomValue:
        document.getElementById("zoom-value"),

    systemMessage:
        document.getElementById("system-message"),

    footerStatus:
        document.getElementById("footer-status"),

    reset:
        document.getElementById("btn-reset"),

    menu:
        document.getElementById("btn-menu"),

    zoomIn:
        document.getElementById("btn-zoom-in"),

    zoomOut:
        document.getElementById("btn-zoom-out"),

    select:
        document.getElementById("btn-select"),

    confirm:
        document.getElementById("btn-confirm"),

    cancel:
        document.getElementById("btn-cancel")

};


/* =============================================================
   INITIALISATION
============================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initGame();

    }
);


/* =============================================================
   INIT GAME
============================================================= */

function initGame() {

    updateInterface();

    generateOctagonGrid();

    generateSquareGrid();

    updateGridCounters();

    setupEvents();

    applyZoom();

    setSystemMessage(
        "SYSTEM READY"
    );

}


/* =============================================================
   EVENTS
============================================================= */

function setupEvents() {

    DOM.reset.addEventListener(
        "click",
        resetGame
    );

    DOM.menu.addEventListener(
        "click",
        () => {

            setSystemMessage(
                "MENU NOT IMPLEMENTED"
            );

        }
    );


    DOM.zoomIn.addEventListener(
        "click",
        () => {

            changeZoom(
                GAME_CONFIG.zoomStep
            );

        }
    );


    DOM.zoomOut.addEventListener(
        "click",
        () => {

            changeZoom(
                -GAME_CONFIG.zoomStep
            );

        }
    );


    DOM.select.addEventListener(
        "click",
        () => {

            setSystemMessage(
                "SELECT MODE"
            );

        }
    );


    DOM.confirm.addEventListener(
        "click",
        () => {

            confirmSelection();

        }
    );


    DOM.cancel.addEventListener(
        "click",
        () => {

            clearSelection();

        }
    );

}


/* =============================================================
   OCTAGON GRID
============================================================= */

function generateOctagonGrid() {

    DOM.octagonGrid.innerHTML = "";

    const rows =
        GAME_CONFIG.octagonRows;

    const columns =
        GAME_CONFIG.octagonColumns;

    const size =
        GAME_CONFIG.octagonSize;

    const totalWidth =
        columns * size;

    const totalHeight =
        rows * size;

    for (
        let row = 0;
        row < rows;
        row++
    ) {

        for (
            let column = 0;
            column < columns;
            column++
        ) {

            const cell =
                document.createElement(
                    "div"
                );

            cell.className =
                "octagon-cell";

            cell.dataset.type =
                "octagon";

            cell.dataset.row =
                row;

            cell.dataset.column =
                column;

            const offsetX =
                column * size;

            const offsetY =
                row * size;

            const stagger =
                row % 2 === 1
                    ? size / 2
                    : 0;

            cell.style.left =
                `${offsetX + stagger}px`;

            cell.style.top =
                `${offsetY}px`;

            cell.addEventListener(
                "click",
                handleCellClick
            );

            DOM.octagonGrid.appendChild(
                cell
            );

        }

    }

    centerGrid(
        DOM.octagonGrid,
        totalWidth + size / 2,
        totalHeight
    );

}


/* =============================================================
   SQUARE GRID
============================================================= */

function generateSquareGrid() {

    DOM.squareGrid.innerHTML = "";

    const rows =
        GAME_CONFIG.squareRows;

    const columns =
        GAME_CONFIG.squareColumns;

    const size =
        GAME_CONFIG.squareSize;

    const spacing =
        size + 4;

    const totalWidth =
        columns * spacing;

    const totalHeight =
        rows * spacing;

    for (
        let row = 0;
        row < rows;
        row++
    ) {

        for (
            let column = 0;
            column < columns;
            column++
        ) {

            const cell =
                document.createElement(
                    "div"
                );

            cell.className =
                "square-cell";

            cell.dataset.type =
                "square";

            cell.dataset.row =
                row;

            cell.dataset.column =
                column;

            const offsetX =
                column * spacing;

            const offsetY =
                row * spacing;

            const stagger =
                column % 2 === 1
                    ? spacing / 2
                    : 0;

            cell.style.left =
                `${offsetX + stagger}px`;

            cell.style.top =
                `${offsetY}px`;

            cell.addEventListener(
                "click",
                handleCellClick
            );

            DOM.squareGrid.appendChild(
                cell
            );

        }

    }

    centerGrid(
        DOM.squareGrid,
        totalWidth + spacing / 2,
        totalHeight
    );

}


/* =============================================================
   CENTER GRID
============================================================= */

function centerGrid(
    grid,
    width,
    height
) {

    grid.style.width =
        `${width}px`;

    grid.style.height =
        `${height}px`;

    grid.style.left =
        "50%";

    grid.style.top =
        "50%";

    grid.style.transform =
        "translate(-50%, -50%)";

}


/* =============================================================
   CELL CLICK
============================================================= */

function handleCellClick(event) {

    event.stopPropagation();

    const cell =
        event.currentTarget;

    clearCellClasses();

    cell.classList.add(
        "selected"
    );

    const type =
        cell.dataset.type;

    const row =
        Number(
            cell.dataset.row
        );

    const column =
        Number(
            cell.dataset.column
        );

    gameState.selectedCell =
        `${column}:${row}`;

    gameState.selectedType =
        type;

    updateSelectedCell(
        cell
    );

    setSystemMessage(
        `${type.toUpperCase()} CELL SELECTED`
    );

}


/* =============================================================
   SELECTED CELL
============================================================= */

function updateSelectedCell(
    cell
) {

    const row =
        Number(
            cell.dataset.row
        );

    const column =
        Number(
            cell.dataset.column
        );

    DOM.selectedCell.textContent =
        `${column}:${row}`;

    DOM.selectedType.textContent =
        cell.dataset.type.toUpperCase();

    DOM.positionX.textContent =
        column;

    DOM.positionY.textContent =
        row;

}


/* =============================================================
   CLEAR SELECTION
============================================================= */

function clearSelection() {

    clearCellClasses();

    gameState.selectedCell =
        null;

    gameState.selectedType =
        null;

    DOM.selectedCell.textContent =
        "---";

    DOM.selectedType.textContent =
        "---";

    DOM.positionX.textContent =
        "---";

    DOM.positionY.textContent =
        "---";

    setSystemMessage(
        "SELECTION CLEARED"
    );

}


/* =============================================================
   CLEAR CELL CLASSES
============================================================= */

function clearCellClasses() {

    const selected =
        document.querySelectorAll(
            ".selected"
        );

    selected.forEach(
        cell => {

            cell.classList.remove(
                "selected"
            );

        }
    );

}


/* =============================================================
   CONFIRM SELECTION
============================================================= */

function confirmSelection() {

    if (
        !gameState.selectedCell
    ) {

        setSystemMessage(
            "NO CELL SELECTED"
        );

        return;

    }

    setSystemMessage(
        `CELL ${gameState.selectedCell} CONFIRMED`
    );

}


/* =============================================================
   ZOOM
============================================================= */

function changeZoom(
    amount
) {

    gameState.zoom += amount;

    if (
        gameState.zoom >
        GAME_CONFIG.zoomMax
    ) {

        gameState.zoom =
            GAME_CONFIG.zoomMax;

    }

    if (
        gameState.zoom <
        GAME_CONFIG.zoomMin
    ) {

        gameState.zoom =
            GAME_CONFIG.zoomMin;

    }

    applyZoom();

}


/* =============================================================
   APPLY ZOOM
============================================================= */

function applyZoom() {

    const scale =
        gameState.zoom / 100;

    DOM.octagonGrid.style.transform =
        `translate(-50%, -50%) scale(${scale})`;

    DOM.squareGrid.style.transform =
        `translate(-50%, -50%) scale(${scale})`;

    DOM.zoomValue.textContent =
        gameState.zoom;

}


/* =============================================================
   RESET
============================================================= */

function resetGame() {

    gameState.player =
        1;

    gameState.turn =
        1;

    gameState.round =
        1;

    gameState.selectedCell =
        null;

    gameState.selectedType =
        null;

    gameState.zoom =
        GAME_CONFIG.initialZoom;

    clearSelection();

    updateInterface();

    applyZoom();

    setSystemMessage(
        "GAME RESET"
    );

}


/* =============================================================
   UPDATE INTERFACE
============================================================= */

function updateInterface() {

    DOM.turnValue.textContent =
        String(
            gameState.turn
        ).padStart(
            2,
            "0"
        );

    DOM.roundValue.textContent =
        String(
            gameState.round
        ).padStart(
            2,
            "0"
        );

    DOM.playersValue.textContent =
        String(
            gameState.players
        ).padStart(
            2,
            "0"
        );

}


/* =============================================================
   GRID COUNTERS
============================================================= */

function updateGridCounters() {

    const octagons =
        document.querySelectorAll(
            ".octagon-cell"
        );

    const squares =
        document.querySelectorAll(
            ".square-cell"
        );

    DOM.octagonCount.textContent =
        octagons.length;

    DOM.squareCount.textContent =
        squares.length;

}


/* =============================================================
   SYSTEM MESSAGE
============================================================= */

function setSystemMessage(
    message
) {

    DOM.systemMessage.textContent =
        message;

}


/* =============================================================
   MAP CLICK
============================================================= */

DOM.map.addEventListener(
    "click",
    event => {

        if (
            event.target === DOM.map
        ) {

            clearSelection();

        }

    }
);


/* =============================================================
   KEYBOARD
============================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "+"
            ||
            event.key === "="
        ) {

            changeZoom(
                GAME_CONFIG.zoomStep
            );

        }


        if (
            event.key === "-"
        ) {

            changeZoom(
                -GAME_CONFIG.zoomStep
            );

        }


        if (
            event.key === "Escape"
        ) {

            clearSelection();

        }


        if (
            event.key === "Enter"
        ) {

            confirmSelection();

        }

    }
);


/* =============================================================
   DEBUG
============================================================= */

console.log(
    "90_G4ME_WiP initialized"
);

console.log(
    "Game state:",
    gameState
);