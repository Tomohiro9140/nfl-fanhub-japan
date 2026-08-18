const originalFieldlineUrl = "https://3000-im4jq1epwl9r74izjlp1y-9b5a11d5.sg1.manus.computer/";

/** Preserves the original NFL Team Stats Comparator application without a FAN/HUB redesign. */
export default function Fieldline() {
  return <main className="min-h-[100dvh] w-full overflow-hidden bg-white"><iframe title="NFL Team Stats Comparator" src={originalFieldlineUrl} className="block h-[100dvh] w-full border-0" /></main>;
}
