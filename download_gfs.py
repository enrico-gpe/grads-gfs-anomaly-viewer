import os
import datetime
import requests
import subprocess
import time

# =======================================================
# 1. CONFIGURAZIONE AREA (Europa Completa)
# =======================================================
LAT_TOP = "70"
LAT_BOTTOM = "35"
LON_LEFT = "-15"
LON_RIGHT = "45"

# =======================================================
# 2. CONFIGURAZIONE TEMPORALE AUTOMATICA
# =======================================================
oggi = datetime.date.today()
date_str = oggi.strftime("%Y%m%d")          
date_greg = oggi.strftime("%d%b%Y").lower()  

print("=======================================================")
print("  GFS SINGLE-FILE DOWNLOADER & MAPPER FOR EUROPE       ")
print("=======================================================")
print(f"Data: {oggi.strftime('%d/%m/%Y')} | Area: Europa Completa")
print("-------------------------------------------------------")

os.makedirs("data", exist_ok=True)
FILE_UNICO = "data/gfs_europe_complete.grb"

# Rimuove il vecchio file unico se esiste per evitare sovrapposizioni
if os.path.exists(FILE_UNICO):
    os.remove(FILE_UNICO)

# =======================================================
# 3. DOWNLOAD E FUSIONE IN UN UNICO FILE
# =======================================================
print(f"Creazione del file unico GRIB2: {FILE_UNICO}")
step_salvati = 0

with open(FILE_UNICO, "wb") as file_destinazione:
    for fhr in range(0, 241, 3):
        file_name = f"gfs.t00z.pgrb2.0p25.f{fhr:03d}"
        
        url = (
            f"https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl?"
            f"file={file_name}&lev_500_mb=on&var_HGT=on&subregion=on&"
            f"leftlon={LON_LEFT}&rightlon={LON_RIGHT}&toplat={LAT_TOP}&bottomlat={LAT_BOTTOM}&"
            f"dir=%2Fgfs.{date_str}%2F00%2Fatmos"
        )
        
        try:
            r = requests.get(url, stream=True, timeout=15)
            if r.status_code == 200:
                contenuto_step = r.content
                if len(contenuto_step) < 15000:
                    print(f" -> Step F{fhr:03d} non integro sul server NOAA. Stop.")
                    break
                
                file_destinazione.write(contenuto_step)
                print(f" -> Step F{fhr:03d} scaricato e unito [OK] ({len(contenuto_step)} bytes)")
                step_salvati += 1
                
                time.sleep(0.2)
            else:
                print(f" -> Step F{fhr:03d} non pronto o non disponibile. Ci fermiamo qui.")
                break
        except Exception as e:
            print(f" -> Errore sullo step F{fhr:03d}: {e}")
            break

print("-------------------------------------------------------")
if step_salvati == 0:
    print("!!! ERRORE: Nessun dato scaricato.")
    exit()

# =======================================================
# 4. GENERAZIONE AUTOMATICA DEL .CTL USANDO G2CTL (La tua procedura)
# =======================================================
print("Generazione di gfs.ctl tramite g2ctl...")

try:
    # Esegue g2ctl direttamente sul file unico appena creato e ne salva l'output in gfs.ctl
    with open("gfs.ctl", "w") as ctl_file:
        subprocess.run(["g2ctl", FILE_UNICO], stdout=ctl_file, check=True)
    
    # Per sicurezza, forziamo il nome della variabile a hgt500mb nello script GrADS per uniformità
    # Leggiamo il file appena creato da g2ctl per controllare la variabile estratti
    with open("gfs.ctl", "r") as f:
        linee = f.readlines()
    
    nuove_linee = []
    for linea in linee:
        # Se g2ctl ha estratto la variabile con nomi come HGT500mb o hgt, la standardizziamo
        if "500_mb" in linea or "HGT" in linea:
            # Sostituiamo la riga della variabile per assicurarci che GrADS legga 'hgt500mb'
            parti = linea.split()
            if len(parti) > 1 and not parti[0].startswith("ENDVARS"):
                linea = linea.replace(parti[0], "hgt500mb")
        nuove_linee.append(linea)
        
    with open("gfs.ctl", "w") as f:
        f.writelines(nuove_linee)

    print("File gfs.ctl generato da g2ctl con successo.")

except Exception as e:
    print(f"!!! Errore durante l'esecuzione di g2ctl: {e} !!!")
    exit()

print("-------------------------------------------------------")

# =======================================================
# 5. MAPPATURA BINARIA CON GRIBMAP (La tua procedura)
# =======================================================
print("Mappatura con gribmap...")
try:
    # Esegue la mappatura sul file unico appena indicizzato
    subprocess.run(["gribmap", "-v", "-i", "gfs.ctl"], check=True)
    print("=======================================================")
    print("               PROCESSO COMPLETATO!                    ")
    print("=======================================================")
    print("Ora lancia pure: grads -blc \"run anomalies_player.gs\"")
    print("=======================================================")
except Exception as e:
    print(f"Errore gribmap: {e}")