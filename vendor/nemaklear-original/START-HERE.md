# NemaKlear · wiki component delivery

Delivered 2026-10-17. A snapshot of the current local web app with an embedding adapter.

## Package contents

- `app/`: the complete web app, Python computation service, frozen model and data, figures and tests.
- `wiki/embed.html`: a copyable iframe embedding example with automatic height.
- `MANIFEST-SHA256.json`: checksums of the files in this package.

The default sample is **Mi 120 + Ce 80**, computed automatically. The interface opens in English; the header can switch to Chinese and remembers the choice. The two color channels, predicted density, risk class and Eco report stay linked.

## 1. Run on a team member's computer

Use Python 3.14 (the verified environment) and go to the `app` directory:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -B server.py --port 8765
```

Open http://127.0.0.1:8765/ in a browser. On Windows, replace `.venv/bin/python` with `.venv\Scripts\python`.
On a Mac, after installing the dependencies, you can also double-click `app/start.command`. Press Control+C in the terminal to stop.

## 2. Preview the component

Keep the computation service running and open another terminal in the package root:

```sh
python3 -m http.server 8767 --bind 127.0.0.1 --directory wiki
```

Open http://127.0.0.1:8767/embed.html. Open the example over HTTP, because automatic height messaging needs an explicit page origin.

## 3. Connect to the public wiki

This is a **web app plus a Python computation service**. A public wiki needs an always-on HTTPS model service; static wiki hosting cannot run Python.

1. Deploy `app/` to a server that supports Python. Create a virtual environment there and install the requirements; keep `server.py` listening on 127.0.0.1:8765 behind an HTTPS reverse proxy. This is a demo service and can run as a single process; reports are kept in memory and are recomputed after a restart.
2. Use the root path of a dedicated domain, for example `https://YOUR-MODEL-HOST/`. Front-end assets and the API use absolute paths such as `/api/…` and `/style.css`, so mounting under a subpath needs extra changes.
3. Change the iframe address in `wiki/embed.html` to `https://YOUR-MODEL-HOST/?embed=1`, and put the iframe, styles and script into a wiki component. In React or Vue, add the event listener in the mount lifecycle and remove it on unmount.
4. Make sure the wiki's Content Security Policy allows this iframe origin and the model service allows embedding from the wiki domain; an HTTPS wiki needs an HTTPS model address. Check computation, language switching, downloads and height updates in a browser.

`?embed=1` simplifies the outer header, keeps the language switch and hides the duplicate banner and footer. Inside the iframe the front end and API share an origin, so no cross-origin API needs to be opened for the wiki. Height messages check the sending window and origin and read no wiki page data. Without the auto-height script, a fixed-height scrolling iframe still works.

## Model and figure versions

Interactive computation: ODE r04 / dual-channel r01. The bottom of the page shows the user-specified **v7 (ODE r07 / dual-channel r04) static research figures**, labeled with their version; they are independent of the interactive computation. This delivery keeps that arrangement.

Calibration data are simulated, and the risk classes use the Spanish greenhouse tomato example. The default sample's prediction can exceed the 0–120 calibrated density range; the page keeps the conditional-simulation notice. Manual readings go straight into the dual-channel regression, and the ODE plot is never presented as a trajectory inferred from readings.

Deployment status: this package is for local running and integration; no public service has been deployed.
