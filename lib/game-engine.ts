import { createClient } from "@supabase/supabase-js"
import { getAllUpgrades } from "./upgrades"
import { SPECIAL_ITEMS, canPurchaseSpecialItem } from "./upgrades-specials"
import { GAME_CONFIG } from "./config/game-config"
import { SPECIAL_ITEM_IDS, SPECIAL_ITEM_EFFECTS } from "./constants/special-items"
import { 
  calculateUpgradeCost,
  calculateUpgradePPSGain, 
  calculateUpgradeClickMultiplier,
  calculateSpecialItemCost,
  calculateSpecialItemMultiplier,
  calculatePrestigeMultiplier,
  calculateClickGain,
  validateProgressionIncrease,
  calculateReasonableMaxIncrease,
  validateUpgradePurchase
} from "./game-progression"

// Admin client for secure database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface GameState {
  totalClicks: number
  totalPower: number
  currentPower: number
  clickPower: number
  pps: number
  upgrades: Record<number, number>
  specialItems: Record<number, number>
  unlockedAchievements: number[]
  lastSaveTime: number
  prestigeLevel: number
  resourcesPerSecond: number
  currentResources: number
  comboCount: number
  comboActive: boolean
  lastClickTime: number
  timeBoostActive: boolean
  timeBoostEndTime: number
  timeBoostMultiplier: number
}

interface ClickResult {
  gained: number
  newState: GameState
  effects: {
    isSpecialClick: boolean
    comboActive: boolean
    timeBoostActivated: boolean
  }
}

interface PurchaseResult {
  success: boolean
  purchased: number
  newState?: GameState
  cost?: number
  error?: string
  reason?: string
}

export class GameEngine {
  
  /**
   * Load user game state from new database structure
   */
  static async loadUserGameState(userId: string): Promise<GameState> {
    try {
      // Load main progression data
      const { data: progression, error: progError } = await supabaseAdmin
        .from("game_progression")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle()

      if (progError && progError.code !== 'PGRST116') {
        throw new Error(`Failed to load progression: ${progError.message}`)
      }

      // Load upgrades
      const { data: upgrades, error: upgradesError } = await supabaseAdmin
        .from("user_upgrades")
        .select("upgrade_id, quantity")
        .eq("user_id", userId)

      if (upgradesError) {
        throw new Error(`Failed to load upgrades: ${upgradesError.message}`)
      }

      // Load special items
      const { data: specialItems, error: specialError } = await supabaseAdmin
        .from("user_special_items")
        .select("special_item_id, quantity")
        .eq("user_id", userId)

      if (specialError) {
        throw new Error(`Failed to load special items: ${specialError.message}`)
      }

      // Load achievements
      const { data: achievements, error: achError } = await supabaseAdmin
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", userId)

      if (achError) {
        throw new Error(`Failed to load achievements: ${achError.message}`)
      }

      if (!progression) {
        // Return default state for new user
        return {
          totalClicks: 0,
          totalPower: 0,
          currentPower: 0,
          clickPower: 1,
          pps: 0,
          upgrades: {},
          specialItems: {},
          unlockedAchievements: [],
          lastSaveTime: Date.now(),
          prestigeLevel: 0,
          resourcesPerSecond: 0,
          currentResources: 0,
          comboCount: 0,
          comboActive: false,
          lastClickTime: 0,
          timeBoostActive: false,
          timeBoostEndTime: 0,
          timeBoostMultiplier: 1
        }
      }

      // Convert arrays to objects
      const upgradesObj: Record<number, number> = {}
      upgrades?.forEach(u => {
        upgradesObj[u.upgrade_id] = u.quantity
      })

      const specialItemsObj: Record<number, number> = {}
      specialItems?.forEach(si => {
        specialItemsObj[si.special_item_id] = si.quantity
      })

      const achievementIds = achievements?.map(a => a.achievement_id) || []

      // Reconstruct game state from new database structure
      return {
        totalClicks: Number(progression.total_clicks) || 0,
        totalPower: Number(progression.total_power) || 0,
        currentPower: Number(progression.current_power) || 0,
        clickPower: Number(progression.click_power) || 1,
        pps: Number(progression.power_per_second) || 0,
        upgrades: upgradesObj,
        specialItems: specialItemsObj,
        unlockedAchievements: achievementIds,
        lastSaveTime: progression.last_save_time ? new Date(progression.last_save_time).getTime() : Date.now(),
        prestigeLevel: progression.prestige_level || 0,
        resourcesPerSecond: Number(progression.power_per_second) || 0,
        currentResources: Number(progression.current_power) || 0,
        comboCount: progression.combo_count || 0,
        comboActive: progression.combo_active || false,
        lastClickTime: progression.last_click_time ? new Date(progression.last_click_time).getTime() : Date.now(),
        timeBoostActive: false,
        timeBoostEndTime: 0,
        timeBoostMultiplier: 1
      }
    } catch (error) {
      console.error('Error loading game state:', error)
      throw error
    }
  }

  /**
   * Ensure user profile exists
   */
  static async ensureUserProfile(userId: string): Promise<void> {
    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabaseAdmin
        .from("user_profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Failed to check profile: ${checkError.message}`)
      }

      if (!existingProfile) {
        // Create new profile
        const { error: createError } = await supabaseAdmin
          .from("user_profiles")
          .insert({
            id: userId,
            username: `user_${userId.substring(0, 8)}`,
            display_name: `Player ${userId.substring(0, 8)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_active: new Date().toISOString(),
            prestige_level: 0,
            achievements_count: 0,
            total_playtime_seconds: 0
          })

        if (createError) {
          throw new Error(`Failed to create profile: ${createError.message}`)
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error)
      throw error
    }
  }

  /**
   * Save user game state to new database structure
   */
  static async saveUserGameState(userId: string, gameState: GameState): Promise<void> {
    try {
      // Ensure user profile exists first
      await this.ensureUserProfile(userId)

      // 1. Save main progression
      const { error: progError } = await supabaseAdmin
        .from("game_progression")
        .upsert({
          user_id: userId,
          total_clicks: gameState.totalClicks,
          total_power: gameState.totalPower,
          current_power: gameState.currentPower,
          power_per_second: gameState.pps,
          click_power: gameState.clickPower,
          prestige_level: Math.min(gameState.prestigeLevel, 50),
          combo_count: gameState.comboCount,
          combo_active: gameState.comboActive,
          last_click_time: new Date(gameState.lastClickTime).toISOString(),
          last_save_time: new Date(gameState.lastSaveTime).toISOString(),
          updated_at: new Date().toISOString()
        })

      if (progError) {
        throw new Error(`Failed to save progression: ${progError.message}`)
      }

        // 2. Save upgrades (only non-zero quantities)
        const upgradeData = Object.entries(gameState.upgrades)
          .filter(([_, quantity]) => quantity > 0)
          .map(([upgradeId, quantity]) => ({
            user_id: userId,
            upgrade_id: parseInt(upgradeId),
            quantity: quantity,
            last_purchased_at: new Date().toISOString()
          }))

        if (upgradeData.length > 0) {
          const { error: upgradeError } = await supabaseAdmin
            .from("user_upgrades")
            .upsert(upgradeData, {
              onConflict: 'user_id,upgrade_id'
            })

          if (upgradeError) {
            throw new Error(`Failed to save upgrades: ${upgradeError.message}`)
          }
        }

        // 3. Save special items (only non-zero quantities)
        const specialItemData = Object.entries(gameState.specialItems)
          .filter(([_, quantity]) => quantity > 0)
          .map(([specialItemId, quantity]) => ({
            user_id: userId,
            special_item_id: parseInt(specialItemId),
            quantity: quantity,
            last_purchased_at: new Date().toISOString()
          }))

        if (specialItemData.length > 0) {
          const { error: specialError } = await supabaseAdmin
            .from("user_special_items")
            .upsert(specialItemData, {
              onConflict: 'user_id,special_item_id'
            })

          if (specialError) {
            throw new Error(`Failed to save special items: ${specialError.message}`)
          }
        }

        // 4. Save achievements (insert only new ones)
        const existingAchievements = await supabaseAdmin
          .from("user_achievements")
          .select("achievement_id")
          .eq("user_id", userId)

        const existingIds = new Set(existingAchievements.data?.map(a => a.achievement_id) || [])
        const newAchievements = gameState.unlockedAchievements
          .filter(id => !existingIds.has(id))
          .map(achievementId => ({
            user_id: userId,
            achievement_id: achievementId,
            unlocked_at: new Date().toISOString()
          }))

        if (newAchievements.length > 0) {
          const { error: achError } = await supabaseAdmin
            .from("user_achievements")
            .insert(newAchievements)

          if (achError) {
            throw new Error(`Failed to save achievements: ${achError.message}`)
          }
        }

        // 5. Update leaderboard entry (simplified version without RPC)
        try {
          await supabaseAdmin
            .from("leaderboard_entries")
            .upsert({
              user_id: userId,
              total_power: gameState.totalPower,
              total_clicks: gameState.totalClicks,
              prestige_level: gameState.prestigeLevel,
              achievements_count: gameState.unlockedAchievements.length,
              playtime_seconds: 0, // Will be calculated later
              last_updated: new Date().toISOString(),
              season: 'global'
            }, {
              onConflict: 'user_id,season'
            })
        } catch (leaderboardError) {
          console.warn('Failed to update leaderboard:', leaderboardError)
          // Don't throw error for leaderboard update failure
        }

    } catch (error) {
      console.error('Error saving game state:', error)
      throw error
    }
  }

  /**
   * Calculate total stats from upgrades and special items
   */
  static calculateStats(gameState: GameState): { totalPps: number, totalClickMultiplier: number } {
    let totalPps = 0
    let totalClickMultiplier = 1
    let globalMultiplier = 1

    const upgrades = getAllUpgrades()

         // Calculate upgrade contributions using centralized formulas
     upgrades.forEach(upgrade => {
       const level = gameState.upgrades[upgrade.id] || 0
       if (level > 0) {
         const upgradePps = calculateUpgradePPSGain(upgrade.ppsGain, gameState.prestigeLevel) * level
         const upgradeClick = calculateUpgradeClickMultiplier(upgrade.clickMultiplier, gameState.prestigeLevel) * level
         
         totalPps += upgradePps
         totalClickMultiplier += upgradeClick
       }
     })

     // Calculate special item effects using centralized formulas
     SPECIAL_ITEMS.forEach(specialItem => {
       const level = gameState.specialItems[specialItem.id] || 0
       if (level > 0) {
         switch (specialItem.effect) {
           case SPECIAL_ITEM_EFFECTS.GLOBAL_1_5X:
           case SPECIAL_ITEM_EFFECTS.GLOBAL_2X:
           case SPECIAL_ITEM_EFFECTS.GLOBAL_3X:
           case SPECIAL_ITEM_EFFECTS.GLOBAL_5X:
           case SPECIAL_ITEM_EFFECTS.GLOBAL_10X:
           case SPECIAL_ITEM_EFFECTS.CAFFEINE_BOOST:
             const itemMultiplier = calculateSpecialItemMultiplier(
               specialItem.baseMultiplier || 1.5, 
               gameState.prestigeLevel, 
               gameState.totalPower
             )
             globalMultiplier *= Math.pow(itemMultiplier, level)
             break
         }
       }
     })

     // Apply prestige multiplier using centralized formula
     const prestigeMultiplier = calculatePrestigeMultiplier(gameState.prestigeLevel)

    return {
      totalPps: totalPps * globalMultiplier * prestigeMultiplier,
      totalClickMultiplier: totalClickMultiplier * globalMultiplier * prestigeMultiplier
    }
  }

  /**
   * Process a click action with server-side validation
   */
  static async processClick(userId: string): Promise<ClickResult> {
    const gameState = await this.loadUserGameState(userId)
    const currentTime = Date.now()

    // Recalculate stats to ensure consistency
    const { totalClickMultiplier } = this.calculateStats(gameState)
    gameState.clickPower = totalClickMultiplier

    let gained = gameState.clickPower
    let isSpecialClick = false
    let comboActive = false
    let timeBoostActivated = false

    // Special click effects
    const goldenClickLevel = gameState.specialItems[SPECIAL_ITEM_IDS.GOLDEN_CLICK] || 0
    if (goldenClickLevel > 0) {
      const chance = GAME_CONFIG.SPECIAL_ABILITIES.GOLDEN_CLICK_CHANCE * goldenClickLevel
      if (Math.random() < chance) {
        isSpecialClick = true
        gained *= GAME_CONFIG.SPECIAL_ABILITIES.GOLDEN_CLICK_MULTIPLIER
      }
    }

    // Combo system
    const hasComboSystem = (gameState.specialItems[SPECIAL_ITEM_IDS.COMBO_MASTER] || 0) > 0
    if (hasComboSystem) {
      const timeSinceLastClick = currentTime - gameState.lastClickTime
      if (timeSinceLastClick < GAME_CONFIG.INTERVALS.COMBO_TIMEOUT) {
        gameState.comboCount = Math.min(gameState.comboCount + 1, GAME_CONFIG.LIMITS.MAX_COMBO)
      } else {
        gameState.comboCount = 1
      }
      
      if (gameState.comboCount > 1) {
        comboActive = true
        const comboMultiplier = Math.min(
          1 + (gameState.comboCount - 1) * GAME_CONFIG.SPECIAL_ABILITIES.COMBO.MULTIPLIER_INCREMENT,
          GAME_CONFIG.SPECIAL_ABILITIES.COMBO.MAX_MULTIPLIER
        )
        gained *= comboMultiplier
      }
    }

    // Apply time boost if active
    if (gameState.timeBoostActive && currentTime < gameState.timeBoostEndTime) {
      gained *= gameState.timeBoostMultiplier
    }

    // Update game state
    gameState.totalClicks += 1
    gameState.currentPower = Math.floor(gameState.currentPower + gained)
    gameState.totalPower = Math.floor(gameState.totalPower + gained)
    gameState.currentResources = gameState.currentPower
    gameState.lastClickTime = currentTime
    gameState.lastSaveTime = currentTime
    gameState.comboActive = comboActive

    // Save updated state
    await this.saveUserGameState(userId, gameState)

    return {
      gained: Math.floor(gained),
      newState: gameState,
      effects: {
        isSpecialClick,
        comboActive,
        timeBoostActivated
      }
    }
  }

     /**
    * Process upgrade purchase with strict validation
    */
   static async purchaseUpgrade(userId: string, upgradeId: number, quantity: number = 1): Promise<PurchaseResult> {
     const gameState = await this.loadUserGameState(userId)
     
     const upgrade = getAllUpgrades().find(u => u.id === upgradeId)
     if (!upgrade) {
       return { success: false, purchased: 0, error: "Invalid upgrade ID" }
     }

     const currentLevel = gameState.upgrades[upgradeId] || 0
     let totalCost = 0
     let actualQuantity = 0

     // Calculate total cost using centralized formula
     for (let i = 0; i < quantity; i++) {
       const cost = calculateUpgradeCost(
         upgrade.baseCost, 
         upgrade.costGrowth, 
         currentLevel + i, 
         gameState.prestigeLevel
       )
       if (gameState.currentPower >= totalCost + cost) {
         totalCost += cost
         actualQuantity++
       } else {
         break
       }
     }

     // Validate purchase using centralized validation
     const validationResult = validateUpgradePurchase(
       upgradeId,
       actualQuantity,
       gameState.currentPower,
       currentLevel,
       totalCost
     )

     if (!validationResult.isValid) {
       return { 
         success: false, 
         purchased: 0, 
         error: "Purchase validation failed",
         reason: validationResult.reason
       }
     }

     if (actualQuantity === 0) {
       const nextCost = calculateUpgradeCost(
         upgrade.baseCost, 
         upgrade.costGrowth, 
         currentLevel, 
         gameState.prestigeLevel
       )
       return { 
         success: false, 
         purchased: 0, 
         error: "Insufficient funds",
         reason: `Need ${nextCost} but have ${gameState.currentPower}`
       }
     }

     // Apply purchase
     gameState.currentPower -= totalCost
     gameState.currentResources = gameState.currentPower
     gameState.upgrades[upgradeId] = currentLevel + actualQuantity
     gameState.lastSaveTime = Date.now()

     // Recalculate stats using centralized system
     const { totalPps, totalClickMultiplier } = this.calculateStats(gameState)
     gameState.pps = totalPps
     gameState.clickPower = totalClickMultiplier
     gameState.resourcesPerSecond = totalPps

     // Save updated state
     await this.saveUserGameState(userId, gameState)

     return {
       success: true,
       purchased: actualQuantity,
       newState: gameState,
       cost: totalCost
     }
   }

     /**
    * Process special item purchase with strict validation
    */
   static async purchaseSpecialItem(userId: string, specialItemId: number): Promise<PurchaseResult> {
     const gameState = await this.loadUserGameState(userId)
     
     const specialItem = SPECIAL_ITEMS.find(item => item.id === specialItemId)
     if (!specialItem) {
       return { success: false, purchased: 0, error: "Invalid special item ID" }
     }

     const currentLevel = gameState.specialItems[specialItemId] || 0
     
     // Calculate cost using centralized formula
     const cost = calculateSpecialItemCost(
       specialItem.baseCost,
       currentLevel,
       specialItem.costGrowth || 2.5,
       gameState.prestigeLevel
     )

     // Validate purchase requirements
     if (!canPurchaseSpecialItem(
       specialItem, 
       currentLevel, 
       gameState.currentPower, 
       gameState.totalPower, 
       gameState.prestigeLevel, 
       gameState.upgrades
     )) {
       return { 
         success: false, 
         purchased: 0, 
         error: "Purchase requirements not met",
         reason: "Check power and upgrade requirements"
       }
     }

     if (gameState.currentPower < cost) {
       return { 
         success: false, 
         purchased: 0, 
         error: "Insufficient funds",
         reason: `Need ${cost} but have ${gameState.currentPower}`
       }
     }

     // Apply purchase
     gameState.currentPower -= cost
     gameState.currentResources = gameState.currentPower
     gameState.specialItems[specialItemId] = currentLevel + 1
     gameState.lastSaveTime = Date.now()

     // Recalculate stats using centralized system
     const { totalPps, totalClickMultiplier } = this.calculateStats(gameState)
     gameState.pps = totalPps
     gameState.clickPower = totalClickMultiplier
     gameState.resourcesPerSecond = totalPps

     // Save updated state
     await this.saveUserGameState(userId, gameState)

     return {
       success: true,
       purchased: 1,
       newState: gameState,
       cost
     }
   }
}