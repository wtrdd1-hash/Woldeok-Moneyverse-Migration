import { readFileSync,writeFileSync,readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve,dirname,sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../spring-backend/src/main/resources');
const staticRoot=resolve(root,'static');
let changed=0;
for(const family of ['mv43','shared','mv28','mv29','mv30']) {
  for(const entry of readdirSync(resolve(root,'templates',family)).filter(file=>file.endsWith('.html'))) {
    const template=resolve(root,'templates',family,entry),before=readFileSync(template,'utf8');
    const after=before.replace(/((?:src|href)=")(\/assets\/(?:mv39|mv40|mv43)\/[^"?]+)(?:\?[^"]*)?"/g,(_,attribute,path)=>{
      const file=resolve(staticRoot,'.'+path);
      if(!file.startsWith(staticRoot+sep)||!/\.(css|js)$/.test(file))throw new Error('Unexpected native asset path');
      const version=createHash('sha256').update(readFileSync(file)).digest('hex');
      return attribute+path+'?v='+version+'"';
    });
    if(after!==before){writeFileSync(template,after);changed++;}
  }
}
console.log('Updated native template asset versions: '+changed);
