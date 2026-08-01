import type { Exercise } from "./types";

type Grade=1|2|3|5;
function rng(seed:number){let x=seed||1;return()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}}
function n(r:()=>number,min:number,max:number){return Math.floor(r()*(max-min+1))+min}
function pick<T>(r:()=>number,a:T[]){return a[n(r,0,a.length-1)]}
function shuffle<T>(r:()=>number,a:T[]){return [...a].sort(()=>r()-.5)}
const ex=(id:string,category:string,question:string,answer:string|string[]):Exercise=>({id,category,question,answer});

/** Leerlijn gebaseerd op de aangeleverde minimumdoelen: getallenkennis, bewerkingen,
 * meten, probleemoplossend denken, vlot lezen, tekstbegrip en correct schrijven.
 * Voor leerjaren vóór het vierde worden de noodzakelijke tussenstappen geoefend. */
export function generateExercisesLager(grade:Grade,level:number,seed=Date.now()):Exercise[]{
 const r=rng(seed+grade*10007+level*313), out:Exercise[]=[]; let i=0; const add=(c:string,q:string,a:string|string[])=>out.push(ex(`g${grade}-l${level}-${i++}-${seed}`,c,q,a));
 if(grade===1){
  const max=level<=3?10:level<=7?20:50;
  for(let k=0;k<4;k++){const a=n(r,0,max),b=n(r,0,max-a);add("Getallen en bewerkingen",`${a} + ${b} =`,String(a+b));}
  for(let k=0;k<3;k++){const a=n(r,1,max),b=n(r,0,a);add("Getallen en bewerkingen",`${a} - ${b} =`,String(a-b));}
  const splits=n(r,4,10);add("Getallenkennis",`Vul aan: ${n(r,0,splits)} + … = ${splits}`,String(splits));
  const seq=n(r,1,max-3);add("Getallenkennis",`Welk getal komt daarna? ${seq}, ${seq+1}, ${seq+2}, …`,String(seq+3));
  const words=[["maan","maan"],["vis","vis"],["roos","roos"],["boek","boek"],["school","school"]];const [w,a]=pick(r,words);add("Lezen en schrijven",`Typ het woord: ${w}`,a);
  add("Lezen en schrijven","Welke zin begint met een hoofdletter?",["De kat slaapt.","de kat slaapt."]);
  for(let k=0;k<3;k++){const plus=r()>.5,a=n(r,plus?2:6,plus?7:12),b=plus?2:3;add("Vraagstukken",plus?`Mila heeft ${a} appels en krijgt er ${b}. Hoeveel heeft ze?`:`Er zijn ${a} ballen. ${b} rollen weg. Hoeveel blijven er?`,String(plus?a+b:a-b));}
 } else if(grade===2){
  const max=level<=3?100:200;for(let k=0;k<3;k++){const a=n(r,10,max),b=n(r,1,max-a);add("Bewerkingen",`${a} + ${b} =`,String(a+b))}for(let k=0;k<2;k++){const a=n(r,20,max),b=n(r,1,a);add("Bewerkingen",`${a} - ${b} =`,String(a-b))}
  for(let k=0;k<3;k++){const t=n(r,2,level<5?5:10),m=n(r,1,10);add("Tafels",`${t} × ${m} =`,String(t*m))}
  const start=n(r,10,80);add("Getallenkennis",`Zet van klein naar groot: ${start+8}, ${start}, ${start+3}`,`${start}, ${start+3}, ${start+8}`);
  const meters=n(r,1,5);add("Meten",`Hoeveel centimeter is ${meters} meter?`,String(meters*100));
  const plural=pick(r,[["boom","bomen"],["jas","jassen"],["boek","boeken"],["kat","katten"]]);add("Correct schrijven",`Schrijf het meervoud van ${plural[0]}.`,plural[1]);
  for(let k=0;k<4;k++){const groups=n(r,2,6),each=n(r,2,10);add("Vraagstukken",`${groups} doosjes bevatten elk ${each} potloden. Hoeveel potloden zijn dat?`,String(groups*each))}
 } else if(grade===3){
  const max=level<5?1000:5000;for(let k=0;k<3;k++){const a=n(r,100,max),b=n(r,10,max-a);add("Bewerkingen",`${a} + ${b} =`,String(a+b))}for(let k=0;k<2;k++){const a=n(r,100,max),b=n(r,10,a);add("Bewerkingen",`${a} - ${b} =`,String(a-b))}
  for(let k=0;k<2;k++){const a=n(r,2,10),b=n(r,2,12);add("Tafels en delen",`${a} × ${b} =`,String(a*b));add("Tafels en delen",`${a*b} : ${a} =`,String(b))}
  add("Breuken",`Welk deel is de helft van ${n(r,2,20)*2}?`,String(n(r,2,20)));
  const sp=pick(r,[["kat","katten"],["raam","ramen"],["bom","bommen"],["boot","boten"]]);add("Correct schrijven",`Schrijf het meervoud van ${sp[0]}.`,sp[1]);
  add("Tekstbegrip","Lina neemt een paraplu mee omdat het regent. Waarom neemt Lina een paraplu mee?",["Omdat het regent.","het regent"]);
  for(let k=0;k<4;k++){const total=n(r,5,15)*10,used=n(r,1,total-1);add("Vraagstukken",`Een boek heeft ${total} bladzijden. Noor leest er ${used}. Hoeveel blijven er?`,String(total-used))}
 } else {
  const max=level<4?10000:100000;for(let k=0;k<3;k++){const a=n(r,1000,max),b=n(r,100,max-a);add("Getallen en bewerkingen",`${a} + ${b} =`,String(a+b))}for(let k=0;k<2;k++){const a=n(r,1000,max),b=n(r,100,a);add("Getallen en bewerkingen",`${a} - ${b} =`,String(a-b))}
  const den=pick(r,[2,4,5,10]);const whole=n(r,2,20)*den;add("Breuken",`Bereken 1/${den} van ${whole}.`,String(whole/den));
  const price=n(r,4,20)*10,percent=pick(r,[10,20,25,50]);add("Procenten",`Een artikel kost €${price}. Je krijgt ${percent}% korting. Wat betaal je?`,String(price*(1-percent/100)));
  const kilometers=n(r,2,9);add("Meten",`Hoeveel meter is ${kilometers} kilometer?`,String(kilometers*1000));
  const verb=pick(r,[["worden","wordt"],["gebeuren","gebeurt"],["antwoorden","antwoordt"]]);add("Werkwoordspelling",`Vul correct aan: hij … (${verb[0]})`,verb[1]);
  add("Tekstbegrip","De training werd afgelast door de hevige regen. Wat was de oorzaak?",["De hevige regen.","hevige regen","de regen"]);
  for(let k=0;k<5;k++){const total=n(r,8,30)*4,part=pick(r,[2,4]);add("Vraagstukken",`${part===4?"Drie vierde":"De helft"} van ${total} leerlingen neemt deel. Hoeveel leerlingen zijn dat?`,String(part===4?total*3/4:total/2))}
 }
 return shuffle(r,out).slice(0,15);
}
