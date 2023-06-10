var fields = {}

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

    var forCsv = []

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

        forCsv.push([personName, personSurname, personAge]);
    }



    var filled_pdf; // Uint8Array
    try {
        filled_pdf = pdfform().transform(buf, fields);
    } catch (e) {
        return on_error(e);
    }

    var blob = new Blob([filled_pdf], { type: 'application/pdf' });
    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.href = url;
    a.download = 'loc_saumur_form.pdf';
    a.click();

    URL.revokeObjectURL(url);

}

document.addEventListener('DOMContentLoaded', function() {

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



