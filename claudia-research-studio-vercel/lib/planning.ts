import type { ResearchInput, ResearchQuestion } from "../types/research";
type Seed=[string[],string,string];
const sleep:Seed[]=[
 [["caffeine","coffee"],"How has research examined caffeine timing and sleep?","How Late Is Too Late for Coffee?"],
 [["exercise","physical activity"],"What has research examined about exercise and sleep quality?","A Better Night Starts with Movement?"],
 [["screen","blue light","electronic","smartphone"],"How have researchers investigated screens and sleep?","Screens Before Bed: Questions Worth Asking"],
 [["temperature","thermal","heat"],"What has research examined about bedroom temperature and sleep?","Finding My Sleep Comfort Zone"],
 [["stress","anxiety"],"What relationships between stress and sleep have researchers studied?","When My Mind Won’t Switch Off"],
 [["regularity","consistency","irregular"],"How has research examined sleep regularity?","Beyond Bedtime: The Sleep Consistency Question"],
 [["nap","napping"],"What does research investigate about napping and nighttime sleep?","The Nap Question: A Research-led Guide"],
 [["circadian","chronotype"],"How have researchers examined circadian rhythms and sleep?","Working with My Body Clock"],
 [["alcohol"],"What has research investigated about alcohol and sleep?","The Nightcap Question"],
 [["duration","short sleep"],"What relationships between sleep duration and wellbeing have been studied?","Sleep Duration: Looking Beyond a Magic Number"],
 [["daylight","light exposure"],"How have researchers investigated daytime light and sleep?","Daylight and My Nighttime Routine"],
 [["noise","environment"],"How has research examined noise and sleep?","What Makes a Restful Sleep Environment?"],
];
const sustainability:Seed[]=[
 [["packaging"],"How has research compared sustainable packaging choices?","Beyond the Label: Rethinking Packaging"],
 [["circular","reuse"],"How have researchers investigated circular consumption?","What Does Circular Actually Mean?"],
 [["food waste"],"What has research examined about reducing household food waste?","The Food We Buy but Never Eat"],
 [["carbon","emissions"],"How have researchers assessed consumer carbon footprints?","Understanding the Footprint of Everyday Choices"],
 [["greenwashing","claims"],"How have researchers studied trust in environmental claims?","When Green Claims Earn Trust"],
 [["recycling"],"What has research examined about recycling behaviour?","Why Recycling Is More Than a Bin"],
 [["repair","durability"],"How has research examined product repair and longevity?","The Case for Keeping Things Longer"],
 [["energy","efficiency"],"What has research investigated about household energy use?","Everyday Energy: Questions That Matter"],
];
const education:Seed[]=[
 [["retrieval","testing"],"How has research examined retrieval practice and learning?","Learning by Remembering"],
 [["spacing","spaced"],"What has research investigated about spaced learning?","Why Study Timing Deserves Attention"],
 [["feedback"],"How has research examined feedback in learning?","Feedback That Starts a Conversation"],
 [["motivation","engagement"],"How have researchers investigated student motivation?","What Keeps Learners Coming Back?"],
 [["online","digital"],"What has research examined about digital learning experiences?","Beyond the Online Classroom"],
 [["collaborative","cooperative"],"How have researchers studied learning together?","The Questions Behind Collaborative Learning"],
 [["artificial intelligence","chatgpt"],"How has research examined AI tools in education?","AI in Learning: What to Ask First"],
 [["attention","distraction"],"What has research investigated about distraction and learning?","Learning in an Age of Distraction"],
];
const b2b:Seed[]=[
 [["remote","telework"],"How has research examined remote work and productivity?","What Makes Remote Work Work?"],
 [["communication"],"What has research investigated about team communication?","The Conversations Behind Better Teams"],
 [["wellbeing","burnout"],"How have researchers examined wellbeing at work?","Wellbeing Beyond the Perks"],
 [["leadership"],"How has research studied leadership and employee outcomes?","Leadership Questions Worth Exploring"],
 [["automation","artificial intelligence"],"What has research investigated about automation at work?","Rethinking Work Alongside Automation"],
 [["trust","psychological safety"],"How have researchers studied trust within teams?","The Research Questions Behind Team Trust"],
 [["skills","training"],"What has research examined about workplace learning?","Building Skills for Changing Work"],
 [["meetings","collaboration"],"How has research investigated workplace collaboration?","Making Space for Better Collaboration"],
];
const finance:Seed[]=[
 [["literacy"],"How has research examined financial literacy and decisions?","Understanding Money Decisions"],
 [["saving","savings"],"What has research investigated about saving behaviour?","The Questions Behind Saving Habits"],
 [["risk","perception"],"How have researchers studied financial risk perception?","How We Think About Financial Risk"],
 [["credit","debt"],"What has research examined about consumer credit decisions?","Credit Choices: A Research-led Conversation"],
 [["retirement","pension"],"How have researchers investigated retirement planning?","Thinking Ahead: Retirement Planning Questions"],
 [["wellbeing","stress"],"What has research investigated about financial wellbeing?","Money and Wellbeing: Looking at the Research"],
];
const technology:Seed[]=[
 [["privacy"],"How has research examined technology users’ privacy concerns?","What Users Want to Know About Privacy"],
 [["artificial intelligence","adoption"],"How have researchers investigated AI adoption?","The Questions Behind AI Adoption"],
 [["security","cybersecurity"],"What has research examined about cybersecurity behaviour?","The Human Side of Cybersecurity"],
 [["trust"],"How have researchers examined trust in digital systems?","How Digital Trust Takes Shape"],
 [["accessibility","inclusive"],"What has research investigated about accessible technology?","Designing for More People"],
 [["wellbeing","screen"],"How have researchers examined digital wellbeing?","A More Thoughtful Digital Life"],
];
export function understandBrand(input:ResearchInput):{industry:string;anchor:string;questions:ResearchQuestion[]} {
  const text=input.brief.toLowerCase();let seeds:Seed[],anchor:string,industry=input.industry;
  if(/sleep|mattress|bedtime|recovery/.test(text)){seeds=sleep;anchor="sleep";industry="health";}
  else if(/sustainab|environment|eco-friendly|recycl|carbon|circular/.test(text)||industry==="sustainability"){seeds=sustainability;anchor="sustainability";industry="sustainability";}
  else if(/educat|learn|student|school|teach/.test(text)||industry==="education"){seeds=education;anchor="learning";industry="education";}
  else if(/finance|invest|bank|saving|credit|money/.test(text)||industry==="finance"){seeds=finance;anchor="financial";industry="finance";}
  else if(/b2b|workplace|employee|business|agency|team|remote work/.test(text)||industry==="b2b"){seeds=b2b;anchor="workplace";industry="b2b";}
  else if(/technology|software|cyber|artificial intelligence/.test(text)||industry==="technology"){seeds=technology;anchor="technology";industry="technology";}
  else {const stop=new Set("improving improve my me we our sell brand products content about help helping audience wants practical advice backed science give ideas evidence for the and with interested people company services publish".split(" "));
    const words=[...new Set(text.match(/[a-z][a-z-]{2,}/g)||[])].filter(x=>!stop.has(x)).slice(0,5);anchor=words.slice(0,2).join(" ")||text.slice(0,80);
    const phrases=words.length?words:[anchor];
    seeds=phrases.map(term=>[[term],`What has research examined about ${anchor} and ${term}?`,`${anchor.charAt(0).toUpperCase()+anchor.slice(1)}: research on ${term}`]);}
  const questions=seeds.slice(0,input.ideaCount).map(([terms,question,headline])=>({anchor,terms,question,headline,
    queries:[`${anchor} ${terms[0]}`,`${anchor} AND "${terms[1]||terms[0]}" AND (review OR study)`]}));
  return {industry,anchor,questions};
}
