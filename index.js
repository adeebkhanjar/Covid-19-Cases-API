const select = document.querySelector('select'),
    spinner = document.querySelector('.spinner'),
    mainContainer = document.querySelector('.main-container'),
    mainBtn = document.querySelector('.main-btn'),
    input = document.querySelectorAll('input'),
    td = document.querySelector('.td'),
    nd = document.querySelector('.nd'),
    tc = document.querySelector('.tc'),
    nc = document.querySelector('.nc'),
    tr = document.querySelector('.tr'),
    cr = document.querySelector('.cr'),
    per = document.querySelector('.per');
let option = document.querySelectorAll('option');
let namesArray = [],
    recoverdArray = [],
    confirmedArray = [],
    criticalArray = [],
    deathesArray = [],
    newDeathesArray = [],
    newConfirmedArray = [],
    ctx, regions, tempWorld, tempChange, checkFirstFetch, myChart;
// ----------addEventListener for printing region in the chart and printing its countrys in the <select>------//
input.forEach((el, j) => {
    el.addEventListener('click', (e) => {
        printData(j)
        getCountriesInContenent(e.target.value)
    })
});
//-----addEventListener for updating the stats of selected country-----//
select.addEventListener('change', changeCountries)
    //-----function() for updating the stats of selected country-----//
function changeCountries(e) {
    tempChange = tempWorld.filter(v => { return e.target.value == v.name })
    td.innerHTML = `${tempChange[0].latest_data.deaths}`
    nd.innerHTML = `${tempChange[0].today.deaths}`
    tc.innerHTML = `${tempChange[0].latest_data.confirmed}`
    nc.innerHTML = `${tempChange[0].today.confirmed}`
    tr.innerHTML = `${tempChange[0].latest_data.recovered}`
    cr.innerHTML = `${tempChange[0].latest_data.critical}`
    per.innerHTML = `${(tempChange[0].latest_data.confirmed*100/tempChange[0].population).toFixed(2)}`
    if (per.innerHTML < 1) {
        mainContainer.style.boxShadow = ' limegreen 0 0 3vw 0.01vw';
    } else if (per.innerHTML < 4) {
        mainContainer.style.boxShadow = ' limegreen 0 0 2vw 0.01vw';
    } else if (per.innerHTML > 9) {
        mainContainer.style.boxShadow = ' red 0 0 3vw 0.01vw';
    } else if (per.innerHTML > 6) {
        mainContainer.style.boxShadow = ' red 0 0 2vw 0.01vw';
    } else { mainContainer.style.boxShadow = ' goldenrod 0 0 2vw 0.01vw'; }
}
//-------function for fetching data and storing it in local storage-----//
async function getData() {
    if (!localStorage.getItem("tempStorage")) {
        spinner.style.display = 'block';
        //! mainBtn.style.display = 'none';
        let data1 = await (await fetch('https://corona-api.com/countries')).json();
        let data2 = await (await fetch('https://raw.githubusercontent.com/Anan014/covid19_1.0/main/js/all_countries.json')).json();
        spinner.style.display = 'none';
        //!mainBtn.style.display = 'block';
        localStorage.setItem("tempStorage", JSON.stringify({ data1: data1, data2: data2 }))
    }
    let data = JSON.parse(localStorage.getItem("tempStorage"))
    checkFirstFetch = true
    tempWorld = data.data1.data
        // ----------------------variable that holds an array of [{regions {that hold an array of [countries]}}]---------------------------//
    regions = Array.from(new Set(data.data2.map(v => {
        return v.region ? v.region : 'Asia'
    }))).map(v => {
        return {
            region: v,
            countries: data.data1.data.map(v => {
                return {
                    code: v.code,
                    name: v.name,
                    confirmed: v.latest_data.confirmed,
                    newConfirmed: v.today.confirmed,
                    deaths: v.latest_data.deaths,
                    newDeaths: v.today.deaths,
                    recovered: v.latest_data.recovered,
                    critical: v.latest_data.critical,
                    percentage: v.latest_data.confirmed * 100 / v.population,
                }
            }).filter(w => {
                return data.data2.filter(k => {
                    return k.region == v && k.cca2 == w.code
                }).length > 0
            }),
        }
    });
    return regions
}
//------------a function that inserts countries of a selected region in <select> by an event listener from <inputs>-----//
async function getCountriesInContenent(contenent) {
    if (!checkFirstFetch) await getData()
    let selectObj = document.querySelector('#countries-list-select')
    let htmlToAdd = '';
    switch (contenent) {
        case 'Americas':
            regions[4].countries.forEach(element => {
                htmlToAdd += `<option value='${element.name}'>${element.name}</option>`
            })
            selectObj.innerHTML = htmlToAdd
            break;
        case 'Europe':
            regions[1].countries.forEach(element => {
                htmlToAdd += `<option value='${element.name}'>${element.name}</option>`
            })
            selectObj.innerHTML = htmlToAdd
            break;
        case 'Africa':
            regions[2].countries.forEach(element => {
                htmlToAdd += `<option value='${element.name}'>${element.name}</option>`
            })
            selectObj.innerHTML = htmlToAdd
            break;
        case 'Asia':
            regions[0].countries.forEach(element => {
                htmlToAdd += `<option value='${element.name}'>${element.name}</option>`
            })
            selectObj.innerHTML = htmlToAdd
            break;
        case 'Oceania':
            regions[3].countries.forEach(element => {
                htmlToAdd += `<option value='${element.name}'>${element.name}</option>`
            })
            selectObj.innerHTML = htmlToAdd
            break;
        case 'World':
            regions[0].countries.concat(regions[1].countries).concat(regions[2].countries).concat(regions[3].countries).concat(regions[4].countries).forEach(element => {
                htmlToAdd += `<option value='${element.name}'>${element.name}</option>`
            })
            selectObj.innerHTML = htmlToAdd
            break;
    }
}
//----first call to print world----//
getCountriesInContenent('World')
    //------a function() for printing and inserting values to the chart by an event listener from <inputs>----//
async function printData(j) {
    regions = await getData()
        //========late addition of world to regions=========//
    let y = [1, 1, 1, 1, 1]
    let x = {
        countries: y.map((v, i) => {
            return {
                name: regions[i].region,
                confirmed: regions[i].countries.map(v => { return v.confirmed }).reduce((prev, cur) => { return prev + cur }),
                newConfirmed: regions[i].countries.map(v => { return v.newConfirmed }).reduce((prev, cur) => { return prev + cur }),
                deaths: regions[i].countries.map(v => { return v.deaths }).reduce((prev, cur) => { return prev + cur }),
                newDeaths: regions[i].countries.map(v => { return v.newDeaths }).reduce((prev, cur) => { return prev + cur }),
                recovered: regions[i].countries.map(v => { return v.recovered }).reduce((prev, cur) => { return prev + cur }),
                critical: regions[i].countries.map(v => { return v.critical }).reduce((prev, cur) => { return prev + cur }),
                percentage: regions[i].countries.map(v => { return v.percentage }).reduce((prev, cur) => { return prev + cur }) / regions[i].countries.length
            }
        })
    }
    regions.unshift(x)
        //=================================================//
        //------resetting chart arrays values---/
    namesArray = [];
    recoverdArray = [];
    confirmedArray = [];
    criticalArray = [];
    deathesArray = [];
    newDeathesArray = [];
    newConfirmedArray = [];
    //------inserting the values------/
    regions[j].countries.forEach((v, i) => {
        namesArray.push(v.name + ' •');
        recoverdArray.push(v.recovered);
        confirmedArray.push(v.confirmed);
        criticalArray.push(v.critical);
        deathesArray.push(v.deaths);
        newConfirmedArray.push(v.newConfirmed);
        newDeathesArray.push(v.newDeaths);
    });
    //-----checking if chart is empty if true => clearing it-----//
    if (myChart) myChart.destroy()
    ctx = document.querySelector('.chart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: namesArray,
            datasets: [{
                label: 'recoverd',
                data: recoverdArray,
                backgroundColor: ['limegreen'],
                borderColor: ['transparent'],
                borderWidth: 0.3,
            }, {
                label: 'confirmed',
                data: confirmedArray,
                backgroundColor: ['gold'],
                borderColor: ['transparent'],
                borderWidth: 0.3,
            }, {
                label: 'critical',
                data: criticalArray,
                backgroundColor: ['orangered'],
                borderColor: ['transparent'],
                borderWidth: 0.3,
            }, {
                label: 'deathes',
                data: deathesArray,
                backgroundColor: ['darkred'],
                borderColor: ['transparent'],
                borderWidth: 0.3,
            }, {
                label: 'new confirmed',
                data: newConfirmedArray,
                backgroundColor: ['darkblue'],
                borderColor: ['transparent'],
                borderWidth: 0.3,
            }, {
                label: 'new deathes',
                data: newDeathesArray,
                backgroundColor: ['purple'],
                borderColor: ['transparent'],
                borderWidth: 0.3,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {
                    ticks: {
                        autoSkip: false,
                    }
                }
            }
        }
    });
}
//---first call to print world---//
printData(0)