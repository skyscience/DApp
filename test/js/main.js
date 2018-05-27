// 定义信息类
var LetterItem = function (text) {
    if (text) { 
        var obj = JSON.parse(text);// 如果传入的内容不为空将字符串解析成json对象
        this.title = obj.title; //商品名称
        this.content = obj.content; //商品介绍
        this.author = obj.author;  //卖家
        this.price = obj.price; //初始价格
        this.class = obj.class; //分类
        this.time = obj.time; //拍卖持续时间
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
// 提交信息到星云链保存，传入 标题  内容  分类  价格  时长
    save: function (title, content, s_class, price, time) {
        if (!title || !content) {
            throw new Error("标题或内容为空！")
        }

        if (title.length > 20 || content.length > 500) {
            throw new Error("标题或内容超出限制长度")
        }

        // 使用内置对象Blockchain获取提交内容的卖家钱包地址
        var from = Blockchain.transaction.from;
        // 此处调用前面定义的反序列方法parse，从存储区中读取内容
        var letterItem = this.data.get(title);
        if (letterItem) {
            throw new Error("您已经发布过此内容！");
        }

        letterItem = new LetterItem();
        letterItem.author = from;  //卖家钱包地址
        letterItem.title = title;  //商品名称
        letterItem.content = content;  //商品内容
        // letterItem.author = author;  //卖家
        letterItem.price = price;  //初始价格
        letterItem.s_class = s_class; //分类
        letterItem.time = time; //持续时间


        // 此处调用前面定义的序列化方法stringify，将letterItem对象存储到存储区
        this.data.put(title, letterItem);
    },


    // 根据作者的钱包地址从存储区读取内容，返回对象
    get: function (title) {
        if (!title) {
            throw new Error("没有标题")
        }
        return this.data.get(title);
    },
    // 根据作者的钱包地址从存储区读取商品分类，返回该分类下的所有内容
    get_class: function (get_class) {
        if (!title) {
            throw new Error("该分类没有商品")
        }
        return this.data.get(get_class);
    }
}

module.exports = TheLetter;// 导出代码，标示智能合约入口