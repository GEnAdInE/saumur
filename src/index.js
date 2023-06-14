var fields = {}
var forCsv = [];



// Helper function to remove all child nodes from a parent node
function empty(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}


// Function to handle errors
function on_error(e) {
    console.error(e, e.stack);
    var errorDiv = document.querySelector('.error');
    empty(errorDiv);
    var errorMessage = document.createElement('p');
    errorMessage.textContent = e.message;
    errorDiv.appendChild(errorMessage);
}

// Function to handle file loading
function on_file(filename, buf) {

    var fill_form = document.querySelector('.fill_form');
    fill_form.addEventListener('submit', function(e) {
        e.preventDefault();
        fill(buf);
    });
}

function postRequest(data) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:5000/submit", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.withCredentials = true; // Enable credentials

    xhr.onload = function() {
        if (xhr.status === 200) {
            // Success
            console.log("C'est envoyé !");
            var successMessage = document.createElement('p');
            successMessage.textContent = "C'est envoyé  !";
            document.body.appendChild(successMessage);
        } else {
            // Error
            console.error("POST request failed. Status code: " + xhr.status);
            var errorMessage = document.createElement('p');
            errorMessage.textContent = "Failed to send data. Please try again later.";
            document.body.appendChild(errorMessage);
        }
    };

    xhr.onerror = function() {
        // Network error
        console.error("An error occurred while sending the POST request");
        var errorMessage = document.createElement('p');
        errorMessage.textContent = "An error occurred while sending the request. Please check your network connection.";
        document.body.appendChild(errorMessage);
    };

    xhr.send(JSON.stringify(data));
}



// Function to fill out the fields and download the PDF
function fill(buf) {
    var nom = document.getElementById('nom').value;
    var prenom = document.getElementById('prenom').value;
    var tel = document.getElementById('tel').value;
    var mail = document.getElementById('mail').value;
    var adresse = document.getElementById('adresse').value;
    var postal = document.getElementById('postal').value;
    var ville = document.getElementById('ville').value;
    var pays = document.getElementById('pays').value;
    var lieu = document.getElementById('lieu').value;


    fields = {
        nom: [nom],
        prenom: [prenom],
        tel: [tel],
        mail: [mail],
        adresse: [adresse],
        postal: [postal],
        ville: [ville],
        pays: [pays],
        lieu: [lieu]
    };

    var peopleContainer = document.getElementById('people-container');
    var personRows = peopleContainer.getElementsByClassName('person-row');

    for (var i = 0; i < personRows.length; i++) {
        var personRow = personRows[i];
        var personName = personRow.querySelector('input[name^="person-name"]');
        var personSurname = personRow.querySelector('input[name^="person-surname"]');
        var personAge = personRow.querySelector('input[name^="person-age"]');

        var personIndex = i;
        fields['nom' + personIndex] = [personName.value];
        fields['prenom' + personIndex] = [personSurname.value];
        fields['age' + personIndex] = [personAge.value];

        forCsv.push([personName.value, personSurname.value,personAge.value,]);
    }



    var filled_pdf; // Uint8Array
    try {
        filled_pdf = pdfform().transform(buf, fields);
    } catch (e) {
        return on_error(e);
    }

    var blob = new Blob([filled_pdf], { type: 'application/pdf' });
    var url = URL.createObjectURL(blob);


    iframe =  document.createElement('iframe'); //load content in an iframe to print later
    document.body.appendChild(iframe);

    iframe.style.display = 'none';
    iframe.src = url;
    iframe.onload = function() {
        setTimeout(function() {
            iframe.focus();
            iframe.contentWindow.print();
        }, 1);
    };





    URL.revokeObjectURL(url);
    postRequest(forCsv);
}

document.addEventListener('DOMContentLoaded', function() {


    function addDeleteButton(parentElement) {
        var deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-person-btn";
        deleteButton.innerText = "Supprimer";

        deleteButton.addEventListener("click", function() {
            parentElement.remove();
            personCount--;
        });

        return deleteButton;
    }

    var personCount = 1; // Keep track of the number of people added

    document.getElementById("add-person-btn").addEventListener("click", function() {
        if (personCount < 100) { // Maximum of 16 people allowed
            personCount++; // Increment the person count

            var container = document.getElementById("people-container");
            var personRow = document.createElement("div");
            personRow.className = "person-row";

            var formRow = document.createElement("div");
            formRow.className = "form-row";

            var nameGroup = document.createElement("div");
            nameGroup.className = "form-group";

            var nameLabel = document.createElement("label");
            nameLabel.setAttribute("for", "person-name-" + personCount);
            nameLabel.innerHTML = "Nom:";

            var nameInput = document.createElement("input");
            nameInput.setAttribute("type", "text");
            nameInput.setAttribute("id", "person-name-" + personCount);
            nameInput.setAttribute("name", "person-name-" + personCount);
            nameInput.required = true;

            nameGroup.appendChild(nameLabel);
            nameGroup.appendChild(nameInput);

            var surnameGroup = document.createElement("div");
            surnameGroup.className = "form-group";

            var surnameLabel = document.createElement("label");
            surnameLabel.setAttribute("for", "person-surname-" + personCount);
            surnameLabel.innerHTML = "Prénom:";

            var surnameInput = document.createElement("input");
            surnameInput.setAttribute("type", "text");
            surnameInput.setAttribute("id", "person-surname-" + personCount);
            surnameInput.setAttribute("name", "person-surname-" + personCount);
            surnameInput.required = true;

            surnameGroup.appendChild(surnameLabel);
            surnameGroup.appendChild(surnameInput);

            var ageGroup = document.createElement("div");
            ageGroup.className = "form-group";

            var ageLabel = document.createElement("label");
            ageLabel.setAttribute("for", "person-age-" + personCount);
            ageLabel.innerHTML = "Âge:";

            var ageInput = document.createElement("input");
            ageInput.setAttribute("type", "number");
            ageInput.setAttribute("id", "person-age-" + personCount);
            ageInput.setAttribute("name", "person-age-" + personCount);
            ageInput.required = true;

            ageGroup.appendChild(ageLabel);
            ageGroup.appendChild(ageInput);

            formRow.appendChild(nameGroup);
            formRow.appendChild(surnameGroup);
            formRow.appendChild(ageGroup);

            var deleteButtonGroup = document.createElement("div");
            deleteButtonGroup.className = "form-group";

            var deleteButton = addDeleteButton(personRow);
            deleteButtonGroup.appendChild(deleteButton);

            formRow.appendChild(deleteButtonGroup);

            personRow.appendChild(formRow);
            container.appendChild(personRow);
        }
    });




    // Modify the file path and name as per your local PDF file
    var file = 'loc_saumur_form.pdf';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', file, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function() {
        if (this.status === 200) {
            on_file(file.split('/').pop(), this.response);
        } else {
            on_error('Failed to load the PDF file (code: ' + this.status + ')');
        }
    };

    xhr.send();
});



