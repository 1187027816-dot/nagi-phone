// Nagi Phone first-run seed data.
// Adds Shen Weizhi, Cheng Nagi, and the character-bound NSFW lorebook once.
(function () {
  const SEED_KEY = 'nagi_seed_shen_weizhi_v1'
  const SEED_VERSION = 1

  async function readSeedText(path) {
    const response = await fetch(path + '?v=' + SEED_VERSION)
    if (!response.ok) throw new Error('无法读取预设文件：' + path)
    return (await response.text()).replace(/\r\n?/g, '\n').trim()
  }

  async function findCharacter(name, type) {
    const matches = await db.characters.where('name').equals(name).toArray()
    return matches.find(item => item && item.type === type) || null
  }

  function defaultIdentity(existing) {
    return existing || {
      account: '',
      password: '',
      phone: '',
      idCard: '',
      bankCard: '',
      bankPass: ''
    }
  }

  async function waitForDatabase() {
    const startedAt = Date.now()
    while (!window.db) {
      if (Date.now() - startedAt > 20000) throw new Error('本地数据库尚未加载')
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    await db.open()
  }

  async function seedNagiCharacters() {
    await waitForDatabase()
    const seeded = await db.config.get(SEED_KEY)
    if (seeded && seeded.value === SEED_VERSION) return

    const [main, ooc, characterNsfw, lorebookNsfw, userDescription] = await Promise.all([
      readSeedText('data/shen-weizhi-main.txt'),
      readSeedText('data/shen-weizhi-ooc.txt'),
      readSeedText('data/shen-weizhi-nsfw.txt'),
      readSeedText('data/nsfw-worldbook.txt'),
      readSeedText('data/user-cheng-nagi.txt')
    ])

    const characterDescription = [
      main,
      '===== OOC与行为补充 =====\n' + ooc,
      '===== NSFW角色补充 =====\n' + characterNsfw
    ].join('\n\n')

    let shen = await findCharacter('沈危止', 'char')
    const shenData = {
      type: 'char',
      group: shen?.group || '邻居',
      name: '沈危止',
      nick: shen?.nick || 'Mortis',
      gender: '男',
      role: '自由投资人、黑客',
      description: characterDescription,
      avatar: shen?.avatar || '',
      identity: defaultIdentity(shen?.identity),
      relations: Array.isArray(shen?.relations) ? shen.relations : []
    }

    let shenId
    if (shen) {
      await db.characters.update(shen.id, shenData)
      shenId = shen.id
    } else {
      shenId = await db.characters.add(shenData)
    }

    let user = await findCharacter('程凪', 'user')
    const userData = {
      type: 'user',
      group: user?.group || 'USER',
      name: '程凪',
      nick: user?.nick || '凪凪',
      gender: '女',
      role: user?.role || '',
      description: userDescription,
      avatar: user?.avatar || '',
      identity: defaultIdentity(user?.identity),
      relations: Array.isArray(user?.relations) ? user.relations : []
    }

    if (user) await db.characters.update(user.id, userData)
    else await db.characters.add(userData)

    const lorebookRow = await db.config.get('lorebooks')
    const lorebooks = Array.isArray(lorebookRow?.value) ? lorebookRow.value : []
    const bookId = 'nagi-shen-weizhi-nsfw-v1'
    const book = {
      id: bookId,
      name: '沈危止｜NSFW世界书',
      scope: 'personal',
      charIds: [shenId],
      enabled: true,
      entries: [{
        id: 'nagi-shen-weizhi-nsfw-entry-v1',
        title: 'NSFW写作规范',
        keywords: [],
        enabled: true,
        position: 'after',
        injectOrder: 100,
        content: lorebookNsfw
      }]
    }
    const existingBookIndex = lorebooks.findIndex(item => item && item.id === bookId)
    if (existingBookIndex >= 0) lorebooks[existingBookIndex] = book
    else lorebooks.push(book)
    await db.config.put({ key: 'lorebooks', value: lorebooks })

    await db.config.put({ key: SEED_KEY, value: SEED_VERSION })
    if (typeof window.refreshCharCache === 'function') await window.refreshCharCache(shenId)
  }


  // One-time import for the two XiaoE worldbooks.
  // They are imported as unbound personal lorebooks so the user can mount them manually per chat.
  const XIAOE_WORLDBOOK_SEED_KEY = 'nagi_seed_xiaoe_worldbooks_v1'
  const XIAOE_WORLDBOOK_SEED_VERSION = 1

  async function readSeedJSON(path) {
    const response = await fetch(path + '?v=' + XIAOE_WORLDBOOK_SEED_VERSION)
    if (!response.ok) throw new Error('无法读取世界书文件：' + path)
    return response.json()
  }

  function convertImportedWorldbook(source, fallbackName, bookId) {
    const rawEntries = Array.isArray(source?.entries)
      ? source.entries
      : Object.values(source?.entries || {})

    return {
      id: bookId,
      name: source?.originalData?.name || fallbackName,
      scope: 'personal',
      charIds: [],
      enabled: true,
      entries: rawEntries.map((entry, index) => {
        const order = Number(entry?.order)
        return {
          id: bookId + '-entry-' + String(entry?.uid ?? index),
          title: String(entry?.comment || ('词条 ' + (index + 1))),
          keywords: entry?.constant
            ? []
            : (Array.isArray(entry?.key) ? entry.key.filter(Boolean).map(String) : []),
          enabled: entry?.disable !== true,
          position: 'middle',
          injectOrder: Number.isFinite(order) ? order : 100,
          content: typeof entry?.content === 'string' ? entry.content : ''
        }
      })
    }
  }

  async function seedXiaoeWorldbooks() {
    await waitForDatabase()
    const seeded = await db.config.get(XIAOE_WORLDBOOK_SEED_KEY)
    if (seeded && seeded.value === XIAOE_WORLDBOOK_SEED_VERSION) return

    const [itinerarySource, xiaoeSource] = await Promise.all([
      readSeedJSON('data/行程世界书-小e.json'),
      readSeedJSON('data/小e提示词v7.2(1).json')
    ])

    const importedBooks = [
      convertImportedWorldbook(itinerarySource, '行程世界书-小e', 'nagi-worldbook-xiaoe-itinerary-v1'),
      convertImportedWorldbook(xiaoeSource, '小e提示词v7.2', 'nagi-worldbook-xiaoe-v72-v1')
    ]

    const lorebookRow = await db.config.get('lorebooks')
    const lorebooks = Array.isArray(lorebookRow?.value) ? lorebookRow.value : []

    for (const book of importedBooks) {
      const existingIndex = lorebooks.findIndex(item => item && item.id === book.id)
      if (existingIndex >= 0) continue
      lorebooks.push(book)
    }

    await db.config.put({ key: 'lorebooks', value: lorebooks })
    await db.config.put({ key: XIAOE_WORLDBOOK_SEED_KEY, value: XIAOE_WORLDBOOK_SEED_VERSION })
  }

  seedNagiCharacters().catch(error => {
    console.error('[nagi-defaults] 首次预设录入失败:', error)
  })

  seedXiaoeWorldbooks().catch(error => {
    console.error('[nagi-defaults] 小e世界书导入失败:', error)
  })
})()
