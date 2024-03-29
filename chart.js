class DepartmentChart {
    sourceJsonPromise;
    currentDepartmentId;
    chartTagId = 'chart';
    includeReferenceConformity = true;

    constructor(source) {
        this.sourceJsonPromise = source;
    }

    mapDepartmentDataToConformityByYearsAndByConformityTypeObject(departmentData, conformityType) {
        let L = {
            2016: undefined,
            2017: undefined,
            2018: undefined,
            2019: undefined,
            2020: undefined,
            2021: undefined,
            2022: undefined,
        }
        for (let i of departmentData) {
            L[i.year] = i[conformityType]
        }
        return L
    }


    mapDepartmentDataToConformityByYearsArray(departmentData) {
        console.log(departmentData)
        return {
            departmentName: departmentData[0]?.NOM_DEPT, data: CONFORMITY_TYPES
                .map(type => ({ [type]: Object.values(this.mapDepartmentDataToConformityByYearsAndByConformityTypeObject(departmentData, type)) }))
        }

    }

    mapConformityPerDepartmentToChartDataSets(conformityPerDepartment) {
        return {
            departmentName: conformityPerDepartment.departmentName,
            data: conformityPerDepartment
                .data
                .filter(
                    conformity =>
                        this.includeReferenceConformity
                        || !Object.keys(conformity)[0].toLowerCase().includes("réf")
                        || Object.keys(conformity)[0].toUpperCase().includes("ACHAT")
                )
                .map(conformity => {
                    let temp = Object.keys(conformity)[0];
                    return {
                        label: capitalize(temp),
                        data: conformity[temp],
                        spanGaps: true,
                        yAxisID: temp.toUpperCase().includes("ACHAT") ? "y1" : "y",
                        borderColor: ChartLinesColorPalette[temp],
                        borderWidth: temp.toUpperCase().includes("ACHAT") ? 6 : 3,
                    };
                })
        }
    }

    getCurrentDepartmentId() {
        if (this.currentDepartmentId !== undefined) return this.currentDepartmentId;
        const parameters = new URLSearchParams(window.location.search);
        this.currentDepartmentId = parameters.get('id');
        return this.currentDepartmentId;
    }

    getCurrentDepartmentData(json) {
        console.log("json", json)
        return getDepartmentData(json, this.getCurrentDepartmentId())
    }

    getJsonResponse(response) {
        return response.json()
    }


    title = 'Achat des pesticides et Qualité de l\'eau dans la France ';

    drawChart(departmentInformation) {
        if (this.currentDepartmentId !== 0)
            this.title = `Achat des pesticides et Qualité de l'eau dans le département: ${departmentInformation.departmentName}`;
        new Chart(document.getElementById(this.chartTagId), {
            type: 'line', data: {
                labels: [2016, 2017, 2018, 2019, 2020, 2021, 2022],
                datasets: departmentInformation.data,
            }, options: {
                plugins: {
                    title: {
                        display: true,
                        text: this.title,
                        font: {
                            family: 'Cascadia Code', size: 20
                        }
                        // size:15
                    }
                }, scales: {
                    y: {
                        type: 'linear', display: true, position: 'left',
                        title: {
                            display: true,
                            text: 'Conformité de l\'eau',
                        }
                    }, y1: {
                        type: 'linear', display: true, position: 'right', grid: {
                            drawOnChartArea: true, // only want the grid lines for one axis to show up
                        },
                        title: {
                            display: true,
                            text: 'Achats de pesticides en kg',
                        }
                    }
                }
            }
        });
    }

    draw() {
        // console.log(this.sourceJsonPromise)
        let a = this.getCurrentDepartmentData(this.sourceJsonPromise);
        // console.log(a)
        a = this.mapDepartmentDataToConformityByYearsArray(a);
        // console.log(a)
        a = this.mapConformityPerDepartmentToChartDataSets(a);
        // console.log(a)
        this.drawChart(a)
    }

}

function returnToHomePage() {
    goto("index.html");
}

function main() {
    try {
        const depCHart = new DepartmentChart(data);
        depCHart.draw()
    } catch (e) {

    }
}

main()
