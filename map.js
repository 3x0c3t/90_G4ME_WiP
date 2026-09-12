"use strict";


const MAP = {

    DEBUG: true,


    log(...args) {

        if (this.DEBUG) {

            console.log(
                "[90_G4ME_WiP][MAP]",
                ...args
            );

        }

    },


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

        this.log(
            "createHexagonGrid() START"
        );


        const grid =
            this.DOM.octagonGrid;


        if (!grid) {

            return;

        }


        /*
         * IMPORTANT
         *
         * On mémorise la cellule active
         * avant de reconstruire le DOM.
         *
         * La grille peut être reconstruite
         * après un changement de taille ou
         * une autre opération.
         */

        const selectedId =
            this.state.selectedCell;


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


                this.log(
                    "CELL CREATED",
                    {
                        id:
                            cell.dataset.id,

                        x:
                            cell.dataset.x,

                        y:
                            cell.dataset.y,

                        type:
                            cell.dataset.type,

                        content:
                            cell.dataset.content
                    }
                );


                cell.setAttribute(
                    "role",
                    "button"
                );


                cell.setAttribute(
                    "aria-label",
                    `Cellule X${x} Y${y}`
                );


                /*
                 * Sélection directe de la cellule.
                 */

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


        /*
         * On attend que les cellules soient
         * réellement présentes avant de
         * recalculer leur position.
         *
         * Puis on restaure la sélection.
         */

        requestAnimationFrame(
            () => {

                this.layoutHoneycomb();

                this.restoreSelection(
                    selectedId
                );

            }
        );

    },


    /* ========================================================
       RESTORE ACTIVE CELL
       ======================================================== */

    restoreSelection(
        selectedId =
            this.state.selectedCell
    ) {

        if (
            !selectedId
        ) {

            return;

        }


        const grid =
            this.DOM.octagonGrid;


        if (!grid) {

            return;

        }


        /*
         * Nettoyage de toutes les anciennes
         * classes selected.
         */

        grid
            .querySelectorAll(
                ".octagon-cell.selected"
            )
            .forEach(
                cell => {

                    cell.classList.remove(
                        "selected"
                    );

                }
            );


        /*
         * Recherche de la cellule mémorisée.
         */

        const selectedCell =
            Array.from(
                grid.querySelectorAll(
                    ".octagon-cell"
                )
            ).find(
                cell =>
                    cell.dataset.id ===
                    selectedId
            );


        if (
            !selectedCell
        ) {

            this.log(
                "RESTORE SELECTION FAILED",
                selectedId
            );

            return;

        }


        /*
         * Réactivation visuelle.
         */

        selectedCell.classList.add(
            "selected"
        );


        /*
         * On resynchronise l'état.
         */

        this.state.selectedCell =
            selectedCell.dataset.id;


        this.state.selectedType =
            selectedCell.dataset.type ||
            "HEXAGON";


        this.state.selectedX =
            Number(
                selectedCell.dataset.x
            );


        this.state.selectedY =
            Number(
                selectedCell.dataset.y
            );


        this.state.selectedContent =
            selectedCell.dataset.content ||
            "EMPTY";


        this.log(
            "SELECTION RESTORED",
            {
                id:
                    this.state.selectedCell,

                x:
                    this.state.selectedX,

                y:
                    this.state.selectedY
            }
        );


        this.updateInterface();

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


        /*
         * IMPORTANT
         *
         * layoutHoneycomb() ne détruit jamais
         * les classes .selected.
         *
         * La sélection reste donc active
         * pendant un simple resize.
         */

        if (
            this.state.selectedCell
        ) {

            this.restoreSelection(
                this.state.selectedCell
            );

        }

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

        this.log(
            "selectCell() CALLED",
            cell
        );


        if (!cell) {

            return;

        }


        /*
         * Suppression de l'ancienne sélection
         * uniquement au moment où une nouvelle
         * cellule est réellement sélectionnée.
         */

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


        /*
         * Nouvelle sélection visuelle.
         */

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


        const content =
            cell.dataset.content ||
            "EMPTY";


        /*
         * Sauvegarde de l'état.
         *
         * C'est cette valeur qui permet
         * de restaurer la sélection plus tard.
         */

        this.state.selectedCell =
            id;


        this.state.selectedType =
            type;


        this.state.selectedX =
            x;


        this.state.selectedY =
            y;


        this.state.selectedContent =
            content;


        this.log(
            "CELL SELECTED",
            {
                id:
                    id,

                x:
                    x,

                y:
                    y,

                type:
                    type,

                content:
                    content
            }
        );


        this.updateInterface();


        this.setSystemMessage(
            "CELL SELECTED"
        );

    },


    /* ========================================================
       CLEAR SELECTION
       ======================================================== */

    clearSelection() {

        this.log(
            "clearSelection()"
        );


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


        this.state.selectedContent =
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

        this.log(
            "updateInterface()",
            {
                selectedCell:
                    this.state.selectedCell,

                selectedX:
                    this.state.selectedX,

                selectedY:
                    this.state.selectedY,

                selectedType:
                    this.state.selectedType,

                selectedContent:
                    this.state.selectedContent
            }
        );


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


            this.log(
                "DOM CELL UPDATED",
                {

                    cell:
                        this.DOM.selectedCell
                            ? this.DOM.selectedCell.textContent
                            : null,

                    x:
                        this.DOM.cellX
                            ? this.DOM.cellX.textContent
                            : null,

                    y:
                        this.DOM.cellY
                            ? this.DOM.cellY.textContent
                            : null,

                    type:
                        this.DOM.selectedType
                            ? this.DOM.selectedType.textContent
                            : null,

                    content:
                        this.DOM.selectedContent
                            ? this.DOM.selectedContent.textContent
                            : null

                }
            );

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