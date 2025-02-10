import { authenticated } from "@/access/authenticated";
import { CollectionConfig } from "payload";
import { verify } from "./endpoints/verify";
import { razorpay } from "@/lib/razorpay";

export const Payments: CollectionConfig = {
  slug: "payments",
  admin: {
    useAsTitle: "orderId",
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === "create") {
          const amount = data.amount * 100;
          const order = await razorpay.orders.create({
            amount,
            currency: "INR",
            notes: { ...data },
          });
          data.order = order;
          data.orderId = order.id;
          data.amount = amount;
          data.status = order.status;
        }
      },
    ],
    afterChange: [
      async ({ doc, operation, req: { payload } }) => {
        const applicationId =
          typeof doc.application === "string"
            ? doc.application
            : doc.application.id;

        if (operation === "create" && applicationId) {
          payload.logger.info(
            `Updating Application (${applicationId}) with payment: ${doc.id}`
          );
          try {
            payload.update({
              collection: "applications",
              where: { id: { equals: applicationId } },
              data: { payment: doc.id },
            });
          } catch (error) {
            payload.logger.error("Error updating payment");
          }
        }
      },
    ],
  },

  fields: [
    { name: "email", type: "text" },
    { name: "mobile", type: "text" },
    {
      name: "amount",
      type: "number",
      admin: {
        description: "Amount is in paise (100 paise = 1 rupee)",
      },
    },
    {
      name: "order",
      type: "json",
      admin: {
        readOnly: true,
        description: "Auto-generated by Razorpay",
      },
    },
    {
      name: "status",
      type: "text",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Auto-generated by Razorpay",
      },
    },
    {
      name: "orderId",
      type: "text",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Auto-generated by Razorpay",
      },
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
    {
      name: "application",
      type: "relationship",
      relationTo: "applications",
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
  ],
  endpoints: [
    {
      path: "/verify",
      method: "post",
      handler: verify,
    },
    {
      path: "/callback",
      method: "post",
      handler: async (req) => {
        // @ts-ignore
        const data = await req.json();
        console.log({ data });
        return Response.json({ message: "OK!" });
      },
    },
  ],
};
