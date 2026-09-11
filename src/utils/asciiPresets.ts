// DedSec Cyber ASCII Art Presets

export interface AsciiPreset {
  id: string;
  name: string;
  art: string;
}

export const DEDSEC_ASCII_PRESETS: AsciiPreset[] = [
  {
    id: 'dedsec-skull',
    name: 'Caveira DedSec',
    art: `      .---.
     /     \\
    | () () |
     \\  ^  /
      |||||
     '-----'`
  },
  {
    id: 'dedsec-banner',
    name: 'Logo DEDSEC Block',
    art: ` ____  _____ ____  ____  _____ ____ 
|  _ \\| ____|  _ \\/ ___|| ____/ ___|
| | | |  _| | | | \\___ \\|  _|| |    
| |_| | |___| |_| |___) | |__| |___ 
|____/|_____|____/|____/|_____\\____|`
  },
  {
    id: 'ctos-eye',
    name: 'ctOS Vigilância',
    art: `     .---.
    /     \\
|  ( ( o ) )  |
    \\     /
     '---'
[ctOS 2.0 SURVEILLANCE ACTIVE]`
  },
  {
    id: 'zero-day',
    name: 'Zero-Day Exploit',
    art: `[!] ZERO-DAY PAYLOAD LOADED
01000100 01000101 01000100
01010011 01000101 01000011
>>> ROOT ACCESS GRANTED <<<`
  },
  {
    id: 'wrench-mask',
    name: 'Wrench Mask Emojis',
    art: `  [ > _ < ]
 /|  |||  |\\
   DEDSEC SF`
  }
];
