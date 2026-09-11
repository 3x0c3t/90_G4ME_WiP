"use strict";


/* =========================================================
   MAP
   Gestion complète de la carte
   ========================================================= */

const MAP = {


    /* =====================================================
       ETAT
       ===================================================== */

    state: {

        selectedCell:
            null,

        selectedType:
            null,

        selectedX:
            null,

        selectedY:
            null,

        zoom:
            100

    },


    /* =====================================================
       DOM
       ===================================================== */

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


    /* =====================================================
       INIT
       ===================================================== */

    init() {

        this.createOctagonGrid();

        this.createSquareGrid();

        this.bindEvents();

        this.updateInterface();

    },


    /* =====================================================
       ETAT PUBLIC
       ===================================================== */

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


    /* =====================================================
       GRILLE OCTOGONALE
       ===================================================== */

    createOctagonGrid() {

        const grid =
            this.DOM.octagonGrid;


        if (!grid) {

            return;

        }


        grid.innerHTML =
            "";


        const size =
            7;


        for (
            let y = 1;
            y <= size;
            y++
        ) {

            for (
                let x = 1;
                x <= size;
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
                String(
                    size * size
                );

        }

    },


    /* =====================================================
       GRILLE CARREE
       ===================================================== */

    createSquareGrid() {

        const grid =
            this.DOM.squareGrid;


        if (!grid) {

            return;

        }


        grid.innerHTML =
            "";


        const size =
            8;


        for (
            let y = 1;
            y <= size;
            y++
        ) {

            for (
                let x = 1;
                x <= size;
                x++
            ) {

                const cell =
                    document.createElement(
                        "div"
                    );


                cell.className =
                    "square-cell";


                cell.dataset.x =
                    String(x);


                cell.dataset.y =
                    String(y);


                grid.appendChild(
                    cell
                );

            }

        }


        if (
            this.DOM.squareCount
        ) {

            this.DOM.squareCount.textContent =
                String(
                    size * size
                );

        }

    },


    /* =====================================================
       SELECTION
       ===================================================== */

    selectCell(
        cell
    ) {

        if (!cell) {

            return;

        }


        const previous =
            this.DOM.octagonGrid
                ?.querySelectorAll(
                    ".octagon-cell.selected"
                );


        previous?.forEach(
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
            "EMPTY";


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


    /* =====================================================
       DESELECTION
       ===================================================== */

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


    /* =====================================================
       ZOOM
       ===================================================== */

    setZoom(
        value
    ) {

        const numeric =
            Number(
                value
            );


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

        if (
            !this.DOM.map
        ) {

            return;

        }


        const scale =
            this.state.zoom /
            100;


        this.DOM.map.style.transform =
            `scale(${scale})`;

    },


    /* =====================================================
       RESET
       ===================================================== */

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


    /* =====================================================
       MESSAGE SYSTEME
       ===================================================== */

    setSystemMessage(
        message
    ) {

        if (
            this.DOM.systemMessage
        ) {

            this.DOM.systemMessage.textContent =
                message;

        }

    },


    /* =====================================================
       INTERFACE
       ===================================================== */

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


    /* =====================================================
       EVENEMENTS
       ===================================================== */

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