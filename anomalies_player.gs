'reinit'

* 1. Apri i file
'open gfs.ctl'
'sdfopen hgt.day.ltm.1981-2010.nc'

* 2. Palette personalizzata Anomalie (11 Colori calibrati)
'set rgb 21   0   0 130'   
'set rgb 22   0  50 200'  
'set rgb 23   0 100 255'   
'set rgb 24  70 150 255'   
'set rgb 25 150 200 255'  
'set rgb 26 245 245 245' 
'set rgb 27 255 210 160'  
'set rgb 28 255 140  60'   
'set rgb 29 255  50   0'   
'set rgb 30 170   0   0'   
'set rgb 31 100   0   0'   

* 3. Configurazione Geografica (EUROPA COMPLETA)
'set dfile 1'
'set lon -15 45'
'set lat 35 70'
'set lev 500'
'set t 1'

* Rimuove nativamente la scritta oraria automatica di GrADS in basso a destra
'set timelab off'

* Proporzioni schermo
'set parea 0.8 10.2 1.2 7.2'

* Calcolo statico iniziale della Climatologia 
'define clim = lterp(hgt.2(t=185), hgt500mb)'

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
  
* Grafica l Anomalia Shaded
  'set gxout shaded'
  'set clevs -120 -90 -60 -30 -10 10 30 60 90 120'
  'set rbcols 21   22  23  24  25  26  27 28 29 30  31'
  'display hgt500mb - clim(t=1)'
  'cbarn'
  
* Coste e Contorni Geopotenziale
  'set map 1 1 5'
  'draw map'
  'set gxout contour'
  'set grid off'
  'set ccolor 1'
  'set cthick 5'
  'set cint 40'
  'set clab on'
  'display hgt500mb'
  
* Titolo Principale (Variabile alla fine, senza costrutti strani)
  'set string 1 c 6 0'
  'set strsiz 0.16'
  'draw string 5.5 8.2 GFS Europe Forecast Anomalies - Step 't_gfs
  
* Sottotitolo della Data (Variabile alla fine, pulita e lineare)
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
say 'Player chiuso.'
