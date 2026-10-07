17:52:37.209 Running build in Washington, D.C., USA (East) – iad1
17:52:37.211 Build machine configuration: 2 cores, 8 GB
17:52:37.314 Cloning github.com/arenavaleinstituto-source/arena-vale (Branch: main, Commit: e1236e3)
17:52:37.315 Skipping build cache, deployment was triggered without cache.
17:52:37.688 Cloning completed: 374.000ms
17:52:38.387 Running "vercel build"
17:52:38.399 Vercel CLI 62.1.0
17:52:38.688 Installing dependencies...
17:53:10.228 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
17:53:10.937 npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
17:53:11.532 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
17:53:11.543 npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
17:53:11.613 npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
17:53:12.121 npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
17:53:12.632 npm warn deprecated glob@10.3.10: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
17:53:13.235 npm warn deprecated tar@7.4.3: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
17:53:13.532 npm warn deprecated recharts@2.15.4: 1.x and 2.x branches are no longer active. Bump to Recharts v3 to receive latest features and bugfixes. See https://github.com/recharts/recharts/wiki/3.0-migration-guide
17:53:13.737 npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
17:53:16.967 npm warn deprecated next@14.2.15: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/security-update-2025-12-11 for more details.
17:53:18.155 
17:53:18.155 added 536 packages in 39s
17:53:18.155 
17:53:18.155 167 packages are looking for funding
17:53:18.156   run `npm fund` for details
17:53:18.156 npm warn install-scripts 3 packages have install scripts not yet covered by allowScripts:
17:53:18.156 npm warn install-scripts   supabase@1.226.4 (postinstall: node scripts/postinstall.js)
17:53:18.157 npm warn install-scripts   unrs-resolver@1.12.2 (postinstall: node postinstall.js)
17:53:18.157 npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
17:53:18.157 npm warn install-scripts
17:53:18.157 npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
17:53:18.210 Detected Next.js version: 14.2.15
17:53:18.220 Running "npm run build"
17:53:18.324 
17:53:18.324 > arena-vale-sports-app@1.0.0 build
17:53:18.324 > next build
17:53:18.324 
17:53:18.957 Attention: Next.js now collects completely anonymous telemetry regarding usage.
17:53:18.957 This information is used to shape Next.js' roadmap and prioritize features.
17:53:18.957 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
17:53:18.958 https://nextjs.org/telemetry
17:53:18.958 
17:53:19.011   ▲ Next.js 14.2.15
17:53:19.011 
17:53:19.029    Creating an optimized production build ...
17:53:24.525 Failed to compile.
17:53:24.526 
17:53:24.528 ./app/page.tsx
17:53:24.528 Error: 
17:53:24.528   x Unexpected token `main`. Expected jsx identifier
17:53:24.528     ,-[/vercel/path0/app/page.tsx:17:1]
17:53:24.528  17 | 
17:53:24.528  18 | export default function PublicPage() {
17:53:24.528  19 |   return (
17:53:24.528  20 |     <main id="topo" className="min-h-screen bg-[#0a1830] text-white">
17:53:24.528     :      ^^^^
17:53:24.528  21 |       {/* Cabeçalho */}
17:53:24.528  22 |       <header className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-6">
17:53:24.528  23 |         <a href="#topo" className="flex items-center gap-4">
17:53:24.528     `----
17:53:24.528 
17:53:24.528 Caused by:
17:53:24.528     Syntax Error
17:53:24.528 
17:53:24.528 Import trace for requested module:
17:53:24.529 ./app/page.tsx
17:53:24.529 
17:53:24.549 
17:53:24.549 > Build failed because of webpack errors
17:53:24.609 Error: Command "npm run build" exited with 1
