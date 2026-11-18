// Local seats for the shared-screen quiz. Scores live only for the current board.
window.createQuizPlayers = function ({ bar, votes, canConfigure }) {
    const defaults = [['A','S'], ['J','K'], ['Z','X'], ['V','B'], ['Q','W'], ['O','P']];
    const avatars = [['moth','Mal'], ['hybrid','Hybrid'], ['moth-block','Blockmal'], ['orbit','Omloppsbana']];
    function avatarImage(id) {
        const img = document.createElement('img');
        img.src = `images/quiz/avatars/${avatars[id][0]}.gif`;
        img.alt = ''; img.className = 'qp-avatar'; img.width = img.height = 32;
        return img;
    }
    const sounds = ['Chimes','Chord','Ding','Notify','Recycle','Ring In','Ring Out','Start','Tada','Balloon','Battery Critical','Battery Low','Critical Stop','Default','Ding','Error','Exclamation','Hardware Fail','Hardware Insert','Hardware Remove','Information Bar','Logoff','Logon','Menu Command','Minimize','Notify','Pop-up Blocked','Print Complete','Recycle','Restore','Ring In','Ring Out','Shutdown','Startup'];
    const sound = node('audio'); sound.hidden = true; sound.preload = 'none'; sound.volume = .55; bar.append(sound);
    function buzz(id) {
        sound.pause(); if (!id) return;
        sound.src = `images/quiz/buzz-sounds/${String(id).padStart(2,'0')}.mp3`;
        sound.play().catch(() => {});
    }
    const makeSeat = i => ({name: `Spelare ${i+1}`, score: 0, buzzSound: i+1, avatar:i % avatars.length,
        left: `Key${defaults[i][0]}`, right: `Key${defaults[i][1]}`,
        leftLabel: defaults[i][0], rightLabel: defaults[i][1]});
    let seats = [makeSeat(0)], current = 0, draft = [], capture = null;
    function node(tag, text) {return Object.assign(document.createElement(tag), {textContent: text || ''});}
    const button = (text, click) => {
        const b = node('button', text); b.type = 'button'; b.addEventListener('click', click); return b;
    };
    const scoreList = node('div'); scoreList.className = 'qp-scores';
    const setup = button('Spelare', openSetup); setup.setAttribute('aria-haspopup', 'dialog');
    const dlg = node('dialog'); dlg.className = 'qp-dialog'; dlg.setAttribute('aria-label', 'Spelarinställningar');
    const title = node('h2','Vilka spelar?');
    const countLabel = node('label','Antal spelare '), count = node('select');
    for (let i=1;i<=6;i++) count.add(new Option(String(i),String(i)));
    countLabel.append(count);
    const rows = node('div'); rows.className='qp-rows';
    const message = node('p'); message.setAttribute('role','status');
    const help = node('p','Välj två olika tangenter per spelare. Första tangenten buzzrar. Båda används för att styra i Zatacka. Efter facit ger spelarnumret poäng.');
    const save = button('Klar', saveSetup), cancel = button('Avbryt', () => dlg.close());
    dlg.append(title, countLabel, help, rows, message, save, cancel);
    bar.append(setup, scoreList, dlg);
    count.addEventListener('change', () => { capture=null; message.textContent=''; renderRows(); });
    dlg.addEventListener('close', () => { capture=null; sound.pause(); });
    function refresh() {
        setup.disabled = !canConfigure();
        scoreList.replaceChildren(...seats.map((s,i) => {
            const pill=node('span',`${i+1}. ${s.name}: ${s.score}`);
            if (i===current) {pill.className='qp-active'; pill.setAttribute('aria-label',`${s.name} har turen, ${s.score} poäng`);}
            pill.prepend(avatarImage(s.avatar));
            return pill;
        }));
    }
    function openSetup() {
        if (!canConfigure()) return;
        draft = defaults.map((_,i) => ({...(seats[i] || makeSeat(i))}));
        count.value=String(seats.length); capture=null; message.textContent=''; renderRows(); dlg.showModal();
    }
    function renderRows() {
        rows.replaceChildren();
        draft.slice(0,Number(count.value)).forEach((s,i) => {
            const row=node('div'); row.className='qp-row';
            const name=node('input'); name.type='text'; name.maxLength=24; name.value=s.name; name.setAttribute('aria-label',`Namn på spelare ${i+1}`);
            name.addEventListener('input',()=>{s.name=name.value;});row.append(name);
            for (const [side,label] of [['left','Buzz / ja'],['right','Nej']]) {
                const b=button(`${label}: ${s[side+'Label']}`, () => {
                    capture={i,side,b,label};message.textContent=`Tryck på tangenten för ${s.name || 'spelaren'}: ${label}.`;
                });
                row.append(b);
            }
            const choices = node('div'); choices.className='qp-avatar-list'; choices.setAttribute('role','group'); choices.setAttribute('aria-label',`Avatar för spelare ${i+1}`);
            avatars.forEach(([, label], id) => {
                const pick = button('', () => {
                    s.avatar = id;
                    Array.from(choices.children).forEach((el,j)=>el.setAttribute('aria-pressed',String(j===id)));
                });
                pick.setAttribute('aria-label',label); pick.title=label;
                pick.setAttribute('aria-pressed',String(s.avatar===id)); pick.append(avatarImage(id)); choices.append(pick);
            });
            row.append(choices);
            const soundRow = node('div'); soundRow.className='qp-sound-row';
            const soundLabel = node('label', 'Buzzerljud '), select = node('select');
            select.setAttribute('aria-label', `Buzzerljud för spelare ${i+1}`);
            select.add(new Option('Tyst','0'));
            sounds.forEach((label,j) => select.add(new Option(`${String(j+1).padStart(2,'0')} · ${label}`,String(j+1))));
            select.value=String(s.buzzSound);
            select.addEventListener('change', () => { s.buzzSound=Number(select.value); buzz(s.buzzSound); });
            soundLabel.append(select); soundRow.append(soundLabel,button('Provlyssna',()=>buzz(s.buzzSound)));
            row.append(soundRow); rows.append(row);
        });
    }
    function handleKey(e) {
        if (!dlg.open) return false;
        // Let the dialog retain ordinary editing, focus traversal and Escape.
        if (!capture || e.key==='Escape' || e.key==='Tab') { if(e.key==='Tab') capture=null; return true; }
        e.preventDefault();
        if (e.repeat) return true;
        if (!e.code || e.key.length!==1 || e.key===' ' || e.altKey || e.ctrlKey || e.metaKey || e.isComposing) {
            message.textContent='Välj en bokstav, siffra eller symbol utan kortkommando.'; return true;
        }
        if(['KeyN','KeyM'].includes(e.code)) {message.textContent='N byter låt och M byter instrument. Välj en annan tangent.';return true;}
        const {i,side,b,label}=capture;
        if(draft.slice(0,Number(count.value)).some((s,j)=>['left','right'].some(k=>!(i===j && side===k) && s[k]===e.code))) {
            message.textContent='Tangenten används redan. Välj en annan.';return true;
        }
        draft[i][side]=e.code; draft[i][side+'Label']=e.key.toLocaleUpperCase('sv-SE');
        b.textContent=`${label}: ${draft[i][side+'Label']}`; message.textContent='Tangenten är vald.'; capture=null; return true;
    }
    function saveSetup() {
        const chosen=draft.slice(0,Number(count.value));
        const keys=chosen.flatMap(s=>[s.left,s.right]);
        if(new Set(keys).size!==keys.length) {message.textContent='Varje tangent får bara användas en gång.';return;}
        seats=chosen.map((s,i)=>({...s,name:s.name.trim() || `Spelare ${i+1}`,score:0}));current=0;dlg.close();refresh();
    }
    votes.hidden=true;refresh();
    function addAt(index, delta) {
        if(seats[index] && Number.isSafeInteger(delta)) {seats[index].score+=delta; refresh();}
    }
    return {
        get count(){return seats.length;},get currentIndex(){return current;},get currentName(){return seats[current].name;},get currentScore(){return seats[current].score;},
        playBuzz(index){if(seats[index]) buzz(seats[index].buzzSound);},getSeats:()=>seats.map(s=>({...s})),addAt,add(delta){addAt(current,delta);},
        rotate(){current=(current+1)%seats.length;refresh();},resetScores(){seats.forEach(s=>s.score=0);current=0;refresh();},
        finishRapid(perfect){perfect.forEach((yes,i)=>{if(yes)addAt(i,50);});},closeVote(){votes.hidden=true;},refresh,handleKey
    };
};
