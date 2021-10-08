const elems = require("./helpers/test.json")
const parser = require("node-html-parser")

let newElems = elems.elems.map(x => x.trim())


for(let i = 0; i < newElems.length; i++) {
    let parsed = parser.parse(newElems[i])
    console.log(parsed.toString())
}
