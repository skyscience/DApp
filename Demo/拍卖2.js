contract Auction{
    event newBid();
    address owner;
    address public leader;
    address public winner;
    string public item;
    uint public leadingBid;
 
    function Auction(string name, uint price) public {
        owner = msg.sender;
        item = name;
        leadingBid = price;
    }
    function placeBid() payable public{
        if (msg.value > leadingBid) {
            returnPrevBid();
            leader = msg.sender;
            leadingBid = msg.value;
            newBid();
        }
    }
    function returnPrevBid() private{
        if (leader != 0) {
            leader.transfer(leadingBid);
        }
    }
    function endAuction() public {
       if (msg.sender == owner) {
           winner = leader;
           owner.transfer(leadingBid);
       }
   }
}

/*
流程：

拍卖猫 10以太币

A 创建拍卖智能合约（cat ，10）

B竞价20（B转账到合约20）

C竞价40（C转账到合约40，并且返还B 20）

A结束拍卖 （合约转账40到A）
*/ 