'use strict';
/*
Hash：e6dabf19bf75acd47d9b4ee922957db4d05d542cf24bdf471d3426f62b207589
合约：n1ey8jUouBjuxkFpvbp7DR5Q8jkjFLPzkcJ
*/ 

// 定义信息类
var Info = function (text) {
    if (text) {
        var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
        this.title = obj.title; // 标题
        this.content = obj.content; // 内容
        this.author = obj.author; // 作者
        this.timestamp = obj.timestamp; // 时间戳
    } else {
        this.title = "";
        this.content = "";
        this.author = "";
        this.timestamp = 0;
    }
};
// 将信息类对象转成字符串
Info.prototype.toString = function () {
    return JSON.stringify(this)
};





// 定义智能合约
var InfoContract = function () {
// 使用内置的LocalContractStorage绑定一个map，名称为infoMap
// 这里不使用prototype是保证每布署一次该合约此处的infoMap都是独立的
//为`InfoContract`定义`infoMap`的属性集合，数据可以通过`infoMap`存储到链上
    LocalContractStorage.defineMapProperty(this, "infoMap", {
// 从infoMap中读取，反序列化
        parse: function (text) {
            return new Info(text);
        },
// 存入infoMap，序列化
        stringify: function (o) {
            return o.toString();
        }
    });
};






// 定义合约的原型对象
InfoContract.prototype = {
// init是星云链智能合约中必须定义的方法，只在布署时执行一次
    init : function () {},
// 提交信息到星云链保存，传入标题和内容
    save : function (title, content) {
        title = title.trim();
        content = content.trim();

        if (title === "" || content === "") {
            throw new Error("标题或内容为空！");
        }

        if (title.length > 64) {
            throw new Error("标题长度超过64个字符！");
        }

        if (content.length > 256) {
            throw new Error("内容长度超过256个字符！");
        }
        // 使用内置对象Blockchain获取提交内容的作者钱包地址
        var from = Blockchain.transaction.from;
        // 此处调用前面定义的反序列方法parse，从存储区中读取内容
        var existInfo = this.infoMap.get(title);
        if (existInfo) {
            throw new Error("您已经发布过内容！");
        }  

        // 将数据传入 信息类
        var info = new Info();
        info.title = title;
        info.content = content;
        info.timestamp = new Date().getTime();
        info.author = from;

        // 此处调用前面定义的序列化方法stringify，将Info对象存储到存储区
        this.infoMap.put(from, info);  //键:提交者钱包地址    值：数据
    },


    // 根据作者的钱包地址从存储区读取内容，返回Info对象
    read : function (author) {
        author = author.trim();
        if (author === "") {
            throw new Error("地址为空！");
        }
        // 验证地址
        if (!this.verifyAddress(author)) {
            throw new Error("输入的地址不存在！");
        }
        var existInfo = this.infoMap.get(author);
        return existInfo;
    },


    // 验证地址是否合法
    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    }
};

module.exports = InfoContract; // 导出代码，标示智能合约入口