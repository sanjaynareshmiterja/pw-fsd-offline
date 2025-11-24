fetch("https://api.adviceslip.com/advice")
.then((res) => {
    console.log("Api called successfully!");
    return res.json();
}).then((data) => {
    console.log("Second then method!");
    console.log(data);
}).catch((error) => {
    console.log("Something went wrong!");
    console.log(error);
});