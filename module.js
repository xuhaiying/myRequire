let path = require('path');
let fs = require('fs');
let vm = require('vm');
function Module(id){
    this.id = id;
    this.exports = {}
}
Module._extentions = {
    '.js'(module){
        let content = fs.readFileSync(module.id,'utf8');
        let fnStr = Module.warpper[0] + content + Module.warpper[1];
        let fn = vm.runInThisContext(fnStr);
        fn.call(module.exports,module.exports,req,module,__dirname,__filename);
    },
    '.json'(module){
       module.exports = JSON.parse(fs.readFileSync(module.id,'utf8'));
    }
}
Module._cache = {};// 缓存
Module.warpper = ["(function(exports,require,module,dirname,filename){","\n})"]
Module._resolvePathname = function (filename){
    // 得到绝对路径
    let absPath = path.resolve(__dirname,filename);
    // 是否有扩展名
    let extname = path.extname(absPath);
    if (!extname){ // 没有扩展名尝试依次添加 .js .json
        let extKeys = Object.keys(Module._extentions);
        for (let i =0;i<extKeys.length;i++){
            try{
                let r = absPath+ extKeys[i]
                fs.accessSync(r);
                return r;
            } catch(e){}
        }
    } else {
        // 尝试是否可以读取文件
        try {
            fs.accessSync(absPath);
            return absPath;
        } catch (e){}
    }
    throw new Error('没有找到文件');
}
Module.prototype.load = function (filename){
    let ext = path.extname(filename);
    Module._extentions[ext](this);
}
function req(filename){
    // 1. 得到一个绝对路径
    filename = Module._resolvePathname(filename);
    console.log(filename);
    // 2. 是否有缓存
    let cacheModule = Module._cache[filename];
    if (cacheModule){
        return cacheModule.exports;
    }
    // 3. 创建模块
    let module = new Module(filename);
    // 4. 加载模块
    module.load(filename);
    Module._cache[filename] = module;//放到缓存中
    return module.exports;
}
let user = req('./user');// 依次查找.js .json node
console.log(user);