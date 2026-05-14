# photos/originals/

Sem patří **zdrojové JPEGy** ve full rozlišení (např. přímo z fotoaparátu, 20–30 MB).

⚠️ Tato složka je v `.gitignore` — soubory se **necommitují** do repa.
Generované varianty pro web vznikají v `public/images/generated/` po spuštění `npm run optimize`.

## Pojmenování

Pojmenuj soubor podle ID, které pak použiješ v `src/data/photos.json`:

```
photos/originals/praha-soumrak-001.jpg
photos/originals/tatry-vychod-002.jpg
```

ID musí být:
- bez diakritiky a mezer (použij pomlčky)
- unikátní
- shodné s polem `src` v `photos.json`

## Záloha

Doporučuji originály zálohovat mimo repo — např. na externí disk nebo do cloudu (Google Drive, iCloud, NAS).
