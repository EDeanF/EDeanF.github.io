$(function(){

// global access to the guess input DOM object
const GuessInput = document.getElementById('guess')

function getRandomInt(min, max) {
    //The maximum is exclusive and the minimum is inclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    
    return Math.floor(Math.random() * (max - min)) + min; 
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

// multi-dimensional arrays for graphing results
function createArray(length) {
    var arr = new Array(length || 0);
    i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

/* 
ProblemType is an object that encapsulates a type of problem
genFunc generates random operands num1 and num2
ansFunc how to get the answer from the operands
numProbs is the total number of possible problems
numSolved in the total number of problems of that type that have been solved
timeSolved is the total amount of time spent to solve all problem of that type
Q is a Priority Queue that ranks solved problems by how long it took to solve, 
    from longest to shortest time
S is a Set that keeps track of what is in Q
*/
function ProblemType(str, func1, func2, func3, func4){
    this.opSymbol = str || '';
    this.genFunc = func1 || undefined;
    this.ansFunc = func2 || undefined;
    this.calcNumProbs = func3 || undefined;
    this.genAllProbs = func4 || undefined;
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
    // this.numProbs = this.type.calcNumProbs(minNum,maxNum);
    this.unsolved = this.type.genAllProbs(minNum,maxNum);
    this.numProbs = this.unsolved.length;
    this.numSolved=0;
    this.timeSolved=0;
    this.Q = new PriorityQueue();
    this.S = new Set();
}
ProblemTracker.prototype.push = function(dt,num1,num2){
    this.Q.push([dt,num1,num2]);
    this.S.add([num1,num2].join(','));
    this.numSolved++;
    this.timeSolved+=dt;
}
ProblemTracker.prototype.avgTime = function(){
    return this.timeSolved/this.numSolved;
};
ProblemTracker.prototype.fractionSaved = function(){
    return this.Q.size()/this.numProbs;
};
ProblemTracker.prototype.next = function(){
    let rand = Math.random();
    let dt,num1,num2;
    if(this.Q.isEmpty() || (this.unsolved.length > 0 && (0.25+rand)>this.fractionSaved())){
        [num1,num2] = this.unsolved.pop();
        while(this.S.has([num1,num2].join(","))){
            console.log('error:duplicate!!!');
            [num1,num2] = this.unsolved.pop();
        }
    }else{
        [dt,num1,num2] = this.Q.pop();
        this.S.delete([num1,num2].join(','));
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
ProblemMapper.set('add',new ProblemType(
    String.fromCharCode(43),
    function(minNum,maxNum){
        let i=getRandomInt(minNum,maxNum);
        let j=getRandomInt(minNum,maxNum);
        return [Math.max(i,j),Math.min(i,j)];
    },
    function(a,b){return a+b;},
    function(minNum,maxNum){
        return (maxNum-minNum+1)**2;
    },
    function(minNum,maxNum){
        let out = [];
        for(let i=minNum; i<=maxNum; i++){
            for(let j=i; j<=maxNum; j++){
                out.push([j,i]);
            }
        }
        shuffle(out);
        return out;
    }
));
ProblemMapper.set('sub',new ProblemType(
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
    },
    function(minNum,maxNum){
        let out = [];
        for(let i=minNum; i<=maxNum; i++){
            for(let j=i+1; j<=maxNum; j++){
                out.push([j,i]);
            }
        }
        shuffle(out);
        return out;
    }
));
ProblemMapper.set('mul',new ProblemType(
    String.fromCharCode(215),
    function(minNum,maxNum){
        let i=getRandomInt(Math.max(2,minNum),maxNum+1);
        let j=getRandomInt(Math.max(2,minNum),maxNum+1);
        return [Math.max(i,j),Math.min(i,j)];
    },
    function(a,b){return a*b;},
    function(minNum,maxNum){
        return (maxNum-Math.max(2,minNum)+1)**2
    },
    function(minNum,maxNum){
        let out =[];
        for(let i=Math.max(2,minNum); i<=maxNum; i++){
            for(let j=i; j<=maxNum; j++){
                out.push([j,i]);
            }
        }
        shuffle(out);
        return out;
    }
));
ProblemMapper.set('div',new ProblemType(
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
    },
    function(minNum,maxNum){
        let out = [];
        for(let i=Math.max(2,minNum); i<=Math.floor(maxNum/2); i++){
            for(let j=i; j<=Math.floor(maxNum/i); j++){
                out.push([i*j,j]);
            }
        }
        shuffle(out);
        return out;
    }
));

/*
Interface is a singleton which manages changes to DOM
*/
const Interface = {
    showSetup : function(Game){
        // hide game
        $('#stop-button').off('click');
        $('#guess').off('input');
        $('#game-panels').hide();
        // show setup
        $('#setup-panels').show();
        $('#start-button').click(Game.start.bind(Game));
        $('#min-num').on('input change',Interface.limitRange);
        $('#max-num').on('input change',Interface.limitRange);
    },
    showGame : function(Game){
        // hide setup
        $('#start-button').off('click');
        $('#setup-panels').hide();
        // show game
        $('#game-panels').show();
        $('#stop-button').click(Game.stop.bind(Game));
        $('#guess').on('input',Game.checkAnswer.bind(Game));
        $('#guess').on('select input focus', function(){
            $(document).scrollTop(0);
        })
        $(document).scrollTop(0);
    },
    updateProblem : function(opSymbol,num1,num2){
        $('#top-line').text(num1.toString());
        $('#bottom-line').text(opSymbol+' '+num2);
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
        $('#avg-time').text((TotalTime/TotalCount/1000).toFixed(2).toString()+' s');
        $('#total-ans').text(TotalCount);
    },
    limitRange : function(){
        if( parseInt($('#min-num').val()) < parseInt($('#min-num').attr('min')) ){
            $('#min-num').effect('shake',{distance: 10},'fast');
            $('#min-num').val(parseInt($('#min-num').attr('min')));
        }else if( parseInt($('#min-num').val()) > parseInt($('#min-num').attr('max')) ){
            $('#min-num').effect('shake',{distance: 10},'fast');
            $('#min-num').val(parseInt($('#min-num').attr('max')));
        }
        if( parseInt($('#max-num').val()) < parseInt($('#max-num').attr('min')) ){
            $('#max-num').effect('shake',{distance: 10},'fast');
            $('#max-num').val(parseInt($('#max-num').attr('min')))
        }else if( parseInt($('#max-num').val()) > parseInt($('#max-num').attr('max')) ){
            $('#max-num').effect('shake',{distance: 10},'fast');
            $('#max-num').val(parseInt($('#max-num').attr('max')));
        }
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
        
        // check that minNum and maxNum are valid
        if(this.minNum>=this.maxNum){
            $('#max-num').effect('shake',{distance: 10},'fast');
            return;
        }

        for(let check of $('input:checked')){
            this.problemArray.push(
                new ProblemTracker(
                    ProblemMapper.get(check.value),
                    this.minNum, this.maxNum
                )
            );
            // if it is has no valid problems, remove
            let N = this.problemArray.length;
            if(this.problemArray[N-1].numProbs==0){
                this.problemArray.pop();
            }
        }

        // if nothing selected default to all
        if($('input:checked').length==0){
            for(let [name,type] of ProblemMapper.entries()){
                this.problemArray.push(
                    new ProblemTracker(type,this.minNum, this.maxNum)
                );
            }
            // if it is has no valid problems, remove
            let N = this.problemArray.length;
            if(this.problemArray[N-1].numProbs==0){
                this.problemArray.pop();
            }
        }
        
        // check there are at least some valid problems
        if(this.problemArray.length==0){
            $('#max-num').effect('shake',{distance: 10},'fast');
            return;
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
        [this.num1,this.num2] = this.problem.next();
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
        this.minNum = Number($('#min-num').val());
        this.maxNum = Number($('#max-num').val());
        this.problemArray = [];
    }
};

// initialize interface
Interface.showSetup(Game);
});


