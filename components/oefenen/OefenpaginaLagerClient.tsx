"use client";

import { useEffect, useMemo, useState } from "react";
import ExerciseCard from "@/components/oefenen/ExerciseCard";
import MountainProgress from "@/components/oefenen/MountainProgress";
import BottomActions from "@/components/oefenen/BottomActions";
import { generateExercisesLager } from "@/lib/oefeningen/generateExercisesLager";
import { normalize } from "@/lib/oefeningen/utils";
import type { Exercise, LevelProgress } from "@/lib/oefeningen/types";

type Grade = 1 | 2 | 3 | 5;
type StoredData = { level:number; reached:number[]; seeds:Record<number,number>; exercises:Record<number,Exercise[]>; progress:Record<number,LevelProgress> };

export default function OefenpaginaLagerClient({ grade }: { grade: Grade }) {
  const storageKey = `sago-lager-${grade}-v3-minimumdoelen`;
  const [loaded,setLoaded]=useState(false);
  const [level,setLevel]=useState(1);
  const [reached,setReached]=useState<number[]>([1]);
  const [seeds,setSeeds]=useState<Record<number,number>>({1:Date.now()});
  const [savedExercises,setSavedExercises]=useState<Record<number,Exercise[]>>({});
  const [progress,setProgress]=useState<Record<number,LevelProgress>>({});
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [checked,setChecked]=useState(false);

  useEffect(()=>{try{const raw=localStorage.getItem(storageKey);if(raw){const d=JSON.parse(raw) as Partial<StoredData>;setLevel(d.level||1);setReached(d.reached||[1]);setSeeds(d.seeds||{1:Date.now()});setSavedExercises(d.exercises||{});setProgress(d.progress||{});const p=d.progress?.[d.level||1];if(p){setAnswers(p.answers||{});setChecked(Boolean(p.checked));}}}finally{setLoaded(true)}},[storageKey]);
  useEffect(()=>{if(!loaded)return;localStorage.setItem(storageKey,JSON.stringify({level,reached,seeds,exercises:savedExercises,progress} satisfies StoredData));},[loaded,storageKey,level,reached,seeds,savedExercises,progress]);

  const seed=seeds[level]||Date.now()+level;
  const exercises=useMemo(()=>savedExercises[level]||generateExercisesLager(grade,level,seed),[savedExercises,grade,level,seed]);
  useEffect(()=>{if(!savedExercises[level])setSavedExercises(v=>({...v,[level]:exercises}));},[level,exercises,savedExercises]);
  const isCorrect=(e:Exercise)=>{const got=normalize(answers[e.id]||"");const accepted=Array.isArray(e.answer)?e.answer:[e.answer];return accepted.some(a=>normalize(a)===got)};
  const score=exercises.filter(isCorrect).length;
  const percentage=exercises.length?Math.round(score/exercises.length*100):0;
  const displayed=checked?percentage:(progress[level]?.checked?progress[level].percentage:0);
  const displayedScore=checked?score:(progress[level]?.checked?progress[level].score:0);

  function save(check=checked){setProgress(v=>({...v,[level]:{answers,checked:check,percentage:check?percentage:(v[level]?.percentage||0),score:check?score:(v[level]?.score||0)}}));}
  function go(target:number){if(!reached.includes(target))return;save();const nextSeed=seeds[target]||Date.now()+target;setSeeds(v=>({...v,[target]:v[target]||nextSeed}));setSavedExercises(v=>v[target]?v:{...v,[target]:generateExercisesLager(grade,target,nextSeed)});const p=progress[target];setLevel(target);setAnswers(p?.answers||{});setChecked(Boolean(p?.checked));window.scrollTo({top:0,behavior:"smooth"});}
  function improve(){setChecked(true);save(true);if(percentage>=75&&level<10){const n=level+1;setReached(v=>v.includes(n)?v:[...v,n]);}}
  function reset(){const s=Date.now();setSeeds(v=>({...v,[level]:s}));setSavedExercises(v=>({...v,[level]:generateExercisesLager(grade,level,s)}));setAnswers({});setChecked(false);setProgress(v=>({...v,[level]:{answers:{},checked:false,percentage:0,score:0}}));window.scrollTo({top:0,behavior:"smooth"});}
  const next=()=>{if(!checked||percentage<75){setChecked(true);return;}if(level<10)go(level+1)};

  if(!loaded)return <main className="oefenpagina"><section className="oefen-hero"><h1>Oefeningen laden…</h1></section></main>;
  return <main className="oefenpagina">
    <section className="oefen-hero"><p className="eyebrow">{grade}e leerjaar · minimumdoelen</p><h1>Oefenen op jouw niveau</h1><p>15 gevarieerde oefeningen per niveau. De leerstof groeit stap voor stap en sluit aan bij taal, getallen, bewerkingen, meten en vraagstukken.</p></section>
    <MountainProgress level={level} reachedLevels={reached} displayedPercentage={displayed} displayedScore={displayedScore} total={exercises.length} checked={checked} savedChecked={Boolean(progress[level]?.checked)} percentage={percentage} onGoToLevel={go} onPrevious={()=>go(Math.max(1,level-1))} onImprove={improve} onNext={next} onReset={reset}/>
    <section className="exercise-list">{exercises.map((e,i)=><ExerciseCard key={e.id} exercise={e} index={i} value={answers[e.id]||""} checked={checked} correct={isCorrect(e)} onChange={(id,value)=>{setAnswers(v=>({...v,[id]:value}));setChecked(false)}}/>)}</section>
    <BottomActions level={level} checked={checked} percentage={percentage} onPrevious={()=>go(Math.max(1,level-1))} onImprove={improve} onNext={next} onReset={reset}/>
  </main>;
}
