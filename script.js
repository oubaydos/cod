//Constants
const [width, height, scale, transLegend] = window.innerWidth <= 1366 ?
    [600, 550, 3000, 550] :
    [650, 600, 3400, 650];
const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022];

//Global variables
// let currentYear = 2022;
let currentYear = 2016;
let colorClass = 'RdYlGn';
let promises = [];

// promises.push(d3.json('./departements.json'));
// promises.push(d3.json(DATA_SOURCE_PATH));


const load = () => {

    //Configure the map
    const svg = d3.select('svg')
        .attr('id', 'svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', colorClass);

    const projection = d3.geoConicConformal()
        .center([2.454071, 46.279229])
        .scale(scale)
        .translate([width / 1.9, height / 1.8]);

    const path = d3.geoPath();
    path.projection(projection);

    const group = svg.append('g');

    function getCurrentYearDepartments(results) {
        console.log("res", results)
        return results[1].filter(d => d.year === currentYear)[0].departments;
    }

    const quantile = d3.scaleQuantile()
        .domain([0, 1])
        .range(d3.range(6));

    const evaluate = (e) => {
        const reference_conformity = e["Conformité bactériologique de référence"] + e["Conformité chimique de référence"];
        let conformity = e["Conformité chimique"] + e["Conformité bactériologique"];
        // more importance to conf
        const conformity_coefficient = 4
        const reference_conformity_coefficient = 1
        //res
        const result_after_coefficient = conformity * conformity_coefficient + reference_conformity * reference_conformity_coefficient;
        let a = result_after_coefficient / (conformity_coefficient * 2 + reference_conformity_coefficient * 2);
        return roundToNearestClass(a);

    };

    function updateMap(results) {

        getCurrentYearDepartments(results).forEach(function (e, i) {
            d3.select("#dep" + e.CODE_DEPT)
                .attr("class", d => "department q" + (quantile(evaluate(e)) + 3) + "-9")
        });
    }

    //Load data
    Promise.all(promises).then((results) => {
        results = [departtments, data]
        console.log(results)
        console.log(departtments)
        const departmentChart = new DepartmentChart(data);
        departmentChart.chartTagId = "main_chart_canvas"
        departmentChart.currentDepartmentId = 0;
        // departmentChart.includeReferenceConformity = false;
        departmentChart.draw()

        //data
        const geoJSON = results[0];
        let paths = group.selectAll('path').data(geoJSON.features);
        let helper = d3.select("body")
            .append("div")
            .attr('id', 'info_box');


        let getDepartmentData = (data, id) => {
            const res = data.filter(d => d.CODE_DEPT === id)[0];
            return {
                confBactery: res["Conformité bactériologique"],
                confChemie: res["Conformité chimique"]
            }
        }
        paths.enter()
            .append('path')
            .attr('id', d => 'dep' + d.properties.CODE_DEPT)
            .attr('d', path)
            .on('mouseover', (event, data) => {
                d3.select('#dep' + data.properties.CODE_DEPT)
                    .attr('fill-opacity', 0.5)
                    .attr('stroke', 'white');
                const {
                    confBactery,
                    confChemie
                } = getDepartmentData(getCurrentYearDepartments(results), data.properties.CODE_DEPT);
                helper.append('p').text('Department: ' + capitalize(data.properties.NOM_DEPT));
                helper.append('p').text('Conformité Chimique: ' + floatToPercentage(confChemie))
                helper.append('p').text('Conformité Bactério: ' + floatToPercentage(confBactery))
                helper.style('opacity', 0.8);
                helper.style('left', event.clientX + 20 + 'px');
                helper.style('top', event.clientY + 20 + 'px');
            })
            .on('mouseout', (event, d) => {
                d3.select('#dep' + d.properties.CODE_DEPT)
                    .attr('fill-opacity', 1)
                    .attr('stroke', 'black');
                helper.style("opacity", 0).text("");

            })
            .on('click', (event, data) => {
                gotoChart(data.properties.CODE_DEPT)
            });


        const legend = svg.append('g')
            .attr('transform', 'translate(' + (transLegend) + ', 150)')
            .attr('id', 'legend');

        legend.selectAll('.colorbar')
            .data(d3.range(6))
            .enter().append('svg:rect')
            .attr('y', d => d * 20 + 'px')
            .attr('height', '20px')
            .attr('width', '20px')
            .attr('x', '0px')
            .attr("class", d => "q" + (d + 3) + "-9")

        const legendScale = d3.scaleLinear()
            .domain([0, 1])
            // .range([.1,.2,.3,.4,.5,1])
            .range([0, 20 * 6]);

        const legendAxis = svg.append("g")
            .attr('transform', 'translate(' + (transLegend + 25) + ', 150)')
            .call(
                d3.axisRight(legendScale).ticks(7).tickValues([0, 0.16, .33, .5, .66, .83, 1])
                    .tickFormat((d, i) => TICK_LABELS[i])
            );

        updateMap(results);
    })
    //inject buttons to timeline div
    const timeline = d3.select('#timeline');
    const buttons = timeline.selectAll('button').data(years);
    buttons.enter()
        .append('button')
        .attr('class', 'btn')
        .attr('id', d => "year" + d)
        .text(d => d)
        .on('click', (event, d) => {
            d3.selectAll('button').classed('active', false);
            d3.select("#year" + d).classed('active', true);
            currentYear = d;
            updateMap([departtments, data]);
        })

    d3.select("#year" + currentYear).classed('active', true);
}

window.addEventListener('load', (event) => load());