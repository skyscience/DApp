'use strict';
// 定义信息类
var LetterItem = function (text) {
    if (text) { 
        var obj = JSON.parse(text);// 如果传入的内容不为空将字符串解析成json对象
        this.title = obj.title; //标题
        this.content = obj.content; //介绍
        this.author = obj.author;  //作者
    }
};
// 将信息类对象转成字符串
LetterItem.prototype = {
    toString: function () {
        return JSON.stringify(this)
    }
};






//根据官方的API来创建存储空间
var TheLetter = function () {
    // 使用内置的LocalContractStorage绑定一个map，名称为data
    // 这里不使用prototype是保证每布署一次该合约此处的data都是独立的
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {  // 从data中读取，反序列化
            return new LetterItem(text);
        },
        stringify: function (o) {  // 存入data，序列化
            return o.toString();
        }
    });
};






// 定义合约的原型对象
TheLetter.prototype = {
        // init是星云链智能合约中必须定义的方法，只在布署时执行一次
    init: function () {
    },
// 提交信息到星云链保存，传入标题和内容
    save: function (title, content) {
        if (!title || !content) {
            throw new Error("标题或内容为空！")
        }

        if (title.length > 20 || content.length > 500) {
            throw new Error("标题或内容超出限制长度")
        }

        // 使用内置对象Blockchain获取提交内容的作者钱包地址
        var from = Blockchain.transaction.from;
        // 此处调用前面定义的反序列方法parse，从存储区中读取内容
        var letterItem = this.data.get(title);
        if (letterItem) {
            throw new Error("您已经发布过此内容！");
        }

        letterItem = new LetterItem();
        letterItem.author = from;
        letterItem.title = title;
        letterItem.content = content;
        // 此处调用前面定义的序列化方法stringify，将letterItem对象存储到存储区
        this.data.put(title, letterItem);
    },
    // 根据作者的钱包地址从存储区读取内容，返回Info对象
    get: function (title) {
        if (!title) {
            throw new Error("没有标题")
        }
        return this.data.get(title);
    }
}

module.exports = TheLetter;// 导出代码，标示智能合约入口