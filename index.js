"use strict";


/* =========================================================
   DOM
   ========================================================= */

const DOM = {

    radialInterface:
        document.getElementById(
            "radial-interface"
        ),

    svg:
        document.getElementById(
            "radial-interface-svg"
        ),

    sectorLines:
        document.getElementById(
            "menu-sector-lines"
        ),

    mapCircleLayer:
        document.getElementById(
            "map-circle-layer"
        ),

    titleCircleLayer:
        document.getElementById(
            "title-circle-layer"
        ),

    titleLayer:
        document.getElementById(
            "menu-title-layer"
        ),

    map:
        document.getElementById(
            "map"
        ),

    octagonGrid:
        document.getElementById(
            "octagon-grid"
        ),

    squareGrid:
        document.getElementById(
            "square-grid"
        ),

    turnValue:
        document.getElementById(
            "turn-value"
        ),

    roundValue:
        document.getElementById(
            "round-value"
        ),

    playersValue:
        document.getElementById(
            "players-value"
        ),

    selectedCell:
        document.getElementById(
            "selected-cell"
        ),

    selectedType:
        document.getElementById(
            "selected-type"
        ),

    positionX:
        document.getElementById(
            "position-x"
        ),

    positionY:
        document.getElementById(
            "position-y"
        ),

    systemMessage:
        document.getElementById(
            "system-message"
        ),

    zoomValue:
        document.getElementById(
            "zoom-value"
        ),

    playerName:
        document.getElementById(
            "player-name"
        ),

    btnReset:
        document.getElementById(
            "btn-reset"
        ),

    btnMenu:
        document.getElementById(
            "btn-menu"
        ),

    btnSelect:
        document.getElementById(
            "btn-select"
        ),

    btnConfirm:
        document.getElementById(
            "btn-confirm"
        ),

    btnCancel:
        document.getElementById(
            "btn-cancel"
        ),

    btnZoomIn:
        document.getElementById(
            "btn-zoom-in"
        ),

    btnZoomOut:
        document.getElementById(
            "btn-zoom-out"
        )

};


/* =========================================================
   ETAT
   ========================================================= */

const GAME_STATE = {

    player: 1,

    turn: 1,

    round: 1,

    players: 2,

    selectedCell: null,

    selectedX: null,

    selectedY: null,

    zoom: 100,

    menuOpen: true

};


/* =========================================================
   MENUS
   ========================================================= */

const MENUS = [

    {
        label: "GAME",
        angle: -90
    },

    {
        label: "CELL",
        angle: -45
    },

    {
        label: "ACTION",
        angle: 0
    },

    {
        label: "POSITION",
        angle: 45
    },

    {
        label: "SYSTEM",
        angle: 90
    },

    {
        label: "GRID",
        angle: 135
    },

    {
        label: "MAP",
        angle: 180
    },

    {
        label: "PLAYER",
        angle: 225
    }

];


const SVG_NS =
    "http://www.w3.org/2000/svg";


/* =========================================================
   GEOMETRIE
   ========================================================= */

const MAP_RADIUS_RATIO =
    0.25;


const MAP_RING_GAP =
    13;


const TITLE_RING_GAP =
    32;


const TITLE_ARC_HALF =
    13;


/* =========================================================
   SVG
   ========================================================= */

function svgElement(
    name,
    attributes = {}
) {

    const element =
        document.createElementNS(
            SVG_NS,
            name
        );


    Object.entries(
        attributes
    ).forEach(
        ([key, value]) => {

            element.setAttribute(
                key,
                value
            );

        }
    );


    return element;

}


/* =========================================================
   POINT POLAIRE
   ========================================================= */

function polarPoint(
    cx,
    cy,
    radius,
    angle
) {

    const rad =
        angle *
        Math.PI /
        180;


    return {

        x:
            cx +
            Math.cos(rad) *
            radius,

        y:
            cy +
            Math.sin(rad) *
            radius

    };

}


/* =========================================================
   INTERSECTION AVEC LE BORD
   ========================================================= */

function rayToScreen(
    cx,
    cy,
    angle,
    width,
    height
) {

    const rad =
        angle *
        Math.PI /
        180;


    const dx =
        Math.cos(rad);


    const dy =
        Math.sin(rad);


    const distances = [];


    if (dx > 0) {

        distances.push(
            (width - cx) / dx
        );

    }


    if (dx < 0) {

        distances.push(
            -cx / dx
        );

    }


    if (dy > 0) {

        distances.push(
            (height - cy) / dy
        );

    }


    if (dy < 0) {

        distances.push(
            -cy / dy
        );

    }


    const valid =
        distances.filter(
            value =>
                Number.isFinite(value) &&
                value > 0
        );


    const distance =
        Math.min(
            ...valid
        );


    return {

        x:
            cx +
            dx *
            distance,

        y:
            cy +
            dy *
            distance

    };

}


/* =========================================================
   CREATION DES CERCLES
   ========================================================= */

function drawCircles(
    cx,
    cy,
    mapRadius
) {

    DOM.mapCircleLayer.innerHTML =
        "";

    DOM.titleCircleLayer.innerHTML =
        "";


    /*
       CERCLE 1
       juste autour de la MAP
    */

    const mapRingRadius =
        mapRadius +
        MAP_RING_GAP;


    const mapRing =
        svgElement(
            "circle",
            {

                class:
                    "map-circle",

                cx:
                    cx,

                cy:
                    cy,

                r:
                    mapRingRadius

            }
        );


    DOM.mapCircleLayer.appendChild(
        mapRing
    );


    /*
       Petit anneau secondaire
    */

    const secondaryRing =
        svgElement(
            "circle",
            {

                class:
                    "map-circle-secondary",

                cx:
                    cx,

                cy:
                    cy,

                r:
                    mapRadius + 5

            }
        );


    DOM.mapCircleLayer.appendChild(
        secondaryRing
    );


    /*
       CERCLE 2
       cercle exact des titres
    */

    const titleRadius =
        mapRingRadius +
        TITLE_RING_GAP;


    const titleRing =
        svgElement(
            "circle",
            {

                class:
                    "title-circle",

                cx:
                    cx,

                cy:
                    cy,

                r:
                    titleRadius

            }
        );


    DOM.titleCircleLayer.appendChild(
        titleRing
    );


    return titleRadius;

}


/* =========================================================
   RAYONS
   ========================================================= */

function drawSectorLines(
    cx,
    cy,
    mapRadius,
    width,
    height
) {

    DOM.sectorLines.innerHTML =
        "";


    /*
       Les lignes commencent au cercle
       autour de la MAP.
    */

    const startRadius =
        mapRadius +
        MAP_RING_GAP;


    MENUS.forEach(
        menu => {

            const start =
                polarPoint(
                    cx,
                    cy,
                    startRadius,
                    menu.angle
                );


            const end =
                rayToScreen(
                    cx,
                    cy,
                    menu.angle,
                    width,
                    height
                );


            const line =
                svgElement(
                    "line",
                    {

                        class:
                            "menu-sector-line",

                        x1:
                            start.x,

                        y1:
                            start.y,

                        x2:
                            end.x,

                        y2:
                            end.y

                    }
                );


            DOM.sectorLines.appendChild(
                line
            );

        }
    );

}


/* =========================================================
   TITRES SUR LE CERCLE
   ========================================================= */

function drawTitles(
    cx,
    cy,
    titleRadius
) {

    DOM.titleLayer.innerHTML =
        "";


    MENUS.forEach(
        (
            menu,
            index
        ) => {

            const center =
                menu.angle;


            let startAngle =
                center -
                TITLE_ARC_HALF;


            let endAngle =
                center +
                TITLE_ARC_HALF;


            /*
               Pour la moitié inférieure,
               le chemin est inversé afin
               que le texte reste lisible.
            */

            const normalized =
                (
                    center + 360
                ) % 360;


            let sweep =
                1;


            if (
                normalized >= 0 &&
                normalized < 180
            ) {

                const temp =
                    startAngle;

                startAngle =
                    endAngle;

                endAngle =
                    temp;

                sweep =
                    0;

            }


            const start =
                polarPoint(
                    cx,
                    cy,
                    titleRadius,
                    startAngle
                );


            const end =
                polarPoint(
                    cx,
                    cy,
                    titleRadius,
                    endAngle
                );


            const pathId =
                `titleArc${index}`;


            const path =
                svgElement(
                    "path",
                    {

                        id:
                            pathId,

                        class:
                            "menu-title-arc",

                        d:
                            [
                                "M",
                                start.x,
                                start.y,

                                "A",
                                titleRadius,
                                titleRadius,

                                0,
                                0,
                                sweep,

                                end.x,
                                end.y

                            ].join(" ")

                    }
                );


            DOM.titleLayer.appendChild(
                path
            );


            const text =
                svgElement(
                    "text",
                    {

                        class:
                            "menu-title",

                        "text-anchor":
                            "middle"

                    }
                );


            const textPath =
                svgElement(
                    "textPath",
                    {

                        href:
                            `#${pathId}`,

                        startOffset:
                            "50%"

                    }
                );


            textPath.textContent =
                menu.label;


            text.appendChild(
                textPath
            );


            DOM.titleLayer.appendChild(
                text
            );

        }
    );

}


/* =========================================================
   INTERFACE RADIALE
   ========================================================= */

function drawRadialInterface() {

    /*
       IMPORTANT :
       on récupère le rectangle du CONTENEUR COMMUN,
       pas celui du SVG.

       Ainsi la MAP et les cercles utilisent
       exactement le même centre.
    */

    const rect =
        DOM.radialInterface.getBoundingClientRect();


    const width =
        rect.width;


    const height =
        rect.height;


    if (
        width <= 0 ||
        height <= 0
    ) {

        return;

    }


    /*
       CENTRE UNIQUE
    */

    const cx =
        width / 2;


    const cy =
        height / 2;


    /*
       Rayon MAP
    */

    const mapRadius =
        Math.min(
            width,
            height
        ) *
        MAP_RADIUS_RATIO;


    /*
       Le SVG possède exactement
       les dimensions du conteneur.
    */

    DOM.svg.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );


    /*
       MAP
       ↓
       cercle MAP
       ↓
       cercle titres
    */

    const titleRadius =
        drawCircles(
            cx,
            cy,
            mapRadius
        );


    /*
       Séparations
    */

    drawSectorLines(
        cx,
        cy,
        mapRadius,
        width,
        height
    );


    /*
       Titres
    */

    drawTitles(
        cx,
        cy,
        titleRadius
    );

}


/* =========================================================
   GRILLE OCTOGONALE
   ========================================================= */

function createOctagonGrid() {

    DOM.octagonGrid.innerHTML =
        "";


    for (
        let y = 0;
        y < 7;
        y++
    ) {

        for (
            let x = 0;
            x < 7;
            x++
        ) {

            const cell =
                document.createElement(
                    "div"
                );


            cell.className =
                "octagon-cell";


            cell.dataset.x =
                String(
                    x + 1
                );


            cell.dataset.y =
                String(
                    y + 1
                );


            cell.dataset.type =
                "EMPTY";


            cell.addEventListener(
                "click",
                () =>
                    selectCell(
                        cell
                    )
            );


            DOM.octagonGrid.appendChild(
                cell
            );

        }

    }

}


/* =========================================================
   GRILLE CARREE
   ========================================================= */

function createSquareGrid() {

    DOM.squareGrid.innerHTML =
        "";


    for (
        let y = 0;
        y < 8;
        y++
    ) {

        for (
            let x = 0;
            x < 8;
            x++
        ) {

            const cell =
                document.createElement(
                    "div"
                );


            cell.className =
                "square-cell";


            DOM.squareGrid.appendChild(
                cell
            );

        }

    }

}


/* =========================================================
   CELLULE
   ========================================================= */

function selectCell(
    cell
) {

    document
        .querySelectorAll(
            ".octagon-cell.selected"
        )
        .forEach(
            selected =>
                selected.classList.remove(
                    "selected"
                )
        );


    cell.classList.add(
        "selected"
    );


    GAME_STATE.selectedX =
        Number(
            cell.dataset.x
        );


    GAME_STATE.selectedY =
        Number(
            cell.dataset.y
        );


    GAME_STATE.selectedCell =
        `X${GAME_STATE.selectedX}-Y${GAME_STATE.selectedY}`;


    DOM.selectedCell.textContent =
        GAME_STATE.selectedCell;


    DOM.selectedType.textContent =
        cell.dataset.type;


    DOM.positionX.textContent =
        String(
            GAME_STATE.selectedX
        ).padStart(
            2,
            "0"
        );


    DOM.positionY.textContent =
        String(
            GAME_STATE.selectedY
        ).padStart(
            2,
            "0"
        );


    DOM.systemMessage.textContent =
        "CELL SELECTED";

}


/* =========================================================
   INTERFACE
   ========================================================= */

function updateInterface() {

    DOM.turnValue.textContent =
        String(
            GAME_STATE.turn
        ).padStart(
            2,
            "0"
        );


    DOM.roundValue.textContent =
        String(
            GAME_STATE.round
        ).padStart(
            2,
            "0"
        );


    DOM.playersValue.textContent =
        String(
            GAME_STATE.players
        ).padStart(
            2,
            "0"
        );


    DOM.zoomValue.textContent =
        String(
            GAME_STATE.zoom
        );


    DOM.playerName.textContent =
        `PLAYER ${String(
            GAME_STATE.player
        ).padStart(
            2,
            "0"
        )}`;


    if (
        !GAME_STATE.selectedCell
    ) {

        DOM.selectedCell.textContent =
            "NONE";

        DOM.selectedType.textContent =
            "EMPTY";

        DOM.positionX.textContent =
            "--";

        DOM.positionY.textContent =
            "--";

    }

}


/* =========================================================
   RESET
   ========================================================= */

function resetGame() {

    GAME_STATE.player =
        1;

    GAME_STATE.turn =
        1;

    GAME_STATE.round =
        1;

    GAME_STATE.selectedCell =
        null;

    GAME_STATE.selectedX =
        null;

    GAME_STATE.selectedY =
        null;

    GAME_STATE.zoom =
        100;


    document
        .querySelectorAll(
            ".octagon-cell.selected"
        )
        .forEach(
            cell =>
                cell.classList.remove(
                    "selected"
                )
        );


    DOM.map.style.transform =
        "";


    DOM.systemMessage.textContent =
        "SYSTEM RESET";


    updateInterface();

}


/* =========================================================
   MENU
   ========================================================= */

function toggleMenu() {

    GAME_STATE.menuOpen =
        !GAME_STATE.menuOpen;


    DOM.radialInterface.classList.toggle(
        "menu-hidden",
        !GAME_STATE.menuOpen
    );


    DOM.btnMenu.textContent =
        GAME_STATE.menuOpen
            ? "MENU"
            : "SHOW";

}


/* =========================================================
   ZOOM
   ========================================================= */

function setZoom(
    value
) {

    GAME_STATE.zoom =
        Math.max(
            50,
            Math.min(
                200,
                value
            )
        );


    DOM.map.style.transform =
        `scale(${GAME_STATE.zoom / 100})`;


    updateInterface();

}


/* =========================================================
   ACTIONS
   ========================================================= */

function selectAction() {

    DOM.systemMessage.textContent =
        "SELECT MODE ACTIVE";

}


function confirmAction() {

    if (
        !GAME_STATE.selectedCell
    ) {

        DOM.systemMessage.textContent =
            "NO CELL SELECTED";

        return;

    }


    GAME_STATE.turn++;


    DOM.systemMessage.textContent =
        "ACTION CONFIRMED";


    updateInterface();

}


function cancelAction() {

    DOM.systemMessage.textContent =
        "ACTION CANCELLED";

}


/* =========================================================
   EVENTS
   ========================================================= */

DOM.btnReset.addEventListener(
    "click",
    resetGame
);


DOM.btnMenu.addEventListener(
    "click",
    toggleMenu
);


DOM.btnSelect.addEventListener(
    "click",
    selectAction
);


DOM.btnConfirm.addEventListener(
    "click",
    confirmAction
);


DOM.btnCancel.addEventListener(
    "click",
    cancelAction
);


DOM.btnZoomIn.addEventListener(
    "click",
    () =>
        setZoom(
            GAME_STATE.zoom + 10
        )
);


DOM.btnZoomOut.addEventListener(
    "click",
    () =>
        setZoom(
            GAME_STATE.zoom - 10
        )
);


/* =========================================================
   RESIZE
   ========================================================= */

let resizeTimer =
    null;


window.addEventListener(
    "resize",
    () => {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
                drawRadialInterface,
                50
            );

    }
);


/* =========================================================
   INIT
   ========================================================= */

function init() {

    createOctagonGrid();

    createSquareGrid();

    updateInterface();

    drawRadialInterface();

}


init();