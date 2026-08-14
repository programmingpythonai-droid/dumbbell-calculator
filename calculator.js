/* =========================
   CALCULATOR
========================= */

function generateCombinations(maxPlates) {

    const combinations = [];

    function build(startIndex, current) {

        combinations.push([...current]);

        if (current.length >= maxPlates) {
            return;
        }

        for (
            let i = startIndex;
            i < plateWeights.length;
            i++
        ) {

            current.push(plateWeights[i]);

            build(i, current);

            current.pop();
        }
    }

    build(0, []);

    return combinations;
}


/* =========================
   WEIGHT
========================= */

function getWeight(plates) {

    let total = 0;

    for (let i = 0; i < plates.length; i++) {
        total += plates[i];
    }

    return total;
}


/* =========================
   COUNT PLATES
========================= */

function countPlates(plates) {

    const counts = {};

    for (let i = 0; i < plates.length; i++) {

        const key =
            plates[i].toFixed(6);

        if (!counts[key]) {
            counts[key] = 0;
        }

        counts[key]++;
    }

    return counts;
}


/* =========================
   AVAILABLE QUANTITIES
========================= */

function getAvailableQuantities() {

    const limited =
        document.querySelector(
            'input[name="quantityMode"][value="limited"]'
        ).checked;


    if (!limited) {
        return null;
    }


    const quantities = {};


    quantityList
        .querySelectorAll("input")
        .forEach(
            function(input) {

                quantities[
                    Number(
                        input.dataset.weight
                    ).toFixed(6)
                ] =
                    Math.floor(
                        Number(input.value)
                    );
            }
        );


    return quantities;
}


/* =========================
   STOCK CHECK
========================= */

function hasEnoughStock(
    side1,
    side2,
    quantities,
    dumbbells
) {

    if (quantities === null) {
        return true;
    }


    const needed =
        countPlates([
            ...side1,
            ...side2
        ]);


    for (const key in needed) {

        const neededTotal =
            needed[key] * dumbbells;


        const available =
            quantities[key] || 0;


        if (neededTotal > available) {
            return false;
        }
    }


    return true;
}


/* =========================
   FIND BEST CONFIGURATION
========================= */

function findBestConfiguration(
    targetKg,
    maxPlates,
    maxDifferenceKg,
    quantities,
    dumbbells
) {

    const combinations =
        generateCombinations(maxPlates);


    let best = null;


    for (
        let i = 0;
        i < combinations.length;
        i++
    ) {

        const side1 =
            combinations[i];


        const weight1 =
            getWeight(side1);


        for (
            let j = 0;
            j < combinations.length;
            j++
        ) {

            const side2 =
                combinations[j];


            const weight2 =
                getWeight(side2);


            /* Difference between sides */

            const sideDifference =
                Math.abs(
                    weight1 - weight2
                );


            /* Reject unbalanced configurations */

            if (
                sideDifference >
                maxDifferenceKg + 0.000001
            ) {
                continue;
            }


            /* Check available stock */

            if (
                !hasEnoughStock(
                    side1,
                    side2,
                    quantities,
                    dumbbells
                )
            ) {
                continue;
            }


            const total =
                weight1 + weight2;


            /* Distance from requested target */

            const targetDifference =
                Math.abs(
                    total - targetKg
                );


            const totalPlates =
                side1.length +
                side2.length;


            const exactTarget =
                targetDifference < 0.000001;


            const perfectlyBalanced =
                sideDifference < 0.000001;


            const candidate = {

                side1: side1,

                side2: side2,

                weight1: weight1,

                weight2: weight2,

                total: total,

                difference: sideDifference,

                targetDifference:
                    targetDifference,

                totalPlates:
                    totalPlates,

                exactTarget:
                    exactTarget,

                perfectlyBalanced:
                    perfectlyBalanced
            };


            if (best === null) {

                best = candidate;

                continue;
            }


            /*
             PRIORITY 1
             Exact target
            */

            if (
                candidate.exactTarget &&
                !best.exactTarget
            ) {

                best = candidate;

                continue;
            }


            if (
                !candidate.exactTarget &&
                best.exactTarget
            ) {

                continue;
            }


            /*
             PRIORITY 2
             Perfect balance
            */

            if (
                candidate.perfectlyBalanced &&
                !best.perfectlyBalanced
            ) {

                best = candidate;

                continue;
            }


            if (
                !candidate.perfectlyBalanced &&
                best.perfectlyBalanced
            ) {

                continue;
            }


            /*
             PRIORITY 3
             Closest to target
            */

            if (
                candidate.targetDifference <
                best.targetDifference -
                0.000001
            ) {

                best = candidate;

                continue;
            }


            if (
                candidate.targetDifference >
                best.targetDifference +
                0.000001
            ) {

                continue;
            }


            /*
             PRIORITY 4
             Smaller side difference
            */

            if (
                candidate.difference <
                best.difference -
                0.000001
            ) {

                best = candidate;

                continue;
            }


            if (
                candidate.difference >
                best.difference +
                0.000001
            ) {

                continue;
            }


            /*
             PRIORITY 5
             Fewer plates
            */

            if (
                candidate.totalPlates <
                best.totalPlates
            ) {

                best = candidate;
            }
        }
    }


    return best;
}


/* =========================
   FORMAT PLATES
========================= */

function formatPlates(plates) {

    if (plates.length === 0) {
        return "No plates";
    }


    const counts =
        countPlates(plates);


    const parts = [];


    for (const key in counts) {

        parts.push(
            counts[key]
            + " × "
            + formatWeight(
                Number(key)
            )
        );
    }


    return parts.join("<br>");
}


/* =========================
   TOTAL PLATES
========================= */

function formatTotalPlates(
    side1,
    side2,
    dumbbells
) {

    const counts =
        countPlates([
            ...side1,
            ...side2
        ]);


    const parts = [];


    for (const key in counts) {

        parts.push(
            counts[key] *
            dumbbells
            + " × "
            + formatWeight(
                Number(key)
            )
        );
    }


    return parts.join("<br>");
}


/* =========================
   VALIDATION
========================= */

function validateCalculatorInputs() {

    const dumbbells =
        Number(
            document.getElementById(
                "dumbbells"
            ).value
        );


    const target =
        Number(
            document.getElementById(
                "targetWeight"
            ).value
        );


    const maxPlates =
        Number(
            document.getElementById(
                "maxPlates"
            ).value
        );


    const difference =
        Number(
            document.getElementById(
                "maxDifference"
            ).value
        );


    if (
        !Number.isInteger(dumbbells) ||
        dumbbells < 1
    ) {

        alert(
            "Number of dumbbells must be a whole number greater than 0."
        );

        return false;
    }


    if (
        !Number.isFinite(target) ||
        target <= 0
    ) {

        alert(
            "Please enter a valid target weight."
        );

        return false;
    }


    if (
        !Number.isInteger(maxPlates) ||
        maxPlates < 1
    ) {

        alert(
            "Maximum plates must be a whole number greater than 0."
        );

        return false;
    }


    if (
        !Number.isFinite(difference) ||
        difference < 0
    ) {

        alert(
            "Maximum difference cannot be negative."
        );

        return false;
    }


    if (plateWeights.length === 0) {

        alert(
            "You need at least one plate weight."
        );

        return false;
    }


    return true;
}


/* =========================
   CALCULATE
========================= */

calculateButton.addEventListener(
    "click",
    function() {

        if (
            !validateCalculatorInputs()
        ) {
            return;
        }


        const dumbbells =
            Number(
                document.getElementById(
                    "dumbbells"
                ).value
            );


        const targetDisplay =
            Number(
                document.getElementById(
                    "targetWeight"
                ).value
            );


        const maxPlates =
            Number(
                document.getElementById(
                    "maxPlates"
                ).value
            );


        const maxDifferenceDisplay =
            Number(
                document.getElementById(
                    "maxDifference"
                ).value
            );


        const targetKg =
            displayToKg(
                targetDisplay
            );


        const maxDifferenceKg =
            displayToKg(
                maxDifferenceDisplay
            );


        const quantities =
            getAvailableQuantities();


        const result =
            findBestConfiguration(
                targetKg,
                maxPlates,
                maxDifferenceKg,
                quantities,
                dumbbells
            );


        if (!result) {

            resultBox.innerHTML = `
                <h2>Result</h2>

                <p>
                    <strong>
                        No valid configuration found.
                    </strong>
                </p>

                <p>
                    Try increasing the maximum
                    side difference, allowing more
                    plates per side, or checking
                    your plate quantities.
                </p>
            `;

            return;
        }


        let status;


        if (result.exactTarget) {

            if (result.perfectlyBalanced) {

                status =
                    "Exact target and perfectly balanced.";

            } else {

                status =
                    "Exact target reached.";
            }

        } else {

            status =
                "Closest possible configuration.";
        }


        resultBox.innerHTML = `

            <h2>Result</h2>

            <p>
                <strong>
                    ${status}
                </strong>
            </p>


            <p>
                <strong>
                    Target:
                </strong>

                ${formatWeight(targetKg)}
            </p>


            <h3>Side 1</h3>

            <p>
                ${formatPlates(
                    result.side1
                )}
            </p>

            <p>
                <strong>
                    Side 1 total:
                </strong>

                ${formatWeight(
                    result.weight1
                )}
            </p>


            <h3>Side 2</h3>

            <p>
                ${formatPlates(
                    result.side2
                )}
            </p>

            <p>
                <strong>
                    Side 2 total:
                </strong>

                ${formatWeight(
                    result.weight2
                )}
            </p>


            <h3>Summary</h3>

            <p>
                <strong>
                    Total per dumbbell:
                </strong>

                ${formatWeight(
                    result.total
                )}
            </p>


            <p>
                <strong>
                    Difference between sides:
                </strong>

                ${formatWeight(
                    result.difference
                )}

                ${
                    result.perfectlyBalanced
                    ? " ✓ Balanced"
                    : ""
                }
            </p>


            <p>
                <strong>
                    Difference from target:
                </strong>

                ${formatWeight(
                    result.targetDifference
                )}
            </p>


            <h3>Total plates needed</h3>

            <p>
                ${formatTotalPlates(
                    result.side1,
                    result.side2,
                    dumbbells
                )}
            </p>
        `;
    }
);
