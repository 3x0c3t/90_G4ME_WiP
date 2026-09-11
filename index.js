"use strict";


/* =========================================================
   CONFIG
   ========================================================= */

const GAME_CONFIG = {

    octagonRows: 7,
    octagonColumns: 7,

    squareRows: 8,
    squareColumns: 8
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

    selectedY: null
};


/* =========================================================
   DOM
   ========================================================= */

const DOM = {

    game:
        document.getElementById("game"),

    map:
        document.getElementById("map"),

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

    octagonGrid:
        document.getElementById("octagon-grid"),

    squareGrid:
        document.getElementById("square-grid"),

    playerValue:
        document.getElementById("player-value")
};


/* =========================================================
   MENUS
   =========================================================

   Chaque menu est centré sur un angle.

   Haut gauche :
   -112.5°

   Haut :
   -90°

   Haut droit :
   -45°

   Droite :
   0°

   etc.

   Le menu haut gauche possède donc
   naturellement un côté vers le HAUT
   et un côté vers la GAUCHE.
   ========================================================= */

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


/* =========================================================
   UTILS
   ========================================================= */

function svgElement(
    name
) {

    return document.createElementNS(
        "http://www.w3.org/2000/svg",
        name
    );
}


function polarPoint(
    cx,
    cy,
    radius,
    angle
) {

    const rad =
        angle * Math.PI / 180;

    return {

        x:
            cx +
            Math.cos(rad) * radius,

        y:
            cy +
            Math.sin(rad) * radius
    };
}


/* =========================================================
   RAY / RECTANGLE
   =========================================================

   Trouve où un rayon partant du centre
   rencontre le bord de la zone disponible.
   ========================================================= */

function rayToRectangle(
    cx,
    cy,
    angle,
    width,
    height
) {

    const rad =
        angle * Math.PI / 180;

    const dx =
        Math.cos(rad);

    const dy =
        Math.sin(rad);

    const candidates = [];


    if (dx > 0) {

        candidates.push(
            (width - cx) / dx
        );

    } else if (dx < 0) {

        candidates.push(
            (0 - cx) / dx
        );
    }


    if (dy > 0) {

        candidates.push(
            (height - cy) / dy
        );

    } else if (dy < 0) {

        candidates.push(
            (0 - cy) / dy
        );
    }


    const positive =
        candidates.filter(
            value =>
                Number.isFinite(value) &&
                value > 0
        );


    const distance =
        Math.min(...positive);


    return {

        x:
            cx + dx * distance,

        y:
            cy + dy * distance
    };
}


/* =========================================================
   DISTANCE
   ========================================================= */

function distance(
    a,
    b
) {

    return Math.hypot(
        b.x - a.x,
        b.y - a.y
    );
}


/* =========================================================
   OUTER BOUNDARY
   =========================================================

   On ne relie PAS simplement les deux
   extrémités par une ligne.

   Pour le menu haut gauche :

       cercle
         ╲
          ╲
           ╲
            └──────── bord haut
            │
            │
            │
            └──────── bord gauche

   Le chemin extérieur suit donc le bord
   réel de la zone disponible.
   ========================================================= */

function rectangleBoundaryPath(
    start,
    end,
    width,
    height
) {

    const EPS = 2;

    const points = [];

    /*
        Les quatre coins.
    */

    const corners = [

        {
            x: 0,
            y: 0,
            name: "TL"
        },

        {
            x: width,
            y: 0,
            name: "TR"
        },

        {
            x: width,
            y: height,
            name: "BR"
        },

        {
            x: 0,
            y: height,
            name: "BL"
        }

    ];


    /*
        Cherche les coins qui appartiennent
        au même arc extérieur.
    */

    const candidates = [];


    corners.forEach(
        corner => {

            const ds =
                distance(
                    start,
                    corner
                );

            const de =
                distance(
                    end,
                    corner
                );

            if (
                ds < Math.min(width, height) * 1.5 ||
                de < Math.min(width, height) * 1.5
            ) {

                candidates.push(
                    corner
                );
            }
        }
    );


    /*
        Détermination du secteur
        par les coordonnées des points.
    */

    const top =
        Math.abs(start.y) < EPS ||
        Math.abs(end.y) < EPS;

    const bottom =
        Math.abs(start.y - height) < EPS ||
        Math.abs(end.y - height) < EPS;

    const left =
        Math.abs(start.x) < EPS ||
        Math.abs(end.x) < EPS;

    const right =
        Math.abs(start.x - width) < EPS ||
        Math.abs(end.x - width) < EPS;


    /*
        Cas haut gauche.
    */

    if (top && left) {

        return [
            `L ${start.x} ${start.y}`,
            `L 0 0`,
            `L ${end.x} ${end.y}`
        ].join(" ");
    }


    /*
        Cas haut droit.
    */

    if (top && right) {

        return [
            `L ${start.x} ${start.y}`,
            `L ${width} 0`,
            `L ${end.x} ${end.y}`
        ].join(" ");
    }


    /*
        Cas bas droit.
    */

    if (bottom && right) {

        return [
            `L ${start.x} ${start.y}`,
            `L ${width} ${height}`,
            `L ${end.x} ${end.y}`
        ].join(" ");
    }


    /*
        Cas bas gauche.
    */

    if (bottom && left) {

        return [
            `L ${start.x} ${start.y}`,
            `L 0 ${height}`,
            `L ${end.x} ${end.y}`
        ].join(" ");
    }


    /*
        Pour les menus centraux des côtés,
        la frontière extérieure est simplement
        le bord correspondant.
    */

    if (top) {

        return [
            `L ${start.x} ${start.y}`,
            `L ${end.x} ${end.y}`
        ].join(" ");
    }


    if (bottom) {

        return [
            `L ${start.x} ${start.y}`,
            `L ${end.x} ${end.y}`
        ].join(" ");
    }


    if (left) {

        return [
            `L ${start.x} ${start.y}`,
            `L ${end.x} ${end.y}`
        ].join(" ");
    }


    if (right) {

        return [
            `L ${start.x} ${start.y}`,
            `L ${end.x} ${end.y}`
        ].join(" ");
    }


    return [
        `L ${start.x} ${start.y}`,
        `L ${end.x} ${end.y}`
    ].join(" ");
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
    sweep = 1
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
        endAngle - startAngle;

    if (delta < 0) {
        delta += 360;
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
   SECTOR
   ========================================================= */

function createSector(
    cx,
    cy,
    radius,
    width,
    height,
    startAngle,
    endAngle,
    menuDepth
) {

    const innerStart =
        polarPoint(
            cx,
            cy,
            radius,
            startAngle
        );

    const innerEnd =
        polarPoint(
            cx,
            cy,
            radius,
            endAngle
        );


    /*
        Rayon suffisamment grand pour
        atteindre les bords.
    */

    const outerStart =
        rayToRectangle(
            cx,
            cy,
            startAngle,
            width,
            height
        );

    const outerEnd =
        rayToRectangle(
            cx,
            cy,
            endAngle,
            width,
            height
        );


    /*
        Le vrai chemin :

        1. cercle intérieur
        2. rayon vers le bord
        3. bord extérieur
        4. rayon retour
        5. cercle intérieur
    */

    const path = [

        "M",
        innerStart.x,
        innerStart.y,

        "L",
        outerStart.x,
        outerStart.y,

        rectangleBoundaryPath(
            outerStart,
            outerEnd,
            width,
            height
        ),

        "L",
        innerEnd.x,
        innerEnd.y,

        "A",
        radius,
        radius,
        0,
        0,
        0,

        innerStart.x,
        innerStart.y,

        "Z"

    ].join(" ");


    return {

        path,

        innerStart,

        innerEnd,

        outerStart,

        outerEnd
    };
}


/* =========================================================
   TITLE ARC
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
        Le titre est légèrement à
        l'extérieur de la MAP.

        Il épouse donc exactement
        la même géométrie circulaire.
    */

    const titleRadius =
        radius + 28;


    /*
        On réduit l'arc pour laisser
        de l'espace aux séparations.
    */

    const start =
        menu.center - 15;

    const end =
        menu.center + 15;


    const path =
        svgElement("path");

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
            start,
            end,
            1
        )
    );

    path.classList.add(
        "menu-title-path"
    );

    DOM.menuTitlePaths.appendChild(
        path
    );


    const text =
        svgElement("text");

    text.classList.add(
        "menu-title"
    );


    const textPath =
        svgElement("textPath");

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
   MENU INFORMATION
   ========================================================= */

function addText(
    group,
    x,
    y,
    text,
    className,
    dataValue = null
) {

    const element =
        svgElement("text");

    element.setAttribute(
        "x",
        x
    );

    element.setAttribute(
        "y",
        y
    );

    element.classList.add(
        className
    );

    element.textContent =
        text;

    if (dataValue) {

        element.dataset.value =
            dataValue;
    }

    group.appendChild(
        element
    );
}


function createMenuInformation(
    menu,
    cx,
    cy,
    radius
) {

    const group =
        svgElement("g");

    group.dataset.menu =
        menu.id;


    const contentRadius =
        radius + 75;


    const point =
        polarPoint(
            cx,
            cy,
            contentRadius,
            menu.center
        );


    const x =
        point.x;

    const y =
        point.y;


    switch (menu.id) {

        case "game":

            addText(
                group,
                x,
                y - 12,
                "TURN",
                "menu-info-label"
            );

            addText(
                group,
                x,
                y + 1,
                "01",
                "menu-info-value",
                "turn"
            );

            addText(
                group,
                x,
                y + 17,
                "ROUND 01",
                "menu-info-label",
                "round"
            );

            break;


        case "cell":

            addText(
                group,
                x,
                y - 12,
                "CELL",
                "menu-info-label"
            );

            addText(
                group,
                x,
                y + 2,
                "---",
                "menu-info-value",
                "cell"
            );

            addText(
                group,
                x,
                y + 17,
                "---",
                "menu-info-label",
                "type"
            );

            break;


        case "action":

            addText(
                group,
                x,
                y - 18,
                "SELECT",
                "menu-info-value"
            );

            addText(
                group,
                x,
                y - 2,
                "CONFIRM",
                "menu-info-value"
            );

            addText(
                group,
                x,
                y + 14,
                "CANCEL",
                "menu-info-value"
            );

            break;


        case "position":

            addText(
                group,
                x,
                y - 10,
                "X --",
                "menu-info-value",
                "x"
            );

            addText(
                group,
                x,
                y + 9,
                "Y --",
                "menu-info-value",
                "y"
            );

            break;


        case "system":

            addText(
                group,
                x,
                y - 10,
                "SYSTEM",
                "menu-info-label"
            );

            addText(
                group,
                x,
                y + 7,
                "READY",
                "menu-info-accent"
            );

            break;


        case "grid":

            addText(
                group,
                x,
                y - 10,
                "OCTAGONS",
                "menu-info-label"
            );

            addText(
                group,
                x,
                y + 7,
                "7 × 7",
                "menu-info-value"
            );

            break;


        case "map":

            addText(
                group,
                x,
                y - 12,
                "ZOOM",
                "menu-info-label"
            );

            addText(
                group,
                x,
                y + 7,
                "100%",
                "menu-info-accent"
            );

            break;


        case "player":

            addText(
                group,
                x,
                y - 12,
                "PLAYER",
                "menu-info-label"
            );

            addText(
                group,
                x,
                y + 7,
                "P1",
                "menu-info-accent",
                "player"
            );

            break;
    }


    DOM.menuInformation.appendChild(
        group
    );
}


/* =========================================================
   BUILD RADIAL INTERFACE
   ========================================================= */

function buildRadialInterface() {

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


    const cx =
        width / 2;

    const cy =
        height / 2;


    /*
        Rayon réel de la MAP.

        C'est ce rayon qui devient
        la frontière intérieure
        de TOUS les menus.
    */

    const radius =
        Math.min(
            mapRect.width,
            mapRect.height
        ) / 2;


    const menuDepth =
        parseFloat(
            getComputedStyle(
                document.documentElement
            )
            .getPropertyValue(
                "--menu-depth"
            )
        );


    DOM.radialMenus.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );


    DOM.menuSectors.innerHTML =
        "";

    DOM.menuGuides.innerHTML =
        "";

    DOM.menuTitlePaths.innerHTML =
        "";

    DOM.menuTitles.innerHTML =
        "";

    DOM.menuInformation.innerHTML =
        "";


    /*
        =====================================================
        CERCLE CENTRAL
        =====================================================
    */

    const circle =
        svgElement("circle");

    circle.classList.add(
        "map-circle-guide"
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

    DOM.menuGuides.appendChild(
        circle
    );


    /*
        =====================================================
        8 MENUS
        =====================================================
    */

    MENUS.forEach(
        menu => {

            const start =
                menu.center - 22.5;

            const end =
                menu.center + 22.5;


            const geometry =
                createSector(
                    cx,
                    cy,
                    radius,
                    width,
                    height,
                    start,
                    end,
                    menuDepth
                );


            /*
                Secteur.
            */

            const sector =
                svgElement("path");

            sector.classList.add(
                "menu-sector"
            );

            sector.dataset.menu =
                menu.id;

            sector.setAttribute(
                "d",
                geometry.path
            );


            sector.addEventListener(
                "click",
                () => {

                    activateMenu(
                        menu.id
                    );
                }
            );


            DOM.menuSectors.appendChild(
                sector
            );


            /*
                Séparation radiale.
            */

            const separator =
                svgElement("line");

            separator.classList.add(
                "menu-separator"
            );

            separator.setAttribute(
                "x1",
                geometry.innerStart.x
            );

            separator.setAttribute(
                "y1",
                geometry.innerStart.y
            );

            separator.setAttribute(
                "x2",
                geometry.outerStart.x
            );

            separator.setAttribute(
                "y2",
                geometry.outerStart.y
            );

            DOM.menuGuides.appendChild(
                separator
            );


            /*
                TITRE SUR LE CERCLE.
            */

            createTitle(
                menu,
                cx,
                cy,
                radius
            );


            /*
                Informations.
            */

            createMenuInformation(
                menu,
                cx,
                cy,
                radius
            );
        }
    );


    /*
        Dernière séparation.
    */

    const last =
        MENUS[MENUS.length - 1];

    const lastAngle =
        last.center + 22.5;

    const lastInner =
        polarPoint(
            cx,
            cy,
            radius,
            lastAngle
        );

    const lastOuter =
        rayToRectangle(
            cx,
            cy,
            lastAngle,
            width,
            height
        );

    const lastSeparator =
        svgElement("line");

    lastSeparator.classList.add(
        "menu-separator"
    );

    lastSeparator.setAttribute(
        "x1",
        lastInner.x
    );

    lastSeparator.setAttribute(
        "y1",
        lastInner.y
    );

    lastSeparator.setAttribute(
        "x2",
        lastOuter.x
    );

    lastSeparator.setAttribute(
        "y2",
        lastOuter.y
    );

    DOM.menuGuides.appendChild(
        lastSeparator
    );


    updateInterface();
}


/* =========================================================
   MENU
   ========================================================= */

function activateMenu(
    menuName
) {

    document
        .querySelectorAll(
            ".menu-sector"
        )
        .forEach(
            sector => {

                sector.classList.remove(
                    "active"
                );
            }
        );


    const selected =
        document.querySelector(
            `.menu-sector[data-menu="${menuName}"]`
        );


    if (selected) {

        selected.classList.add(
            "active"
        );
    }
}


/* =========================================================
   GRID
   ========================================================= */

function generateOctagonGrid() {

    DOM.octagonGrid.innerHTML =
        "";

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

            rowElement.classList.add(
                "offset"
            );
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


            cell.dataset.id =
                `O${row + 1}-${column + 1}`;

            cell.dataset.row =
                row + 1;

            cell.dataset.column =
                column + 1;


            rowElement.appendChild(
                cell
            );
        }


        DOM.octagonGrid.appendChild(
            rowElement
        );
    }
}


function generateSquareGrid() {

    DOM.squareGrid.innerHTML =
        "";

    for (
        let i = 0;
        i <
        GAME_CONFIG.squareRows *
        GAME_CONFIG.squareColumns;
        i++
    ) {

        const cell =
            document.createElement("div");

        cell.className =
            "square-cell";

        DOM.squareGrid.appendChild(
            cell
        );
    }
}


/* =========================================================
   CELL
   ========================================================= */

function setupGridEvents() {

    DOM.octagonGrid.addEventListener(
        "click",
        event => {

            const cell =
                event.target.closest(
                    ".octagon-cell"
                );

            if (!cell) {
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


            gameState.selectedCell =
                cell.dataset.id;

            gameState.selectedType =
                "OCTAGON";

            gameState.selectedX =
                cell.dataset.column;

            gameState.selectedY =
                cell.dataset.row;


            updateInterface();
        }
    );
}


/* =========================================================
   UPDATE
   ========================================================= */

function updateInterface() {

    DOM.playerValue.textContent =
        `P${gameState.player}`;


    DOM.menuInformation
        .querySelectorAll(
            "[data-value]"
        )
        .forEach(
            element => {

                const type =
                    element.dataset.value;


                if (type === "player") {

                    element.textContent =
                        `P${gameState.player}`;
                }


                if (type === "turn") {

                    element.textContent =
                        String(
                            gameState.turn
                        ).padStart(
                            2,
                            "0"
                        );
                }


                if (type === "round") {

                    element.textContent =
                        `ROUND ${
                            String(
                                gameState.round
                            ).padStart(
                                2,
                                "0"
                            )
                        }`;
                }


                if (type === "cell") {

                    element.textContent =
                        gameState.selectedCell ||
                        "---";
                }


                if (type === "type") {

                    element.textContent =
                        gameState.selectedType ||
                        "---";
                }


                if (type === "x") {

                    element.textContent =
                        `X ${
                            gameState.selectedX ||
                            "--"
                        }`;
                }


                if (type === "y") {

                    element.textContent =
                        `Y ${
                            gameState.selectedY ||
                            "--"
                        }`;
                }
            }
        );
}


/* =========================================================
   RESIZE
   ========================================================= */

let resizeTimer = null;

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
                30
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

    updateInterface();
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