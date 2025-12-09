const userSession = new Map();

let userObj = {
    userId: 123,
    userName: "govind"
}                           // xy1234

let tokenObj = {
    token: "abcd123",
    loginTime: Date.now()
}

userSession.set(userObj, tokenObj);

console.log(userSession);


const h1Tag = document.getElementById('h1Tags');

const componentState = new Map();

componentState.set(h1Tag, { disabled: true });

console.log(componentState);



// role -> id

// const roles = new Map();

// roles.set("admin", 1);
// roles.set("manager", 2);
// roles.set("user", 3);

// const roles = new Map([
//     ["admin", 1],
//     ["manager", 2],
//     ["user", 3]
// ]);

// console.log(roles);

// role -> []

// admin -> ["create", "update", "read", "delete"]

const rolePermissions = new Map([
    ["admin", ["create", "update", "read", "delete"]],
    ["viewer", ["read"]],
    ["owner", ["create", "update", "read", "delete"]],
    ["editor", ["update", "read"]]
]);

// for(const eachKeyValue of rolePermissions) {
//     console.log(eachKeyValue[0] + " : " + eachKeyValue[1]);
// }

for(const [role, permissions] of rolePermissions) {
    console.log(role + " -> " + permissions);
}

for(const role of rolePermissions.keys()) {
    console.log(role + " : " + rolePermissions.get(role));
}

console.log(rolePermissions.values());

console.log(rolePermissions.size);

rolePermissions.clear();

console.log(rolePermissions);