"use strict";


/* =========================================================
   DOM
========================================================= */

const DOM = {

    game:
        document.getElementById("game"),

    gameArea:
        document.getElementById("game-area"),

    map:
        document.getElementById("map"),

    radial:
        document.getElementById("radial-interface"),

    menuRing:
        document.getElementById("menu-ring"),

    menuGuides:
        document.getElementById("menu-guides"),

    menuTitlePaths:
        document.getElementById("menu-title-paths"),

    menuTitles:
        document.getElementById("menu-titles"),

    menuContent:
        document.getElementById("menu-content"),

    octagonGrid:
        document.getElementById("octagon-grid"),

    squareGrid:
        document.getElementById("square-grid"),

    playerValue:
        document.getElementById("player-value")
};


/* =========================================================
   STATE
========================================================= */

const GAME_STATE = {

    player: 1,

    turn: 1,

    round: 1,

    selectedCell: null,

    selectedX: null,

    selectedY: null
};


/* =========================================================
   MENUS
========================================================= */

const MENUS = [

    {
        id: "game",
        title: "GAME",
        center: -112.5,
        content: [
            "NEW GAME",
            "LOAD GAME",
            "SAVE GAME"
        ]
    },

    {
        id: "cell",
        title: "CELL",
        center: -67.5,
        content: [
            "SELECTED",
            "TYPE",
            "STATUS"
        ]
    },

    {
        id: "action",
        title: "ACTION",
        center: -22.5,
        content: [
            "SELECT",
            "MOVE",
            "CONFIRM"
        ]
    },

    {
        id: "position",
        title: "POSITION",
        center: 22.5,
        content: [
            "X --",
            "Y --",
            "ZONE --"
        ]
    },

    {
        id: "system",
        title: "SYSTEM",
        center: 67.5,
        content: [
            "STATUS",
            "SETTINGS",
            "DEBUG"
        ]
    },

    {
        id: "grid",
        title: "GRID",
        center: 112.5,
        content: [
            "7 × 7",
            "OCTAGON",
            "CELLS"
        ]
    },

    {
        id: "map",
        title: "MAP",
        center: 157.5,
        content: [
            "ZOOM 100%",
            "CENTER",
            "LAYERS"
        ]
    },

    {
        id: "player",
        title: "PLAYER",
        center: 202.5,
        content: [
            "PLAYER 1",
            "TURN",
            "ROUND"
        ]
    }

];


/* =========================================================
   SVG
========================================================= */

function svgElement(
    name
) {

    return document.createElementNS(
        "http://www.w3.org/2000/svg",
        name
    );
}


/* =========================================================
   POLAR
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
            Math.cos(radians) *
            radius,

        y:
            cy +
            Math.sin(radians) *
            radius
    };
}


/* =========================================================
   RECTANGLE RAY
========================================================= */

function rayToRectangle(
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
        Math.cos(radians);


    const dy =
        Math.sin(radians);


    const distances = [];


    if (dx > 0) {

        distances.push(
            (width - cx) /
            dx
        );
    }


    if (dx < 0) {

        distances.push(
            -cx /
            dx
        );
    }


    if (dy > 0) {

        distances.push(
            (height - cy) /
            dy
        );
    }


    if (dy < 0) {

        distances.push(
            -cy /
            dy
        );
    }


    const valid =
        distances.filter(
            value =>
                Number.isFinite(value) &&
                value > 0
        );


    if (
        !valid.length
    ) {

        return {
            x: cx,
            y: cy
        };
    }


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
   ARC
========================================================= */

function arcPath(
    cx,
    cy,
    radius,
    startAngle,
    endAngle,
    sweep
) {

    const start =
        polarPoint(
            cx,
            cy,
            radius,
            startAngle
        );


    const end =
        polarPoint(
            cx,
            cy,
            radius,
            endAngle
        );


    return [

        "M",
        start.x,
        start.y,

        "A",
        radius,
        radius,

        0,
        0,
        sweep,

        end.x,
        end.y

    ].join(" ");
}


/* =========================================================
   TITLE PATH
========================================================= */

function createTitle(
    menu,
    cx,
    cy,
    radius
) {

    const pathId =
        `title-path-${menu.id}`;


    /*
        Le titre est centré dans
        l'anneau.
    */

    const titleRadius =
        radius +
        (
            getRingWidth()
            / 2
        );


    /*
        Partie haute :
        sens normal.

        Partie basse :
        sens inversé pour garder
        le texte lisible.
    */

    const lowerHalf =
        menu.center > 0 &&
        menu.center < 180;


    let startAngle;
    let endAngle;
    let sweep;


    if (lowerHalf) {

        startAngle =
            menu.center + 15;


        endAngle =
            menu.center - 15;


        sweep = 0;

    } else {

        startAngle =
            menu.center - 15;


        endAngle =
            menu.center + 15;


        sweep = 1;
    }


    const path =
        svgElement(
            "path"
        );


    path.setAttribute(
        "id",
        pathId
    );


    path.setAttribute(
        "d",
        arcPath(
            cx,
            cy,
            titleRadius,
            startAngle,
            endAngle,
            sweep
        )
    );


    path.classList.add(
        "menu-title-path"
    );


    DOM.menuTitlePaths.appendChild(
        path
    );


    const text =
        svgElement(
            "text"
        );


    text.classList.add(
        "menu-title"
    );


    const textPath =
        svgElement(
            "textPath"
        );


    textPath.setAttribute(
        "href",
        `#${pathId}`
    );


    textPath.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        `#${pathId}`
    );


    textPath.setAttribute(
        "startOffset",
        "50%"
    );


    textPath.setAttribute(
        "text-anchor",
        "middle"
    );


    textPath.textContent =
        menu.title;


    text.appendChild(
        textPath
    );


    DOM.menuTitles.appendChild(
        text
    );
}


/* =========================================================
   RING WIDTH
========================================================= */

function getRingWidth() {

    const gameRect =
        DOM.gameArea.getBoundingClientRect();


    const width =
        gameRect.width;


    const height =
        gameRect.height;


    const mapSize =
        Math.min(
            width,
            height
        ) * 0.52;


    return (
        mapSize *
        0.17
    );
}


/* =========================================================
   CONTENT
========================================================= */

function createMenuContent(
    menu,
    cx,
    cy,
    innerRadius,
    outerRadius,
    width,
    height
) {

    const middleRadius =
        outerRadius +
        (
            Math.min(
                width,
                height
            ) *
            0.13
        );


    const point =
        polarPoint(
            cx,
            cy,
            middleRadius,
            menu.center
        );


    const content =
        document.createElement(
            "div"
        );


    content.className =
        "menu-content";


    content.dataset.menu =
        menu.id;


    const title =
        document.createElement(
            "div"
        );


    title.className =
        "menu-content-title";


    title.textContent =
        menu.title;


    content.appendChild(
        title
    );


    menu.content.forEach(
        line => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "menu-content-line";


            element.textContent =
                line;


            content.appendChild(
                element
            );
        }
    );


    DOM.menuContent.appendChild(
        content
    );


    /*
        Position initiale.
    */

    const rect =
        content.getBoundingClientRect();


    let x =
        point.x -
        rect.width / 2;


    let y =
        point.y -
        rect.height / 2;


    /*
        Ajustement selon le secteur.

        Le contenu reste dans sa zone
        extérieure sans se retrouver
        complètement hors écran.
    */

    if (
        menu.center ===
        -112.5
    ) {

        x =
            Math.max(
                20,
                x
            );

        y =
            Math.max(
                20,
                y
            );
    }


    if (
        menu.center ===
        -67.5
    ) {

        x =
            Math.max(
                20,
                x
            );

        y =
            Math.max(
                20,
                y
            );
    }


    if (
        menu.center ===
        -22.5
    ) {

        x =
            Math.min(
                width -
                rect.width -
                20,
                x
            );
    }


    if (
        menu.center ===
        22.5
    ) {

        x =
            Math.min(
                width -
                rect.width -
                20,
                x
            );
    }


    if (
        menu.center ===
        67.5
    ) {

        x =
            Math.min(
                width -
                rect.width -
                20,
                x
            );

        y =
            Math.min(
                height -
                rect.height -
                20,
                y
            );
    }


    if (
        menu.center ===
        112.5
    ) {

        x =
            Math.min(
                width -
                rect.width -
                20,
                x
            );

        y =
            Math.min(
                height -
                rect.height -
                20,
                y
            );
    }


    if (
        menu.center ===
        157.5
    ) {

        x =
            Math.max(
                20,
                x
            );

        y =
            Math.min(
                height -
                rect.height -
                20,
                y
            );
    }


    if (
        menu.center ===
        202.5
    ) {

        x =
            Math.max(
                20,
                x
            );

        y =
            Math.min(
                height -
                rect.height -
                20,
                y
            );
    }


    content.style.left =
        `${x}px`;


    content.style.top =
        `${y}px`;
}


/* =========================================================
   BUILD RADIAL
========================================================= */

function buildRadialInterface() {

    if (
        !DOM.gameArea ||
        !DOM.map
    ) {

        return;
    }


    const areaRect =
        DOM.gameArea.getBoundingClientRect();


    const mapRect =
        DOM.map.getBoundingClientRect();


    const width =
        areaRect.width;


    const height =
        areaRect.height;


    if (
        width <= 0 ||
        height <= 0
    ) {

        return;
    }


    /*
        Centre exact.
    */

    const cx =
        width /
        2;


    const cy =
        height /
        2;


    /*
        Rayon MAP.
    */

    const mapRadius =
        Math.min(
            mapRect.width,
            mapRect.height
        ) /
        2;


    /*
        Largeur de l'anneau.
    */

    const ringWidth =
        getRingWidth();


    const outerRadius =
        mapRadius +
        ringWidth;


    /*
        SVG.
    */

    DOM.radial.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );


    /*
        Nettoyage.
    */

    DOM.menuRing.innerHTML =
        "";

    DOM.menuGuides.innerHTML =
        "";

    DOM.menuTitlePaths.innerHTML =
        "";

    DOM.menuTitles.innerHTML =
        "";

    DOM.menuContent.innerHTML =
        "";


    /*
        =====================================================
        ANNEAU
        =====================================================
    */

    const ring =
        svgElement(
            "path"
        );


    const outerStart =
        polarPoint(
            cx,
            cy,
            outerRadius,
            -180
        );


    const innerStart =
        polarPoint(
            cx,
            cy,
            mapRadius,
            -180
        );


    ring.setAttribute(
        "d",
        [
            "M",
            outerStart.x,
            outerStart.y,

            "A",
            outerRadius,
            outerRadius,
            0,
            1,
            1,
            outerStart.x,
            outerStart.y,

            "M",
            innerStart.x,
            innerStart.y,

            "A",
            mapRadius,
            mapRadius,
            0,
            1,
            0,
            innerStart.x,
            innerStart.y
        ].join(" ")
    );


    ring.setAttribute(
        "fill-rule",
        "evenodd"
    );


    ring.classList.add(
        "menu-ring"
    );


    DOM.menuRing.appendChild(
        ring
    );


    /*
        Cercle intérieur.
    */

    const innerGuide =
        svgElement(
            "circle"
        );


    innerGuide.classList.add(
        "map-ring-guide"
    );


    innerGuide.setAttribute(
        "cx",
        cx
    );


    innerGuide.setAttribute(
        "cy",
        cy
    );


    innerGuide.setAttribute(
        "r",
        mapRadius
    );


    DOM.menuGuides.appendChild(
        innerGuide
    );


    /*
        Cercle extérieur.
    */

    const outerGuide =
        svgElement(
            "circle"
        );


    outerGuide.classList.add(
        "menu-outer-guide"
    );


    outerGuide.setAttribute(
        "cx",
        cx
    );


    outerGuide.setAttribute(
        "cy",
        cy
    );


    outerGuide.setAttribute(
        "r",
        outerRadius
    );


    DOM.menuGuides.appendChild(
        outerGuide
    );


    /*
        =====================================================
        8 SÉPARATEURS
        =====================================================
    */

    MENUS.forEach(
        menu => {

            const angle =
                menu.center;


            const inner =
                polarPoint(
                    cx,
                    cy,
                    mapRadius,
                    angle
                );


            const outer =
                rayToRectangle(
                    cx,
                    cy,
                    angle,
                    width,
                    height
                );


            const line =
                svgElement(
                    "line"
                );


            line.classList.add(
                "menu-separator"
            );


            line.setAttribute(
                "x1",
                inner.x
            );


            line.setAttribute(
                "y1",
                inner.y
            );


            line.setAttribute(
                "x2",
                outer.x
            );


            line.setAttribute(
                "y2",
                outer.y
            );


            DOM.menuGuides.appendChild(
                line
            );
        }
    );


    /*
        =====================================================
        TITRES
        =====================================================
    */

    MENUS.forEach(
        menu => {

            createTitle(
                menu,
                cx,
                cy,
                mapRadius
            );
        }
    );


    /*
        =====================================================
        CONTENU
        =====================================================
    */

    MENUS.forEach(
        menu => {

            createMenuContent(
                menu,
                cx,
                cy,
                mapRadius,
                outerRadius,
                width,
                height
            );
        }
    );
}


/* =========================================================
   OCTAGON GRID
========================================================= */

function generateOctagonGrid() {

    if (
        !DOM.octagonGrid
    ) {

        return;
    }


    DOM.octagonGrid.innerHTML =
        "";


    const rows =
        7;


    const columns =
        7;


    for (
        let row = 0;
        row < rows;
        row++
    ) {

        const rowElement =
            document.createElement(
                "div"
            );


        rowElement.className =
            "octagon-row";


        if (
            row % 2 ===
            1
        ) {

            rowElement.classList.add(
                "offset"
            );
        }


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


            cell.dataset.id =
                `O${row + 1}-${column + 1}`;


            rowElement.appendChild(
                cell
            );
        }


        DOM.octagonGrid.appendChild(
            rowElement
        );
    }
}


/* =========================================================
   SQUARE GRID
========================================================= */

function generateSquareGrid() {

    if (
        !DOM.squareGrid
    ) {

        return;
    }


    DOM.squareGrid.innerHTML =
        "";


    for (
        let row = 0;
        row < 8;
        row++
    ) {

        for (
            let column = 0;
            column < 8;
            column++
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
   CELL SELECTION
========================================================= */

function setupGridEvents() {

    if (
        !DOM.octagonGrid
    ) {

        return;
    }


    DOM.octagonGrid.addEventListener(
        "click",
        event => {

            const cell =
                event.target.closest(
                    ".octagon-cell"
                );


            if (
                !cell
            ) {

                return;
            }


            document
                .querySelectorAll(
                    ".octagon-cell.selected"
                )
                .forEach(
                    selected => {

                        selected.classList.remove(
                            "selected"
                        );
                    }
                );


            cell.classList.add(
                "selected"
            );


            GAME_STATE.selectedCell =
                cell.dataset.id;


            updateMenuContent();
        }
    );
}


/* =========================================================
   UPDATE CONTENT
========================================================= */

function updateMenuContent() {

    document
        .querySelectorAll(
            ".menu-content"
        )
        .forEach(
            content => {

                const menu =
                    content.dataset.menu;


                const lines =
                    content.querySelectorAll(
                        ".menu-content-line"
                    );


                if (
                    menu ===
                    "cell"
                ) {

                    lines[0].textContent =
                        GAME_STATE.selectedCell ||
                        "NONE";

                    lines[1].textContent =
                        GAME_STATE.selectedCell
                            ? "OCTAGON"
                            : "---";

                    lines[2].textContent =
                        GAME_STATE.selectedCell
                            ? "SELECTED"
                            : "EMPTY";
                }


                if (
                    menu ===
                    "position"
                ) {

                    if (
                        GAME_STATE.selectedCell
                    ) {

                        const parts =
                            GAME_STATE
                                .selectedCell
                                .replace(
                                    "O",
                                    ""
                                )
                                .split(
                                    "-"
                                );


                        lines[0].textContent =
                            `X ${parts[1]}`;


                        lines[1].textContent =
                            `Y ${parts[0]}`;


                        lines[2].textContent =
                            "MAP";
                    }
                }


                if (
                    menu ===
                    "player"
                ) {

                    lines[0].textContent =
                        `PLAYER ${GAME_STATE.player}`;


                    lines[1].textContent =
                        `TURN ${String(
                            GAME_STATE.turn
                        ).padStart(
                            2,
                            "0"
                        )}`;


                    lines[2].textContent =
                        `ROUND ${String(
                            GAME_STATE.round
                        ).padStart(
                            2,
                            "0"
                        )}`;
                }
            }
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
                () => {

                    buildRadialInterface();

                },
                50
            );
    }
);


/* =========================================================
   INIT
========================================================= */

function initGame() {

    generateOctagonGrid();

    generateSquareGrid();

    setupGridEvents();

    buildRadialInterface();

    updateMenuContent();
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initGame
    );

} else {

    initGame();
}