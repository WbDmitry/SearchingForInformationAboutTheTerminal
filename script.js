class TerminalSearch {
  constructor({
    inputSelector = '#search',
    suggestionsSelector = '#suggestions',
    resultSelector = '#result',
    clearButtonSelector = '#clearButton',
    terminals = []
  } = {}) {
    this.elements = {
      input: document.querySelector(inputSelector),
      suggestions: document.querySelector(suggestionsSelector),
      result: document.querySelector(resultSelector),
      clearButton: document.querySelector(clearButtonSelector)
    }

    this.terminals = terminals
    this.labels = {
      vendor: 'Производитель',
      model: 'Модель',
      connection_type: 'Тип связи',
      terminal_type: 'Тип терминала',
      pinpad: 'Пин-пад',
      sbp: 'СБП',
      preauth: 'Предавторизация',
      no_cash: 'Нет монет',
      qr_on_pinpad: 'QR на экране пин-пада'
    }

    this.init()
  }

  init() {
    this.setupEventListeners()
  }

  setupEventListeners() {
    this.elements.input.addEventListener('input', this.handleInput.bind(this))
    this.elements.clearButton.addEventListener('click', this.clearSearch.bind(this))
  }

  handleInput() {
    const searchTerm = this.elements.input.value.trim().toLowerCase()
    this.clearResults()

    if (!searchTerm) return

    const matches = this.getMatchingTerminals(searchTerm)

    if (matches.length === 1) {
      this.displayResult(matches[0])
    } else if (matches.length > 1) {
      this.displaySuggestions(matches)
    } else {
      this.showNoResultsMessage()
    }
  }

  getMatchingTerminals(searchTerm) {
    return this.terminals.filter(terminal =>
      terminal.model.toLowerCase().includes(searchTerm)
    )
  }

  clearResults() {
    this.elements.suggestions.innerHTML = ''
    this.elements.result.innerHTML = ''
  }

  clearSearch() {
    this.elements.input.value = ''
    this.clearResults()
    this.elements.input.focus()
  }

  displaySuggestions(matches) {
    matches.forEach(terminal => {
      const suggestionElement = document.createElement('div')
      suggestionElement.className = 'suggestion'
      suggestionElement.textContent = terminal.model
      suggestionElement.addEventListener('click', () => {
        this.elements.input.value = terminal.model
        this.clearResults()
        this.displayResult(terminal)
      })
      this.elements.suggestions.appendChild(suggestionElement)
    })
  }

  showNoResultsMessage() {
    this.elements.suggestions.innerHTML = '<div class="suggestion">Модель не найдена</div>'
  }

  displayResult(terminal) {
    const resultHTML = Object.entries(terminal)
      .filter(([key, value]) => key !== 'model' && value)
      .map(([key, value]) => this.createFieldHTML(key, value, terminal))
      .join('')

    this.elements.result.innerHTML = `
      <div class="field"><strong>Модель:</strong> ${terminal.model}</div>
      <div class="field"><strong>Тип терминала:</strong> ${terminal.terminal_type}</div>
      ${resultHTML}
    `
  }

  createFieldHTML(key, value, terminal) {
    const isNo = value.toString().trim().toLowerCase() === 'нет'
    const fieldClass = isNo ? ' gray' : ''

    let additionalHTML = ''

    if (key === 'sbp' && terminal.terminal_type?.toLowerCase().includes('интеграционный')) {
      additionalHTML = this.getSbpIntegrationMessage(terminal.model)
    }

    return `
      <div class="field${fieldClass}"><strong>${this.getLabel(key)}:</strong> ${value}</div>
      ${additionalHTML}
    `
  }

  getSbpIntegrationMessage(model) {
    const modelLower = model.toLowerCase()
    let message = ''

    if (modelLower === 'aisino v37') {
      message = 'Работаем с Эвотор. По другим кассам — в техподдержку производителя.'
    } else if (modelLower === 'teplo p8') {
      message = 'Работаем с R-Keeper. По другим кассам — в техподдержку производителя.'
    } else {
      message = 'Работаем с 1C, liko(Айка). По другим кассам — в техподдержку производителя.'
    }

    return `<div class="field highlight">${message}</div>`
  }

  getLabel(key) {
    return this.labels[key] || key
  }
}

const terminalSearch = new TerminalSearch({
  inputSelector: '#search',
  suggestionsSelector: '#suggestions',
  resultSelector: '#result',
  clearButtonSelector: '#clearButton',
  terminals: terminals
})
