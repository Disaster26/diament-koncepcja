(function () {
  'use strict';
  var TEL = '48536800124';
  var MAIL = 'diament@naprawazegarka.pl';

  /* ---------- menu ---------- */
  var burger = document.querySelector('.burger');
  var panel = document.getElementById('panel');
  burger.addEventListener('click', function () {
    var otw = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!otw));
    burger.setAttribute('aria-label', otw ? 'Otwórz menu' : 'Zamknij menu');
    panel.hidden = otw;
  });
  panel.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { panel.hidden = true; burger.setAttribute('aria-expanded', 'false'); }
  });
  window.addEventListener('resize', function () {
    if (innerWidth > 1060 && !panel.hidden) { panel.hidden = true; burger.setAttribute('aria-expanded', 'false'); }
  });

  /* ---------- dolny pasek po przewinieciu za przycisk w hero ---------- */
  var mob = document.querySelector('.mob');
  var cta = document.getElementById('hero-cta');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (wp) {
      var r = wp[0];
      mob.classList.toggle('widac', !r.isIntersecting && r.boundingClientRect.top < 0);
    }, { threshold: 0 }).observe(cta);
  }

  /* ---------- mapa na klikniecie ---------- */
  document.getElementById('pokaz-mape').addEventListener('click', function () {
    var m = document.getElementById('mapa');
    m.innerHTML = '<iframe title="Mapa: Zegarmistrz Diament, ul. Królowej Jadwigi 21A, Inowrocław" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Kr%C3%B3lowej%20Jadwigi%2021A%2C%2088-100%20Inowroc%C5%82aw&z=16&output=embed"></iframe>';
  });

  /* ---------- kreator zgloszenia ---------- */
  var TYPY = {
    zegarek: [['kwarcowy', 'Kwarcowy', 'na baterię'], ['mechaniczny', 'Mechaniczny', 'nakręcany ręcznie'], ['automatyczny', 'Automatyczny', 'nakręca się na ręce'], ['nie wiem', 'Nie wiem', 'ustalimy przy diagnozie']],
    zegar: [['ścienny', 'Ścienny, wiszący'], ['stojący', 'Stojący'], ['kominkowy', 'Kominkowy'], ['inny', 'Inny']]
  };
  var USTERKI = {
    zegarek: [
      ['stanal', 'Stanął, nie chodzi'], ['dokladnosc', 'Spóźnia się lub śpieszy'], ['bateria', 'Wymiana baterii', 'kw'],
      ['bateria2', 'Bateria szybko się rozładowuje', 'kw'], ['szklo', 'Pęknięte lub porysowane szkło'], ['zalanie', 'Zalany lub zaparowany'],
      ['bransoleta', 'Pasek lub bransoleta'], ['uszczelnienie', 'Uszczelnienie (wodoodporność)'], ['serwis', 'Serwis okresowy'],
      ['polerowanie', 'Polerowanie koperty'], ['inne', 'Coś innego']
    ],
    zegar: [
      ['stanal', 'Nie działa'], ['zatrzymuje', 'Zatrzymuje się'], ['bicie', 'Problem z biciem'], ['dokladnosc', 'Niedokładny chód'],
      ['serwis', 'Konserwacja, serwis okresowy'], ['renowacja', 'Renowacja'], ['inne', 'Coś innego']
    ],
    inne: [['stanal', 'Nie działa'], ['dokladnosc', 'Niedokładny chód'], ['serwis', 'Serwis, konserwacja'], ['inne', 'Coś innego']]
  };
  var PRZEK = {
    osobiscie: ['Osobiście w zakładzie', 'Zapraszamy na ul. Królowej Jadwigi 21A w Inowrocławiu: pon.-pt. 10-18, sob. 9:30-13:30.'],
    paczkomat: ['Paczkomat InPost', 'Po zgłoszeniu dostaniesz od nas kod nadania. Nie musisz drukować etykiety.'],
    kurier: ['Kurier z domu', 'Kurier odbierze przesyłkę spod Twojego adresu. Potrzebny będzie wydruk etykiety.']
  };

  var stan = { rodzaj: null, typ: null, usterki: [], przekazanie: null };
  var pliki = [];
  var form = document.getElementById('kreator');
  var kroki = form.querySelectorAll('.kr-krok');
  var $ = function (id) { return document.getElementById(id); };

  function przyciski(el, lista, pole) {
    el.innerHTML = '';
    lista.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button'; b.dataset.v = o[0];
      b.setAttribute('aria-pressed', 'false');
      b.textContent = o[1];
      if (o[2] && pole === 'typ') { var s = document.createElement('small'); s.textContent = o[2]; b.appendChild(s); }
      el.appendChild(b);
    });
  }
  function pokaz(n, tak) { kroki[n - 1].hidden = !tak; }

  function listaUsterek() {
    var l = USTERKI[stan.rodzaj] || [];
    if (stan.rodzaj === 'zegarek' && (stan.typ === 'mechaniczny' || stan.typ === 'automatyczny')) {
      l = l.filter(function (u) { return u[2] !== 'kw'; });
    }
    return l;
  }

  form.addEventListener('click', function (e) {
    var b = e.target.closest('.opcje button');
    if (!b) return;
    var grupa = b.parentNode, pole = grupa.dataset.pole, v = b.dataset.v;
    if (pole === 'usterki') {
      var i = stan.usterki.indexOf(v);
      if (i < 0) stan.usterki.push(v); else stan.usterki.splice(i, 1);
      b.setAttribute('aria-pressed', String(i < 0));
    } else {
      grupa.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      stan[pole] = v;
      if (pole === 'rodzaj') {
        stan.typ = null; stan.usterki = [];
        if (v === 'inne') {
          pokaz(2, false);
          przyciski($('op-usterki'), listaUsterek(), 'usterki'); pokaz(3, true);
        } else {
          $('lg-typ').textContent = v === 'zegarek' ? 'Jaki to zegarek?' : 'Jaki to zegar?';
          przyciski($('op-typ'), TYPY[v], 'typ'); pokaz(2, true); pokaz(3, false);
        }
        pokaz(4, false); pokaz(5, false);
      }
      if (pole === 'typ') {
        var stare = stan.usterki.slice();
        przyciski($('op-usterki'), listaUsterek(), 'usterki');
        stan.usterki = stare.filter(function (u) { return $('op-usterki').querySelector('[data-v="' + u + '"]'); });
        stan.usterki.forEach(function (u) { $('op-usterki').querySelector('[data-v="' + u + '"]').setAttribute('aria-pressed', 'true'); });
        pokaz(3, true);
      }
    }
    if (stan.usterki.length) { pokaz(4, true); pokaz(5, true); }
    odswiez();
  });
  form.addEventListener('input', odswiez);
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  /* zdjecia */
  $('f-foto').addEventListener('change', function () {
    Array.prototype.forEach.call(this.files, function (f) { if (/^image\//.test(f.type) && pliki.length < 6) pliki.push(f); });
    this.value = '';
    rysujMiniatury(); odswiez();
  });
  function rysujMiniatury() {
    var box = $('miniatury'); box.innerHTML = '';
    pliki.forEach(function (f, i) {
      var fig = document.createElement('figure');
      var img = document.createElement('img'); img.alt = f.name; img.src = URL.createObjectURL(f);
      img.onload = function () { URL.revokeObjectURL(img.src); };
      var x = document.createElement('button'); x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label', 'Usuń zdjęcie ' + f.name);
      x.addEventListener('click', function () { pliki.splice(i, 1); rysujMiniatury(); odswiez(); });
      fig.appendChild(img); fig.appendChild(x); box.appendChild(fig);
    });
  }

  function nazwa(lista, v) { for (var i = 0; i < lista.length; i++) if (lista[i][0] === v) return lista[i][1]; return v; }
  function opisCzasomierza() {
    if (!stan.rodzaj) return '';
    if (stan.rodzaj === 'inne') return 'Inny czasomierz';
    var t = stan.rodzaj === 'zegarek' ? 'Zegarek' : 'Zegar';
    if (stan.typ && stan.typ !== 'nie wiem' && stan.typ !== 'inny') t += ' ' + stan.typ;
    return t;
  }

  function tresc() {
    var u = stan.usterki.map(function (x) { return nazwa(USTERKI[stan.rodzaj], x).toLowerCase(); });
    var w = ['Dzień dobry, chcę zgłosić naprawę.', '', 'Czasomierz: ' + opisCzasomierza()];
    var marka = $('f-marka').value.trim(), opis = $('f-opis').value.trim();
    if (marka) w.push('Marka i model: ' + marka);
    w.push('Usterka: ' + u.join(', '));
    if (opis) w.push('Opis: ' + opis);
    if (stan.przekazanie) w.push('Przekazanie: ' + PRZEK[stan.przekazanie][0]);
    if (pliki.length) w.push('Zdjęcia: ' + pliki.length + ' szt.');
    return w.join('\n');
  }

  function odswiez() {
    var s = $('podsum');
    s.querySelector('[data-s="rodzaj"]').textContent = opisCzasomierza() + ($('f-marka').value.trim() ? ', ' + $('f-marka').value.trim() : '') || '-';
    s.querySelector('[data-s="usterki"]').textContent = stan.usterki.length ? stan.usterki.map(function (x) { return nazwa(USTERKI[stan.rodzaj], x); }).join(', ') : '-';
    s.querySelector('[data-s="przekazanie"]').textContent = stan.przekazanie ? PRZEK[stan.przekazanie][0] : '-';

    // orientacyjny czas - wg informacji z naprawazegarka.pl
    var czas = '';
    if (stan.rodzaj === 'zegarek') czas = 'Orientacyjny czas: zwykle od kilku do kilkunastu dni, zależnie od usterki i dostępności części.';
    if (stan.rodzaj === 'zegar') czas = 'Orientacyjny czas: większość napraw zegarów trwa około 1-2 tygodni.';
    $('w-czas').textContent = czas;

    var opis = 'Koszt zależy od usterki, modelu i części, dlatego podajemy go po obejrzeniu czasomierza. Naprawę zaczynamy dopiero po Twojej akceptacji.';
    if (stan.przekazanie === 'paczkomat' || stan.przekazanie === 'kurier') opis += ' Jeśli zrezygnujesz, płacisz tylko za ewentualną wysyłkę zwrotną.';
    $('w-opis').textContent = opis;

    var rada = '';
    if (stan.usterki.indexOf('zalanie') >= 0) rada = 'Przy zalaniu liczy się czas. Szybka reakcja często zapobiega droższej naprawie, więc nie odkładaj zgłoszenia.';
    else if (stan.rodzaj === 'zegar' && stan.usterki.indexOf('serwis') >= 0) rada = 'Mechanizm zegara warto konserwować co kilka lat, najczęściej co 5-7. To pozwala uniknąć poważniejszych napraw.';
    else if (stan.usterki.indexOf('bateria2') >= 0) rada = 'Bateria, która szybko się rozładowuje, bywa objawem usterki mechanizmu. Sprawdzimy to przy diagnozie.';
    $('w-rada').textContent = rada; $('w-rada').hidden = !rada;

    var uw = stan.przekazanie ? PRZEK[stan.przekazanie][1] : '';
    if (stan.rodzaj === 'zegar' && (stan.przekazanie === 'paczkomat' || stan.przekazanie === 'kurier')) uw += ' Zegar to delikatna przesyłka, dlatego przed wysyłką dostaniesz od nas wskazówki pakowania, a w razie potrzeby pomożemy przygotować zabezpieczenie.';
    $('uw-przek').textContent = uw;

    var gotowe = stan.rodzaj && stan.usterki.length;
    $('kr-brak').hidden = !!gotowe;
    $('kr-btny').hidden = !gotowe;
    if (!gotowe) { $('kr-foto-info').hidden = true; return; }

    var t = tresc();
    $('b-wa').href = 'https://wa.me/' + TEL + '?text=' + encodeURIComponent(t);
    $('b-mail').href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Zgłoszenie naprawy: ' + opisCzasomierza()) + '&body=' + encodeURIComponent(t);

    var moznaPliki = pliki.length && navigator.canShare && navigator.canShare({ files: pliki });
    $('b-udostepnij').hidden = !moznaPliki;
    $('b-wa').className = moznaPliki ? 'btn-2' : 'btn';
    var info = $('kr-foto-info');
    if (pliki.length && !moznaPliki) { info.hidden = false; info.textContent = 'Zdjęcia dołącz w WhatsApp albo w mailu, gdy otworzy się wiadomość z gotową treścią zgłoszenia.'; }
    else if (moznaPliki) { info.hidden = false; info.textContent = 'Wyślij ze zdjęciem otworzy listę aplikacji. Wybierz WhatsApp, Messenger albo pocztę i wskaż nas jako odbiorcę.'; }
    else info.hidden = true;
  }

  $('b-udostepnij').addEventListener('click', function () {
    navigator.share({ title: 'Zgłoszenie naprawy', text: tresc() + '\n\nTel. 536 800 124, ' + MAIL, files: pliki }).catch(function () {});
  });

  odswiez();
})();
