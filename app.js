// The 54 African countries grouped by regions (UN geoscheme)
const regions = {
  "North Africa": ["DZ", "EG", "LY", "MA", "SD", "TN"],
  "West Africa": ["BJ", "BF", "CV", "CI", "GM", "GH", "GN", "GW", "LR", "ML", "MR", "NE", "NG", "SN", "SL", "TG"],
  "East Africa": ["BI", "KM", "DJ", "ER", "ET", "KE", "MG", "MW", "MU", "MZ", "RW", "SC", "SO", "SS", "TZ", "UG", "ZM", "ZW"],
  "Central Africa": ["AO", "CM", "CF", "TD", "CG", "CD", "GQ", "GA", "ST"],
  "Southern Africa": ["BW", "SZ", "LS", "NA", "ZA"]  
};

let allCountries = [];

function getAllCodes() {
    let codes = [];
    for (const regionName in regions) {
        codes =codes.concat(regions[regionName]);
    }
    return codes;
}

function findRegion(code) {
    for (const regionName in regions) {
        if (regions[regionName].includes(code)) {
            return regionName;
        }
    }
    return "Unknown";
}

async function loadCountries() {
    const codes = getAllCodes();
    const countryURL = "https://api.worldbank.org/v2/country?format=json&per_page=300";
    const populationUrl = "https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&mrnev=1&per_page=500";

    try {
        const countryResponse = await fetch(countryURL);
        const countryData = await countryResponse.json();
        const populationResponse = await fetch(populationUrl);
        const populationData = await populationResponse.json();

        // each answer is [pageInfo, listPfItems], so the list is at position 1
        const populations = {};
        populationData[1].forEach(function (item) {
            populations[item.country.id] = item.value;
        });

        allCountries = countryData[1].filter(function (item) {
            return codes.includes(item.iso2Code);
        }).map(function (item) {
            return {
                code: item.iso2Code,
                name: item.name,
                capital: item.capitalCity,
                income: item.incomeLevel.value,
                region: findRegion(item.iso2Code),
                population: populations[item.iso2Code]
            };
        });

        allCountries.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });

        console.log("Countries loaded:", allCountries.length);
        applyFilters();
    } catch (error) {
        console.log("Error:", error);
        document.getElementById("results").innerHTML = "Could not load countries. Please try again.";    
    }
}

function showCountries(list) {
    const results = document.getElementById("results");
    results.innerHTML = "";
    if (list.length === 0) {
        results.innerHTML = "<p>No country matches your search.</p>";
        return;
    }

    list.forEach(function (country){
        let population = "No data";
        if (country.population) {
            population = country.population.toLocaleString();
        }
    //build the myth and fact boxes for this country, if we have any
    let mythHtml = "";
    if (typeof myths !== "undefined" && myths[country.code]) {
        myths[country.code].forEach(function (item) {
            mythHtml +=
                "<div class='myth'>" +
                "<p><strong>Myth:</strong> " + item.myth + "</p>" +
                "<p><strong>Fact:</strong> " + item.fact + "</p>" +
                "</div>";
        });
    }

    let factHtml = "";
    if (typeof facts !== "undefined" && facts[country.code]) {
        factHtml = "<p class='fact'><strong>Did you know?</strong> " + facts[country.code] + "</p>";
    }

    const regionClass = country.region.toLowerCase().replace(" ","-");

        results.innerHTML += 
        "<div class='card " + regionClass + "'>" +
        "<img src='https://flagcdn.com/w80/" + country.code.toLowerCase() + ".png' alt='Flag of " + country.name + "'>" +
        "<h3>" + country.name + "</h3>" +
        "<span class='tag'>" + country.region + "</span>" +
        "<p><strong>Capital:</strong> " + country.capital + "</p>" +
        "<p><strong>Population</strong>: " + population + "</p>" +
        factHtml +
        mythHtml +
        "</div>";
    });
}

function applyFilters() {
    const searchText = document.getElementById("searchBox").value.toLowerCase();
    const region = document.getElementById("regionFilter").value;
    const sortBy = document.getElementById("sortBy").value;

    //keep only the countries that match the search and the region
    const list = allCountries.filter(function(country){
        const matchesSearch =
            country.name.toLowerCase().includes(searchText) ||
            country.capital.toLowerCase().includes(searchText);
        const matchesRegion = region === "all" || country.region === region;
        return matchesSearch && matchesRegion;
    });

    //sort the result
    if (sortBy === "population-high") {
        list.sort(function (a, b){ return (b.population || 0) - (a.population || 0); });
    } else if (sortBy === "population-low") {
        list.sort(function (a, b) { return (a.population || 0) - (b.population || 0); });
    } else {
        list.sort(function (a, b) { return a.name.localeCompare(b.name); });
        }
    document.getElementById("count").innerHTML = "Showing " + list.length + " of " + allCountries.length + " countries";
    showCountries(list);
}
document.getElementById("searchBox").addEventListener("input", applyFilters);
document.getElementById("regionFilter").addEventListener("change", applyFilters);
document.getElementById("sortBy").addEventListener("change", applyFilters);

loadCountries();