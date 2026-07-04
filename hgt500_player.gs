'reinit'

* 1. Apri solo il file del modello GFS
'open gfs.ctl'

* Grafica il Geopotenziale Assoluto Shaded (Scala Estiva Riallineata)
  'set gxout shaded'
  'set clevs 540 546 552 558 564 570 576 582 588 594'
  'set rbcols 21  22  23  24  25  26  27  28  29  30  31'
  'display hgt500mb'
  'cbarn'

* 3. Configurazione Geografica (EUROPA COMPLETA)
'set dfile 1'
'set lon -15 45'
'set lat 35 70'
'set lev 500'
'set t 1'

* Rimuove la scritta oraria automatica di GrADS
'set timelab off'

* Proporzioni schermo
'set parea 0.8 10.2 1.2 7.2'

t_gfs = 1
esegui = 1

* Estraggo il massimo dei tempi disponibili dal file ctl
'q file 1'
linea_info = sublin(result, 5)
max_t = subwrd(linea_info, 12)

* 4. INIZIO LOOP INTERFACCIA MOUSE
while (esegui)
  'clear'
  'set t 't_gfs
  
* Recupera la data e ora reale prima di ogni disegno
  'q time'
  data_previsione = subwrd(result, 3)

* Grafica il Geopotenziale Assoluto Shaded (Palette e Livelli Automatici)
  'set gxout shaded'
  
* RESETTA I LIVELLI E I COLORI AUTOMATICI DI GrADS
  'set clevs'
  'set rbcols'
  
  'display hgt500mb'
  'cbarn'
  
* Coste e Contorni del Geopotenziale (Linee Bianche Pulite Automatiche)
  'set map 1 1 5'
  'draw map'
  'set gxout contour'
  'set grid off'
  'set ccolor 1'
  'set cthick 5'
  
* IMPONIAMO SOLO UN PASSO INTELLIGENTE PER I CONTORNI 
* Se noti scritte sovrapposte, metti 40 se sono metri o 4 se sono decametri
  'set cint 40' 
  
  'set clab on'
  'display hgt500mb'  

* Titolo Principale
  'set string 1 c 6 0'
  'set strsiz 0.16'
  'draw string 5.5 8.2 GFS Europe 500 hPa Geopotential Height - Step 't_gfs
  
* Sottotitolo della Data
  'set string 1 c 5 0'
  'set strsiz 0.12'
  'draw string 5.5 7.8 Valid: 'data_previsione
  
* Istruzioni per l utente
  'set string 1 c 4 0'
  'set strsiz 0.09'
  'draw string 5.5 7.4 [ CLICK SINISTRO = AVANTI ]   [ CLICK DESTRO = INDIETRO ]   [ ROTELLINA = ESCI ]'
  
* Ascolto del mouse
  'q pos'
  click_res = result
  
  parola1 = subwrd(click_res, 1)
  if (parola1 = 'Position')
    bottone = subwrd(click_res, 5)
  else
    bottone = subwrd(click_res, 3)
  endif
  
* Logica dei tasti
  if (bottone = 1)
    t_gfs = t_gfs + 1
  endif
  if (bottone = 3)
    t_gfs = t_gfs - 1
  endif
  if (bottone = 2)
    esegui = 0
  endif
  
* Limiti di sicurezza dinamici
  if (t_gfs < 1); t_gfs = 1; endif
  if (t_gfs > max_t); t_gfs = max_t; endif

endwhile

'clear'
say 'Player assoluto chiuso.'