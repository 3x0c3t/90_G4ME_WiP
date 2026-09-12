"use strict";

/* ============================================================
   DOM
============================================================ */

const DOM = {
    game: document.getElementById("game"),
    radialInterface: document.getElementById("radial-interface"),
    radialMenus: document.getElementById("radial-menus"),
    menuSectors: document.getElementById("menu-sectors"),
    menuGuides: document.getElementById("menu-guides"),
    menuTitlePaths: document.getElementById("menu-title-paths"),
    menuTitleBackgrounds: document.getElementById("menu-title-backgrounds"),
    menuTitles: document.getElementById("menu-titles"),
    menuContent: document.getElementById("menu-content"),

    map: document.getElementById("map"),

    playerName: document.getElementById("player-name"),
    playerState: document.getElementById("player-state"),

    turnValue: document.getElementById("turn-value"),
    roundValue: document.getElementById("round-value"),
    playersValue: document.getElementById("players-value"),

    selectedCell: document.getElementById("selected-cell"),
    selectedType: document.getElementById("selected-type"),

    positionX: document.getElementById("position-x"),
    positionY: document.getElementById("position-y"),

    zoomValue: document.getElementById("zoom-value"),

    systemMessage: document.getElementById("system-message"),

    octagonCount: document.getElementById("octagon-count"),
    squareCount: document.getElementById("square-count"),

    footerStatus: document.getElementById("footer-status"),

    btnReset: document.getElementById("btn-reset"),
    btnMenu: document.getElementById("btn-menu"),
    btnSelect: document.getElementById("btn-select"),
    btnConfirm: document.getElementById("btn-confirm"),
    btnCancel: document.getElementById("btn-cancel"),
    btnZoomIn: document.getElementById("btn-zoom-in"),
    btnZoomOut: document.getElementById("btn-zoom-out")
};


/* ============================================================
   GAME STATE
============================================================ */

const GAME_STATE = {
    player: 1,
    turn: 1,
    round: 1,
    players: 2,
    menuOpen: true
};


/* ============================================================
   MENUS
============================================================ */

const MENUS = [
    {
        id: "north",
        title: "GAME",
        center: -90
    },
    {
        id: "north-east",
        title: "CELL",
        center: -45
    },
    {
        id: "east",
        title: "ACTION",
        center: 0
    },
    {
        id: "south-east",
        title: "POSITION",
        center: 45
    },
    {
        id: "south",
        title: "SYSTEM",
        center: 90
    },
    {
        id: "south-west",
        title: "GRID",
        center: 135
    },
    {
        id: "west",
        title: "MAP",
        center: 180
    },
    {
        id: "north-west",
        title: "PLAYER",
        center: 225
    }
];

const SVG_NS = "http://www.w3.org/2000/svg";


/* ============================================================
   SVG HELPERS
============================================================ */

function svgElement(name) {
    return document.createElementNS(
        SVG_NS,
        name
    );
}


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


    return {
        x:
            cx +
            dx *
            Math.min(...valid),

        y:
            cy +
            dy *
            Math.min(...valid)
    };
}


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
        ) % 360;


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

    if (!DOM.radialInterface) {
        return {
            width: 0,
            height: 0,
            cx: 0,
            cy: 0,
            mapRadius: 0
        };
    }


    const rect =
        DOM.radialInterface.getBoundingClientRect();


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
        ) * 0.26;


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
   CLEAR SVG
============================================================ */

function clearRadialLayers() {

    if (DOM.menuSectors) {
        DOM.menuSectors.innerHTML = "";
    }


    if (DOM.menuGuides) {
        DOM.menuGuides.innerHTML = "";
    }


    if (DOM.menuTitlePaths) {
        DOM.menuTitlePaths.innerHTML = "";
    }


    if (DOM.menuTitleBackgrounds) {
        DOM.menuTitleBackgrounds.innerHTML = "";
    }


    if (DOM.menuTitles) {
        DOM.menuTitles.innerHTML = "";
    }
}


/* ============================================================
   SECTORS
============================================================ */

function createSector(
    menu,
    cx,
    cy,
    mapRadius,
    width,
    height
) {

    if (!DOM.menuSectors) {
        return;
    }


    const startAngle =
        menu.center - 22.5;

    const endAngle =
        menu.center + 22.5;


    const innerStart =
        polarPoint(
            cx,
            cy,
            mapRadius,
            startAngle
        );


    const innerEnd =
        polarPoint(
            cx,
            cy,
            mapRadius,
            endAngle
        );


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


    const path =
        svgElement("path");


    path.classList.add(
        "menu-sector"
    );


    path.dataset.menu =
        menu.id;


    const d = [
        "M",
        innerStart.x,
        innerStart.y,

        "L",
        outerStart.x,
        outerStart.y,

        "L",
        outerEnd.x,
        outerEnd.y,

        "L",
        innerEnd.x,
        innerEnd.y,

        "A",
        mapRadius,
        mapRadius,

        0,
        0,
        0,

        innerStart.x,
        innerStart.y,

        "Z"
    ].join(" ");


    path.setAttribute(
        "d",
        d
    );


    path.addEventListener(
        "mouseenter",
        () => {
            setActiveMenu(
                menu.id
            );
        }
    );


    path.addEventListener(
        "mouseleave",
        () => {
            clearActiveMenu(
                menu.id
            );
        }
    );


    DOM.menuSectors.appendChild(
        path
    );
}


function createSectors(
    cx,
    cy,
    mapRadius,
    width,
    height
) {

    MENUS.forEach(
        menu => {
            createSector(
                menu,
                cx,
                cy,
                mapRadius,
                width,
                height
            );
        }
    );
}


/* ============================================================
   GUIDES
============================================================ */

function createMapGuide(
    cx,
    cy,
    radius
) {

    if (!DOM.menuGuides) {
        return;
    }


    const circle =
        svgElement("circle");


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
        "map-ring-guide"
    );


    DOM.menuGuides.appendChild(
        circle
    );
}


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
                menu.center - 22.5;


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
                svgElement("line");


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
   TITLES
============================================================ */

function createTitle(
    menu,
    cx,
    cy,
    mapRadius
) {

    if (
        !DOM.menuTitlePaths ||
        !DOM.menuTitleBackgrounds ||
        !DOM.menuTitles
    ) {
        return;
    }


    const titleRadius =
        mapRadius + 28;

    const arcSize =
        30;

    const halfArc =
        arcSize / 2;


    const normalized =
        (
            (
                menu.center % 360
            ) + 360
        ) % 360;


    const upper =
        normalized >= 180 ||
        normalized <= 0;


    let startAngle;
    let endAngle;
    let sweep;


    if (upper) {

        startAngle =
            menu.center - halfArc;

        endAngle =
            menu.center + halfArc;

        sweep = 1;

    } else {

        startAngle =
            menu.center + halfArc;

        endAngle =
            menu.center - halfArc;

        sweep = 0;
    }


    const pathId =
        `title-path-${menu.id}`;


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


    const background =
        svgElement("path");


    background.setAttribute(
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


    background.classList.add(
        "menu-title-background"
    );


    DOM.menuTitleBackgrounds.appendChild(
        background
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
   MENU CONTENT POSITION
============================================================ */

function getContentPosition(
    menu,
    cx,
    cy,
    mapRadius,
    width,
    height
) {

    const edge =
        rayToRectangle(
            cx,
            cy,
            menu.center,
            width,
            height
        );


    const edgeDistance =
        Math.hypot(
            edge.x - cx,
            edge.y - cy
        );


    const radius =
        mapRadius +
        (
            edgeDistance -
            mapRadius
        ) * 0.58;


    return polarPoint(
        cx,
        cy,
        radius,
        menu.center
    );
}


function positionRadialContent() {

    if (!DOM.menuContent) {
        return;
    }


    const geometry =
        getMapGeometry();


    MENUS.forEach(
        menu => {

            const content =
                DOM.menuContent.querySelector(
                    `.radial-content-${menu.id}`
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
                    geometry.width,
                    geometry.height
                );


            content.style.left =
                `${point.x}px`;

            content.style.top =
                `${point.y}px`;
        }
    );
}


function hideDuplicateTitles() {

    if (!DOM.menuContent) {
        return;
    }


    DOM.menuContent
        .querySelectorAll(
            ".panel-title"
        )
        .forEach(
            title => {
                title.style.display =
                    "none";
            }
        );
}


/* ============================================================
   MENU STATE
============================================================ */

function setActiveMenu(id) {

    const sector =
        DOM.menuSectors
            ? DOM.menuSectors.querySelector(
                `.menu-sector[data-menu="${id}"]`
            )
            : null;


    if (sector) {
        sector.classList.add(
            "active"
        );
    }
}


function clearActiveMenu(id) {

    const sector =
        DOM.menuSectors
            ? DOM.menuSectors.querySelector(
                `.menu-sector[data-menu="${id}"]`
            )
            : null;


    if (sector) {
        sector.classList.remove(
            "active"
        );
    }
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


    clearRadialLayers();


    createSectors(
        geometry.cx,
        geometry.cy,
        geometry.mapRadius,
        geometry.width,
        geometry.height
    );


    createMapGuide(
        geometry.cx,
        geometry.cy,
        geometry.mapRadius
    );


    createSeparators(
        geometry.cx,
        geometry.cy,
        geometry.mapRadius,
        geometry.width,
        geometry.height
    );


    createTitles(
        geometry.cx,
        geometry.cy,
        geometry.mapRadius
    );


    hideDuplicateTitles();


    positionRadialContent();
}


/* ============================================================
   GAME DISPLAY
============================================================ */

function updateGameDisplay() {

    if (DOM.turnValue) {
        DOM.turnValue.textContent =
            String(
                GAME_STATE.turn
            ).padStart(
                2,
                "0"
            );
    }


    if (DOM.roundValue) {
        DOM.roundValue.textContent =
            String(
                GAME_STATE.round
            ).padStart(
                2,
                "0"
            );
    }


    if (DOM.playersValue) {
        DOM.playersValue.textContent =
            String(
                GAME_STATE.players
            ).padStart(
                2,
                "0"
            );
    }


    if (DOM.playerName) {
        DOM.playerName.textContent =
            `PLAYER ${String(
                GAME_STATE.player
            ).padStart(
                2,
                "0"
            )}`;
    }


    if (DOM.playerState) {
        DOM.playerState.textContent =
            "READY";
    }
}


/* ============================================================
   ZOOM DISPLAY
============================================================ */

function updateZoomDisplay() {

    const zoom =
        typeof MAP !== "undefined" &&
        MAP.state
            ? MAP.state.zoom
            : 100;


    if (DOM.zoomValue) {
        DOM.zoomValue.textContent =
            String(
                zoom ?? 100
            );
    }
}


/* ============================================================
   BUTTONS
============================================================ */

function resetGame() {

    GAME_STATE.turn =
        1;

    GAME_STATE.round =
        1;


    if (
        typeof MAP !==
        "undefined"
    ) {
        MAP.reset();
    }


    updateGameDisplay();

    updateZoomDisplay();


    if (DOM.systemMessage) {
        DOM.systemMessage.textContent =
            "SYSTEM READY";
    }
}


function setupButtons() {

    if (DOM.btnReset) {

        DOM.btnReset.addEventListener(
            "click",
            resetGame
        );

    }


    if (DOM.btnMenu) {

        DOM.btnMenu.addEventListener(
            "click",
            () => {

                GAME_STATE.menuOpen =
                    !GAME_STATE.menuOpen;


                if (DOM.menuContent) {

                    DOM.menuContent.style.display =
                        GAME_STATE.menuOpen
                            ? ""
                            : "none";

                }
            }
        );

    }


    if (DOM.btnSelect) {

        DOM.btnSelect.addEventListener(
            "click",
            () => {

                if (DOM.systemMessage) {
                    DOM.systemMessage.textContent =
                        "SELECT";
                }

            }
        );

    }


    if (DOM.btnConfirm) {

        DOM.btnConfirm.addEventListener(
            "click",
            () => {

                GAME_STATE.turn +=
                    1;


                updateGameDisplay();


                if (DOM.systemMessage) {
                    DOM.systemMessage.textContent =
                        "ACTION CONFIRMED";
                }

            }
        );

    }


    if (DOM.btnCancel) {

        DOM.btnCancel.addEventListener(
            "click",
            () => {

                if (
                    typeof MAP !==
                    "undefined"
                ) {
                    MAP.clearSelection();
                }


                if (DOM.systemMessage) {
                    DOM.systemMessage.textContent =
                        "ACTION CANCELLED";
                }

            }
        );

    }


    if (DOM.btnZoomIn) {

        DOM.btnZoomIn.addEventListener(
            "click",
            () => {

                if (
                    typeof MAP !==
                    "undefined"
                ) {
                    MAP.zoomIn();
                }


                updateZoomDisplay();

            }
        );

    }


    if (DOM.btnZoomOut) {

        DOM.btnZoomOut.addEventListener(
            "click",
            () => {

                if (
                    typeof MAP !==
                    "undefined"
                ) {
                    MAP.zoomOut();
                }


                updateZoomDisplay();

            }
        );

    }
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

    setupButtons();

    updateGameDisplay();

    updateZoomDisplay();

    buildRadialInterface();


    if (DOM.footerStatus) {
        DOM.footerStatus.textContent =
            "ONLINE";
    }
}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        initGame();


        if (
            typeof MAP !==
            "undefined"
        ) {
            MAP.init();
        }

    }
);