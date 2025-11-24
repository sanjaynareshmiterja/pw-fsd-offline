const btn = document.getElementById('btn');
const dogImg = document.getElementById('dogImg');

function changeImage() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://dog.ceo/api/breeds/image/random");
    xhr.onload = () => {
        let url = JSON.parse(xhr.responseText).message;
        dogImg.src = url;
    };
    xhr.send();
}

changeImage();

btn.addEventListener('click', changeImage);