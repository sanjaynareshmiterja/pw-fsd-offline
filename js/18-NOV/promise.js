function httpCall() {
    // promises are asyncronous in nature, but customisable
    return new Promise((resolve, reject) => {
        console.log("Promise started!");
        setTimeout(() => {
            return resolve("Promise successfull!");
        }, 3000);
        console.log("Promise ended!");
    });
}

console.log("Start!");

const p = httpCall();

p.then((msg) => {
    console.log(msg);
}).catch((msg) => {
    console.log("Promise is rejected! ", msg);
});

console.log("End!");