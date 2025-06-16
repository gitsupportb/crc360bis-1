/**
 * File Management System for BCP Securities Services Reporting Dashboard
 * Provides functionality to browse and manage uploaded reporting files
 * organized by category, report name, year, and month
 *
 * Updated to use centralized reporting data from ALL_REPORTINGS.json
 */

console.log('📁 file-manager.js loading...');

// Test basic JavaScript execution
try {
  console.log('🔧 Testing basic JavaScript execution in file-manager.js...');
  window.fileManagerTestFlag = true;
  console.log('✅ Basic JavaScript execution working');
} catch (error) {
  console.error('❌ Basic JavaScript execution failed:', error);
}

class FileManager {
  constructor() {
    try {
      console.log('🔧 FileManager constructor starting...');

      this.baseUploadPath = './UPLOADED_REPORTINGS';
      this.fileStructure = {};
      this.allReportingsData = null;
      this.folderContents = new Map();
      this.reportingDataLoaded = false;
      this.ammcDataLoaded = false;

      console.log('✅ Basic properties initialized');

      // Performance optimization properties
      this.scanCache = new Map(); // Cache for file scan results
      this.loadingStates = new Map(); // Track loading states for folders
      this.scanQueue = []; // Queue for pending scans
      this.maxConcurrentScans = 3; // Limit concurrent scanning
      this.activeScanCount = 0;
      this.scanTimeouts = new Map(); // Track scan timeouts
      this.defaultScanTimeout = 5000; // 5 seconds timeout per folder

      console.log('✅ Performance optimization properties initialized');

      // Smart defaults - known file locations
      this.knownFiles = {
        'BAM/III___Etats_relatifs_à_la_réglementation_prudentielle/Etat_LCR/2025/1': ['Etat  331 -  LCR - Jan 2025 --BCP2S.xlsx'],
        'BAM/III___Etats_relatifs_à_la_réglementation_prudentielle/Etat_LCR/2025/2': ['Etat  331 -  LCR - Fév 2025 -BCP2S.xlsx'],
        'BAM/III___Etats_relatifs_à_la_réglementation_prudentielle/Etat_LCR/2025/3': ['Etat  331 -  LCR - Mars 2025 -BCP2S.xlsx'],
        'BAM/III___Etats_relatifs_à_la_réglementation_prudentielle/Etat_LCR/2025/4': ['Etat  331 -  LCR - Avril 2025 --BCP2S.xlsx']
      };

      console.log('✅ Known files initialized');

      // Initialize cache from localStorage
      console.log('🔧 Loading cache from storage...');
      this.loadCacheFromStorage();
      console.log('✅ Cache loaded from storage');

      console.log('✅ FileManager constructor completed successfully');
    } catch (error) {
      console.error('❌ Error in FileManager constructor:', error);
      throw error;
    }
  }

  /**
   * Load cache from localStorage for persistence
   */
  loadCacheFromStorage() {
    try {
      console.log('🔧 loadCacheFromStorage starting...');

      // Check if localStorage is available
      if (typeof localStorage === 'undefined') {
        console.log('⚠️ localStorage not available, skipping cache load');
        return;
      }

      const cachedData = localStorage.getItem('fileManagerCache');
      console.log('📦 Retrieved cached data:', cachedData ? 'found' : 'not found');

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        console.log('📦 Parsed cached data:', parsed);

        // Only load cache if it's less than 1 hour old
        if (Date.now() - parsed.timestamp < 3600000) {
          this.scanCache = new Map(parsed.scanCache);
          console.log(`📦 Loaded ${this.scanCache.size} cached scan results from localStorage`);
        } else {
          console.log('🕒 Cache expired, starting fresh');
          localStorage.removeItem('fileManagerCache');
        }
      } else {
        console.log('📦 No cached data found, starting with empty cache');
      }

      console.log('✅ loadCacheFromStorage completed');
    } catch (error) {
      console.warn('⚠️ Error loading cache from localStorage:', error);
      console.warn('⚠️ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // Continue without cache
    }
  }

  /**
   * Save cache to localStorage for persistence
   */
  saveCacheToStorage() {
    try {
      const cacheData = {
        timestamp: Date.now(),
        scanCache: Array.from(this.scanCache.entries())
      };
      localStorage.setItem('fileManagerCache', JSON.stringify(cacheData));
      console.log(`💾 Saved ${this.scanCache.size} scan results to localStorage`);
    } catch (error) {
      console.warn('⚠️ Error saving cache to localStorage:', error);
    }
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.scanCache.clear();
    this.loadingStates.clear();
    this.folderContents.clear();
    localStorage.removeItem('fileManagerCache');
    console.log('🧹 All caches cleared');
  }

  /**
   * Initialize the file manager and load file structure
   */
  async init() {
    try {
      console.log('🚀 Initializing File Manager...');

      // Load ALL_REPORTINGS.json first
      console.log('🔧 Step 1: Loading ALL_REPORTINGS.json...');
      await this.loadAllReportingsData();
      console.log('✅ Step 1 completed');

      // Load centralized reporting data
      console.log('🔧 Step 2: Loading centralized reporting data...');
      await this.loadCentralizedReportingData();
      console.log('✅ Step 2 completed');

      // Then load file structure
      console.log('🔧 Step 3: Loading file structure...');
      await this.loadFileStructure();
      console.log('✅ Step 3 completed');

      console.log('✅ File Manager initialized successfully');

      // Log the loaded structure for debugging
      console.log('🔧 Step 4: Getting file statistics...');
      const stats = this.getFileStatistics();
      console.log('📊 File Statistics:', stats);
      console.log('📁 File Structure Keys:', Object.keys(this.fileStructure));

      // Check if we have the LCR files
      console.log('🔧 Step 5: Checking LCR structure...');
      const lcr = this.fileStructure?.["BAM"]?.["III___Etats_relatifs_à_la_réglementation_prudentielle"]?.["Etat_LCR"];
      if (lcr) {
        console.log('🎯 LCR Structure Found:', lcr);
      } else {
        console.log('❌ LCR Structure NOT Found');
      }

      console.log('✅ All initialization steps completed successfully');

    } catch (error) {
      console.error('❌ Failed to initialize File Manager:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error; // Re-throw to let the caller handle it
    }
  }

  /**
   * Load ALL_REPORTINGS.json data
   */
  async loadAllReportingsData() {
    try {
      console.log('📊 Loading ALL_REPORTINGS.json...');
      const response = await fetch('./ALL_REPORTINGS.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.allReportingsData = await response.json();
      console.log('✅ ALL_REPORTINGS.json loaded successfully');
      console.log(`📈 Total reportings: ${this.allReportingsData.metadata.totalReportings}`);
    } catch (error) {
      console.error('❌ Error loading ALL_REPORTINGS.json:', error);
      this.allReportingsData = null;
    }
  }

  /**
   * Check if a folder has files by attempting to fetch directory listing
   */
  async checkFolderContents(folderPath) {
    try {
      // Try to fetch a known file pattern to check if folder has content
      const testPaths = [
        `${folderPath}/file_listing.json`,
        `${folderPath}/README.md`,
        `${folderPath}/index.html`
      ];

      for (const testPath of testPaths) {
        try {
          const response = await fetch(testPath);
          if (response.ok) {
            this.folderContents.set(folderPath, { hasFiles: true, fileCount: 1 });
            return { hasFiles: true, fileCount: 1 };
          }
        } catch (e) {
          // Continue to next test path
        }
      }

      // If no test files found, assume empty
      this.folderContents.set(folderPath, { hasFiles: false, fileCount: 0 });
      return { hasFiles: false, fileCount: 0 };

    } catch (error) {
      console.error('Error checking folder contents:', error);
      return { hasFiles: false, fileCount: 0, error: true };
    }
  }

  /**
   * Load centralized reporting data
   */
  async loadCentralizedReportingData() {
    console.log('📊 Loading centralized reporting data for file manager...');

    try {
      // Ensure reporting data manager is available
      if (!window.reportingDataManager) {
        throw new Error('Reporting data manager not available');
      }

      // Load the centralized data
      await window.reportingDataManager.loadReportingData();
      this.reportingDataLoaded = true;

      console.log('✅ Centralized BAM reporting data loaded for file manager');

    } catch (error) {
      console.error('❌ Error loading centralized BAM reporting data:', error);
      this.reportingDataLoaded = false;
    }
  }

  /**
   * Load AMMC reporting data
   */
  async loadAMMCData() {
    console.log('📊 Loading AMMC reporting data for file manager...');

    try {
      // Check if AMMC data is available in the global scope
      if (typeof dataAMMC_BCP !== 'undefined' &&
          typeof dataAMMC_BCP2S !== 'undefined' &&
          typeof dataAMMC_BANK_AL_YOUSR !== 'undefined') {
        this.ammcDataLoaded = true;
        console.log('✅ AMMC reporting data loaded for file manager');
        console.log(`📊 AMMC data counts: BCP(${dataAMMC_BCP.length}), BCP2S(${dataAMMC_BCP2S.length}), BAY(${dataAMMC_BANK_AL_YOUSR.length})`);
      } else {
        console.warn('⚠️ AMMC data not available, using fallback data');
        this.ammcDataLoaded = false;
      }
    } catch (error) {
      console.error('❌ Error loading AMMC reporting data:', error);
      this.ammcDataLoaded = false;
    }
  }

  /**
   * Load the file structure from the server
   */
  async loadFileStructure() {
    try {
      if (typeof google !== 'undefined' && google.colab && google.colab.kernel) {
        // Production environment - call Python function
        const result = await google.colab.kernel.invokeFunction('get_uploaded_files_structure', [], {});
        this.fileStructure = result.data || {};
      } else {
        // Demo environment - load actual folder structure
        this.fileStructure = await this.loadActualFolderStructure();
      }

      // Validate and sanitize the loaded structure
      this.fileStructure = this.validateFileStructure(this.fileStructure);

    } catch (error) {
      console.error('Error loading file structure:', error);
      // Fallback to demo structure if loading fails
      this.fileStructure = await this.generateDemoFileStructure();
    }
  }

  /**
   * Validate and sanitize file structure to ensure all arrays are properly formatted
   */
  validateFileStructure(structure) {
    console.log('🔍 Validating file structure...');

    if (!structure || typeof structure !== 'object') {
      console.warn('⚠️ Invalid file structure, using empty structure');
      return {};
    }

    const validatedStructure = {};

    for (const [regulator, categories] of Object.entries(structure)) {
      if (categories && typeof categories === 'object') {
        validatedStructure[regulator] = {};

        for (const [category, reports] of Object.entries(categories)) {
          if (reports && typeof reports === 'object') {
            validatedStructure[regulator][category] = {};

            for (const [report, years] of Object.entries(reports)) {
              if (years && typeof years === 'object') {
                validatedStructure[regulator][category][report] = {};

                for (const [year, months] of Object.entries(years)) {
                  if (months && typeof months === 'object') {
                    validatedStructure[regulator][category][report][year] = {};

                    for (const [month, files] of Object.entries(months)) {
                      // Ensure files is always an array
                      if (Array.isArray(files)) {
                        validatedStructure[regulator][category][report][year][month] = files.filter(file => typeof file === 'string');
                      } else {
                        console.warn(`⚠️ Files for ${regulator}/${category}/${report}/${year}/${month} is not an array, converting:`, files);
                        validatedStructure[regulator][category][report][year][month] = [];
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    console.log('✅ File structure validation complete');
    return validatedStructure;
  }

  /**
   * Load the actual folder structure from the file system
   */
  async loadActualFolderStructure() {
    console.log('📁 Loading actual folder structure...');

    try {
      // First try to load from the generated file_listing.json (which now has correct structure)
      console.log('🔧 Attempting to load from file_listing.json...');
      const structure = await this.loadFromFileListing();
      console.log('✅ Successfully loaded structure from file_listing.json');
      return structure;
    } catch (error) {
      console.warn('⚠️ Failed to load from file_listing.json:', error.message);
      console.log('🔧 Falling back to embedded data generation...');

      // Fallback to the complex structure generation
      return await this.loadFromEmbeddedData();
    }
  }

  /**
   * Scan actual folder structure from the file system using ALL_REPORTINGS.json
   */
  async scanActualFileStructure() {
    console.log('📁 Scanning actual file structure from UPLOADED_REPORTINGS using ALL_REPORTINGS.json...');

    const structure = {
      "BAM": {},
      "AMMC": {},
      "DGI": {} // Ready for future implementation
    };

    if (this.allReportingsData) {
      console.log('✅ Using ALL_REPORTINGS.json for structure generation');

      // Generate BAM structure from ALL_REPORTINGS.json
      structure.BAM = await this.generateBAMStructureFromData();

      // Generate AMMC structure from ALL_REPORTINGS.json
      structure.AMMC = await this.generateAMMCStructureFromData();

      // Generate DGI structure from ALL_REPORTINGS.json
      structure.DGI = await this.generateDGIStructureFromData();

    } else {
      console.log('⚠️ ALL_REPORTINGS.json not available, using fallback method');

      // Fallback to old method
      structure.BAM = await this.scanBAMStructure();
      structure.AMMC = await this.scanAMMCStructure();
      structure.DGI = await this.generateFallbackDGIStructure();
    }

    console.log('✅ Actual file structure scanned successfully');
    console.log('🔍 Final structure regulators:', Object.keys(structure));
    console.log('🔍 BAM categories:', Object.keys(structure.BAM || {}));
    console.log('🔍 AMMC entities:', Object.keys(structure.AMMC || {}));
    console.log('🔍 DGI content:', Object.keys(structure.DGI || {}));
    return structure;
  }

  /**
   * Generate BAM structure from ALL_REPORTINGS.json data with proper 5-level hierarchy
   */
  async generateBAMStructureFromData() {
    console.log('📊 Generating BAM structure from ALL_REPORTINGS.json...');

    const bamStructure = {
      "I___Situation_comptable_et_états_annexes": {},
      "II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires": {},
      "III___Etats_relatifs_à_la_réglementation_prudentielle": {}
    };

    if (!this.allReportingsData?.categories) {
      console.error('❌ No categories found in ALL_REPORTINGS.json');
      return bamStructure;
    }

    // Process each BAM category with proper nesting
    for (const [categoryKey, categoryData] of Object.entries(this.allReportingsData.categories)) {
      if (['I', 'II', 'III'].includes(categoryKey) && categoryData.reportings) {

        // Determine the target category structure
        let targetCategory;
        if (categoryKey === 'I') {
          targetCategory = bamStructure["I___Situation_comptable_et_états_annexes"];
        } else if (categoryKey === 'II') {
          targetCategory = bamStructure["II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires"];
        } else if (categoryKey === 'III') {
          targetCategory = bamStructure["III___Etats_relatifs_à_la_réglementation_prudentielle"];
        }

        // Add each reporting under the correct category
        for (const [reportingKey, reportingData] of Object.entries(categoryData.reportings)) {
          const folderName = reportingData.folderName;

          targetCategory[folderName] = {
            "2025": {}
          };

          // Add all 12 months for 2025
          for (let month = 1; month <= 12; month++) {
            const monthStr = month.toString(); // Use "1", "2", etc. to match actual folder structure

            // Skip file checking for faster loading - just create empty structure
            // TODO: Add file checking on-demand when user clicks on specific folders
            targetCategory[folderName]["2025"][monthStr] = [];
          }
        }

        console.log(`✅ Generated ${Object.keys(categoryData.reportings).length} reportings for BAM Category ${categoryKey}`);
      }
    }

    return bamStructure;
  }

  /**
   * Generate AMMC structure from ALL_REPORTINGS.json data with proper 5-level hierarchy
   */
  async generateAMMCStructureFromData() {
    console.log('📊 Generating AMMC structure from ALL_REPORTINGS.json...');

    const ammcStructure = {
      "BCP": {},
      "BCP2S": {},
      "BANK_AL_YOUSR": {}
    };

    if (!this.allReportingsData?.categories) {
      console.error('❌ No categories found in ALL_REPORTINGS.json');
      return ammcStructure;
    }

    // Process each AMMC category with proper nesting
    for (const [categoryKey, categoryData] of Object.entries(this.allReportingsData.categories)) {
      if (categoryKey.startsWith('AMMC_') && categoryData.reportings) {

        // Extract entity name from category key (AMMC_BCP -> BCP)
        const entity = categoryKey.replace('AMMC_', '');
        const targetEntity = ammcStructure[entity];

        if (targetEntity) {
          // Add each reporting under the correct entity
          for (const [reportingKey, reportingData] of Object.entries(categoryData.reportings)) {
            const folderName = reportingData.folderName;

            targetEntity[folderName] = {
              "2025": {}
            };

            // Add all 12 months for 2025
            for (let month = 1; month <= 12; month++) {
              const monthStr = month.toString(); // Use "1", "2", etc. to match actual folder structure

              // Skip file checking for faster loading - just create empty structure
              // TODO: Add file checking on-demand when user clicks on specific folders
              targetEntity[folderName]["2025"][monthStr] = [];
            }
          }

          console.log(`✅ Generated ${Object.keys(categoryData.reportings).length} reportings for AMMC ${entity}`);
        }
      }
    }

    return ammcStructure;
  }

  /**
   * Generate DGI structure from ALL_REPORTINGS.json data
   */
  async generateDGIStructureFromData() {
    console.log('🏛️ Generating DGI structure from ALL_REPORTINGS.json...');

    const dgiStructure = {};

    if (!this.allReportingsData || !this.allReportingsData.categories || !this.allReportingsData.categories.DGI) {
      console.warn('⚠️ DGI data not found in ALL_REPORTINGS.json');
      return dgiStructure;
    }

    const dgiData = this.allReportingsData.categories.DGI;
    console.log('📊 Processing DGI data:', dgiData);

    // DGI has a single category structure (no sub-categories like BAM)
    // All reportings go under the main DGI category
    const dgiCategoryName = dgiData.folderName || 'DGI';
    dgiStructure[dgiCategoryName] = {};

    if (dgiData.reportings) {
      // Add each DGI reporting under the main category
      for (const [reportingKey, reportingData] of Object.entries(dgiData.reportings)) {
        const folderName = reportingData.folderName;

        dgiStructure[dgiCategoryName][folderName] = {
          "2025": {}
        };

        // Add all 12 months for 2025
        for (let month = 1; month <= 12; month++) {
          const monthStr = month.toString(); // Use "1", "2", etc. to match actual folder structure

          // Skip file checking for faster loading - just create empty structure
          // TODO: Add file checking on-demand when user clicks on specific folders
          dgiStructure[dgiCategoryName][folderName]["2025"][monthStr] = [];
        }
      }

      console.log(`✅ Generated ${Object.keys(dgiData.reportings).length} reportings for DGI`);
    }

    console.log('🏛️ DGI structure generation completed');
    return dgiStructure;
  }

  /**
   * Scan BAM folder structure
   */
  async scanBAMStructure() {
    console.log('📁 Scanning BAM folder structure...');

    const bamStructure = {
      "I___Situation_comptable_et_états_annexes": {},
      "II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires": {},
      "III___Etats_relatifs_à_la_réglementation_prudentielle": {}
    };

    // Get BAM reporting lists from centralized data if available
    let categoryI, categoryII, categoryIII;

    if (this.reportingDataLoaded && window.reportingDataManager) {
      try {
        // Get folder names from centralized data
        const catIReportings = await window.reportingDataManager.getCategoryReportings('I');
        const catIIReportings = await window.reportingDataManager.getCategoryReportings('II');
        const catIIIReportings = await window.reportingDataManager.getCategoryReportings('III');

        categoryI = Object.values(catIReportings).map(r => r.folderName);
        categoryII = Object.values(catIIReportings).map(r => r.folderName);
        categoryIII = Object.values(catIIIReportings).map(r => r.folderName);

        console.log('✅ Using centralized data for BAM folder structure');
        console.log(`📊 BAM Loaded: Category I (${categoryI.length}), Category II (${categoryII.length}), Category III (${categoryIII.length})`);

      } catch (error) {
        console.error('❌ Error loading centralized data for BAM folder structure:', error);
        // Fall back to hardcoded lists
        ({ categoryI, categoryII, categoryIII } = this.getFallbackReportingLists());
      }
    } else {
      console.log('⚠️ Using fallback hardcoded BAM reporting lists');
      ({ categoryI, categoryII, categoryIII } = this.getFallbackReportingLists());
    }

    // Generate BAM structure for each category with empty folders
    this.populateEmptyStructure(bamStructure["I___Situation_comptable_et_états_annexes"], categoryI);
    this.populateEmptyStructure(bamStructure["II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires"], categoryII);
    this.populateEmptyStructure(bamStructure["III___Etats_relatifs_à_la_réglementation_prudentielle"], categoryIII);

    console.log('✅ BAM structure scanned successfully');
    return bamStructure;
  }

  /**
   * Scan AMMC folder structure
   */
  async scanAMMCStructure() {
    console.log('📁 Scanning AMMC folder structure...');

    const ammcStructure = {
      "BCP": {},
      "BCP2S": {},
      "BANK_AL_YOUSR": {}
    };

    // Get AMMC reporting lists
    let ammcBCP, ammcBCP2S, ammcBAY;

    if (this.ammcDataLoaded) {
      try {
        // Get AMMC folder names from global data
        ammcBCP = dataAMMC_BCP.map(r => this.cleanFolderName(r.Appellation));
        ammcBCP2S = dataAMMC_BCP2S.map(r => this.cleanFolderName(r.Appellation));
        ammcBAY = dataAMMC_BANK_AL_YOUSR.map(r => this.cleanFolderName(r.Appellation));

        console.log('✅ Using AMMC data for folder structure');
        console.log(`📊 AMMC Loaded: BCP (${ammcBCP.length}), BCP2S (${ammcBCP2S.length}), BAY (${ammcBAY.length})`);

      } catch (error) {
        console.error('❌ Error loading AMMC data for folder structure:', error);
        // Fall back to hardcoded lists
        ({ ammcBCP, ammcBCP2S, ammcBAY } = this.getFallbackAMMCLists());
      }
    } else {
      console.log('⚠️ Using fallback hardcoded AMMC reporting lists');
      ({ ammcBCP, ammcBCP2S, ammcBAY } = this.getFallbackAMMCLists());
    }

    // Generate AMMC structure for each entity with empty folders
    this.populateEmptyStructure(ammcStructure["BCP"], ammcBCP);
    this.populateEmptyStructure(ammcStructure["BCP2S"], ammcBCP2S);
    this.populateEmptyStructure(ammcStructure["BANK_AL_YOUSR"], ammcBAY);

    console.log('✅ AMMC structure scanned successfully');
    return ammcStructure;
  }

  /**
   * Get fallback reporting lists (hardcoded for emergency use)
   */
  getFallbackReportingLists() {
    console.log('⚠️ Using fallback hardcoded BAM reporting lists');

    return {
      categoryI: [
        "Situation_Comptable_provisoire",
        "Situation_Comptable_définitive",
        "Ventilation__en_fonction_de_la_résidence_et_par_catégorie_de_contrepartie__des_opérations_de_trésorerie_et_des_créances_sur_les_établissements_de_crédit_et_assimilés",
        "Ventilation__en_fonction_de_la_résidence_et_par_catégorie_de_contrepartie__des_opérations_de_trésorerie_et_des_dettes_envers_les_établissements_de_crédit_et_assimilés",
        "Ventilation__en_fonction_de_la_résidence_et_par_catégorie_de_contrepartie__des_créances_sur_la_clientèle_financière"
      ],
      categoryII: [
        "Bilan",
        "Compte_de_produits_et_charges",
        "Etat_des_soldes_de_gestion",
        "Tableau_des_flux_de_trésorerie",
        "Compte_de_produits_et_charges_détaillé"
      ],
      categoryIII: [
        "Reporting_réglementaire_IRRBB",
        "Etat_LCR",
        "Etat_de_calcul_du_ratio_de_levier_sur_base_individuelle",
        "Risques_encourus_sur_un_même_bénéficiaire_égaux_ou_supérieurs_à_5__des_fonds_propres__déclarés_sur_base_individuelle",
        "Détail_des_risques_sur_les_clients_individuels_au_sein_des_groupes__base_individuelle"
      ]
    };
  }

  /**
   * Get fallback AMMC reporting lists (hardcoded for emergency use)
   */
  getFallbackAMMCLists() {
    console.log('⚠️ Using fallback hardcoded AMMC reporting lists');

    return {
      ammcBCP: [
        "Rapport_de_contrôle_des_OPCVM",
        "Etat_des_OPCVM_gérés",
        "Etat_des_mandats_de_gestion",
        "Etat_des_commissions_perçues",
        "Etat_des_actifs_sous_gestion"
      ],
      ammcBCP2S: [
        "Rapport_de_contrôle_des_OPCVM_BCP2S",
        "Etat_des_OPCVM_gérés_BCP2S",
        "Etat_des_mandats_de_gestion_BCP2S"
      ],
      ammcBAY: [
        "Rapport_de_contrôle_des_OPCVM_BAY",
        "Etat_des_OPCVM_gérés_BAY",
        "Etat_des_mandats_de_gestion_BAY"
      ]
    };
  }

  /**
   * Generate fallback DGI structure (hardcoded for emergency use)
   */
  async generateFallbackDGIStructure() {
    console.log('⚠️ Generating fallback DGI structure...');

    const dgiStructure = {
      "DGI": {}
    };

    // Hardcoded DGI reporting list based on the 15 reportings mentioned in memories
    const dgiReportings = [
      "Déclaration_annuelle_des_revenus_salariaux",
      "Déclaration_annuelle_des_revenus_fonciers",
      "Déclaration_annuelle_des_plus_values_immobilières",
      "Déclaration_annuelle_des_revenus_de_capitaux_mobiliers",
      "Déclaration_annuelle_des_revenus_professionnels",
      "Déclaration_annuelle_des_revenus_agricoles",
      "Déclaration_annuelle_de_la_TVA",
      "Déclaration_annuelle_de_l_IS",
      "Déclaration_annuelle_des_retenues_à_la_source",
      "Déclaration_annuelle_des_droits_d_enregistrement",
      "Déclaration_trimestrielle_de_la_TVA_Q1",
      "Déclaration_trimestrielle_de_la_TVA_Q2",
      "Déclaration_mensuelle_de_l_IR",
      "Déclaration_mensuelle_de_la_TVA",
      "Déclaration_mensuelle_des_cotisations_sociales"
    ];

    // Generate DGI structure with empty folders
    this.populateEmptyStructure(dgiStructure["DGI"], dgiReportings);

    console.log(`✅ Generated ${dgiReportings.length} fallback reportings for DGI`);
    return dgiStructure;
  }

  /**
   * Clean folder name for file system compatibility
   */
  cleanFolderName(name) {
    return name
      .replace(/[<>:"/\\|?*]/g, '_')  // Replace invalid characters
      .replace(/\s+/g, '_')           // Replace spaces with underscores
      .replace(/_{2,}/g, '_')         // Replace multiple underscores with single
      .replace(/^_|_$/g, '');         // Remove leading/trailing underscores
  }

  /**
   * Populate category structure with empty folders (no files)
   */
  populateEmptyStructure(categoryObj, reportings) {
    reportings.forEach(reporting => {
      categoryObj[reporting] = {
        "2025": {}
      };

      // Add all 12 months for 2025 with empty arrays (no files)
      for (let month = 1; month <= 12; month++) {
        categoryObj[reporting]["2025"][month.toString()] = []; // Use "1", "2", etc. to match actual folder structure
      }
    });
  }

  /**
   * Get month name abbreviation (lowercase)
   */
  getMonthNameLowercase(month) {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                   'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    return months[month - 1];
  }



  /**
   * Generate demo file structure (fallback) - returns complete empty structure
   */
  async generateDemoFileStructure() {
    // Return complete structure with empty folders using proper BAM/AMMC/DGI format
    return await this.scanActualFileStructure();
  }

  /**
   * Get all regulators
   */
  getRegulators() {
    return Object.keys(this.fileStructure);
  }

  /**
   * Get all categories for a specific regulator
   */
  getCategoriesForRegulator(regulator) {
    return this.fileStructure[regulator] ? Object.keys(this.fileStructure[regulator]) : [];
  }

  /**
   * Get all reports for a specific regulator and category
   */
  getReportsForCategory(regulator, category) {
    return this.fileStructure[regulator]?.[category] ? Object.keys(this.fileStructure[regulator][category]) : [];
  }

  /**
   * Get all years for a specific regulator, category and report
   */
  getYearsForReport(regulator, category, report) {
    const reportData = this.fileStructure[regulator]?.[category]?.[report];
    return reportData ? Object.keys(reportData).sort((a, b) => parseInt(b) - parseInt(a)) : [];
  }

  /**
   * Get all months for a specific regulator, category, report, and year
   */
  getMonthsForReportYear(regulator, category, report, year) {
    const yearData = this.fileStructure[regulator]?.[category]?.[report]?.[year];
    return yearData ? Object.keys(yearData).sort((a, b) => parseInt(b) - parseInt(a)) : [];
  }

  /**
   * Get all files for a specific regulator, category, report, year, and month
   */
  getFilesForReportMonth(regulator, category, report, year, month) {
    return this.fileStructure[regulator]?.[category]?.[report]?.[year]?.[month] || [];
  }

  /**
   * Get file statistics
   */
  getFileStatistics() {
    let totalFiles = 0;
    let totalCategories = 0;
    let totalReports = 0;
    const categoryStats = {};

    console.log('📊 Calculating file statistics...');
    console.log('🔍 File structure:', this.fileStructure);

    // Handle new regulator-based structure: regulator > category > report > year > month
    for (const [regulator, categories] of Object.entries(this.fileStructure)) {
      console.log(`🏛️ Processing regulator: ${regulator}`);

      for (const [category, reports] of Object.entries(categories)) {
        totalCategories++;
        const categoryKey = `${regulator}_${category}`;
        categoryStats[categoryKey] = {
          reports: 0,
          files: 0,
          latestUpload: null
        };

        console.log(`📁 Processing category: ${category} with ${Object.keys(reports).length} reports`);

        for (const [report, years] of Object.entries(reports)) {
          totalReports++;
          categoryStats[categoryKey].reports++;

          console.log(`  📄 Processing report: ${report}`);

          for (const [year, months] of Object.entries(years)) {
            console.log(`    📅 Processing year: ${year} with ${Object.keys(months).length} months`);

            for (const [month, files] of Object.entries(months)) {
              // Ensure files is always an array
              let fileArray = files;
              if (!Array.isArray(fileArray)) {
                console.warn(`⚠️ Files for ${regulator}/${category}/${report}/${year}/${month} is not an array in statistics:`, fileArray);
                fileArray = [];
              }

              if (fileArray && fileArray.length > 0) {
                console.log(`      📂 Month ${month}: ${fileArray.length} files:`, fileArray);
              }
              totalFiles += fileArray.length;
              categoryStats[categoryKey].files += fileArray.length;
            }
          }
        }
      }
    }

    console.log(`✅ Statistics calculated: ${totalFiles} files, ${totalCategories} categories, ${totalReports} reports`);

    return {
      totalFiles,
      totalCategories,
      totalReports,
      categoryStats
    };
  }

  /**
   * Search files by name, category, or report
   */
  searchFiles(searchTerm) {
    const results = [];
    const term = searchTerm.toLowerCase();

    for (const [category, reports] of Object.entries(this.fileStructure)) {
      for (const [report, years] of Object.entries(reports)) {
        for (const [year, months] of Object.entries(years)) {
          for (const [month, files] of Object.entries(months)) {
            files.forEach(file => {
              if (file.toLowerCase().includes(term) ||
                  category.toLowerCase().includes(term) ||
                  report.toLowerCase().includes(term)) {
                results.push({
                  category,
                  report,
                  year,
                  month,
                  file,
                  path: `${this.baseUploadPath}/${category}/${report}/${year}/${month}/${file}`
                });
              }
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Get filtered files based on search term, category, and year
   */
  getFilteredFiles(searchTerm = '', categoryFilter = '', yearFilter = '') {
    const results = [];
    const term = searchTerm.toLowerCase();

    for (const [category, reports] of Object.entries(this.fileStructure)) {
      // Apply category filter
      if (categoryFilter) {
        const categoryMatch = this.matchesCategory(category, categoryFilter);
        if (!categoryMatch) continue;
      }

      for (const [report, years] of Object.entries(reports)) {
        for (const [year, months] of Object.entries(years)) {
          // Apply year filter
          if (yearFilter && year !== yearFilter) continue;

          for (const [month, files] of Object.entries(months)) {
            files.forEach(file => {
              // Apply search term filter
              const matchesSearch = !term ||
                file.toLowerCase().includes(term) ||
                category.toLowerCase().includes(term) ||
                report.toLowerCase().includes(term);

              if (matchesSearch) {
                results.push({
                  category,
                  report,
                  year,
                  month,
                  file,
                  path: `${this.baseUploadPath}/${category}/${report}/${year}/${month}/${file}`
                });
              }
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Check if category matches the filter (now supports regulator-based filtering)
   */
  matchesCategory(category, filter) {
    switch (filter) {
      case 'BAM':
        return category.includes('I___Situation_comptable') ||
               category.includes('II___Etats_de_synthèse') ||
               category.includes('III___Etats_relatifs');
      case 'AMMC':
        return category === 'BCP' || category === 'BCP2S' || category === 'BANK_AL_YOUSR';
      case 'DGI':
        return category === 'DGI';
      // Legacy support for old category filters
      case 'I':
        return category.includes('I___Situation_comptable');
      case 'II':
        return category.includes('II___Etats_de_synthèse');
      case 'III':
        return category.includes('III___Etats_relatifs');
      default:
        return true;
    }
  }

  /**
   * Get recent files (last N files uploaded) with enhanced metadata
   */
  getRecentFiles(limit = 10) {
    const allFiles = [];

    for (const [category, reports] of Object.entries(this.fileStructure)) {
      for (const [report, years] of Object.entries(reports)) {
        for (const [year, months] of Object.entries(years)) {
          for (const [month, files] of Object.entries(months)) {
            // Ensure files is always an array
            let fileArray = files;
            if (!Array.isArray(fileArray)) {
              console.warn(`⚠️ Files for ${category}/${report}/${year}/${month} is not an array in getRecentFiles:`, fileArray);
              fileArray = [];
            }

            fileArray.forEach(file => {
              if (typeof file === 'string') {
                // Skip README files
                if (!file.toLowerCase().includes('readme')) {
                  const uploadTime = this.getSimulatedUploadTime(file, year, month);
                  const timestamp = this.getFileTimestamp(year, month, file);

                  allFiles.push({
                    category,
                    report,
                    year: parseInt(year),
                    month: parseInt(month),
                    file,
                    path: `${this.baseUploadPath}/${category}/${report}/${year}/${month}/${file}`,
                    sortDate: new Date(parseInt(year), parseInt(month) - 1, 1),
                    uploadTime: uploadTime,
                    timestamp: timestamp
                  });
                }
              } else {
                console.warn(`⚠️ Invalid file entry in getRecentFiles for ${category}/${report}/${year}/${month}:`, file);
              }
            });
          }
        }
      }
    }

    // Sort by timestamp (most recent first), then by file type priority
    return allFiles
      .sort((a, b) => {
        if (a.timestamp !== b.timestamp) return b.timestamp - a.timestamp;
        // Prioritize Excel files, then PDF, then others
        const getTypePriority = (filename) => {
          if (filename.includes('.xlsx')) return 3;
          if (filename.includes('.pdf')) return 2;
          if (filename.includes('.docx')) return 1;
          return 0;
        };
        return getTypePriority(b.file) - getTypePriority(a.file);
      })
      .slice(0, limit);
  }

  /**
   * Get simulated upload time for display
   */
  getSimulatedUploadTime(filename, year, month) {
    const now = new Date();
    const fileDate = new Date(year, month - 1, Math.floor(Math.random() * 28) + 1);
    const diffDays = Math.floor((now - fileDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  /**
   * Get file timestamp for sorting
   */
  getFileTimestamp(year, month, filename) {
    // Create a timestamp that prioritizes recent months and specific file types
    const baseTime = new Date(year, month - 1, 15).getTime();

    // Add priority based on file type and content
    let priority = 0;
    if (filename.includes('jan_2025') || filename.includes('feb_2025')) priority += 1000000;
    if (filename.includes('.xlsx')) priority += 100000;
    if (filename.includes('.pdf')) priority += 50000;

    return baseTime + priority;
  }

  /**
   * Get files for a specific month and year across all categories
   */
  getFilesForMonth(year, month) {
    const monthFiles = [];

    for (const [category, reports] of Object.entries(this.fileStructure)) {
      for (const [report, years] of Object.entries(reports)) {
        const yearData = years[year.toString()];
        if (yearData && yearData[month.toString()]) {
          const files = yearData[month.toString()];
          files.forEach(file => {
            monthFiles.push({
              category,
              report,
              year,
              month,
              file,
              path: `${this.baseUploadPath}/${category}/${report}/${year}/${month}/${file}`
            });
          });
        }
      }
    }

    return monthFiles;
  }

  /**
   * Generate a file browser HTML structure with enhanced UI
   */
  generateFileBrowserHTML() {
    const stats = this.getFileStatistics();
    const totalFiles = stats.totalFiles;
    const totalRegulators = Object.keys(this.fileStructure).length;

    // Calculate total categories and reports across all regulators
    let totalCategories = 0;
    let totalReports = 0;

    for (const [regulator, categories] of Object.entries(this.fileStructure)) {
      totalCategories += Object.keys(categories).length;
      for (const [category, reports] of Object.entries(categories)) {
        totalReports += Object.keys(reports).length;
      }
    }

    console.log('🎯 File Browser HTML Generation (Multi-Regulator):');
    console.log(`📊 Regulators: ${totalRegulators}, Categories: ${totalCategories}, Reports: ${totalReports}, Files: ${totalFiles}`);
    console.log('📁 File structure keys:', Object.keys(this.fileStructure));
    console.log('📈 Detailed stats:', stats);

    let html = '<div class="file-browser">';

    // Summary header
    html += `<div class="browser-summary">
      <div class="summary-stats">
        <span class="stat-item">🏛️ ${totalRegulators} Regulators</span>
        <span class="stat-item">📁 ${totalCategories} Categories</span>
        <span class="stat-item">📄 ${totalReports} Report Types</span>
        <span class="stat-item">📊 ${totalFiles} Files</span>
        <span class="stat-item">🗓️ Ready for 2025</span>
      </div>
    </div>`;

    // Always show the complete folder structure
    if (totalFiles === 0) {
      html += `<div class="info-banner" style="background: #e8f4fd; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #0c5460;">
        <p style="color: #0c5460; margin: 0; font-size: 14px;">
          <strong>📂 Complete Folder Structure:</strong> All 94 reporting types with 12 months each are shown below.
          Empty folders are marked as "empty" and will show your files when you add them manually and refresh.
        </p>
      </div>`;
    }

    // Generate HTML for each regulator
    for (const [regulator, categories] of Object.entries(this.fileStructure)) {
      const regulatorId = this.sanitizeId(regulator);
      const categoryCount = Object.keys(categories).length;

      // Calculate total reports for this regulator
      let regulatorReportCount = 0;
      for (const [category, reports] of Object.entries(categories)) {
        regulatorReportCount += Object.keys(reports).length;
      }

      html += `<div class="regulator-section">`;
      html += `<h3 class="regulator-header" onclick="toggleRegulator('${regulatorId}')">
        <span class="toggle-icon">▶</span>
        <span class="regulator-logo">${this.getRegulatorLogo(regulator)}</span>
        <span class="regulator-title">${this.formatRegulatorName(regulator)}</span>
        <span class="regulator-count">(${categoryCount} categories, ${regulatorReportCount} reports)</span>
      </h3>`;
      html += `<div id="regulator-${regulatorId}" class="regulator-content" style="display: none;">`;

      // Add regulator summary
      html += `<div class="regulator-summary">
        <p>This regulator contains ${categoryCount} categories with ${regulatorReportCount} different reporting types, each with folders for all 12 months of 2025.</p>
      </div>`;

      // Generate HTML for each category within this regulator
      for (const [category, reports] of Object.entries(categories)) {
        const categoryId = this.sanitizeId(category);
        const reportCount = Object.keys(reports).length;

        html += `<div class="category-section">`;
        html += `<h4 class="category-header" onclick="toggleCategory('${regulatorId}', '${categoryId}')">
          <span class="toggle-icon">▶</span>
          <span class="category-logo">${this.getCategoryLogo(regulator, category)}</span>
          <span class="category-title">${this.formatCategoryName(category)}</span>
          <span class="category-count">(${reportCount} reports)</span>
        </h4>`;
        html += `<div id="category-${regulatorId}-${categoryId}" class="category-content" style="display: none;">`;

        // Add category summary
        html += `<div class="category-summary">
          <p>This category contains ${reportCount} different reporting types, each with folders for all 12 months of 2025.</p>
        </div>`;

      for (const [report, years] of Object.entries(reports)) {
        const reportId = this.sanitizeId(report);
        const totalFiles = this.countFilesInReport(years);

          html += `<div class="report-section">`;
          html += `<h5 class="report-header" onclick="toggleReport('${regulatorId}', '${categoryId}', '${reportId}')">
            <span class="toggle-icon">▶</span>
            <span class="report-title">${this.formatReportName(report)}</span>
            <span class="file-count">(${totalFiles} files)</span>
            ${totalFiles > 0 ? `<span class="bulk-download-actions">
              <button onclick="event.stopPropagation(); downloadEntireReport('${regulator}', '${category}', '${report}')"
                      class="btn-bulk-download" title="Download All Files">📦 Download All</button>
            </span>` : ''}
          </h5>`;
          html += `<div id="report-${regulatorId}-${categoryId}-${reportId}" class="report-content" style="display: none;">`;

        for (const [year, months] of Object.entries(years)) {
          html += `<div class="year-section">`;
          html += `<h6 class="year-header">📅 ${year}</h6>`;

          // Create a grid for months
          html += `<div class="months-grid">`;

          for (let monthNum = 1; monthNum <= 12; monthNum++) {
            const month = monthNum.toString();
            const monthName = this.getMonthName(monthNum);

            // Ensure files is always an array with proper error handling
            let files = months[month] || [];
            if (!Array.isArray(files)) {
              console.warn(`⚠️ Files for ${category}/${report}/${year}/${month} is not an array:`, files);
              files = [];
            }

            const hasFiles = files.length > 0;
            const fileCount = files.length;

            // Check if this folder has real files (for LCR and other reportings)
            const realFolderPath = `${this.baseUploadPath}/${regulator}/${category}/${report}/2025/${month.toString().padStart(2, '0')}`;
            const folderStatus = this.folderContents.get(realFolderPath) || { hasFiles: false, fileCount: 0 };
            const realHasFiles = hasFiles || folderStatus.hasFiles;
            const realFileCount = Math.max(fileCount, folderStatus.fileCount);

            // Check if this folder is cached or needs lazy loading
            const cacheFolderPath = `${regulator}/${category}/${report}/${year}/${month}`;
            const isCached = this.scanCache.has(cacheFolderPath);
            const isLoading = this.loadingStates.has(cacheFolderPath);

            html += `<div class="month-card ${realHasFiles ? 'has-files' : 'empty'} ${!isCached ? 'lazy-load' : ''}"
                     id="month-${regulator}-${category}-${report}-${year}-${month}"
                     data-regulator="${regulator}" data-category="${category}" data-report="${report}"
                     data-year="${year}" data-month="${month}"
                     onclick="handleMonthClick('${regulator}', '${category}', '${report}', '${year}', '${month}')">`;
            html += `<div class="month-header">
              <span class="month-name">${monthName}</span>
              <span class="month-number">${month}</span>
              ${folderStatus.hasFiles ? '<span class="real-files-indicator" title="Contains real files">🟢</span>' : ''}
              ${isLoading ? '<span class="loading-indicator" title="Scanning for files">⏳</span>' : ''}
              ${!isCached && !isLoading && !realHasFiles ? '<span class="scan-indicator" title="Click to scan">🔍</span>' : ''}
            </div>`;

            if (realHasFiles) {
              html += `<div class="month-files">`;
              html += `<div class="file-count-badge">${realFileCount} file${realFileCount !== 1 ? 's' : ''}</div>`;

              // Add bulk download button for month if multiple files
              if (fileCount > 1) {
                html += `<div class="month-bulk-actions">
                  <button onclick="downloadReportMonth('${category}', '${report}', '${year}', '${month}')"
                          class="btn-month-download" title="Download All Files for ${monthName}">
                    📦 Download Month
                  </button>
                </div>`;
              }

              // Safe iteration over files array
              try {
                files.forEach(file => {
                  if (typeof file === 'string') {
                    const filePath = `${this.baseUploadPath}/${regulator}/${category}/${report}/${year}/${month}/${file}`;
                    const fileInfo = this.getFileTypeInfo(file);
                    html += `<div class="file-item ${fileInfo.cssClass}">
                      <span class="file-icon">${fileInfo.icon}</span>
                      <span class="file-name" title="${file}">${this.truncateFileName(file)}</span>
                      <span class="file-type" title="${fileInfo.description}">${fileInfo.extension.toUpperCase()}</span>
                      <div class="file-actions">
                        <button onclick="viewFileInfo('${filePath}')" class="btn-tiny" title="View Info">ℹ️</button>
                        <button onclick="downloadFile('${filePath}')" class="btn-tiny" title="Download">📥</button>
                      </div>
                    </div>`;
                  } else {
                    console.warn(`⚠️ Invalid file entry in ${category}/${report}/${year}/${month}:`, file);
                  }
                });
              } catch (error) {
                console.error(`❌ Error processing files for ${category}/${report}/${year}/${month}:`, error);
                html += `<div class="file-item error">
                  <span class="file-icon">⚠️</span>
                  <span class="file-name">Error loading files</span>
                </div>`;
              }

              html += `</div>`;
            } else {
              if (isLoading) {
                html += `<div class="loading-month">
                  <span class="loading-icon">⏳</span>
                  <span class="loading-text">Scanning...</span>
                  <span class="loading-subtext">Detecting files</span>
                </div>`;
              } else if (!isCached) {
                html += `<div class="empty-month lazy-scan">
                  <span class="empty-icon">🔍</span>
                  <span class="empty-text">Click to scan</span>
                  <span class="empty-subtext">Lazy load files</span>
                </div>`;
              } else {
                html += `<div class="empty-month">
                  <span class="empty-icon">📂</span>
                  <span class="empty-text">empty</span>
                  <span class="empty-subtext">No files found</span>
                </div>`;
              }
            }

            html += `</div>`;
          }

          html += `</div>`; // Close months-grid
          html += `</div>`; // Close year-section
        }

          html += `</div></div>`; // Close report content and section
        }

        html += `</div></div>`; // Close category content and section
      }

      html += `</div></div>`; // Close regulator content and section
    }

    html += '</div>';
    return html;
  }

  /**
   * Count total files in a report across all years and months
   */
  countFilesInReport(years) {
    let total = 0;
    for (const [year, months] of Object.entries(years)) {
      for (const [month, files] of Object.entries(months)) {
        // Ensure files is always an array
        if (Array.isArray(files)) {
          total += files.length;
        } else {
          console.warn(`⚠️ Files for ${year}/${month} is not an array in countFilesInReport:`, files);
        }
      }
    }
    return total;
  }

  /**
   * Get month name from number
   */
  getMonthName(monthNum) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return months[monthNum - 1];
  }

  /**
   * Truncate file name for display
   */
  truncateFileName(fileName) {
    if (fileName.length <= 20) return fileName;
    const ext = fileName.split('.').pop();
    const name = fileName.substring(0, fileName.lastIndexOf('.'));
    return name.substring(0, 15) + '...' + (ext ? '.' + ext : '');
  }

  /**
   * Sanitize ID for HTML elements
   */
  sanitizeId(str) {
    return str.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  /**
   * Get regulator logo HTML
   */
  getRegulatorLogo(regulator) {
    const logos = {
      'BAM': '<img src="logo/Bank_Al-Maghrib_Logo.png" alt="BAM Logo" class="regulator-logo-img" style="height: 24px; width: auto; margin-right: 8px;">',
      'AMMC': '<img src="logo/ammc logo.png" alt="AMMC Logo" class="regulator-logo-img" style="height: 24px; width: auto; margin-right: 8px;">',
      'DGI': '<img src="logo/dgi logo.png" alt="DGI Logo" class="regulator-logo-img" style="height: 24px; width: auto; margin-right: 8px;">'
    };
    return logos[regulator] || '<span class="regulator-icon" style="margin-right: 8px;">🏛️</span>';
  }

  /**
   * Format regulator name for display with enhanced styling
   */
  formatRegulatorName(regulator) {
    const regulatorNames = {
      'BAM': 'Bank Al-Maghrib (BAM)',
      'AMMC': 'Autorité Marocaine du Marché des Capitaux (AMMC)',
      'DGI': 'Direction Générale des Impôts (DGI)'
    };
    return regulatorNames[regulator] || regulator;
  }

  /**
   * Get category logo HTML
   */
  getCategoryLogo(regulator, category) {
    // For AMMC entities, use bank logos
    if (regulator === 'AMMC') {
      const logos = {
        'BCP': '<img src="logo/BCP logo.png" alt="BCP Logo" class="category-logo-img" style="height: 20px; width: auto; margin-right: 6px;">',
        'BCP2S': '<img src="logo/BCP 2S logo.png" alt="BCP2S Logo" class="category-logo-img" style="height: 20px; width: auto; margin-right: 6px;">',
        'BANK_AL_YOUSR': '<img src="logo/bank al yousr.png" alt="Bank Al Yousr Logo" class="category-logo-img" style="height: 20px; width: auto; margin-right: 6px;">'
      };
      return logos[category] || '<span class="category-icon" style="margin-right: 6px;">🏢</span>';
    }

    // For BAM and DGI, use category icons
    const categoryIcons = {
      'I___Situation_comptable_et_états_annexes': '<span class="category-icon" style="margin-right: 6px;">📊</span>',
      'II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires': '<span class="category-icon" style="margin-right: 6px;">📋</span>',
      'III___Etats_relatifs_à_la_réglementation_prudentielle': '<span class="category-icon" style="margin-right: 6px;">⚖️</span>',
      'DGI': '<span class="category-icon" style="margin-right: 6px;">🏛️</span>'
    };
    return categoryIcons[category] || '<span class="category-icon" style="margin-right: 6px;">📁</span>';
  }

  /**
   * Format category name for display with enhanced styling
   */
  formatCategoryName(category) {
    const categoryNames = {
      'I___Situation_comptable_et_états_annexes': 'I – Situation comptable et états annexes',
      'II___Etats_de_synthèse_et_documents_qui_leur_sont_complémentaires': 'II – Etats de synthèse et documents qui leur sont complémentaires',
      'III___Etats_relatifs_à_la_réglementation_prudentielle': 'III – Etats relatifs à la réglementation prudentielle',
      'BCP': 'BCP - Banque Centrale Populaire',
      'BCP2S': 'BCP2S - BCP Securities Services',
      'BANK_AL_YOUSR': 'BANK AL YOUSR'
    };
    return categoryNames[category] || category.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  /**
   * Format report name for display with enhanced styling
   */
  formatReportName(report) {
    // Add appropriate icons based on report type
    const reportIcons = {
      'Bilan': '📊',
      'Compte_de_produits_et_charges': '💰',
      'Etat_LCR': '💧',
      'Situation_Comptable': '📋',
      'Stress_test': '⚡',
      'Fonds_propres': '💎',
      'Ratio_de_levier': '⚖️',
      'Risques_encourus': '⚠️',
      'Tableau_des_flux': '🔄',
      'Etat_des_soldes': '📈'
    };

    // Find matching icon
    let icon = '📄'; // default icon
    for (const [key, emoji] of Object.entries(reportIcons)) {
      if (report.includes(key)) {
        icon = emoji;
        break;
      }
    }

    return `${icon} ${report.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')}`;
  }

  /**
   * Refresh the file structure and scan for new files
   */
  async refresh() {
    console.log('🔄 Refreshing file structure with BAM and AMMC...');

    try {
      // Clear current structure and folder contents cache
      this.fileStructure = {};
      this.folderContents.clear();

      // Load ALL_REPORTINGS.json first
      await this.loadAllReportingsData();

      // Load BAM reporting data
      await this.loadCentralizedReportingData();

      // Load AMMC reporting data
      await this.loadAMMCData();

      // Reload file structure (this will automatically scan for real files)
      await this.loadFileStructure();

      // Check all folder contents for real files (this is for the visual indicators)
      await this.checkAllFolderContents();

      console.log('✅ File structure refreshed successfully with BAM and AMMC');
      return true;
    } catch (error) {
      console.error('❌ Error refreshing file structure:', error);
      throw error;
    }
  }

  /**
   * Check all folder contents for real files
   */
  async checkAllFolderContents() {
    console.log('🔍 Checking all folder contents for real files...');

    const promises = [];

    // Check all BAM and AMMC folders
    for (const [regulator, categories] of Object.entries(this.fileStructure)) {
      for (const [category, reports] of Object.entries(categories)) {
        for (const [report, years] of Object.entries(reports)) {
          for (const [year, months] of Object.entries(years)) {
            for (const month of Object.keys(months)) {
              const folderPath = `${this.baseUploadPath}/${regulator}/${category}/${report}/${year}/${month}`;

              // Add promise to check this folder
              promises.push(this.checkFolderContents(folderPath));
            }
          }
        }
      }
    }

    // Wait for all folder checks to complete
    await Promise.all(promises);

    console.log(`✅ Checked ${promises.length} folders for real files`);
    console.log(`📊 Found ${Array.from(this.folderContents.values()).filter(f => f.hasFiles).length} folders with files`);
  }



  /**
   * Regenerate the file listing by calling the Python script
   */
  async regenerateFileListing() {
    console.log('Regenerating file listing...');

    // Since we can't directly execute Python from JavaScript,
    // we'll try to trigger a file listing update

    // For now, we'll just reload the existing listing
    // In a production environment, this could trigger a server-side script

    console.log('File listing regeneration requested');
  }

  /**
   * Load from embedded file data with lazy loading optimization
   */
  async loadFromEmbeddedData() {
    console.log('🚀 Loading file structure with lazy loading optimization...');

    // Get the base empty structure using ALL_REPORTINGS.json
    const structure = await this.scanActualFileStructure();

    // Pre-populate known files for instant display
    this.prePopulateKnownFiles(structure);

    console.log('✅ File structure loaded with lazy loading enabled');
    console.log('📊 Known files pre-populated for instant display');

    // Save initial structure to cache
    this.saveCacheToStorage();

    return structure;
  }

  /**
   * Pre-populate known file locations for instant display
   */
  prePopulateKnownFiles(structure) {
    console.log('⚡ Pre-populating known files for instant display...');

    let prePopulatedCount = 0;

    for (const [folderPath, files] of Object.entries(this.knownFiles)) {
      const pathParts = folderPath.split('/');
      if (pathParts.length === 5) {
        const [regulator, category, report, year, month] = pathParts;

        if (structure[regulator]?.[category]?.[report]?.[year]?.[month] !== undefined) {
          structure[regulator][category][report][year][month] = [...files];
          prePopulatedCount += files.length;

          // Cache the result
          this.scanCache.set(folderPath, {
            files: [...files],
            timestamp: Date.now(),
            source: 'known_files'
          });
        }
      }
    }

    console.log(`✅ Pre-populated ${prePopulatedCount} known files for instant display`);
  }

  /**
   * Lazy load files for a specific folder when user expands it
   */
  async lazyLoadFolderFiles(regulator, category, report, year, month) {
    const folderPath = `${regulator}/${category}/${report}/${year}/${month}`;
    const cacheKey = folderPath;

    console.log(`🔍 Lazy loading files for: ${folderPath}`);

    // Check if already cached
    if (this.scanCache.has(cacheKey)) {
      const cached = this.scanCache.get(cacheKey);
      console.log(`📦 Using cached result for ${folderPath}:`, cached.files);
      return cached.files;
    }

    // Check if already loading
    if (this.loadingStates.has(cacheKey)) {
      console.log(`⏳ Already loading ${folderPath}, waiting...`);
      return this.loadingStates.get(cacheKey);
    }

    // Start loading
    const loadingPromise = this.performLazyFolderScan(regulator, category, report, year, month);
    this.loadingStates.set(cacheKey, loadingPromise);

    try {
      const files = await loadingPromise;

      // Cache the result
      this.scanCache.set(cacheKey, {
        files: files,
        timestamp: Date.now(),
        source: 'lazy_scan'
      });

      // Update the file structure
      if (this.fileStructure[regulator]?.[category]?.[report]?.[year]) {
        this.fileStructure[regulator][category][report][year][month] = files;
      }

      // Save cache
      this.saveCacheToStorage();

      console.log(`✅ Lazy loaded ${files.length} files for ${folderPath}`);
      return files;

    } finally {
      this.loadingStates.delete(cacheKey);
    }
  }

  /**
   * Perform optimized folder scan with timeout and parallel processing
   */
  async performLazyFolderScan(regulator, category, report, year, month) {
    const folderPath = `${this.baseUploadPath}/${regulator}/${category}/${report}/${year}/${month}`;

    // Wait for available scan slot
    await this.waitForScanSlot();

    this.activeScanCount++;

    try {
      // Set timeout for this scan
      const timeoutPromise = new Promise((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Scan timeout for ${folderPath}`));
        }, this.defaultScanTimeout);
        this.scanTimeouts.set(folderPath, timeoutId);
      });

      // Perform the actual scan with timeout
      const scanPromise = this.scanFolderForRealFiles(folderPath);

      const files = await Promise.race([scanPromise, timeoutPromise]);

      // Clear timeout
      const timeoutId = this.scanTimeouts.get(folderPath);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.scanTimeouts.delete(folderPath);
      }

      return files;

    } catch (error) {
      console.warn(`⚠️ Scan failed for ${folderPath}:`, error.message);
      return [];
    } finally {
      this.activeScanCount--;
    }
  }

  /**
   * Wait for available scan slot to limit concurrent scans
   */
  async waitForScanSlot() {
    while (this.activeScanCount >= this.maxConcurrentScans) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Calculate statistics for a structure to verify file detection
   */
  calculateStructureStats(structure) {
    let totalFiles = 0;
    let foldersWithFiles = 0;
    let totalFolders = 0;

    for (const [regulator, categories] of Object.entries(structure)) {
      for (const [category, reports] of Object.entries(categories)) {
        for (const [report, years] of Object.entries(reports)) {
          for (const [year, months] of Object.entries(years)) {
            for (const [month, files] of Object.entries(months)) {
              totalFolders++;
              if (Array.isArray(files) && files.length > 0) {
                totalFiles += files.length;
                foldersWithFiles++;
              }
            }
          }
        }
      }
    }

    return { totalFiles, foldersWithFiles, totalFolders };
  }

  /**
   * Scan actual folders for real files and update the structure
   */
  async scanAndUpdateRealFiles(structure) {
    console.log('🔍 Scanning actual folders for real files...');

    for (const [regulator, categories] of Object.entries(structure)) {
      console.log(`📁 Scanning regulator: ${regulator}`);

      for (const [category, reports] of Object.entries(categories)) {
        console.log(`  📂 Scanning category: ${category}`);

        for (const [report, years] of Object.entries(reports)) {
          for (const [year, months] of Object.entries(years)) {
            for (const month of Object.keys(months)) {
              // Build the actual folder path
              const folderPath = `${this.baseUploadPath}/${regulator}/${category}/${report}/${year}/${month}`;

              try {
                // Try to scan this specific folder for files
                const files = await this.scanFolderForRealFiles(folderPath);
                if (files.length > 0) {
                  console.log(`    📄 Found ${files.length} files in ${report}/${year}/${month}:`, files);
                  console.log(`    🎯 Updating structure for: ${regulator}/${category}/${report}/${year}/${month}`);
                  structure[regulator][category][report][year][month] = files;
                } else {
                  console.log(`    📭 No files found in ${report}/${year}/${month} (${folderPath})`);
                }
              } catch (error) {
                // Folder doesn't exist or can't be accessed - keep empty
                console.log(`    📭 No files found in ${report}/${year}/${month}`);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Optimized dynamic scan with prioritized methods and timeout
   */
  async scanFolderForRealFiles(folderPath) {
    console.log(`⚡ Optimized scan: ${folderPath}`);

    // Method 1: Try directory listing first (fastest and most comprehensive)
    try {
      const directoryFiles = await Promise.race([
        this.scanDirectoryListing(folderPath),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Directory listing timeout')), 2000))
      ]);

      if (directoryFiles.length > 0) {
        console.log(`✅ Directory listing found ${directoryFiles.length} files:`, directoryFiles);
        return directoryFiles;
      }
    } catch (error) {
      console.log(`📭 Directory listing failed/timeout for ${folderPath}`);
    }

    // Method 2: Try intelligent pattern matching (faster than brute force)
    try {
      const intelligentFiles = await Promise.race([
        this.scanKnownFileExistence(folderPath),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Intelligent scan timeout')), 1500))
      ]);

      if (intelligentFiles.length > 0) {
        console.log(`✅ Intelligent scan found ${intelligentFiles.length} files:`, intelligentFiles);
        return intelligentFiles;
      }
    } catch (error) {
      console.log(`📭 Intelligent scan failed/timeout for ${folderPath}`);
    }

    // Method 3: Try dynamic patterns (slower, limited patterns)
    try {
      const dynamicFiles = await Promise.race([
        this.scanWithLimitedPatterns(folderPath),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Dynamic scan timeout')), 1000))
      ]);

      if (dynamicFiles.length > 0) {
        console.log(`✅ Limited pattern scan found ${dynamicFiles.length} files:`, dynamicFiles);
        return dynamicFiles;
      }
    } catch (error) {
      console.log(`📭 Dynamic pattern scan failed/timeout for ${folderPath}`);
    }

    console.log(`📭 No files detected in ${folderPath} after optimized scan`);
    return [];
  }

  /**
   * Scan directory listing for all files (format-agnostic)
   */
  async scanDirectoryListing(folderPath) {
    const files = [];

    try {
      const response = await fetch(folderPath + '/');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const parsedFiles = this.parseDirectoryListing(html);

      // Accept ALL file types (format-agnostic)
      const validFiles = parsedFiles.filter(file => {
        // Exclude directories and system files
        return file &&
               !file.endsWith('/') &&
               !file.startsWith('.') &&
               file.includes('.') && // Must have an extension
               !file.toLowerCase().includes('index.html') &&
               !file.toLowerCase().includes('readme');
      });

      return validFiles;
    } catch (error) {
      throw new Error(`Directory listing failed: ${error.message}`);
    }
  }

  /**
   * Optimized limited pattern scanning for better performance
   */
  async scanWithLimitedPatterns(folderPath) {
    const files = [];

    // Only check the most common file extensions for performance
    const priorityExtensions = ['xlsx', 'pdf', 'docx', 'txt', 'csv'];

    // Extract folder context for intelligent naming
    const pathParts = folderPath.split('/');
    const month = pathParts[pathParts.length - 1];
    const year = pathParts[pathParts.length - 2];
    const report = pathParts[pathParts.length - 3];

    // Generate only the most likely patterns
    const patterns = [];

    // Pattern 1: Most common naming conventions
    for (const ext of priorityExtensions) {
      patterns.push(`${report}.${ext}`);
      patterns.push(`document.${ext}`);
      patterns.push(`rapport.${ext}`);
      patterns.push(`${month}.${ext}`);
    }

    // Batch check patterns for better performance
    const batchSize = 5;
    for (let i = 0; i < patterns.length; i += batchSize) {
      const batch = patterns.slice(i, i + batchSize);
      const batchPromises = batch.map(pattern => this.checkFileExists(`${folderPath}/${pattern}`));

      try {
        const results = await Promise.allSettled(batchPromises);
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            files.push(batch[index]);
          }
        });
      } catch (error) {
        // Continue with next batch
      }

      // If we found files, return early
      if (files.length > 0) {
        break;
      }
    }

    return files;
  }

  /**
   * Check if a single file exists with timeout
   */
  async checkFileExists(filePath) {
    try {
      const response = await fetch(filePath, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Scan with dynamic patterns for any file types
   */
  async scanWithDynamicPatterns(folderPath) {
    const files = [];

    // Common file extensions (format-agnostic)
    const extensions = [
      'xlsx', 'xls', 'xlsm', 'xlsb', // Excel files
      'pdf', // PDF documents
      'docx', 'doc', 'docm', // Word documents
      'pptx', 'ppt', 'pptm', // PowerPoint
      'txt', 'csv', // Text files
      'zip', 'rar', '7z', // Archives
      'jpg', 'jpeg', 'png', 'gif', 'bmp', // Images
      'json', 'xml', 'html', 'htm', // Data files
      'rtf', 'odt', 'ods', 'odp' // Other office formats
    ];

    // Extract folder context for intelligent naming
    const pathParts = folderPath.split('/');
    const month = pathParts[pathParts.length - 1];
    const year = pathParts[pathParts.length - 2];
    const report = pathParts[pathParts.length - 3];

    // Generate dynamic file name patterns
    const patterns = [];

    // Pattern 1: Report-based naming
    for (const ext of extensions) {
      patterns.push(`${report}.${ext}`);
      patterns.push(`${report}_${month}_${year}.${ext}`);
      patterns.push(`${report}_${year}_${month}.${ext}`);
      patterns.push(`${report.toLowerCase()}.${ext}`);
      patterns.push(`${report.toLowerCase()}_${month}_${year}.${ext}`);
    }

    // Pattern 2: Generic naming
    for (const ext of extensions) {
      patterns.push(`rapport.${ext}`);
      patterns.push(`document.${ext}`);
      patterns.push(`fichier.${ext}`);
      patterns.push(`data.${ext}`);
      patterns.push(`export.${ext}`);
      patterns.push(`${month}.${ext}`);
      patterns.push(`${year}_${month}.${ext}`);
    }

    // Pattern 3: Numbered files
    for (let i = 1; i <= 10; i++) {
      for (const ext of extensions) {
        patterns.push(`${i}.${ext}`);
        patterns.push(`file${i}.${ext}`);
        patterns.push(`document${i}.${ext}`);
      }
    }

    // Test each pattern
    for (const pattern of patterns) {
      try {
        const response = await fetch(`${folderPath}/${pattern}`);
        if (response.ok) {
          files.push(pattern);
          console.log(`📄 Found file: ${pattern}`);
        }
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    return files;
  }

  /**
   * Check for known file existence using intelligent guessing (fallback method)
   */
  async scanKnownFileExistence(folderPath) {
    const files = [];

    // Extract context from folder path
    const pathParts = folderPath.split('/');
    const month = pathParts[pathParts.length - 1];
    const year = pathParts[pathParts.length - 2];
    const report = pathParts[pathParts.length - 3];
    const category = pathParts[pathParts.length - 4];
    const regulator = pathParts[pathParts.length - 5];

    console.log(`🔍 Intelligent file existence check for: ${regulator}/${category}/${report}/${year}/${month}`);

    // Generate intelligent file name guesses based on context
    const intelligentGuesses = [];

    // Common file extensions
    const extensions = ['xlsx', 'pdf', 'docx', 'txt', 'csv', 'xls'];

    // Pattern 1: Exact report name
    for (const ext of extensions) {
      intelligentGuesses.push(`${report}.${ext}`);
      intelligentGuesses.push(`${report.toLowerCase()}.${ext}`);
    }

    // Pattern 2: Report with date
    const monthNames = {
      '1': ['Jan', 'Janvier', 'January'],
      '2': ['Fév', 'Février', 'February'],
      '3': ['Mars', 'March'],
      '4': ['Avril', 'April'],
      '5': ['Mai', 'May'],
      '6': ['Juin', 'June'],
      '7': ['Juil', 'Juillet', 'July'],
      '8': ['Août', 'August'],
      '9': ['Sep', 'Septembre', 'September'],
      '10': ['Oct', 'Octobre', 'October'],
      '11': ['Nov', 'Novembre', 'November'],
      '12': ['Déc', 'Décembre', 'December']
    };

    const monthVariations = monthNames[month] || [''];

    for (const monthName of monthVariations) {
      for (const ext of extensions) {
        intelligentGuesses.push(`${report} - ${monthName} ${year}.${ext}`);
        intelligentGuesses.push(`${report}_${monthName}_${year}.${ext}`);
        intelligentGuesses.push(`${report} ${monthName} ${year}.${ext}`);

        // Special patterns for specific reports
        if (report.includes('LCR')) {
          intelligentGuesses.push(`Etat  331 -  LCR - ${monthName} ${year} --BCP2S.${ext}`);
          intelligentGuesses.push(`Etat  331 -  LCR - ${monthName} ${year} -BCP2S.${ext}`);
        }
      }
    }

    // Pattern 3: Generic names
    for (const ext of extensions) {
      intelligentGuesses.push(`document.${ext}`);
      intelligentGuesses.push(`rapport.${ext}`);
      intelligentGuesses.push(`fichier.${ext}`);
      intelligentGuesses.push(`${month}.${ext}`);
      intelligentGuesses.push(`${year}_${month}.${ext}`);
    }

    // Test each intelligent guess
    for (const fileName of intelligentGuesses) {
      try {
        const response = await fetch(`${folderPath}/${fileName}`);
        if (response.ok) {
          files.push(fileName);
          console.log(`📄 Intelligent guess confirmed: ${fileName}`);
        }
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    console.log(`🎯 Intelligent guessing found ${files.length} files`);
    return files;
  }

  /**
   * Load file structure from the generated file listing JSON
   */
  async loadFromFileListing() {
    console.log('🔍 Loading file structure from file listing...');

    try {
      const url = './UPLOADED_REPORTINGS/file_listing.json';
      console.log('📡 Fetching:', url);

      const response = await fetch(url);
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Failed to load file listing: ${response.status} ${response.statusText}`);
      }

      const listingData = await response.json();
      console.log('✅ File listing loaded successfully');
      console.log('📊 Statistics from JSON:', listingData.statistics);
      console.log('📁 Structure keys:', Object.keys(listingData.structure));

      // Check for LCR data specifically
      const lcrData = listingData.structure?.["III___Etats_relatifs_à_la_réglementation_prudentielle"]?.["Etat_LCR"];
      if (lcrData) {
        console.log('🎯 LCR Data Found in JSON:', lcrData);
      } else {
        console.log('❌ LCR Data NOT Found in JSON');
      }

      // The structure from file_listing.json contains real uploaded files
      // We need to merge this with the complete structure from ALL_REPORTINGS.json
      const uploadedFiles = listingData.structure;
      console.log('📊 Uploaded files structure:', Object.keys(uploadedFiles));

      // Load the complete structure from ALL_REPORTINGS.json to get all regulators
      const completeStructure = await this.scanActualFileStructure();
      console.log('📁 Complete structure regulators:', Object.keys(completeStructure));

      // Merge uploaded files into the complete structure
      // The uploaded files are BAM files, so merge them into the BAM section
      if (completeStructure.BAM && uploadedFiles) {
        for (const [category, reports] of Object.entries(uploadedFiles)) {
          if (completeStructure.BAM[category]) {
            // Merge the reports
            for (const [report, years] of Object.entries(reports)) {
              if (completeStructure.BAM[category][report]) {
                // Merge the files into existing structure
                for (const [year, months] of Object.entries(years)) {
                  if (completeStructure.BAM[category][report][year]) {
                    for (const [month, files] of Object.entries(months)) {
                      if (Array.isArray(files) && files.length > 0) {
                        completeStructure.BAM[category][report][year][month] = files;
                        console.log(`✅ Merged ${files.length} files into BAM/${category}/${report}/${year}/${month}`);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Verify the uploaded file is present
      const irrbbFiles = completeStructure?.["BAM"]?.["III___Etats_relatifs_à_la_réglementation_prudentielle"]?.["Reporting_réglementaire_IRRBB"]?.["2025"]?.["6"];
      if (irrbbFiles && irrbbFiles.length > 0) {
        console.log('✅ Uploaded IRRBB file found in complete structure:', irrbbFiles);
      } else {
        console.log('❌ Uploaded IRRBB file not found in complete structure');
      }

      return completeStructure;

    } catch (error) {
      console.error('❌ Error loading file listing:', error);
      throw error;
    }
  }

  /**
   * Ensure the structure has all reporting types and months, even if empty
   */
  async ensureCompleteStructure(partialStructure) {
    console.log('🔧 Ensuring complete structure...');
    console.log('📊 Input structure keys:', Object.keys(partialStructure));

    // Start with the complete empty structure using ALL_REPORTINGS.json
    const completeStructure = await this.scanActualFileStructure();
    console.log('📁 Generated base structure with', Object.keys(completeStructure).length, 'categories');

    // Merge in the real files from the partial structure
    for (const regulator in partialStructure) {
      console.log(`🔍 Processing regulator: ${regulator}`);

      if (completeStructure[regulator]) {
        for (const category in partialStructure[regulator]) {
          console.log(`  📁 Processing category: ${category}`);

          if (completeStructure[regulator][category]) {
            for (const report in partialStructure[regulator][category]) {
              console.log(`    📄 Processing report: ${report}`);

              if (completeStructure[regulator][category][report]) {
                for (const year in partialStructure[regulator][category][report]) {
                  console.log(`      📅 Processing year: ${year}`);

                  if (completeStructure[regulator][category][report][year]) {
                    for (const month in partialStructure[regulator][category][report][year]) {
                      const files = partialStructure[regulator][category][report][year][month];
                      if (files && files.length > 0) {
                        console.log(`        📂 Month ${month}: ${files.length} files found:`, files);
                        // Replace empty array with real files
                        completeStructure[regulator][category][report][year][month] = files;
                      }
                    }
                  }
                }
              } else {
                console.log(`    ⚠️ Report ${report} not found in complete structure, adding it...`);
                // Add the entire report structure if it doesn't exist
                completeStructure[regulator][category][report] = partialStructure[regulator][category][report];
              }
            }
          } else {
            console.log(`  ⚠️ Category ${category} not found in complete structure, adding it...`);
            // Add the entire category if it doesn't exist
            completeStructure[regulator][category] = partialStructure[regulator][category];
          }
        }
      } else {
        console.log(`⚠️ Regulator ${regulator} not found in complete structure, adding it...`);
        // Add the entire regulator if it doesn't exist
        completeStructure[regulator] = partialStructure[regulator];
      }
    }

    // Verify LCR files are preserved (using proper nested structure)
    const lcrFiles = completeStructure?.["BAM"]?.["III___Etats_relatifs_à_la_réglementation_prudentielle"]?.["Etat_LCR"]?.["2025"];
    if (lcrFiles) {
      console.log('✅ LCR files preserved in complete structure:', lcrFiles);
    } else {
      console.log('❌ LCR files lost during structure merge!');
    }

    return completeStructure;
  }

  /**
   * Scan the real file system for actual files (fallback method)
   */
  async scanRealFileSystem() {
    console.log('Scanning real file system...');

    // Start with the complete empty structure
    const structure = this.generateActualFileStructure();

    // Try to scan for real files using fetch requests
    const categories = Object.keys(structure);

    for (const category of categories) {
      console.log(`Scanning category: ${category}`);

      // Get all reporting types for this category
      const reportings = this.getReportingTypesForCategory(category);

      for (const reporting of reportings) {
        console.log(`Scanning reporting: ${reporting}`);

        // Check each month folder for files
        for (let month = 1; month <= 12; month++) {
          const monthStr = month.toString();
          const folderPath = `${this.baseUploadPath}/${category}/${reporting}/2025/${monthStr}`;

          try {
            const files = await this.scanFolderForFiles(folderPath);
            if (files.length > 0) {
              // Initialize structure if needed
              if (!structure[category][reporting]) {
                structure[category][reporting] = { "2025": {} };
              }
              if (!structure[category][reporting]["2025"]) {
                structure[category][reporting]["2025"] = {};
              }

              structure[category][reporting]["2025"][monthStr] = files;
              console.log(`Found ${files.length} files in ${folderPath}:`, files);
            }
          } catch (error) {
            // Folder doesn't exist or can't be accessed - keep empty
            if (!structure[category][reporting]) {
              structure[category][reporting] = { "2025": {} };
            }
            if (!structure[category][reporting]["2025"]) {
              structure[category][reporting]["2025"] = {};
            }
            structure[category][reporting]["2025"][monthStr] = [];
          }
        }
      }
    }

    console.log('Real file system scan complete');
    return structure;
  }

  /**
   * Scan a specific folder for files using directory listing (format-agnostic)
   */
  async scanFolderForFiles(folderPath) {
    console.log(`🔍 Scanning folder for files: ${folderPath}`);

    try {
      // Try to get directory listing by attempting to fetch the folder
      const response = await fetch(folderPath + '/');

      if (response.ok) {
        const html = await response.text();

        // Parse HTML directory listing to extract ALL file types (format-agnostic)
        const files = this.parseDirectoryListing(html);
        console.log(`✅ Directory listing found ${files.length} files:`, files);
        return files; // Return ALL files, not just specific extensions
      }
    } catch (error) {
      console.log(`📭 Directory listing failed for ${folderPath}:`, error.message);
      // If directory listing fails, try dynamic pattern scanning
      return await this.scanWithDynamicPatterns(folderPath);
    }

    return [];
  }

  /**
   * Try to find files using common naming patterns
   */
  async tryKnownFilePatterns(folderPath) {
    const files = [];

    // Extract month from folder path to generate specific patterns
    const pathParts = folderPath.split('/');
    const month = pathParts[pathParts.length - 1]; // Last part is the month
    const report = pathParts[pathParts.length - 3]; // Report name

    let commonPatterns = [];

    // Generate specific patterns based on the report type and month
    if (report === 'Etat_LCR') {
      const monthNames = {
        '1': 'Jan', '2': 'Fév', '3': 'Mars', '4': 'Avril', '5': 'Mai', '6': 'Juin',
        '7': 'Juil', '8': 'Août', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc'
      };
      const monthName = monthNames[month] || 'Jan';

      commonPatterns = [
        `Etat  331 -  LCR - ${monthName} 2025 --BCP2S.xlsx`,
        `Etat  331 -  LCR - ${monthName} 2025 -BCP2S.xlsx`,
        `LCR_${monthName}_2025.xlsx`,
        `etat_lcr_${month}_2025.xlsx`
      ];
    } else {
      // Generic patterns for other reports
      commonPatterns = [
        `${report}_${month}_2025.xlsx`,
        `${report.toLowerCase()}_${month}_2025.xlsx`,
        `rapport_${month}_2025.xlsx`,
        `etat_${month}_2025.xlsx`
      ];
    }

    for (const pattern of commonPatterns) {
      try {
        const response = await fetch(`${folderPath}/${pattern}`);
        if (response.ok) {
          files.push(pattern);
          console.log(`✅ Found file: ${folderPath}/${pattern}`);
        }
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    return files;
  }

  /**
   * Parse HTML directory listing to extract file names (format-agnostic)
   */
  parseDirectoryListing(html) {
    const files = [];

    console.log('🔍 Parsing directory listing HTML...');

    // Method 1: Apache-style directory listing
    const apacheRegex = /<a href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let match;
    while ((match = apacheRegex.exec(html)) !== null) {
      const fileName = match[1];
      if (this.isValidFileName(fileName)) {
        files.push(fileName);
        console.log(`📄 Apache-style found: ${fileName}`);
      }
    }

    if (files.length > 0) {
      console.log(`✅ Apache parsing found ${files.length} files`);
      return [...new Set(files)]; // Remove duplicates
    }

    // Method 2: Nginx-style directory listing
    const nginxRegex = /<a href="([^"]+)">([^<]+)<\/a>/gi;
    while ((match = nginxRegex.exec(html)) !== null) {
      const fileName = match[1];
      if (this.isValidFileName(fileName)) {
        files.push(fileName);
        console.log(`📄 Nginx-style found: ${fileName}`);
      }
    }

    if (files.length > 0) {
      console.log(`✅ Nginx parsing found ${files.length} files`);
      return [...new Set(files)]; // Remove duplicates
    }

    // Method 3: Generic link extraction (any file with extension)
    const genericRegex = /href="([^"]*\.[a-zA-Z0-9]+)"/gi;
    while ((match = genericRegex.exec(html)) !== null) {
      const fileName = match[1];
      if (this.isValidFileName(fileName)) {
        files.push(fileName);
        console.log(`📄 Generic found: ${fileName}`);
      }
    }

    if (files.length > 0) {
      console.log(`✅ Generic parsing found ${files.length} files`);
      return [...new Set(files)]; // Remove duplicates
    }

    // Method 4: Text-based extraction (look for file-like strings)
    const textRegex = /([a-zA-Z0-9\s\-_\.àâäéèêëïîôöùûüÿç]+\.[a-zA-Z0-9]{2,5})/gi;
    while ((match = textRegex.exec(html)) !== null) {
      const fileName = match[1].trim();
      if (this.isValidFileName(fileName) && fileName.length > 3) {
        files.push(fileName);
        console.log(`📄 Text-based found: ${fileName}`);
      }
    }

    console.log(`📊 Total files parsed: ${files.length}`);
    return [...new Set(files)]; // Remove duplicates
  }

  /**
   * Check if a filename is valid for our purposes
   */
  isValidFileName(fileName) {
    if (!fileName || typeof fileName !== 'string') return false;

    // Exclude navigation and system files
    const excludePatterns = [
      '../', './', '?', '#', 'index.html', 'index.htm',
      'readme.txt', 'readme.md', '.htaccess', '.gitignore',
      'thumbs.db', '.ds_store'
    ];

    const lowerFileName = fileName.toLowerCase();

    // Check exclusions
    for (const pattern of excludePatterns) {
      if (lowerFileName.includes(pattern.toLowerCase())) {
        return false;
      }
    }

    // Must have an extension and not be a directory
    return fileName.includes('.') &&
           !fileName.endsWith('/') &&
           !fileName.startsWith('.') &&
           fileName.length > 3;
  }

  /**
   * Get file type information for format-agnostic display
   */
  getFileTypeInfo(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();

    const fileTypes = {
      // Excel files
      'xlsx': { icon: '📊', description: 'Excel Spreadsheet', cssClass: 'excel-file' },
      'xls': { icon: '📊', description: 'Excel Spreadsheet (Legacy)', cssClass: 'excel-file' },
      'xlsm': { icon: '📊', description: 'Excel Macro-Enabled', cssClass: 'excel-file' },
      'xlsb': { icon: '📊', description: 'Excel Binary', cssClass: 'excel-file' },

      // PDF files
      'pdf': { icon: '📄', description: 'PDF Document', cssClass: 'pdf-file' },

      // Word documents
      'docx': { icon: '📝', description: 'Word Document', cssClass: 'word-file' },
      'doc': { icon: '📝', description: 'Word Document (Legacy)', cssClass: 'word-file' },
      'docm': { icon: '📝', description: 'Word Macro-Enabled', cssClass: 'word-file' },

      // PowerPoint
      'pptx': { icon: '📊', description: 'PowerPoint Presentation', cssClass: 'powerpoint-file' },
      'ppt': { icon: '📊', description: 'PowerPoint (Legacy)', cssClass: 'powerpoint-file' },
      'pptm': { icon: '📊', description: 'PowerPoint Macro-Enabled', cssClass: 'powerpoint-file' },

      // Text files
      'txt': { icon: '📄', description: 'Text File', cssClass: 'text-file' },
      'csv': { icon: '📋', description: 'CSV Data File', cssClass: 'csv-file' },
      'json': { icon: '🔧', description: 'JSON Data', cssClass: 'json-file' },
      'xml': { icon: '🔧', description: 'XML Data', cssClass: 'xml-file' },

      // Archives
      'zip': { icon: '📦', description: 'ZIP Archive', cssClass: 'archive-file' },
      'rar': { icon: '📦', description: 'RAR Archive', cssClass: 'archive-file' },
      '7z': { icon: '📦', description: '7-Zip Archive', cssClass: 'archive-file' },

      // Images
      'jpg': { icon: '🖼️', description: 'JPEG Image', cssClass: 'image-file' },
      'jpeg': { icon: '🖼️', description: 'JPEG Image', cssClass: 'image-file' },
      'png': { icon: '🖼️', description: 'PNG Image', cssClass: 'image-file' },
      'gif': { icon: '🖼️', description: 'GIF Image', cssClass: 'image-file' },
      'bmp': { icon: '🖼️', description: 'Bitmap Image', cssClass: 'image-file' },

      // Other office formats
      'rtf': { icon: '📝', description: 'Rich Text Format', cssClass: 'rtf-file' },
      'odt': { icon: '📝', description: 'OpenDocument Text', cssClass: 'odt-file' },
      'ods': { icon: '📊', description: 'OpenDocument Spreadsheet', cssClass: 'ods-file' },
      'odp': { icon: '📊', description: 'OpenDocument Presentation', cssClass: 'odp-file' },

      // Web files
      'html': { icon: '🌐', description: 'HTML Document', cssClass: 'html-file' },
      'htm': { icon: '🌐', description: 'HTML Document', cssClass: 'html-file' },
      'css': { icon: '🎨', description: 'CSS Stylesheet', cssClass: 'css-file' },
      'js': { icon: '⚙️', description: 'JavaScript File', cssClass: 'js-file' }
    };

    const fileInfo = fileTypes[extension] || {
      icon: '📄',
      description: 'Unknown File Type',
      cssClass: 'unknown-file'
    };

    return {
      ...fileInfo,
      extension: extension,
      fileName: fileName
    };
  }

  /**
   * Refresh file detection for a specific folder with progress feedback
   */
  async refreshFolderFiles(regulator, category, report, year, month, progressCallback) {
    const folderPath = `${regulator}/${category}/${report}/${year}/${month}`;

    console.log(`🔄 Refreshing files for: ${folderPath}`);

    if (progressCallback) {
      progressCallback({ status: 'starting', message: 'Starting file scan...' });
    }

    // Clear cache for this folder
    this.scanCache.delete(folderPath);

    if (progressCallback) {
      progressCallback({ status: 'scanning', message: 'Scanning for files...' });
    }

    try {
      const files = await this.lazyLoadFolderFiles(regulator, category, report, year, month);

      if (progressCallback) {
        progressCallback({
          status: 'complete',
          message: `Found ${files.length} files`,
          files: files
        });
      }

      return files;
    } catch (error) {
      console.error(`❌ Error refreshing ${folderPath}:`, error);

      if (progressCallback) {
        progressCallback({
          status: 'error',
          message: `Error: ${error.message}`,
          error: error
        });
      }

      return [];
    }
  }

  /**
   * Bulk refresh multiple folders with progress tracking
   */
  async bulkRefreshFolders(folderList, progressCallback) {
    console.log(`🔄 Bulk refreshing ${folderList.length} folders...`);

    const results = [];
    let completed = 0;

    for (const folder of folderList) {
      const { regulator, category, report, year, month } = folder;

      if (progressCallback) {
        progressCallback({
          status: 'progress',
          completed: completed,
          total: folderList.length,
          current: `${regulator}/${category}/${report}/${year}/${month}`
        });
      }

      try {
        const files = await this.refreshFolderFiles(regulator, category, report, year, month);
        results.push({ folder, files, success: true });
      } catch (error) {
        results.push({ folder, error, success: false });
      }

      completed++;
    }

    if (progressCallback) {
      progressCallback({
        status: 'complete',
        completed: completed,
        total: folderList.length,
        results: results
      });
    }

    console.log(`✅ Bulk refresh complete: ${results.filter(r => r.success).length}/${folderList.length} successful`);
    return results;
  }

  /**
   * Get scan performance statistics
   */
  getScanStatistics() {
    return {
      cacheSize: this.scanCache.size,
      activeScans: this.activeScanCount,
      maxConcurrentScans: this.maxConcurrentScans,
      queuedScans: this.scanQueue.length,
      loadingFolders: this.loadingStates.size,
      knownFilesCount: Object.keys(this.knownFiles).length
    };
  }

  /**
   * Get reporting types for a specific category
   */
  getReportingTypesForCategory(category) {
    if (category.includes('I___Situation_comptable')) {
      return [
        "Situation_Comptable_provisoire",
        "Situation_Comptable_définitive",
        "Ventilation__en_fonction_de_la_résidence_et_par_catégorie_de_contrepartie__des_opérations_de_trésorerie_et_des_créances_sur_les_établissements_de_crédit_et_assimilés",
        "Ventilation__en_fonction_de_la_résidence_et_par_catégorie_de_contrepartie__des_opérations_de_trésorerie_et_des_dettes_envers_les_établissements_de_crédit_et_assimilés",
        "Ventilation__en_fonction_de_la_résidence_et_par_catégorie_de_contrepartie__des_créances_sur_la_clientèle_financière",
        "Ventilation__en_fonction_de_la_résidence_et_par_catégorie_de_contrepartie__des_dettes_envers_la_clientèle_financière",
        "Ventilation__en_fonction_de_la_résidence_et_par_catégorie_d_agent_économique__des_créances_sur_la_clientèle_non_financière",
        "Ventilation__en_fonction_de_la_résidence_et_par_catégorie_d_agent_économique__des_dettes_envers_la_clientèle_non_financière",
        "Ventilation__par_sections_et_sous_sections_d_activité__des_créances_sur_la_clientèle",
        "Ventilation__en_fonction_du_support__des_valeurs_reçues_ou_données_en_pension",
        "Ventilation__en_fonction_de_la_résidence_de_l_émetteur_et_par_catégorie_de_contrepartie__des_titres_en_portefeuille",
        "Ventilation_des_éléments_d_actif___de_passif_et_d_hors_bilan_concernant_les_apparentés",
        "Ventilation___en_fonction_de_la_durée_initiale__des_emplois_et_des_ressources",
        "Ventilation___en_fonction_de_la_durée_résiduelle__des_emplois__des_ressources_et_des_engagements_de_hors_bilan",
        "Détails_des_autres_actifs_et_passifs",
        "Ventilation__en_fonction_de_leur_terme__des_dettes_en_devises_envers_les_banques_étrangères_et_organismes_assimilés",
        "Ventilation_des_titres_par_émetteur",
        "Ventilation__par_catégorie_de_contrepartie__des_opérations_de_trésorerie_et_des_créances_sur_les_établissements_de_crédit_assimilés",
        "Ventilation__par_catégorie_de_contrepartie__des_opérations_de_trésorerie_et_des_dettes_envers_les_établissements_de_crédit_assimilés",
        "Ventilation__par_catégorie_de_détenteurs_et_par_durée_initiale_des_titres_de_dettes",
        "Ventilation__par_catégorie_d_agent_économique_des_autres_actifs_et_passifs",
        "Ventilation__par_agent_économique__de_l_actif_net_des_OPCVM",
        "Ventilation__par_agent_économique__de_l_actif_net_des_OPCVM_autres_que_monétaires",
        "Ventilation__en_fonction_de_la_durée_résiduelle__de_l_endettement_des_banques_en_devises",
        "Ventilation_par_guichet_des_dépôts_et_crédits_par_décaissement",
        "Etat_d_exposition_sur_les_contreparties_étrangères",
        "Annexes_aux_états_de_synthèse",
        "Comptes_consolidés",
        "Etats_de_synthèse",
        "Notes_aux_états_financiers",
        "Rapport_de_gestion",
        "Tableau_de_financement"
      ];
    } else if (category.includes('II___Etats_de_synthèse')) {
      return [
        "Bilan",
        "Compte_de_produits_et_charges",
        "Etat_des_soldes_de_gestion",
        "Tableau_des_flux_de_trésorerie",
        "Compte_de_produits_et_charges_détaillé",
        "Immobilisations_incorporelles_et_corporelles",
        "Cession_des_immobilisations_incorporelles_et_corporelles",
        "Détail_des_titres_de_placement__titres_de_propriété",
        "Détail_des_titres_de_participation_et_emplois_assimilés",
        "Cession_des_titres_de_placement__des_titres_d_investissement__des_titres_de_participation_et_emplois_assimilés",
        "Valeur_du_portefeuille_titres_suivant_différentes_méthodes_d_évaluation_de_ces_titres",
        "Détail_des_provisions",
        "Répartition_du_capital_social",
        "Répartition__par_classe__nationalité__sexe_et_âge__du_personnel",
        "Composition_du_conseil_de_surveillance",
        "Liste_des_membres_et_des_agents_de_direction",
        "Liste_des_membres_du_directoire",
        "Liste_des_apparentés",
        "Evolution_des_valeurs_mobilières_conservées_pour_le_compte_de_la_clientèle_par_catégories_d_agents_économiques_et_d_instruments_financiers",
        "Ventilation_des_valeurs_mobilières_conservées_pour_le_compte_de_la_clientèle",
        "Ventilation_de_l_encours_des_dépôts_dirhams_éligibles_par_nombre__catégorie_de_déposants_et_par_tranche_de_montant",
        "Ventilation_de_l_encours_des_dépôts_devises_éligibles_par_nombre__catégorie_de_déposants_et_par_tranche_de_montant",
        "Ventilation_par_montant_de_l_encours_des_dépôts_éligibles_et_non_éligibles",
        "Bilan_et_hors_bilan",
        "Compte_de_résultat",
        "Déclarations_fiscales",
        "Etat_de_variation_des_capitaux_propres",
        "Etats_annexes",
        "Etats_de_rapprochement",
        "Notes_explicatives",
        "Rapport_d_audit",
        "Tableau_de_financement"
      ];
    } else if (category.includes('III___Etats_relatifs')) {
      return [
        "Reporting_réglementaire_IRRBB",
        "Etat_LCR",
        "Etat_de_calcul_du_ratio_de_levier_sur_base_individuelle",
        "Risques_encourus_sur_un_même_bénéficiaire_égaux_ou_supérieurs_à_5__des_fonds_propres__déclarés_sur_base_individuelle",
        "Détail_des_risques_sur_les_clients_individuels_au_sein_des_groupes__base_individuelle",
        "Calcul_des_seuils_de_5___et_20___des_fonds_propres",
        "Statistiques_sur_le_nombre_des_DS_transmises_à_l_UTRF_par_ligne_de_métiers_et_typologie_d_infraction_sous-jacente_sur_la_période_2018-2019",
        "Risque_inhérent__Banque_de_l_entreprise_et_de_financement",
        "Reporting_COREP_individuel_et_Etats_des_fonds_propres",
        "Reporting_sur_le_risque_du_marché",
        "Stress_tests_au_titre_du_risque_de_liquidité",
        "Stress_tests_au_titre_du_risque_de_crédit",
        "Stress_tests_au_titre_du_risque_de_concentration",
        "Stress_tests_au_titre_du_risque_de_marché",
        "Stress_tests_au_titre_du_risque_pays",
        "Choc_sur_le_marché_immobilier",
        "Déterioration_des_conditions_macroéconomiques",
        "Reporting_sur_les_reports_d_échéances_des_crédits__Global__Zoom_Tourisme_et_Moratoires_2022",
        "Expositions_par_segment__TPE__PME__ETI__GE",
        "Adéquation_des_fonds_propres",
        "Concentration_des_risques",
        "Effet_de_levier",
        "Fonds_propres_réglementaires",
        "Liquidité_à_court_terme__LCR",
        "Provisions_réglementaires",
        "Ratios_prudentiels",
        "Risque_de_crédit",
        "Risque_de_liquidité",
        "Risque_de_marché",
        "Risque_opérationnel"
      ];
    }
    return [];
  }

  /**
   * Update file structure with any real files found in the folders
   */
  updateFileStructureWithRealFiles() {
    // This method is now handled by scanRealFileSystem
    console.log('File structure updated with real files');

    // Log the current state
    const stats = this.getFileStatistics();
    console.log(`Current structure: ${stats.totalCategories} categories, ${stats.totalReports} reports, ${stats.totalFiles} files`);
  }

  /**
   * Download all files for a specific report and month
   */
  downloadReportMonth(category, report, year, month) {
    const files = this.getFilesForReportMonth(category, report, year, month);

    if (files.length === 0) {
      alert('No files found for this month.');
      return;
    }

    console.log(`📦 Bulk download requested: ${files.length} files from ${report} - ${month}/${year}`);

    // Download each file with a small delay to avoid overwhelming the browser
    files.forEach((file, index) => {
      setTimeout(() => {
        const filePath = `${this.baseUploadPath}/${category}/${report}/${year}/${month}/${file}`;
        downloadFile(filePath);
      }, index * 500); // 500ms delay between downloads
    });

    // Show bulk download notification
    showBulkDownloadNotification(files.length, report, month, year);
  }

  /**
   * Download all files for a specific report (all months)
   */
  downloadEntireReport(category, report) {
    const years = this.getYearsForReport(category, report);
    let totalFiles = 0;
    const downloadQueue = [];

    // Collect all files from all years and months
    years.forEach(year => {
      const months = this.getMonthsForReportYear(category, report, year);
      months.forEach(month => {
        const files = this.getFilesForReportMonth(category, report, year, month);
        files.forEach(file => {
          const filePath = `${this.baseUploadPath}/${category}/${report}/${year}/${month}/${file}`;
          downloadQueue.push(filePath);
          totalFiles++;
        });
      });
    });

    if (totalFiles === 0) {
      alert('No files found for this report.');
      return;
    }

    console.log(`📦 Bulk download requested: ${totalFiles} files from ${report}`);

    // Confirm bulk download
    const confirmed = confirm(`Download all ${totalFiles} files from "${report.replace(/_/g, ' ')}"?\n\nThis will download files from all available months.`);

    if (confirmed) {
      // Download each file with a delay
      downloadQueue.forEach((filePath, index) => {
        setTimeout(() => {
          downloadFile(filePath);
        }, index * 300); // 300ms delay between downloads
      });

      showBulkDownloadNotification(totalFiles, report, 'all months', 'all years');
    }
  }

  /**
   * Get files for a specific report and month
   */
  getFilesForReportMonth(category, report, year, month) {
    if (this.fileStructure[category] &&
        this.fileStructure[category][report] &&
        this.fileStructure[category][report][year] &&
        this.fileStructure[category][report][year][month]) {
      return this.fileStructure[category][report][year][month];
    }
    return [];
  }

  /**
   * Get available years for a report
   */
  getYearsForReport(category, report) {
    if (this.fileStructure[category] && this.fileStructure[category][report]) {
      return Object.keys(this.fileStructure[category][report]);
    }
    return [];
  }

  /**
   * Get available months for a report and year
   */
  getMonthsForReportYear(category, report, year) {
    if (this.fileStructure[category] &&
        this.fileStructure[category][report] &&
        this.fileStructure[category][report][year]) {
      return Object.keys(this.fileStructure[category][report][year]);
    }
    return [];
  }
}

// Global file manager instance - will be initialized by the main dashboard
// window.fileManager = new FileManager();

// Note: File manager initialization is now handled by the main dashboard
// to ensure proper loading order with ALL_REPORTINGS.json

// Enhanced helper functions for the file browser
function toggleCategory(categoryId) {
  const element = document.getElementById(`category-${categoryId}`);
  const header = element ? element.previousElementSibling : null;
  const icon = header ? header.querySelector('.toggle-icon') : null;

  if (element) {
    const isVisible = element.style.display !== 'none';
    element.style.display = isVisible ? 'none' : 'block';
    if (icon) {
      icon.textContent = isVisible ? '▶' : '▼';
    }
  }
}

function toggleReport(categoryId, reportId) {
  const element = document.getElementById(`report-${categoryId}-${reportId}`);
  const header = element ? element.previousElementSibling : null;
  const icon = header ? header.querySelector('.toggle-icon') : null;

  if (element) {
    const isVisible = element.style.display !== 'none';
    element.style.display = isVisible ? 'none' : 'block';
    if (icon) {
      icon.textContent = isVisible ? '▶' : '▼';
    }
  }
}

function downloadFile(filePath) {
  // Enhanced download functionality for real files
  console.log('🔽 Download requested for:', filePath);

  if (filePath.includes('README.txt')) {
    alert('README files contain folder information and instructions. They are not meant to be downloaded as reporting data.');
    return;
  }

  try {
    // Extract file name from path
    const fileName = filePath.split('/').pop();

    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    link.style.display = 'none';

    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ Download initiated for:', fileName);

    // Show success message
    showDownloadNotification(fileName, 'success');

  } catch (error) {
    console.error('❌ Download failed:', error);

    // Fallback: try to open file in new tab
    try {
      window.open(filePath, '_blank');
      showDownloadNotification(filePath.split('/').pop(), 'opened');
    } catch (fallbackError) {
      console.error('❌ Fallback failed:', fallbackError);
      showDownloadNotification(filePath.split('/').pop(), 'error');
    }
  }
}

function showDownloadNotification(fileName, status) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
  `;

  // Set message and color based on status
  switch (status) {
    case 'success':
      notification.style.backgroundColor = '#28a745';
      notification.innerHTML = `
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 10px;">📥</span>
          <div>
            <div>Download Started</div>
            <div style="font-size: 12px; opacity: 0.9;">${fileName}</div>
          </div>
        </div>
      `;
      break;
    case 'opened':
      notification.style.backgroundColor = '#17a2b8';
      notification.innerHTML = `
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 10px;">🔗</span>
          <div>
            <div>File Opened in New Tab</div>
            <div style="font-size: 12px; opacity: 0.9;">${fileName}</div>
          </div>
        </div>
      `;
      break;
    case 'error':
      notification.style.backgroundColor = '#dc3545';
      notification.innerHTML = `
        <div style="display: flex; align-items: center;">
          <span style="margin-right: 10px;">❌</span>
          <div>
            <div>Download Failed</div>
            <div style="font-size: 12px; opacity: 0.9;">${fileName}</div>
          </div>
        </div>
      `;
      break;
  }

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Add to page
  document.body.appendChild(notification);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

function showBulkDownloadNotification(fileCount, reportName, month, year) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 20px;
    border-radius: 8px;
    background-color: #6f42c1;
    color: white;
    font-weight: bold;
    z-index: 10000;
    max-width: 450px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
  `;

  const displayName = reportName.replace(/_/g, ' ');
  const timeInfo = month === 'all months' ? 'All Months' : `${month}/${year}`;

  notification.innerHTML = `
    <div style="display: flex; align-items: center;">
      <span style="margin-right: 15px; font-size: 24px;">📦</span>
      <div>
        <div style="font-size: 16px;">Bulk Download Started</div>
        <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">${fileCount} files from ${displayName}</div>
        <div style="font-size: 12px; opacity: 0.8; margin-top: 3px;">${timeInfo}</div>
        <div style="font-size: 11px; opacity: 0.7; margin-top: 8px;">
          Downloads will start automatically with delays to prevent browser overload
        </div>
      </div>
    </div>
  `;

  // Add to page
  document.body.appendChild(notification);

  // Auto-remove after 6 seconds (longer for bulk downloads)
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 6000);
}

// Bulk download helper functions
function downloadReportMonth(category, report, year, month) {
  if (window.fileManager) {
    window.fileManager.downloadReportMonth(category, report, year, month);
  }
}

function downloadEntireReport(category, report) {
  if (window.fileManager) {
    window.fileManager.downloadEntireReport(category, report);
  }
}

function viewFileInfo(filePath) {
  // Enhanced file info display
  const pathParts = filePath.split('/');
  const fileName = pathParts[pathParts.length - 1];
  const month = pathParts[pathParts.length - 2];
  const year = pathParts[pathParts.length - 3];
  const reportName = pathParts[pathParts.length - 4];
  const categoryName = pathParts[pathParts.length - 5];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthName = monthNames[parseInt(month) - 1] || month;
  const isReadme = fileName.toLowerCase().includes('readme');

  let info = `📄 File Information\n\n`;
  info += `File: ${fileName}\n`;
  info += `Category: ${categoryName.replace(/_/g, ' ')}\n`;
  info += `Report: ${reportName.replace(/_/g, ' ')}\n`;
  info += `Year: ${year}\n`;
  info += `Month: ${monthName} (${month})\n`;
  info += `Path: ${filePath}\n\n`;

  if (isReadme) {
    info += `Type: README file\n`;
    info += `Purpose: Contains folder information and upload instructions\n`;
    info += `Content: Instructions for uploading ${reportName.replace(/_/g, ' ')} files for ${monthName} ${year}`;
  } else {
    info += `Type: Reporting data file\n`;
    info += `Purpose: Contains actual reporting data\n`;
    info += `Status: Ready for download and processing`;
  }

  alert(info);
}

console.log('✅ file-manager.js loaded successfully');

// Test if FileManager class is properly defined
try {
  console.log('🔍 Testing FileManager class definition...');
  console.log('typeof FileManager:', typeof FileManager);
  console.log('FileManager.prototype:', FileManager.prototype);
  console.log('✅ FileManager class is properly defined');
} catch (error) {
  console.error('❌ Error with FileManager class definition:', error);
}
