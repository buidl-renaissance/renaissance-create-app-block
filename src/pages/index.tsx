import React from "react";
import { NextSeo } from "next-seo";
import Splash from "@/components/Splash";
import { useUser } from "@/contexts/UserContext";

// App configuration - customize these values for your mini app
const APP_NAME = "Renaissance City";
const APP_DESCRIPTION = "Build your block in Detroit's digital renaissance. Create apps, connect communities, and shape the future of the city—one block at a time.";

const HomePage: React.FC = () => {
  const { user, isLoading } = useUser();

  return (
    <>
      <NextSeo
        title="Welcome"
        description={APP_DESCRIPTION}
        openGraph={{
          title: APP_NAME,
          description: APP_DESCRIPTION,
        }}
      />
      <Splash user={user} isLoading={isLoading} appName={APP_NAME} />
    </>
  );
};

export default HomePage;
