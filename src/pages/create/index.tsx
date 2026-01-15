import { useEffect } from "react";
import { useRouter } from "next/router";

const CreateIndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to get-started page which shows all templates
    router.replace("/get-started?new=true");
  }, [router]);

  return null;
};

export default CreateIndexPage;
