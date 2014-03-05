##A converter between CommonJS/AMD/CMD/other

The javascript lexer bases on jssc: https://github.com/army8735/jssc

为满足所写的代码能同时运行于server环境和web环境，而不需手动修改，所以做了个转换方法，使得几者之间的模块能够互相等价转化。
原理即CommonJS模块头尾加上define，反之去掉。如果是转为AMD，还会提取依赖并解析为factory的形参。
需要注意的是AMD模块的写法应遵守文件和模块一对一的原则。AMD和CMD之间的转化同理。
普通代码转换较为困难，研究中。

##INSTALL

npm install ranma

##test

mocha

##API

ranma.cjsify(code:String):String
将代码转换为CommonJS

ranma.amdify(code:String):String
将代码转换为AMD

ranma.cmdify(code:String):String
将代码转换为CMD

ranma.TYPE.cache():Object
调用type后词法单元缓存，tokens为全部，tokensNoIgnore为忽略ignore的类型

ranma.TYPE.type(code:String):int
返回代码类型，取值有以下几种

ranma.TYPE.UNKNOW = 0
普通写法，不属于以下类型
ranma.TYPE.COMMONJS = 1
CommonJS标准写法
ranma.TYPE.AMD = 2
AMD写法
ranma.TYPE.CMD = 3
CMD写法

## License

[MIT License]