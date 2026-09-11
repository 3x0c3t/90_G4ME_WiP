"use strict";

/* ============================================================
   DOM
============================================================ */

const DOM = {

    game:
        document.getElementById("game"),

    radialInterface:
        document.getElementById("radial-interface"),

    radialMenus:
        document.getElementById("radial-menus"),

    menuSectors:
        document.getElementById("menu-sectors"),

    menuGuides:
        document.getElementById("menu-guides"),

    menuTitlePaths:
        document.getElementById("menu-title-paths"),

    menuTitles:
        document.getElementById("menu-titles"),

    menuInformation:
        document.getElementById("menu-information"),

    map:
        document.getElementById("map"),

    octagonGrid:
        document.getElementById("octagon-grid"),

    squareGrid:
        document.getElementById("square-grid"),

    playerValue:
        document.getElementById("player-value")
};


/* ============================================================
   GAME STATE
============================================================ */

const GAME_STATE = {

    player: 1,

    turn: 1,

    round: 1,

    selectedCell: null,

    selectedX: null,

    selectedY: null,

    zoom: 100
};


/* ============================================================
   MENUS
============================================================ */

const MENUS = [

    {
        id: "game",
        title: "GAME",
        center: -112.5
    },

    {
        id: "cell",
        title: "CELL",
        center: -67.5
    },

    {
        id: "action",
        title: "ACTION",
        center: -22.5
    },

    {
        id: "position",
        title: "POSITION",
        center: 22.5
    },

    {
        id: "system",
        title: "SYSTEM",
        center: 67.5
    },

    {
        id: "grid",
        title: "GRID",
        center: 112.5
    },

    {
        id: "map",
        title: "MAP",
        center: 157.5
    },

    {
        id: "player",
        title: "PLAYER",
        center: 202.5
    }

];


/* ============================================================
   SVG
============================================================ */

const SVG_NS =
    "http://www.w3.org/2000/svg";


function svgElement(name) {

    return document.createElementNS(
        SVG_NS,
        name
    );
}


/* ============================================================
   POLAR
============================================================ */

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
            radius *
            Math.cos(radians),

        y:
            cy +
            radius *
            Math.sin(radians)
    };
}


/* ============================================================
   RECTANGLE RAY
============================================================ */

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
            (width - cx) / dx
        );

    } else if (dx < 0) {

        distances.push(
            -cx / dx
        );
    }


    if (dy > 0) {

        distances.push(
            (height - cy) / dy
        );

    } else if (dy < 0) {

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
        Math.min(...valid);


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


/* ============================================================
   ARC
============================================================ */

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


    let delta =
        Math.abs(
            endAngle -
            startAngle
        );


    delta %= 360;


    if (delta === 0) {

        delta = 360;
    }


    const largeArc =
        delta > 180
            ? 1
            : 0;


    return [

        "M",
        start.x,
        start.y,

        "A",
        radius,
        radius,
        0,
        largeArc,
        sweep,
        end.x,
        end.y

    ].join(" ");
}


/* ============================================================
   MAP GEOMETRY
============================================================ */

function getMapGeometry() {

    const rect =
        DOM.radialInterface
            .getBoundingClientRect();


    const width =
        rect.width;


    const height =
        rect.height;


    const cx =
        width / 2;


    const cy =
        height / 2;


    const mapRect =
        DOM.map
            ? DOM.map.getBoundingClientRect()
            : null;


    let mapRadius =
        Math.min(
            width,
            height
        ) * 0.312;


    if (mapRect) {

        mapRadius =
            Math.min(
                mapRect.width,
                mapRect.height
            ) / 2;
    }


    return {

        width,

        height,

        cx,

        cy,

        mapRadius
    };
}


/* ============================================================
   MENU OUTER RADIUS
============================================================ */

function getOuterRadius(
    mapRadius,
    width,
    height
) {

    const available =
        Math.min(
            width,
            height
        ) / 2;


    const depth =
        Math.min(
            155,
            Math.max(
                95,
                available -
                mapRadius
            )
        );


    return mapRadius + depth;
}


/* ============================================================
   CLEAR RADIAL LAYERS
============================================================ */

function clearRadialLayers() {

    if (DOM.menuGuides) {

        DOM.menuGuides.innerHTML =
            "";
    }


    if (DOM.menuTitlePaths) {

        DOM.menuTitlePaths.innerHTML =
            "";
    }


    if (DOM.menuTitles) {

        DOM.menuTitles.innerHTML =
            "";
    }
}


/* ============================================================
   MAP CIRCLE
============================================================ */

function createMapCircle(
    cx,
    cy,
    radius
) {

    if (!DOM.menuGuides) {
        return;
    }


    const circle =
        svgElement(
            "circle"
        );


    circle.setAttribute(
        "cx",
        cx
    );


    circle.setAttribute(
        "cy",
        cy
    );


    circle.setAttribute(
        "r",
        radius
    );


    circle.classList.add(
        "map-circle-guide"
    );


    DOM.menuGuides.appendChild(
        circle
    );
}


/* ============================================================
   OUTER CIRCLE
============================================================ */

function createOuterCircle(
    cx,
    cy,
    radius
) {

    if (!DOM.menuGuides) {
        return;
    }


    const circle =
        svgElement(
            "circle"
        );


    circle.setAttribute(
        "cx",
        cx
    );


    circle.setAttribute(
        "cy",
        cy
    );


    circle.setAttribute(
        "r",
        radius
    );


    circle.classList.add(
        "menu-outer-guide"
    );


    DOM.menuGuides.appendChild(
        circle
    );
}


/* ============================================================
   SEPARATORS
============================================================ */

function createSeparators(
    cx,
    cy,
    mapRadius,
    width,
    height
) {

    if (!DOM.menuGuides) {
        return;
    }


    MENUS.forEach(
        menu => {

            const angle =
                menu.center -
                22.5;


            const start =
                polarPoint(
                    cx,
                    cy,
                    mapRadius,
                    angle
                );


            const end =
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


            line.setAttribute(
                "x1",
                start.x
            );


            line.setAttribute(
                "y1",
                start.y
            );


            line.setAttribute(
                "x2",
                end.x
            );


            line.setAttribute(
                "y2",
                end.y
            );


            line.classList.add(
                "menu-separator"
            );


            DOM.menuGuides.appendChild(
                line
            );
        }
    );
}


/* ============================================================
   CREATE TITLE
   ============================================================ */

function createTitle(
    menu,
    cx,
    cy,
    radius
) {

    if (
        !DOM.menuTitlePaths ||
        !DOM.menuTitles
    ) {

        return;
    }


    /*
     * IMPORTANT :
     *
     * Cette géométrie correspond à la version
     * fonctionnelle des titres.
     *
     * On ne déplace pas les titres.
     */

    const titleRadius =
        radius + 28;


    const arcSize =
        30;


    const halfArc =
        arcSize / 2;


    const normalized =
        (
            menu.center %
            360 +
            360
        ) % 360;


    /*
     * Partie haute :
     * lecture gauche -> droite.
     *
     * Partie basse :
     * inversion de l'arc pour conserver
     * le texte lisible.
     */

    const upper =
        normalized >= 180 ||
        normalized <= 0;


    let startAngle;
    let endAngle;
    let sweep;


    if (upper) {

        startAngle =
            menu.center -
            halfArc;

        endAngle =
            menu.center +
            halfArc;

        sweep = 1;

    } else {

        startAngle =
            menu.center +
            halfArc;

        endAngle =
            menu.center -
            halfArc;

        sweep = 0;
    }


    const path =
        svgElement(
            "path"
        );


    const pathId =
        `title-path-${menu.id}`;


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


/* ============================================================
   CREATE ALL TITLES
============================================================ */

function createTitles(
    cx,
    cy,
    mapRadius
) {

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
}


/* ============================================================
   CONTENT POSITION
============================================================ */

function getContentPosition(
    menu,
    cx,
    cy,
    mapRadius,
    outerRadius
) {

    /*
     * Le contenu se trouve dans le secteur,
     * entre la MAP et le bord extérieur.
     *
     * On laisse le titre sur son arc,
     * puis le contenu plus près du centre.
     */

    const radius =
        mapRadius +
        (
            outerRadius -
            mapRadius
        ) * 0.54;


    const point =
        polarPoint(
            cx,
            cy,
            radius,
            menu.center
        );


    return point;
}


/* ============================================================
   POSITION EXISTING CONTENT
============================================================ */

function positionRadialContent() {

    if (!DOM.menuInformation) {

        return;
    }


    const geometry =
        getMapGeometry();


    const outerRadius =
        getOuterRadius(
            geometry.mapRadius,
            geometry.width,
            geometry.height
        );


    MENUS.forEach(
        menu => {

            const selector =
                `.radial-content-${menu.id}`;


            const content =
                DOM.menuInformation
                    .querySelector(
                        selector
                    );


            if (!content) {

                return;
            }


            const point =
                getContentPosition(
                    menu,
                    geometry.cx,
                    geometry.cy,
                    geometry.mapRadius,
                    outerRadius
                );


            content.style.position =
                "absolute";


            content.style.left =
                `${point.x}px`;


            content.style.top =
                `${point.y}px`;


            content.style.right =
                "auto";


            content.style.bottom =
                "auto";


            content.style.transform =
                "translate(-50%, -50%)";
        }
    );
}


/* ============================================================
   REMOVE DUPLICATED TITLES FROM CONTENT
============================================================ */

function removeDuplicatedContentTitles() {

    if (!DOM.menuInformation) {

        return;
    }


    const titles =
        DOM.menuInformation
            .querySelectorAll(
                ".panel-title"
            );


    titles.forEach(
        title => {

            title.style.display =
                "none";
        }
    );
}


/* ============================================================
   RADIAL INTERFACE
============================================================ */

function buildRadialInterface() {

    if (!DOM.radialInterface) {

        return;
    }


    const geometry =
        getMapGeometry();


    const outerRadius =
        getOuterRadius(
            geometry.mapRadius,
            geometry.width,
            geometry.height
        );


    clearRadialLayers();


    createMapCircle(
        geometry.cx,
        geometry.cy,
        geometry.mapRadius
    );


    createOuterCircle(
        geometry.cx,
        geometry.cy,
        outerRadius
    );


    createSeparators(
        geometry.cx,
        geometry.cy,
        geometry.mapRadius,
        geometry.width,
        geometry.height
    );


    /*
     * Les titres sont générés ici,
     * une seule fois par reconstruction.
     */

    createTitles(
        geometry.cx,
        geometry.cy,
        geometry.mapRadius
    );


    /*
     * Le contenu existant est simplement
     * repositionné dans les secteurs.
     */

    removeDuplicatedContentTitles();

    positionRadialContent();
}


/* ============================================================
   OCTAGON GRID
============================================================ */

function generateOctagonGrid() {

    if (!DOM.octagonGrid) {

        return;
    }


    /*
     * Ne pas régénérer si la grille
     * existe déjà dans le HTML.
     */

    const existing =
        DOM.octagonGrid
            .querySelectorAll(
                ".octagon-cell"
            );


    if (existing.length > 0) {

        return;
    }


    const size =
        7;


    for (
        let y = 0;
        y < size;
        y++
    ) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "octagon-row";


        if (
            y % 2 === 1
        ) {

            row.classList.add(
                "offset"
            );
        }


        for (
            let x = 0;
            x < size;
            x++
        ) {

            const cell =
                document.createElement(
                    "div"
                );


            cell.className =
                "octagon-cell";


            cell.dataset.x =
                x + 1;


            cell.dataset.y =
                y + 1;


            cell.dataset.id =
                `${x + 1}-${y + 1}`;


            row.appendChild(
                cell
            );
        }


        DOM.octagonGrid.appendChild(
            row
        );
    }
}


/* ============================================================
   SQUARE GRID
============================================================ */

function generateSquareGrid() {

    if (!DOM.squareGrid) {

        return;
    }


    const existing =
        DOM.squareGrid
            .querySelectorAll(
                ".square-cell"
            );


    if (existing.length > 0) {

        return;
    }


    const size =
        8;


    for (
        let y = 0;
        y < size;
        y++
    ) {

        for (
            let x = 0;
            x < size;
            x++
        ) {

            const cell =
                document.createElement(
                    "div"
                );


            cell.className =
                "square-cell";


            cell.dataset.x =
                x + 1;


            cell.dataset.y =
                y + 1;


            DOM.squareGrid.appendChild(
                cell
            );
        }
    }
}


/* ============================================================
   GRID EVENTS
============================================================ */

function setupGridEvents() {

    if (!DOM.octagonGrid) {

        return;
    }


    const cells =
        DOM.octagonGrid
            .querySelectorAll(
                ".octagon-cell"
            );


    cells.forEach(
        cell => {

            cell.addEventListener(
                "click",
                () => {

                    cells.forEach(
                        other => {

                            other.classList.remove(
                                "selected"
                            );
                        }
                    );


                    cell.classList.add(
                        "selected"
                    );


                    GAME_STATE.selectedCell =
                        cell.dataset.id;


                    GAME_STATE.selectedX =
                        cell.dataset.x;


                    GAME_STATE.selectedY =
                        cell.dataset.y;


                    updateCellInformation();
                }
            );
        }
    );
}


/* ============================================================
   CELL INFORMATION
============================================================ */

function updateCellInformation() {

    if (!DOM.menuInformation) {

        return;
    }


    const cell =
        DOM.menuInformation
            .querySelector(
                ".radial-content-cell"
            );


    if (!cell) {

        return;
    }


    const values =
        cell.querySelectorAll(
            "[data-cell-value]"
        );


    values.forEach(
        element => {

            const type =
                element.dataset.cellValue;


            if (
                type === "id"
            ) {

                element.textContent =
                    GAME_STATE.selectedCell ||
                    "NONE";
            }


            if (
                type === "x"
            ) {

                element.textContent =
                    GAME_STATE.selectedX ||
                    "--";
            }


            if (
                type === "y"
            ) {

                element.textContent =
                    GAME_STATE.selectedY ||
                    "--";
            }
        }
    );
}


/* ============================================================
   PLAYER
============================================================ */

function updatePlayerDisplay() {

    if (!DOM.playerValue) {

        return;
    }


    DOM.playerValue.textContent =
        `P${GAME_STATE.player}`;
}


/* ============================================================
   RESIZE
============================================================ */

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


/* ============================================================
   INIT
============================================================ */

function initGame() {

    generateOctagonGrid();

    generateSquareGrid();

    setupGridEvents();

    updatePlayerDisplay();

    buildRadialInterface();
}


/* ============================================================
   DOM READY
============================================================ */

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