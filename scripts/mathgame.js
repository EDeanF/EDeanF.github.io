let Num1, Num2, op, Ans;
let op_symbol, opList=[];
let DoAdd, DoSub, DoMul, DoDiv;
let AddCount, SubCount, MultCount, DivCount, TotalCount;
let AddAvg, SubAvg, MultAvg, DivAvg, TotalAvg;
let t1,t2;

// setup panel objects
const SetupPanels = document.getElementById('setup-panels');
const AddCheck = document.getElementById('add-check');
const SubCheck = document.getElementById('sub-check');
const MulCheck = document.getElementById('mul-check');
const DivCheck = document.getElementById('div-check');
const MaxNum = document.getElementById('max-num')
const StartGameButton = document.getElementById('start-button');

// game panel objects
const GamePanels = document.getElementById('game-panels');
const TopLine = document.getElementById('top-line')
const BottomLine = document.getElementById('bottom-line');
const GuessInput = document.getElementById('guess')
const StopGameButton = document.getElementById('stop-button');
const AvgTimeLine = document.getElementById('avg-time');
const TotalCountLine = document.getElementById('total-ans')

function getRandomInt(min, max) {
    //The maximum is exclusive and the minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
}

function GenerateNumbers(){
    let op = opList[getRandomInt(0,opList.length)];

    switch(op){
        case 0:
            op_symbol = String.fromCharCode(43);
            Num1=getRandomInt(1,MaxNum.value);
            Num2=getRandomInt(1,MaxNum.value);
            Ans=Num1+Num2;
            break;
        case 1:
            op_symbol = String.fromCharCode(45);
            Num1=getRandomInt(2,MaxNum.value);
            Num2=getRandomInt(1,Num1-1);
            Ans=Num1-Num2;
            break;
        case 2:
            op_symbol = String.fromCharCode(215);
            Num1=getRandomInt(2,MaxNum.value);
            Num2=getRandomInt(2,MaxNum.value);
            Ans=Num1*Num2;
            break;
        case 3:
            op_symbol = String.fromCharCode(247);
            Ans=getRandomInt(2,Math.floor(MaxNum.value/2));
            Num2=getRandomInt(2,Math.floor(MaxNum.value/Ans));
            Num1=Ans*Num2;
            break;
    }
    TopLine.textContent = Math.max(Num1,Num2);
    BottomLine.textContent = op_symbol+' '+Math.min(Num1,Num2);
    GuessInput.value='';
    GuessInput.select();
    t1=performance.now();
}

function StartGame(){
    DoAdd = AddCheck.checked;
    DoSub = SubCheck.checked;
    DoMul = MulCheck.checked;
    DoDiv = DivCheck.checked;
    // initialize values
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
    // show-hide panels
    SetupPanels.style.display = 'none';
    GamePanels.style.display = 'block';
    StartGameButton.removeEventListener('click',StartGame);
    StopGameButton.addEventListener('click', StopGame);
    GuessInput.addEventListener('input',CheckAnswer);
    AvgTimeLine.textContent = TotalAvg;
    TotalCountLine.textContent = TotalCount;
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    GenerateNumbers();
}

function StopGame(){
    // show-hide panels
    SetupPanels.style.display = 'block';
    GamePanels.style.display = 'none';
    StopGameButton.removeEventListener('click', StopGame);
    GuessInput.removeEventListener('input',CheckAnswer);
    StartGameButton.addEventListener('click',StartGame);
}

function CheckAnswer(){
    if(GuessInput.value==Ans){
        t2=performance.now();
        TotalAvg = (TotalAvg*TotalCount+t2-t1)/(TotalCount+1)/1000;
        TotalCount+=1;
        AvgTimeLine.textContent = Math.trunc(TotalAvg*100)/100+' s';
        TotalCountLine.textContent = TotalCount;
        GenerateNumbers();
    }
}

StartGameButton.addEventListener('click', StartGame);
