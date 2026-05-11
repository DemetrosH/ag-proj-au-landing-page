export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'division',
      title: 'Division',
      type: 'string',
      options: {
        list: [
          { title: 'Evenements', value: 'evenements' },
          { title: 'Archeologie', value: 'archeologie' },
          { title: 'Accompagnement', value: 'accompagnement' },
          { title: 'Fabrication', value: 'fabrication' },
          { title: 'Conception', value: 'conception' },
          { title: 'Location', value: 'location' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
    },
  ],
}
