$(function(){

// global access to the guess input DOM object
const GuessInput = document.getElementById('guess')

function getRandomInt(min, max) {
    //The maximum is exclusive and the minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    
    return Math.floor(Math.random() * (max - min)) + min; 
}

/* 
ProblemType is an object that encapsulates a type of problem
genFunc specifies how to generate the operands of the problem
ansFunc how to get the answer from the operands
numProbs is the total number of possible problems
numSolved in the total number of problems of that type that have been solved
timeSolved is the total amount of time spent to solve all problem of that type
Q is a Priority Queue that ranks solved problems by how long it took to solve, 
    from longest to shortest time
S is a Set that keeps track of what is in Q
*/
function ProblemType(str, func1, func2, func3){
    this.opSymbol = str || "";
    this.genFunc = func1 || undefined;
    this.ansFunc = func2 || undefined;
    this.calcNumProbs = func3 || undefined;
}

/*
ProblemTracker essentially wraps ProblemType
    and adds properties that tracks progress in each Game
ProblemType is also static,
    whereas ProblemTracker allows you to customize the ProblemType
    by changing the minNum and maxNum, for example
*/
function ProblemTracker(type,minNum,maxNum){
    this.type = type || undefined;
    this.numProbs = this.type.calcNumProbs(minNum,maxNum);
    this.numSolved=0;
    this.timeSolved=0;
    this.Q = new PriorityQueue();
    this.S = new Set();
}
ProblemTracker.prototype.push = function(dt,num1,num2){
    this.Q.push([dt,num1,num2]);
    this.S.add([num1,num2].join(","));
    this.numSolved++;
    this.timeSolved+=dt;
}
ProblemTracker.prototype.avgTime = function(){
    return this.timeSolved/this.numSolved;
};
ProblemTracker.prototype.fractionSaved = function(){
    return this.Q.size()/this.numProbs;
};
ProblemTracker.prototype.next = function(minNum,maxNum){
    let rand = Math.random();
    let dt,num1,num2;
    if(this.Q.isEmpty() || rand>this.fractionSaved()){
        [num1,num2]= this.type.genFunc(minNum,maxNum);
        if(this.S.has([num1,num2].join(","))){
            console.log("from Q");
            [dt,num1,num2] = this.Q.pop();
            this.S.delete([num1,num2].join(","));
            // [num1,num2]=this.type.genFunc(minNum,maxNum);
        }
    }else{
        console.log(this.fractionSaved());
        [dt,num1,num2] = this.Q.pop();
        this.S.delete([num1,num2].join(","));
    }
    return [num1,num2];
};

/*
ProblemMapper maps a checkbox in the interface to a ProblemType
The key should be the value of the checkbox input
The value is a new ProblemType Object
To add a new problem, simply add another ProblemType to ProblemMapper
*/
const ProblemMapper = new Map();
ProblemMapper.set("add",new ProblemType(
    String.fromCharCode(43),
    function(minNum,maxNum){
        let i=getRandomInt(minNum,maxNum);
        let j=getRandomInt(minNum,maxNum);
        return [Math.max(i,j),Math.min(i,j)];
    },
    function(a,b){return a+b;},
    function(minNum,maxNum){
        return (maxNum-minNum+1)**2;
    }
));
ProblemMapper.set("sub",new ProblemType(
    String.fromCharCode(45),
    function(minNum,maxNum){
        let i=getRandomInt(minNum,maxNum+1);
        let j=getRandomInt(minNum,maxNum+1);
        while(i==j){
            i=getRandomInt(minNum,maxNum+1);
            j=getRandomInt(minNum,maxNum+1);
        }
        return [Math.max(i,j),Math.min(i,j)];
    },
    function(a,b){return Math.max(a,b)-Math.min(a,b);},
    function(minNum,maxNum){
        return (maxNum-minNum+1)**2-(maxNum-minNum+1);
    }
));
ProblemMapper.set("mul",new ProblemType(
    String.fromCharCode(215),
    function(minNum,maxNum){
        let i=getRandomInt(Math.max(2,minNum),maxNum+1);
        let j=getRandomInt(Math.max(2,minNum),maxNum+1);
        return [Math.max(i,j),Math.min(i,j)];
    },
    function(a,b){return a*b;},
    function(minNum,maxNum){
        return (maxNum-Math.max(2,minNum)+1)**2
    }
));
ProblemMapper.set("div",new ProblemType(
    String.fromCharCode(247),
    function(minNum,maxNum){
        let i=getRandomInt(Math.max(2,minNum),Math.floor(maxNum/2)+1);
        let j=getRandomInt(2,Math.floor(maxNum/i)+1);
        return [i*j,i];
    },
    function(a,b){return Math.max(a,b)/Math.min(a,b);},
    function(minNum,maxNum){
        let total=0;
        for(let i=Math.max(2,minNum); i<=Math.floor(maxNum/2); i++){
            for(let j=i; j<=Math.floor(maxNum/i); j++){
                total++;
            }
        }
        return total;
    }
));

/*
Interface is a singleton which manages changes to DOM
*/
const Interface = {
    showSetup : function(Game){
        // hide game
        $("#stop-button").off("click");
        $("#guess").off("input");
        $("#game-panels").hide();
        // show setup
        $("#setup-panels").show();
        $("#start-button").click(Game.start.bind(Game));
    },
    showGame : function(Game){
        // hide setup
        $("#start-button").off("click");
        $("#setup-panels").hide();
        // show game
        $("#game-panels").show();
        $("#stop-button").click(Game.stop.bind(Game));
        $("#guess").on("input",Game.checkAnswer.bind(Game));
        $("#guess").on("select input focus", function(){
            $(document).scrollTop(0);
        })
        $(document).scrollTop(0);
    },
    updateProblem : function(opSymbol,num1,num2){
        $("#top-line").text(num1.toString());
        $("#bottom-line").text(opSymbol+' '+num2);
        GuessInput.value='';
        GuessInput.select();
    },
    updateStats : function(problemArray){
        let TotalCount=0;
        let TotalTime=0;
        for(problem of problemArray){
            TotalCount+=problem.numSolved;
            TotalTime+=problem.timeSolved;
        }
        $("#avg-time").text((TotalTime/TotalCount/1000).toString()+" s");
        $("#total-ans").text(TotalCount);
    }
};

/*
Game is a singleton which manages game variables and interactions with Interface
*/
const Game = {
    minNum : 0,
    maxNum : 0,
    problemArray : [],
    // current problem
    problem : undefined, // ProblemTracker object
    num1 : 0, // larger
    num2 : 0, // smaller
    t1 : 0,
    t2 : 0,
    ans : 0,
    start : function(){
        // grab Game variables
        this.reset();
        
        for(let check of $("input:checked")){
            this.problemArray.push(
                new ProblemTracker(
                    ProblemMapper.get(check.value),
                    this.minNum, this.maxNum
                )
            );
        }
        // if nothing selected default to all
        if(this.problemArray.length==0){
            for(let [name,type] of ProblemMapper.entries()){
                this.problemArray.push(
                    new ProblemTracker(type,this.minNum, this.maxNum)
                );
            }
        }
        // setup interface
        Interface.showGame(this);
        // generate first problem
        this.nextProblem();
    },
    stop : function(){
        Interface.showSetup(this);
    },
    nextProblem : function(){
        // randomly choose from problemArray
        let i = getRandomInt(0,this.problemArray.length);
        this.problem = this.problemArray[i];
        [this.num1,this.num2] = this.problem.next(this.minNum,this.maxNum);
        this.ans = this.problem.type.ansFunc(this.num1,this.num2);
        Interface.updateProblem(this.problem.type.opSymbol,this.num1,this.num2);
        this.t1=performance.now();
    },
    checkAnswer : function(){
        if(GuessInput.value==this.ans){
            this.t2=performance.now();
            this.problem.push(
                Math.min(this.t2-this.t1,
                    this.problem.Q.isEmpty() ? Infinity : this.problem.Q.peek()[0]-1
                ),
                this.num1,this.num2
            );
            Interface.updateStats(this.problemArray);
            this.nextProblem();
        }else if(GuessInput.value.length>this.ans.toString().length){
            $('#guess').effect('shake',{distance: 10},'fast');
            GuessInput.value='';
        }
    },
    reset : function(){
        this.minNum = Number($("#min-num").val());
        this.maxNum = Number($("#max-num").val());
        this.problemArray = [];
    }
};

// initialize interface
Interface.showSetup(Game);
});

/*
// global variables
let Num1, Num2, Ans;
let op_symbol, opList=[], op;
let DoAdd, DoSub, DoMul, DoDiv;
let AddCount, SubCount, MultCount, DivCount, TotalCount;
let AddAvg, SubAvg, MultAvg, DivAvg, TotalAvg;
let t1, t2;
let MaxNum;

let AddMatrix, SubMatrix, MultMatrix, DivMatrix;

// Reinforcement Learning 
let score;
let lr = 1;

const AddQ = new PriorityQueue();
const SubQ = new PriorityQueue();
const MulQ = new PriorityQueue();
const DivQ = new PriorityQueue();

// guess input object
const GuessInput = document.getElementById('guess')



function GetFromQ(Q){
    let Num1_old=-1;
    let Num2_old=-1;
    if((typeof Num1) !== 'undefined'){
        Num1_old=Num1;
    }
    if((typeof Num2) !== 'undefined'){
        Num2_old=Num2;
    }
    [score,Num1,Num2] = Q.pop();
    if(Num1==Num1_old && Num2==Num2_old && !Q.isEmpty()){
        [score,Num1,Num2] = Q.pop();
        Q.push([Math.floor(t2-t1),Num1_old,Num2_old]);
    }
}

function GenerateNumbers(){
    let DoRand = Math.random();
    let thresh = 0;
    op = opList[getRandomInt(0,opList.length)];
    let store;
    let Num1_old=Num1;
    let Num2_old=Num2;
    switch(op){
        case 0:
            op_symbol = String.fromCharCode(43);
            if(DoRand<thresh||AddQ.isEmpty()){
                Num1=getRandomInt(1,MaxNum);
                Num2=getRandomInt(1,MaxNum);
            }else{
                GetFromQ(AddQ);
            }
            Ans=Num1+Num2;
            break;
        case 1:
            op_symbol = String.fromCharCode(45);
            if(DoRand<thresh||SubQ.isEmpty()){
                Num1=getRandomInt(2,MaxNum);
                Num2=getRandomInt(1,Num1-1);
            }else{
                GetFromQ(SubQ);
            }
            Ans=Num1-Num2;
            break;
        case 2:
            op_symbol = String.fromCharCode(215);
            if(DoRand<thresh||MulQ.isEmpty()){
                Num1=getRandomInt(2,MaxNum);
                Num2=getRandomInt(2,MaxNum);
            }else{
                GetFromQ(MulQ);
            }
            Ans=Num1*Num2;
            break;
        case 3:
            op_symbol = String.fromCharCode(247);
            if(DoRand<thresh||DivQ.isEmpty()){
                Ans=getRandomInt(2,Math.floor(MaxNum/2));
                Num2=getRandomInt(2,Math.floor(MaxNum/Ans));
                Num1=Ans*Num2;
            }else{
                GetFromQ(DivQ);
                Ans = Num1/Num2;
            }
            break;
    }
    [Num1,Num2] = [Math.max(Num1,Num2),Math.min(Num1,Num2)]
    $("#top-line").text(Num1.toString());
    $("#bottom-line").text(op_symbol+' '+Num2);
    GuessInput.value='';
    GuessInput.select();
    t1=performance.now();
}

function InitQueues(){
    AddQ.clear();
    SubQ.clear();
    MulQ.clear();
    DivQ.clear();
    
    for(let i=1; i<=MaxNum; i++){
        for(let j=i; j<=MaxNum; j++){
            AddQ.push([getRandomInt(10000,100000),j,i]);
        }
    }
    for(let i=1; i<=MaxNum; i++){
        for(let j=i+1; j<=MaxNum; j++){
            SubQ.push([getRandomInt(10000,100000),j,i]);
        }
    }
    for(let i=2; i<=MaxNum; i++){
        for(let j=i; j<=MaxNum; j++){
            MulQ.push([getRandomInt(10000,100000),j,i]);
        }
    }
    for(let i=2; i<=Math.floor(MaxNum/2); i++){
        for(let j=i; j<=Math.floor(MaxNum/i); j++){
            DivQ.push([getRandomInt(10000,100000),i*j,j]);
        }
    }
}

function StartGame(){
    DoAdd = $("#add-check").is(':checked');
    DoSub = $("#sub-check").is(':checked');
    DoMul = $("#mul-check").is(':checked');
    DoDiv = $("#div-check").is(':checked');

    // initialize values
    MaxNum = $("#max-num").val();
    TotalAvg=0;
    TotalCount=0;
    opList.length=0;
    if(DoAdd) opList.push(0);
    if(DoSub) opList.push(1);
    if(DoMul) opList.push(2);
    if(DoDiv) opList.push(3);
    // default to all if none selected
    if(opList.length==0){
        opList.push(0,1,2,3);
    }

    InitQueues();

    // switch from setup panel to game panel
    $("#setup-panels").hide();
    $("#game-panels").show();
    $("#start-button").off("click");
    $("#stop-button").click(StopGame);
    $("#guess").on("input",CheckAnswer);

    $("#avg-time").text(TotalAvg.toString());
    $("#total-ans").text(TotalCount);
    $(document).scrollTop(0);
    $("#guess").on("select input focus", function(){
        $(document).scrollTop(0);
    })
    GenerateNumbers();
}

function StopGame(){
    $("#game-panels").hide();
    $("#setup-panels").show();
    $("#stop-button").off("click");
    $("#guess").off("input");
    $("#start-button").click(StartGame);
}

function CheckAnswer(){
    if(GuessInput.value==Ans){
        t2=performance.now();
        if(t2-t1>1000){
            switch(op){
                case 0:
                    AddQ.push([Math.floor(t2-t1),Num1,Num2]);
                    break;
                case 1:
                    SubQ.push([Math.floor(t2-t1),Num1,Num2]);
                    break;
                case 2:
                    MulQ.push([Math.floor(t2-t1),Num1,Num2]);
                    break;
                case 3:
                    DivQ.push([Math.floor(t2-t1),Num1,Num2]);
                    break;
            }
        }
        //console.log(t2-t1);
        TotalAvg = (TotalAvg*TotalCount+t2-t1)/(TotalCount+1);
        TotalCount+=1;
        $("#avg-time").text(Math.floor(TotalAvg*100)/100+' ms');
        $("#total-ans").text(TotalCount);
        GenerateNumbers();
    }else if(GuessInput.value.length>Ans.toString().length){
        $('#guess').effect('shake',{distance: 10},'fast');
        GuessInput.value='';
    }
}
*/