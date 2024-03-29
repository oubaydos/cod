function capitalizeWithSeparator(text, separator) {
    if (separator !== undefined) {
        let res = text.split(separator);
        res = res.map(e => {
            return e.charAt(0).toUpperCase() + e.slice(1).toLowerCase()
        })
        return res.join(" ");
    }


}

function capitalize(text) {
    return capitalizeWithSeparator(capitalizeWithSeparator(text, " "), "_");
}


function goto(url) {
    window.location.href = url;
}

function gotoChart(departmentId) {
    const url = "chart.html?id=" + departmentId;
    goto(url)
}

function floatToPercentage(num) {
    const percentage = num * 100
    return percentage.toFixed(2) + '%'
}

const EDGES = [.5, .8, .85, .9, .95, 1];
EDGES.slice(1).map((n, i) => (n + EDGES[i]) / 2);

const TICK_LABELS = ["0%", "50%", "80%", "85%", "90%", "95%", "100%"];

function roundToNearestClass(a) {
    const NUMBER_OF_CLASSES = EDGES.length;
    const DIFFERENCE_BETWEEN_CLASSES = 1 / NUMBER_OF_CLASSES;
    for (let i in EDGES) {
        if (a <= EDGES[i]) {
            return DIFFERENCE_BETWEEN_CLASSES * i + a * DIFFERENCE_BETWEEN_CLASSES / EDGES[i];
        }
    }
    return a;
}