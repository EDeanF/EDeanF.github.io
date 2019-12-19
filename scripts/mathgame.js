let Num1, Num2, op, Ans;
let op_symbol;
let DoAdd, DoSub, DoMul, DoDiv;
let AddCount, SubCount, MultCount, DivCount;
let AddAvg, SubAvg, MultAvg, DivAvg;

// setup panels
const SetupPanels = document.getElementById('setup-panels');
const AddCheck = document.getElementById('add-check');
const SubCheck = document.getElementById('sub-check');
const MulCheck = document.getElementById('mul-check');
const DivCheck = document.getElementById('div-check');
const MaxNumDigit = document.getElementById('num-dig')
const StartGameButton = document.getElementById('start-button');

// game panels
const GamePanels = document.getElementById('game-panels');
const TopLine = document.getElementById('top-line')
const BottomLine = document.getElementById('bottom-line');
const GuessInput = document.getElementById('guess')
const StopGameButton = document.getElementById('stop-button');

function getRandomInt(min, max) {
    //The maximum is exclusive and the minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
}

function GenerateNumbers(){
    let op = getRandomInt(0,4);
    switch(op){
        case 0:
            op_symbol = String.fromCharCode(43);
            Num1=getRandomInt(1,Math.pow(10,MaxNumDigit.value)-1);
            Num2=getRandomInt(1,Math.pow(10,MaxNumDigit.value)-1);
            Ans=Num1+Num2;
            break;
        case 1:
            op_symbol = String.fromCharCode(45);
            Num1=getRandomInt(2,Math.pow(10,MaxNumDigit.value)-1);
            Num2=getRandomInt(1,Num1-1);
            Ans=Num1-Num2;
            break;
        case 2:
            op_symbol = String.fromCharCode(215);
            Num1=getRandomInt(2,Math.pow(10,MaxNumDigit.value)-1);
            Num2=getRandomInt(2,Math.pow(10,MaxNumDigit.value)-1);
            Ans=Num1*Num2;
            break;
        case 3:
            op_symbol = String.fromCharCode(247);
            Ans=getRandomInt(2,Math.pow(10,MaxNumDigit.value)-1);
            Num2=getRandomInt(2,Math.pow(10,MaxNumDigit.value)-1);
            Num1=Ans*Num2;
            while(Num1>(Math.pow(10,MaxNumDigit.value)-1)){
                Ans=getRandomInt(2,Math.pow(10,MaxNumDigit.value)-1);
                Num2=getRandomInt(2,Math.pow(10,MaxNumDigit.value)-1);
                Num1=Ans*Num2;
            }
            break;
    }
    TopLine.textContent = Math.max(Num1,Num2);
    BottomLine.textContent = op_symbol+' '+Math.min(Num1,Num2);
}

function StartGame(){
    DoAdd = AddCheck.checked;
    DoSub = SubCheck.checked;
    DoMul = MulCheck.checked;
    DoDiv = DivCheck.checked;
    GenerateNumbers();
    // show-hide panels
    SetupPanels.style.display = 'none';
    GamePanels.style.display = 'block';
    StartGameButton.removeEventListener('click',StartGame);
    StopGameButton.addEventListener('click', StopGame);
    GuessInput.addEventListener('input',CheckAnswer);
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
        GenerateNumbers();
        GuessInput.value='';
    }
}

StartGameButton.addEventListener('click', StartGame);
