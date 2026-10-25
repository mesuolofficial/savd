const ITEMS: { t: string; ur?: boolean }[] = [
  { t: "PAKISTAN'S FIRST NATIONAL AUV COMPETITION" }, { t: "DESIGN ◆ BUILD ◆ DIVE" },
  { t: "گہرائیوں کی تسخیر", ur: true }, { t: "ڈیزائن ◆ تعمیر ◆ غوطہ", ur: true },
  { t: "ORGANIZED BY MES · UNIVERSITY OF LAHORE" },
];

export function Ticker() {
  return (
    <div className="tk" aria-hidden="true"><div>
      {[0, 1].flatMap((k) => ITEMS.map((x, i) => (
        <span key={`${k}-${i}`} className={x.ur ? "ur" : undefined} {...(x.ur ? { lang: "ur", dir: "rtl" } : {})}>{x.t} <i>◆</i></span>
      )))}
    </div></div>
  );
}
