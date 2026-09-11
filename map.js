"use strict";


const MAP = {

    /* ========================================================
       STATE
       ======================================================== */

    state: {
        selectedCell: null,
        selectedType: null,
        selectedX: null,
        selectedY: null,
        zoom: 100
    },


    /* ========================================================
       DOM
       ======================================================== */

    DOM: {
        map:
            document.getElementById("map"),

        octagonGrid:
            document.getElementById("octagon-grid"),

        squareGrid:
            document.getElementById("square-grid"),

        selectedCell:
            document.getElementById("selected-cell"),

        selectedType:
            document.getElementById("selected-type"),

        positionX:
            document.getElementById("position-x"),

        positionY:
            document.getElementById("position-y"),

        zoomValue:
            document.getElementById("zoom-value"),

        systemMessage:
            document.getElementById("system-message"),

        btnZoomIn:
            document.getElementById("btn-zoom-in"),

        btnZoomOut:
            document.getElementById("btn-zoom-out"),

        octagonCount:
            document.getElementById("octagon-count"),

        squareCount:
            document.getElementById("square-count")
    },


    /* ========================================================
       CONFIGURATION
       ======================================================== */

    config: {

        rows: 11,

        columns: 11,

        cellType: "HEXAGON"
    },


    /* ========================================================
       INIT
       ======================================================== */

    init() {

        this.createHexagonGrid();

        this.bindEvents();

        this.observeResize();

        this.updateInterface();
    },


    /* ========================================================
       GET STATE
       ======================================================== */

    getState() {

        return {
            selectedCell:
                this.state.selectedCell,

            selectedType:
                this.state.selectedType,

            selectedX:
                this.state.selectedX,

            selectedY:
                this.state.selectedY,

            zoom:
                this.state.zoom
        };
    },


    /* ========================================================
       CREATE HONEYCOMB
       ======================================================== */

    createHexagonGrid() {

        const grid =
            this.DOM.octagonGrid;

        if (!grid) {
            return;
        }


        grid.innerHTML = "";


        const total =
            this.config.rows *
            this.config.columns;


        for (
            let y = 1;
            y <= this.config.rows;
            y++
        ) {

            for (
                let x = 1;
                x <= this.config.columns;
                x++
            ) {

                const cell =
                    document.createElement(
                        "div"
                    );


                cell.className =
                    "octagon-cell";


                cell.dataset.x =
                    String(x);

                cell.dataset.y =
                    String(y);

                cell.dataset.type =
                    this.config.cellType;

                cell.dataset.id =
                    `X${x}-Y${y}`;


                cell.setAttribute(
                    "role",
                    "button"
                );


                cell.setAttribute(
                    "aria-label",
                    `Cellule X${x} Y${y}`
                );


                cell.addEventListener(
                    "click",
                    () => {

                        this.selectCell(
                            cell
                        );
                    }
                );


                grid.appendChild(
                    cell
                );
            }
        }


        if (this.DOM.octagonCount) {

            this.DOM.octagonCount.textContent =
                String(total);
        }


        if (this.DOM.squareCount) {

            this.DOM.squareCount.textContent =
                "0";
        }


        requestAnimationFrame(
            () => {

                this.layoutHoneycomb();
            }
        );
    },


    /* ========================================================
       HONEYCOMB GEOMETRY
       ======================================================== */

    layoutHoneycomb() {

        const map =
            this.DOM.map;

        const grid =
            this.DOM.octagonGrid;


        if (!map || !grid) {
            return;
        }


        const rect =
            map.getBoundingClientRect();


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
         * La map est circulaire.
         *
         * On utilise son diamètre réel.
         */

        const diameter =
            Math.min(
                width,
                height
            );


        const rows =
            this.config.rows;

        const columns =
            this.config.columns;


        /*
         * ====================================================
         * HEXAGONE FLAT-TOP
         * ====================================================
         *
         * largeur hexagone = W
         *
         * hauteur hexagone = W * sqrt(3) / 2
         *
         * pas horizontal = 3/4 W
         *
         * décalage vertical = H/2
         *
         * ====================================================
         */


        const sqrt3 =
            Math.sqrt(3);


        /*
         * IMPORTANT :
         *
         * La largeur est maintenant prioritaire.
         *
         * 11 colonnes :
         *
         * 10 intervalles * 0.75W
         * + 1 largeur W
         *
         * = 8.5W
         *
         * Donc :
         *
         * W = diamètre / 8.5
         *
         * Les cellules remplissent réellement
         * toute la largeur disponible.
         */

        const cellWidth =
            diameter /
            (
                (
                    columns - 1
                ) * 0.75
                +
                1
            );


        const cellHeight =
            cellWidth *
            sqrt3 /
            2;


        /*
         * Distance horizontale entre
         * deux centres.
         */

        const horizontalStep =
            cellWidth *
            0.75;


        /*
         * Distance verticale entre
         * deux centres dans une même colonne.
         */

        const verticalStep =
            cellHeight;


        /*
         * Hauteur totale réelle de la grille.
         *
         * Une colonne sur deux est décalée
         * de H/2.
         */

        const gridHeight =
            (
                rows - 1
            ) *
            verticalStep
            +
            cellHeight
            +
            cellHeight / 2;


        /*
         * Largeur totale exacte.
         */

        const gridWidth =
            (
                columns - 1
            ) *
            horizontalStep
            +
            cellWidth;


        /*
         * Centrage horizontal.
         */

        const startX =
            (
                width -
                gridWidth
            ) / 2;


        /*
         * Centrage vertical.
         *
         * La grille peut dépasser légèrement
         * du cercle en haut et en bas.
         *
         * #map possède overflow:hidden,
         * donc les cellules périphériques
         * sont naturellement découpées par
         * le cercle.
         */

        const startY =
            (
                height -
                gridHeight
            ) / 2;


        /*
         * ====================================================
         * POSITIONNEMENT DES CELLULES
         * ====================================================
         */

        const cells =
            grid.querySelectorAll(
                ".octagon-cell"
            );


        cells.forEach(
            cell => {

                const x =
                    Number(
                        cell.dataset.x
                    ) - 1;


                const y =
                    Number(
                        cell.dataset.y
                    ) - 1;


                /*
                 * Une colonne sur deux
                 * est décalée de H/2.
                 */

                const verticalOffset =
                    (
                        x % 2
                    ) *
                    (
                        cellHeight / 2
                    );


                const left =
                    startX +
                    (
                        x *
                        horizontalStep
                    );


                const top =
                    startY +
                    (
                        y *
                        verticalStep
                    ) +
                    verticalOffset;


                cell.style.setProperty(
                    "--hex-left",
                    `${left}px`
                );


                cell.style.setProperty(
                    "--hex-top",
                    `${top}px`
                );


                cell.style.setProperty(
                    "--hex-width",
                    `${cellWidth}px`
                );


                cell.style.setProperty(
                    "--hex-height",
                    `${cellHeight}px`
                );
            }
        );
    },


    /* ========================================================
       RESIZE OBSERVER
       ======================================================== */

    observeResize() {

        if (!this.DOM.map) {
            return;
        }


        if (
            typeof ResizeObserver !==
            "undefined"
        ) {

            this.resizeObserver =
                new ResizeObserver(
                    () => {

                        this.layoutHoneycomb();
                    }
                );


            this.resizeObserver.observe(
                this.DOM.map
            );

        } else {

            window.addEventListener(
                "resize",
                () => {

                    this.layoutHoneycomb();
                }
            );
        }
    },


    /* ========================================================
       COMPATIBILITY
       ======================================================== */

    createOctagonGrid() {

        this.createHexagonGrid();
    },


    createSquareGrid() {

        if (this.DOM.squareGrid) {

            this.DOM.squareGrid.innerHTML =
                "";
        }


        if (this.DOM.squareCount) {

            this.DOM.squareCount.textContent =
                "0";
        }
    },


    /* ========================================================
       SELECT CELL
       ======================================================== */

    selectCell(cell) {

        if (!cell) {
            return;
        }


        this.DOM.octagonGrid
            ?.querySelectorAll(
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


        const x =
            Number(
                cell.dataset.x
            );


        const y =
            Number(
                cell.dataset.y
            );


        const type =
            cell.dataset.type ||
            "HEXAGON";


        const id =
            cell.dataset.id ||
            `X${x}-Y${y}`;


        this.state.selectedCell =
            id;

        this.state.selectedType =
            type;

        this.state.selectedX =
            x;

        this.state.selectedY =
            y;


        this.updateInterface();


        this.setSystemMessage(
            "CELL SELECTED"
        );
    },


    /* ========================================================
       CLEAR SELECTION
       ======================================================== */

    clearSelection() {

        this.DOM.octagonGrid
            ?.querySelectorAll(
                ".octagon-cell.selected"
            )
            .forEach(
                cell => {

                    cell.classList.remove(
                        "selected"
                    );
                }
            );


        this.state.selectedCell =
            null;

        this.state.selectedType =
            null;

        this.state.selectedX =
            null;

        this.state.selectedY =
            null;


        this.updateInterface();
    },


    /* ========================================================
       ZOOM
       ======================================================== */

    setZoom(value) {

        const numeric =
            Number(value);


        if (
            !Number.isFinite(
                numeric
            )
        ) {
            return;
        }


        this.state.zoom =
            Math.max(
                50,
                Math.min(
                    200,
                    numeric
                )
            );


        this.applyZoom();

        this.updateInterface();
    },


    zoomIn() {

        this.setZoom(
            this.state.zoom + 10
        );
    },


    zoomOut() {

        this.setZoom(
            this.state.zoom - 10
        );
    },


    applyZoom() {

        if (!this.DOM.map) {
            return;
        }


        const scale =
            this.state.zoom /
            100;


        this.DOM.map.style.transform =
            `scale(${scale})`;
    },


    /* ========================================================
       RESET
       ======================================================== */

    reset() {

        this.clearSelection();


        this.state.zoom =
            100;


        this.applyZoom();


        this.setSystemMessage(
            "SYSTEM RESET"
        );


        this.updateInterface();
    },


    /* ========================================================
       SYSTEM MESSAGE
       ======================================================== */

    setSystemMessage(message) {

        if (
            this.DOM.systemMessage
        ) {

            this.DOM.systemMessage.textContent =
                message;
        }
    },


    /* ========================================================
       UPDATE INTERFACE
       ======================================================== */

    updateInterface() {

        if (
            this.DOM.selectedCell
        ) {

            this.DOM.selectedCell.textContent =
                this.state.selectedCell ||
                "NONE";
        }


        if (
            this.DOM.selectedType
        ) {

            this.DOM.selectedType.textContent =
                this.state.selectedType ||
                "EMPTY";
        }


        if (
            this.DOM.positionX
        ) {

            this.DOM.positionX.textContent =
                this.state.selectedX !== null
                    ? String(
                        this.state.selectedX
                    ).padStart(
                        2,
                        "0"
                    )
                    : "--";
        }


        if (
            this.DOM.positionY
        ) {

            this.DOM.positionY.textContent =
                this.state.selectedY !== null
                    ? String(
                        this.state.selectedY
                    ).padStart(
                        2,
                        "0"
                    )
                    : "--";
        }


        if (
            this.DOM.zoomValue
        ) {

            this.DOM.zoomValue.textContent =
                String(
                    this.state.zoom
                );
        }
    },


    /* ========================================================
       EVENTS
       ======================================================== */

    bindEvents() {

        if (
            this.DOM.btnZoomIn
        ) {

            this.DOM.btnZoomIn.addEventListener(
                "click",
                () => {

                    this.zoomIn();
                }
            );
        }


        if (
            this.DOM.btnZoomOut
        ) {

            this.DOM.btnZoomOut.addEventListener(
                "click",
                () => {

                    this.zoomOut();
                }
            );
        }
    }
};