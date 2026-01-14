import React from "react";
import Splash from "@/components/Splash";
import { useUser } from "@/contexts/UserContext";

// App configuration - customize these values for your mini app
const APP_NAME = "Renaissance City";

const HomePage: React.FC = () => {
  const { user, isLoading } = useUser();

  // Show splash screen - handles redirects to /dashboard or /auth
  return <Splash user={user} isLoading={isLoading} appName={APP_NAME} />;
};

export default HomePage;
