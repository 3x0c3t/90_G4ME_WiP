"use strict";


const MAP = {

    /* ========================================================
       STATE
       ======================================================== */

    state: {

        selectedCell:
            null,

        selectedType:
            null,

        selectedX:
            null,

        selectedY:
            null,

        selectedContent:
            null,

        zoom:
            100,

        rotation:
            0
    },


    /* ========================================================
       DOM
       ======================================================== */

    DOM: {

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

        selectedCell:
            document.getElementById(
                "selected-cell"
            ),

        selectedType:
            document.getElementById(
                "selected-type"
            ),

        selectedContent:
            document.getElementById(
                "selected-content"
            ),

        cellX:
            document.getElementById(
                "cell-x"
            ),

        cellY:
            document.getElementById(
                "cell-y"
            ),

        positionX:
            document.getElementById(
                "position-x"
            ),

        positionY:
            document.getElementById(
                "position-y"
            ),

        zoomValue:
            document.getElementById(
                "zoom-value"
            ),

        systemMessage:
            document.getElementById(
                "system-message"
            ),

        btnZoomIn:
            document.getElementById(
                "btn-zoom-in"
            ),

        btnZoomOut:
            document.getElementById(
                "btn-zoom-out"
            ),

        octagonCount:
            document.getElementById(
                "octagon-count"
            ),

        squareCount:
            document.getElementById(
                "square-count"
            )
    },


    /* ========================================================
       CONFIGURATION
       ======================================================== */

    config: {

        rows:
            11,

        columns:
            11,

        cellType:
            "HEXAGON",

        dragThreshold:
            4
    },


    /* ========================================================
       INTERACTION
       ======================================================== */

    interaction: {

        dragging:
            false,

        moved:
            false,

        pointerId:
            null,

        startX:
            0,

        startY:
            0,

        startPointerAngle:
            0,

        startRotation:
            0
    },


    /* ========================================================
       INIT
       ======================================================== */

    init() {

        this.createHexagonGrid();

        this.bindEvents();

        this.observeResize();

        this.applyTransform();

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

            selectedContent:
                this.state.selectedContent,

            zoom:
                this.state.zoom,

            rotation:
                this.state.rotation
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


        grid.innerHTML =
            "";


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


                cell.dataset.content =
                    "EMPTY";


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

                        if (
                            this.interaction.moved
                        ) {

                            return;
                        }


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


        if (
            this.DOM.octagonCount
        ) {

            this.DOM.octagonCount.textContent =
                String(total);
        }


        if (
            this.DOM.squareCount
        ) {

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


        if (
            !map ||
            !grid
        ) {

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


        const diameter =
            Math.min(
                width,
                height
            );


        const rows =
            this.config.rows;


        const columns =
            this.config.columns;


        const sqrt3 =
            Math.sqrt(3);


        /*
         * 11 colonnes :
         *
         * 10 intervalles * 0.75W
         * + 1 largeur W
         *
         * = 8.5W
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


        const horizontalStep =
            cellWidth *
            0.75;


        const verticalStep =
            cellHeight;


        const gridHeight =
            (
                rows - 1
            ) *
            verticalStep
            +
            cellHeight
            +
            cellHeight / 2;


        const gridWidth =
            (
                columns - 1
            ) *
            horizontalStep
            +
            cellWidth;


        const startX =
            (
                width -
                gridWidth
            ) / 2;


        const startY =
            (
                height -
                gridHeight
            ) / 2;


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

        if (
            !this.DOM.map
        ) {

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

        if (
            this.DOM.squareGrid
        ) {

            this.DOM.squareGrid.innerHTML =
                "";
        }


        if (
            this.DOM.squareCount
        ) {

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


        this.state.selectedContent =
            cell.dataset.content ||
            "EMPTY";


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


        this.applyTransform();


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


    /* ========================================================
       ROTATION
       ======================================================== */

    setRotation(value) {

        const numeric =
            Number(value);


        if (
            !Number.isFinite(
                numeric
            )
        ) {

            return;
        }


        this.state.rotation =
            numeric;


        this.applyTransform();
    },


    /* ========================================================
       COMBINED TRANSFORM
       ======================================================== */

    applyTransform() {

        if (
            !this.DOM.octagonGrid
        ) {

            return;
        }


        const rotation =
            this.state.rotation;


        this.DOM.octagonGrid.style.transform =
            `rotate(${rotation}deg)`;
    },


    /* ========================================================
       POINTER ANGLE
       ======================================================== */

    getPointerAngle(event) {

        if (
            !this.DOM.map
        ) {

            return 0;
        }


        const rect =
            this.DOM.map.getBoundingClientRect();


        const centerX =
            rect.left +
            rect.width / 2;


        const centerY =
            rect.top +
            rect.height / 2;


        const x =
            event.clientX -
            centerX;


        const y =
            event.clientY -
            centerY;


        return (
            Math.atan2(
                y,
                x
            ) *
            180 /
            Math.PI
        );
    },


    /* ========================================================
       NORMALIZE ANGLE
       ======================================================== */

    normalizeAngle(
        angle
    ) {

        while (
            angle > 180
        ) {

            angle -= 360;
        }


        while (
            angle < -180
        ) {

            angle += 360;
        }


        return angle;
    },


    /* ========================================================
       START ROTATION
       ======================================================== */

    startRotation(event) {

        if (
            event.button !== 0
        ) {

            return;
        }


        if (
            !this.DOM.octagonGrid
        ) {

            return;
        }


        this.interaction.dragging =
            true;


        this.interaction.moved =
            false;


        this.interaction.pointerId =
            event.pointerId;


        this.interaction.startX =
            event.clientX;


        this.interaction.startY =
            event.clientY;


        this.interaction.startPointerAngle =
            this.getPointerAngle(
                event
            );


        this.interaction.startRotation =
            this.state.rotation;


        this.DOM.octagonGrid.classList.add(
            "is-dragging"
        );


        try {

            this.DOM.octagonGrid.setPointerCapture(
                event.pointerId
            );

        } catch (
            error
        ) {
        }


        event.preventDefault();
    },


    /* ========================================================
       MOVE ROTATION
       ======================================================== */

    moveRotation(event) {

        if (
            !this.interaction.dragging
        ) {

            return;
        }


        if (
            event.pointerId !==
            this.interaction.pointerId
        ) {

            return;
        }


        const deltaX =
            event.clientX -
            this.interaction.startX;


        const deltaY =
            event.clientY -
            this.interaction.startY;


        const distance =
            Math.sqrt(
                (
                    deltaX *
                    deltaX
                ) +
                (
                    deltaY *
                    deltaY
                )
            );


        if (
            distance >=
            this.config.dragThreshold
        ) {

            this.interaction.moved =
                true;
        }


        if (
            !this.interaction.moved
        ) {

            return;
        }


        /*
         * Rotation naturelle :
         *
         * on compare l'angle du curseur
         * autour du centre de la map
         * avec l'angle initial.
         *
         * Cela permet de véritablement
         * "attraper" la map avec la souris.
         */

        const currentPointerAngle =
            this.getPointerAngle(
                event
            );


        const deltaAngle =
            this.normalizeAngle(
                currentPointerAngle -
                this.interaction.startPointerAngle
            );


        this.state.rotation =
            this.interaction.startRotation +
            deltaAngle;


        this.applyTransform();
    },


    /* ========================================================
       END ROTATION
       ======================================================== */

    endRotation(event) {

        if (
            !this.interaction.dragging
        ) {

            return;
        }


        if (
            event &&
            event.pointerId !==
            this.interaction.pointerId
        ) {

            return;
        }


        this.interaction.dragging =
            false;


        this.DOM.octagonGrid?.classList.remove(
            "is-dragging"
        );


        try {

            if (
                event &&
                this.DOM.octagonGrid.hasPointerCapture(
                    event.pointerId
                )
            ) {

                this.DOM.octagonGrid.releasePointerCapture(
                    event.pointerId
                );
            }

        } catch (
            error
        ) {
        }


        this.interaction.pointerId =
            null;


        /*
         * Empêche le click généré par
         * le relâchement de sélectionner
         * une cellule après un drag.
         */

        if (
            this.interaction.moved
        ) {

            window.setTimeout(
                () => {

                    this.interaction.moved =
                        false;

                },
                0
            );
        }
    },


    /* ========================================================
       RESET
       ======================================================== */

    reset() {

        this.clearSelection();


        this.state.zoom =
            100;


        this.state.rotation =
            0;


        this.interaction.dragging =
            false;


        this.interaction.moved =
            false;


        this.applyTransform();


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
            this.DOM.cellX
        ) {

            this.DOM.cellX.textContent =
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
            this.DOM.cellY
        ) {

            this.DOM.cellY.textContent =
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
            this.DOM.selectedContent
        ) {

            this.DOM.selectedContent.textContent =
                this.state.selectedContent ||
                "EMPTY";
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


        if (
            this.DOM.octagonGrid
        ) {

            this.DOM.octagonGrid.addEventListener(
                "pointerdown",
                event => {

                    this.startRotation(
                        event
                    );
                }
            );


            this.DOM.octagonGrid.addEventListener(
                "pointermove",
                event => {

                    this.moveRotation(
                        event
                    );
                }
            );


            this.DOM.octagonGrid.addEventListener(
                "pointerup",
                event => {

                    this.endRotation(
                        event
                    );
                }
            );


            this.DOM.octagonGrid.addEventListener(
                "pointercancel",
                event => {

                    this.endRotation(
                        event
                    );
                }
            );


            this.DOM.octagonGrid.addEventListener(
                "lostpointercapture",
                () => {

                    if (
                        this.interaction.dragging
                    ) {

                        this.interaction.dragging =
                            false;

                        this.DOM.octagonGrid.classList.remove(
                            "is-dragging"
                        );
                    }
                }
            );
        }
    }
};