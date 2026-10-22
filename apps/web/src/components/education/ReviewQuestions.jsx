import { useState } from 'react';

export default function ReviewQuestions({questions=[]}){
 const [answers,setAnswers]=useState({});
 return <section className="panel edu-review" aria-labelledby="review-title">
  <h2 id="review-title">Check your understanding</h2>
  <p>Select an answer to see an explanation. Your selections remain on this page only.</p>
  {questions.map((item,index)=>{
   const current=answers[index];const answered=current!==undefined;const correct=current===item.answerIndex;
   return <fieldset className="edu-question" key={item.question}>
    <legend>{index+1}. {item.question}</legend>
    {item.choices.map((choice,choiceIndex)=><label key={choiceIndex} className="edu-choice">
      <input type="radio" name={`lesson-question-${index}`} checked={current===choiceIndex} onChange={()=>setAnswers(a=>({...a,[index]:choiceIndex}))}/>
      <span>{choice}</span>
     </label>)}
    {answered&&<p className={`edu-answer ${correct?'is-correct':'is-incorrect'}`} role="status">
     <strong>{correct?'Correct.':'Not quite.'}</strong> {item.explanation}
    </p>}
   </fieldset>;
  })}
 </section>;
}
