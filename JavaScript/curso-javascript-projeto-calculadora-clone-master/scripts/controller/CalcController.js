class CalcController{

	constructor(){
    this._audioOnOff = false;
    this._audio = new Audio('click.mp3');

    this._lastOperation = '';
    this._lastNumber = '';

    this._operation =[];
		this._locale = 'pt-BR'
		this._displayCalc = document.querySelector("#display");
		this._dateEl = document.querySelector('#data');
		this._timeEl = document.querySelector('#hora');
		this._currentDate;
		this.initialize();
		this.initButtonsEvents();
    this.initKeyboard();
	}

  pasteFromClipboard(){

    document.addEventListener('paste', e=>{
      
      let text = e.clipboardData.getData('Text');
      this.displayCalc = parseFloat(text); 

    })
  }

  copyToClipboard(){

    let input = document.createElement('input');
    input.value = this.displayCalc;
    document.body.appendChild(input);
    input.select();
    document.execCommand("Copy");
    input.remove();

  }

	initialize(){
      
      this.setDisplayDateTime();

      setInterval(()=>{

         this.setDisplayDateTime()

      },1000);

       this.setLastNumberToDisplay(); 
       this.pasteFromClipboard();

       document.querySelectorAll('.btn-ac').forEach(btn=>{
         btn.addEventListener('dblclick', e=>{
           this.toggleAudio();      

         });
       })

	}

  toggleAudio(){

    //this._audioOnOff = (this._audioOnOff) ?false :true; 
    this._audioOnOff = !this._audioOnOff;//igual a linha de cima

    
  }

  playAudio(){
    if (this._audioOnOff){
      this._audio.currentTime = 0;
      this._audio.play();
    }
  }

  initKeyboard(){
    document.addEventListener('keyup', e=>{
      this.playAudio();

      switch (e.key){
      case 'Escape':
          this.clearAll();
        break;
      case 'Backspace':
          this.clearEntry();
        break;
      case '+':        
      case '-':          
      case '*':        
      case '/':
      case '%':
         this.addOperation(e.key);
         break;
      case 'enter':
       case '=':
        this.calc();   
        break;
      case '.':
      case ',':
        this.addDot();
        break;

      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
         this.addOperation(parseInt(e.key));
         break; 

      case 'c':
      if(e.ctrlKey) this.copyToClipboard();
      break;  
        
      }        
    });
  }

	addEventListenerAll(element, events, fn){
      
      events.split(' ').forEach(events => {

	     element.addEventListener(events,fn, false );
     });
	}

	clearAll(){
		this._operation=[];
    this._lastNumber='';
    this._lastOperator='';

    this.setLastNumberToDisplay(); 
		
	}

  clearEntry(){
		this._operation.pop();
    this.setLastNumberToDisplay();
	}

  getLastOperation(){ 
    return this._operation[this._operation.length-1];
  }

  setLastOperation (){

    return this._operation[this._operation.length-1];

  }

   isOperator(value){
    return (['+', '-', '*', '%', '/'].indexOf(value) > -1);
      
   }

   pushOperation(value){
    this._operation.push(value);
    if(this._operation.length > 3){

      
      this.calc();
      console.log(this._operation);
    }
   }

  getResult(){
    try{
     return eval(this._operation.join("")); 

   }catch(e){
      setTimeout(()=>{
        this.setError();
      }, 1);

     
   }
  }


   calc(){
 
    let last = '';

     this._lastOperatior = this.getLastItem();

    if (this._operation.length < 3){
      
      let firstItem = this._operation[0];      
      this._operation= [firstItem, this._lastOperator, this._lastNumber]; //guarda resultado para o botao igual
    
    }

    if (this._operation.length > 3){
      last = this._operation.pop();      
      this._lastNumber = this.getResult(); //guarda resultado para o botao igual
    
    }else  if (this._operation.length == 3){
      last = this._operation.pop();
      
     this._lastNumber = this.getLastItem(false);
    }


    let result = this.getResult();
    //eval(this._operation.join(""))

    if (last == '%'){

      result /= 100;
      this._operation = [result];
    }else{
        
        this._operation = [result];     
        if (last) this._operation.push(last);
      }    
    
    this.setLastNumberToDisplay(); 
   }


  getLastItem (isOperator = true){

    let lastItem;

    for (let i=this._operation.length-1; i>=0; i--)
    {      
        if (this.isOperator(this._operation[i])== isOperator){
          lastItem = this._operation[i];
          break;
        }
      }

    if (!lastItem){
      lastItem = (isOperator)? this._lastOperator: this._lastNumber;
    }

    return lastItem;
   }



   setLastNumberToDisplay(){
     let lastNumber = this.getLastItem(false);

      if (!lastNumber) lastNumber = 0;

      this.displayCalc = lastNumber;
   }



   addOperation(value) {

     if ( isNaN(this.getLastOperation()) ) {  //ultima coisa digitada nao e um nr
     
       if (this.isOperator(value)) { //se true
         //trocar o operador
         this.setLastOperation = value;

       }  else{
             
            
              this.pushOperation(value);
              this.setLastNumberToDisplay(); 
              } 
      
    } else{
         if (this.isOperator(value)){
           this.pushOperation(value);                
         
         } else{  
            let newValue = this.getLastOperation().toString() + value.toString();
            this.setLastOperation(newValue);  

            this.setLastNumberToDisplay();      
             
          }      
   
       }
   }

   
  setError() {
		this.displayCalc = "Error";
	}

  addDot(){

    let lastOperation = this.getLastOperation();
    if(typeof lastOperation === 'string' && lastOperator.split('').indexOf('.')> -1) return;

    if (this.isOperator(lastOperation) || !lastOperation){
      this.pushOperation('0.');
    }else{
      this.setLastOperation(lastOperation.toString() + '.');

    }

    this.setLastNumberToDisplay();

  }

   execBtn(value){
      this.playAudio();

   	 switch (value){
   	 	case 'ac':
          this.clearAll();
   	 	  break;
   	 	case 'ce':
          this.clearEntry();
   	 	  break;
   	 	case 'soma':
          this.addOperation('+');
   	 	  break;

   	 	case 'subtracao':
          this.addOperation('-');
   	 	  break;

   	 	case 'divisao':
        this.addOperation('/');         
   	 	  break;

   	 	case 'multiplicacao':
         this.addOperation('*');
   	 	  break;

        case 'porcento':
          this.addOperation('%');
          break;   	 	  

        case 'igual':
           this.calc();
           break;
        case 'ponto':
          this.addDot();
          break;

         case '0':
         case '1':
         case '2':
         case '3':
         case '4':
         case '5':
         case '6':
         case '7':
         case '8':
         case '9':
         this.addOperation(parseInt(value))
   	 	  break;   	 	  

          default:

          this.setError();
          break;


   	 }
   }


  initButtonsEvents(){
  	 let buttons = document.querySelectorAll("#buttons > g, #partes > g");


  	 buttons.forEach((btn, index)=>{

  	 	this.addEventListenerAll(btn,'click', e=>{

  	 	let textBtn = btn.className.baseVal.replace("btn-","");
  	 	this.execBtn(textBtn);

  	 });


  	 	this.addEventListenerAll(btn, "mouseover mouseup mousedown", e=>{
  	 		btn.style.cursor="pointer"; //passando mouse para maozinha
  	 	})

  })
  	 
  }



	setDisplayDateTime(){

	  this.displayDate = this.currentDate.toLocaleDateString(this._locale,
	  	{day:"2-digit",
	  	month:"short",
	  	year:"numeric"});
      this.displayTime = this.currentDate.toLocaleTimeString(this._locale);	

	};

	get displayTime(){
		return this._timeEl.innerHTML;

	}

	set displayTime(value){

		this._timeEl.innerHTML = value;

	}

		get displayDate(){
		return this._dateEl.innerHTML;

	}

	set displayDate(value){

		this._dateEl.innerHTML = value;

	}


get displayCalc(){

	return this._displayCalc.innerHTML;
 }

 set displayCalc(value){
  
  if (value.toString().length > 10){
    this.setError();
    return false;
  }

 	this._displayCalc.innerHTML = value;
 }

 get currentDate(){

	return new Date();
 }

 set currentDate(value){
 	this._currentDate.innerHTML = value;
 }

}