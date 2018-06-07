"use strict";

var ProjectItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id; // use tx id as id
        this.creatorAddress = obj.creatorAddress;
        this.time = obj.time;
        this.description = obj.description; // 简介
        this.url = obj.url; // 项目官网url
        this.name = obj.name;
        this.admins = obj.admins; // 项目管理员地址列表
        this.balance = new BigNumber(obj.balance);
        this.eachIssueReward = new BigNumber(obj.eachIssueReward); // 每一个issue的奖励
        this.eachIssuePrice = new BigNumber(obj.eachIssuePrice);; // 每一个issue至少需要支付的代币
    } else {
        this.id = '';
        this.creatorAddress = '';
        this.time = 0;
        this.description = '';
        this.url = '';
        this.name = '';
        this.admins = [];
        this.balance = new BigNumber(0);
        this.eachIssueReward = new BigNumber(0); // reward不能低于price，并且用户发起工单的审核，奖励的2倍抵押在issue中
        this.eachIssuePrice = new BigNumber(0);
    }
};

ProjectItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

// issue的评论
var ReplyItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.issueId = obj.issueId;
        this.author = obj.author;
        this.content = obj.content;
        this.time = obj.time;
    } else {
        this.id = '';
        this.issueId = '';
        this.author = '';
        this.content = '';
        this.time = 0;
    }
};
ReplyItem.prototype.toString = function () {
    return JSON.stringify(this);
};

var defaultExpireSeconds = 10 * 24 * 3600; // 默认的超时时间（秒数）
var minRequiredAgreeVotes = 5; // 工单被投票通过最少需要的支持数量

var IssueItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id; // use tx id as id
        this.title = obj.title;
        this.creatorAddress = obj.creatorAddress;
        this.agreeCount = obj.agreeCount; // 点赞的数量
        this.disagreeCount = obj.disagreeCount; // 踩的数量
        this.agreedUsers = obj.agreedUsers; // 点赞的用户地址列表
        this.disagreedUsers = obj.disagreedUsers; // 踩的用户地址列表
        this.time = obj.time; // 创建时间戳，秒数
        this.expireTime = obj.expireTime; // 超时时间戳，秒数
        this.rejectTime = obj.rejectTime; // 被拒绝的时间
        this.reviewingTime = obj.reviewingTime; // 进入申诉状态的时间
        this.deleted = obj.deleted; // 是否已被删除
        this.projectId = obj.projectId;
        this.content = obj.content;
        this.replies = obj.replies;
        this.lastReplyUserAddress = obj.lastReplyUserAddress; // 最后一个回复的人的地址，默认是工单创建人地址
        this.state = obj.state; // 工单状态，'COMMON', 'REPLIED', 'SUCCESS', 'REJECT', 'REVIEWING', 'REVIEW_SUCCESS', 'REVIEW_FAIL', 'REJECT_DONE'
        this.price = new BigNumber(obj.price); // 工单发起人发起工单支付的代币
        this.balancePayed = obj.balancePayed; // 是否已经结算
    } else {
        this.id = '';
        this.title = '';
        this.creatorAddress = '';
        this.agreeCount = 0;
        this.disagreeCount = 0;
        this.agreedUsers = [];
        this.disagreedUsers = [];
        this.time = 0;
        this.expireTime = null;
        this.rejectTime = null;
        this.reviewingTime = null;
        this.deleted = false;
        this.projectId = '';
        this.content = '';
        this.replies = [];
        this.lastReplyUserAddress = '';
        this.state = 'COMMON';
        this.price = new BigNumber(0);
        this.balancePayed = false;
    }
};

IssueItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var ContractService = function () {
    LocalContractStorage.defineMapProperty(this, "config", {
        parse: function (text) {
            return JSON.parse(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // projectId => ProjectItem
    LocalContractStorage.defineMapProperty(this, "projectRepo", {
        parse: function (text) {
            return new ProjectItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // issueId => IssueItem
    LocalContractStorage.defineMapProperty(this, "issueRepo", {
        parse: function (text) {
            return new IssueItem(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // projectId => issueIds
    LocalContractStorage.defineMapProperty(this, "projectIssuesRepo", {
        parse: function (text) {
            return JSON.parse(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // userAddress => array of projectId
    LocalContractStorage.defineMapProperty(this, "userJoinedProjectsRepo", {
        parse: function (text) {
            return JSON.parse(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
    // userAddress => array of issueId
    LocalContractStorage.defineMapProperty(this, "userCreatedIssuesRepo", {
        parse: function (text) {
            return JSON.parse(text);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
};

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function isDigit(str) {
    return str.length === 1 && str.match(/\d/i);
}

var maxBoardCount = 1000;

ContractService.prototype = {
    init: function () {
        this.config.set("owner", Blockchain.transaction.from); // 合约所有者
        this.config.set('defaultExpireSeconds', defaultExpireSeconds); // 默认的issue超时时间
        this.config.set('minRequiredAgreeVotes', minRequiredAgreeVotes);
        this.config.set('projects', []); // 所有project的id列表
        // TODO: board
    },

    getOwner: function () {
        return this.config.get('owner');
    },
    getDefaultExpireSeconds: function () {
        return this.config.get('defaultExpireSeconds');
    },
    setDefaultExpireSeconds: function (value) {
        var from = Blockchain.transaction.from;
        if (from !== this.config.get('owner')) {
            throw new Error("only contract owner can change config");
        }
        value = parseInt(value);
        if (!value || value <= 10 * 60) {
            throw new Error("default expire seconds must be at least 10 minutes");
        }
        this.config.set('defaultExpireSeconds', value);
    },
    getMinRequiredAgreeVotes: function () {
        return this.config.get('minRequiredAgreeVotes');
    },
    setMinRequiredAgreeVotes: function (value) {
        var from = Blockchain.transaction.from;
        if (from !== this.config.get('owner')) {
            throw new Error("only contract owner can change config");
        }
        value = parseInt(value);
        if (!value || value < 2) {
            throw new Error("minRequiredAgreeVotes must be at least 2");
        }
        this.config.set('minRequiredAgreeVotes', value);
    },
    getProjectList: function () {
        var items = this.config.get('projects');
        var result = [];
        for (var i = 0; i < items.length; i++) {
            var item = this.projectRepo.get(items[i]);
            if (item) {
                item.issues = this.getProjectIssues(item.id);
                result.push(item);
            }
        }
        return result;
    },
    getProjectListUserJoined: function (address) {
        var itemIds = this.userJoinedProjectsRepo.get(address) || [];
        var result = [];
        for (var i = 0; i < itemIds.length; i++) {
            var item = this.projectRepo.get(itemIds[i]);
            if (item) {
                item.issues = this.getProjectIssues(item.id);
                result.push(item);
            }
        }
        return result;
    },
    getProjectIssues: function (projectId) {
        var itemIds = this.projectIssuesRepo.get(projectId) || [];
        var result = [];
        for (var i = 0; i < itemIds.length; i++) {
            var item = this.issueRepo.get(itemIds[i]);
            if (item) {
                result.push(item);
            }
        }
        result.sort(function(a, b) {
            return b.time - a.time;
        });
        return result;
    },
    getProjectListIssues: function (projectIds) {
        // 获取多个项目的issues
        var result = {};
        for (var j = 0; j < projectIds.length; j++) {
            var projectId = projectIds[j];
            var issueIds = this.projectIssuesRepo.get(projectId) || [];
            var projectIssues = [];
            for (var i = 0; i < issueIds.length; i++) {
                var issue = this.issueRepo.get(issueIds[i]);
                if (issue) {
                    projectIssues.push(issue);
                }
            }
            projectIssues.sort(function(a, b) {
                return b.time - a.time;
            });
            result[projectId] = projectIssues;
        }
        return result;
    },
    getIssuesCreatedByUser: function (address) {
        var itemIds = this.userCreatedIssuesRepo.get(address) || [];
        var result = [];
        for (var i = 0; i < itemIds.length; i++) {
            var item = this.issueRepo.get(itemIds[i]);
            if (item) {
                result.push(item);
            }
        }
        result.sort(function(a, b) {
            return b.time - a.time;
        });
        return result;
    },
    listIssues: function () {
        var items = this.config.get('projects');
        var result = [];
        for (var i = 0; i < items.length; i++) {
            var item = this.projectRepo.get(items[i]);
            if (item) {
                var issueIds = this.projectIssuesRepo.get(item.id) || [];
                for (var j = 0; j < issueIds.length; j++) {
                    var issue = this.issueRepo.get(issueIds[j]);
                    if (issue) {
                        result.push(issue);
                    }
                }
            }
        }
        result.sort(function(a, b) {
            return b.time - a.time;
        });
        return result;
    },
    // 创建新项目
    createProject: function (name, description, url, eachIssueReward, eachIssuePrice) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        if (!name) {
            throw new Error("project name can't be empty");
        }
        eachIssueReward = new BigNumber(eachIssueReward);
        eachIssuePrice = new BigNumber(eachIssuePrice);
        if (eachIssueReward < eachIssuePrice) {
            throw new Error("eachIssueReward can't be less than eachIssuePrice");
        }
        var project = new ProjectItem();
        project.id = id;
        project.creatorAddress = from;
        project.name = name;
        project.description = description;
        project.url = url;
        project.admins = [from];
        project.time = time;
        project.eachIssuePrice = eachIssuePrice;
        project.eachIssueReward = eachIssueReward;
        project.balance = new BigNumber(Blockchain.transaction.value);

        this.projectRepo.set(project.id, project);
        var projectIds = this.config.get('projects');
        projectIds.push(project.id);
        this.config.set('projects', projectIds);
        var userJoinedProjects = this.userJoinedProjectsRepo.get(from) || [];
        userJoinedProjects.push(project.id);
        this.userJoinedProjectsRepo.set(from, userJoinedProjects);
    },
    // 给项目充值
    addBalanceToProject: function (projectId) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        var project = this.projectRepo.get(projectId);
        if (!project) {
            throw new Error("Can't find this project");
        }
        project.balance = project.balance.plus(Blockchain.transaction.value);
        this.projectRepo.set(project.id, project);
    },
    // 给项目增加管理员
    addAdminToProject: function (projectId, newAdminAddress) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        var project = this.projectRepo.get(projectId);
        if (!project) {
            throw new Error("Can't find this project");
        }
        if (Blockchain.verifyAddress(newAdminAddress) !== 87) {
            throw new Error("address format error");
        }
        if (project.admins.indexOf(from) < 0) {
            throw new Error("you are not this project's admin");
        }
        if (project.admins.indexOf(newAdminAddress) >= 0) {
            throw new Error("this user was this project's admin before");
        }
        project.admins.push(newAdminAddress);
        project.balance = project.balance.plus(Blockchain.transaction.value);
        this.projectRepo.set(project.id, project);
    },
    // 给项目移除管理员
    removeAdminFromProject: function (projectId, adminAddress) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        var project = this.projectRepo.get(projectId);
        if (!project) {
            throw new Error("Can't find this project");
        }
        if (Blockchain.verifyAddress(adminAddress) !== 87) {
            throw new Error("address format error");
        }
        if (project.admins.indexOf(from) < 0) {
            throw new Error("you are not this project's admin");
        }
        var adminIdx = project.admins.indexOf(adminAddress);
        if (adminIdx < 0) {
            throw new Error("this user was not this project's admin before");
        }
        project.admins.splice(adminIdx, 1);
        project.balance = project.balance.plus(Blockchain.transaction.value);
        this.projectRepo.set(project.id, project);
    },
    // 创建工单
    createIssue: function (projectId, title, content) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        var project = this.projectRepo.get(projectId);
        if (!project) {
            throw new Error("Can't find this project");
        }
        if (!title || !content) {
            throw new Error("invalid arguments");
        }
        if (project.admins.indexOf(from) >= 0) {
            throw new Error("project's admin can't create issue");
        }
        var value = Blockchain.transaction.value;
        if (!value.eq(project.eachIssuePrice)) {
            throw new Error("invalid price payed to creat this project's issue, expect " + project.eachIssuePrice + " got " + value);
        }
        var issue = new IssueItem();
        issue.id = id;
        issue.time = time;
        issue.creatorAddress = from;
        issue.expireTime = time + this.config.get('defaultExpireSeconds');
        issue.title = title;
        issue.content = content;
        issue.projectId = project.id;
        issue.lastReplyUserAddress = from;
        issue.price = value;
        this.issueRepo.set(issue.id, issue);
        // 项目中扣除2倍奖励金
        var toMinusBalance = project.eachIssueReward.times(new BigNumber(2));
        if (project.balance.lt(toMinusBalance)) {
            throw new Error("this project has not enough balance to allow create issue");
        }
        project.balance = project.balance.minus(toMinusBalance);
        this.projectRepo.set(project.id, project);

        var projectIssues = this.projectIssuesRepo.get(project.id) || [];
        projectIssues.push(issue.id);
        this.projectIssuesRepo.set(project.id, projectIssues);
        var userCreatedIssues = this.userCreatedIssuesRepo.get(from) || [];
        userCreatedIssues.push(issue.id);
        this.userCreatedIssuesRepo.set(from, userCreatedIssues);
    },
    // 回复工单
    replyToIssue: function (issueId, content) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        var issue = this.issueRepo.get(issueId);
        if (!issue || issue.deleted) {
            throw new Error("Can't find this issue");
        }
        if (!content) {
            throw new Error("invalid arguments");
        }
        var reply = new ReplyItem();
        reply.id = id;
        reply.author = from;
        reply.content = content;
        reply.issueId = issue.id;
        reply.time = time;
        issue.replies.push(reply);
        this.issueRepo.set(issue.id, issue);
    },
    // 项目方标记工单为通过
    markIssueSuccess: function (issueId, replyContent) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        var issue = this.issueRepo.get(issueId);
        if (!issue || issue.deleted) {
            throw new Error("Can't find this issue");
        }
        if (issue.state !== 'COMMON') {
            throw new Error("invalid issue state to mark success");
        }
        if (replyContent) {
            // 同时回复
            var reply = new ReplyItem();
            reply.id = id;
            reply.author = from;
            reply.content = replyContent;
            reply.issueId = issue.id;
            reply.time = time;
            issue.replies.push(reply);
            this.issueRepo.set(issue.id, issue);
        }
        issue.state = 'SUCCESS';
        issue.balancePayed = true;
        this.issueRepo.set(issue.id, issue);
        // 项目创建人收到押金和奖励,项目方回收未使用的多余奖励金
        var project = this.projectRepo.get(issue.projectId);
        project.balance = project.balance.plus(project.eachIssueReward);
        this.projectRepo.set(project.id, project);
        if (!Blockchain.transfer(issue.creatorAddress, issue.price.plus(project.eachIssueReward))) {
            throw new Error("transfer to issue creator failed");
        }
    },
    // 项目方标记工单为拒绝
    markIssueReject: function (issueId, replyContent) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        var issue = this.issueRepo.get(issueId);
        if (!issue || issue.deleted) {
            throw new Error("Can't find this issue");
        }
        if (issue.state !== 'COMMON') {
            throw new Error("invalid issue state to mark reject");
        }
        if (replyContent) {
            // 同时回复
            var reply = new ReplyItem();
            reply.id = id;
            reply.author = from;
            reply.content = replyContent;
            reply.issueId = issue.id;
            reply.time = time;
            issue.replies.push(reply);
            this.issueRepo.set(issue.id, issue);
        }
        issue.rejectTime = time;
        issue.state = 'REJECT';
        this.issueRepo.set(issue.id, issue);
    },
    // issue发起人可以在被拒后的7天内发起申诉,否则项目方有权收回price+奖励押金
    changeIssueToReviewing: function (issueId) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        var issue = this.issueRepo.get(issueId);
        if (!issue || issue.deleted) {
            throw new Error("Can't find this issue");
        }
        if (issue.state !== 'REJECT') {
            throw new Error("invalid issue state to go to review state");
        }
        if (issue.creatorAddress !== from) {
            throw new Error("you are not author of this issue");
        }
        issue.state = 'REVIEWING';
        issue.reviewingTime = time;
        this.issueRepo.set(issue.id, issue);
    },
    login: function () {
        return Blockchain.transaction.from;
    },
    // 管理员从项目方的剩余金额中提现
    withdrawFromProject: function (projectId, amount) {
        // TODO
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        var project = this.projectRepo.get(projectId);
        if (!project) {
            throw new Error("Can't find this project");
        }
        if (project.admins.indexOf(from) < 0) {
            throw new Error("you have no permission to call this api");
        }
        if (project.balance.lte(new BigNumber(0))) {
            throw new Error("project balance empty to withdraw");
        }
        amount = new BigNumber(amount);
        if (amount.lte(new BigNumber(0)) || amount.gt(project.balance)) {
            throw new Error("withdraw amount exceed project's balance");
        }
        if (!Blockchain.transfer(from, amount)) {
            throw new Error("withdraw error");
        }
        project.balance = project.balance.minus(amount);
        this.projectRepo.set(project.id, project);
    },
    // 触发工单的状态变更，任何人都可以触发，具体状态合约里计算
    triggerIssueStateChange: function (issueId) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        var issue = this.issueRepo.get(issueId);
        if (!issue || issue.deleted) {
            throw new Error("Can't find this issue");
        }
        var project = this.projectRepo.get(issue.projectId);
        if (issue.state === 'COMMON') {
            // 如果超时未处理，当拒绝处理
            if (time >= issue.expireTime) {
                issue.state = 'REJECT';
                issue.rejectTime = time;
                this.issueRepo.set(issue.id, issue);
                return;
            }
        }
        else if (issue.state === 'REJECT') {
            // 被拒后不少于7天不进入申诉状态，项目方可以收回price+奖励资金
            if (time - issue.rejectTime >= (7 * 24 * 3600)) {
                issue.state = 'REJECT_DONE';
                issue.balancePayed = true;
                this.issueRepo.set(issue.id, issue);
                project.balance = project.balance.plus(project.eachIssueReward.times(new BigNumber(2)).plus(issue.price));
                this.projectRepo.set(project.id, project);
                return;
            }
        } else if (issue.state === 'REVIEWING') {
            // 如果审核时间达到7天且至少一个人反对，进入审核结算
            if (time - issue.reviewingTime >= (7 * 24 * 3600)) {
                if (issue.agreeCount > issue.disagreeCount && issue.agreeCount >= this.config.get('minRequiredAgreeVotes')) {
                    // 申诉通过
                    issue.state = 'REVIEW_SUCCESS';
                    issue.balancePayed = true;
                    this.issueRepo.set(issue.id, issue);
                    var totalToTransferToAll = issue.price.times(new BigNumber(issue.agreeCount + issue.disagreeCount)).plus(project.eachIssueReward.times(new BigNumber(0.5))); // 用来分红的金额
                    var valueToIssueCreator = issue.price.plus(project.eachIssueReward.times(new BigNumber(1.5)));

                    var eachMemberReward = totalToTransferToAll.idiv(1 + issue.agreeCount);
                    valueToIssueCreator = valueToIssueCreator.plus(eachMemberReward);
                    if (!Blockchain.transfer(issue.creatorAddress, valueToIssueCreator)) {
                        throw new Error("transfer to issue creator failed");
                    }
                    for (var i = 0; i < issue.agreedUsers.length; i++) {
                        if (!Blockchain.transfer(issue.agreedUsers[i], eachMemberReward)) {
                            throw new Error("transfer to issue supporter failed");
                        }
                    }
                    return;
                } else if (issue.disagreeCount > 0) {
                    // 申诉失败
                    issue.state = 'REVIEW_FAIL';
                    issue.balancePayed = true;
                    this.issueRepo.set(issue.id, issue);
                    // 项目方拿回奖励
                    project.balance = project.balance.plus(project.eachIssueReward.times(new BigNumber(2)));
                    this.projectRepo.set(project.id, project);
                    // 反对者平分押金
                    var totalToTransferToAll = issue.price.times(new BigNumber(issue.agreeCount + issue.disagreeCount)); // 用来分红的金额
                    var eachMemberReward = totalToTransferToAll.idiv(issue.disagreeCount);
                    for (var i = 0; i < issue.disagreedUsers.length; i++) {
                        if (!Blockchain.transfer(issue.disagreedUsers[i], eachMemberReward)) {
                            throw new Error("transfer to issue disagreed user failed");
                        }
                    }
                    return;
                }
            }
        }
    },
    // 工单发起人主动关闭工单，只有COMMON状态的工单可以关闭
    closeIssue: function (issueId) {
        var from = Blockchain.transaction.from;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        var issue = this.issueRepo.get(issueId);
        if (!issue || issue.deleted) {
            throw new Error("Can't find this issue");
        }
        if (issue.creatorAddress !== from) {
            throw new Error("you have no permission to close this issue");
        }
        if (issue.state !== 'COMMON') {
            throw new Error("only new issue can be deleted");
        }
        issue.deleted = true;
        issue.balancePayed = true;
        this.issueRepo.set(issue.id, issue);
        // 退押金给用户和项目方
        var project = this.projectRepo.get(issue.projectId);
        project.balance = project.balance.plus(project.eachIssueReward.times(new BigNumber(2)));
        this.projectRepo.set(project.id, project);
        if (!Blockchain.transfer(issue.creatorAddress, issue.price)) {
            throw new Error("transfer to issue creator failed");
        }
    },
    // 用户对审核状态中的issue可以通过抵押代币投票支持/反对
    voteIssue: function (issueId, agree) {
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        var time = Blockchain.block.timestamp;
        var id = Blockchain.transaction.hash;
        var issue = this.issueRepo.get(issueId);
        if (!issue || issue.deleted) {
            throw new Error("Can't find this issue");
        }
        if (issue.state !== 'REVIEWING') {
            throw new Error("issue state invalid to vote");
        }
        if (issue.agreedUsers.indexOf(from) >= 0 || issue.disagreedUsers.indexOf(from) >= 0) {
            throw new Error("you have voted to this issue before");
        }
        if (!value.eq(issue.price)) {
            throw new Error("you must send same value with issue creator");
        }
        if (agree) {
            // 支持
            issue.agreedUsers.push(from);
            issue.agreeCount += 1;
            this.issueRepo.set(issue.id, issue);
        } else {
            // 反对
            issue.disagreedUsers.push(from);
            issue.disagreeCount += 1;
            this.issueRepo.set(issue.id, issue);
        }
    },
    getProjectById: function (id) {
        var item = this.projectRepo.get(id);
        if(item) {
            item.issues = this.getProjectIssues(item.id);
        }
        return item;
    },
    getIssueById: function (id) {
        return this.issueRepo.get(id);
    }
};
module.exports = ContractService;
