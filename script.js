const standardWeights = [
    0.50,
    1.00,
    1.25,
    1.50,
    2.00,
    2.50,
    5.00,
    10.00,
    15.00,
    20.00
];

let plateWeights = [...standardWeights];

const STORAGE_KEY = "dumbbellCalculator";

const plateList =
    document.getElementById("plateList");

const quantityList =
    document.getElementById("quantityList");

const addPlateButton =
    document.getElementById("addPlateButton");

const unitSelect =
    document.getElementById("unit");

const calculateButton =
    document.getElementById("calculateButton");

const resultBox =
    document.getElementById("result");

const resetButton =
    document.getElementById("resetButton");


function getUnit() {
    return unitSelect.value;
}


function kgToDisplay(weight) {

    if (getUnit() === "lb") {
        return weight * 2.2046226218;
    }

    return weight;
}


function displayToKg(weight) {

    if (getUnit() === "lb") {
        return weight / 2.2046226218;
    }

    return weight;
}


function formatWeight(weight) {

    return kgToDisplay(weight).toFixed(2)
        + " "
        + getUnit();
}


/* SAVE */

function saveSettings() {

    const quantities = {};

    quantityList
        .querySelectorAll("input")
        .forEach(function(input) {

            quantities[input.dataset.weight] =
                Number(input.value);
        });


    const selectedMode =
        document.querySelector(
            'input[name="quantityMode"]:checked'
        );


    const settings = {

        plateWeights: plateWeights,

        quantities: quantities,

        quantityMode:
            selectedMode
                ? selectedMode.value
                : "unlimited",

        dumbbells:
            document.getElementById("dumbbells").value,

        unit:
            document.getElementById("unit").value,

        targetWeight:
            document.getElementById("targetWeight").value,

        maxPlates:
            document.getElementById("maxPlates").value,

        maxDifference:
            document.getElementById("maxDifference").value
    };


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
    );
}


/* LOAD */

function loadSettings() {

    const saved =
        localStorage.getItem(STORAGE_KEY);


    if (!saved) {
        return;
    }


    try {

        const settings =
            JSON.parse(saved);


        if (
            Array.isArray(settings.plateWeights) &&
            settings.plateWeights.length > 0
        ) {

            plateWeights =
                settings.plateWeights.filter(
                    function(weight) {

                        return (
                            typeof weight === "number" &&
                            Number.isFinite(weight) &&
                            weight > 0
                        );
                    }
                );
        }


        if (settings.dumbbells !== undefined) {

            document.getElementById(
                "dumbbells"
            ).value = settings.dumbbells;
        }


        if (
            settings.unit === "kg" ||
            settings.unit === "lb"
        ) {

            unitSelect.value =
                settings.unit;
        }


        if (settings.targetWeight !== undefined) {

            document.getElementById(
                "targetWeight"
            ).value =
                settings.targetWeight;
        }


        if (settings.maxPlates !== undefined) {

            document.getElementById(
                "maxPlates"
            ).value =
                settings.maxPlates;
        }


        if (settings.maxDifference !== undefined) {

            document.getElementById(
                "maxDifference"
            ).value =
                settings.maxDifference;
        }


        if (settings.quantityMode === "limited") {

            document.querySelector(
                'input[name="quantityMode"][value="limited"]'
            ).checked = true;

        } else {

            document.querySelector(
                'input[name="quantityMode"][value="unlimited"]'
            ).checked = true;
        }

    } catch (error) {

        console.log(
            "Could not load saved settings."
        );
    }
}


/* PLATES */

function renderPlateList() {

    plateList.innerHTML = "";


    for (
        let i = 0;
        i < plateWeights.length;
        i++
    ) {

        const weight =
            plateWeights[i];


        const row =
            document.createElement("div");

        row.className =
            "plate-row";


        const label =
            document.createElement("span");

        label.textContent =
            formatWeight(weight);


        const removeButton =
            document.createElement("button");

        removeButton.type = "button";

        removeButton.textContent = "Remove";


        removeButton.addEventListener(
            "click",
            function() {

                plateWeights.splice(i, 1);

                renderPlateList();

                renderQuantityList();

                saveSettings();
            }
        );


        row.appendChild(label);

        row.appendChild(removeButton);

        plateList.appendChild(row);
    }
}


/* QUANTITIES */

function renderQuantityList() {

    quantityList.innerHTML = "";


    const limited =
        document.querySelector(
            'input[name="quantityMode"][value="limited"]'
        ).checked;


    if (!limited) {
        return;
    }


    let savedQuantities = {};


    const saved =
        localStorage.getItem(STORAGE_KEY);


    if (saved) {

        try {

            const settings =
                JSON.parse(saved);

            savedQuantities =
                settings.quantities || {};

        } catch (error) {

            savedQuantities = {};
        }
    }


    for (
        let i = 0;
        i < plateWeights.length;
        i++
    ) {

        const weight =
            plateWeights[i];


        const row =
            document.createElement("div");

        row.className =
            "quantity-row";


        const label =
            document.createElement("label");

        label.textContent =
            formatWeight(weight) + ":";


        const input =
            document.createElement("input");

        input.type = "number";

        input.min = "0";

        input.step = "1";

        input.dataset.weight =
            weight;


        if (
            savedQuantities[weight] !== undefined
        ) {

            input.value =
                savedQuantities[weight];

        } else {

            input.value = "0";
        }


        input.addEventListener(
            "input",
            function() {

                let value =
                    Number(input.value);


                if (
                    !Number.isFinite(value) ||
                    value < 0
                ) {

                    input.value = "0";

                } else {

                    input.value =
                        Math.floor(value);
                }


                saveSettings();
            }
        );


        row.appendChild(label);

        row.appendChild(input);

        quantityList.appendChild(row);
    }
}


/* ADD CUSTOM PLATE */

addPlateButton.addEventListener(
    "click",
    function() {

        const input =
            document.getElementById(
                "customPlate"
            );


        const displayValue =
            Number(input.value);


        if (
            !Number.isFinite(displayValue) ||
            displayValue <= 0
        ) {

            alert(
                "Please enter a valid plate weight."
            );

            return;
        }


        const valueInKg =
            displayToKg(displayValue);


        const exists =
            plateWeights.some(
                function(weight) {

                    return (
                        Math.abs(
                            weight - valueInKg
                        ) < 0.0001
                    );
                }
            );


        if (exists) {

            alert(
                "That plate weight already exists."
            );

            return;
        }


        plateWeights.push(valueInKg);


        plateWeights.sort(
            function(a, b) {
                return a - b;
            }
        );


        input.value = "";


        renderPlateList();

        renderQuantityList();

        saveSettings();
    }
);


/* UNIT */

unitSelect.addEventListener(
    "change",
    function() {

        renderPlateList();

        renderQuantityList();

        saveSettings();
    }
);


/* QUANTITY MODE */

document.querySelectorAll(
    'input[name="quantityMode"]'
).forEach(
    function(radio) {

        radio.addEventListener(
            "change",
            function() {

                renderQuantityList();

                saveSettings();
            }
        );
    }
);


/* AUTO SAVE */

document.querySelectorAll(
    "#dumbbells, #targetWeight, #maxPlates, #maxDifference"
).forEach(
    function(input) {

        input.addEventListener(
            "input",
            saveSettings
        );
    }
);


/* RESET */

if (resetButton) {

    resetButton.addEventListener(
        "click",
        function() {

            const confirmed =
                confirm(
                    "Reset all saved settings?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.removeItem(
                STORAGE_KEY
            );


            plateWeights =
                [...standardWeights];


            document.getElementById(
                "dumbbells"
            ).value = "1";


            unitSelect.value = "kg";


            document.getElementById(
                "targetWeight"
            ).value = "";


            document.getElementById(
                "maxPlates"
            ).value = "3";


            document.getElementById(
                "maxDifference"
            ).value = "0";


            document.querySelector(
                'input[name="quantityMode"][value="unlimited"]'
            ).checked = true;


            renderPlateList();

            renderQuantityList();


            resultBox.innerHTML = `
                <h2>Result</h2>

                <p>
                    Enter your settings and press
                    Calculate.
                </p>
            `;
        }
    );
}


/* START */

loadSettings();

renderPlateList();

renderQuantityList();
