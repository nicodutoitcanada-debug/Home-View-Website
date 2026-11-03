/* Home View Solutions | Builder Dashboard Web Push Service Worker.
   Does not cache or modify Unreal streaming, game assets, or buyer data. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
  let data={};
  try { data=event.data?event.data.json():{}; }catch(_){data={body:event.data?.text()||''};}
  const icon=new URL('./dashboard-icon.png',self.registration.scope).href;
  const dashboard=new URL('./dashboard.html',self.registration.scope).href;
  const title=String(data.title||'HOME VIEW | New buyer lead').slice(0,100);
  const body=String(data.body||'A buyer has requested a sales follow-up.').slice(0,240);
  event.waitUntil(self.registration.showNotification(title,{
    body,icon,badge:icon,
    tag:String(data.tag||'hvs-new-lead').slice(0,100),
    renotify:true,
    data:{url:dashboard},
    requireInteraction:false
  }));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=new URL('./dashboard.html',self.registration.scope).href;
  event.waitUntil((async()=>{
    const opened=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of opened){
      if(client.url.startsWith(self.registration.scope)&&'focus' in client){
        if('navigate' in client)await client.navigate(url);
        return client.focus();
      }
    }
    return self.clients.openWindow(url);
  })());
});
