"use strict";


/* =========================================================
   CONFIGURATION
   ========================================================= */

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


/* =========================================================
   STATE
   ========================================================= */

const gameState = {

    player: 1,

    turn: 1,

    round: 1,

    players: 2,

    selectedCell: null,

    selectedType: null,

    selectedX: null,

    selectedY: null,

    zoom: GAME_CONFIG.initialZoom
};


/* =========================================================
   DOM
   ========================================================= */

const DOM = {

    game:
        document.getElementById("game"),

    map:
        document.getElementById("map"),

    mapContainer:
        document.getElementById("map-container"),

    radialMenus:
        document.getElementById("radial-menus"),

    octagonGrid:
        document.getElementById("octagon-grid"),

    squareGrid:
        document.getElementById("square-grid"),

    playerValue:
        document.getElementById("player-value"),

    playerNumber:
        document.getElementById("player-number"),

    turnValue:
        document.getElementById("turn-value"),

    roundValue:
        document.getElementById("round-value"),

    playersValue:
        document.getElementById("players-value"),

    cellId:
        document.getElementById("cell-id"),

    cellType:
        document.getElementById("cell-type"),

    cellState:
        document.getElementById("cell-state"),

    positionX:
        document.getElementById("position-x"),

    positionY:
        document.getElementById("position-y"),

    positionPlayer:
        document.getElementById("position-player"),

    systemStatus:
        document.getElementById("system-status"),

    gridValue:
        document.getElementById("grid-value"),

    zoomValue:
        document.getElementById("zoom-value"),

    zoomIn:
        document.getElementById("zoom-in"),

    zoomOut:
        document.getElementById("zoom-out"),

    actionConfirm:
        document.getElementById("action-confirm"),

    actionCancel:
        document.getElementById("action-cancel"),

    actionReset:
        document.getElementById("action-reset")
};


/* =========================================================
   INITIALISATION
   ========================================================= */

function initGame() {

    generateOctagonGrid();

    generateSquareGrid();

    setupEvents();

    updateInterface();

    applyZoom();

    requestAnimationFrame(() => {
        buildRadialMenus();
    });
}


/* =========================================================
   OCTAGON GRID
   ========================================================= */

function generateOctagonGrid() {

    DOM.octagonGrid.innerHTML = "";

    for (
        let row = 0;
        row < GAME_CONFIG.octagonRows;
        row++
    ) {

        const rowElement =
            document.createElement("div");

        rowElement.className =
            "octagon-row";

        if (row % 2 === 1) {
            rowElement.classList.add("offset");
        }

        for (
            let column = 0;
            column < GAME_CONFIG.octagonColumns;
            column++
        ) {

            const cell =
                document.createElement("div");

            cell.className =
                "octagon-cell";

            cell.dataset.row =
                String(row);

            cell.dataset.column =
                String(column);

            cell.dataset.id =
                `O${row + 1}-${column + 1}`;

            cell.innerHTML =
                "";

            rowElement.appendChild(cell);
        }

        DOM.octagonGrid.appendChild(rowElement);
    }
}


/* =========================================================
   SQUARE GRID
   ========================================================= */

function generateSquareGrid() {

    DOM.squareGrid.innerHTML = "";

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

            cell.dataset.row =
                String(row);

            cell.dataset.column =
                String(column);

            DOM.squareGrid.appendChild(cell);
        }
    }
}


/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {

    DOM.octagonGrid.addEventListener(
        "click",
        handleCellClick
    );

    DOM.zoomIn.addEventListener(
        "click",
        () => changeZoom(GAME_CONFIG.zoomStep)
    );

    DOM.zoomOut.addEventListener(
        "click",
        () => changeZoom(-GAME_CONFIG.zoomStep)
    );

    DOM.actionConfirm.addEventListener(
        "click",
        confirmAction
    );

    DOM.actionCancel.addEventListener(
        "click",
        cancelAction
    );

    DOM.actionReset.addEventListener(
        "click",
        resetGame
    );

    window.addEventListener(
        "resize",
        handleResize
    );

    document.querySelectorAll(".menu-sector").forEach(
        sector => {

            sector.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const menu =
                        sector.dataset.menu;

                    activateMenu(menu);
                }
            );
        }
    );
}


/* =========================================================
   CELL SELECTION
   ========================================================= */

function handleCellClick(event) {

    const cell =
        event.target.closest(".octagon-cell");

    if (!cell) {
        return;
    }

    document
        .querySelectorAll(".octagon-cell.selected")
        .forEach(
            element => {
                element.classList.remove("selected");
            }
        );

    cell.classList.add("selected");

    gameState.selectedCell =
        cell.dataset.id;

    gameState.selectedType =
        "OCTAGON";

    gameState.selectedX =
        Number(cell.dataset.column) + 1;

    gameState.selectedY =
        Number(cell.dataset.row) + 1;

    DOM.cellId.textContent =
        gameState.selectedCell;

    DOM.cellType.textContent =
        gameState.selectedType;

    DOM.cellState.textContent =
        "SELECTED";

    DOM.positionX.textContent =
        String(gameState.selectedX);

    DOM.positionY.textContent =
        String(gameState.selectedY);

    DOM.positionPlayer.textContent =
        `P${gameState.player}`;

    DOM.systemStatus.textContent =
        "CELL SELECTED";
}


/* =========================================================
   ACTIONS
   ========================================================= */

function confirmAction() {

    if (!gameState.selectedCell) {

        DOM.systemStatus.textContent =
            "NO CELL";

        DOM.cellState.textContent =
            "EMPTY";

        return;
    }

    DOM.cellState.textContent =
        "CONFIRMED";

    DOM.systemStatus.textContent =
        "ACTION CONFIRMED";

    gameState.turn++;

    if (gameState.turn > 9) {

        gameState.turn = 1;

        gameState.round++;
    }

    updateInterface();
}


function cancelAction() {

    if (!gameState.selectedCell) {

        DOM.systemStatus.textContent =
            "NOTHING TO CANCEL";

        return;
    }

    DOM.cellState.textContent =
        "CANCELLED";

    DOM.systemStatus.textContent =
        "ACTION CANCELLED";
}


function resetGame() {

    document
        .querySelectorAll(".octagon-cell.selected")
        .forEach(
            element => {
                element.classList.remove("selected");
            }
        );

    gameState.selectedCell =
        null;

    gameState.selectedType =
        null;

    gameState.selectedX =
        null;

    gameState.selectedY =
        null;

    gameState.turn =
        1;

    gameState.round =
        1;

    DOM.cellId.textContent =
        "---";

    DOM.cellType.textContent =
        "---";

    DOM.cellState.textContent =
        "READY";

    DOM.positionX.textContent =
        "--";

    DOM.positionY.textContent =
        "--";

    DOM.systemStatus.textContent =
        "READY";

    updateInterface();
}


/* =========================================================
   ZOOM
   ========================================================= */

function changeZoom(amount) {

    gameState.zoom += amount;

    gameState.zoom =
        Math.max(
            GAME_CONFIG.zoomMin,
            Math.min(
                GAME_CONFIG.zoomMax,
                gameState.zoom
            )
        );

    applyZoom();
}


function applyZoom() {

    const scale =
        gameState.zoom / 100;

    DOM.map.style.transform =
        `scale(${scale})`;

    DOM.zoomValue.textContent =
        String(gameState.zoom);

    requestAnimationFrame(() => {
        buildRadialMenus();
    });
}


/* =========================================================
   INTERFACE
   ========================================================= */

function updateInterface() {

    DOM.playerValue.textContent =
        `P${gameState.player}`;

    DOM.playerNumber.textContent =
        `P${gameState.player}`;

    DOM.turnValue.textContent =
        `TURN ${String(gameState.turn).padStart(2, "0")}`;

    DOM.roundValue.textContent =
        `ROUND ${String(gameState.round).padStart(2, "0")}`;

    DOM.playersValue.textContent =
        String(gameState.players).padStart(2, "0");

    DOM.gridValue.textContent =
        `${GAME_CONFIG.octagonRows} × ${GAME_CONFIG.octagonColumns}`;

    DOM.positionPlayer.textContent =
        `P${gameState.player}`;
}


/* =========================================================
   RADIAL GEOMETRY
   ========================================================= */

const MENU_ORDER = [
    "game",
    "cell",
    "action",
    "position",
    "system",
    "grid",
    "map",
    "player"
];


const MENU_ANGLES = {

    game: {
        start: 247.5,
        end: 292.5
    },

    cell: {
        start: 292.5,
        end: 337.5
    },

    action: {
        start: 337.5,
        end: 382.5
    },

    position: {
        start: 22.5,
        end: 67.5
    },

    system: {
        start: 67.5,
        end: 112.5
    },

    grid: {
        start: 112.5,
        end: 157.5
    },

    map: {
        start: 157.5,
        end: 202.5
    },

    player: {
        start: 202.5,
        end: 247.5
    }
};


/* =========================================================
   POLAR POINT
   ========================================================= */

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


/* =========================================================
   RAY / RECTANGLE INTERSECTION
   ========================================================= */

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

    const candidates = [];

    if (dx > 0) {

        candidates.push({
            t: (width - centerX) / dx,
            side: "right"
        });

    } else if (dx < 0) {

        candidates.push({
            t: -centerX / dx,
            side: "left"
        });
    }

    if (dy > 0) {

        candidates.push({
            t: (height - centerY) / dy,
            side: "bottom"
        });

    } else if (dy < 0) {

        candidates.push({
            t: -centerY / dy,
            side: "top"
        });
    }

    const valid =
        candidates
            .filter(candidate => candidate.t > 0)
            .sort(
                (a, b) =>
                    a.t - b.t
            );

    const result =
        valid[0];

    return {

        x:
            centerX +
            dx * result.t,

        y:
            centerY +
            dy * result.t,

        side:
            result.side
    };
}


/* =========================================================
   RECTANGLE PERIMETER
   ========================================================= */

function perimeterDistance(
    point
) {

    const width =
        DOM.game.clientWidth;

    const height =
        DOM.game.clientHeight;

    const epsilon = 1;

    if (Math.abs(point.y) <= epsilon) {
        return point.x;
    }

    if (Math.abs(point.x - width) <= epsilon) {
        return width + point.y;
    }

    if (Math.abs(point.y - height) <= epsilon) {
        return width + height + (width - point.x);
    }

    return (
        width +
        height +
        width +
        (height - point.y)
    );
}


/* =========================================================
   OUTER PATH
   ========================================================= */

function getOuterPathPoints(
    startPoint,
    endPoint,
    startAngle,
    endAngle,
    width,
    height
) {

    const corners = [
        {
            x: 0,
            y: 0,
            angle: 225
        },
        {
            x: width,
            y: 0,
            angle: 315
        },
        {
            x: width,
            y: height,
            angle: 45
        },
        {
            x: 0,
            y: height,
            angle: 135
        }
    ];

    const points = [
        startPoint
    ];

    const normalizedStart =
        ((startAngle % 360) + 360) % 360;

    const normalizedEnd =
        ((endAngle % 360) + 360) % 360;

    let currentAngle =
        normalizedStart;

    for (const corner of corners) {

        let cornerAngle =
            corner.angle;

        if (cornerAngle <= currentAngle) {
            cornerAngle += 360;
        }

        let targetAngle =
            normalizedEnd;

        if (targetAngle <= currentAngle) {
            targetAngle += 360;
        }

        if (
            cornerAngle > currentAngle &&
            cornerAngle < targetAngle
        ) {

            points.push({
                x: corner.x,
                y: corner.y
            });

            currentAngle =
                cornerAngle;
        }
    }

    points.push(endPoint);

    return points;
}


/* =========================================================
   CREATE SECTOR
   ========================================================= */

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
            startAngle,
            endAngle,
            width,
            height
        );

    let path =
        `M ${innerStart.x} ${innerStart.y}`;

    path +=
        ` L ${outerPoints[0].x} ${outerPoints[0].y}`;

    for (
        let i = 1;
        i < outerPoints.length;
        i++
    ) {

        path +=
            ` L ${outerPoints[i].x} ${outerPoints[i].y}`;
    }

    path +=
        ` L ${innerEnd.x} ${innerEnd.y}`;

    path +=
        ` A ${radius} ${radius} 0 0 0 ${innerStart.x} ${innerStart.y}`;

    path +=
        " Z";

    return path;
}


/* =========================================================
   BUILD RADIAL MENUS
   ========================================================= */

function buildRadialMenus() {

    if (!DOM.game || !DOM.map) {
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

    if (
        width <= 0 ||
        height <= 0
    ) {
        return;
    }

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

    MENU_ORDER.forEach(
        menuName => {

            const sector =
                DOM.radialMenus.querySelector(
                    `.menu-sector[data-menu="${menuName}"]`
                );

            if (!sector) {
                return;
            }

            const angles =
                MENU_ANGLES[menuName];

            sector.setAttribute(
                "d",
                createSectorPath(
                    centerX,
                    centerY,
                    radius,
                    angles.start,
                    angles.end,
                    width,
                    height
                )
            );
        }
    );
}


/* =========================================================
   MENU ACTIVATION
   ========================================================= */

function activateMenu(menuName) {

    document
        .querySelectorAll(".radial-content")
        .forEach(
            element => {
                element.classList.remove("active");
            }
        );

    const content =
        document.querySelector(
            `.radial-content[data-menu="${menuName}"]`
        );

    if (content) {
        content.classList.add("active");
    }
}


/* =========================================================
   RESIZE
   ========================================================= */

function handleResize() {

    requestAnimationFrame(() => {

        buildRadialMenus();

        applyZoom();
    });
}


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initGame
    );

} else {

    initGame
        ();
}