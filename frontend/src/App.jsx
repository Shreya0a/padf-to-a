import { useEffect, useState } from "react";
import VoiceStudioLanding from "./components/VoiceStudioLanding.jsx";
import AuthPage from "./pages/AuthPage.jsx";

export default function App() {
  const [hash, setHash] = useState(window.location.hash );

  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (hash === "#/login") return <AuthPage mode="signin" />;
  if (hash === "#/signup") return <AuthPage mode="signup" />;
  return <VoiceStudioLanding />;
}
