const searchInput = document.getElementById('searchInput');

let timerVal;

searchInput.onkeyup = (key) => {
    clearTimeout(timerVal);
    
    if(searchInput.value.length == 0)
        return;

    console.log("Settimeout registered! ", searchInput.value);
    timerVal = setTimeout(() => {
        console.log("API Call : ", searchInput.value);
    }, 2000);
}