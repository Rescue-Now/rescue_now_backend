## Folosit pentru deno deploy, e bine dupa cum a zis Anthonel prima data

Se poate da manage de pe [proiectu de deno deploy](https://dash.deno.com/projects/rescue-now/) si se vede [aici](http://rescue-now.deno.dev/) API-ul cum ruleaza.

e definit in [colectia asta de postman](https://www.postman.com/rescuenow-1282/workspace/team-workspace/collection/39209159-711ca9cc-3e6d-4aa9-bfd6-52c0e5472432?action=share&creator=39209159)

### Ca sa rulati local, inainte sa dati deploy ca va e mai usor
va duceti in ce directory vreti sa aveti repou si dati

```bash
 git clone https://github.com/Rescue-Now/rescue_now_backend.git
 cd rescue_now_backend
 curl -fsSL https://deno.land/install.sh | sh

 #asta o sa se schimbe lmao 
 deno install --entrypoint main.ts

 #ca sa dati watch la proiect
 deno task run
```

si daca sunteti cu vscode instalati [extensia default de la deno](vscode:extension/denoland.vscode-deno)

[aici postmanu](https://www.postman.com/rescuenow-1282/workspace/team-workspace/collection/39209159-c9963df0-c1c0-4931-8a0b-0a06a851378c?action=share&creator=39209159) pentru requesturi locale

[si asta repo de front-end](https://github.com/Rescue-Now/rescue_now) data te-ai pierdut cumva
