// Local seats for the shared-screen quiz. Scores live only for the current board.
window.createQuizPlayers = function ({ bar, votes, canConfigure }) {
    const defaults = [['A','S'], ['J','K'], ['Z','X'], ['N','M'], ['Q','W'], ['O','P']];
    const makeSeat = i => ({name: `Spelare ${i+1}`, score: 0,
        left: `Key${defaults[i][0]}`, right: `Key${defaults[i][1]}`,
        leftLabel: defaults[i][0], rightLabel: defaults[i][1]});
    let seats = [makeSeat(0)], current = 0, draft = [], capture = null;
    const node = (tag, text) => Object.assign(document.createElement(tag), {textContent: text || ''});
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
    const help = node('p','Välj två olika tangenter per spelare. Den första buzzrar och betyder ja, den andra betyder nej. Ni kan också trycka på skärmen.');
    const save = button('Klar', saveSetup), cancel = button('Avbryt', () => dlg.close());
    dlg.append(title, countLabel, help, rows, message, save, cancel);
    bar.append(setup, scoreList, dlg);
    count.addEventListener('change', () => { capture=null; message.textContent=''; renderRows(); });
    dlg.addEventListener('close', () => { capture=null; });
    function refresh() {
        setup.disabled = !canConfigure();
        scoreList.replaceChildren(...seats.map((s,i) => {
            const pill=node('span',`${i===current?'▶ ':''}${s.name}: ${s.score}`);
            if (i===current) {pill.className='qp-active'; pill.setAttribute('aria-label',`${s.name} har turen, ${s.score} poäng`);}
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
            rows.append(row);
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
        getSeats:()=>seats.map(s=>({...s})),addAt,add(delta){addAt(current,delta);},
        rotate(){current=(current+1)%seats.length;refresh();},resetScores(){seats.forEach(s=>s.score=0);current=0;refresh();},
        finishRapid(perfect){perfect.forEach((yes,i)=>{if(yes)addAt(i,50);});},closeVote(){votes.hidden=true;},refresh,handleKey
    };
};
