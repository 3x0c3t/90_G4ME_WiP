"use strict";


/* =========================================================
   INTERFACE GENERALE
   ========================================================= */


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

    menuContent:
        document.getElementById(
            "menu-content"
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

    playerName:
        document.getElementById(
            "player-name"
        ),

    playerState:
        document.getElementById(
            "player-state"
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
        )

};


/* =========================================================
   ETAT GENERAL
   ========================================================= */

const GAME_STATE = {

    player:
        1,

    turn:
        1,

    round:
        1,

    players:
        2,

    menuOpen:
        true

};


/* =========================================================
   MENUS
   ========================================================= */

const MENUS = [

    {
        label:
            "GAME",

        angle:
            -90,

        panel:
            "panel-top"
    },

    {
        label:
            "CELL",

        angle:
            -45,

        panel:
            "panel-top-right"
    },

    {
        label:
            "ACTION",

        angle:
            0,

        panel:
            "panel-right"
    },

    {
        label:
            "POSITION",

        angle:
            45,

        panel:
            "panel-bottom-right"
    },

    {
        label:
            "SYSTEM",

        angle:
            90,

        panel:
            "panel-bottom"
    },

    {
        label:
            "GRID",

        angle:
            135,

        panel:
            "panel-bottom-left"
    },

    {
        label:
            "MAP",

        angle:
            180,

        panel:
            "panel-left"
    },

    {
        label:
            "PLAYER",

        angle:
            225,

        panel:
            "panel-top-left"
    }

];


const SVG_NS =
    "http://www.w3.org/2000/svg";


/* =========================================================
   GEOMETRIE
   ========================================================= */

const MAP_RADIUS_RATIO =
    0.30;

const MAP_RING_GAP =
    13;

const TITLE_RING_GAP =
    32;

const TITLE_WHEEL_ROTATION =
    22.5;


/*
   Zone de contenu.

   Le contenu est placé entre :
   - le cercle extérieur de la map
   - le bord disponible de l'écran

   Chaque panneau occupe le secteur correspondant.
*/

const CONTENT_INNER_GAP =
    18;

const CONTENT_OUTER_GAP =
    28;

const CONTENT_MAX_WIDTH =
    250;

const CONTENT_MIN_WIDTH =
    130;


/* =========================================================
   CREATION SVG
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
   COORDONNEES POLAIRES
   ========================================================= */

function polarPoint(
    cx,
    cy,
    radius,
    angle
) {

    const radians =
        angle *
        Math.PI /
        180;


    return {

        x:
            cx +
            Math.cos(
                radians
            ) *
            radius,

        y:
            cy +
            Math.sin(
                radians
            ) *
            radius

    };

}


/* =========================================================
   RAYON JUSQU'AU BORD
   ========================================================= */

function rayToScreen(
    cx,
    cy,
    angle,
    width,
    height
) {

    const radians =
        angle *
        Math.PI /
        180;


    const dx =
        Math.cos(
            radians
        );


    const dy =
        Math.sin(
            radians
        );


    const distances =
        [];


    if (
        dx > 0
    ) {

        distances.push(
            (width - cx) /
            dx
        );

    }


    if (
        dx < 0
    ) {

        distances.push(
            -cx /
            dx
        );

    }


    if (
        dy > 0
    ) {

        distances.push(
            (height - cy) /
            dy
        );

    }


    if (
        dy < 0
    ) {

        distances.push(
            -cy /
            dy
        );

    }


    const valid =
        distances.filter(
            distance =>
                Number.isFinite(
                    distance
                ) &&
                distance > 0
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
   CERCLES
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
                    mapRadius +
                    5

            }
        );


    DOM.mapCircleLayer.appendChild(
        secondaryRing
    );


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
   LIGNES DE SECTEURS
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
   TITRES
   ========================================================= */

function drawTitles(
    cx,
    cy,
    titleRadius
) {

    DOM.titleLayer.innerHTML =
        "";


    const textRadius =
        titleRadius -
        TITLE_RING_GAP / 2;


    const wheel =
        svgElement(
            "g",
            {

                class:
                    "menu-title-wheel",

                transform:
                    `rotate(${TITLE_WHEEL_ROTATION} ${cx} ${cy})`

            }
        );


    DOM.titleLayer.appendChild(
        wheel
    );


    MENUS.forEach(
        menu => {

            const position =
                polarPoint(
                    cx,
                    cy,
                    textRadius,
                    menu.angle
                );


            let rotation =
                menu.angle +
                90;


            if (
                rotation > 90 &&
                rotation < 270
            ) {

                rotation +=
                    180;

            }


            rotation =
                (
                    rotation %
                    360 +
                    360
                ) %
                360;


            const group =
                svgElement(
                    "g",
                    {

                        class:
                            "menu-title-group",

                        transform:
                            `translate(${position.x} ${position.y}) rotate(${rotation})`

                    }
                );


            const background =
                svgElement(
                    "rect",
                    {

                        class:
                            "menu-title-background",

                        x:
                            -58,

                        y:
                            -17,

                        width:
                            116,

                        height:
                            34,

                        rx:
                            7,

                        ry:
                            7

                    }
                );


            group.appendChild(
                background
            );


            const text =
                svgElement(
                    "text",
                    {

                        class:
                            "menu-title",

                        x:
                            0,

                        y:
                            0,

                        "text-anchor":
                            "middle",

                        "dominant-baseline":
                            "middle"

                    }
                );


            text.textContent =
                menu.label;


            group.appendChild(
                text
            );


            wheel.appendChild(
                group
            );

        }
    );

}


/* =========================================================
   CONTENU DES MENUS
   ========================================================= */

function positionMenuContents(
    cx,
    cy,
    mapRadius,
    titleRadius,
    width,
    height
) {

    if (
        !DOM.menuContent
    ) {

        return;

    }


    /*
       Le cercle de la map constitue
       le bord intérieur des parts de pizza.
    */

    const innerRadius =
        titleRadius +
        CONTENT_INNER_GAP;


    /*
       Distance jusqu'au bord de l'écran
       dans chaque direction.
    */

    const outerDistances =
        MENUS.map(
            menu => {

                const point =
                    rayToScreen(
                        cx,
                        cy,
                        menu.angle +
                        TITLE_WHEEL_ROTATION,
                        width,
                        height
                    );


                return Math.hypot(
                    point.x - cx,
                    point.y - cy
                );

            }
        );


    const maxOuterRadius =
        Math.min(
            ...outerDistances
        );


    const outerRadius =
        maxOuterRadius -
        CONTENT_OUTER_GAP;


    /*
       Centre radial du contenu.

       On ne colle ni au cercle,
       ni au bord.
    */

    const contentRadius =
        innerRadius +
        (
            outerRadius -
            innerRadius
        ) *
        0.48;


    /*
       Largeur disponible.

       Chaque secteur fait 45°.
       On limite la largeur pour
       éviter de mordre dans les
       secteurs voisins.
    */

    const sectorWidth =
        contentRadius *
        2 *
        Math.sin(
            Math.PI /
            8
        );


    const contentWidth =
        Math.max(
            CONTENT_MIN_WIDTH,
            Math.min(
                CONTENT_MAX_WIDTH,
                sectorWidth *
                0.82
            )
        );


    MENUS.forEach(
        menu => {

            const panel =
                document.getElementById(
                    menu.panel
                );


            if (
                !panel
            ) {

                return;

            }


            /*
               Même rotation que les titres.

               Les titres ont été corrigés
               avec +22.5°.
               Les contenus utilisent donc
               exactement le même secteur.
            */

            const sectorAngle =
                menu.angle +
                TITLE_WHEEL_ROTATION;


            const position =
                polarPoint(
                    cx,
                    cy,
                    contentRadius,
                    sectorAngle
                );


            panel.style.left =
                `${position.x}px`;

            panel.style.top =
                `${position.y}px`;

            panel.style.width =
                `${contentWidth}px`;

            panel.style.height =
                "auto";

            panel.style.transform =
                "translate(-50%, -50%)";

        }
    );

}


/* =========================================================
   INTERFACE RADIALE
   ========================================================= */

function drawRadialInterface() {

    const rect =
        DOM.radialInterface
            .getBoundingClientRect();


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


    const cx =
        width /
        2;


    const cy =
        height /
        2;


    const mapRadius =
        Math.min(
            width,
            height
        ) *
        MAP_RADIUS_RATIO;


    DOM.svg.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );


    const titleRadius =
        drawCircles(
            cx,
            cy,
            mapRadius
        );


    drawSectorLines(
        cx,
        cy,
        mapRadius,
        width,
        height
    );


    drawTitles(
        cx,
        cy,
        titleRadius
    );


    positionMenuContents(
        cx,
        cy,
        mapRadius,
        titleRadius,
        width,
        height
    );

}


/* =========================================================
   INTERFACE JEU
   ========================================================= */

function updateInterface() {

    if (
        DOM.turnValue
    ) {

        DOM.turnValue.textContent =
            String(
                GAME_STATE.turn
            ).padStart(
                2,
                "0"
            );

    }


    if (
        DOM.roundValue
    ) {

        DOM.roundValue.textContent =
            String(
                GAME_STATE.round
            ).padStart(
                2,
                "0"
            );

    }


    if (
        DOM.playersValue
    ) {

        DOM.playersValue.textContent =
            String(
                GAME_STATE.players
            ).padStart(
                2,
                "0"
            );

    }


    if (
        DOM.playerName
    ) {

        DOM.playerName.textContent =
            `PLAYER ${String(
                GAME_STATE.player
            ).padStart(
                2,
                "0"
            )}`;

    }

}


/* =========================================================
   MENU
   ========================================================= */

function toggleMenu() {

    GAME_STATE.menuOpen =
        !GAME_STATE.menuOpen;


    DOM.radialInterface
        .classList.toggle(
            "menu-hidden",
            !GAME_STATE.menuOpen
        );


    if (
        DOM.btnMenu
    ) {

        DOM.btnMenu.textContent =
            GAME_STATE.menuOpen
                ? "MENU"
                : "SHOW";

    }

}


/* =========================================================
   ACTION SELECT
   ========================================================= */

function selectAction() {

    if (
        typeof MAP !== "undefined"
    ) {

        MAP.setSystemMessage(
            "SELECT MODE ACTIVE"
        );

    }

}


/* =========================================================
   ACTION CONFIRM
   ========================================================= */

function confirmAction() {

    if (
        typeof MAP === "undefined"
    ) {

        return;

    }


    const state =
        MAP.getState();


    if (
        !state.selectedCell
    ) {

        MAP.setSystemMessage(
            "NO CELL SELECTED"
        );

        return;

    }


    GAME_STATE.turn++;


    MAP.setSystemMessage(
        "ACTION CONFIRMED"
    );


    updateInterface();

}


/* =========================================================
   ACTION CANCEL
   ========================================================= */

function cancelAction() {

    if (
        typeof MAP !== "undefined"
    ) {

        MAP.setSystemMessage(
            "ACTION CANCELLED"
        );

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


    if (
        typeof MAP !== "undefined"
    ) {

        MAP.reset();

    }


    updateInterface();

}


/* =========================================================
   EVENTS
   ========================================================= */

if (
    DOM.btnReset
) {

    DOM.btnReset.addEventListener(
        "click",
        resetGame
    );

}


if (
    DOM.btnMenu
) {

    DOM.btnMenu.addEventListener(
        "click",
        toggleMenu
    );

}


if (
    DOM.btnSelect
) {

    DOM.btnSelect.addEventListener(
        "click",
        selectAction
    );

}


if (
    DOM.btnConfirm
) {

    DOM.btnConfirm.addEventListener(
        "click",
        confirmAction
    );

}


if (
    DOM.btnCancel
) {

    DOM.btnCancel.addEventListener(
        "click",
        cancelAction
    );

}


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

    MAP.init();

    updateInterface();

    drawRadialInterface();

}


init();