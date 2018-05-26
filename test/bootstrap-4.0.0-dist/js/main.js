
var LetterItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.title = obj.title;  //标题
        this.content = obj.content; //内容
        this.author = obj.author; //作者
    }
};
LetterItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};




//访问我们自己智能合约的存储空间
var TheLetter = function () {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function (text) {
            return new LetterItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};




//查询和储存
TheLetter.prototype ={
    init:function(){
    },

    save:function(title,content){  //储存
        if(!title || !content){
            throw new Error("没有标题或内容")
        }

        if(title.length > 20 || content.length > 500){
            throw new Error("标题或内容超出限制长度")
        }

        var from = Blockchain.transaction.from;
        var letterItem = this.data.get(title);
        if(letterItem){
            throw new Error("内容已被占用");
        }

        letterItem = new LetterItem();
        letterItem.author = from;
        letterItem.title = title;
        letterItem.content = content;

        this.data.put(title,letterItem);
    },

    get:function(title){  //查询
        if(!title){
            throw new Error("没有标题")
        }
        return this.data.get(title);
    }
}

module.exports = TheLetter;

/* 
交易哈希 : (点击产看交易详情)↓
737e99eef0e663ef30c436838b0bfeedde75019138367e69925ba82b8338bbe1
合约地址 :
n1pJv6t6maor5bFvSYYr17njY5PVva6P7Pd

*/