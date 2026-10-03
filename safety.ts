export function safetyFlags(text:string,industry:string):string[] {
  const flags:string[]=[];
  if(industry==="health"||/sleep|health|nutrition|fitness|disease|diagnos|treat|medication|supplement|pregnan|mental health|anxiety|depression|caffeine/i.test(text))flags.push("Research assistant, not professional advice.","Check populations, study design, and limitations. Association does not establish causation.");
  else if(industry==="finance"||/invest|financial|tax|legal|mortgage|credit|pension/i.test(text))flags.push("Research assistant, not professional advice.","Review financial or legal content with a qualified professional before publication.");
  return flags;
}
