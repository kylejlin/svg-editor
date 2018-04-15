const executeSvg = source => {
  const tags = source.split('').reduce(({ entities, pendingEntity }, char) => {
    if (pendingEntity === null) {
      if (WHITESPACE.test(char)) {
        return {
          entities: entities.concat({
            type: 'raw',
            value: char
          }),
          pendingEntity
        }
      }
      if ('<' === char) {
        return {
          entities,
          pendingEntity: {
            type: 'tag',
            tagName: '',
            tagNameResolved: false,
            attributes: [],
            children: []
          }
        }
      }
    }

    if (pendingEntity.type === 'tag') {
      if (!pendingEntity.tagNameResolved) {
        if (ALPHADASH.test(char))
      }
    }

    throw new Error('badness')
  }, {
    entities: [],
    pendingEntity: null
  })
}
