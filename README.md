## Folosit pentru deno deploy, e bine dupa cum a zis Anthonel prima data
practic pe [deno deploy](https://deno.com/deploy) (pe care am zis ca-l folosim in loc de firebase simcer si-l configurez acm ca se integreaza mult mai usor cu deno si e gratis si trlala) 
iti da direct deploy din commituri pe github deci mdea, ar cam trebui repo separat si ajuta chestia asta si de cum ne organizam cu updateurile

va duceti in ce directory vreti sa aveti repou si dati

```bash
 git clone https://github.com/Rescue-Now/rescue_now_backend.git
 cd rescue_now_backend
 curl -fsSL https://deno.land/install.sh | sh

 #asta o sa se schimbe lmao 
 deno install --entrypoint main.ts

 #ca sa dati watch la proiect
 deno task dev
```

si daca sunteti cu vscode instalati [extensia default de la deno](vscode:extension/denoland.vscode-deno)