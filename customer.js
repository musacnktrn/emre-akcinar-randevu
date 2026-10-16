// Üreten: codex. Tasarım kaynağı: kullanıcı teslimi; işlev entegrasyonu codex.
window.__eaCreateLogic=function(DCLogic,React){
// Üreten: codex. Claude Design görünümü ile gerçek API arasındaki yardımcılar.
const EA={
 base:()=>String(window.EA_CONFIG?.basePath||'').replace(/\/$/,''),
 route:()=>location.pathname.slice(EA.base().length).replace(/\/$/,'')||'/',
 path:path=>EA.base()+path+(EA.base()&&path!=='/'?'/':''),
 link:path=>location.origin+EA.path(path),
 day:t=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul'}).format(new Date(t*1000)),
 min:t=>{const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(t*1000));return Number(parts.find(p=>p.type==='hour').value)*60+Number(parts.find(p=>p.type==='minute').value);},
 at:(day,min)=>Math.floor(new Date(day+'T'+String(Math.floor(min/60)).padStart(2,'0')+':'+String(min%60).padStart(2,'0')+':00+03:00').getTime()/1000),
 stamp:t=>new Intl.DateTimeFormat('tr-TR',{timeZone:'Europe/Istanbul',dateStyle:'long',timeStyle:'short'}).format(new Date(t*1000)),
 amount:value=>Math.round(Number(String(value).replace(',','.'))*100),
 async api(path,{method='GET',body,key}={}) {
  const response=await fetch((window.EA_CONFIG?.apiOrigin||'')+'/api'+path,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(key?{'Idempotency-Key':key}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const data=await response.json();if(!response.ok)throw Object.assign(new Error(data.error||'İşlem tamamlanamadı.'),{status:response.status});return data;
 },
 labels:{confirmed:'Stüdyo onayladı',completed:'Hizmet tamamlandı',cancelled:'Randevu iptal edildi',rejected:'Stüdyo talebi reddetti',arrived:'Müşteri geldi',no_show:'Müşteri gelmedi',expired:'Talep süresi doldu'},
 history(b,events=[]) {return [{label:b.source==='owner'?'Stüdyo elle ekledi':'Talep oluşturuldu',at:EA.stamp(b.created_at),dot:'#C99A4A'},...events.map(e=>({label:(EA.labels[e.event]||e.event)+(e.reason?' · '+e.reason:''),at:EA.stamp(e.created_at),dot:['cancelled','rejected'].includes(e.event)?'#A63D33':'#3F6B5E'}))];}
};

// Kullanıcının Claude Design tesliminden aktarıldı; aktaran codex. Ham kaynak design/ altında.

class Component extends DCLogic {
  T = {
    DAYS: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
    DS: ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],
    MON: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
    MS: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
  };
  C = { acc: '#3F6B5E', accSoft: '#E3ECE7', ink: '#1F2A2E', ink3: '#5B6467', faint: '#B5B9BA', card: '#FFFDF9', sunk: '#EFE8DE', line: 'rgba(31,42,46,.12)', line2: 'rgba(31,42,46,.22)', err: '#A63D33' };
  SVC = [
    { id: 'kesim', name: 'Saç kesimi', dur: 45, price: 600, icons: ['sac'] },
    { id: 'sakal', name: 'Sakal kesimi', dur: 30, price: 350, icons: ['sakal'] },
    { id: 'kesim-sakal', name: 'Saç + sakal', dur: 60, price: 850, icons: ['sac', 'sakal'] }
  ];

  STAFF = [{ id: 'emre', name: 'Emre Akçınar', short: 'Emre', initial: 'E', photo: 'assets/emre-akcinar.jpg' }, { id: 'cirak', name: 'Çırak', short: 'Çırak', initial: 'Ç', photo: null }];
  TODAY = '2026-10-16'; NOWMIN = 14 * 60 + 20; BUF = 15; LAST = '2026-11-30'; CODE = 'K7M2-Q9P4';
  REASONS = ['Planım değişti', 'Başka bir gün veya saat istiyorum', 'Sağlık durumum', 'Ulaşım sorunu', 'Diğer'];
  state = {
    step: 'hizmet', services: [], staff: null, date: '2026-10-17', slot: null, view: 'liste',
    calOpen: false, calM: 9, calY: 2026, loading: false, retried: false,
    name: '', phone: '', note: '', consent: false, errors: {}, focused: false,
    banner: null, taken: [], sending: false, failed: {}, copied: false,
    track: null, cancelOpen: false, cReason: null, cOther: '', cErr: false,
    icsOpen: false, icsMsg: null, vw: typeof window !== 'undefined' ? window.innerWidth : 390
  };

  componentDidMount() {
    this.onR = () => this.setState({ vw: window.innerWidth });
    this.onK = (e) => { if (e.key === 'Escape') this.setState({ calOpen: false, cancelOpen: false, icsOpen: false }); };
    window.addEventListener('resize', this.onR);
    window.addEventListener('keydown', this.onK);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onR);
    window.removeEventListener('keydown', this.onK);
    [this.lt, this.st, this.bt, this.ct].forEach(clearTimeout);
  }

  pad(n) { return String(n).padStart(2, '0'); }
  key(dt) { return dt.getFullYear() + '-' + this.pad(dt.getMonth() + 1) + '-' + this.pad(dt.getDate()); }
  parse(k) { const a = k.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); }
  addDays(k, n) { const d = this.parse(k); d.setDate(d.getDate() + n); return this.key(d); }
  fmt(m) { return this.pad(Math.floor(m / 60)) + ':' + this.pad(m % 60); }
  range(s, e) { return this.fmt(s) + '–' + this.fmt(e); }
  durLabel(m) { const h = Math.floor(m / 60), r = m % 60; return h ? h + ' sa' + (r ? ' ' + r + ' dk' : '') : r + ' dk'; }
  tl(n) { return n.toLocaleString('tr-TR') + ' TL'; }
  dayTitle(k) { const d = this.parse(k); return this.T.DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + this.T.MON[d.getMonth()] + ' ' + d.getFullYear(); }
  dayShort(k) { const d = this.parse(k); return (k === this.TODAY ? 'Bugün' : this.T.DS[d.getDay()]) + ' ' + d.getDate() + ' ' + this.T.MS[d.getMonth()]; }
  doy(k) { const d = this.parse(k); return Math.round((d - new Date(d.getFullYear(), 0, 1)) / 864e5) + 1; }
  totDur(svcs) { return (svcs || this.state.services).reduce((a, id) => a + this.SVC.find(s => s.id === id).dur, 0); }
  totPrice(svcs) { return (svcs || this.state.services).reduce((a, id) => a + this.SVC.find(s => s.id === id).price, 0); }
  svcNames(svcs) { return (svcs || this.state.services).map(id => this.SVC.find(s => s.id === id).name).join(' + '); }
  staffName(id) { const s = this.STAFF.find(x => x.id === id); return s ? s.name : ''; }

  sched(k, st) {
    const d = this.parse(k);
    if (d.getDay() === 0 || k === '2026-10-29') return null;
    return st === 'cirak' ? { open: 600, close: 1140, breaks: [[840, 900]] } : { open: 540, close: 1140, breaks: [[780, 840]] };
  }
  busy(k, st) {
    const sc = this.sched(k, st); if (!sc) return [];
    const n = this.doy(k), full = k === '2026-10-22' && st === 'emre';
    const starts = st === 'cirak' ? [600, 660, 720, 780, 900, 960, 1020, 1080] : [540, 600, 660, 720, 840, 900, 960, 1020, 1080];
    const out = [];
    starts.forEach((s, i) => {
      if (!(full || ((n * 7 + i * 3 + (st === 'emre' ? 1 : 2)) % 5) < 2)) return;
      const dur = full ? 45 : [30, 45, 45][(n + i) % 3];
      out.push([s, Math.min(s + dur + this.BUF, sc.close)]);
    });
    this.state.taken.filter(t => t.k === k && t.st === st).forEach(t => out.push([t.s, t.e]));
    return out.sort((a, b) => a[0] - b[0]);
  }
  avail(k, st, D) {
    const sc = this.sched(k, st);
    if (!sc) return { closed: true, slots: [], busy: [], sc: null, past: 0 };
    const bz = this.busy(k, st);
    const past = k === this.TODAY ? this.NOWMIN : (k < this.TODAY ? 1e9 : 0);
    const slots = []; let t = sc.open, g = 0;
    while (t + D <= sc.close && g++ < 300) {
      if (t < past) { t += D + this.BUF; continue; }
      const br = sc.breaks.find(b => t < b[1] && t + D > b[0]); if (br) { t = br[1]; continue; }
      const b = bz.find(b => t < b[1] && t + D + this.BUF > b[0]); if (b) { t = b[1]; continue; }
      slots.push({ start: t, end: t + D }); t += D + this.BUF;
    }
    return { closed: false, slots, busy: bz, sc, past };
  }
  merge(list) {
    const out = [];
    list.forEach(b => { const l = out[out.length - 1]; if (l && b[0] <= l[1]) l[1] = Math.max(l[1], b[1]); else out.push([b[0], b[1]]); });
    return out;
  }
  nextOpen(fromK, st, D, inclusive) {
    for (let i = inclusive ? 0 : 1; i < 60; i++) {
      const k = this.addDays(fromK, i); if (k > this.LAST) break;
      const av = this.avail(k, st, D); if (av.slots.length) return { k, s: av.slots[0] };
    }
    return null;
  }

  load() { clearTimeout(this.lt); this.setState({ loading: true }); this.lt = setTimeout(() => this.setState({ loading: false }), 450); }
  top() { try { window.scrollTo({ top: 0 }); } catch (e) {} }
  go(step, extra) { this.setState(Object.assign({ step }, extra || {})); this.top(); }

  toggleSvc(id) { this.setState(s => ({ services: s.services.includes(id) ? s.services.filter(x => x !== id) : [...s.services, id] })); }
  pickStaff(id) { this.setState({ staff: id }); if (this.state.step === 'zaman') this.load(); }
  pickDay(k) { const b = this.state.banner; this.setState({ date: k, calOpen: false, banner: b && b.type === 'taken' ? null : b }); this.load(); }
  digits(p) { let d = String(p).replace(/\D/g, ''); if (d.startsWith('90') && d.length > 10) d = d.slice(2); if (d.startsWith('0')) d = d.slice(1); return d; }
  fmtPhone(v) { const d = this.digits(v).slice(0, 10); return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 8), d.slice(8, 10)].filter(Boolean).join(' '); }
  validate() {
    const e = {};
    if (this.state.name.trim().length < 2) e.name = 'Adınızı ve soyadınızı yazın.';
    const d = this.digits(this.state.phone);
    if (!d.length) e.phone = 'Cep telefonunuzu yazın.';
    else if (d.length !== 10 || d[0] !== '5') e.phone = 'Numara eksik veya hatalı görünüyor. 5XX XXX XX XX biçiminde yazın.';
    return e;
  }
  booking() {
    const D = this.totDur();
    return { date: this.state.date, start: this.state.slot, end: this.state.slot + D, staff: this.state.staff, services: [...this.state.services], dur: D, price: this.totPrice(), consent: this.state.consent };
  }
  newTrack(status, b) {
    const h = [{ label: 'Talep oluşturuldu', at: '16 Ekim 2026, 14:21', dot: '#C99A4A' }];
    if (status === 'confirmed') h.push({ label: 'Stüdyo onayladı', at: '16 Ekim 2026, 14:40', dot: '#2E7048' });
    if (status === 'rejected') h.push({ label: 'Stüdyo talebi onaylayamadı', at: '16 Ekim 2026, 14:40', dot: '#A63D33' });
    if (status === 'expired') h.push({ label: 'Yanıt süresi doldu', at: '16 Ekim 2026, 18:21', dot: '#6B7275' });
    return { status, booking: b || this.booking(), history: h, cancel: null };
  }
  submit() {
    if (this.state.sending) return;
    const e = this.validate();
    if (Object.keys(e).length) { this.setState({ errors: e, banner: { type: 'form', n: Object.keys(e).length } }); this.top(); return; }
    this.setState({ sending: true, errors: {}, banner: null });
    clearTimeout(this.st);
    this.st = setTimeout(() => {
      const map = { 'Saat az önce alındı': 'taken', 'Bağlantı hatası': 'network', 'Tekrar gönderim': 'dup' };
      let o = map[this.props.submitOutcome] || 'ok';
      const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
      if (offline) o = 'network'; else if (this.state.failed[o]) o = 'ok';
      const failed = Object.assign({}, this.state.failed, { [o]: true });
      if (o === 'taken') {
        const D = this.totDur(), s = this.state.slot;
        this.setState({ sending: false, failed, taken: [...this.state.taken, { k: this.state.date, st: this.state.staff, s, e: s + D + this.BUF }], banner: { type: 'taken', label: this.range(s, s + D), at: s }, slot: null, step: 'zaman', view: 'liste' });
        this.top(); this.load(); return;
      }
      if (o === 'network' || o === 'dup') { this.setState({ sending: false, failed, banner: { type: o } }); this.top(); return; }
      this.go('sonuc', { sending: false, failed, banner: null, track: this.newTrack('requested') });
    }, 1400);
  }
  next() {
    const s = this.state;
    if (s.step === 'hizmet') { if (s.services.length && s.staff) { this.go('zaman', { banner: null }); this.load(); } return; }
    if (s.step === 'zaman') { this.go('bilgi', { banner: null }); return; }
    if (s.step === 'bilgi') this.submit();
  }
  back() {
    const to = { zaman: 'hizmet', bilgi: 'zaman', takip: 'sonuc' }[this.state.step]; if (!to) return;
    this.go(to, { banner: null, focused: false });
    if (to === 'zaman') this.load();
  }
  copy() {
    const url = location.origin + location.pathname + '#takip/' + this.CODE;
    try { navigator.clipboard && navigator.clipboard.writeText(url).catch(() => {}); } catch (e) {}
    this.setState({ copied: true }); clearTimeout(this.ct);
    this.ct = setTimeout(() => this.setState({ copied: false }), 2200);
  }
  utc(dateK, m) { const x = m - 180; return dateK.replace(/-/g, '') + 'T' + this.pad(Math.floor(x / 60)) + this.pad(x % 60) + '00Z'; }
  pre() { return this.state.track && this.state.track.status === 'requested' ? 'Onay bekliyor · ' : ''; }
  ics(b) {
    const esc = s => s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;');
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Emre Akcinar Hair Studio//Randevu//TR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      'UID:' + this.CODE + '@emre-akcinar-hair-studio', 'DTSTAMP:20261016T112100Z', 'DTSTART:' + this.utc(b.date, b.start), 'DTEND:' + this.utc(b.date, b.end),
      'SUMMARY:' + esc(this.pre() + 'Emre Akçınar Hair Studio · ' + this.svcNames(b.services)),
      'DESCRIPTION:' + esc('Personel: ' + this.staffName(b.staff) + '. Tek seferlik kayıt; randevu değişirse bu etkinlik güncellenmez.'),
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc('Yarın randevunuz var'), 'TRIGGER:-P1D', 'END:VALARM',
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc('Randevunuza 1 saat kaldı'), 'TRIGGER:-PT1H', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  pickCal(id) {
    const b = this.state.track.booking;
    if (id === 'google') {
      const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(this.pre() + 'Emre Akçınar Hair Studio · ' + this.svcNames(b.services)) +
        '&dates=' + this.utc(b.date, b.start) + '/' + this.utc(b.date, b.end) + '&ctz=Europe/Istanbul&details=' + encodeURIComponent('Personel: ' + this.staffName(b.staff));
      window.open(url, '_blank', 'noopener');
      this.setState({ icsMsg: 'Google Takvim yeni sekmede açıldı. Etkinliği orada kaydedin. Bu bağlantı hatırlatma ayarlayamaz; kaydetmeden önce hatırlatmayı kontrol edin.' });
      return;
    }
    const blob = new Blob([this.ics(b)], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'emre-akcinar-randevu.ics';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    this.setState({ icsMsg: 'Takvim dosyası indirildi. Dosyayı açıp takviminize kaydedin; dosyada 1 gün ve 1 saat önce hatırlatma bulunur.' });
  }
  confirmCancel() {
    const r = this.state.cReason;
    if (!r) { this.setState({ cErr: 'Devam etmek için bir sebep seçin.' }); return; }
    if (r === 'Diğer' && this.state.cOther.trim().length < 3) { this.setState({ cErr: 'Kısa bir açıklama yazın.' }); return; }
    const reason = r === 'Diğer' ? this.state.cOther.trim() : r, at = '16 Ekim 2026, 14:52', tr = this.state.track;
    this.setState({ cancelOpen: false, cErr: false, track: Object.assign({}, tr, { status: 'cancelled', cancel: { reason, at, by: 'Siz (müşteri)' }, history: [...tr.history, { label: 'Siz iptal ettiniz', at, dot: '#A63D33' }] }) });
    this.top();
  }

  renderVals() {
    const s = this.state, p = this.props, C = this.C;
    const frame = p.frame && p.frame !== 'Otomatik' ? p.frame : null;
    const isWide = !frame && s.vw >= 960;
    const D = this.totDur() || 45;
    const st = s.staff || 'emre';
    const av = this.avail(s.date, st, D);
    const slotValid = s.slot != null && av.slots.some(x => x.start === s.slot);
    const sel = slotValid ? s.slot : null;
    const inFlow = ['hizmet', 'zaman', 'bilgi'].includes(s.step);
    const stepNum = { hizmet: 1, zaman: 2, bilgi: 3 }[s.step] || 3;
    const off = 'rgba(31,42,46,.15)';
    const errorActive = p.slotState === 'Bağlantı hatası' && !s.retried;
    const isLoading = (s.loading || p.slotState === 'Yükleniyor') && !errorActive;
    const ready = !isLoading && !errorActive;
    const nextOpen = this.nextOpen(s.date, st, D, false);
    const nextDayLabel = nextOpen ? 'En yakın uygun gün: ' + this.dayShort(nextOpen.k) : 'Yakın tarihte uygun gün yok';
    const anySheet = s.calOpen || s.cancelOpen || s.icsOpen;

    const services = this.SVC.map(x => {
      const on = s.services.includes(x.id);
      return { name: x.name, durLabel: this.durLabel(x.dur), priceLabel: this.tl(x.price), sel: on, toggle: () => this.toggleSvc(x.id),
        ...(() => {
          const fill = on ? C.acc : C.ink, ghost = 'rgba(31,42,46,.38)';
          const h = x.icons.includes('sac'), b = x.icons.includes('sakal');
          return { tileBg: on ? '#D3E2DA' : C.sunk,
            hairFill: h ? fill : 'transparent', hairStroke: h ? fill : ghost, hairDash: h ? 'none' : '2.4 2.4',
            beardFill: b ? fill : 'transparent', beardStroke: b ? fill : ghost, beardDash: b ? 'none' : '2.4 2.4',
            mouth: b ? '#FFFDF9' : C.ink };
        })(),
        border: on ? C.acc : C.line, bg: on ? C.accSoft : C.card, boxBorder: on ? C.acc : '#8C9395', boxBg: on ? C.acc : 'transparent' };
    });
    const staffList = this.STAFF.map(x => {
      const on = s.staff === x.id;
      const n = this.nextOpen(this.TODAY, x.id, D, true);
      return { name: x.name, short: x.short, initial: x.initial, photo: x.photo, hasPhoto: !!x.photo, noPhoto: !x.photo, ring: on ? C.acc : 'transparent', sel: on, pick: () => this.pickStaff(x.id),
        next: n ? 'EN YAKIN · ' + this.dayShort(n.k).toLocaleUpperCase('tr-TR') + ' ' + this.fmt(n.s.start) : 'YAKINDA BOŞ YER YOK',
        border: on ? C.acc : C.line, bg: on ? C.accSoft : C.card, avBg: on ? C.acc : C.sunk, avFg: on ? '#fff' : C.ink,
        segBg: on ? C.card : 'transparent', segFg: on ? C.ink : C.ink3, segSh: on ? '0 1px 4px rgba(31,42,46,.14)' : 'none' };
    });

    const days = [];
    for (let i = 0; i < 14; i++) {
      const k = this.addDays(this.TODAY, i), dt = this.parse(k), a = this.avail(k, st, D);
      const isSel = k === s.date, closed = a.closed, full = !closed && !a.slots.length;
      const status = closed ? 'Kapalı' : full ? 'Dolu' : a.slots.length + ' boş';
      days.push({ num: dt.getDate(), dow: i === 0 ? 'BUGÜN' : this.T.DS[dt.getDay()].toLocaleUpperCase('tr-TR'),
        status: isSel ? '● ' + status : status, sel: isSel, disabled: closed, pick: () => this.pickDay(k),
        aria: this.dayTitle(k) + ', ' + (closed ? 'kapalı' : full ? 'uygun saat yok' : a.slots.length + ' uygun saat'),
        bs: closed ? 'dashed' : 'solid', bc: isSel ? C.acc : (i === 0 ? C.ink : C.line),
        bg: isSel ? C.acc : full ? 'repeating-linear-gradient(135deg,#F3D3CE 0 4px,#FBEAE7 4px 10px)' : closed ? 'transparent' : C.card,
        op: closed ? 0.6 : 1, cur: closed ? 'not-allowed' : 'pointer', c1: isSel ? '#fff' : full ? '#8E2F26' : closed ? '#6B7275' : C.ink,
        c2: isSel ? '#fff' : full ? '#8E2F26' : C.ink3, c3: isSel ? '#fff' : full ? '#8E2F26' : C.ink3, sw: full ? 700 : 400,
        deco: closed ? 'line-through' : 'none' });
      if (full && !isSel) days[days.length - 1].bc = '#C44536';
    }

    const R0 = this.rangeStart ?? 540, R1 = this.rangeEnd ?? 1140, span = R1 - R0;
    const ppm = Math.max(1.3, 46 / D), y = m => Math.round((m - R0) * ppm);
    const blocks = [];
    if (av.sc) {
      const sc = av.sc, pastEnd = Math.min(Math.max(av.past, sc.open), sc.close);
      const add = (kind, a, b, label) => { if (b > a) blocks.push({ kind, a, b, label }); };
      add('closed', R0, sc.open, 'Kapalı'); add('closed', sc.close, R1, 'Kapalı');
      if (av.past > sc.open) add('closed', sc.open, pastEnd, 'Geçmiş saat');
      sc.breaks.forEach(b => add('break', Math.max(b[0], pastEnd), b[1], this.range(b[0], b[1])));
      this.merge(av.busy).forEach(b => add('busy', Math.max(b[0], pastEnd), b[1], 'Dolu'));
      av.slots.forEach(x => add(x.start === sel ? 'sel' : 'slot', x.start, x.end, this.range(x.start, x.end)));
    }
    const barColor = { closed: '#DCD4C7', break: 'rgba(185,133,90,.4)', busy: 'repeating-linear-gradient(135deg,#C44536 0 3px,#F3D3CE 3px 7px)', sel: C.acc };
    const barSegs = blocks.filter(b => b.kind !== 'slot').map(b => ({ l: ((b.a - R0) / span * 100).toFixed(2), w: ((b.b - b.a) / span * 100).toFixed(2), bg: barColor[b.kind] }));
    const blockVals = blocks.map(b => {
      const start = b.a, flat = b.kind === 'closed';
      return { isSlot: b.kind === 'slot', isSel: b.kind === 'sel', isBusy: b.kind === 'busy', isBreak: b.kind === 'break', isClosed: flat,
        top: y(b.a) + (flat ? 0 : 2), h: Math.max(18, y(b.b) - y(b.a) - (flat ? 0 : 4)), label: b.label,
        aria: b.label + (b.kind === 'sel' ? ', seçili' : ', seç'), pick: () => this.setState({ slot: start, banner: null }) };
    });
    const hours = []; for (let h = Math.floor(R0/60); h <= Math.ceil(R1/60); h++) hours.push({ label: this.pad(h) + ':00', top: y(h * 60) });
    const barAria = av.closed ? 'Kapalı gün' : 'Günün akışı: ' + this.merge(av.busy).length + ' dolu aralık, ' + av.slots.length + ' uygun aralık';

    const G = [['Sabah', 0, 720], ['Öğleden sonra', 720, 1020], ['Akşam', 1020, 2000]];
    const groups = G.map(g => {
      const items = av.slots.filter(x => x.start >= g[1] && x.start < g[2]).map(x => {
        const on = x.start === sel;
        return { label: this.range(x.start, x.end), sel: on, mark: on ? '✓ ' : '', aria: this.range(x.start, x.end) + (on ? ', seçili' : ''),
          border: on ? C.acc : C.line2, bg: on ? C.acc : C.card, fg: on ? '#fff' : C.ink, pick: () => this.setState({ slot: x.start, banner: null }) };
      });
      return { name: g[0], upper: g[0].toLocaleUpperCase('tr-TR'), items, count: items.length + ' aralık' };
    }).filter(g => g.items.length);

    const b = s.banner || {};
    const alts = b.type === 'taken' ? av.slots.slice().sort((x, z) => Math.abs(x.start - b.at) - Math.abs(z.start - b.at)).slice(0, 3)
      .sort((x, z) => x.start - z.start).map(x => ({ label: this.range(x.start, x.end), pick: () => this.setState({ slot: x.start, banner: null }) })) : [];

    const cells = [];
    const first = new Date(s.calY, s.calM, 1), lead = (first.getDay() + 6) % 7, nDays = new Date(s.calY, s.calM + 1, 0).getDate();
    for (let i = 0; i < lead; i++) cells.push({ blank: true, real: false });
    for (let d = 1; d <= nDays; d++) {
      const k = this.key(new Date(s.calY, s.calM, d));
      const past = k < this.TODAY, out = k > this.LAST, a = past || out ? null : this.avail(k, st, D);
      const closed = !!(a && a.closed), full = !!(a && !a.closed && !a.slots.length), isSel = k === s.date, today = k === this.TODAY;
      const disabled = past || out || closed;
      const kind = past ? 'geçmiş gün' : out ? 'henüz rezervasyona açık değil' : closed ? 'kapalı' : full ? 'dolu, uygun saat yok' : a.slots.length + ' uygun saat';
      cells.push({ blank: false, real: true, d, disabled, pick: () => this.pickDay(k), cur: today ? 'date' : undefined,
        aria: this.dayTitle(k) + ', ' + kind + (today ? ', bugün' : '') + (isSel ? ', seçili' : ''),
        full: full && !isSel, bs: 'solid', bc: isSel ? C.acc : today ? C.ink : full ? '#C44536' : 'transparent',
        bg: isSel ? C.acc : full ? '#FBEAE7' : 'transparent', fg: isSel ? '#fff' : past || out ? C.faint : closed ? '#6B7275' : full ? '#8E2F26' : C.ink,
        deco: closed ? 'line-through' : 'none', cursor: disabled ? 'default' : 'pointer',
        dot: isSel ? '#fff' : a && a.slots.length ? C.acc : 'transparent', dotB: 'transparent' });
    }
    const prevDisabled = s.calY === 2026 && s.calM <= 9, nextDisabled = s.calY === 2026 && s.calM >= 10;

    const tr = s.track, tb = tr && tr.booking;
    const tk = tb ? { dayTitle: this.dayTitle(tb.date), range: this.range(tb.start, tb.end), svcNames: this.svcNames(tb.services), staffName: this.staffName(tb.staff), dur: this.durLabel(tb.dur), price: this.tl(tb.price) } : {};
    const status = tr ? tr.status : 'requested';
    const ST = Object.assign({ cardOp: 1, deco: 'none' }, {
      requested: { tag: 'ONAY BEKLİYOR', color: '#8A5A0B', border: '#C99A4A', bg: '#FBF1DF', ring: 'dashed', icon: 'M6 2h12M6 22h12M7 2v4l5 6 5-6V2M7 22v-4l5-6 5 6v4', title: 'ONAY BEKLENİYOR', desc: 'Stüdyo talebinizi inceliyor. Onaylanana kadar bu saat kesinleşmiş değildir.' },
      confirmed: { tag: 'ONAYLANDI', color: '#2E7048', border: '#6FA884', bg: '#E4F0E8', ring: 'solid', icon: 'M20 6 9 17l-5-5', title: 'RANDEVUNUZ ONAYLANDI', desc: 'Stüdyo randevunuzu onayladı. Bu saat sizin için ayrıldı.' },
      rejected: { tag: 'REDDEDİLDİ', color: '#A63D33', border: '#D48A82', bg: '#F8E6E2', ring: 'solid', icon: 'M18 6 6 18M6 6l12 12', title: 'TALEP ONAYLANAMADI', desc: 'Stüdyo bu saat için talebinizi onaylayamadı. Başka bir gün veya saat seçebilirsiniz.', cardOp: 0.75 },
      expired: { tag: 'SÜRESİ DOLDU', color: '#5B6467', border: '#8C9395', bg: '#EFE8DE', ring: 'dotted', icon: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0', title: 'TALEBİN SÜRESİ DOLDU', desc: 'Stüdyo talebi zamanında yanıtlayamadı; bu saat sizin için ayrılmadı.', cardOp: 0.75 },
      cancelled: { tag: 'İPTAL EDİLDİ', color: '#A63D33', border: '#D48A82', bg: '#F8E6E2', ring: 'solid', icon: 'M5.6 5.6l12.8 12.8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0', title: 'İPTAL EDİLDİ', desc: 'Bu kayıt silinmedi; geçmişinizde iptal olarak kalır.', cardOp: 0.7, deco: 'line-through' }
    }[status]);
    const canCancel = status === 'requested' || status === 'confirmed';
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const apple = /iPhone|iPad|iPod|Macintosh/.test(ua), android = /Android/.test(ua);
    let opts = [
      { id: 'apple', name: 'iPhone · Apple Takvim', sub: '.ics dosyası · 1 gün ve 1 saat önce hatırlatma içerir' },
      { id: 'google', name: 'Android · Google Takvim', sub: 'Yeni sekmede açılır. Hatırlatmayı kaydederken kendiniz kontrol edin.' },
      { id: 'ics', name: 'Diğer takvimler', sub: 'Outlook ve diğerleri için .ics dosyası indir' }
    ];
    if (android) opts = [opts[1], opts[0], opts[2]];
    const recOn = apple || android;
    const calOpts = opts.map((o, i) => ({ name: o.name, sub: o.sub, rec: i === 0 && recOn, pick: () => this.pickCal(o.id),
      border: i === 0 && recOn ? C.acc : C.line2, bg: i === 0 && recOn ? C.accSoft : C.card }));
    const reasons = this.REASONS.map(r => ({ label: r, sel: s.cReason === r, pick: () => this.setState({ cReason: r, cErr: false }) }));
    const demoStates = [['requested', 'Onay bekliyor'], ['confirmed', 'Onaylandı'], ['rejected', 'Reddedildi'], ['expired', 'Süresi doldu']].map(d => ({
      label: d[1], sel: status === d[0], border: status === d[0] ? C.ink : C.line2, bg: status === d[0] ? C.sunk : 'transparent',
      pick: () => this.setState({ track: this.newTrack(d[0], tb), icsMsg: null }) }));

    const totals = s.services.length ? this.durLabel(this.totDur()) + ' · ' + this.tl(this.totPrice()) : '';
    const when = sel != null ? this.dayShort(s.date) + ' · ' + this.range(sel, sel + D) : '';
    let barLine1 = s.services.length ? this.svcNames() : 'Hizmet seçilmedi', barLine2, ctaLabel, ctaDisabled;
    if (s.step === 'hizmet') { ctaLabel = 'Devam'; ctaDisabled = !(s.services.length && s.staff); barLine2 = !s.services.length ? 'En az bir hizmet seçin' : !s.staff ? totals + ' · personel seçin' : totals + ' · ' + this.staffName(s.staff); }
    else if (s.step === 'zaman') { ctaLabel = 'Devam'; ctaDisabled = sel == null; barLine2 = sel != null ? when + ' · ' + this.staffName(s.staff) : totals + ' · saat aralığı seçin'; }
    else { ctaLabel = s.sending ? 'Gönderiliyor…' : 'Randevu talebi oluştur'; ctaDisabled = s.sending; barLine2 = when + ' · ' + totals; }
    const spinner = s.sending ? React.createElement('span', { 'aria-hidden': true, style: { width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,.45)', borderTopColor: '#fff', display: 'inline-block', animation: 'ea-spin .8s linear infinite' } }) : null;
    const nameErr = s.errors.name || false, phoneErr = s.errors.phone || false;
    const consentFlag = tb ? tb.consent : s.consent;

    return {
      colMax: frame ? frame + 'px' : (isWide ? '1200px' : '100%'), frameBorder: frame ? '1px solid rgba(31,42,46,.15)' : '0',
      canBack: ['zaman', 'bilgi', 'takip'].includes(s.step) && !s.sending, back: () => this.back(),
      showProgress: inFlow, stepNum, progressAria: 'Adım ' + stepNum + ' / 3',
      p1: C.acc, p2: stepNum >= 2 ? C.acc : off, p3: stepNum >= 3 ? C.acc : off,
      gridCols: isWide && inFlow ? 'minmax(0,1fr) 360px' : 'minmax(0,1fr)', gridPad: isWide ? '0 40px' : '0', mainMax: isWide ? (inFlow ? '720px' : '640px') : 'none',
      isHizmet: s.step === 'hizmet', isZaman: s.step === 'zaman', isBilgi: s.step === 'bilgi', isSonuc: s.step === 'sonuc', isTakip: s.step === 'takip',
      services, staffList, days, dayTitle: this.dayTitle(s.date),
      openCal: () => { const d = this.parse(s.date); this.setState({ calOpen: true, calM: d.getMonth(), calY: d.getFullYear() }); },
      bTaken: b.type === 'taken', takenLabel: b.label || '', alts,
      bReset: s.step === 'zaman' && s.slot != null && !slotValid && ready && b.type !== 'taken', resetLabel: s.slot != null ? this.fmt(s.slot) : '',
      showDay: ready && !av.closed, barSegs, barAria,
      countLabel: errorActive ? '' : isLoading ? 'Saatler yükleniyor…' : av.closed ? 'Kapalı gün' : av.slots.length + ' uygun aralık · her biri ' + this.durLabel(D),
      isList: s.view === 'liste', isChart: s.view === 'cizelge', setList: () => this.setState({ view: 'liste' }), setChart: () => this.setState({ view: 'cizelge' }),
      tabListBg: s.view === 'liste' ? C.card : 'transparent', tabChartBg: s.view === 'cizelge' ? C.card : 'transparent',
      tabListSh: s.view === 'liste' ? '0 1px 4px rgba(31,42,46,.14)' : 'none', tabChartSh: s.view === 'cizelge' ? '0 1px 4px rgba(31,42,46,.14)' : 'none',
      isLoading, isError: errorActive, retry: () => { this.setState({ retried: true }); this.load(); },
      isClosed: ready && av.closed, isFull: ready && !av.closed && !av.slots.length,
      fullHint: s.date === this.TODAY ? 'Bugün için kalan saatler dolu veya geçti.' : this.staffName(st) + ' için bu günün tüm aralıkları dolu. Diğer personeli de deneyebilirsiniz.',
      goNextDay: () => { if (nextOpen) this.pickDay(nextOpen.k); }, nextDayLabel,
      showList: ready && av.slots.length > 0 && s.view === 'liste', groups,
      showChart: ready && !av.closed && s.view === 'cizelge', chartH: y(R1), hours, blocks: blockVals,
      staffName: this.staffName(s.staff), svcNames: this.svcNames(), slotLabel: sel != null ? this.range(sel, sel + D) : '—',
      editSvc: () => this.go('hizmet'), editTime: () => { this.go('zaman'); this.load(); },
      totalDurLabel: s.services.length ? 'Toplam ' + this.durLabel(this.totDur()) : 'Toplam —', totalPriceLabel: s.services.length ? this.tl(this.totPrice()) : '—',
      bForm: b.type === 'form', formMsg: 'Talep gönderilmedi: ' + (b.n || 1) + ' alanı kontrol edin.', bNetwork: b.type === 'network', bDup: b.type === 'dup',
      openExisting: () => this.go('takip', { track: this.newTrack('requested'), banner: null }),
      onFormSubmit: (e) => { e.preventDefault(); this.submit(); },
      name: s.name, onName: (e) => this.setState({ name: e.target.value, errors: Object.assign({}, s.errors, { name: undefined }) }),
      phone: s.phone, onPhone: (e) => this.setState({ phone: this.fmtPhone(e.target.value), errors: Object.assign({}, s.errors, { phone: undefined }) }),
      note: s.note, onNote: (e) => this.setState({ note: e.target.value.slice(0, 200) }), noteCount: s.note.length,
      onFocus: () => { clearTimeout(this.bt); this.setState({ focused: true }); },
      onBlur: () => { clearTimeout(this.bt); this.bt = setTimeout(() => this.setState({ focused: false }), 120); },
      consent: s.consent, onConsent: (e) => this.setState({ consent: e.target.checked }), sending: s.sending,
      nameErr, phoneErr, nameInvalid: !!nameErr, phoneInvalid: !!phoneErr, nameBorder: nameErr ? C.err : C.line2, phoneBorder: phoneErr ? C.err : C.line2,
      tk, consentNote: consentFlag ? 'Talebiniz onaylandığında veya değiştiğinde telefon ya da WhatsApp üzerinden bilgilendirileceksiniz.' : 'İletişim izni vermediğiniz için size otomatik mesaj gönderilmeyecek. Durumu bu bağlantıdan takip edebilirsiniz.',
      trackPath: '/takip/' + this.CODE, copy: () => this.copy(), copyLabel: s.copied ? 'Kopyalandı' : 'Kopyala', openTrack: () => this.go('takip'),
      st: ST, isCancelled: status === 'cancelled', cancelInfo: (tr && tr.cancel) || {},
      canAddCal: status === 'confirmed' || status === 'requested', icsPending: status === 'requested', openIcs: () => this.setState({ icsOpen: true, icsMsg: null }),
      showCancelBtn: canCancel && !p.lastMinute, showLastMinute: canCancel && !!p.lastMinute,
      cancelBtnLabel: status === 'requested' ? 'Talebi iptal et' : 'Randevuyu iptal et',
      openCancel: () => this.setState({ cancelOpen: true, cReason: null, cOther: '', cErr: false }),
      canRebook: ['rejected', 'expired', 'cancelled'].includes(status),
      rebook: () => { this.go('zaman', { slot: null, banner: null, failed: {} }); this.load(); },
      history: tr ? tr.history : [], demoStates,
      showAside: isWide && inFlow, svcNamesOr: this.svcNames() || '—', staffNameOr: this.staffName(s.staff) || '—',
      whenOr: sel != null ? this.dayTitle(s.date) + ' · ' + this.range(sel, sel + D) : '—',
      showBar: inFlow && !isWide && !s.focused && !anySheet, barLine1, barLine2,
      cta: () => this.next(), ctaDisabled, ctaLabel, ctaIcon: spinner, ctaOp: ctaDisabled && !s.sending ? 0.4 : 1, ctaCursor: ctaDisabled ? 'not-allowed' : 'pointer',
      calOpen: s.calOpen, closeCal: () => this.setState({ calOpen: false }),
      sheetAlign: isWide ? 'center' : 'flex-end', sheetRadius: isWide ? '20px' : '20px 20px 0 0',
      prevMonth: () => { if (!prevDisabled) this.setState({ calM: s.calM - 1 }); }, nextMonth: () => { if (!nextDisabled) this.setState({ calM: s.calM + 1 }); },
      prevDisabled, nextDisabled, prevOp: prevDisabled ? 0.35 : 1, nextOp: nextDisabled ? 0.35 : 1,
      monthLabel: this.T.MON[s.calM] + ' ' + s.calY, cells, goToday: () => this.pickDay(this.TODAY),
      cancelOpen: s.cancelOpen, closeCancel: () => this.setState({ cancelOpen: false }),
      cancelTarget: tb ? tk.dayTitle + ' · ' + tk.range + ' · ' + tk.staffName : '', reasons,
      otherSel: s.cReason === 'Diğer', cOther: s.cOther, onOther: (e) => this.setState({ cOther: e.target.value, cErr: false }),
      cErr: !!s.cErr, cErrMsg: s.cErr || '', confirmCancel: () => this.confirmCancel(),
      icsOpen: s.icsOpen, closeIcs: () => this.setState({ icsOpen: false }),
      eventSummary: tb ? tk.dayTitle + ' · ' + tk.range + ' · Emre Akçınar Hair Studio' : '', calOpts, icsMsg: s.icsMsg
    };
  }
}

// Üreten: codex. Görsel kararlar teslim edilen Claude Design şablonundan gelir.
class ConnectedComponent extends Component {
 constructor(props){super(props);this.TODAY=EA.day(Date.now()/1000);this.NOWMIN=EA.min(Date.now()/1000);this.LAST=this.addDays(this.TODAY,45);this.SVC=[];this.matrix=new Map();this.state={...this.state,date:this.TODAY,calM:this.parse(this.TODAY).getMonth(),calY:this.parse(this.TODAY).getFullYear(),loading:true};}
 componentDidMount(){super.componentDidMount();this.active=true;this.onHash=()=>this.readLink();window.addEventListener('hashchange',this.onHash);this.boot();this.poll=setInterval(()=>{if(!document.hidden&&this.result)this.refreshTrack().catch(()=>{});},15000);}
 componentWillUnmount(){super.componentWillUnmount();this.active=false;window.removeEventListener('hashchange',this.onHash);clearInterval(this.poll);}
 async boot(){try{const info=await EA.api('/public/info');if(!this.active)return;this.info=info;this.SVC=info.services.map(s=>({id:s.id,name:s.name,dur:s.duration,price:s.price/100,icons:s.id==='sakal'?['sakal']:s.id.includes('sakal')?['sac','sakal']:['sac']}));this.STAFF=info.staff.map(s=>({...s,short:s.id==='emre'?'Emre':s.name,initial:s.name[0],photo:s.id==='emre'?'assets/emre-akcinar.jpg':null}));this.BUF=info.shop.buffer;this.LAST=this.addDays(this.TODAY,info.shop.daysAhead);await this.readLink();await this.load();}catch(error){this.serverError=error.message;this.setState({loading:false,banner:{type:'network'}});}}
 async readLink(){if(EA.route()!=='/manage'||!location.hash)return;const [id,token]=location.hash.slice(1).split('.');if(!id||!token)return;this.result={id,token};try{await this.refreshTrack();this.setState({step:'takip'});}catch(error){this.result=null;this.serverError=error.message;this.setState({step:'hizmet',banner:{type:'network'}});}}
 async refreshTrack(){if(!this.result)return;const result=this.result,b=await EA.api('/public/booking',{method:'POST',body:result});if(this.result!==result)return;const services=JSON.parse(b.services_json);for(const s of services)if(!this.SVC.some(x=>x.id===s.id))this.SVC.push({id:s.id,name:s.name,dur:s.duration,price:s.price/100,icons:['sac']});this.result={...result,...b};const booking={date:EA.day(b.start_at),start:EA.min(b.start_at),end:EA.min(b.end_at),staff:b.staff_id,services:services.map(s=>s.id),dur:(b.end_at-b.start_at)/60,price:b.price/100,consent:!!b.consent};this.setState({track:{status:b.status,booking,history:EA.history(b,b.events),cancel:b.status==='cancelled'?{reason:b.cancellation_reason||'Eski kayıtta sebep yok',at:EA.stamp(b.cancelled_at||b.updated_at),by:b.cancelled_by==='customer'?'Siz (müşteri)':'Stüdyo'}:null},...(this.state.step==='sonuc'&&b.status!=='requested'?{step:'takip'}:{})});}
 signature(){return [...(this.state.services.length?this.state.services:[this.SVC[0]?.id])].filter(Boolean).sort().join(',');}
 async load(){if(!this.SVC.length)return;const signature=this.signature(),seq=this.loadSeq=(this.loadSeq||0)+1;this.setState({loading:true});try{const data=await EA.api('/public/availability?'+new URLSearchParams({from:this.TODAY,days:this.info.shop.daysAhead+1,services:signature}));if(!this.active||seq!==this.loadSeq||signature!==this.signature())return;this.TODAY=EA.day(data.server_time);this.NOWMIN=EA.min(data.server_time);this.matrix=new Map(data.days.map(d=>[d.day+'|'+d.staff_id,d]));this.loadedSignature=signature;const ranges=data.days.flatMap(d=>d.working);this.rangeStart=ranges.length?Math.floor(Math.min(...ranges.map(r=>EA.min(r.start_at)))/60)*60:540;this.rangeEnd=ranges.length?Math.ceil(Math.max(...ranges.map(r=>EA.min(r.end_at)||1440))/60)*60:1200;this.serverError=null;this.setState({loading:false,revision:Date.now()});}catch(error){if(seq===this.loadSeq){this.serverError=error.message;this.setState({loading:false,banner:{type:'network'}});}}}
 avail(day,staff,D){const d=this.loadedSignature===this.signature()?this.matrix.get(day+'|'+staff):null;if(!d)return {closed:false,slots:[],busy:[],sc:null,past:0};return {closed:d.closed,slots:d.slots.map(s=>({start:EA.min(s.start_at),end:EA.min(s.end_at)})),busy:d.busy.map(b=>[EA.min(b.start_at),EA.min(b.end_at)||1440]),sc:d.closed?null:{open:EA.min(d.working[0].start_at),close:EA.min(d.working[0].end_at)||1440,breaks:d.breaks.map(b=>[EA.min(b.start_at),EA.min(b.end_at)||1440])},past:day===this.TODAY?this.NOWMIN:day<this.TODAY?1e9:0};}
 toggleSvc(id){super.toggleSvc(id);this.load();}
 staffName(id){return this.STAFF.find(s=>s.id===id)?.name||'';}
 showConsentError(){this.setState({errors:{...this.state.errors,consent:'Randevu talebini göndermek için iletişim onayını işaretleyin.'}},()=>{requestAnimationFrame(()=>{const field=document.getElementById('ea-consent-field'),checkbox=document.getElementById('ea-consent');if(!field||!checkbox)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;field.scrollIntoView({behavior:reduced?'auto':'smooth',block:'center'});checkbox.focus({preventScroll:true});for(const animation of field.getAnimations())animation.cancel();if(!reduced)field.animate([{transform:'translateX(0)'},{transform:'translateX(-7px)'},{transform:'translateX(7px)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}],{duration:380,easing:'ease-in-out'});});});}
 async submit(){if(this.state.sending)return;if(!this.state.consent){this.showConsentError();return;}const errors=this.validate();if(Object.keys(errors).length){this.setState({errors,banner:{type:'form',n:Object.keys(errors).length}});return;}this.setState({sending:true,errors:{},banner:null});const input={name:this.state.name.trim(),phone:this.digits(this.state.phone),note:this.state.note,staff_id:this.state.staff,services:this.state.services,start_at:EA.at(this.state.date,this.state.slot),consent:this.state.consent};const signature=JSON.stringify(input);if(this.submitSignature!==signature){this.submitKey=crypto.randomUUID();this.submitSignature=signature;}try{this.result=await EA.api('/public/bookings',{method:'POST',body:input,key:this.submitKey});history.replaceState(null,'',EA.path('/manage')+'#'+this.result.id+'.'+this.result.token);await this.refreshTrack();this.go('sonuc',{sending:false});}catch(error){this.serverError=error.message;if(error.status===409){const slot=this.state.slot;this.setState({sending:false,step:'zaman',slot:null,banner:{type:'taken',label:this.range(slot,slot+this.totDur()),at:slot}});await this.load();}else this.setState({sending:false,banner:{type:error.status===400?'form':'network'}});}}
 async copy(){if(!this.result)return;try{await navigator.clipboard.writeText(EA.link('/manage')+'#'+this.result.id+'.'+this.result.token);this.setState({copied:true});clearTimeout(this.ct);this.ct=setTimeout(()=>this.setState({copied:false}),2200);}catch{this.setState({copied:false});}}
 async confirmCancel(){if(this.cancelling)return;const reason=this.state.cReason==='Diğer'?this.state.cOther.trim():this.state.cReason;if(!reason||reason.length<3){this.setState({cErr:'Bir sebep seçin veya kısa bir açıklama yazın.'});return;}this.cancelling=true;try{await EA.api('/public/cancel',{method:'POST',body:{id:this.result.id,token:this.result.token,reason}});this.setState({cancelOpen:false,step:'takip'});await this.refreshTrack();await this.load();}catch(error){this.setState({cErr:error.message});}finally{this.cancelling=false;}}
 async pickCal(id){try{const calendar=await EA.api('/public/booking/calendar',{method:'POST',body:{id:this.result.id,token:this.result.token}});if(id==='google'){window.open(calendar.google_url,'_blank','noopener');this.setState({icsMsg:'Google Takvim’de Kaydet’e dokunun; hatırlatmayı kontrol edin.'});return;}const url=URL.createObjectURL(new Blob([calendar.ics],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=calendar.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);this.setState({icsMsg:'Dosyada 1 gün ve 1 saat önce hatırlatma bulunur. Açıp takviminize ekleyin ve telefon bildirimlerini kontrol edin.'});}catch(error){this.setState({icsMsg:error.message});}}
 renderVals(){const v=super.renderVals(),status=this.state.track?.status;v.demoStates=[];v.canAddCal=status==='confirmed';v.icsPending=false;v.trackPath=this.result?EA.link('/manage')+'#'+this.result.id+'.'+this.result.token:'';v.openTrack=async()=>{try{await this.refreshTrack();this.go('takip');}catch(error){this.serverError=error.message;this.setState({banner:{type:'network'}});}};v.openExisting=v.openTrack;v.retry=()=>this.load();v.isError=!!this.serverError&&!this.state.sending;v.formMsg=this.serverError||v.formMsg;if(this.serverError)v.networkMsg=this.serverError;v.ctaDisabled=v.ctaDisabled||!this.info||this.state.loading;v.ctaAriaDisabled=v.ctaDisabled||(this.state.step==='bilgi'&&!this.state.consent);v.ctaOp=v.ctaAriaDisabled?0.4:1;v.ctaCursor=v.ctaAriaDisabled?'not-allowed':'pointer';v.consentError=this.state.errors.consent||'';v.consentInvalid=!!v.consentError;v.consentBorder=v.consentInvalid?'#A63D33':'rgba(31,42,46,.12)';v.onConsent=e=>{const consent=e.target.checked,errors={...this.state.errors};delete errors.consent;this.setState({consent,errors});};const now=Date.now()/1000,remaining=this.result?this.result.start_at-now:Infinity;v.showCancelBtn=['requested','confirmed'].includes(status)&&remaining>=3600;v.showLastMinute=['requested','confirmed'].includes(status)&&remaining<3600;if(status==='completed'||status==='no_show')v.st={...v.st,title:status==='completed'?'RANDEVUNUZ TAMAMLANDI':'RANDEVUYA GELİNMEDİ',tag:status==='completed'?'TAMAMLANDI':'GELMEDİ',desc:'Güncel randevu kaydınız.',color:'#5B6467',border:'#CFC7BA',bg:'#E9E4DC',ring:'solid',icon:'M20 6 9 17l-5-5'};const current=this.parse(this.TODAY),last=this.parse(this.LAST),month=this.state.calY*12+this.state.calM;v.prevDisabled=month<=current.getFullYear()*12+current.getMonth();v.nextDisabled=month>=last.getFullYear()*12+last.getMonth();v.prevOp=v.prevDisabled?0.35:1;v.nextOp=v.nextDisabled?0.35:1;v.prevMonth=()=>{if(!v.prevDisabled){const d=new Date(this.state.calY,this.state.calM-1,1);this.setState({calY:d.getFullYear(),calM:d.getMonth()});}};v.nextMonth=()=>{if(!v.nextDisabled){const d=new Date(this.state.calY,this.state.calM+1,1);this.setState({calY:d.getFullYear(),calM:d.getMonth()});}};return v;}
}

return ConnectedComponent;
};
