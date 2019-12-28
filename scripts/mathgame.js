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

function getRandomInt(min, max) {
    //The maximum is exclusive and the minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
}

function GenerateRandomNumbers(){
    op = opList[getRandomInt(0,opList.length)];

    switch(op){
        case 0:
            op_symbol = String.fromCharCode(43);
            Num1=getRandomInt(1,MaxNum);
            Num2=getRandomInt(1,MaxNum);
            Ans=Num1+Num2;
            break;
        case 1:
            op_symbol = String.fromCharCode(45);
            Num1=getRandomInt(2,MaxNum);
            Num2=getRandomInt(1,Num1-1);
            Ans=Num1-Num2;
            break;
        case 2:
            op_symbol = String.fromCharCode(215);
            Num1=getRandomInt(2,MaxNum);
            Num2=getRandomInt(2,MaxNum);
            Ans=Num1*Num2;
            break;
        case 3:
            op_symbol = String.fromCharCode(247);
            Ans=getRandomInt(2,Math.floor(MaxNum/2));
            Num2=getRandomInt(2,Math.floor(MaxNum/Ans));
            Num1=Ans*Num2;
            break;
    }
    $("#top-line").text(Math.max(Num1,Num2).toString());
    $("#bottom-line").text(op_symbol+' '+Math.min(Num1,Num2));
    $("#guess").val('');
    $("#guess").select();
    t1=performance.now();
}

function GenerateNumbers(){
    op = opList[getRandomInt(0,opList.length)];
    let store;
    let Num1_old=Num1;
    let Num2_old=Num2;
    switch(op){
        case 0:
            op_symbol = String.fromCharCode(43);
            [score,Num1,Num2] = AddQ.pop();
            if(Num1==Num1_old && Num2==Num2_old){
                [score,Num1,Num2] = AddQ.pop();
                AddQ.push([Math.trunc(t2-t1),Num1_old,Num2_old]);
            }
            Ans=Num1+Num2;
            break;
        case 1:
            op_symbol = String.fromCharCode(45);
            [score,Num1,Num2] = SubQ.pop();
            if(Num1==Num1_old && Num2==Num2_old){
                [score,Num1,Num2] = SubQ.pop();
                SubQ.push([Math.trunc(t2-t1),Num1_old,Num2_old]);
            }
            Ans=Num1-Num2;
            break;
        case 2:
            op_symbol = String.fromCharCode(215);
            [score,Num1,Num2] = MulQ.pop();
            if(Num1==Num1_old && Num2==Num2_old){
                [score,Num1,Num2] = MulQ.pop();
                MulQ.push([Math.trunc(t2-t1),Num1_old,Num2_old]);
            }
            Ans=Num1*Num2;
            break;
        case 3:
            op_symbol = String.fromCharCode(247);
            [score,Num1,Num2] = DivQ.pop();
            if(Num1==Num1_old && Num2==Num2_old){
                [score,Num1,Num2] = DivQ.pop();
                DivQ.push([Math.trunc(t2-t1),Num1_old,Num2_old]);
            }
            Ans = Num1/Num2;
            break;
    }
    [Num1,Num2] = [Math.max(Num1,Num2),Math.min(Num1,Num2)]
    $("#top-line").text(Num1.toString());
    $("#bottom-line").text(op_symbol+' '+Num2);
    $("#guess").val('');
    $("#guess").select();
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
    DoAdd = $("#add-check").val();
    DoSub = $("#sub-check").val();
    DoMul = $("#mul-check").val();
    DoDiv = $("#div-check").val();
    
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


    $("#setup-panels").hide();
    $("#game-panels").show();
    $("#start-button").off("click");
    $("#stop-button").click(StopGame);
    $("#guess").on("input",CheckAnswer);

    $("#avg-time").text(TotalAvg.toString());
    $("#total-ans").text(TotalCount);
    $(document).scrollTop();
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
        switch(op){
            case 0:
                AddQ.push([Math.trunc(t2-t1)+getRandomInt(-50,50),Num1,Num2]);//Math.max(Num1,Num2),Math.min(Num1,Num2)])
                break;
            case 1:
                SubQ.push([Math.trunc(t2-t1)+getRandomInt(-50,50),Num1,Num2]);//Math.max(Num1,Num2),Math.min(Num1,Num2)])
                break;
            case 2:
                MulQ.push([Math.trunc(t2-t1)+getRandomInt(-50,50),Num1,Num2]);//Math.max(Num1,Num2),Math.min(Num1,Num2)])
                break;
            case 3:
                DivQ.push([Math.trunc(t2-t1)+getRandomInt(-50,50),Num1,Num2]);//Math.max(Num1,Num2),Math.min(Num1,Num2)])
                break;
        }
        //console.log(t2-t1);
        TotalAvg = (TotalAvg*TotalCount+t2-t1)/(TotalCount+1);
        TotalCount+=1;
        $("#avg-time").text(Math.trunc(TotalAvg*100)/100+' ms');
        $("#total-ans").text(TotalCount);
        GenerateNumbers();
    }else if(GuessInput.value.length>Ans.toString().length){
        GuessInput.value='';
    }
}

$(function(){
    $("#start-button").click(StartGame);
})
