import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  schema?: string;
}

const SEO = ({ title, description, schema }: SEOProps) => {
  useEffect(() => {
    // Update the document title
    document.title = `${title} | Amici del San Raffaele`;

    // Update the description meta tag if provided
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", description);
      } else {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        metaDescription.setAttribute("content", description);
        document.head.appendChild(metaDescription);
      }
    }

    // Inject JSON-LD Schema
    if (schema) {
      const scriptId = "json-ld-schema";
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      if (script) {
        script.textContent = schema;
      } else {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        script.textContent = schema;
        document.head.appendChild(script);
      }
    }
  }, [title, description, schema]);

  return null;
};

export default SEO;
