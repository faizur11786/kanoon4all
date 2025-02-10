import { seoPlugin } from "@payloadcms/plugin-seo";
import { Plugin } from "payload";
import { GenerateTitle, GenerateURL } from "@payloadcms/plugin-seo/types";
import { getServerSideURL } from "@/lib/getURL";
import { siteConfig } from "@/config/site";
import { Page, Service } from "@/payload-types";
import { s3Storage } from "@payloadcms/storage-s3";

const generateTitle: GenerateTitle<Page | Service> = ({ doc }) => {
  return doc?.title ? `${doc.title} | ${siteConfig.name}` : siteConfig.name;
};

const generateURL: GenerateURL<Page | Service> = ({ doc }) => {
  const url = getServerSideURL();

  return doc?.slug ? `${url}/${doc.slug}` : url;
};

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  s3Storage({
    collections: {
      media: {
        disableLocalStorage: true,
        generateFileURL: (file: any) => {
          return `${process.env.R2_PUBLIC_ENDPOINT}/media/${file.filename}`;
        },
        prefix: "media",
      },
    },
    bucket: process.env.R2_BUCKET!,
    config: {
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      region: "auto",
      forcePathStyle: true,
      // ... Other S3 configuration
    },
  }),
];
