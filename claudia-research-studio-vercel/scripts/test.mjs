import ts from "typescript";
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
for(const dir of ["lib","types","tests"]){
 mkdirSync(".test-build/"+dir,{recursive:true});
 for(const name of readdirSync(dir).filter(n=>n.endsWith(".ts"))){
 const source=readFileSync(dir+"/"+name,"utf8");
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});
 const output=compiled.outputText.replace(/from (["'])(\.\.?\/[^"']+)\1/g,(_m,q,p)=>"from "+q+p+".js"+q);
 writeFileSync(".test-build/"+dir+"/"+name.replace(/\.ts$/,".js"),output);
 }
}
const files=readdirSync(".test-build/tests").filter(n=>n.endsWith(".test.js")).map(n=>".test-build/tests/"+n);
const result=spawnSync(process.execPath,["--test",...files],{stdio:"inherit"});
process.exit(result.status??1);

