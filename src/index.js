const defaults = { 
                    dbNamespace: "aerial"
                 };

const createDb = require('better-sqlite3')(`${defaults.dbNamespace}.db`), /* Makes the .db if non-existent */
      dot = import('dot-prop'),
      _ = require('lodash'),
      Keyv = require('keyv'),
      db = new Keyv(`sqlite://${defaults.dbNamespace}.db`);

      db.on('error', err => console.error('[aerialdb] error from db connection: ', err));

//db.set('jsonStore', {})
preCheck(true)

/* JSON pre-exisiting data check */
async function preCheck(forced){
    if(await db.get('jsonStore') === undefined) {
        if(forced) console.info('[aerialdb] cannot find global key within .db file, creating new... (might delete old records!!)'); await db.set("jsonStore", {})
        return true // since they don't have a db
    } else {
        return false 
    }
}

async function rewind(typ){
    console.error('[aerialdb] function not implemented')
    if(typ === 1) {
        // taking backup before (potentially destructive action )
    }
}

async function set(key, value){
    let n = await dot // weird JS bug lmao
    let previous = await db.get("jsonStore")
    let resp = n.setProperty(previous, key, value)

    await db.set("jsonStore", previous)
    return resp
}

async function get(key){
    let n = await dot // weird JS bug lmao
    let parse = await db.get("jsonStore")

    if(key === "") return parse 
    return n.getProperty(parse, key) /* this mutates!!! */
}

async function del(key){
    let n = await dot // weird JS bug lmao
    let previous = await db.get("jsonStore")
    let resp = n.deleteProperty(previous, key) /* this mutates!!! */

    await db.set("jsonStore", {})
    await db.set("jsonStore", previous)
    return resp
}

async function add(key, amnt){
    let n = await dot // weird JS bug lmao
    let parse = await db.get("jsonStore")
    let got = n.getProperty(parse, key) 
    let resp = undefined

    if(amnt < 0) throw new Error("[aerialdb] Given number is negative")
    if(typeof got != "number") throw new Error("[aerialdb] Given key is not a number (got " + typeof got + " instead)")
    
    got += amnt
    resp = n.setProperty(parse, key, got)
    await db.set(resp)
    return resp 
}

async function sub(key, amnt){
    let n = await dot // weird JS bug lmao
    let parse = await db.get("jsonStore")
    let got = n.getProperty(parse, key) 
    let resp = undefined

    // not sure if we should keep the negative check but eh
    if(amnt < 0) throw new Error("[aerialdb] Given number is negative")
    if(typeof got != "number") throw new Error("[aerialdb] Given key is not a number (got " + typeof got + " instead)")
    
    got -= amnt
    resp = n.setProperty(parse, key, got)
    await db.set("jsonStore", resp)
    return resp 
}

async function push(key, value){
    let n = await dot // weird JS bug lmao
    let previous = await db.get("jsonStore")
    let got = n.getProperty(previous, key) 
    let resp = undefined

    if(got instanceof Array != true) throw new Error("[aerialdb] Given key is not an array (got " + typeof got + " instead)")
    if(value instanceof Array === true) {
        value.forEach((item) => got.push(item));
    } else {
        got.push(value)
    }

    resp = n.setProperty(previous, key, got)
    await db.set("jsonStore", resp)
    return resp
}

async function pull(key, value){
    let n = await dot // weird JS bug lmao
    let previous = await db.get("jsonStore")
    let got = n.getProperty(previous, key) 
    let resp = undefined

    if(got instanceof Array != true) throw new Error("[aerialdb] Given key is not an array (got " + typeof got + " instead)")
    if(value instanceof Array === true) {
        value.forEach((item) => _.pull(got, item));
    } else {
        _.pull(got, value);
    }

    resp = n.setProperty(previous, key, got)
    await db.set("jsonStore", resp)
    return resp
}

/*
// code exclusively for testing

async function a() {
    //console.log(await get("users.a.items"))
    //console.log(await pull("users.a.items", [ 'meow', 'grass' ]))
    //await get("users")
    //await add("users.a.cookies", 100)
    //console.log(await db.get("jsonStore"))
    //console.log((await dot).setProperty())
}

a()
*/

module.exports = { set, get, del, add, sub, push, pull }