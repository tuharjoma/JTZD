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
    document.getElementById('searchingField').innerHTML="";
    if (role != "admin") {
        window.location.replace("index.html");
    }
    else {
        if (username) {
            let loggedInUser = document.getElementById("loggedInUser");
            if (loggedInUser) {
                loggedInUser.innerHTML = `${username} (${role})`;
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
            console.log(datas);
            let url = "http://localhost:3000/passwordChange";
            let fetchOptions = {
                method: "POST",
                body: JSON.stringify(datas),
                headers: { "Content-type": "application/json; charset=UTF-8" }
            };
            console.log(fetchOptions);
            fetch(url, fetchOptions)
                .then(x => x.text())
                .then(y => {
                    console.log(y);
                    alert(y);
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

// Jelszó módosítása mégse gomb:
function passwordChangeCancel() {
    document.getElementById('newPassword').value = "";
    document.getElementById('newPassword2').value = "";
    const changePasswordModal = document.getElementById('changePassword');
    const modal = bootstrap.Modal.getInstance(changePasswordModal);
    modal.hide();
}

// Adatok lekérése a card-okhoz + autók közti keresés (szűkítés a megadott feltételeknek)
function cardDatas() {
    const columnNames = {
        1: 'marka',
        2: 'tipus',
        3: 'evjarat',
        4: 'kolcsonozve'
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
                    <p class="card-text">${adat.kolcsonozve}</p>
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editModal" onclick="editableId = ${adat.id}">Módosítás</button>
                    <button type="button" class="btn btn-danger" onclick="deleteCar()">Törlés</button>
                </div>
            </div>
        </div>
        `;
    }
    document.getElementById('carCard').innerHTML = row;
}

// Új autó felvitele
function newCar() {
    if (document.getElementById('newBrand').value != "" && document.getElementById('newType').value != "" && document.getElementById('newYear').value != "" ) {

            const formData = new FormData();
            const picture = document.getElementById('newPicture').files[0];

            formData.append('brand', document.getElementById('newBrand').value);
            formData.append('type', document.getElementById('newType').value);
            formData.append('year', document.getElementById('newYear').value);
            formData.append('newPicture', picture);

            let url = "http://localhost:3000/newCar";
            let fetchOptions = {
                method: "POST",
                body: formData
            };
            fetch(url, fetchOptions)
                .then(x => x.json())
                .then(data => {
                    document.getElementById('newBrand').value = "";
                    document.getElementById('newType').value = "";
                    document.getElementById('newYear').value = "";
                    document.getElementById('newPicture').value = "";
                    console.log(data);
                    cardDatas();
                    alert(data.message);
                    /* //ha azt akarjuk, hogy bezáródjon a felvétel után
                    const newCarModal = document.getElementById('newCarModal');
                    const modal = bootstrap.Modal.getInstance(newCarModal);
                    modal.hide();
                    */
                })
                .catch(error => console.error(error));
    }
    else {
        alert("Minden mezőt tölts ki!");
    }
}

// Új autó mégse gomb:
function newCarCancel() {
    document.getElementById('newBrand').value = "";
    document.getElementById('newType').value = "";
    document.getElementById('newYear').value = "";
    document.getElementById('newPicture').value = "";
    const newModal = document.getElementById('newModal');
    const modal = bootstrap.Modal.getInstance(newModal);
    modal.hide();
}

// Autó törlése
function deleteCar() {
    // az aktuálos azonosító meghatározása
    const currentId = event.target.closest('.card-body').querySelector('h6').getAttribute('id');

    // a törlés megerősítése
    const confirmed = confirm("Biztosan törölni szeretnéd az autót?");
    if (!confirmed) {
        return;
    }

    let datas = {
        id: currentId
    }
    let url = "http://localhost:3000/deleteCar";
    let fetchOptions = {
        method: "POST",
        body: JSON.stringify(datas),
        headers: { "Content-type": "application/json; charset=UTF-8" }
    };
    fetch(url, fetchOptions)
        .then(x => x.text())
        .then(y => {
            alert(y);
            cardDatas();
        });
};

// a módosításhoz az id:
let editableId = null;

// Autó adatainak frissítéséhez az id beállítása:
function setEditableId(id) {
    editableId = id;
}

// Autó adatainak frissítése
function updateCar() {
    console.log(editableId);

    // A sorokról levesszük a whitespace karaktereket, ezt nem muszáj
    const editBrand = document.getElementById('editBrand').value.trim();
    const editType = document.getElementById('editType').value.trim();
    const editYear = document.getElementById('editYear').value.trim();
    const editPicture = document.getElementById('editPicture').files[0];

    console.log(editBrand, editType, editYear, editPicture);

    console.log(editBrand);
    const formData = new FormData();
    // hozzáadjuk a formData-hoz a küldendő adatokat
    formData.append('editableId', editableId);

    if (editBrand) {
        formData.append('editBrand', editBrand);
    }
    if (editType) {
        formData.append('editType', editType);
    }
    if (editYear) {
        formData.append('editYear', editYear);
    }
    if (editPicture) {
        formData.append('editPicture', editPicture);
    }

    console.log(formData);

    const url = 'http://localhost:3000/updateCar';
    const fetchOptions = {
        method: 'POST',
        body: formData,
    };
    fetch(url, fetchOptions)
        .then((response) => response.text())
        .then((result) => {
            alert(result);
            cardDatas();
            currentId = null;
            document.getElementById('editBrand').value = "";
            document.getElementById('editType').value = "";
            document.getElementById('editYear').value = "";
            document.getElementById('editPicture').value = "";
            const editModal = document.getElementById('editModal');
            const modal = bootstrap.Modal.getInstance(editModal);
            modal.hide();
        })
        .catch((error) => console.error(error));
}

function updateCarCancel() {
    document.getElementById('editBrand').value = "";
    document.getElementById('editType').value = "";
    document.getElementById('editYear').value = "";
    document.getElementById('editPicture').value = "";
    const editModal = document.getElementById('editModal');
    const modal = bootstrap.Modal.getInstance(editModal);
    modal.hide();
}