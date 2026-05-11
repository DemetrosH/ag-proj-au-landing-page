export default {
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
    },
    {
      name: 'department',
      title: 'Department',
      type: 'string',
      options: {
        list: [
          { title: 'Administration', value: 'administration' },
          { title: 'Archéologie', value: 'archeologie' },
          { title: 'Accompagnement Culturel', value: 'accompagnement' },
          { title: 'Événementiel', value: 'evenementiel' },
          { title: 'Numérique', value: 'numerique' },
        ],
      },
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'externalImageUrl',
      title: 'External Image URL',
      type: 'url',
      description: 'URL of the image from the old website (temporary)',
    },
    {
      name: 'bio',
      title: 'Bio',
      type: 'text',
    },
    {
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Sorting order (lower numbers appear first)',
    },
  ],
}
