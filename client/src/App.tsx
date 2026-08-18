/** Gameday Field Notes route shell — keeps the editorial mobile experience on the primary route. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Atlas from "./pages/Atlas";
import Fieldline from "./pages/Fieldline";
import Home from "./pages/Home";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return <Switch><Route path="/" component={Home} /><Route path="/atlas" component={Atlas} /><Route path="/atlas/" component={Atlas} /><Route path="/fieldline" component={Fieldline} /><Route path="/fieldline/" component={Fieldline} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors position="top-center" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
