"""Compatibility entry point; always replace HP from the latest three exports."""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name('replace-hp-latest-20261021.py')), run_name='__main__')
