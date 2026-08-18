const originalAtlasUrl = "https://3000-ituqp183l2vhyriklj7k9-6f5ac53f.sg1.manus.computer/";

/** Preserves the original NFL Player Atlas application without a FAN/HUB redesign. */
export default function Atlas() {
  return <main className="min-h-[100dvh] w-full overflow-hidden bg-white"><iframe title="NFL Player Atlas" src={originalAtlasUrl} className="block h-[100dvh] w-full border-0" /></main>;
}
