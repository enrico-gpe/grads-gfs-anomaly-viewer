'reinit'

* 1. Apertura dei file dati
'open gfs.ctl'
'sdfopen hgt.day.ltm.1981-2010.nc'

* 2. Definizione della palette per le anomalie
'set rgb 21 0 0 130'
'set rgb 22 0 50 200'
'set rgb 23 0 100 255'
'set rgb 24 70 150 255'
'set rgb 25 150 200 255'
'set rgb 26 245 245 245'
'set rgb 27 255 210 160'
'set rgb 28 255 140 60'
'set rgb 29 255 50 0'
'set rgb 30 170 0 0'
'set rgb 31 100 0 0'

* 3. Configurazione geografica iniziale
'set dfile 1'
'set lon -15 45'
'set lat 35 70'
'set lev 500'
'set timelab off'

* 4. Calcolo della climatologia
'define clim = lterp(hgt.2(t=185), hgt500mb)'

t_gfs = 1
esegui = 1

'q file 1'
linea_info = sublin(result, 5)
max_t = subwrd(linea_info, 12)

while (esegui)
  'clear'

* --- QUADRANTE SINISTRO: ASSOLUTO ---
  'set vpage 0 5.5 0 7.5'
  'set parea 0.6 5.2 1.0 6.8'
  'set t 't_gfs
* Disabilito le etichette per evitare sovrapposizioni
  'set xlabs off'
  'set ylabs off'

  'set gxout shaded'
  'set clevs'
  'set rbcols'
  'display hgt500mb'
  'cbarn 0.5 0 2.9 0.4 -e 0'

  'set string 1 c 5 0'
  'set strsiz 0.10'
  'draw string 1.0 0.15 5400'
  'draw string 2.4 0.15 5550'
  'draw string 3.8 0.15 5700'
  'draw string 5.2 0.15 5850'

  'set map 1 1 4'
  'draw map'
  'set gxout contour'
  'set grid off'
  'set ccolor 1'
  'set cthick 5'
  'set cint 40'
  'set clab on'
  'display hgt500mb'
  'draw string 2.9 6.8 500 hPa Geopotential Height'

* --- QUADRANTE DESTRO: ANOMALIE ---
  'set vpage 5.5 11 0 7.5'
  'set parea 0.6 5.2 1.0 6.8'
  'set t 't_gfs
  'set xlabs off'
  'set ylabs off'

  'set gxout shaded'
  'set clevs -120 -90 -60 -30 -10 10 30 60 90 120'
  'set rbcols 21 22 23 24 25 26 27 28 29 30 31'
  'display hgt500mb - clim(t=1)'
  'cbarn 0.5 0 2.9 0.4 -e 0'

  'set string 1 c 5 0'
  'set strsiz 0.10'
  'draw string 1.0 0.15 -90'
  'draw string 3.1 0.15 0'
  'draw string 5.2 0.15 +90'

  'set map 1 1 4'
  'draw map'
  'set gxout contour'
  'set grid off'
  'set ccolor 1'
  'set cthick 5'
  'set cint 40'
  'set clab on'
  'display hgt500mb'
  'draw string 2.9 6.8 500 hPa Climatological Anomaly'

* --- TITOLI E CONTROLLI ---
  'set vpage 0 11 0 8.5'
  'q time'
  data_previsione = subwrd(result, 3)
  'set string 1 c 6 0'
  'set strsiz 0.16'
  'draw string 5.5 8.1 GFS Europe Diagnostics - Step 't_gfs
  'set string 1 c 4 0'
  'set strsiz 0.11'
  'draw string 5.5 7.7 Valid: 'data_previsione
  'set strsiz 0.09'
  'draw string 5.5 7.4 [ CLICK SINISTRO = +1 ] [ CLICK DESTRO = -1 ] [ ROTELLINA = ESCI ]'

* Gestione mouse
  'q pos'
  click_res = result
  parola1 = subwrd(click_res, 1)
  if (parola1 = 'Position'); bottone = subwrd(click_res, 5); else; bottone = subwrd(click_res, 3); endif
  
  if (bottone = 1); t_gfs = t_gfs + 1; endif
  if (bottone = 3); t_gfs = t_gfs - 1; endif
  if (bottone = 2); esegui = 0; endif

  if (t_gfs < 1); t_gfs = 1; endif
  if (t_gfs > max_t); t_gfs = max_t; endif
endwhile

'clear'
say 'Player combinato chiuso.'