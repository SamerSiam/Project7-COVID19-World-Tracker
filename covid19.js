// global variables
const continents=['Asia', 'Africa', 'Oceania','Europe', 'Americas'];
// const countriesMap= new Map();
const countriesMap= [];
const covidPerContinentMap=new Map();
// const covidPerCountryMap=new Map();
const covidPerCountryMap=[];

// covid data object
function CovidData  (countryCode, confirmed, deaths, recovered, critical){
    
        this.countryCode = countryCode;    
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

async function loadAll(){
    await loadCovidPerCountry();
    await loadContinents(continents);
    // await getCountryPerContinent('Asia');
    await getCovidPerContinent('Asia')
}


loadAll();
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
// async function fetchCountries(continent) {
//     const proxy = 'https://api.codetabs.com/v1/proxy/?quest='
//     try{
//         const response =  await axios.get(`${proxy}https://restcountries.herokuapp.com/api/v1/region/${continent}`)
//         console.log(response.data);
//         return response.data;
//     }
//     catch(error){
//             console.log(error);
//     }
// }

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
 this function gets all data for each country and creates a Map for each country and continent*/
// NOT NEEDED , KEEP FOR NOW
// async function loadContinents(continent){
// try{
//         countryData=  await fetchCountries(continent);
//         countryData.forEach((data)=>{
//         let myCountry=new Country(data.name.common, data.cca2,data.region);
//         countriesMap.set(myCountry,myCountry.region);
//         });
       
//     }
//     catch (error)
//     {
//         console.log("Failed to Load Countries", error, continent);
//     }
// }
/** ********************************************************************************************
 this function gets all data for each country and creates a Map for each country and continent*/

async function loadContinents(continents){
    let worldData=[];
    try{
            worldData= await fetchCountries(continents);
            for (i=0;i<worldData.length; i++){
                
                for (let j=0;j<worldData[i].data.length; j++) 
                {
                    let myCountry=new Country(worldData[i].data[j].name.common, worldData[i].data[j].cca2,worldData[i].data[j].region);
                    // countriesMap.set(myCountry,myCountry.region);
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
        let countryCovidObj=new CovidData (country.code, country.latest_data.confirmed,country.latest_data.deaths,country.latest_data.recovered,country.latest_data.critical);
        // covidPerCountryMap.set(countryCovidObj,countryCovidObj.countryCode);
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

     return countries;
}
/***********************************************************************************************
 * this function returns Covid data for all countries per continent
 */
 async function getCovidPerContinent(continent){
    let codes=[];
    let temp=[];
    const  countries= await getCountryPerContinent(continent);
    countries.forEach((country)=>{
        codes.push(country.code)
    })
    console.log(codes)
    let result=  covidPerCountryMap.filter((country)=>{
         codes.forEach((code)=>{
             if (country.countryCode===code){
                 temp.push(country);
             }
         })
        
        })

        console.log("result"+temp);
         
 }
