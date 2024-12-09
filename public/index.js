function createTableBody() {
    // Create tbody element
    const tbody = document.createElement('tbody');
    
    // Set the ID attribute
    tbody.id = 'table-body';
    
    return tbody;
}

function createTableRow(rowNumber, pattern, conf){
    const row = document.createElement('tr');

    // Create the row number header cell
    const rowNumberTh = document.createElement('th');
    rowNumberTh.setAttribute('scope', 'row');
    rowNumberTh.textContent = rowNumber;
    row.appendChild(rowNumberTh);

    // Create data cells
    
    const confidence = conf+"%";
    const keterangan = `Ketika Pelanggan Membeli ${pattern[0]}, terdapat ${confidence} kemungkinan akan membeli ${pattern[1]}`;
    const pola = pattern.join(" , ");
    
    const cells = [pola, confidence, keterangan];
    cells.forEach(cellText => {
        const td = document.createElement('td');
        td.textContent = cellText;
        row.appendChild(td);
    });

    return row;
}

function responseHandler(data){
    const tableBody = createTableBody();
    for (let index = 0; index < data.length; index++) {
        let row = createTableRow(index + 1, data[index].pattern, data[index].confidence);
        tableBody.appendChild(row);
    }
    document.getElementById('table-result').appendChild(tableBody);
    document.getElementById('result-container').style.display = 'block';
    document.getElementById('loading-spinner').style.display = 'none';
}

const submitButton = document.getElementById('submit-button');

submitButton.addEventListener('click', (event)=>{
    event.preventDefault();
    document.getElementById('result-container').style.display = 'none';
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'block';
    }
    const tableBody = document.getElementById('table-body');
    if(tableBody){
        tableBody.remove();
    }

    const minSupport = document.getElementById('min-support').value;
    const files = document.querySelector('[name=dataset]').files;
    const formData = new FormData()
    formData.append('dataset', files[0]);
    formData.append('minSupport', minSupport);

    const url = "http://localhost:" + window.location.port + "/mine-data";

    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    xhr.onload = () => {
        responseHandler(xhr.response);
    }

    xhr.open('POST', url);
    xhr.send(formData);
});