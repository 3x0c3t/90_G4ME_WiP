"use strict";

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

const gameState = {
    player: 1,
    turn: 1,
    round: 1,
    players: 2,
    selectedCell: null,
    selectedType: null,
    zoom: GAME_CONFIG.initialZoom
};

const DOM = {};

function getElements() {
    DOM.game = document.getElementById("game");
    DOM.radialMenus = document.getElementById("radial-menus");
    DOM.map = document.getElementById("map");
    DOM.octagonGrid = document.getElementById("octagon-grid");
    DOM.squareGrid = document.getElementById("square-grid");

    DOM.reset = document.getElementById("reset-game");
    DOM.menu = document.getElementById("open-menu");

    DOM.zoomIn = document.getElementById("zoom-in");
    DOM.zoomOut = document.getElementById("zoom-out");

    DOM.confirm = document.getElementById("confirm-action");
    DOM.cancel = document.getElementById("cancel-action");

    DOM.playerValue = document.getElementById("player-value");
    DOM.playerInfo = document.getElementById("player-info");

    DOM.turnValue = document.getElementById("turn-value");
    DOM.roundValue = document.getElementById("round-value");

    DOM.cellValue = document.getElementById("cell-value");
    DOM.cellInfo = document.getElementById("cell-info");

    DOM.positionValue = document.getElementById("position-value");
    DOM.positionInfo = document.getElementById("position-info");

    DOM.gridValue = document.getElementById("grid-value");

    DOM.systemStatus = document.getElementById("system-status");
    DOM.systemMessage = document.getElementById("system-message");

    DOM.zoomValue = document.getElementById("zoom-value");
    DOM.footerStatus = document.getElementById("footer-status");
}

function initGame() {
    getElements();

    generateOctagonGrid();
    generateSquareGrid();

    setupEvents();

    updateInterface();
    applyZoom();

    buildRadialMenus();

    setSystemMessage("SYSTEM READY");
}

function setupEvents() {

    if (DOM.reset) {
        DOM.reset.addEventListener(
            "click",
            resetGame
        );
    }

    if (DOM.menu) {
        DOM.menu.addEventListener(
            "click",
            () => {
                setSystemMessage("MENU SYSTEM");
            }
        );
    }

    if (DOM.zoomIn) {
        DOM.zoomIn.addEventListener(
            "click",
            () => {
                changeZoom(GAME_CONFIG.zoomStep);
            }
        );
    }

    if (DOM.zoomOut) {
        DOM.zoomOut.addEventListener(
            "click",
            () => {
                changeZoom(-GAME_CONFIG.zoomStep);
            }
        );
    }

    if (DOM.confirm) {
        DOM.confirm.addEventListener(
            "click",
            confirmSelection
        );
    }

    if (DOM.cancel) {
        DOM.cancel.addEventListener(
            "click",
            clearSelection
        );
    }

    document.addEventListener(
        "keydown",
        handleKeyboard
    );

    window.addEventListener(
        "resize",
        () => {
            requestAnimationFrame(
                buildRadialMenus
            );
        }
    );

    document
        .querySelectorAll(".menu-sector")
        .forEach(
            sector => {

                sector.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        activateMenu(
                            sector.dataset.menu
                        );
                    }
                );
            }
        );
}

function handleKeyboard(event) {

    if (
        event.key === "+" ||
        event.key === "="
    ) {
        changeZoom(
            GAME_CONFIG.zoomStep
        );
    }

    if (event.key === "-") {
        changeZoom(
            -GAME_CONFIG.zoomStep
        );
    }

    if (event.key === "Escape") {
        clearSelection();
    }

    if (
        event.key === "Enter" &&
        gameState.selectedCell
    ) {
        confirmSelection();
    }
}

function generateOctagonGrid() {

    DOM.octagonGrid.innerHTML = "";

    const size =
        GAME_CONFIG.octagonSize;

    const totalWidth =
        GAME_CONFIG.octagonColumns * size;

    const totalHeight =
        GAME_CONFIG.octagonRows * size;

    const startX =
        -totalWidth / 2 +
        size / 2;

    const startY =
        -totalHeight / 2 +
        size / 2;

    for (
        let row = 0;
        row < GAME_CONFIG.octagonRows;
        row++
    ) {

        for (
            let column = 0;
            column < GAME_CONFIG.octagonColumns;
            column++
        ) {

            const cell =
                document.createElement("div");

            cell.className =
                "octagon-cell";

            const offsetX =
                row % 2 === 0
                    ? 0
                    : size / 2;

            const x =
                startX +
                column * size +
                offsetX;

            const y =
                startY +
                row * size;

            cell.style.left =
                `calc(50% + ${x}px - ${size / 2}px)`;

            cell.style.top =
                `calc(50% + ${y}px - ${size / 2}px)`;

            const coordinate =
                `${String.fromCharCode(65 + column)}${row + 1}`;

            cell.dataset.row =
                row + 1;

            cell.dataset.column =
                column + 1;

            cell.dataset.type =
                "octagon";

            cell.dataset.coordinate =
                coordinate;

            const label =
                document.createElement("span");

            label.className =
                "cell-coordinate";

            label.textContent =
                coordinate;

            cell.appendChild(label);

            cell.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    selectCell(
                        cell,
                        "octagon"
                    );
                }
            );

            DOM.octagonGrid.appendChild(
                cell
            );
        }
    }
}

function generateSquareGrid() {

    DOM.squareGrid.innerHTML = "";

    const size =
        GAME_CONFIG.squareSize;

    const spacing =
        size + 4;

    const totalWidth =
        (GAME_CONFIG.squareColumns - 1) *
        spacing;

    const totalHeight =
        (GAME_CONFIG.squareRows - 1) *
        spacing;

    const startX =
        -totalWidth / 2;

    const startY =
        -totalHeight / 2;

    for (
        let row = 0;
        row < GAME_CONFIG.squareRows;
        row++
    ) {

        for (
            let column = 0;
            column < GAME_CONFIG.squareColumns;
            column++
        ) {

            const cell =
                document.createElement("div");

            cell.className =
                "square-cell";

            const x =
                startX +
                column * spacing;

            const y =
                startY +
                row * spacing;

            cell.style.left =
                `calc(50% + ${x}px - ${size / 2}px)`;

            cell.style.top =
                `calc(50% + ${y}px - ${size / 2}px)`;

            const coordinate =
                `${column + 1}:${row + 1}`;

            cell.dataset.row =
                row + 1;

            cell.dataset.column =
                column + 1;

            cell.dataset.type =
                "square";

            cell.dataset.coordinate =
                coordinate;

            const label =
                document.createElement("span");

            label.className =
                "cell-coordinate";

            label.textContent =
                coordinate;

            cell.appendChild(label);

            cell.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    selectCell(
                        cell,
                        "square"
                    );
                }
            );

            DOM.squareGrid.appendChild(
                cell
            );
        }
    }
}

function selectCell(cell, type) {

    document
        .querySelectorAll(
            ".octagon-cell.selected, .square-cell.selected"
        )
        .forEach(
            selected => {
                selected.classList.remove(
                    "selected"
                );
            }
        );

    cell.classList.add("selected");

    gameState.selectedCell =
        cell.dataset.coordinate;

    gameState.selectedType =
        type;

    DOM.cellValue.textContent =
        gameState.selectedCell;

    DOM.cellInfo.textContent =
        type.toUpperCase();

    DOM.positionValue.textContent =
        `R${cell.dataset.row} C${cell.dataset.column}`;

    DOM.positionInfo.textContent =
        `${type.toUpperCase()} CELL`;

    DOM.confirm.disabled =
        false;

    DOM.cancel.disabled =
        false;

    setSystemMessage(
        `CELL ${gameState.selectedCell} SELECTED`
    );
}

function clearSelection() {

    document
        .querySelectorAll(
            ".octagon-cell.selected, .square-cell.selected"
        )
        .forEach(
            cell => {
                cell.classList.remove(
                    "selected"
                );
            }
        );

    gameState.selectedCell =
        null;

    gameState.selectedType =
        null;

    DOM.cellValue.textContent =
        "--";

    DOM.cellInfo.textContent =
        "NO SELECTION";

    DOM.positionValue.textContent =
        "--";

    DOM.positionInfo.textContent =
        "NO POSITION";

    DOM.confirm.disabled =
        true;

    DOM.cancel.disabled =
        true;

    setSystemMessage(
        "SELECTION CLEARED"
    );
}

function confirmSelection() {

    if (!gameState.selectedCell) {
        return;
    }

    setSystemMessage(
        `ACTION CONFIRMED : ${gameState.selectedCell}`
    );

    gameState.turn++;

    updateInterface();
}

function changeZoom(amount) {

    gameState.zoom += amount;

    if (
        gameState.zoom <
        GAME_CONFIG.zoomMin
    ) {
        gameState.zoom =
            GAME_CONFIG.zoomMin;
    }

    if (
        gameState.zoom >
        GAME_CONFIG.zoomMax
    ) {
        gameState.zoom =
            GAME_CONFIG.zoomMax;
    }

    applyZoom();
}

function applyZoom() {

    const scale =
        gameState.zoom / 100;

    DOM.octagonGrid.style.transform =
        `scale(${scale})`;

    DOM.squareGrid.style.transform =
        `scale(${scale})`;

    DOM.zoomValue.textContent =
        `${gameState.zoom}%`;
}

function updateInterface() {

    DOM.playerValue.textContent =
        `P${gameState.player}`;

    DOM.playerInfo.textContent =
        `PLAYER ${String(gameState.player).padStart(2, "0")}`;

    DOM.turnValue.textContent =
        `TURN ${String(gameState.turn).padStart(2, "0")}`;

    DOM.roundValue.textContent =
        `ROUND ${String(gameState.round).padStart(2, "0")}`;

    DOM.gridValue.textContent =
        `${GAME_CONFIG.octagonRows} × ${GAME_CONFIG.octagonColumns}`;

    DOM.systemStatus.textContent =
        "READY";
}

function setSystemMessage(message) {

    DOM.systemMessage.textContent =
        message;

    DOM.footerStatus.textContent =
        message;
}

function resetGame() {

    gameState.player = 1;
    gameState.turn = 1;
    gameState.round = 1;

    gameState.selectedCell = null;
    gameState.selectedType = null;

    gameState.zoom =
        GAME_CONFIG.initialZoom;

    document
        .querySelectorAll(
            ".octagon-cell.selected, .square-cell.selected"
        )
        .forEach(
            cell => {
                cell.classList.remove(
                    "selected"
                );
            }
        );

    DOM.cellValue.textContent =
        "--";

    DOM.cellInfo.textContent =
        "NO SELECTION";

    DOM.positionValue.textContent =
        "--";

    DOM.positionInfo.textContent =
        "NO POSITION";

    DOM.confirm.disabled =
        true;

    DOM.cancel.disabled =
        true;

    updateInterface();
    applyZoom();

    setSystemMessage(
        "GAME RESET"
    );
}

function activateMenu(menu) {

    document
        .querySelectorAll(".menu-sector")
        .forEach(
            sector => {
                sector.classList.remove(
                    "active"
                );
            }
        );

    const sector =
        document.querySelector(
            `.menu-sector[data-menu="${menu}"]`
        );

    if (sector) {
        sector.classList.add(
            "active"
        );
    }

    setSystemMessage(
        `${menu.toUpperCase()} MENU`
    );
}


/* =====================================================
   RADIAL MENU GEOMETRY
   ===================================================== */

function polarPoint(
    centerX,
    centerY,
    radius,
    angle
) {

    const radians =
        angle * Math.PI / 180;

    return {
        x:
            centerX +
            Math.cos(radians) * radius,

        y:
            centerY +
            Math.sin(radians) * radius
    };
}


function rayToRectangle(
    centerX,
    centerY,
    width,
    height,
    angle
) {

    const radians =
        angle * Math.PI / 180;

    const dx =
        Math.cos(radians);

    const dy =
        Math.sin(radians);

    const distances = [];

    if (dx > 0) {
        distances.push(
            (width - centerX) / dx
        );
    }

    if (dx < 0) {
        distances.push(
            -centerX / dx
        );
    }

    if (dy > 0) {
        distances.push(
            (height - centerY) / dy
        );
    }

    if (dy < 0) {
        distances.push(
            -centerY / dy
        );
    }

    const validDistances =
        distances.filter(
            value =>
                Number.isFinite(value) &&
                value >= 0
        );

    const distance =
        Math.min(...validDistances);

    return {
        x:
            centerX +
            dx * distance,

        y:
            centerY +
            dy * distance
    };
}


function getOuterPathPoints(
    start,
    end,
    width,
    height
) {

    const EPSILON = 3;

    const startTop =
        Math.abs(start.y) <= EPSILON;

    const startRight =
        Math.abs(start.x - width) <= EPSILON;

    const startBottom =
        Math.abs(start.y - height) <= EPSILON;

    const startLeft =
        Math.abs(start.x) <= EPSILON;

    const endTop =
        Math.abs(end.y) <= EPSILON;

    const endRight =
        Math.abs(end.x - width) <= EPSILON;

    const endBottom =
        Math.abs(end.y - height) <= EPSILON;

    const endLeft =
        Math.abs(end.x) <= EPSILON;


    if (
        startTop &&
        endTop
    ) {
        return [end];
    }

    if (
        startRight &&
        endRight
    ) {
        return [end];
    }

    if (
        startBottom &&
        endBottom
    ) {
        return [end];
    }

    if (
        startLeft &&
        endLeft
    ) {
        return [end];
    }


    if (
        startTop &&
        endRight
    ) {
        return [
            {
                x: width,
                y: 0
            },
            end
        ];
    }


    if (
        startRight &&
        endBottom
    ) {
        return [
            {
                x: width,
                y: height
            },
            end
        ];
    }


    if (
        startBottom &&
        endLeft
    ) {
        return [
            {
                x: 0,
                y: height
            },
            end
        ];
    }


    if (
        startLeft &&
        endTop
    ) {
        return [
            {
                x: 0,
                y: 0
            },
            end
        ];
    }


    return [end];
}


function createSectorPath(
    centerX,
    centerY,
    radius,
    startAngle,
    endAngle,
    width,
    height
) {

    const innerStart =
        polarPoint(
            centerX,
            centerY,
            radius,
            startAngle
        );

    const innerEnd =
        polarPoint(
            centerX,
            centerY,
            radius,
            endAngle
        );

    const outerStart =
        rayToRectangle(
            centerX,
            centerY,
            width,
            height,
            startAngle
        );

    const outerEnd =
        rayToRectangle(
            centerX,
            centerY,
            width,
            height,
            endAngle
        );

    const outerPoints =
        getOuterPathPoints(
            outerStart,
            outerEnd,
            width,
            height
        );

    let path =
        `M ${innerStart.x} ${innerStart.y}`;

    path +=
        ` L ${outerStart.x} ${outerStart.y}`;

    outerPoints.forEach(
        point => {
            path +=
                ` L ${point.x} ${point.y}`;
        }
    );

    path +=
        ` L ${innerEnd.x} ${innerEnd.y}`;

    path +=
        ` A ${radius} ${radius} 0 0 1 ${innerStart.x} ${innerStart.y}`;

    path +=
        " Z";

    return path;
}


function buildRadialMenus() {

    if (
        !DOM.game ||
        !DOM.map ||
        !DOM.radialMenus
    ) {
        return;
    }

    const gameRect =
        DOM.game.getBoundingClientRect();

    const mapRect =
        DOM.map.getBoundingClientRect();

    const width =
        gameRect.width;

    const height =
        gameRect.height;

    const centerX =
        width / 2;

    const centerY =
        height / 2;

    const radius =
        Math.min(
            mapRect.width,
            mapRect.height
        ) / 2;

    DOM.radialMenus.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );

    DOM.radialMenus.setAttribute(
        "width",
        width
    );

    DOM.radialMenus.setAttribute(
        "height",
        height
    );


    /*
    8 secteurs de 45°.

    Les angles sont centrés sur :

    RIGHT        0°
    BOTTOM       90°
    LEFT         180°
    TOP          270°

    Les diagonales sont à 45°.
    */

    const sectors = [

        {
            name: "right",
            start: -22.5,
            end: 22.5
        },

        {
            name: "bottom-right",
            start: 22.5,
            end: 67.5
        },

        {
            name: "bottom",
            start: 67.5,
            end: 112.5
        },

        {
            name: "bottom-left",
            start: 112.5,
            end: 157.5
        },

        {
            name: "left",
            start: 157.5,
            end: 202.5
        },

        {
            name: "top-left",
            start: 202.5,
            end: 247.5
        },

        {
            name: "top",
            start: 247.5,
            end: 292.5
        },

        {
            name: "top-right",
            start: 292.5,
            end: 337.5
        }
    ];


    sectors.forEach(
        sector => {

            const path =
                document.querySelector(
                    `.menu-sector[data-menu="${sector.name}"]`
                );

            if (!path) {
                return;
            }

            const d =
                createSectorPath(
                    centerX,
                    centerY,
                    radius,
                    sector.start,
                    sector.end,
                    width,
                    height
                );

            path.setAttribute(
                "d",
                d
            );
        }
    );
}


document.addEventListener(
    "DOMContentLoaded",
    initGame
);