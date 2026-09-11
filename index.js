/* =========================================================
   90_G4ME_WiP
   3xØc3t L4B
   ========================================================= */


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

    octagonGrid:
        document.getElementById("octagon-grid"),

    squareGrid:
        document.getElementById("square-grid"),

    playerValue:
        document.getElementById("player-value")
};


/* =========================================================
   GAME STATE
   ========================================================= */

const GAME_STATE = {

    player:
        1,

    turn:
        1,

    round:
        1,

    selectedCell:
        null,

    selectedX:
        null,

    selectedY:
        null
};


/* =========================================================
   MENUS
   ========================================================= */

const MENUS = [

    {
        id:
            "game",

        title:
            "GAME",

        center:
            -112.5
    },

    {
        id:
            "cell",

        title:
            "CELL",

        center:
            -67.5
    },

    {
        id:
            "action",

        title:
            "ACTION",

        center:
            -22.5
    },

    {
        id:
            "position",

        title:
            "POSITION",

        center:
            22.5
    },

    {
        id:
            "system",

        title:
            "SYSTEM",

        center:
            67.5
    },

    {
        id:
            "grid",

        title:
            "GRID",

        center:
            112.5
    },

    {
        id:
            "map",

        title:
            "MAP",

        center:
            157.5
    },

    {
        id:
            "player",

        title:
            "PLAYER",

        center:
            202.5
    }

];


/* =========================================================
   SVG ELEMENT
   ========================================================= */

function svgElement(name) {

    return document.createElementNS(
        "http://www.w3.org/2000/svg",
        name
    );
}


/* =========================================================
   POLAR POINT
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
            radius *
            Math.cos(radians),

        y:
            cy +
            radius *
            Math.sin(radians)

    };
}


/* =========================================================
   RAY TO RECTANGLE
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

    const candidates = [];


    if (dx > 0) {

        candidates.push(
            (width - cx) / dx
        );

    } else if (dx < 0) {

        candidates.push(
            -cx / dx
        );

    }


    if (dy > 0) {

        candidates.push(
            (height - cy) / dy
        );

    } else if (dy < 0) {

        candidates.push(
            -cy / dy
        );

    }


    const positive =
        candidates.filter(
            value =>
                Number.isFinite(value) &&
                value > 0
        );


    const distance =
        Math.min(
            ...positive
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
   ARC PATH
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


    let delta =
        Math.abs(
            endAngle -
            startAngle
        );


    delta %= 360;


    if (delta === 0) {

        delta =
            360;
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


/* =========================================================
   RING WIDTH
   ========================================================= */

function getRingWidth() {

    const areaRect =
        DOM.gameArea.getBoundingClientRect();


    const mapSize =
        Math.min(
            areaRect.width,
            areaRect.height
        ) *
        0.52;


    return mapSize * 0.17;
}


/* =========================================================
   TITLE ARC
   NE PAS MODIFIER LA GÉOMÉTRIE
   ========================================================= */

function createTitle(
    menu,
    cx,
    cy,
    radius
) {

    const ringWidth =
        getRingWidth();


    const titleRadius =
        radius +
        ringWidth * 0.52;


    const arcSize =
        30;


    const halfArc =
        arcSize / 2;


    const center =
        (
            menu.center % 360 +
            360
        ) % 360;


    const upperHalf =
        center >= 180 ||
        center <= 0;


    let startAngle;
    let endAngle;
    let sweep;


    if (upperHalf) {

        startAngle =
            menu.center -
            halfArc;

        endAngle =
            menu.center +
            halfArc;

        sweep =
            1;

    } else {

        startAngle =
            menu.center +
            halfArc;

        endAngle =
            menu.center -
            halfArc;

        sweep =
            0;
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


/* =========================================================
   CREATE RING
   ========================================================= */

function createRing(
    cx,
    cy,
    mapRadius,
    outerRadius
) {

    const path =
        svgElement(
            "path"
        );


    const outer = [

        `M ${cx - outerRadius} ${cy}`,

        `A ${outerRadius} ${outerRadius} 0 1 1 ${cx + outerRadius} ${cy}`,

        `A ${outerRadius} ${outerRadius} 0 1 1 ${cx - outerRadius} ${cy}`,

        "Z"

    ].join(" ");


    const inner = [

        `M ${cx - mapRadius} ${cy}`,

        `A ${mapRadius} ${mapRadius} 0 1 0 ${cx + mapRadius} ${cy}`,

        `A ${mapRadius} ${mapRadius} 0 1 0 ${cx - mapRadius} ${cy}`,

        "Z"

    ].join(" ");


    path.setAttribute(
        "d",
        `${outer} ${inner}`
    );


    path.setAttribute(
        "fill-rule",
        "evenodd"
    );


    path.classList.add(
        "menu-ring"
    );


    DOM.menuRing.appendChild(
        path
    );
}


/* =========================================================
   GUIDE CIRCLES
   ========================================================= */

function createGuides(
    cx,
    cy,
    mapRadius,
    outerRadius
) {

    const inner =
        svgElement(
            "circle"
        );


    inner.setAttribute(
        "cx",
        cx
    );

    inner.setAttribute(
        "cy",
        cy
    );

    inner.setAttribute(
        "r",
        mapRadius
    );


    inner.classList.add(
        "map-ring-guide"
    );


    DOM.menuGuides.appendChild(
        inner
    );


    const outer =
        svgElement(
            "circle"
        );


    outer.setAttribute(
        "cx",
        cx
    );

    outer.setAttribute(
        "cy",
        cy
    );

    outer.setAttribute(
        "r",
        outerRadius
    );


    outer.classList.add(
        "menu-outer-guide"
    );


    DOM.menuGuides.appendChild(
        outer
    );
}


/* =========================================================
   SEPARATORS
   ========================================================= */

function createSeparators(
    cx,
    cy,
    mapRadius,
    width,
    height
) {

    MENUS.forEach(
        menu => {

            const start =
                polarPoint(
                    cx,
                    cy,
                    mapRadius,
                    menu.center - 22.5
                );


            const end =
                rayToRectangle(
                    cx,
                    cy,
                    menu.center - 22.5,
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


/* =========================================================
   RADIAL INTERFACE
   ========================================================= */

function buildRadialInterface() {

    const areaRect =
        DOM.gameArea.getBoundingClientRect();


    const width =
        areaRect.width;


    const height =
        areaRect.height;


    const cx =
        width / 2;


    const cy =
        height / 2;


    const mapRect =
        DOM.map.getBoundingClientRect();


    const mapRadius =
        Math.min(
            mapRect.width,
            mapRect.height
        ) / 2;


    const ringWidth =
        getRingWidth();


    const outerRadius =
        mapRadius +
        ringWidth;


    DOM.radial.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );


    DOM.menuRing.innerHTML =
        "";

    DOM.menuGuides.innerHTML =
        "";

    DOM.menuTitlePaths.innerHTML =
        "";

    DOM.menuTitles.innerHTML =
        "";


    createRing(
        cx,
        cy,
        mapRadius,
        outerRadius
    );


    createGuides(
        cx,
        cy,
        mapRadius,
        outerRadius
    );


    createSeparators(
        cx,
        cy,
        mapRadius,
        width,
        height
    );


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


/* =========================================================
   OCTAGON GRID
   ========================================================= */

function generateOctagonGrid() {

    DOM.octagonGrid.innerHTML =
        "";


    const size =
        7;


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
                "octagon-cell";


            cell.dataset.x =
                x + 1;


            cell.dataset.y =
                y + 1;


            cell.dataset.id =
                `${x + 1}-${y + 1}`;


            DOM.octagonGrid.appendChild(
                cell
            );
        }
    }
}


/* =========================================================
   SQUARE GRID
   ========================================================= */

function generateSquareGrid() {

    DOM.squareGrid.innerHTML =
        "";


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


            DOM.squareGrid.appendChild(
                cell
            );
        }
    }
}


/* =========================================================
   GRID EVENTS
   ========================================================= */

function setupGridEvents() {

    const cells =
        DOM.octagonGrid.querySelectorAll(
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

                }
            );
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

}


document.addEventListener(
    "DOMContentLoaded",
    initGame
);