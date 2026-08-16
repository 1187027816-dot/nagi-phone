// Nagi Phone character-fidelity layer.
// Keeps character data untouched and adjusts only private-chat prompt priority.
(function () {
  const originalBuildChatSystem = window.buildChatSystem
  if (typeof originalBuildChatSystem !== 'function') {
    console.warn('[nagi-persona] buildChatSystem 尚未加载')
    return
  }

  function buildPriorityAnchor(charName, userName) {
    return `# 【角色执行优先级】

本轮的首要任务不是生成一种泛化的“像角色扮演”的口吻，而是准确成为 **${charName}**。

执行层级：
1. 核心人设（CHAR）规定${charName}稳定的身份、人格、价值判断、语言习惯、欲望、边界与行为逻辑；不得擅自洗白、软化、讨好化、霸总模板化或替换成常见人设。
2. 对方设定（USER）、双方关系、世界书与长期记忆均为已发生或已确立的事实，必须与核心人设共同生效；USER 只描述${userName}，不得把其中的性格或经历错套给${charName}。
3. 最近对话决定此刻的情绪和具体反应，但不能抹掉长期稳定的人格。长对话中出现含混或冲突时，回到核心人设与明确世界书事实，不要沿着偶然措辞越演越偏。
4. 微信格式、状态、时间、消息能力和 JSON 仅是呈现工具。它们不得改变${charName}会说什么、为什么这样说，以及他与${userName}的关系位置。

回复前在内部快速核对：这句话是否只有${charName}会这样说；动机是否符合其核心人设；对${userName}的态度是否符合既定关系；是否出现通用套话、无依据的性格突变或把 USER 当成自己。发现偏差时先改正，再输出；不要展示核对过程。

---

`
  }

  function buildFinalAnchor(charName, userName) {
    return `# 【最终人设回锚】

现在依据完整 CHAR、USER、世界书、记忆与最近对话，由 **${charName}** 对 **${userName}** 作出本人的自然反应。具体措辞、主动性、情绪强度、亲疏和边界都必须从${charName}的人设推出，不使用“温柔霸总”“高冷但宠溺”等通用模板代替人物。技术格式只包装答案，不得压过人物。完成内部一致性检查后，仍严格按上述 JSON 格式输出，不解释规则。`
  }

  function moveAndLightenFormatBlock(prompt) {
    const marker = '# 【输出格式（最高优先级，全程生效）】'
    const start = prompt.indexOf(marker)
    if (start < 0) return prompt
    const separator = '\n---\n\n'
    const end = prompt.indexOf(separator, start)
    if (end < 0) return prompt

    let formatBlock = prompt.slice(start, end + separator.length)
    let remainder = prompt.slice(0, start) + prompt.slice(end + separator.length)
    formatBlock = formatBlock
      .replace(marker, '# 【输出格式（仅负责技术封装）】')
      .replace(/字段说明（四个键都必须出现[^\n]*）：/, '字段说明（四个键都必须出现）：')
      .replace(/- "chain"：[^\n]*/, '- "chain"：固定填写空字符串 ""，不要输出推理过程。')
      .replace(/^✅[^\n]*\n?/gm, '')

    const formatRule = '输出格式只负责封装已经依照人设得出的回答，不得反向改变角色语气、动机或关系逻辑。'
    if (!formatBlock.includes(formatRule)) {
      const firstBreak = formatBlock.indexOf('\n\n')
      formatBlock = formatBlock.slice(0, firstBreak + 2) + formatRule + '\n\n' + formatBlock.slice(firstBreak + 2)
    }
    return remainder.trim() + '\n\n' + formatBlock.trim()
  }

  window.buildChatSystem = async function (...args) {
    const charName = String(args[2] || '角色')
    const userName = String(args[3] || '用户')
    const originalPrompt = await originalBuildChatSystem.apply(this, args)
    const optimizedPrompt = moveAndLightenFormatBlock(String(originalPrompt || ''))
    return buildPriorityAnchor(charName, userName) + optimizedPrompt + '\n\n' + buildFinalAnchor(charName, userName)
  }
})()
