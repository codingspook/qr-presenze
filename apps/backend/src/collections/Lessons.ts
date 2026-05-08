import type { CollectionConfig } from "payload";

export const Lessons: CollectionConfig = {
    slug: "lessons",
    admin: {
        useAsTitle: "title",
        defaultColumns: ["title", "teacher", "startsAt", "endsAt", "active"],
    },
    fields: [
        { name: "title", type: "text", required: true },
        {
            name: "teacher",
            type: "relationship",
            relationTo: "users",
            required: true,
            filterOptions: {
                role: { equals: "teacher" },
            },
        },
        { name: "startsAt", type: "date", required: true },
        { name: "endsAt", type: "date", required: true },
        { name: "active", type: "checkbox", defaultValue: true, index: true },
    ],
    timestamps: true,
};
