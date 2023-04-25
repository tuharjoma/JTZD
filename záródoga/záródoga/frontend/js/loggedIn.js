// Regisztráció:
function registration() {
    if (document.getElementById('regUsername').value != "" && document.getElementById('regPassword1').value != "" && document.getElementById('regPassword2').value != "") {
        if (document.getElementById('regPassword1').value == document.getElementById('regPassword2').value) {
            let datas = {
                username: document.getElementById("regUsername").value,
                password: document.getElementById("regPassword1").value,
            };
            let url = "http://localhost:3000/register";
            let fetchOptions = {
                method: "POST",
                body: JSON.stringify(datas),
                headers: { "Content-type": "application/json; charset=UTF-8" }
            };
            fetch(url, fetchOptions)
                .then(x => x.text())
                .then(y => {
                    alert(y);
                    document.getElementById('regUsername').value = "";
                    document.getElementById('regPassword1').value = "";
                    document.getElementById('regPassword2').value = "";
                });
        }
        else {
            alert("A két jelszó nem egyezik!");
        }
    }
    else {
        alert("Minden mezőt kötelező kitölteni!");
    }
}

// Bejelentkezés
function login() {
    if (document.getElementById('logUsername').value !== "" && document.getElementById('logPassword').value !== "") {
        let datas = {
            username: document.getElementById('logUsername').value,
            password: document.getElementById('logPassword').value,
        };
        let url = "http://localhost:3000/login";
        let fetchOptions = {
            method: "POST",
            body: JSON.stringify(datas),
            headers: { "Content-type": "application/json; charset=UTF-8" }
        };
        fetch(url, fetchOptions)
            .then(x => {
                return x.json();
            })
            .then(y => {
                console.log(y);
                if (y.role === "admin") {
                    sessionStorage.setItem("username", y.username);
                    sessionStorage.setItem("role", y.role);
                    window.location.replace('admin.html');
                }
                else if (y.role === "user") {
                    sessionStorage.setItem("username", y.username);
                    sessionStorage.setItem("role", y.role);
                    window.location.replace('loggedIn.html');
                }
                else {
                    alert("Hibás felhasználónév vagy jelszó!")
                    document.getElementById('logPassword').value = "";
                }
            })
            .catch(error => {
                console.error(error);
            });
    } else {
        alert("Minden mezőt kötelező kitölteni!");
    }
};

// Kijelentkezés
function logout() {
    let url = "http://localhost:3000/logout";
    let datas = {
        username: sessionStorage.getItem("username"),
    };
    let fetchOptions = {
        method: "POST",
        body: JSON.stringify(datas),
        headers: { "Content-type": "application/json; charset=UTF-8" }
    };
    fetch(url, fetchOptions)
        .then(x => {
            x.json();
            sessionStorage.removeItem("username");
            sessionStorage.removeItem("role");
            window.location.href = "index.html";
        });
};

// Felhasználó kiírása
function load() {
    let username = sessionStorage.getItem("username");
    let role = sessionStorage.getItem("role");
    if (role != "user") {
        window.location.replace("index.html");
    }
    else {
        if (username) {
            let loggedInUser = document.getElementById("loggedInUser");
            if (loggedInUser) {
                loggedInUser.innerHTML = `Hello ${username} (${role})`;
            }
        }
    }
};

// Jelszó módosítása
function passwordChange() {
    if (document.getElementById('newPassword').value != "" || document.getElementById('newPassword2').value != "") {
        if (document.getElementById('newPassword').value == document.getElementById('newPassword2').value) {
            let jelszo = document.getElementById("newPassword").value;
            let felhasz = sessionStorage.getItem("username");
            console.log(jelszo);
            console.log(felhasz);

            let datas = {
                username: sessionStorage.getItem("username"),
                password: document.getElementById("newPassword").value,
            };
            let url = "http://localhost:3000/passwordChange";
            let fetchOptions = {
                method: "POST",
                body: JSON.stringify(datas),
                headers: { "Content-type": "application/json; charset=UTF-8" }
            };
            fetch(url, fetchOptions)
                .then(x => x.text())
                .then(y => {
                    const alertDiv = document.createElement('div');
                    alertDiv.classList.add('alert', 'alert-success');
                    alertDiv.setAttribute('role', 'alert');
                    alertDiv.style.display = 'none';
                    alertDiv.innerHTML = y;

                    const modalBody = document.querySelector('#changePassword .modal-body');
                    modalBody.insertAdjacentElement('beforebegin', alertDiv);

                    alertDiv.style.display = 'block';
                    document.getElementById('newPassword').value = "";
                    document.getElementById('newPassword2').value = "";
                    const changePassword = document.getElementById('changePassword');
                    const modal = bootstrap.Modal.getInstance(changePassword);
                    modal.hide();
                });
        }
        else {
            alert("A két jelszó nem egyezik!");
        }
    }
    else {
        alert("Minden mezőt kötelező kitölteni!");
    }
}

// Adatok lekérése a card-okhoz + könyvek közti keresés (szűkítés a megadott feltételeknek)
function cardDatas() {
    const columnNames = {
        1: 'marka',
        2: 'tipus',
        3: 'evjarat'
    }
    const searchingField = document.getElementById('searchingField').value;
    const searchType = columnNames[document.getElementById('searchType').value];
    console.log(searchingField);
    console.log(searchType);
    let datas = {
        searchingField: searchingField,
        searchType: searchType,
    };
    console.log(datas);
    let url = "http://localhost:3000/cards";
    let fetchOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(datas)
    }
    console.log(fetchOptions);
    console.log(fetchOptions.headers);
    fetch(url, fetchOptions)
        .then(x => {
            console.log(x);
            return x.json();
        })
        .then(y => {
            console.log(y);
            cards(y);
        })
        .catch(error => console.error(error));
}

// Adatok kirajzoltatása
function cards(adatok) {
    let row = "";
    console.log(adatok);
    for (let adat of adatok) {
        row += `
        <div class="col-xxl-2 col-xl-3 col-md-4 col-sm-6 my-2">
            <div class="card h-100">
                <img src="http://localhost:3000/${adat.kep}" class="card-img-top img-fluid img-thumbnail" alt="${adat.kep}">
                <div class="card-body">
                    <h6 id=${adat.id} class="d-none">${adat.id}</h6>
                    <h5 class="card-title">${adat.marka}</h5>
                    <p class="card-text">${adat.tipus}</p>
                    <p class="card-text">${adat.evjarat}</p>
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editModal" onclick="carRental()">Kölcsönzés</button>
                </div>
            </div>
        </div>
        `;
    }
    document.getElementById('carCard').innerHTML = row;
}

function carRental() {
    window.location.replace('kolcsonzes.html')
}

function mainpage() {
    window.location.replace('loggedin.html')
}