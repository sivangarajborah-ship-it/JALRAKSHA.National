const BACKEND_URL = "https://xkv7ad4wvf.execute-api.ap-south-1.amazonaws.com/prod/floodprediction";

let map;
let marker;
let chart;

function initMap() {

    const defaultLoc = { lat: 20.5937, lng: 78.9629 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 5,
        center: defaultLoc
    });

    marker = new google.maps.Marker({
        position: defaultLoc,
        map: map
    });

    const ctx = document.getElementById("rainChart").getContext("2d");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Now", "1hr", "2hr", "3hr", "4hr", "5hr"],
            datasets: [{
                label: "Rainfall Prediction (mm)",
                data: [0,0,0,0,0,0],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true
        }
    });
}

async function predict() {

    const city = document.getElementById("city").value.trim();

    if (!city) {
        alert("Please enter a city name");
        return;
    }

    try {

        const response = await fetch(
            `${BACKEND_URL}?city=${encodeURIComponent(city)}`
        );

        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        const location = {
            lat: data.lat,
            lng: data.lon
        };

        map.setCenter(location);
        marker.setPosition(location);

        document.getElementById("weather").innerText =
            `Rainfall: ${data.rainfall} mm | Humidity: ${data.humidity}% | Temperature: ${data.temperature}°C`;

        document.getElementById("risk").innerText =
            "Flood Risk: " + data.flood_risk;

        chart.data.datasets[0].data = [
            data.rainfall,
            data.rainfall * 1.1,
            data.rainfall * 1.2,
            data.rainfall * 1.3,
            data.rainfall * 1.5,
            data.rainfall * 1.8
        ];

        chart.update();

        showAlert(data.flood_risk);

    } catch (error) {

        console.error(error);
        alert("Error: Failed to fetch backend");

    }
}

function showAlert(risk) {

    const alertBox = document.getElementById("alert");

    if (risk === "High") {
        alertBox.innerText = "⚠️ High Flood Risk! Stay Alert!";
        alertBox.style.display = "block";
    }
    else if (risk === "Moderate") {
        alertBox.innerText = "⚠️ Moderate Flood Risk!";
        alertBox.style.display = "block";
    }
    else {
        alertBox.style.display = "none";
    }

}