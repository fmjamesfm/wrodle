import './App.css';
import { useState, useEffect, useCallback } from 'react';
import {useLocation} from 'react-router-dom';
import ShortCrypt from 'short-crypt';
import dbjson from './5words.json';

import { findRenderedComponentWithType } from 'react-dom/test-utils';

const grid_cols = 5;
const grid_rows = 6;

const letters1 = 'qwertyuiop'.split('');
const letters2 = 'asdfghjkl'.split('');
const letters3 = ['Enter',...('zxcvbnm'.split('')), 'Backspace'];

const sc = new ShortCrypt('potat');
const db = dbjson.map((item)=>item.word);

function checkWord(word){

  return (db.includes(word))

}

function WordleGrid(props){

  const rows = props.grid.map((item, idx) => <WordleRow shake={props.shake==idx} key={idx} cols={item} status={props.status[idx]}/>);
  
  return (
      <div className='grid-container'>
      <div className="wordle-grid">

        {rows}
        
        </div>

      </div>
  )
}

function WorldeItem(props) {
  return(
    <div className={`wordle-item ${props.status}`}>{props.text}</div>
  )
}

function WordleRow(props){

    const items = props.cols.map((col, idx)=><WorldeItem key={idx} text={col} status={props.status[idx]}/>);

    return (

      <div className={'wordle-row ' + (props.shake ? 'shake-row' : '' )}>

            {items}

      </div>
    )
}


function URLGenerator(){

  const [string, setString] = useState("");
  const [disState, setDisState] = useState(true);
  const [result, setResult] = useState("");

  const onClick = () =>{
      
      let search_tag = encryptWord(string.toLowerCase());
      setResult(window.location.host + window.location.pathname + "?word=" + search_tag);    

  };

  useEffect(()=>{
    setDisState(!(string.length==grid_cols && string.match(/[a-z]/i)) );

  }, [string]);

  const copyToClipboard = ()=> {
    navigator.clipboard.writeText(result).then().catch(() => {
      alert("something went wrong");
    });
  };

  return (<div className='url-generator'>
    <div className='url-generate-input'>
        
        <input autoFocus style={{textTransform: "uppercase"}} type='text' value={string} onChange={(e)=>setString(e.target.value)}></input>
        <button disabled={disState} onClick={onClick} >Generate</button>
        
        </div>

        <div style={{fontSize: "24px"}}>{result}{!(result=="") ? <button onClick={copyToClipboard} >Copy</button> : null}
</div>
  </div>)
}


function EndOverlay({victory, numGuess, word}){

  
const message =  victory ? <div>{`You won! Guesses: ${numGuess}`}</div> : <div>{`You lost! :( The word was: ${word}`}</div>;

return(<div className='end-overlay'>
      
      {message}

  </div>)

}


function initGrid(r,c){
  var grid = []  
  let n=0;
  for (let i=0; i < r;i++){

      grid.push([]);

      for (let j=0; j<c; j++){
        grid[i].push('');
        n++;
      }
      
    }

    return grid;
}

function KeyboardItem({string, onClick, status}){
  if (string.toLowerCase()=='backspace')

  {return (<div className='keyboard-item' onClick={()=>onClick(string)}><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
  <path fill="white" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path>
</svg></div>)}

  return (<div className={'keyboard-item ' + status} onClick={()=>onClick(string)}>{string}</div>)
}

function Keyboard({callback, status}){

  return (<div className="keyboard">

<div className='keyboard-row'>
        {letters1.map((letter) => <KeyboardItem string={letter} key={letter} onClick={callback} status={status[letter]}/> )}
        </div>
        
<div className='keyboard-row'>
        <div style={{flex: "0.5"}}></div>
        {letters2.map((letter) => <KeyboardItem string={letter} key={letter} onClick={callback} status={status[letter]}/>)}
        <div style={{flex: "0.5"}}></div>
  
        </div>


<div className='keyboard-row'>
        {letters3.map((letter) => <KeyboardItem string={letter} key={letter} onClick={callback} status={status[letter]}/>)}
        </div>
        
  </div>)
}

function pickRandomWord(){

  let db_lim = db.filter((item)=>item.length==grid_cols);
  let idx = Math.round(Math.random() * db_lim.length);
  return db_lim[idx];

}


function decryptWord(word){
  const url_code = sc.decryptURLComponent(word);
  return String.fromCharCode(...url_code);
}

function encryptWord(word){
  const url_code = sc.encryptToURLComponent(word);
  return url_code;
}

function finder(array, item) {
  
  let index = -1;
  let indices = new Array();

  while ((index = array.indexOf(item, index + 1)) > -1) {
    indices.push(index)
  }
    return indices;
}


function getStatusCompare(tgt, word) {
  let row = word.split('');
  let target = tgt.split('');
  let status = target.map(()=>'wordle-item-grey');
  let setOfLettersInTarget = [...new Set(target)];

  setOfLettersInTarget.map((letter) =>
  {
    
      let idxInTarget = finder(target, letter);  
      let idxInRow = finder(row, letter);
      if (idxInRow.length ==0) {return;}
      let perfectMatchIdx = idxInRow.filter((item) => idxInTarget.indexOf(item) > -1);
      perfectMatchIdx.map((idx) => status[idx] = 'wordle-item-green');
      let yellowIdxs = idxInRow.filter((item) => perfectMatchIdx.indexOf(item) == -1);
      let n = idxInTarget.length - perfectMatchIdx.length;
      if (yellowIdxs.length == 0) {return;}
      for (let i=0; i<(n); i++) {
          status[yellowIdxs[i]] = 'wordle-item-yellow';
      };
      
  });
  
  return status;

} 
 
  


function App() {

  const [grid, setGrid] = useState(initGrid(grid_rows, grid_cols));
  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);
  const [target, setTarget] = useState(pickRandomWord());
  const [status, setStatus] = useState(initGrid(grid_rows, grid_cols))
  const [letterStatus, setLetterStatus] = useState({});
  const [endGame, setEndgame] = useState(false);
  const [victory, setVictory] = useState(false);
  const location = useLocation();
  const [shake, setShake] = useState(-1);

  const [urlGeneratorOpen, setUrlGeneratorOpen] = useState(false);
    
 
    useEffect(() => {
      if (!(location.search)==''){
      const params = new URLSearchParams(location.search);
      const value = params.get('word');

      if (!(value==null)){
        let word = '';

        try{  
        word = decryptWord(value)
      }

      catch (error) {
        alert("URL not valid! Generating random word");

        restartRandom(); 
        return;
      }

          
          setTarget(word);
        }

          restartGame();    
        }

    }, [location.search]);



  function setValue(row, col, val){
    let newgrid = grid.map((arr) => arr.slice());
    newgrid[row][col] = val;
    setGrid(newgrid);
  }

  function handleSetStatus(){
    let newstatus = status.map((arr) => arr.slice());
    newstatus[curRow-1] = getStatusCompare(target, grid[curRow-1].join(''));

    let newLetterStatus = Object.assign({}, letterStatus, ...grid[curRow-1].map((letter, idx) => 
      {
        if (!(letterStatus[letter] == 'wordle-item-green')) {
      return ({[letter]: newstatus[curRow-1][idx]})}

    } 
        ));
        
    setLetterStatus(newLetterStatus);

    setStatus(newstatus);
  }

  useEffect(()=> {

    if ((curRow ==0)) {
      return;
    }

    handleSetStatus();

    }, [curRow]) 
    
  
   
  const inputCallback = useCallback( e => {
            if (e.length==1 && e.match(/[a-z]/i) && !endGame){
              if (curCol <= (grid_cols-1)){
                setValue(curRow, curCol, e);
                setCurCol(curCol + 1);
              }
          }


        if (e.toLowerCase()=='enter' && curCol==grid_cols){
            
            // check row vs target and set classes
            
            let word = grid[curRow].join('');

            if (word == target) {
              setEndgame(true);
              setVictory(true);
              setCurRow(curRow+1);
              setCurCol(0);
              return;
            }

            else if (checkWord(word)){

            if (curRow == grid_rows-1) {
              setEndgame(true);
              setVictory(false);
            }
            
            setCurRow(curRow+1);
            setCurCol(0);
            
          }
          else{
            setShake(curRow);
            const timeout = setTimeout(()=> {setShake(-1)}, 500);

            return () => clearTimeout(timeout);

          }
        }
        if (e.toLowerCase()=='backspace' && curCol > 0){
          setValue(curRow, curCol-1, null);
          setCurCol(curCol-1);
        }

        
    }, [curCol, curRow]);
  
const handleKeyDown = useCallback( e => inputCallback(e.key), [curCol, curRow]);



  useEffect(()=>{
    
    document.addEventListener('keydown', handleKeyDown, false);

    return() =>{
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);


  function restartGame(){
    setGrid(initGrid(grid_rows, grid_cols));
    setStatus(initGrid(grid_rows, grid_cols));
    setLetterStatus({});
    setCurCol(0);
    setCurRow(0);
    setVictory(false);
    setEndgame(false);
    setUrlGeneratorOpen(false);
  }

  function restartRandom(){
      restartGame();
      
      setTarget(pickRandomWord());
  }

  if (grid) {
    return (
      <div className="app" >
        { endGame ? <EndOverlay victory={victory} numGuess={curRow} word={target}/> : null }
        { urlGeneratorOpen ? <URLGenerator basepath={location.pathname}/> : null}

        <div className="app-header">
            <button style={{marginLeft: "15px" }} onClick={restartRandom} onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }}> Random </button>
            
            <button style={{marginRight: "15px" }} onClick={()=> setUrlGeneratorOpen(!(urlGeneratorOpen))} onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }}> Gen word </button>
            
            <h1 className='app-title'>Wrodle</h1>
          </div>

        <div className='wordle-game'>
          <WordleGrid grid={grid} status={status} shake={shake}/>

          <Keyboard callback={inputCallback} status={letterStatus}/>
          </div>
        
      </div>
    );
  }
  return (<div className="app-main-body"> Loading...</div>);
}

export default App;
