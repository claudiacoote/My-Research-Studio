import type { ResearchInput, Theme } from "../types/research";
type Seed=[string,string[],string,string];
const sleep:Seed[]=[
 ["Caffeine",["caffeine","coffee"],"How has research examined caffeine timing and sleep?","How Late Is Too Late for Coffee?"],
 ["Exercise",["exercise","physical activity"],"What has research examined about exercise and sleep quality?","A Better Night Starts with Movement?"],
 ["Screen exposure",["screen","blue light","electronic","smartphone"],"How have researchers investigated screens and sleep?","Screens Before Bed: Questions Worth Asking"],
 ["Temperature",["temperature","thermal","heat"],"What has research examined about bedroom temperature and sleep?","Finding My Sleep Comfort Zone"],
 ["Stress",["stress","anxiety"],"What relationships between stress and sleep have researchers studied?","When My Mind Won’t Switch Off"],
 ["Sleep consistency",["regularity","consistency","irregular"],"How has research examined sleep regularity?","Beyond Bedtime: The Sleep Consistency Question"],
 ["Napping",["nap","napping"],"What does research investigate about napping and nighttime sleep?","The Nap Question: A Research-led Guide"],
 ["Circadian rhythm",["circadian","chronotype"],"How have researchers examined circadian rhythms and sleep?","Working with My Body Clock"],
 ["Alcohol",["alcohol"],"What has research investigated about alcohol and sleep?","The Nightcap Question"],
 ["Sleep duration",["duration","short sleep"],"What relationships between sleep duration and wellbeing have been studied?","Sleep Duration: Looking Beyond a Magic Number"],
 ["Light exposure",["daylight","light exposure"],"How have researchers investigated daytime light and sleep?","Daylight and My Nighttime Routine"],
 ["Sleep environment",["noise","environment"],"How has research examined noise and sleep?","What Makes a Restful Sleep Environment?"],
];
const sustainability:Seed[]=[
 ["Packaging",["packaging"],"How has research compared sustainable packaging choices?","Beyond the Label: Rethinking Packaging"],
 ["Circular economy",["circular","reuse"],"How have researchers investigated circular consumption?","What Does Circular Actually Mean?"],
 ["Food waste",["food waste"],"What has research examined about reducing household food waste?","The Food We Buy but Never Eat"],
 ["Carbon footprint",["carbon","emissions"],"How have researchers assessed consumer carbon footprints?","Understanding the Footprint of Everyday Choices"],
 ["Green claims",["greenwashing","claims"],"How have researchers studied trust in environmental claims?","When Green Claims Earn Trust"],
 ["Recycling",["recycling"],"What has research examined about recycling behaviour?","Why Recycling Is More Than a Bin"],
 ["Repair",["repair","durability"],"How has research examined product repair and longevity?","The Case for Keeping Things Longer"],
 ["Energy use",["energy","efficiency"],"What has research investigated about household energy use?","Everyday Energy: Questions That Matter"],
];
const education:Seed[]=[
 ["Retrieval practice",["retrieval","testing"],"How has research examined retrieval practice and learning?","Learning by Remembering"],
 ["Spaced learning",["spacing","spaced"],"What has research investigated about spaced learning?","Why Study Timing Deserves Attention"],
 ["Feedback",["feedback"],"How has research examined feedback in learning?","Feedback That Starts a Conversation"],
 ["Motivation",["motivation","engagement"],"How have researchers investigated student motivation?","What Keeps Learners Coming Back?"],
 ["Digital learning",["online","digital"],"What has research examined about digital learning experiences?","Beyond the Online Classroom"],
 ["Collaborative learning",["collaborative","cooperative"],"How have researchers studied learning together?","The Questions Behind Collaborative Learning"],
 ["AI in education",["artificial intelligence","chatgpt"],"How has research examined AI tools in education?","AI in Learning: What to Ask First"],
 ["Attention",["attention","distraction"],"What has research investigated about distraction and learning?","Learning in an Age of Distraction"],
];
const b2b:Seed[]=[
 ["Remote work",["remote","telework"],"How has research examined remote work and productivity?","What Makes Remote Work Work?"],
 ["Team communication",["communication"],"What has research investigated about team communication?","The Conversations Behind Better Teams"],
 ["Workplace wellbeing",["wellbeing","burnout"],"How have researchers examined wellbeing at work?","Wellbeing Beyond the Perks"],
 ["Leadership",["leadership"],"How has research studied leadership and employee outcomes?","Leadership Questions Worth Exploring"],
 ["Automation",["automation","artificial intelligence"],"What has research investigated about automation at work?","Rethinking Work Alongside Automation"],
 ["Trust",["trust","psychological safety"],"How have researchers studied trust within teams?","The Research Questions Behind Team Trust"],
 ["Skills",["skills","training"],"What has research examined about workplace learning?","Building Skills for Changing Work"],
 ["Meetings",["meetings","collaboration"],"How has research investigated workplace collaboration?","Making Space for Better Collaboration"],
];
const finance:Seed[]=[
 ["Financial literacy",["literacy"],"How has research examined financial literacy and decisions?","Understanding Money Decisions"],
 ["Saving habits",["saving","savings"],"What has research investigated about saving behaviour?","The Questions Behind Saving Habits"],
 ["Risk perception",["risk","perception"],"How have researchers studied financial risk perception?","How We Think About Financial Risk"],
 ["Consumer credit",["credit","debt"],"What has research examined about consumer credit decisions?","Credit Choices: A Research-led Conversation"],
 ["Retirement planning",["retirement","pension"],"How have researchers investigated retirement planning?","Thinking Ahead: Retirement Planning Questions"],
 ["Financial wellbeing",["wellbeing","stress"],"What has research investigated about financial wellbeing?","Money and Wellbeing: Looking at the Research"],
];
const technology:Seed[]=[
 ["Privacy",["privacy"],"How has research examined technology users’ privacy concerns?","What Users Want to Know About Privacy"],
 ["AI adoption",["artificial intelligence","adoption"],"How have researchers investigated AI adoption?","The Questions Behind AI Adoption"],
 ["Cybersecurity",["security","cybersecurity"],"What has research examined about cybersecurity behaviour?","The Human Side of Cybersecurity"],
 ["Digital trust",["trust"],"How have researchers examined trust in digital systems?","How Digital Trust Takes Shape"],
 ["Accessibility",["accessibility","inclusive"],"What has research investigated about accessible technology?","Designing for More People"],
 ["Digital wellbeing",["wellbeing","screen"],"How have researchers examined digital wellbeing?","A More Thoughtful Digital Life"],
];
export function understandBrand(input:ResearchInput):{industry:string;anchor:string;themes:Theme[]} {
  const text=input.brief.toLowerCase();let seeds:Seed[],anchor:string,industry=input.industry;
  if(/sleep|mattress|bedtime|recovery/.test(text)){seeds=sleep;anchor="sleep";industry="health";}
  else if(/sustainab|environment|eco-friendly|recycl|carbon|circular/.test(text)||industry==="sustainability"){seeds=sustainability;anchor="sustainability";industry="sustainability";}
  else if(/educat|learn|student|school|teach/.test(text)||industry==="education"){seeds=education;anchor="learning";industry="education";}
  else if(/finance|invest|bank|saving|credit|money/.test(text)||industry==="finance"){seeds=finance;anchor="financial";industry="finance";}
  else if(/b2b|workplace|employee|business|agency|team|remote work/.test(text)||industry==="b2b"){seeds=b2b;anchor="workplace";industry="b2b";}
  else if(/technology|software|cyber|artificial intelligence/.test(text)||industry==="technology"){seeds=technology;anchor="technology";industry="technology";}
  else {const stop=new Set("improving improve my me we our sell brand products content about help helping audience wants practical advice backed science give ideas evidence for the and with interested people company services publish".split(" "));
    const words=[...new Set(text.match(/[a-z][a-z-]{2,}/g)||[])].filter(x=>!stop.has(x)).slice(0,5);anchor=words.slice(0,2).join(" ")||text.slice(0,80);
    const contexts=["behaviour","adoption","wellbeing","sustainability","accessibility","trust","decision making","outcomes"];
    seeds=contexts.map(c=>[c,[c],`What has research examined about ${anchor} and ${c}?`,`${anchor.charAt(0).toUpperCase()+anchor.slice(1)} and ${c}`]);}
  const themes=seeds.slice(0,input.ideaCount).map(([name,terms,question,headline])=>({name,anchor,terms,question,headline,
    queries:[`${anchor} ${terms[0]}`,`${anchor} AND "${terms[1]||terms[0]}" AND (review OR study)`]}));
  return {industry,anchor,themes};
}
