var LetterItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.title = obj.title;
        this.content = obj.content;
        this.author = obj.author;
    }
};

LetterItem.prototype = {
    toString : function(){
        return JSON.stringify(this)
    }
};

var TheLetter = function(){
    LocalContractStorage.defineMapProperty(this,'data',{
        parse: function(text){
            return new LetterItem(text);
        },
        stringify: function(o){
            return o.toString();
        }
    });
};