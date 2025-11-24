const dropdown = document.getElementById('dropdown');
const output = document.getElementById('output');
const statusText = document.getElementById('statusText');

function populateUsers() {
    statusText.textContent = "Loading Users...";

    const xhr = new XMLHttpRequest();
    xhr.open('GET', "https://jsonplaceholder.typicode.com/users");

    xhr.onload = () => {
        if(xhr.status >= 200 && xhr.status < 300) {
            // success
            try {
                let users = JSON.parse(xhr.responseText);
                dropdown.innerHTML = '<option value="">-- choose a user --</option>';
                
                // iterated all the users and populated them in the dropdown.
                users.forEach(user => {
                    const opt = document.createElement('option');
                    opt.textContent = user.name;
                    opt.value = user.id;
                    dropdown.appendChild(opt);
                });
                
                statusText.textContent = "users loaded.";
                output.textContent = "choose a user from the dropdown.";
            } catch(error) {
                statusText.textContent = "Invalid JSON from users";
                output.textContent = "Error: could not parse the user data";
            }
        } else {
            // failure
            statusText.textContent = `Failed to load users (status : ${xhr.status})`;
            output.textContent = `Error loading users: HTTP ${xhr.status}`;
        }
    }

    xhr.send();
}

dropdown.onchange = () => {
    const id = dropdown.value;
    if(!id) {
        output.textContent = "Select a user to see JSON response here!";
        return;
    }

    statusText.textContent = "Fetching the user details...";
    output.textContent = "";

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `https://jsonplaceholder.typicode.com/users/${id}`);

    xhr.onload = () => {
        if(xhr.status >= 200 && xhr.status < 300) {
            // success
            try {
                const obj = JSON.parse(xhr.responseText);
                output.textContent = JSON.stringify(obj);
                statusText.textContent = `Loaded user ${obj.id} - ${obj.name}`;
            } catch(error) {
                statusText.textContent = "Invalid JSON response";
                output.textContent = "Error: unable to parse the JSON response";
            }
        } else {
            // failure
            statusText.textContent = `Request failed (status ${xhr.status})`;
            output.textContent = `HTTP error: ${xhr.status}`;
            console.log(xhr.responseText);
        }
    }

    xhr.onerror = () => {
        statusText.textContent = "Network Error!";
        output.textContent = "Network error while fetching user details!";
    }

    xhr.ontimeout = () => {
        statusText.textContent = "Request Timed out";
        output.textContent = "Request timed out while fetching user details!";
    }

    xhr.send();
}

populateUsers();