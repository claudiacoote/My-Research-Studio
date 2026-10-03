export const runtime = "nodejs";
export const maxDuration = 180;
import { inputSchema } from "@/lib/schemas";
import { research } from "@/lib/research";
import { OpenAlexError } from "@/lib/openalex";
const active=new Set<string>();
const recent=new Map<string,number>();
export async function POST(request:Request){
  const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return Response.json({error:"Cross-origin requests are not supported."},{status:403});
  const declared=Number(request.headers.get("content-length")||0);if(declared>12000)return Response.json({error:"Request is too large."},{status:413});
  let body;try{const text=await request.text();if(text.length>12000)return Response.json({error:"Request is too large."},{status:413});body=JSON.parse(text);}catch{return Response.json({error:"Provide a valid JSON brief."},{status:400});}
  const parsed=inputSchema.safeParse(body);if(!parsed.success)return Response.json({error:parsed.error.issues[0].message},{status:400});
  const key=process.env.OPENALEX_API_KEY;
  if(process.env.NODE_ENV==="production"&&!key)return Response.json({error:"Research is not configured yet. The site owner must add OPENALEX_API_KEY securely on the server."},{status:503});
  const client=request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()||request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"local";
  if(active.has(client)||Date.now()-(recent.get(client)||0)<5000)return Response.json({error:"Please wait before starting another search."},{status:429});
  if(active.size>=8)return Response.json({error:"The research service is busy. Please try again shortly."},{status:429});
  if(recent.size>500)recent.clear();active.add(client);recent.set(client,Date.now());
  const signal=AbortSignal.any([request.signal,AbortSignal.timeout(180000)]);
  const describe=(e:unknown)=>e instanceof OpenAlexError?e.message:signal.aborted?"The research request timed out or was cancelled. Try a smaller search.":"The research request failed. Please try again.";
  if(!request.headers.get("accept")?.includes("text/event-stream")){
    try{return Response.json(await research(parsed.data,key,()=>{},signal));}catch(e){return Response.json({error:describe(e)},{status:e instanceof OpenAlexError?e.status:502});}finally{active.delete(client);}
  }
  const encoder=new TextEncoder();let ended=false;
  const stream=new ReadableStream({async start(controller){
    const emit=(type:string,data:unknown)=>{if(!ended)controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`));};
    try{const result=await research(parsed.data,key,p=>emit("progress",p),signal);emit("result",result);}catch(e){try{emit("error",{error:describe(e)});}catch{}}
    finally{active.delete(client);if(!ended){ended=true;controller.close();}}
  },cancel(){ended=true;active.delete(client);}});
  return new Response(stream,{headers:{"Content-Type":"text/event-stream","Cache-Control":"no-cache, no-transform","X-Accel-Buffering":"no"}});
}
