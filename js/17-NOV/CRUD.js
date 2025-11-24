const createBtn = document.getElementById("createBtn");
const userId = document.getElementById("userId");
const title = document.getElementById("title");
const desc = document.getElementById("desc");

createBtn.onclick = () => {

    const userIdVal = userId.value, titleVal = title.value, descVal = desc.value;

    if(!userIdVal || !titleVal || !descVal) {
        console.log("Invalid create request!");
        return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://jsonplaceholder.typicode.com/posts?username=${name}`);
    xhr.setRequestHeader("Content-Type", "application/json");

    const reqBody = {
        title: titleVal,
        body: descVal,
        userId: userIdVal
    }

    xhr.send("{}");
}