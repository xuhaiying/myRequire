let path = require('path');
let fs = require('fs');
let vm = require('vm');
function Module(id){
    this.id = id;
    this.exports = {}
}

Module._extentions = [
    '.js',
    '.json',
    '.node'
];
Module._extentions[".js"] = function (module){
    let content = fs.readFileSync(module.id,'utf8');
    let fnStr = Module.wrap(content);
    vm.runInThisContext(fnStr).call(module.exports,module.exports,req,module,__dirname,__filename);
}
Module._extentions[".json"] = function (module){
    module.exports = JSON.parse(fs.readFileSync(module.id,'utf8'));
}
Module.wrapper = ["(function(exports,require,module,__dirname,__filename){","})"];
Module.wrap = function (content){
    return Module.wrapper[0] + content + Module.wrapper[1];
}
Module._cache = {};// 缓存
Module._resolvePathname = function (filename){
    // 文件可以没有后缀
    let absPath = path.resolve(__dirname,filename);
    // 文件是否有后缀，如果有直接返回绝对路径，如果没有依次从Module._extentions里取
    if (!path.extname(absPath)){ 
        for(let i=0;i<Module._extentions.length;i++){
            let newPath = absPath + Module._extentions[i];
            try {
                fs.accessSync(newPath);
                return newPath;
            } catch(e){}
        }
    } else {
        return absPath;
    }
    throw new Error('没有文件');
}
Module.prototype.load = function(filename){
    let ext = path.extname(filename);
    Module._extentions[ext](this);
}
function req (filename){
    // 1.得到绝对路径
    filename = Module._resolvePathname(filename);
    // 2. 先看这个路径在缓存中有没有，如果有直接返回
    let cacheModule = Module._cache[filename];
    if (cacheModule){
        return cacheModule.exports
    }
    // 3. 没有缓存 创建模块
    let module = new Module(filename);
    // 4. 加载当前文件的模块
    module.load(filename);
    Module._cache[filename] = module;//放到缓存中
    return module.exports;
}

let user = req('./user.json');
console.log(user);