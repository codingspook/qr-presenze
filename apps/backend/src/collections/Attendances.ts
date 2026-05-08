import type { CollectionConfig } from 'payload'

export const Attendances: CollectionConfig = {
  slug: 'attendances',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['student', 'lesson', 'status', 'checkedAt'],
  },
  fields: [
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      filterOptions: {
        role: { equals: 'student' },
      },
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      required: true,
      index: true,
    },
    { name: 'checkedAt', type: 'date', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'present',
      options: [
        { label: 'Present', value: 'present' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    { name: 'nonce', type: 'text', required: true, unique: true, index: true },
  ],
  timestamps: true,
}
