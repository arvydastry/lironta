# Lironta (lironta.lt): naujo dizaino demo

Statinė HTML/CSS/JS demonstracinė versija naujai **lironta.lt** svetainei. Galutinė platforma: **WordPress + WooCommerce + XStore** (Elementor). Demo skirtas parodyti dizainą ir judesį; dalis funkcijų veikia tik kaip pavyzdys (užklausų sąrašas saugomas naršyklėje, forma niekur nesiunčia).

Turinys perkeltas iš dabartinės svetainės (tekstai, 100 produktų su dydžių lentelėmis, produktų nuotraukos, kontaktai, katalogų PDF). Nuotraukos ir video nuotaikai: **Pexels** (sąrašas `docs/pexels-credits.md`). Kryptis pagal užsakovo norą: daug paralakso, video, hover efektų, detalių ir judesio.

## Peržiūra

- `python3 serve.py` ir atverti <http://localhost:8172/> (`.claude/launch.json` konfigūracija `lironta`).
- Po šablonų ar duomenų pakeitimų: `python3 build.py` (tik standartinė Python biblioteka).
- `?static=1` prie adreso išjungia judesį ir video (patogu ekrano nuotraukoms). Esant `prefers-reduced-motion` judesys išsijungia automatiškai.
- Puslapiai turi `noindex, nofollow`. Prieš tikrą paleidimą žymą išimti.

| Puslapis | Ką rodo |
|---|---|
| `index.html` | Pradžia: 12 sekcijų (žr. „Judesys“) |
| `produkcija.html` | Kategorijos archyvas. `?k=plastmasiniai-armaturos-fiksatoriai` ir t. t.; be parametro rodoma visa produkcija |
| `produktas.html` | Produkto šablonas visiems 100 produktų. `?p=ked-kedutes-sunkios&v=KED25/24` |
| `kontaktai.html` | Vadybininkai pagal šalis, rekvizitai, žemėlapis, užklausos forma (`#forma`) |

## Kryptis

**Dizaino perskaitymas:** B2B betonavimo priedų tiekėjas (rangovai, betonuotojai, gelžbetonio gamyklos, pirkimų specialistai). Industrinė kalba: šviesus betonas, grafitas ir logotipo raganosio laimo spalva, tikri kodai ir matmenys iš katalogo.

| | Dabartinė svetainė (Divi) | Demo |
|---|---|---|
| Fonas, spalvos | balta, žalia `#7cc68d`, žalsvai mėlyna juosta | šviesus betonas `#ECEDE8`, grafitas `#161814`, laimas `#C6D100` (paimtas iš logotipo dulkių `#C1CC00`) |
| Šriftai | Open Sans | **Sofia Sans Extra Condensed** (antraštės, kodai) + **Sofia Sans** (tekstas); abu turi lietuviškus, estiškus ir kirilicos rašmenis, todėl tiks ir EN/RU/ET/FI versijoms |
| Logotipas | PNG 512 × 512 | raganosis perpieštas vektoriškai (`assets/img/brand/rhino.svg`, atskiri sluoksniai: kūnas, kontūras, kairės ir dešinės dulkės), žodinis ženklas rinkiniu. **Prieš paleidimą reikia originalaus vektorinio logotipo iš kliento.** |
| Forma | apvalinti kampai | statūs kampai; mygtukai, kortelės ir vaizdai turi vieną nuožulnų kampą apačioje dešinėje (kaip Lironta kampų profiliai PK/PKU). Video valdikliai apvalūs |
| Hero | statinė nuotrauka su šūkiu | armatūros tinklo video rėmelyje, kuris slenkant išsiplečia per visą ekraną; šūkis „Mes visur, kur Jūs statote“ išlaikytas |
| Produktai | iššokantys langai su lentelėmis | atskiri produkto puslapiai, dydžių mygtukai, užklausų sąrašas vietoje kainų |

### Judesys (GSAP 3.13 + ScrollTrigger + SplitText, Lenis sklandus slinkimas)

- **Įžanga:** laimo uždanga su raganosiu (tik pirmą kartą per sesiją).
- **Hero:** antraštė iškyla eilutėmis, žodis „statote“ atsiranda ant laimo juostos; slenkant rėmelis išsiplečia, video priartėja; magnetinis „Žiūrėti video“ mygtukas atveria montažą (lightbox); fono video stabdymo mygtukas.
- **Kodų juosta:** produktų kodai (KED, FU, UF…) bėga ir greitėja bei pasvyra pagal slinkimo greitį, keičia kryptį slenkant atgal.
- **Apie mus:** žodžiai paryškėja slenkant, skaičiai prasisuka (1994, 100+, 8, 5), paralaksas video ir nuotraukai.
- **Produkcija:** 8 kategorijų horizontalus slinkimas su prisegimu; nuotraukų paralaksas, produkto plytelė „plaukia“, užvedus pelę groja video, rodomas aprašymas.
- **Parinkiklis:** apsauginio sluoksnio liniuotė ir armatūros skersmuo, skerspjūvio schema persipiešia, iš katalogo lentelių parenkami tinkami gaminiai (veikia su tikrais duomenimis).
- **Raganosis:** prisegta laimo sekcija, raganosis „bėga“ į žiūrovą, dulkės išsiveržia į šonus, fone slenka užrašas.
- **Vertybės:** kortelių krūva (sticky), ankstesnė kortelė mažėja ir tamsėja.
- **Sandėliai, užklausa:** video juostos su paralaksu.
- **Katalogai:** viršelių vėduoklė 3D, užvedus ant sąrašo eilutės ar viršelio iškeliamas tas katalogas.
- **Rinkos:** užvedus ant miesto, šalia pelės atsiranda miesto nuotrauka.
- **Bendri:** mega meniu su nuotraukomis, paieška (`/` arba Ctrl+K), užklausų sąrašas su „skrendančia“ preke, pranešimai, poraštės žodinis ženklas iškyla.
- Video kraunami tik priartėjus ir groja tik matomi. Mobiliajame horizontalus slinkimas virsta paslenkama karusele, kortelių krūva išsirikiuoja vertikaliai.

## Failai

```
build.py                 src/pages + src/partials -> *.html; src/data/catalog.json -> assets/js/data.js
serve.py                 peržiūros serveris (8172)
src/pages/*.html         puslapių turinys (meta antraštėje)
src/partials/*.html      layout, header (mega meniu), footer, perdangos, ikonos (Phosphor)
src/data/catalog.json    8 kategorijos, 100 produktų, dydžių lentelės, nuotraukos, katalogai
src/data/media.json      Pexels nuotraukų ir video sąrašas su autoriais
tools/media.py           medijos paruošimas: photos | products | videos | credits
assets/css/style.css     dizaino sistema
assets/js/main.js        bendri komponentai; home.js, catalog.js, product.js, contact.js puslapiams
assets/js/vendor/        gsap, ScrollTrigger, SplitText, lenis (vietinės kopijos)
docs/pexels-credits.md   Pexels autoriai
```

Medija: video 25 MB (hero 1,7 MB, montažas 12,9 MB kraunamas tik atidarius), Pexels nuotraukos 7 MB (WebP, pilnas ir `-sm` dydis), produktų nuotraukos 6 MB (WebP).

## Perkėlimas į WordPress XStore

Kiekviena sekcija šablonuose turi komentarą su XStore arba Elementor atitikmeniu. Atitikmenys nurodyti pagal bendras XStore ir Elementor Pro galimybes; konkrečių valdiklių pavadinimus reikia sutikrinti su įdiegta XStore Core versija.

| Demo blokas | XStore / Elementor | Pastabos |
|---|---|---|
| Antraštė (permatoma, lipni, slepiasi) | Header Builder: transparent + sticky | Slėpimas slenkant žemyn: XStore sticky nustatymas arba keli JS eilučių |
| Mega meniu su nuotraukomis | XStore Mega Menu (Static Blocks) | Kategorijų nuotraukos iš WooCommerce |
| Paieška | XStore Ajax Search (pilno ekrano) | Ieško pagal SKU ir pavadinimą |
| Užklausa vietoje krepšelio | WooCommerce Catalog mode + Request a Quote įskiepis | Mini krepšelis kaip off-canvas sąrašas, „fly to cart“ animacija |
| Hero su video ir išsiplečiančiu rėmeliu | Elementor sekcija su fono video | Rėmelio išsiplėtimas yra child temos GSAP scenarijus |
| Horizontalus kategorijų slinkimas | Product Categories karuselė | Prisegimas ir paralaksas: child temos GSAP ScrollTrigger |
| Fiksatoriaus parinkiklis | nėra standartinio | Child temos JS modulis; duomenys iš variacijų atributų (apsauginis sluoksnis, armatūros skersmuo) |
| Raganosio sekcija | Elementor Sticky + Scrolling effects | Pilnas efektas: GSAP, SVG iš logotipo |
| Vertybių kortelių krūva | Elementor Sticky (top) | Mastelio efektas: Scrolling effects arba GSAP |
| Video juostos, paralaksas | Elementor fono video + Motion effects | Savaime |
| Katalogų vėduoklė | Elementor sąrašas + nuotraukos | Vėduoklė: child temos scenarijus |
| Kategorijos puslapis | Elementor Archive Products šablonas | Įrankių juosta, tinklelis/sąrašas, hover nuotraukų keitimas: XStore Shop nustatymai |
| Produkto puslapis | Single Product šablonas, XStore Variation Swatches, Sticky Add to Cart | Dydžiai iš lentelių tampa variacijomis (SKU = dydžio kodas, pvz. KED25/24) |
| Kontaktų forma | Contact Form 7 arba WPForms | Užklausų sąrašas pridedamas automatiškai (Request a Quote) |
| Kalbos LT / EN / RU / ET / FI | WPML arba Polylang | Demo tik lietuviškai |

## Prieš tikrą paleidimą

- Gauti originalų vektorinį logotipą (dabar perpieštas iš PNG).
- Patikrinti turinio vietas, kurias parašiau pats: tepalų grupių trumpi aprašymai, „Kaip užsakyti“ skirtukas, kategorijų aprašymai. Produktų aprašymai ir lentelės yra iš dabartinės svetainės (sutvarkyti brūkšniai, kelios rašybos klaidos, pvz. „Plastmsinis“).
- Panevėžio eilutėje rodoma sandėlio nuotrauka (Pexels neturi Panevėžio). Geriausia būtų tikros Lironta sandėlio ir komandos nuotraukos bei video.
- Katalogų PDF dabar veda į dabartinę lironta.lt svetainę.
- Išimti `noindex`, perkelti privatumo politiką ir slapukų pranešimą.
