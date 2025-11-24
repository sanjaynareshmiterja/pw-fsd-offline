async function fetchData() {
    console.log("Before api call!");

    const postData = await fetch("https://jsonplaceholder.typicode.com/posts/1");       // 2 secs

    console.log("after post!");
    console.log(postData);

    const userData = await fetch("https://jsonplaceholder.typicode.com/users");         // 3 secs

    console.log("after both!");
    console.log(userData);
}

async function betterFetchData() {
    console.log("Before api call!");

    const response = await Promise.all([
        fetch("https://jsonplaceholder.typicode.com/posts/1"),
        fetch("https://jsonplaceholder.typicode.com/users")
    ]);

    console.log("after both api calls!");
    console.log(response);
}

async function test() {
    const response1 = fetch("https://jsonplaceholder.typicode.com/posts/1");
    const response2 = fetch("https://jsonplaceholder.typicode.com/users");

    const response = await Promise.all([response1, response2]);

    console.log("after both api calls!");
    console.log(response);
}

test();

// 1) validate the user     -> 2
// 2) validate the product  -> 4

// 3) check the inventory

// 4) place the order request

// 5) complete the payment

// 6) aknowledge the user of order success