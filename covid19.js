// global variables
// var Chart = require('chart.js');

const continents=['Asia', 'Africa', 'Oceania','Europe', 'Americas'];
const stats=['Confirmed', 'Death', 'Recovered','Critical'];
let defaultStat='Confirmed';
let defaultCont='Asia';
const countriesMap= [];
const covidPerContinentMap=new Map();
const covidPerCountryMap=[];

const statsButtons=document.querySelector('.stats-container')
const continentsButtons=document.querySelector('.continents-container')
const countriesList=document.querySelector('.countries-container')


// covid data object
function CovidData  (countryCode, countryName,confirmed, deaths, recovered, critical){
    
        this.countryCode = countryCode;    
        this.countryName = countryName;    
        this.confirmed = confirmed;
        this.deaths = deaths;
        this.recovered = recovered;
        this.critical = critical;
}

// country object
function Country (name, code,region){
    this.name=name;
    this.code=code;
    this.region=region;
}


  /************************************************************************************************** */
 /*****************************************************************************************
   * Draw Chart
   */
  function drawChart(countriesArr){
  const ctx = document.getElementById('myChart').getContext('2d'); 

  let countryNames= countriesArr.map((countrObj)=>{
      return countrObj.countryName;
  })
  let countryData= countriesArr.map((countrObj)=>{
      return countrObj.deaths;
  })
    myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: countryNames,
        datasets: [
          {
            label: defaultStat,
            backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
            data: countryData
          }
        ]
      },
      options: {
        legend: { display: false },
        title: {
          display: true,
          text: 'World Covid 19 Stats'
        }
      }
  });
 
  }

  /***************************************************************************************** */
  function drawStatsbutton(){
    stats.forEach((stat)=>{
        const button= document.createElement('button');
        button.innerText=stat;
        button.id=stat;
        button.addEventListener('click',clickStat);
        statsButtons.appendChild(button);
    })
  }

   function clickStat(e){
    defaultStat= e.target.id;
    myChart.destroy();
    drawChart(continentCountries);
}
  /***************************************************************************************** */
function drawContbutton(){
    continents.forEach((cont)=>{
        const button= document.createElement('button');
        button.innerText=cont;
        button.id=cont;
        button.addEventListener('click',clickContinent);
        continentsButtons.appendChild(button);
    })

}
async function clickContinent(e){
    defaultCont=e.target.id;
    const continentCountries= await getCovidPerContinent(e.target.id)
    myChart.destroy();
    drawChart(continentCountries);
}

/************************************************************************************************** */

async function drawCountriesList(){
    const myCountries= await getCountryPerContinent(defaultCont)
    const select= document.createElement('select');
     countriesList.appendChild(select);
    myCountries.forEach((country)=>{
        const option= document.createElement('option');
        option.innerText=country.name;
        option.id=country.name;
        select.appendChild(option)
        option.addEventListener('click',clickCountry);
       
    })

}
async function clickCountry(e){
    const continentCountries= await getCovidPerContinent(e.target.id)
    myChart.destroy();
    drawChart(continentCountries);
}

/********************************************************************************************* */
async function loadAll(){
    await loadCovidPerCountry();
    await loadContinents(continents);
     drawChart(await getCovidPerContinent(defaultCont))
     drawContbutton();
     drawStatsbutton();
     drawCountriesList()
}

window.addEventListener('load', (event) => {
    loadAll()
  });
console.log("covid per country map",covidPerCountryMap);
console.log("country-continent map",countriesMap);

/***********************************************************************************************
 * this function fetches countries from API using promise all synchronization ** */

 async function fetchCountries(continents) {
    let urlArr=[];
    let promiseUrl=[];
    const url2='https://intense-mesa-62220.herokuapp.com/https://restcountries.herokuapp.com/api/v1/region/'
    // const url='https://restcountries.herokuapp.com/api/v1/region/'
    // const proxy = 'https://api.codetabs.com/v1/proxy/?quest='

    //prepare urls for each continent in an array to use with promise all
    continents.forEach((cont)=>{
    urlArr.push(url2+cont);
    })
    try{ 
    promiseUrl= urlArr.map((url) => axios.get(url));
    const response= await Promise.all(promiseUrl);
    return response;
    }
    catch(error){
            console.log("Fail to get countries API", error);
    }
}
/********************************************************************************************** */


/*************************************************************************************************
 * this function fetches corona data for all countries
 */
async function fetchGlobalCoronaData() {

    try{
        const response =  await axios.get(`https://corona-api.com/countries`)
        return response.data;
    }
    catch(error){
            console.log(error);
    }
}


/** ********************************************************************************************
 this function gets all data for each country and stores it in an array of objects*/

async function loadContinents(continents){
    let worldData=[];
    try{
            worldData= await fetchCountries(continents);
            for (i=0;i<worldData.length; i++){
                
                for (let j=0;j<worldData[i].data.length; j++) 
                {
                    let myCountry=new Country(worldData[i].data[j].name.common, worldData[i].data[j].cca2,worldData[i].data[j].region);
                    countriesMap.push(myCountry);
                }
            }
           
        }
        catch (error)
        {
            console.log("Failed to Load Countries", error);
        }
        
    }

/*********************************************************************************************** 
 * this function calles the fetchGlobalCoronaData() function and creates CovidData objects and stores
 * them in the covidPerCountryMap
*/

async function loadCovidPerCountry(){
    let covidData=[];
    try{
        covidData=await fetchGlobalCoronaData();
        covidData.data.forEach((country)=>{
        let countryCovidObj=new CovidData (country.code,country.name, country.latest_data.confirmed,country.latest_data.deaths,country.latest_data.recovered,country.latest_data.critical);
        covidPerCountryMap.push(countryCovidObj);
        });
    }

    catch (error)
    {
        console.log("Failed to Load Covid Data", error);
    }

}
/*********************************************************************************************** 
 * this function returns an array of country codes based on a continent name
*/
async function getCountryPerContinent(continent){
    
    let countries=countriesMap.filter((country)=>{
        return (country.region===continent);
    })
console.log("inside get countries",countries)
     return countries;
}
/***********************************************************************************************
 * this function returns Covid data for all countries per continent
 */
 async function getCovidPerContinent(continent){
     console.log("calling covid per cont", continent);
    let codes=[];
    let temp=[];
    const  countries= await getCountryPerContinent(continent);
    countries.forEach((country)=>{
        codes.push(country.code)
    })
    console.log(codes)
    let result=  covidPerCountryMap.filter((country)=>{
        return codes.filter((code)=>{
             if (((country.countryCode===code) ))
            {temp.push(country)}
         })
        })

        temp.forEach((e)=> console.log(e.countryCode,e.confirmed));
        return temp;    
 }
/***********************************************************************************************
 * this function returns Covid data per country
 */
   function getCovidPerCountry(country){
     return covidPerCountryMap.find((c)=>(c.countryName===country))

 }
/***********************************************************************************************
 * this function returns Covid stats per country
 */
   function getCovidStatsPerCountry(statistic){
    
    //  return covidPerCountryMap.covidData.keys((key)=>(key===statistic))

 }

