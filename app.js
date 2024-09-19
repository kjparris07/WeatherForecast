import 'regenerator-runtime';
import axios, { toFormData } from 'axios';

const WEATHER_CODES = {
    "0": "Clear Sky",
    "1": "Mainly Clear",
    "2": "Partly Cloudy",
    "3": "Overcast",
    "45": "Fog",
    "48": "Fog",
    "51": "Light Drizzle",
    "53": "Drizzle",
    "55": "Dense Drizzle",
    "56": "Light Freezing Drizzle",
    "57": "Dense Freezing Drizzle",
    "61": "Slight Rain",
    "63": "Rain",
    "65": "Heavy Rain",
    "66": "Light Freezing Rain",
    "67": "Heavy Freezing Rain",
    "71": "Light Snowfall",
    "73": "Snowfall",
    "75": "Heavy Snowfall",
    "77": "Snowfall",
    "80": "Light Rain",
    "81": "Rain",
    "82": "Heavy Rain",
    "85": "Light Snowfall",
    "86": "Heavy Snowfall",
    "95": "Thunderstorm"
};

function validateZip() {
    let zipcode = document.querySelector('#zipcode');
    let zipcodeVal = zipcode.value;

    let digitError = document.querySelector("#digitError");
    let button = document.querySelector('#submitZip');

    if (isNaN(zipcodeVal)) {
        zipcode.style.border = '1px solid red';
        digitError.style.display = 'block';
        button.disabled = true;
        return false;

    } else if (zipcodeVal == '' || zipcodeVal.length < 5){
        button.disabled = true;
        return false;
    } else {
        zipcode.style.border = '1px solid var(--blue)';
        digitError.style.display = 'none';
        button.disabled = false;
        return true;
    }
}

const getLocationData = async () => {

    const zip = document.querySelector('#zipcode').value;
    const RESPONSE = await axios.get(`http://api.zippopotam.us/us/${zip}`);
    const latitude = RESPONSE.data.places[0].latitude;
    const longitude = RESPONSE.data.places[0].longitude;
    return { latitude, longitude };
}

const getWeatherData = async () => {
    let results = document.querySelector('#results');
    let headings = document.querySelector('#currentConditions');

    results.style.display = 'none';
    headings.style.display = 'none';

    const coords = await getLocationData();
    const latitude = coords.latitude;
    const longitude = coords.longitude;
    const BASE_URL = 'https://api.open-meteo.com/v1/forecast?';

    let today = new Date();
    let tomorrow = new Date();
    const CURRENT_HOUR = today.getHours();
    
    today = today.toISOString().split('T')[0];
    tomorrow.setDate(tomorrow.getDate()+1);
    tomorrow = tomorrow.toISOString().split('T')[0];

    const RESPONSE = await axios.get(`${BASE_URL}latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&hourly=temperature_2m,precipitation_probability&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&start_date=${today}&end_date=${tomorrow}`);

    const RESPONSE_DATA = RESPONSE.data;
    
    const CURRENT_TEMP = Math.floor(RESPONSE_DATA.current.temperature_2m);
    const CURRENT_COND = RESPONSE_DATA.current.weather_code;
    const HOURS = RESPONSE_DATA.hourly.time;
    const HOURLY_TEMPS = RESPONSE_DATA.hourly.temperature_2m;
    const HOURLY_PRECIPS = RESPONSE_DATA.hourly.precipitation_probability;

    let hourRow = results.querySelector('#hours');
    let tempRow = results.querySelector('#temps');
    let precipRow = results.querySelector('#precipChances');

    document.querySelector('#currentTemp').innerHTML = CURRENT_TEMP + '°F';
    document.querySelector('#currentCondition').innerHTML = WEATHER_CODES[CURRENT_COND];
    
    for (let i=CURRENT_HOUR; i<HOURS.length && i<CURRENT_HOUR+12; i++) {
        let hour = HOURS[i].split('T')[1].split(':')[0];
        let am_or_pm = 'am';
        
        if (hour == 0) {
            hour=12;
            am_or_pm = 'pm';
        } else if (hour > 12) {
            am_or_pm = 'pm';
            hour = hour%12;
        } else {
            hour = hour%12;
        }
        

        hourRow.innerHTML +=  `<td>${hour}:00 ${am_or_pm}</td>`;

        let temp = Math.floor(HOURLY_TEMPS[i]);
        tempRow.innerHTML += `<td>${temp}°F</td>`;

        let precip = HOURLY_PRECIPS[i];
        precipRow.innerHTML += `<td>${precip}%</td>`;
    }

    results.style.display = 'block';
    headings.style.display = 'block';
}

async function handleKeyPress(key) {
    if (key.code === 'Enter') {
        if (validateZip()) {
            await getWeatherData();
        }
    }
}

const main = async () => {
    document.querySelector('#zipcode').addEventListener('input', validateZip);
    window.addEventListener('keypress', handleKeyPress);
    document.querySelector('#submitZip').addEventListener('click', await getWeatherData);
}

main();