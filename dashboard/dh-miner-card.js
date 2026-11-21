/* Optional D.H. Miner dashboard card. No calls or writes to miner controls. */
(() => {
"use strict";
const MAX = 5;
const THEMES = ["midnight", "graphite", "clean"];
const LOGO_MODES = ["satoshi", "dh", "none"];
const SATOSHI_IMAGE = "/dh-miner/satoshi.png";
const CSS = [
":host{display:block}",
".shell{--bg:#112532;--fg:#eef7f8;--soft:#92b4bc;--accent:#4cdec7;--line:rgba(150,190,200,.22);background:var(--bg);color:var(--fg);border-radius:18px;border:1px solid var(--line);overflow:hidden;font-family:var(--primary-font-family,Arial,sans-serif)}",
".shell.graphite{--bg:#26292e;--fg:#fbfbfc;--soft:#aaaeb5;--accent:#ffbb71;--line:#454d58}",
".shell.clean{--bg:#fff;--fg:#1e303a;--soft:#647781;--accent:#119e9e;--line:#e1e9ed}",
".header{display:flex;gap:13px;align-items:center;padding:20px 20px 17px;border-bottom:1px solid var(--line)}",
".logo{border-radius:12px;display:grid;place-items:center;width:46px;height:46px;flex-shrink:0;background:linear-gradient(140deg,#0d3b48,#156879);color:#fff;border:2px solid var(--accent);font-weight:900;letter-spacing:-1px}",
".brand-image{width:68px;height:68px;object-fit:contain;flex-shrink:0;border-radius:11px}.brand-dh{width:68px;height:68px;display:grid;place-items:center;flex-shrink:0;font-weight:900;font-size:24px;letter-spacing:-2px;color:var(--accent);border:2px solid var(--accent);border-radius:12px}",
".headline{flex:1;min-width:0}.title{font-weight:750;font-size:19px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:2px;margin-top:5px;color:var(--soft)}",
".live{font-size:10px;color:var(--accent);border:1px solid var(--accent);border-radius:12px;padding:5px 8px}",
".list{padding:7px 18px 10px}.metric{min-height:46px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--line)}.metric:last-child{border-bottom:0}",
".dot{height:8px;width:8px;border-radius:50%;background:var(--accent);flex-shrink:0}.dot.offline{background:#eb806c}",
".label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}.value{font-weight:750;font-variant-numeric:tabular-nums;white-space:nowrap;max-width:45%;overflow:hidden;text-overflow:ellipsis;font-size:15px}",
".empty{padding:29px 12px;color:var(--soft);text-align:center;font-size:13px;line-height:1.5}",
".footer{border-top:1px solid var(--line);display:flex;justify-content:space-between;color:var(--soft);font-size:11px;padding:11px 20px}"
].join("");
function node(tag, cls, content) {
  const n=document.createElement(tag);
  if(cls)n.className=cls;
  if(content !== undefined)n.textContent=String(content);
  return n;
}
class DHMinerCard extends HTMLElement {
  static getStubConfig() {
    return {type:"custom:dh-miner-card",title:"Miner-Steuerung",theme:"midnight",logo_mode:"satoshi",entities:[]};
  }
  static getConfigElement(){return document.createElement("dh-miner-card-editor");}
  setConfig(config){
    if(!config || (config.entities && !Array.isArray(config.entities)))throw Error("entities muss eine Liste sein");
    this._config = {
      title: typeof config.title==="string" ? config.title : "Miner-Steuerung",
      theme: THEMES.includes(config.theme) ? config.theme : "midnight",
      logo_mode: LOGO_MODES.includes(config.logo_mode) ? config.logo_mode : "satoshi",
      entities: (config.entities || []).filter(x => typeof x==="string" && x.length).slice(0,MAX)
    };
    this._draw();
  }
  set hass(hass){this._hass=hass;this._draw();}
  getCardSize(){return 3;}
  _draw(){
    if(!this._config)return;
    const shadow=this.shadowRoot || this.attachShadow({mode:"open"});
    shadow.replaceChildren();
    const style=node("style",null,CSS);shadow.appendChild(style);
    const shell=node("ha-card","shell "+this._config.theme);
    const head=node("div","header");
    const logo=node("div","logo","DH");
    const heading=node("div","headline");
    heading.append(node("div","title",this._config.title),node("div","eyebrow","MINER DASHBOARD"));
    head.append(logo,heading,node("div","live","LIVE"));
    if(this._config.logo_mode==="satoshi"){
      const artwork=node("img","brand-image");
      artwork.src=SATOSHI_IMAGE;artwork.alt="Satoshi-Symbol";artwork.loading="eager";head.appendChild(artwork);
    }else if(this._config.logo_mode==="dh"){
      head.appendChild(node("div","brand-dh","DH"));
    }
    shell.appendChild(head);
    const list=node("div","list");
    if(!this._config.entities.length){
      list.appendChild(node("div","empty","Bis zu fünf Sensoren in den Karteneinstellungen auswählen – leere Plätze bleiben unsichtbar."));
    }
    for(const id of this._config.entities){
      const state=this._hass && this._hass.states && this._hass.states[id];
      const offline=!state || state.state==="unavailable" || state.state==="unknown";
      const row=node("div","metric");
      row.appendChild(node("span","dot"+(offline?" offline":"")));
      row.appendChild(node("span","label",state && state.attributes && state.attributes.friendly_name || id));
      let text="—";
      if(!offline){
        const unit=state.attributes && state.attributes.unit_of_measurement;
        text=state.state+(unit?" "+unit:"");
      }
      row.appendChild(node("span","value",text));
      list.appendChild(row);
    }
    shell.appendChild(list);
    const footer=node("div","footer");
    footer.append(node("span",null,"D.H. · Home Assistant"),node("span",null,this._config.entities.length+" / 5 Werte"));
    shell.appendChild(footer);shadow.appendChild(shell);
  }
}
class DHMinerEditor extends HTMLElement {
  setConfig(config) {
    this._config=Object.assign({},config);
    this._slots=Array.from({length:5},(_,i)=>(config.entities || [])[i] || "");
    this._draw();
  }
  set hass(hass) {
    this._hass=hass;
    if(this.shadowRoot)this.shadowRoot.querySelectorAll("ha-entity-picker").forEach(p=>p.hass=hass);
  }
  _changed(){
    this._config.entities=this._slots.filter(Boolean).slice(0,MAX);
    this.dispatchEvent(new CustomEvent("config-changed",{bubbles:true,composed:true,detail:{config:Object.assign({},this._config)}}));
  }
  _draw(){
    if(!this._config)return;
    const root=this.shadowRoot||this.attachShadow({mode:"open"});root.replaceChildren();
    root.appendChild(node("style",null,".editor{display:grid;gap:11px;padding:8px 2px;font-family:var(--primary-font-family)}input,select{padding:11px;border:1px solid var(--divider-color,#aaa);border-radius:8px;background:var(--card-background-color);color:var(--primary-text-color)}.row{display:grid;gap:4px}.row label{font-size:12px;font-weight:700}ha-entity-picker{width:100%}.hint{font-size:12px;opacity:.7;line-height:1.5}"));
    const content=node("div","editor");
    const name=node("input");name.value=this._config.title||"Miner-Steuerung";name.placeholder="Titel";
    name.addEventListener("change",()=>{this._config.title=name.value;this._changed();});content.appendChild(name);
    const theme=node("select");
    for(const [key,label] of [["midnight","Midnight – Petrol"],["graphite","Graphite – Anthrazit"],["clean","Clean – Hell"]]){
      const o=node("option",null,label);o.value=key;theme.appendChild(o);
    }
    theme.value=this._config.theme||"midnight";
    theme.addEventListener("change",()=>{this._config.theme=theme.value;this._changed();});content.appendChild(theme);
    const logomode=node("select");
    for(const [key,label] of [["satoshi","Satoshi-Symbol (oben rechts)"],["dh","D.H.-Logo"],["none","Kein großes Logo"]]){
      const o=node("option",null,label);o.value=key;logomode.appendChild(o);
    }
    logomode.value=this._config.logo_mode||"satoshi";
    logomode.addEventListener("change",()=>{this._config.logo_mode=logomode.value;this._changed();});content.appendChild(logomode);
    for(let i=0;i<5;i++){
      const field=node("div","row");field.appendChild(node("label",null,"Wert "+(i+1)+" (optional)"));
      const picker=node("ha-entity-picker");picker.hass=this._hass;picker.value=this._slots[i];
      picker.addEventListener("value-changed",e=>{this._slots[i]=e.detail && e.detail.value || "";this._changed();});
      field.appendChild(picker);content.appendChild(field);
    }
    content.appendChild(node("div","hint","Jeden Wert aus Home Assistant wählen. Nur vorhandene Zustände anzeigen; diese Karte steuert den Miner nicht."));
    root.appendChild(content);
  }
}
if(!customElements.get("dh-miner-card"))customElements.define("dh-miner-card",DHMinerCard);
if(!customElements.get("dh-miner-card-editor"))customElements.define("dh-miner-card-editor",DHMinerEditor);
window.customCards=window.customCards||[];
if(!window.customCards.some(c=>c.type==="dh-miner-card"))window.customCards.push({type:"dh-miner-card",name:"D.H. Miner-Übersicht",description:"Bis zu fünf Sensoren, drei Designs und frei wählbares Logo."});
})();
