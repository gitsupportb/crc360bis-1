import deadlineNotificationService, { type DeadlineEvent } from './deadline-notification-service'

interface RepWatchEvent {
  Code?: string
  code?: string
  Appellation?: string
  name?: string
  Frequency?: string
  frequency?: string
  Deadline?: Date | string
  deadline?: Date | string
  'Date d\'arrêté'?: Date | string
  dateArrete?: Date | string
  completed?: boolean
  regulator?: 'BAM' | 'AMMC' | 'DGI'
  categoryKey?: string
  category?: string
  categoryName?: string
}

class RepWatchDataSync {
  private static instance: RepWatchDataSync

  public static getInstance(): RepWatchDataSync {
    if (!RepWatchDataSync.instance) {
      RepWatchDataSync.instance = new RepWatchDataSync()
    }
    return RepWatchDataSync.instance
  }

  private constructor() {}

  private calculateDeadline(repDate: Date, rule: string): Date {
    const ruleText = rule.toLowerCase()
    const date = new Date(repDate)

    if (ruleText.includes('fin du mois suivant')) {
      const nextMonth = date.getMonth() + 1
      let year = date.getFullYear()
      let month = nextMonth
      
      if (month > 11) {
        month = 0
        year++
      }
      
      return new Date(year, month + 1, 0) // Last day of the following month
    }

    if (ruleText.includes('un mois') || ruleText.includes('30 jours')) {
      date.setDate(date.getDate() + 30)
      return date
    }

    if (ruleText.includes('15 jours')) {
      date.setDate(date.getDate() + 15)
      return date
    }

    if (ruleText.includes('12 jours')) {
      date.setDate(date.getDate() + 12)
      return date
    }

    if (ruleText.includes('7 jours')) {
      date.setDate(date.getDate() + 7)
      return date
    }

    // Default: assume 30 days
    date.setDate(date.getDate() + 30)
    return date
  }

  private generateAMMCEvents(dataArray: any[]): RepWatchEvent[] {
    const events: RepWatchEvent[] = []
    const currentDate = new Date()
    const selectedYear = currentDate.getFullYear()
    const startDate = new Date(selectedYear, 0, 1)
    const endDate = new Date(selectedYear + 2, 11, 31)

    dataArray.forEach(item => {
      const frequency = item.Frequency
      const normalizedFreq = frequency.toUpperCase()

      if (normalizedFreq === "HEBDOMADAIRE") {
        // Weekly reports: Generate for every week
        console.log(`📅 DEBUG: Generating HEBDOMADAIRE events for ${item.code} from ${startDate.toISOString()} to ${endDate.toISOString()}`)
        let tempDate = new Date(startDate)
        let weekCount = 0
        while (tempDate <= endDate && weekCount < 10) { // Limit to 10 weeks for debugging
          // For weekly reports, use Monday as the reference date
          const monday = new Date(tempDate)
          const dayOfWeek = monday.getDay()
          const daysToMonday = (dayOfWeek === 0) ? 1 : (8 - dayOfWeek) % 7
          monday.setDate(monday.getDate() + daysToMonday)

          const dateArrete = new Date(monday)
          const deadline = this.calculateAMMCDeadline(dateArrete, item.DeadlineRule, frequency)
          const daysRemaining = Math.ceil((deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

          const event = {
            code: item.code,
            Appellation: item.Appellation,
            Frequency: item.Frequency,
            deadline: deadline.toISOString().split('T')[0],
            dateArrete: dateArrete.toISOString().split('T')[0]
          }
          
          if (weekCount < 3) { // Log first 3 events
            console.log(`📅 DEBUG: Week ${weekCount + 1} - ${item.code}: dateArrete=${event.dateArrete}, deadline=${event.deadline}, daysRemaining=${daysRemaining}`)
          }
          
          events.push(event)
          tempDate.setDate(tempDate.getDate() + 7) // Next week
          weekCount++
        }
        console.log(`📅 DEBUG: Generated ${weekCount} weekly events for ${item.code}`)
      } else if (normalizedFreq === "MENSUELLE") {
        // Monthly reports: Generate for every month
        for (let year = selectedYear; year <= selectedYear + 1; year++) {
          for (let month = 0; month < 12; month++) {
            const dateArrete = new Date(year, month, 1) // First day of month
            const deadline = this.calculateAMMCDeadline(dateArrete, item.DeadlineRule, frequency)

            events.push({
              code: item.code,
              Appellation: item.Appellation,
              Frequency: item.Frequency,
              deadline: deadline.toISOString().split('T')[0],
              dateArrete: dateArrete.toISOString().split('T')[0]
            })
          }
        }
      } else if (normalizedFreq === "TRIMESTRIELLE") {
        // Quarterly reports: Generate for Q1, Q2, Q3, Q4
        for (let year = selectedYear; year <= selectedYear + 1; year++) {
          for (let quarter = 0; quarter < 4; quarter++) {
            const dateArrete = new Date(year, quarter * 3, 1) // First day of quarter
            const deadline = this.calculateAMMCDeadline(dateArrete, item.DeadlineRule, frequency)

            events.push({
              code: item.code,
              Appellation: item.Appellation,
              Frequency: item.Frequency,
              deadline: deadline.toISOString().split('T')[0],
              dateArrete: dateArrete.toISOString().split('T')[0]
            })
          }
        }
      } else if (normalizedFreq === "SEMESTRIELLE") {
        // Semi-annual reports: Generate for H1, H2
        for (let year = selectedYear; year <= selectedYear + 1; year++) {
          for (let semester = 0; semester < 2; semester++) {
            const dateArrete = new Date(year, semester * 6, 1) // First day of semester
            const deadline = this.calculateAMMCDeadline(dateArrete, item.DeadlineRule, frequency)

            events.push({
              code: item.code,
              Appellation: item.Appellation,
              Frequency: item.Frequency,
              deadline: deadline.toISOString().split('T')[0],
              dateArrete: dateArrete.toISOString().split('T')[0]
            })
          }
        }
      }
    })

    return events.sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
  }

  private calculateAMMCDeadline(dateArrete: Date, deadlineRule: string, frequency: string): Date {
    console.log(`📅 DEBUG: calculateAMMCDeadline - dateArrete: ${dateArrete.toISOString()}, rule: ${deadlineRule}, frequency: ${frequency}`)
    let deadline = new Date(dateArrete)

    if (deadlineRule.includes("Deuxième jour ouvré qui suit le vendredi")) {
      // Weekly: Second business day after Friday (Tuesday max)
      const reportDate = new Date(dateArrete)

      // Find the Friday of the week containing the report date
      const dayOfWeek = reportDate.getDay() // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
      let daysToFriday = (5 - dayOfWeek + 7) % 7
      if (dayOfWeek > 5) { // If Saturday or Sunday, move to next Friday
        daysToFriday = 6 - dayOfWeek + 5
      }

      const friday = new Date(reportDate)
      friday.setDate(friday.getDate() + daysToFriday)

      // Second business day after Friday = Tuesday (Friday + 4 days, skipping weekend)
      deadline = new Date(friday)
      deadline.setDate(deadline.getDate() + 4)

      return deadline
    } else if (deadlineRule.includes("5 jours après la fin du mois")) {
      // 5 days after month end
      const reportDate = new Date(dateArrete)
      // Get last day of the month
      const lastDayOfMonth = new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 0)
      deadline = new Date(lastDayOfMonth)
      deadline.setDate(deadline.getDate() + 5)
      return deadline
    } else if (deadlineRule.includes("10 jours après la fin du mois")) {
      // 10 days after month end
      const reportDate = new Date(dateArrete)
      // Get last day of the month
      const lastDayOfMonth = new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 0)
      deadline = new Date(lastDayOfMonth)
      deadline.setDate(deadline.getDate() + 10)
      return deadline
    } else if (deadlineRule.includes("1 mois après la fin du trimestre")) {
      // 1 month after quarter end
      const reportDate = new Date(dateArrete)
      const quarter = Math.floor(reportDate.getMonth() / 3)
      // Get last day of the quarter
      const lastDayOfQuarter = new Date(reportDate.getFullYear(), (quarter + 1) * 3, 0)
      deadline = new Date(lastDayOfQuarter)
      deadline.setMonth(deadline.getMonth() + 1)
      return deadline
    } else if (deadlineRule.includes("1 mois après la fin du semestre")) {
      // 1 month after semester end
      const reportDate = new Date(dateArrete)
      const semester = Math.floor(reportDate.getMonth() / 6)
      // Get last day of the semester (June 30 or December 31)
      const lastDayOfSemester = new Date(reportDate.getFullYear(), (semester + 1) * 6, 0)
      deadline = new Date(lastDayOfSemester)
      deadline.setMonth(deadline.getMonth() + 1)
      return deadline
    }

    return deadline
  }

  private generateDGIEvents(dataArray: any[]): RepWatchEvent[] {
    const events: RepWatchEvent[] = []
    const currentDate = new Date()
    const selectedYear = currentDate.getFullYear()
    const startDate = new Date(selectedYear, 0, 1)
    const endDate = new Date(selectedYear + 2, 11, 31)

    dataArray.forEach(item => {
      const frequency = item.Frequency
      const normalizedFreq = frequency.toUpperCase()

      if (normalizedFreq === "ANNUELLE") {
        // Annual reports: Generate for each year
        for (let year = selectedYear; year <= selectedYear + 1; year++) {
          const dateArrete = new Date(year - 1, 11, 31) // December 31 of previous year
          const deadline = this.calculateDGIDeadline(dateArrete, item.DeadlineRule, frequency)

          events.push({
            code: item.code,
            Appellation: item.Appellation,
            Frequency: item.Frequency,
            deadline: deadline.toISOString().split('T')[0],
            dateArrete: dateArrete.toISOString().split('T')[0]
          })
        }
      } else if (normalizedFreq === "TRIMESTRIELLE") {
        // Quarterly reports: Generate for Q1, Q2, Q3, Q4
        for (let year = selectedYear; year <= selectedYear + 1; year++) {
          for (let quarter = 0; quarter < 4; quarter++) {
            const dateArrete = new Date(year, quarter * 3 + 2, 0) // Last day of quarter
            const deadline = this.calculateDGIDeadline(dateArrete, item.DeadlineRule, frequency)

            events.push({
              code: item.code,
              Appellation: item.Appellation,
              Frequency: item.Frequency,
              deadline: deadline.toISOString().split('T')[0],
              dateArrete: dateArrete.toISOString().split('T')[0]
            })
          }
        }
      } else if (normalizedFreq === "MENSUELLE") {
        // Monthly reports: Generate for every month
        for (let year = selectedYear; year <= selectedYear + 1; year++) {
          for (let month = 0; month < 12; month++) {
            const dateArrete = new Date(year, month + 1, 0) // Last day of month
            const deadline = this.calculateDGIDeadline(dateArrete, item.DeadlineRule, frequency)

            events.push({
              code: item.code,
              Appellation: item.Appellation,
              Frequency: item.Frequency,
              deadline: deadline.toISOString().split('T')[0],
              dateArrete: dateArrete.toISOString().split('T')[0]
            })
          }
        }
      }
    })

    return events.sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
  }

  private calculateDGIDeadline(dateArrete: Date, deadlineRule: string, frequency: string): Date {
    let deadline = new Date(dateArrete)

    if (deadlineRule.includes("31 mars")) {
      // Annual declarations due March 31
      const reportYear = dateArrete.getFullYear()
      deadline = new Date(reportYear + 1, 2, 31) // March 31 of following year
      return deadline
    } else if (deadlineRule.includes("Avant la fin du mois qui suit")) {
      // Before end of following month
      deadline = new Date(dateArrete.getFullYear(), dateArrete.getMonth() + 2, 0)
      return deadline
    } else if (deadlineRule.includes("10 jours après la fin")) {
      // 10 days after the period end
      deadline.setDate(deadline.getDate() + 10)
      return deadline
    }

    return deadline
  }

  private getAMMCFallbackData() {
    return {
      BCP: [
        {
          code: "AMMC-BCP-001",
          Appellation: "Rapport de contrôle des OPCVM",
          Frequency: "HEBDOMADAIRE",
          Support: "SESAM",
          DeadlineRule: "Deuxième jour ouvré qui suit le vendredi de chaque semaine (mardi maximum)",
          Category: "AMMC - BCP",
          Entity: "BCP"
        },
        {
          code: "AMMC-BCP-002",
          Appellation: "Notifications des opérations de prêts de titres",
          Frequency: "MENSUELLE",
          Support: "SESAM",
          DeadlineRule: "5 jours après la fin du mois",
          Category: "AMMC - BCP",
          Entity: "BCP"
        },
        {
          code: "AMMC-BCP-003",
          Appellation: "Annexe de programme de rachat",
          Frequency: "MENSUELLE",
          Support: "Envoi électronique",
          DeadlineRule: "5 jours après la fin du mois",
          Category: "AMMC - BCP",
          Entity: "BCP"
        },
        {
          code: "AMMC-BCP-004",
          Appellation: "Transactions boursières",
          Frequency: "MENSUELLE",
          Support: "Envoi électronique",
          DeadlineRule: "5 jours après la fin du mois",
          Category: "AMMC - BCP",
          Entity: "BCP"
        },
        {
          code: "AMMC-BCP-005",
          Appellation: "Répartition des souscripteurs actions ou parts OPCVM",
          Frequency: "MENSUELLE",
          Support: "SESAM",
          DeadlineRule: "10 jours après la fin du mois",
          Category: "AMMC - BCP",
          Entity: "BCP"
        },
        {
          code: "AMMC-BCP-006",
          Appellation: "Indicateurs d'activité",
          Frequency: "TRIMESTRIELLE",
          Support: "SESAM",
          DeadlineRule: "1 mois après la fin du trimestre",
          Category: "AMMC - BCP",
          Entity: "BCP"
        }
      ],
      BCP2S: [
        {
          code: "AMMC-BCP2S-001",
          Appellation: "États de synthèse semestriels",
          Frequency: "SEMESTRIELLE",
          Support: "SESAM",
          DeadlineRule: "1 mois après la fin du semestre",
          Category: "AMMC - BCP2S",
          Entity: "BCP2S"
        },
        {
          code: "AMMC-BCP2S-002",
          Appellation: "Rapport semestriel",
          Frequency: "SEMESTRIELLE",
          Support: "SESAM",
          DeadlineRule: "1 mois après la fin du semestre",
          Category: "AMMC - BCP2S",
          Entity: "BCP2S"
        }
      ],
      BANK_AL_YOUSR: [
        {
          code: "AMMC-BAY-001",
          Appellation: "États de synthèse trimestriels",
          Frequency: "TRIMESTRIELLE",
          Support: "SESAM",
          DeadlineRule: "1 mois après la fin du trimestre",
          Category: "AMMC - BANK AL YOUSR",
          Entity: "BANK AL YOUSR"
        }
      ]
    }
  }

  private getDGIFallbackData() {
    return [
      // Annual Declarations (10 reportings) - Due March 31
      {
        code: "DGI-001",
        Appellation: "Déclaration de la contribution sociale de solidarité sur les bénéfices et revenus",
        Frequency: "ANNUELLE",
        Support: "Télétransmission",
        DeadlineRule: "31 mars",
        Category: "DGI - Direction Générale des Impôts",
        Entity: "DGI"
      },
      {
        code: "DGI-002",
        Appellation: "Déclaration du prorata des déductions",
        Frequency: "ANNUELLE",
        Support: "Télétransmission",
        DeadlineRule: "31 mars",
        Category: "DGI - Direction Générale des Impôts",
        Entity: "DGI"
      },
      {
        code: "DGI-003",
        Appellation: "Déclaration des Produits des actions, parts sociales et revenus assimilés",
        Frequency: "ANNUELLE",
        Support: "Télétransmission",
        DeadlineRule: "31 mars",
        Category: "DGI - Direction Générale des Impôts",
        Entity: "DGI"
      },
      {
        code: "DGI-004",
        Appellation: "Déclaration Prorata de déduction",
        Frequency: "ANNUELLE",
        Support: "Télétransmission",
        DeadlineRule: "31 mars",
        Category: "DGI - Direction Générale des Impôts",
        Entity: "DGI"
      },
      {
        code: "DGI-005",
        Appellation: "Déclaration des rémunérations versées à des personnes non-résidentes",
        Frequency: "ANNUELLE",
        Support: "Télétransmission",
        DeadlineRule: "31 mars",
        Category: "DGI - Direction Générale des Impôts",
        Entity: "DGI"
      },
      {
        code: "DGI-006",
        Appellation: "Déclaration des produits de placement à revenu fixe et des revenus des certificats de sukuk",
        Frequency: "ANNUELLE",
        Support: "Télétransmission",
        DeadlineRule: "31 mars",
        Category: "DGI - Direction Générale des Impôts",
        Entity: "DGI"
      },
      {
        code: "DGI-007",
        Appellation: "Déclaration du Résultat Fiscale & Liasse Comptable",
        Frequency: "ANNUELLE",
        Support: "Télétransmission",
        DeadlineRule: "31 mars",
        Category: "DGI - Direction Générale des Impôts",
        Entity: "DGI"
      },
      {
        code: "DGI-008",
        Appellation: "Versement de contribution sociale de solidarité sur les bénéfices et revenus",
        Frequency: "ANNUELLE",
        Support: "Télétransmission",
        DeadlineRule: "31 mars",
        Category: "DGI - Direction Générale des Impôts",
        Entity: "DGI"
      },
      {
        code: "DGI-009",
        Appellation: "Versement Reliquat IS",
        Frequency: "ANNUELLE",
        Support: "Télétransmission",
        DeadlineRule: "31 mars",
        Category: "DGI - Direction Générale des Impôts",
        Entity: "DGI"
      },
      {
        code: "DGI-010",
        Appellation: "Déclaration des rémunérations allouées à des tiers",
        Frequency: "ANNUELLE",
        Support: "Télétransmission",
        DeadlineRule: "31 mars",
        Category: "DGI - Direction Générale des Impôts",
        Entity: "DGI"
      },
      // Quarterly Declarations (2 reportings) - Due before end of following month
      {
        code: "DGI-011",
        Appellation: "Acomptes IS",
        Frequency: "TRIMESTRIELLE",
        Support: "Télétransmission",
        DeadlineRule: "Avant la fin du mois qui suit",
        Category: "DGI - Direction Générale des Impôts",
        Entity: "DGI"
      },
      {
        code: "DGI-012",
        Appellation: "Déclaration de TVA",
        Frequency: "MENSUELLE",
        Support: "Télétransmission",
        DeadlineRule: "Avant la fin du mois qui suit",
        Category: "DGI - Direction Générale des Impôts",
        Entity: "DGI"
      }
    ]
  }

  private async processAllReportingsData(data: any, regulators: { BAM?: boolean, AMMC?: boolean, DGI?: boolean }): Promise<DeadlineEvent[]> {
    const allDeadlines: DeadlineEvent[] = []
    
    // Process BAM categories
    if (regulators.BAM) {
      const bamCategories = ['I', 'II', 'III']
      bamCategories.forEach(categoryKey => {
        const category = data.categories[categoryKey]
        if (category && category.reportings) {
          Object.values(category.reportings).forEach((reporting: any) => {
            const events = this.generateEventsFromReporting(reporting, 'BAM', categoryKey)
            allDeadlines.push(...events)
          })
        }
      })
    }
    
    // Process AMMC categories
    if (regulators.AMMC) {
      const ammcCategories = ['AMMC_BCP', 'AMMC_BCP2S', 'AMMC_BANK_AL_YOUSR']
      ammcCategories.forEach(categoryKey => {
        const category = data.categories[categoryKey]
        if (category && category.reportings) {
          Object.values(category.reportings).forEach((reporting: any) => {
            const events = this.generateEventsFromReporting(reporting, 'AMMC', categoryKey)
            allDeadlines.push(...events)
          })
        }
      })
    }
    
    // Process DGI category
    if (regulators.DGI) {
      const dgiCategory = data.categories['DGI']
      if (dgiCategory && dgiCategory.reportings) {
        Object.values(dgiCategory.reportings).forEach((reporting: any) => {
          const events = this.generateEventsFromReporting(reporting, 'DGI', 'DGI')
          allDeadlines.push(...events)
        })
      }
    }
    
    return allDeadlines
  }

  private parseRepWatchEvent(event: RepWatchEvent, regulator: 'BAM' | 'AMMC' | 'DGI', categoryKey: string): DeadlineEvent | null {
    try {
      const code = event.Code || event.code || 'UNKNOWN'
      const name = event.Appellation || event.name || code
      const frequency = event.Frequency || event.frequency || 'Unknown'
      
      let deadline: Date
      if (event.Deadline) {
        deadline = typeof event.Deadline === 'string' ? new Date(event.Deadline) : event.Deadline
      } else if (event.deadline) {
        deadline = typeof event.deadline === 'string' ? new Date(event.deadline) : event.deadline
      } else {
        console.warn(`No deadline found for event: ${name}`)
        return null
      }

      let dateArrete: Date | undefined
      if (event['Date d\'arrêté']) {
        dateArrete = typeof event['Date d\'arrêté'] === 'string' ? new Date(event['Date d\'arrêté']) : event['Date d\'arrêté']
      } else if (event.dateArrete) {
        dateArrete = typeof event.dateArrete === 'string' ? new Date(event.dateArrete) : event.dateArrete
      }

      const categoryName = event.category || event.categoryName || this.getCategoryName(regulator, categoryKey)

      // Calculate days remaining and urgency level using EXACT RepWatch dashboard logic
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      // Use exact same logic as RepWatch: daysUntil <= 3 ? 'urgent' : (daysUntil <= 7 ? 'warning' : 'normal')
      let urgencyLevel: 'urgent' | 'warning' | 'normal' = 'normal'
      if (daysRemaining <= 3) urgencyLevel = 'urgent'
      else if (daysRemaining <= 7) urgencyLevel = 'warning'
      else urgencyLevel = 'normal'

      return {
        id: `${regulator}-${categoryKey}-${code}-${deadline.getTime()}`,
        code,
        name,
        description: name,
        deadline,
        dateArrete,
        frequency,
        regulator,
        category: categoryName,
        categoryKey,
        completed: event.completed || false,
        daysRemaining,
        urgencyLevel,
        url: this.getEventUrl(regulator, categoryKey)
      }
    } catch (error) {
      console.error('Failed to parse RepWatch event:', error, event)
      return null
    }
  }

  private getCategoryName(regulator: 'BAM' | 'AMMC' | 'DGI', categoryKey: string): string {
    if (regulator === 'BAM') {
      switch (categoryKey) {
        case 'I': return 'I – Situation comptable et états annexes'
        case 'II': return 'II – Etats de synthèse et documents qui leur sont complémentaires'
        case 'III': return 'III – Etats relatifs à la réglementation prudentielle'
        default: return categoryKey
      }
    }
    
    if (regulator === 'AMMC') {
      switch (categoryKey) {
        case 'AMMC_BCP': return 'AMMC - BCP'
        case 'AMMC_BCP2S': return 'AMMC - BCP2S'
        case 'AMMC_BANK_AL_YOUSR': return 'AMMC - BANK AL YOUSR'
        default: return categoryKey.replace('AMMC_', 'AMMC - ')
      }
    }
    
    return categoryKey
  }

  private getEventUrl(regulator: 'BAM' | 'AMMC' | 'DGI', categoryKey: string): string {
    const baseUrl = '/rep-watch'
    switch (regulator) {
      case 'BAM':
        return `${baseUrl}#bam-${categoryKey.toLowerCase()}`
      case 'AMMC':
        return `${baseUrl}#ammc-${categoryKey.toLowerCase().replace('_', '-')}`
      case 'DGI':
        return `${baseUrl}#dgi`
      default:
        return baseUrl
    }
  }

  public async syncRepWatchData(regulatorSettings?: { BAM?: boolean, AMMC?: boolean, DGI?: boolean }): Promise<DeadlineEvent[]> {
    const allDeadlines: DeadlineEvent[] = []

    try {
      // Get regulator settings from parameters or default to all enabled
      const enabledRegulators = regulatorSettings || { BAM: true, AMMC: true, DGI: true }
      console.log('📅 DEBUG: syncRepWatchData called with regulators:', regulatorSettings)
      console.log('📅 DEBUG: Final enabled regulators:', enabledRegulators)

      // First try to load from dashboard-generated localStorage data
      const bamCat1Data = this.getStoredData('eventsCat1') || []
      const bamCat2Data = this.getStoredData('eventsCat2') || []
      const bamCat3Data = this.getStoredData('eventsCat3') || []
      
      // Also check for AMMC and DGI data
      const ammcBcpData = this.getStoredData('ammcBcpData') || []
      const ammcBcp2sData = this.getStoredData('ammcBcp2sData') || []
      const ammcBankAlYousrData = this.getStoredData('ammcBankAlYousrData') || []
      const dgiData = this.getStoredData('dgiData') || []
      
      console.log(`📅 DEBUG: Dashboard data found - BAM: Cat1(${bamCat1Data.length}), Cat2(${bamCat2Data.length}), Cat3(${bamCat3Data.length})`)
      console.log(`📅 DEBUG: Dashboard data found - AMMC: BCP(${ammcBcpData.length}), BCP2S(${ammcBcp2sData.length}), BAY(${ammcBankAlYousrData.length})`)
      console.log(`📅 DEBUG: Dashboard data found - DGI: (${dgiData.length}) items`)

      // Check if we have any dashboard data for enabled regulators
      const hasBAMData = !enabledRegulators.BAM || (bamCat1Data.length > 0 || bamCat2Data.length > 0 || bamCat3Data.length > 0)
      const hasAMMCData = !enabledRegulators.AMMC || (ammcBcpData.length > 0 || ammcBcp2sData.length > 0 || ammcBankAlYousrData.length > 0)
      const hasDGIData = !enabledRegulators.DGI || (dgiData.length > 0)
      
      const hasSufficientDashboardData = hasBAMData && hasAMMCData && hasDGIData
      
      console.log(`📅 DEBUG: Data availability - BAM: ${hasBAMData}, AMMC: ${hasAMMCData}, DGI: ${hasDGIData}`)
      console.log(`📅 DEBUG: Has sufficient dashboard data for enabled regulators: ${hasSufficientDashboardData}`)
      
      // Use mixed approach: process available dashboard data + fallback for missing data
      let useFallback = false
      if (!hasSufficientDashboardData) {
        console.log('📅 Some data missing, will use mixed dashboard + fallback approach')
        useFallback = true
      }

      // Process BAM data if enabled - EXACT SAME LOGIC AS RepWatch getUpcomingEventsByCategory
      if (enabledRegulators.BAM) {
        console.log(`📊 Processing BAM data: Cat1(${bamCat1Data.length}), Cat2(${bamCat2Data.length}), Cat3(${bamCat3Data.length})`)
        
        const bamEventsCount = bamCat1Data.length + bamCat2Data.length + bamCat3Data.length
        
        if (bamEventsCount > 0) {
          console.log(`📊 Processing ${bamEventsCount} BAM events from localStorage using RepWatch getUpcomingEventsByCategory logic`)
          
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const currentYear = new Date().getFullYear()
          
          // Load completion status for BAM events - EXACT SAME LOGIC AS RepWatch 
          console.log('📊 Loading BAM completion status using RepWatch logic...')
          
          // Load progress for each category
          const loadProgressForCategory = (key: string, events: RepWatchEvent[]) => {
            const saved = localStorage.getItem(key)
            if (saved) {
              try {
                const arr = JSON.parse(saved)
                if (arr.length === events.length) {
                  arr.forEach((progress: number, index: number) => {
                    if (events[index]) {
                      events[index].progress = progress
                      events[index].completed = progress === 100
                    }
                  })
                  console.log(`📊 Loaded progress for ${key}: ${arr.filter((p: number) => p === 100).length}/${arr.length} completed`)
                }
              } catch (error) {
                console.error(`Failed to load progress for ${key}:`, error)
              }
            }
          }
          
          // Load sent status
          const loadSentStatus = (events: RepWatchEvent[]) => {
            const storageKey = `sentStatus_${currentYear}`
            const sentData = JSON.parse(localStorage.getItem(storageKey) || '{}')
            events.forEach(event => {
              const sentKey = `${event.Code || event.code || ''}_${event.Deadline instanceof Date ? event.Deadline.getTime() : new Date(event.Deadline || '').getTime()}`
              if (sentData[sentKey]) {
                event.sent = true
                event.completed = true // RepWatch syncs sent status with completed
              }
            })
          }
          
          // Load completion status for each category - EXACT SAME AS RepWatch
          loadProgressForCategory(`progressCat1_${currentYear}`, bamCat1Data)
          loadProgressForCategory(`progressCat2_${currentYear}`, bamCat2Data)
          loadProgressForCategory(`progressCat3_${currentYear}`, bamCat3Data)
          
          loadSentStatus(bamCat1Data)
          loadSentStatus(bamCat2Data)
          loadSentStatus(bamCat3Data)
          
          // Process BAM Category I - use EXACT SAME logic as RepWatch dashboard
          console.log(`📊 DEBUG: Processing BAM Category I - ${bamCat1Data.length} events`)
          bamCat1Data.forEach((event: RepWatchEvent) => {
            if (event.Deadline instanceof Date || (typeof event.Deadline === 'string' && event.Deadline)) {
              const eventDate = event.Deadline instanceof Date ? event.Deadline : new Date(event.Deadline)
              
              // EXACT SAME FILTERING LOGIC AS RepWatch getUpcomingEventsByCategory
              if (!isNaN(eventDate.getTime()) && eventDate >= today) {
                const deadline = this.parseRepWatchEvent({ 
                  ...event, 
                  regulator: 'BAM',
                  categoryKey: 'I',
                  categoryName: 'I – Situation comptable et états annexes'
                }, 'BAM', 'I')
                if (deadline) {
                  allDeadlines.push(deadline)
                  console.log(`📊 DEBUG: Added BAM Cat I deadline: ${deadline.name} - ${deadline.deadline} (completed: ${deadline.completed})`)
                }
              }
            }
          })

          // Process BAM Category II - use EXACT SAME logic as RepWatch dashboard
          console.log(`📊 DEBUG: Processing BAM Category II - ${bamCat2Data.length} events`)
          bamCat2Data.forEach((event: RepWatchEvent) => {
            if (event.Deadline instanceof Date || (typeof event.Deadline === 'string' && event.Deadline)) {
              const eventDate = event.Deadline instanceof Date ? event.Deadline : new Date(event.Deadline)
              
              // EXACT SAME FILTERING LOGIC AS RepWatch getUpcomingEventsByCategory
              if (!isNaN(eventDate.getTime()) && eventDate >= today) {
                const deadline = this.parseRepWatchEvent({ 
                  ...event, 
                  regulator: 'BAM',
                  categoryKey: 'II',
                  categoryName: 'II – Etats de synthèse et documents qui leur sont complémentaires'
                }, 'BAM', 'II')
                if (deadline) {
                  allDeadlines.push(deadline)
                  console.log(`📊 DEBUG: Added BAM Cat II deadline: ${deadline.name} - ${deadline.deadline} (completed: ${deadline.completed})`)
                }
              }
            }
          })

          // Process BAM Category III - use EXACT SAME logic as RepWatch dashboard  
          console.log(`📊 DEBUG: Processing BAM Category III - ${bamCat3Data.length} events`)
          bamCat3Data.forEach((event: RepWatchEvent) => {
            if (event.Deadline instanceof Date || (typeof event.Deadline === 'string' && event.Deadline)) {
              const eventDate = event.Deadline instanceof Date ? event.Deadline : new Date(event.Deadline)
              
              // EXACT SAME FILTERING LOGIC AS RepWatch getUpcomingEventsByCategory
              if (!isNaN(eventDate.getTime()) && eventDate >= today) {
                const deadline = this.parseRepWatchEvent({ 
                  ...event, 
                  regulator: 'BAM',
                  categoryKey: 'III',
                  categoryName: 'III – Etats relatifs à la réglementation prudentielle'
                }, 'BAM', 'III')
                if (deadline) {
                  allDeadlines.push(deadline)
                  console.log(`📊 DEBUG: Added BAM Cat III deadline: ${deadline.name} - ${deadline.deadline} (completed: ${deadline.completed})`)
                }
              }
            }
          })
          
          const bamDeadlinesAdded = allDeadlines.filter(d => d.regulator === 'BAM').length
          const completedBam = allDeadlines.filter(d => d.regulator === 'BAM' && d.completed).length
          console.log(`📊 DEBUG: Total BAM deadlines processed: ${bamDeadlinesAdded} (${completedBam} completed, ${bamDeadlinesAdded - completedBam} pending)`)
        } else {
          console.log(`📊 No BAM data in localStorage, loading BAM data from ALL_REPORTINGS.json`)
          // Load BAM data from ALL_REPORTINGS.json if localStorage is empty
          try {
            const response = await fetch('/ALL_REPORTINGS.json')
            if (response.ok) {
              const data = await response.json()
              const bamDeadlines = await this.processAllReportingsData(data, { BAM: true, AMMC: false, DGI: false })
              console.log(`📊 Loaded ${bamDeadlines.length} BAM deadlines from ALL_REPORTINGS.json`)
              allDeadlines.push(...bamDeadlines)
            }
          } catch (error) {
            console.warn('Failed to load BAM data from ALL_REPORTINGS.json:', error)
          }
        }
      }

      // Generate and process AMMC events using the same logic as RepWatch if enabled
      if (enabledRegulators.AMMC) {
        console.log(`📊 Processing AMMC data: BCP(${ammcBcpData.length}), BCP2S(${ammcBcp2sData.length}), BAY(${ammcBankAlYousrData.length})`)
        
        if (ammcBcpData.length > 0) {
          console.log(`📊 Generating AMMC BCP events from ${ammcBcpData.length} items`)
          const ammcBcpEvents = this.generateAMMCEvents(ammcBcpData)
          console.log(`📊 Generated ${ammcBcpEvents.length} AMMC BCP events`)
          ammcBcpEvents.forEach((event: RepWatchEvent) => {
            const deadline = this.parseRepWatchEvent({ ...event, regulator: 'AMMC' }, 'AMMC', 'AMMC_BCP')
            if (deadline) allDeadlines.push(deadline)
          })
        }

        if (ammcBcp2sData.length > 0) {
          console.log(`📊 Generating AMMC BCP2S events from ${ammcBcp2sData.length} items`)
          const ammcBcp2sEvents = this.generateAMMCEvents(ammcBcp2sData)
          console.log(`📊 Generated ${ammcBcp2sEvents.length} AMMC BCP2S events`)
          ammcBcp2sEvents.forEach((event: RepWatchEvent) => {
            const deadline = this.parseRepWatchEvent({ ...event, regulator: 'AMMC' }, 'AMMC', 'AMMC_BCP2S')
            if (deadline) allDeadlines.push(deadline)
          })
        }

        if (ammcBankAlYousrData.length > 0) {
          console.log(`📊 Generating AMMC BANK AL YOUSR events from ${ammcBankAlYousrData.length} items`)
          const ammcBayEvents = this.generateAMMCEvents(ammcBankAlYousrData)
          console.log(`📊 Generated ${ammcBayEvents.length} AMMC BANK AL YOUSR events`)
          ammcBayEvents.forEach((event: RepWatchEvent) => {
            const deadline = this.parseRepWatchEvent({ ...event, regulator: 'AMMC' }, 'AMMC', 'AMMC_BANK_AL_YOUSR')
            if (deadline) allDeadlines.push(deadline)
          })
        }
      }

      // Generate and process DGI events using the same logic as RepWatch if enabled
      if (enabledRegulators.DGI) {
        console.log(`📊 Processing DGI data: (${dgiData.length}) items`)
        
        if (dgiData.length > 0) {
          console.log(`📊 Generating DGI events from ${dgiData.length} items`)
          const dgiEvents = this.generateDGIEvents(dgiData)
          console.log(`📊 Generated ${dgiEvents.length} DGI events`)
          dgiEvents.forEach((event: RepWatchEvent) => {
            const deadline = this.parseRepWatchEvent({ ...event, regulator: 'DGI' }, 'DGI', 'DGI')
            if (deadline) allDeadlines.push(deadline)
          })
        }
      }

      // Store consolidated data
      this.storeConsolidatedData(allDeadlines)
      
      console.log(`📅 Synced ${allDeadlines.length} RepWatch deadlines`)
      return allDeadlines

    } catch (error) {
      console.error('Failed to sync RepWatch data:', error)
      return []
    }
  }

  private getStoredData(key: string): any[] {
    try {
      if (typeof window === 'undefined') return []
      
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn(`Failed to load stored data for key: ${key}`, error)
      return []
    }
  }

  private storeConsolidatedData(deadlines: DeadlineEvent[]): void {
    try {
      if (typeof window === 'undefined') return
      
      localStorage.setItem('rep-watch-deadlines', JSON.stringify(deadlines))
      console.log(`📅 Stored ${deadlines.length} consolidated deadlines`)
    } catch (error) {
      console.error('Failed to store consolidated deadlines:', error)
    }
  }

  public async checkAndNotifyUpcomingDeadlines(): Promise<void> {
    try {
      const deadlines = await this.syncRepWatchData()
      if (deadlines.length > 0) {
        await deadlineNotificationService.checkAndSendNotifications(deadlines)
      }
    } catch (error) {
      console.error('Failed to check and notify upcoming deadlines:', error)
    }
  }

  public schedulePeriodicSync(): void {
    if (typeof window === 'undefined') return

    // Initial sync
    this.checkAndNotifyUpcomingDeadlines()

    // Sync every hour
    setInterval(() => {
      this.checkAndNotifyUpcomingDeadlines()
    }, 60 * 60 * 1000)

    // Daily sync at 8 AM
    const now = new Date()
    const eightAM = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0, 0)
    const msUntilEightAM = eightAM.getTime() - now.getTime()

    setTimeout(() => {
      this.checkAndNotifyUpcomingDeadlines()
      setInterval(() => {
        this.checkAndNotifyUpcomingDeadlines()
      }, 24 * 60 * 60 * 1000) // Every 24 hours
    }, msUntilEightAM)

    console.log('📅 Scheduled periodic RepWatch data sync')
  }

  private async loadFromReportingsFileWithFallbacks(enabledRegulators?: { BAM?: boolean, AMMC?: boolean, DGI?: boolean }): Promise<DeadlineEvent[]> {
    const allDeadlines: DeadlineEvent[] = []
    const regulators = enabledRegulators || { BAM: true, AMMC: true, DGI: true }

    try {
      // First try to load from ALL_REPORTINGS.json
      const response = await fetch('/ALL_REPORTINGS.json')
      
      if (response.ok) {
        console.log('📅 Successfully loaded ALL_REPORTINGS.json, processing...')
        const result = await this.processAllReportingsData(await response.json(), regulators)
        if (result.length > 0) {
          console.log(`📅 Loaded ${result.length} deadlines from ALL_REPORTINGS.json`)
          return result
        }
      }
    } catch (error) {
      console.warn('Failed to fetch ALL_REPORTINGS.json:', error)
    }

    // Fallback to hardcoded data (same as RepWatch dashboard)
    console.log('📅 Using hardcoded fallback data (same as RepWatch dashboard)...')
    
    // Generate AMMC events if enabled
    if (regulators.AMMC) {
      console.log('📅 DEBUG: Processing AMMC fallback data...')
      const ammcFallbackData = this.getAMMCFallbackData()
      console.log(`📅 DEBUG: AMMC fallback data - BCP: ${ammcFallbackData.BCP.length}, BCP2S: ${ammcFallbackData.BCP2S.length}, BANK_AL_YOUSR: ${ammcFallbackData.BANK_AL_YOUSR.length}`)
      
      // Process BCP data
      if (ammcFallbackData.BCP.length > 0) {
        console.log(`📅 DEBUG: Generating AMMC BCP events from ${ammcFallbackData.BCP.length} items...`)
        const bcpEvents = this.generateAMMCEvents(ammcFallbackData.BCP)
        console.log(`📅 DEBUG: Generated ${bcpEvents.length} AMMC BCP events`)
        bcpEvents.forEach((event: RepWatchEvent, index: number) => {
          console.log(`📅 DEBUG: Processing AMMC BCP event ${index + 1}: ${event.Appellation} (${event.deadline})`)
          const deadline = this.parseRepWatchEvent({ ...event, regulator: 'AMMC' }, 'AMMC', 'AMMC_BCP')
          if (deadline) {
            allDeadlines.push(deadline)
            console.log(`📅 DEBUG: ✅ Added AMMC BCP deadline: ${deadline.name} - ${deadline.deadline}`)
          } else {
            console.log(`📅 DEBUG: ❌ Failed to parse AMMC BCP event: ${event.Appellation}`)
          }
        })
      }

      // Process BCP2S data  
      if (ammcFallbackData.BCP2S.length > 0) {
        const bcp2sEvents = this.generateAMMCEvents(ammcFallbackData.BCP2S)
        bcp2sEvents.forEach((event: RepWatchEvent) => {
          const deadline = this.parseRepWatchEvent({ ...event, regulator: 'AMMC' }, 'AMMC', 'AMMC_BCP2S')
          if (deadline) allDeadlines.push(deadline)
        })
      }

      // Process BANK AL YOUSR data
      if (ammcFallbackData.BANK_AL_YOUSR.length > 0) {
        const bayEvents = this.generateAMMCEvents(ammcFallbackData.BANK_AL_YOUSR)
        bayEvents.forEach((event: RepWatchEvent) => {
          const deadline = this.parseRepWatchEvent({ ...event, regulator: 'AMMC' }, 'AMMC', 'AMMC_BANK_AL_YOUSR')
          if (deadline) allDeadlines.push(deadline)
        })
      }
    }

    // Generate DGI events if enabled
    if (regulators.DGI) {
      console.log('📅 DEBUG: Processing DGI fallback data...')
      const dgiFallbackData = this.getDGIFallbackData()
      console.log(`📅 DEBUG: DGI fallback data: ${dgiFallbackData.length} items`)
      if (dgiFallbackData.length > 0) {
        console.log(`📅 DEBUG: Generating DGI events from ${dgiFallbackData.length} items...`)
        const dgiEvents = this.generateDGIEvents(dgiFallbackData)
        console.log(`📅 DEBUG: Generated ${dgiEvents.length} DGI events`)
        dgiEvents.forEach((event: RepWatchEvent) => {
          const deadline = this.parseRepWatchEvent({ ...event, regulator: 'DGI' }, 'DGI', 'DGI')
          if (deadline) {
            allDeadlines.push(deadline)
            console.log(`📅 DEBUG: Added DGI deadline: ${deadline.name} - ${deadline.deadline}`)
          }
        })
      }
    }

    // BAM data fallback would go here if needed (RepWatch loads it from ALL_REPORTINGS.json)
    if (regulators.BAM && allDeadlines.length === 0) {
      // Try original ALL_REPORTINGS.json processing
      const originalResult = await this.loadFromReportingsFile(regulators)
      allDeadlines.push(...originalResult)
    }

    this.storeConsolidatedData(allDeadlines)
    console.log(`📅 DEBUG: Final fallback result - loaded ${allDeadlines.length} deadlines`)
    
    // Log some sample deadlines for debugging
    if (allDeadlines.length > 0) {
      console.log('📅 DEBUG: Sample deadlines:', allDeadlines.slice(0, 3).map(d => `${d.regulator}-${d.name}-${d.deadline}`))
    } else {
      console.warn('📅 WARNING: No deadlines generated from fallback data!')
    }
    
    return allDeadlines
  }

  private async loadFromReportingsFile(enabledRegulators?: { BAM?: boolean, AMMC?: boolean, DGI?: boolean }): Promise<DeadlineEvent[]> {
    try {
      const response = await fetch('/ALL_REPORTINGS.json')
      if (!response.ok) {
        console.warn('Failed to fetch ALL_REPORTINGS.json:', response.statusText)
        return []
      }
      
      const data = await response.json()
      const allDeadlines: DeadlineEvent[] = []
      
      // Process BAM categories
      const bamCategories = ['I', 'II', 'III']
      bamCategories.forEach(categoryKey => {
        const category = data.categories[categoryKey]
        if (category && category.reportings) {
          Object.values(category.reportings).forEach((reporting: any) => {
            // Generate deadline events for this reporting
            const events = this.generateEventsFromReporting(reporting, 'BAM', categoryKey)
            allDeadlines.push(...events)
          })
        }
      })
      
      // Process AMMC categories
      const ammcCategories = ['AMMC_BCP', 'AMMC_BCP2S', 'AMMC_BANK_AL_YOUSR']
      ammcCategories.forEach(categoryKey => {
        const category = data.categories[categoryKey]
        if (category && category.reportings) {
          Object.values(category.reportings).forEach((reporting: any) => {
            const events = this.generateEventsFromReporting(reporting, 'AMMC', categoryKey)
            allDeadlines.push(...events)
          })
        }
      })
      
      // Process DGI category
      const dgiCategory = data.categories['DGI']
      if (dgiCategory && dgiCategory.reportings) {
        Object.values(dgiCategory.reportings).forEach((reporting: any) => {
          const events = this.generateEventsFromReporting(reporting, 'DGI', 'DGI')
          allDeadlines.push(...events)
        })
      }
      
      // Store consolidated data
      this.storeConsolidatedData(allDeadlines)
      
      console.log(`📅 Loaded ${allDeadlines.length} deadlines from ALL_REPORTINGS.json`)
      return allDeadlines
      
    } catch (error) {
      console.error('Failed to load from ALL_REPORTINGS.json:', error)
      return []
    }
  }

  private generateEventsFromReporting(reporting: any, regulator: 'BAM' | 'AMMC' | 'DGI', categoryKey: string): DeadlineEvent[] {
    const events: DeadlineEvent[] = []
    
    // Generate events for the current year based on frequency
    const currentYear = new Date().getFullYear()
    const frequency = reporting.frequency?.toLowerCase() || 'mensuelle'
    
    let monthsToGenerate: number[] = []
    if (frequency.includes('mensuelle') || frequency.includes('monthly')) {
      monthsToGenerate = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    } else if (frequency.includes('trimestrielle') || frequency.includes('quarterly')) {
      monthsToGenerate = [3, 6, 9, 12]
    } else if (frequency.includes('semestrielle') || frequency.includes('semi-annual')) {
      monthsToGenerate = [6, 12]
    } else if (frequency.includes('annuelle') || frequency.includes('annual')) {
      monthsToGenerate = [12]
    } else {
      // Default to monthly for unknown frequencies
      monthsToGenerate = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    }
    
    monthsToGenerate.forEach(month => {
      // Create date d'arrêté (last day of the period)
      const dateArrete = new Date(currentYear, month, 0) // Last day of the month
      
      // Calculate deadline based on the deadline rule
      const deadline = this.calculateDeadlineFromRule(dateArrete, reporting.deadlineRule)
      
      if (deadline) {
        const event: DeadlineEvent = {
          id: `${regulator}-${categoryKey}-${reporting.code}-${month}-${currentYear}`,
          code: reporting.code,
          name: reporting.name,
          description: reporting.name,
          deadline,
          dateArrete,
          frequency: reporting.frequency,
          regulator,
          category: reporting.categoryName || this.getCategoryName(regulator, categoryKey),
          categoryKey,
          completed: false,
          daysRemaining: 0, // Will be calculated
          urgencyLevel: 'normal', // Will be calculated using RepWatch logic
          url: this.getEventUrl(regulator, categoryKey)
        }
        
        // Calculate days remaining and urgency using EXACT RepWatch logic
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        event.daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        // Use exact same logic as RepWatch: daysUntil <= 3 ? 'urgent' : (daysUntil <= 7 ? 'warning' : 'normal')
        if (event.daysRemaining <= 3) event.urgencyLevel = 'urgent'
        else if (event.daysRemaining <= 7) event.urgencyLevel = 'warning'
        else event.urgencyLevel = 'normal'
        
        events.push(event)
      }
    })
    
    return events
  }

  private calculateDeadlineFromRule(dateArrete: Date, rule: string): Date | null {
    if (!rule) return null
    
    const ruleText = rule.toLowerCase().trim()
    let deadline = new Date(dateArrete)
    
    // Use exact same logic as RepWatch generateEventsForItem function
    if (ruleText.includes('12 jours après')) {
      // Add 12 days like RepWatch: addDays(rep, 12)
      deadline.setDate(deadline.getDate() + 12)
    } else if (ruleText.includes('15 jours après')) {
      // Add 15 days like RepWatch: addDays(rep, 15) 
      deadline.setDate(deadline.getDate() + 15)
    } else if (ruleText.includes('21 jours après')) {
      // Add 21 days like RepWatch: addDays(rep, 21)
      deadline.setDate(deadline.getDate() + 21)
    } else if (ruleText.includes('30 jours après')) {
      // Add 30 days like RepWatch: addDays(rep, 30)
      deadline.setDate(deadline.getDate() + 30)
    } else if (ruleText.includes('un mois après')) {
      // End of next month like RepWatch: new Date(rep.getFullYear(), rep.getMonth() + 2, 0)
      deadline = new Date(deadline.getFullYear(), deadline.getMonth() + 2, 0)
    } else if (ruleText.includes('fin du mois suivant')) {
      // Next month end like RepWatch
      const nextMonth = deadline.getMonth() + 1
      let nextYear = deadline.getFullYear()
      if (nextMonth > 11) { 
        deadline = new Date(nextYear + 1, 0, 0) // December of next year
      } else {
        deadline = new Date(nextYear, nextMonth + 1, 0) // End of following month
      }
    } else if (ruleText.includes('15 mars') && ruleText.includes('31 mai') && 
               ruleText.includes('30 août') && ruleText.includes('30 novembre')) {
      // Special quarterly dates like RepWatch
      const currentYear = deadline.getFullYear()
      const month = deadline.getMonth()
      if (month <= 2) deadline = new Date(currentYear, 2, 15) // 15 mars
      else if (month <= 5) deadline = new Date(currentYear, 4, 31) // 31 mai  
      else if (month <= 8) deadline = new Date(currentYear, 7, 30) // 30 août
      else deadline = new Date(currentYear, 10, 30) // 30 novembre
    } else if (ruleText.includes('31 janvier')) {
      // Annual deadline like RepWatch
      deadline = new Date(deadline.getFullYear() + 1, 0, 31)
    } else if (ruleText.includes('fin mars')) {
      // End of March like RepWatch: new Date(currentYear, 3, 0)
      deadline = new Date(deadline.getFullYear() + 1, 3, 0)
    } else {
      // Default to 30 days if we can't parse the rule
      deadline.setDate(deadline.getDate() + 30)
    }
    
    return deadline
  }

  public getUpcomingDeadlines(days: number = 30): DeadlineEvent[] {
    try {
      const stored = localStorage.getItem('rep-watch-deadlines')
      if (!stored) return []

      const deadlines: DeadlineEvent[] = JSON.parse(stored)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)

      console.log(`📅 DEBUG: getUpcomingDeadlines - checking ${deadlines.length} total deadlines`)
      console.log(`📅 DEBUG: Date range: ${today.toISOString()} to ${futureDate.toISOString()}`)

      const upcomingDeadlines = deadlines.filter(d => {
        const deadline = new Date(d.deadline)
        deadline.setHours(0, 0, 0, 0)
        const isUpcoming = deadline >= today && deadline <= futureDate && !d.completed
        
        if (!isUpcoming && deadlines.indexOf(d) < 5) { // Log first 5 filtered out items for debugging
          console.log(`📅 DEBUG: Filtered out: ${d.name} - deadline: ${deadline.toISOString()}, today: ${today.toISOString()}, futureDate: ${futureDate.toISOString()}, completed: ${d.completed}`)
        }
        
        return isUpcoming
      }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

      console.log(`📅 DEBUG: Found ${upcomingDeadlines.length} upcoming deadlines out of ${deadlines.length} total`)
      
      // Log first few upcoming deadlines
      if (upcomingDeadlines.length > 0) {
        console.log('📅 DEBUG: Sample upcoming deadlines:', upcomingDeadlines.slice(0, 3).map(d => `${d.regulator}-${d.name}-${d.deadline}`))
      }

      return upcomingDeadlines
    } catch (error) {
      console.error('Failed to get upcoming deadlines:', error)
      return []
    }
  }
}

export default RepWatchDataSync.getInstance()