let may = require("./index.js")

async function a() {
    console.log(await may.get("a.a.a", "a")) //a.a.a.a
}

a()