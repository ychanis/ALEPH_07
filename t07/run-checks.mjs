import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);const esbuild=createRequire(require.resolve('wrangler/package.json'))('esbuild');mkdirSync('.sites-runtime',{recursive:true});
await esbuild.build({entryPoints:['t07/integration.ts'],outfile:'.sites-runtime/t07-check.mjs',bundle:true,platform:'node',format:'esm',packages:'external',alias:{'@':process.cwd()},plugins:[{name:'test-cloudflare',setup(build){build.onResolve({filter:/^cloudflare:workers$/},()=>({path:'workers',namespace:'test'}));build.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env={get DB(){return globalThis.__testDB}};',loader:'js'}));}}]});await import('../.sites-runtime/t07-check.mjs');
