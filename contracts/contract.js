// JS contract 
Duktape.modSearch = function (id) {
    var name;
    var src;
    var found = false;
    name = './vm/duktape/js_lib' + id + '.js';
    src = load_js(name);
    if (typeof src === 'string') {
        print('loaded ECMAScript:', name);
        found = true;
    };
    if (!found) {
        throw new Error('module not found: ' + id);
    };
    return src;
}

require('index')

// regist user
function reguser(){
    console.log({Lib,Storage})
    var params = Lib.getParams()
    console.log(JSON.stringify(params))
    var table = "users"
    var key = params.account
    var value = JSON.stringify(params)
    Storage.set(table,key,value)
    return 0
}