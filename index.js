"use strict";


/* =========================================================
   DOM
   ========================================================= */

const DOM = {

    radialInterface:
        document.getElementById(
            "radial-interface"
        ),

    menuGuides:
        document.getElementById(
            "menu-guides"
        ),

    menuTitlePaths:
        document.getElementById(
            "menu-title-paths"
        ),

    menuTitles:
        document.getElementById(
            "menu-titles"
        ),

    menuInformation:
        document.getElementById(
            "menu-information"
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

    playerValue:
        document.getElementById(
            "player-value"
        ),

    contentPlayer:
        document.getElementById(
            "content-player"
        ),

    contentTurn:
        document.getElementById(
            "content-turn"
        ),

    contentRound:
        document.getElementById(
            "content-round"
        ),

    contentCell:
        document.getElementById(
            "content-cell"
        ),

    contentType:
        document.getElementById(
            "content-type"
        ),

    contentX:
        document.getElementById(
            "content-x"
        ),

    contentY:
        document.getElementById(
            "content-y"
        ),

    contentZoom:
        document.getElementById(
            "content-zoom"
        ),

    systemMessage:
        document.getElementById(
            "system-message"
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
   STATE
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

    selectedCell:
        null,

    selectedX:
        null,

    selectedY:
        null,

    zoom:
        100

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
            -90

    },

    {
        id:
            "cell",

        title:
            "CELL",

        center:
            -45

    },

    {
        id:
            "action",

        title:
            "ACTION",

        center:
            0

    },

    {
        id:
            "position",

        title:
            "POSITION",

        center:
            45

    },

    {
        id:
            "system",

        title:
            "SYSTEM",

        center:
            90

    },

    {
        id:
            "grid",

        title:
            "GRID",

        center:
            135

    },

    {
        id:
            "map",

        title:
            "MAP",

        center:
            180

    },

    {
        id:
            "player",

        title:
            "PLAYER",

        center:
            225

    }

];


/* =========================================================
   GEOMETRY
   ========================================================= */

const MAP_RADIUS_RATIO =
    0.30;


const MAP_RING_GAP =
    13;


const TITLE_RING_GAP =
    32;


const TITLE_WHEEL_ROTATION =
    22.5;


const MENU_ANGLE =
    45;


const CONTENT_ANGLE_MARGIN =
    7;


/*
   Dimensions du cartouche titre.
*/

const TITLE_PADDING_X =
    13;


const TITLE_PADDING_Y =
    6;


/* =========================================================
   SVG
   ========================================================= */

const SVG_NS =
    "http://www.w3.org/2000/svg";


function svgElement(
    name
) {

    return document.createElementNS(
        SVG_NS,
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
            radius *
            Math.cos(
                radians
            ),

        y:
            cy +
            radius *
            Math.sin(
                radians
            )

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
        Math.cos(
            radians
        );


    const dy =
        Math.sin(
            radians
        );


    const distances = [];


    if (dx > 0) {

        distances.push(
            (
                width -
                cx
            ) /
            dx
        );

    }
    else if (dx < 0) {

        distances.push(
            -cx /
            dx
        );

    }


    if (dy > 0) {

        distances.push(
            (
                height -
                cy
            ) /
            dy
        );

    }
    else if (dy < 0) {

        distances.push(
            -cy /
            dy
        );

    }


    const valid =
        distances.filter(
            value =>
                Number.isFinite(
                    value
                ) &&
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
        delta >
        180
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
   MAP GEOMETRY
   ========================================================= */

function getMapGeometry() {

    const rect =
        DOM.radialInterface
            .getBoundingClientRect();


    const width =
        rect.width;


    const height =
        rect.height;


    const cx =
        width /
        2;


    const cy =
        height /
        2;


    let mapRadius =
        Math.min(
            width,
            height
        ) *
        MAP_RADIUS_RATIO;


    if (
        DOM.map
    ) {

        const mapRect =
            DOM.map
                .getBoundingClientRect();


        if (
            mapRect.width > 0 &&
            mapRect.height > 0
        ) {

            mapRadius =
                Math.min(
                    mapRect.width,
                    mapRect.height
                ) /
                2;

        }

    }


    return {

        width,

        height,

        cx,

        cy,

        mapRadius

    };

}


/* =========================================================
   OUTER RADIUS
   ========================================================= */

function getOuterRadius(
    mapRadius,
    width,
    height
) {

    const available =
        Math.min(
            width,
            height
        ) /
        2;


    const depth =
        Math.min(
            155,

            Math.max(
                95,

                available -
                mapRadius
            )
        );


    return (
        mapRadius +
        depth
    );

}


/* =========================================================
   CLEAR RADIAL
   ========================================================= */

function clearRadialLayers() {

    DOM.menuGuides.innerHTML =
        "";

    DOM.menuTitlePaths.innerHTML =
        "";

    DOM.menuTitles.innerHTML =
        "";

}


/* =========================================================
   MAP CIRCLE
   ========================================================= */

function createMapCircle(
    cx,
    cy,
    radius
) {

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


/* =========================================================
   OUTER CIRCLE
   ========================================================= */

function createOuterCircle(
    cx,
    cy,
    radius
) {

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


/* =========================================================
   TITLE PATH
   ========================================================= */

function createTitlePath(
    menu,
    cx,
    cy,
    radius
) {

    const path =
        svgElement(
            "path"
        );


    const pathId =
        `title-path-${menu.id}`;


    const arcSize =
        26;


    const halfArc =
        arcSize /
        2;


    const startAngle =
        menu.center -
        halfArc;


    const endAngle =
        menu.center +
        halfArc;


    path.setAttribute(
        "id",
        pathId
    );


    path.setAttribute(
        "d",

        arcPath(
            cx,
            cy,
            radius,
            startAngle,
            endAngle,
            1
        )
    );


    path.classList.add(
        "menu-title-path"
    );


    DOM.menuTitlePaths.appendChild(
        path
    );


    return pathId;

}


/* =========================================================
   TITLE
   ========================================================= */

function createTitle(
    menu,
    cx,
    cy,
    radius
) {

    /*
       Le titre tourne avec la roue.
    */

    const angle =
        menu.center +
        TITLE_WHEEL_ROTATION;


    const position =
        polarPoint(
            cx,
            cy,
            radius,
            angle
        );


    /*
       Rotation tangentielle.
    */

    let rotation =
        angle +
        90;


    /*
       Lecture normale
       dans la moitié basse.
    */

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


    /*
       Groupe global du titre.
    */

    const group =
        svgElement(
            "g"
        );


    group.classList.add(
        "menu-title-group"
    );


    group.setAttribute(
        "transform",

        [
            "translate(",
            position.x,
            ",",
            position.y,
            ") rotate(",
            rotation,
            ")"

        ].join("")
    );


    /*
       Largeur estimée du texte.
    */

    const estimatedWidth =
        menu.title.length *
        7.4 +
        TITLE_PADDING_X *
        2;


    const backgroundWidth =
        Math.max(
            42,
            estimatedWidth
        );


    const backgroundHeight =
        24;


    /*
       BACKGROUND
    */

    const background =
        svgElement(
            "rect"
        );


    background.classList.add(
        "menu-title-background"
    );


    background.setAttribute(
        "x",
        -backgroundWidth / 2
    );


    background.setAttribute(
        "y",
        -backgroundHeight / 2
    );


    background.setAttribute(
        "width",
        backgroundWidth
    );


    background.setAttribute(
        "height",
        backgroundHeight
    );


    group.appendChild(
        background
    );


    /*
       BORDER INTERNE
    */

    const inner =
        svgElement(
            "rect"
        );


    inner.classList.add(
        "menu-title-background-inner"
    );


    inner.setAttribute(
        "x",
        -backgroundWidth / 2 + 2
    );


    inner.setAttribute(
        "y",
        -backgroundHeight / 2 + 2
    );


    inner.setAttribute(
        "width",
        backgroundWidth - 4
    );


    inner.setAttribute(
        "height",
        backgroundHeight - 4
    );


    group.appendChild(
        inner
    );


    /*
       TEXTE
    */

    const text =
        svgElement(
            "text"
        );


    text.classList.add(
        "menu-title"
    );


    text.setAttribute(
        "x",
        0
    );


    text.setAttribute(
        "y",
        0
    );


    text.setAttribute(
        "text-anchor",
        "middle"
    );


    text.setAttribute(
        "dominant-baseline",
        "middle"
    );


    text.textContent =
        menu.title;


    group.appendChild(
        text
    );


    DOM.menuTitles.appendChild(
        group
    );

}


/* =========================================================
   TITLES
   ========================================================= */

function createTitles(
    cx,
    cy,
    mapRadius
) {

    const titleRadius =
        mapRadius +
        MAP_RING_GAP +
        TITLE_RING_GAP;


    /*
       On conserve la roue de titres
       avec sa rotation de 22.5°.
    */

    const wheel =
        svgElement(
            "g"
        );


    wheel.setAttribute(
        "transform",

        [
            "rotate(",
            TITLE_WHEEL_ROTATION,
            " ",
            cx,
            " ",
            cy,
            ")"

        ].join("")
    );


    DOM.menuTitles.appendChild(
        wheel
    );


    MENUS.forEach(
        menu => {

            /*
               Création directe dans
               la roue.
            */

            const angle =
                menu.center;


            const position =
                polarPoint(
                    cx,
                    cy,
                    titleRadius,
                    angle
                );


            let rotation =
                angle +
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
                    "g"
                );


            group.classList.add(
                "menu-title-group"
            );


            group.setAttribute(
                "transform",

                [
                    "translate(",
                    position.x,
                    ",",
                    position.y,
                    ") rotate(",
                    rotation,
                    ")"

                ].join("")
            );


            const backgroundWidth =
                Math.max(
                    42,
                    menu.title.length *
                    7.4 +
                    TITLE_PADDING_X *
                    2
                );


            const backgroundHeight =
                24;


            const background =
                svgElement(
                    "rect"
                );


            background.classList.add(
                "menu-title-background"
            );


            background.setAttribute(
                "x",
                -backgroundWidth / 2
            );


            background.setAttribute(
                "y",
                -backgroundHeight / 2
            );


            background.setAttribute(
                "width",
                backgroundWidth
            );


            background.setAttribute(
                "height",
                backgroundHeight
            );


            group.appendChild(
                background
            );


            const inner =
                svgElement(
                    "rect"
                );


            inner.classList.add(
                "menu-title-background-inner"
            );


            inner.setAttribute(
                "x",
                -backgroundWidth / 2 + 2
            );


            inner.setAttribute(
                "y",
                -backgroundHeight / 2 + 2
            );


            inner.setAttribute(
                "width",
                backgroundWidth - 4
            );


            inner.setAttribute(
                "height",
                backgroundHeight - 4
            );


            group.appendChild(
                inner
            );


            const text =
                svgElement(
                    "text"
                );


            text.classList.add(
                "menu-title"
            );


            text.setAttribute(
                "x",
                0
            );


            text.setAttribute(
                "y",
                0
            );


            text.textContent =
                menu.title;


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
   CONTENT POSITION
   ========================================================= */

function getContentPosition(
    menu,
    cx,
    cy,
    mapRadius,
    outerRadius
) {

    const radialDepth =
        outerRadius -
        mapRadius;


    const radius =
        mapRadius +
        radialDepth *
        0.63;


    return polarPoint(
        cx,
        cy,
        radius,
        menu.center
    );

}


/* =========================================================
   CONTENT SIZE
   ========================================================= */

function getContentSize(
    radius,
    outerRadius,
    width
) {

    const halfAngle =
        (
            MENU_ANGLE /
            2
        ) -
        CONTENT_ANGLE_MARGIN;


    const halfAngleRad =
        halfAngle *
        Math.PI /
        180;


    const chord =
        2 *
        radius *
        Math.sin(
            halfAngleRad
        );


    let panelWidth =
        Math.min(
            126,
            chord
        );


    if (
        width < 900
    ) {

        panelWidth =
            Math.min(
                108,
                chord
            );

    }


    if (
        width < 600
    ) {

        panelWidth =
            Math.min(
                82,
                chord
            );

    }


    return {

        width:
            Math.max(
                64,
                panelWidth
            ),

        height:
            Math.min(
                92,
                Math.max(
                    58,
                    outerRadius -
                    radius
                )
            )

    };

}


/* =========================================================
   POSITION CONTENT
   ========================================================= */

function positionRadialContent() {

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

            const content =
                DOM.menuInformation
                    .querySelector(
                        `.radial-content-${menu.id}`
                    );


            if (
                !content
            ) {

                return;

            }


            const position =
                getContentPosition(
                    menu,
                    geometry.cx,
                    geometry.cy,
                    geometry.mapRadius,
                    outerRadius
                );


            const distance =
                Math.hypot(
                    position.x -
                    geometry.cx,

                    position.y -
                    geometry.cy
                );


            const size =
                getContentSize(
                    distance,
                    outerRadius,
                    geometry.width
                );


            content.style.left =
                `${position.x}px`;


            content.style.top =
                `${position.y}px`;


            content.style.width =
                `${size.width}px`;


            content.style.minHeight =
                `${size.height}px`;


            content.style.transform =
                "translate(-50%, -50%)";

        }
    );

}


/* =========================================================
   RADIAL BUILD
   ========================================================= */

function buildRadialInterface() {

    const geometry =
        getMapGeometry();


    clearRadialLayers();


    createMapCircle(
        geometry.cx,
        geometry.cy,
        geometry.mapRadius +
        MAP_RING_GAP
    );


    const outerRadius =
        getOuterRadius(
            geometry.mapRadius,
            geometry.width,
            geometry.height
        );


    createOuterCircle(
        geometry.cx,
        geometry.cy,
        outerRadius
    );


    createSeparators(
        geometry.cx,
        geometry.cy,
        geometry.mapRadius +
        MAP_RING_GAP,
        geometry.width,
        geometry.height
    );


    createTitles(
        geometry.cx,
        geometry.cy,
        geometry.mapRadius
    );


    positionRadialContent();

}


/* =========================================================
   OCTAGON GRID
   ========================================================= */

function generateOctagonGrid() {

    if (
        DOM.octagonGrid
            .querySelector(
                ".octagon-cell"
            )
    ) {

        return;

    }


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
   SQUARE GRID
   ========================================================= */

function generateSquareGrid() {

    if (
        DOM.squareGrid
            .querySelector(
                ".square-cell"
            )
    ) {

        return;

    }


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
   CELL
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


    updateContent();


    DOM.systemMessage.textContent =
        "CELL SELECTED";

}


/* =========================================================
   UPDATE
   ========================================================= */

function updateContent() {

    DOM.playerValue.textContent =
        `P${GAME_STATE.player}`;


    DOM.contentPlayer.textContent =
        `P${GAME_STATE.player}`;


    DOM.contentTurn.textContent =
        String(
            GAME_STATE.turn
        ).padStart(
            2,
            "0"
        );


    DOM.contentRound.textContent =
        String(
            GAME_STATE.round
        ).padStart(
            2,
            "0"
        );


    DOM.contentZoom.textContent =
        `${GAME_STATE.zoom}%`;


    if (
        GAME_STATE.selectedCell
    ) {

        DOM.contentCell.textContent =
            GAME_STATE.selectedCell;


        DOM.contentType.textContent =
            "EMPTY";


        DOM.contentX.textContent =
            String(
                GAME_STATE.selectedX
            ).padStart(
                2,
                "0"
            );


        DOM.contentY.textContent =
            String(
                GAME_STATE.selectedY
            ).padStart(
                2,
                "0"
            );

    }

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


    updateContent();

}


function cancelAction() {

    DOM.systemMessage.textContent =
        "ACTION CANCELLED";

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
        [
            "translate(-50%, -50%)",
            `scale(${GAME_STATE.zoom / 100})`

        ].join(" ");


    updateContent();

}


/* =========================================================
   EVENTS
   ========================================================= */

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
            GAME_STATE.zoom +
            10
        )
);


DOM.btnZoomOut.addEventListener(
    "click",
    () =>
        setZoom(
            GAME_STATE.zoom -
            10
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
                buildRadialInterface,
                50
            );

    }
);


/* =========================================================
   INIT
   ========================================================= */

function init() {

    generateOctagonGrid();

    generateSquareGrid();

    updateContent();

    buildRadialInterface();

}


init();