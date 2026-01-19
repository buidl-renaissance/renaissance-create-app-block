import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { DefaultSeo, NextSeo } from "next-seo";
import { StyleSheetManager } from "styled-components";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext";
import { AppBlockProvider } from "@/contexts/AppBlockContext";
import { GlobalStyle } from "@/styles/globalStyles";

const APP_NAME = "Renaissance City";
const APP_DESCRIPTION = "Build your block in Detroit's digital renaissance. Create apps, connect communities, and shape the future of the city—one block at a time.";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://renaissance.city";

export default function App({ Component, pageProps }: AppProps) {
  const { metadata } = pageProps;
  return (
    <ThemeProvider>
      <UserProvider>
        <AppBlockProvider>
          <StyleSheetManager shouldForwardProp={(prop) => !prop.startsWith('$')}>
            <GlobalStyle />
            <DefaultSeo
              titleTemplate={`%s | ${APP_NAME}`}
              defaultTitle={APP_NAME}
              description={APP_DESCRIPTION}
              canonical={APP_URL}
              openGraph={{
                type: "website",
                locale: "en_US",
                url: APP_URL,
                siteName: APP_NAME,
                title: APP_NAME,
                description: APP_DESCRIPTION,
                images: [
                  {
                    url: `${APP_URL}/og-image.png`,
                    width: 1200,
                    height: 630,
                    alt: APP_NAME,
                    type: "image/png",
                  },
                ],
              }}
              twitter={{
                handle: "@raborncity",
                site: "@raborncity",
                cardType: "summary_large_image",
              }}
              additionalMetaTags={[
                {
                  name: "keywords",
                  content: "Detroit, Renaissance, App Blocks, Community, Technology, Build, Create, Connect",
                },
                {
                  name: "author",
                  content: "Renaissance City",
                },
                {
                  name: "theme-color",
                  content: "#7C3AED",
                },
                {
                  name: "viewport",
                  content: "width=device-width, initial-scale=1, maximum-scale=5",
                },
              ]}
              additionalLinkTags={[
                {
                  rel: "apple-touch-icon",
                  href: "/apple-touch-icon.png",
                  sizes: "180x180",
                },
                {
                  rel: "manifest",
                  href: "/manifest.json",
                },
              ]}
            />
            {metadata && <NextSeo {...metadata} />}
            <Component {...pageProps} />
          </StyleSheetManager>
        </AppBlockProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
