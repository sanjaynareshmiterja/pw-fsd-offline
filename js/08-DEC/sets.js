const nums = new Set();

nums.add(1);
nums.add(2);
nums.add(3);
nums.add(1);    // ignore

console.log(nums);


const tags = new Set(["javascript", "css", "js", "Javascript"]);

console.log(tags);

if(tags.has("javascript")) {
    console.log("It is a js article!");
}

tags.delete("css");

console.log(tags);

for(let tag of tags) {
    console.log(tag);
}

console.log(tags.values());

for(let tag of tags.values()) {
    console.log(tag);
}

console.log(tags.size);

// tags.clear();

console.log(tags.entries());