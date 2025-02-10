import type { Field } from "payload";

import {
  AlignFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

import { linkGroup } from "@/fields/linkGroup";

export const hero: Field = {
  name: "hero",
  type: "group",
  fields: [
    {
      name: "type",
      type: "select",
      defaultValue: "none",
      label: "Type",
      options: [
        {
          label: "None",
          value: "none",
        },
        {
          label: "Animated Impact",
          value: "animatedImpact",
        },
        // {
        //   label: "High Impact",
        //   value: "highImpact",
        // },
        // {
        //   label: "Medium Impact",
        //   value: "mediumImpact",
        // },
        // {
        //   label: "Low Impact",
        //   value: "lowImpact",
        // },
      ],
      required: true,
    },
    {
      name: "richText",
      type: "richText",
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            AlignFeature(),
          ];
        },
      }),
      label: false,
      admin: {
        condition: (_, { type } = {}) =>
          ["highImpact", "mediumImpact", "lowImpact"].includes(type),
      },
    },
    {
      name: "title",
      type: "text",
      admin: {
        condition: (_, { type } = {}) => ["animatedImpact"].includes(type),
      },
    },
    {
      name: "rotateWords",
      type: "text",
      admin: {
        description:
          'Comma separated list of words to rotate (e.g. "Hello, World")',
        condition: (_, { type } = {}) => ["animatedImpact"].includes(type),
      },
    },
    {
      name: "subtitle",
      type: "textarea",
      admin: {
        condition: (_, { type } = {}) => ["animatedImpact"].includes(type),
      },
    },

    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: "media",
      type: "upload",
      admin: {
        condition: (_, { type } = {}) =>
          ["highImpact", "mediumImpact", "animatedImpact"].includes(type),
      },
      relationTo: "media",
      required: true,
    },
  ],
  label: false,
};
