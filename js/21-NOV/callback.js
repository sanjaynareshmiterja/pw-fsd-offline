// setTimeout(() => {

// }, 1000);

// [1, 2, 3, 4].forEach((eachElem) => {

// });

// callback hell

// setTimeout(() => {
//     console.log("I am the first callback!");

//     setTimeout(() => {
//         console.log("I am the second callback!");

//         setTimeout(() => {
//             console.log("I am the third callback!");
//         }, 3000);

//     }, 2000);

// }, 1000);


// val1 -> (val1 + 1) -> (val1 + 2) -> (val1 + 3) -> console.log()

// place order

// new Promise((resolve, reject) => resolve(1))   // 1) fetches the users data
// .then(val => val + 1)               // 2) fetches the products data
// .then(val => val + 2)               // 3) inventory data
// .then(val => val + 3)               // 4) places the order & complete the payment
// .then(val => console.log(val))      // 5) intiate order success email/whatsapp/trigger
// .catch(e => console.log(e));


function steps() {
    let x = 1;

    const p = new Promise((resolve, reject) => resolve(x + 1));
    
    p.then((val) => {
        return new Promise((resolve, reject) => resolve(val + 2));
    }).then((fVal) => {
        console.log(fVal);
    }).catch(error => {
        console.log(error);
    });
}

async function betterSteps() {
    let x = 1;

    x = await Promise.reject(x + 1).catch(e => {
        console.log("First promise failed!");
        return 10;
    });
    console.log(x);
    x = await Promise.resolve(x);

    console.log(x);
}


Promise.resolve("not ok")
.then(msg => {
    console.log(msg);
    return msg;
})
.then(() => {
    console.log("second then function!");
})
.finally(() => {
    console.log("Inside the finally block!");
})
.catch(error => console.log(error));


// "1+2*3"