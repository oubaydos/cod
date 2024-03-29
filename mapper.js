function getDepartmentData(json, departmentId) {
    L = [];
    for (let i of json) {
        L.push({ ...i.departments.find(x => parseInt(x.CODE_DEPT) === parseInt(departmentId)), year: i.year });
    }
    L.sort((a, b) => a.year < b.year)
    console.log("getDepartmentData", departmentId)

    return L;
}

const ChartLinesColorPalette = {
    "Conformité chimique": '#4BC0C0',
    "Conformité bactériologique": '#36A2EB',
    "Conformité chimique de référence": "#68BB59",
    "Conformité bactériologique de référence": "#1338BE",
    "Achat des pesticides": '#FF0000'
}
