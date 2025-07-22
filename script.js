document.addEventListener("DOMContentLoaded", function() {
    let slides = document.querySelectorAll(".slide");
    let currentSlide = 0;

    function changeSlide() {
        slides[currentSlide].classList.remove("active");
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add("active");
    }

    setInterval(changeSlide, 5000); // Change d'image toutes les 5 secondes
});

document.addEventListener("DOMContentLoaded", function () {
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let concertsData = [];

    const prevButton = document.getElementById("prev-month");
    const nextButton = document.getElementById("next-month");

    // Charger les concerts depuis le fichier JSON
    fetch("concerts.json")
        .then(response => response.json())
        .then(data => {
            concertsData = data;
            updateConcertList();
        })
        .catch(error => console.error("Erreur de chargement des concerts:", error));

    function updateConcertList() {
        let container = document.getElementById("concerts-container");
        let monthTitle = document.getElementById("current-month");

        container.innerHTML = "";
        monthTitle.innerText = formatMonthYear(currentMonth, currentYear);

        // Filtrer les concerts du mois actuel
        let concertsThisMonth = concertsData.filter(concert => {
            let concertDate = new Date(concert.date);
            return (
                concertDate.getMonth() === currentMonth &&
                concertDate.getFullYear() === currentYear
            );
        });

        concertsThisMonth.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (concertsThisMonth.length === 0) {
            container.innerHTML = "<p>Aucun concert prévu ce mois-ci.</p>";
        } else {
            concertsThisMonth.forEach(concert => {
                let li = document.createElement("li");
                li.innerHTML = `<strong>${formatDate(concert.date)}</strong> - ${concert.title} à ${concert.city}`;
                container.appendChild(li);
            });
        }

        updateButtons(); // Vérifier la disponibilité des mois
    }

    function updateButtons() {
        // Vérifier s'il y a des concerts dans les mois précédents et suivants
        let hasPreviousConcert = concertsData.some(concert => {
            let concertDate = new Date(concert.date);
            return concertDate < new Date(currentYear, currentMonth, 1);
        });

        let hasNextConcert = concertsData.some(concert => {
            let concertDate = new Date(concert.date);
            return concertDate > new Date(currentYear, currentMonth, 1);
        });

        prevButton.disabled = !hasPreviousConcert;
        nextButton.disabled = !hasNextConcert;
    }

    function formatDate(dateString) {
        let date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function formatMonthYear(month, year) {
        let date = new Date(year, month, 1);
        return date.toLocaleDateString("fr-FR", { month: 'long', year: 'numeric' });
    }

    prevButton.addEventListener("click", function () {
        do {
            if (currentMonth === 0) {
                currentMonth = 11;
                currentYear--;
            } else {
                currentMonth--;
            }
        } while (!concertsData.some(concert => {
            let concertDate = new Date(concert.date);
            return concertDate.getMonth() === currentMonth && concertDate.getFullYear() === currentYear;
        }));
        updateConcertList();
    });

    nextButton.addEventListener("click", function () {
        do {
            if (currentMonth === 11) {
                currentMonth = 0;
                currentYear++;
            } else {
                currentMonth++;
            }
        } while (!concertsData.some(concert => {
            let concertDate = new Date(concert.date);
            return concertDate.getMonth() === currentMonth && concertDate.getFullYear() === currentYear;
        }));
        updateConcertList();
    });
});


document.addEventListener("DOMContentLoaded", function () {
    fetch("actualités.json")
        .then(response => response.json())
        .then(data => {
            data.sort((a, b) => new Date(b.date) - new Date(a.date)); // Trier par date

            let tickerText = data.map(news => `${news.date} : ${news.title}`).join(" | ");
            document.getElementById("news-ticker").innerText = tickerText;
        })
        .catch(error => console.error("Erreur de chargement des actualités:", error));
});

document.addEventListener("DOMContentLoaded", function() {
    fetch("actualités.json")
        .then(response => response.json())
        .then(data => {
            // Trier les actualités par date décroissante (plus récent en premier)
            data.sort((a, b) => new Date(b.date) - new Date(a.date));

            let container = document.getElementById("news-container");
            container.innerHTML = ""; // Effacer le contenu existant

            data.forEach(news => {
                let newsItem = document.createElement("div");
                newsItem.classList.add("news-item");
                newsItem.innerHTML = `
                    <img src="${news.image}" alt="${news.title}">
                    <div class="news-info">
                        <h3>${news.title}</h3>
                        <p><strong>${formatDate(news.date)}</strong></p>
                        <p>${news.description}</p>
                        <a href="${news.link}" target="_blank">Lire l'interview</a>
                    </div>
                `;
                container.appendChild(newsItem);
            });
        })
        .catch(error => console.error("Erreur de chargement des actualités:", error));
});

// Fonction pour formater la date en "20 mars 2025"
function formatDate(dateString) {
    let date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' });
}

// Initialisation de la carte centrée sur la France
var map = L.map('map').setView([48.8566, 2.3522], 5)

// Ajouter OpenStreetMap comme fond de carte
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Définir une icône personnalisée
var customIcon = L.icon({
iconUrl: 'images/electric-guitar.png', // Remplace par ton image
iconSize: [30, 30], // Taille de l'icône
iconAnchor: [20, 40], // Point d'ancrage (au centre en bas)
popupAnchor: [0, -40] // Déplacement du popup par rapport à l'icône
});

// Charger les concerts depuis le fichier JSON
fetch('concerts.json')
    .then(response => response.json())
    .then(concerts => {
        let concertsByLocation = {};

        concerts.forEach(concert => {
            let key = `${concert.lat},${concert.lng}`; // Utilisation des coordonnées comme clé unique
            let concertDate = new Date(concert.date).toLocaleDateString("fr-FR", {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            if (!concertsByLocation[key]) {
                concertsByLocation[key] = { city: concert.city, lat: concert.lat, lng: concert.lng, dates: [] };
            }
            concertsByLocation[key].dates.push(concertDate);
        });

        // Ajouter les marqueurs uniques sur la carte
        Object.values(concertsByLocation).forEach(location => {
            let popupContent = `<strong>${location.city}</strong><br>${location.dates.join('<br>')}`;

            L.marker([location.lat, location.lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(popupContent);
        });
    })
    .catch(error => console.error('Erreur de chargement des concerts:', error));

    document.addEventListener("DOMContentLoaded", function () {
        let elements = document.querySelectorAll(".hidden");
    
        function revealOnScroll() {
            let windowHeight = window.innerHeight;
    
            elements.forEach((el) => {
                let position = el.getBoundingClientRect().top;
                if (position < windowHeight - 100) {
                    el.classList.add("show");
                }
            });
        }
    
        window.addEventListener("scroll", revealOnScroll);
        revealOnScroll(); // Pour afficher les éléments visibles au chargement
    });

    document.addEventListener("DOMContentLoaded", function () {
        const banner = document.getElementById("cookie-banner");
        const acceptButton = document.getElementById("accept-cookies");
        const declineButton = document.getElementById("decline-cookies");
    
        // Vérifie si l'utilisateur a déjà accepté ou refusé les cookies
        if (localStorage.getItem("cookiesAccepted") === "true") {
            banner.style.display = "none"; // Masque la bannière
        }
    
        // Si l'utilisateur accepte les cookies
        acceptButton.addEventListener("click", function () {
            localStorage.setItem("cookiesAccepted", "true");
            banner.style.display = "none"; // Masque la bannière
            // Ici, tu peux activer Google Analytics ou d'autres scripts si besoin
        });
    
        // Si l'utilisateur refuse les cookies
        declineButton.addEventListener("click", function () {
            localStorage.setItem("cookiesAccepted", "false");
            banner.style.display = "none"; // Masque la bannière
            // Ici, tu peux bloquer les scripts non essentiels
        });
    });
    
    // Script mode sombre 
    document.addEventListener("DOMContentLoaded", function () {
        const toggleButton = document.getElementById("dark-mode-toggle");
        const body = document.body;
    
        // Vérifie si le mode sombre est activé et met à jour l'icône
        if (localStorage.getItem("darkMode") === "enabled") {
            body.classList.add("dark-mode");
            toggleButton.innerHTML = '<i class="fas fa-sun"></i>'; // ☀️ Icône du soleil (clair)
        } else {
            toggleButton.innerHTML = '<i class="fas fa-moon"></i>'; // 🌙 Icône de la lune (sombre)
        }
    
        toggleButton.addEventListener("click", function () {
            body.classList.toggle("dark-mode");
    
            if (body.classList.contains("dark-mode")) {
                localStorage.setItem("darkMode", "enabled");
                toggleButton.innerHTML = '<i class="fas fa-sun"></i>'; // ☀️
            } else {
                localStorage.setItem("darkMode", "disabled");
                toggleButton.innerHTML = '<i class="fas fa-moon"></i>'; // 🌙
            }
        });
    });
    
    