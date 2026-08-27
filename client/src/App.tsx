/** Gameday Field Notes route shell — keeps the editorial mobile experience on the primary route. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { preloadAtlasRoute, preloadCoachingTreeRoute, preloadFieldlineRoute } from "./lib/routePreload";
import Home from "./pages/Home";

const Atlas = lazy(preloadAtlasRoute);
const CoachingTree = lazy(preloadCoachingTreeRoute);
const Fieldline = lazy(preloadFieldlineRoute);
const FieldlineAdmin = lazy(() => import("./pages/FieldlineAdmin"));

function RouteLoading() {
  return <main className="grid min-h-screen place-items-center bg-[#f5f2ea] font-mono text-[10px] font-bold tracking-[.18em] text-[#526173]">LOADING…</main>;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return <Suspense fallback={<RouteLoading />}><Switch><Route path="/" component={Home} /><Route path="/atlas" component={Atlas} /><Route path="/atlas/" component={Atlas} /><Route path="/coaching-tree" component={CoachingTree} /><Route path="/coaching-tree/" component={CoachingTree} /><Route path="/fieldline/admin" component={FieldlineAdmin} /><Route path="/fieldline/admin/" component={FieldlineAdmin} /><Route path="/fieldline" component={Fieldline} /><Route path="/fieldline/" component={Fieldline} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></Suspense>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors position="top-center" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
