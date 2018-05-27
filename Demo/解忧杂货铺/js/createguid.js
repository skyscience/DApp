var CommonClass = function () {
    //合约地址
    this.GetAddress = "n21fW9UEaHyRgifeux6oFKQBYs4FJGt9Jbc";
    //网络  测试网络 主网
    this.GetNetName = "https://mainnet.nebulas.io";
}

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
//唯一标识符
function guid() {
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

//时间 yyyy-MM-dd HH:mm:ss
function GetNowDate() {
    return new Date().format("yyyy-MM-dd hh:mm:ss");
}

Date.prototype.format = function (format) {
    var args = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var i in args) {
        var n = args[i];
        if (new RegExp("(" + i + ")").test(format))
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? n : ("00" + n).substr(("" + n).length));
    }
    return format;
};

//截取url传参
function getRequest() {
    var url = window.location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        if (url.indexOf("&") != -1) {
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
            }
        }
        else {
            var arr = str.split("=");
            theRequest[arr[0]] = decodeURI(arr[1]);
        }
    }
    return theRequest;
}

//去除数组中重复值 
function getNoRepeat(s) {
    return s.sort().join(",,").replace(/(,|^)([^,]+)(,,\2)+(,|$)/g, "$1$2$4").replace(/,,+/g, ",").replace(/,$/, "").split(",");
} 

//分页
function pagination(pageNo, pageSize, array) {  
    var offset = (pageNo - 1) * pageSize;  
    return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);  
}  

//比较正序
var compare = function (prop) {
    return function (obj1, obj2) {
        var val1 = obj1[prop];
        var val2 = obj2[prop];if (val1 < val2) {
            return -1;
        } else if (val1 > val2) {
            return 1;
        } else {
            return 0;
        }            
    } 
}
//比较倒序
var compareDesc = function (prop) {
    return function (obj1, obj2) {
        var val1 = obj1[prop];
        var val2 = obj2[prop];
        if (val2 < val1) {
            return -1;
        } else if (val2 > val1) {
            return 1;
        } else {
            return 0;
        }            
    } 
}