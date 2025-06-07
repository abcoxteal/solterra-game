const Solterra = {
    version: '1.0.0',

    // Core configuration
    config: {
        regions: ['Valoria', 'Koro', 'Midmarah', 'Ossara', 'Taaltez'],
        socialClasses: {
            nobility: ['Grand', 'Principal', 'Minor'],
            commoners: ['Qadir', 'Bara', 'Rafi', 'Farid']
        },
        factions: ['Echo Traders', 'Cartographers', 'Nullbound Coalition', 'Shadow Syndicate', 'Forgotten Settlements'],
        cortiumTypes: ['VIGOR', 'LUMEN', 'ZEPHYR', 'SOVEREIGN']
    },

    // State Management System
    State: {
        currentChapter: 1,
        currentProtagonist: null,
        worldState: {
            regions: {},
            factions: {},
            eaiInfluence: 0,
            globalEvents: []
        },
        protagonists: {},
        delayedConsequences: [],

        initialize() {
            this.loadState();
            this.initializeRegions();
            this.initializeFactions();
        },

        initializeRegions() {
            Solterra.config.regions.forEach(region => {
                this.worldState.regions[region] = {
                    stability: 50,
                    eaiPresence: 30,
                    politicalControl: 'government',
                    events: []
                };
            });
        },

        initializeFactions() {
            Solterra.config.factions.forEach(faction => {
                this.worldState.factions[faction] = {
                    influence: 20,
                    activity: 'normal',
                    disposition: 'neutral',
                    events: []
                };
            });
        },

        saveState() {
            try {
                const stateData = {
                    currentChapter: this.currentChapter,
                    currentProtagonist: this.currentProtagonist,
                    worldState: this.worldState,
                    protagonists: this.protagonists,
                    delayedConsequences: this.delayedConsequences,
                    timestamp: Date.now()
                };
                
                // Note: In browser environment, use in-memory storage instead
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('solterra_game_state', JSON.stringify(stateData));
                } else {
                    // Store in memory for environments without localStorage
                    this._memoryState = stateData;
                }
                return true;
            } catch (error) {
                console.error('Failed to save state:', error);
                return false;
            }
        },

        loadState() {
            try {
                let saved = null;
                if (typeof localStorage !== 'undefined') {
                    saved = localStorage.getItem('solterra_game_state');
                } else if (this._memoryState) {
                    saved = JSON.stringify(this._memoryState);
                }
                
                if (saved) {
                    const stateData = JSON.parse(saved);
                    this.currentChapter = stateData.currentChapter || 1;
                    this.currentProtagonist = stateData.currentProtagonist || null;
                    this.worldState = stateData.worldState || { regions: {}, factions: {}, eaiInfluence: 0, globalEvents: [] };
                    this.protagonists = stateData.protagonists || {};
                    this.delayedConsequences = stateData.delayedConsequences || [];
                    return true;
                }
            } catch (error) {
                console.error('Failed to load state:', error);
            }
            return false;
        }
    },

    // Character System
    CharacterSystem: {
        createProtagonist(config) {
            const id = config.id || `protagonist_${Date.now()}`;
            const protagonist = {
                id: id,
                name: config.name || 'Unnamed',
                background: config.background || 'Unknown',
                socialClass: config.socialClass || 'Qadir',
                region: config.region || 'Valoria',
                traits: config.traits || [],
                stats: {
                    stress: 0,
                    knowledge: 0,
                    influence: 0
                },
                reputation: {},
                relationships: {},
                chapterHistory: {}
            };

            // Initialize regional reputation
            Solterra.config.regions.forEach(region => {
                protagonist.reputation[region] = 0;
            });

            // Initialize faction relationships
            Solterra.config.factions.forEach(faction => {
                protagonist.relationships[faction] = 0;
            });

            Solterra.State.protagonists[id] = protagonist;
            Solterra.State.saveState();
            
            return protagonist;
        },

        addTrait(protagonistId, trait) {
            const protagonist = Solterra.State.protagonists[protagonistId];
            if (protagonist && !protagonist.traits.includes(trait)) {
                protagonist.traits.push(trait);
                this.updateRelationships(protagonistId, `gained_trait_${trait}`);
            }
        },

        async updateRelationships(protagonistId, cause) {
            try {
                if (typeof Solterra.AISystem !== 'undefined' && Solterra.AISystem.generateConsequences) {
                    const protagonist = Solterra.State.protagonists[protagonistId];
                    const choice = { id: 'relationship_update', text: cause };
                    return await Solterra.AISystem.generateConsequences(choice, protagonist, Solterra.State.worldState);
                } else {
                    return this.getFallbackRelationshipUpdate(cause);
                }
            } catch (error) {
                console.error('Relationship update failed:', error);
                return this.getFallbackRelationshipUpdate(cause);
            }
        },

        getFallbackRelationshipUpdate(cause) {
            return {
                immediate: [{
                    type: 'relationship',
                    target: 'general',
                    value: 0,
                    description: `Relationship change due to: ${cause}`
                }],
                delayed: []
            };
        },

        switchProtagonist(protagonistId) {
            if (Solterra.State.protagonists[protagonistId]) {
                Solterra.State.currentProtagonist = protagonistId;
                Solterra.State.saveState();
                return true;
            }
            return false;
        },

        getProtagonistSummary(protagonistId) {
            const protagonist = Solterra.State.protagonists[protagonistId];
            if (!protagonist) return null;

            return {
                id: protagonist.id,
                background: protagonist.background,
                class: protagonist.socialClass,
                traits: protagonist.traits,
                totalReputation: Object.values(protagonist.reputation).reduce((sum, val) => sum + val, 0),
                totalRelationships: Object.values(protagonist.relationships).reduce((sum, val) => sum + val, 0)
            };
        }
    },

    // Choice System
    ChoiceSystem: {
        async processChoice(protagonistId, choiceConfig) {
            const protagonist = Solterra.State.protagonists[protagonistId];
            if (!protagonist) {
                console.error('Protagonist not found:', protagonistId);
                return this.getFallbackConsequences();
            }

            try {
                const consequences = await this.generateConsequences(choiceConfig, protagonist);

                // Apply immediate consequences
                if (consequences.immediate) {
                    consequences.immediate.forEach(consequence => {
                        this.applyConsequence(protagonist, consequence);
                    });
                }

                // Queue delayed consequences
                if (consequences.delayed) {
                    consequences.delayed.forEach(consequence => {
                        this.queueConsequence(consequence);
                    });
                }

                Solterra.State.saveState();
                return consequences;
            } catch (error) {
                console.error('Choice processing failed:', error);
                return this.getFallbackConsequences();
            }
        },

        async generateConsequences(choiceConfig, protagonist) {
            try {
                if (typeof Solterra.AISystem !== 'undefined' && Solterra.AISystem.generateConsequences) {
                    return await Solterra.AISystem.generateConsequences(
                        choiceConfig, 
                        protagonist, 
                        Solterra.State.worldState,
                        { region: 'Valoria' } // Default context for Chapter 1
                    );
                } else {
                    console.warn('AI System not available, using fallback');
                    return this.getFallbackConsequences();
                }
            } catch (error) {
                console.error('AI consequence generation failed:', error);
                return this.getFallbackConsequences();
            }
        },

        applyConsequence(protagonist, consequence) {
            switch (consequence.type) {
                case 'reputation':
                    if (protagonist.reputation[consequence.target] !== undefined) {
                        protagonist.reputation[consequence.target] += consequence.value;
                    }
                    break;
                case 'relationship':
                    if (protagonist.relationships[consequence.target] !== undefined) {
                        protagonist.relationships[consequence.target] += consequence.value;
                    }
                    break;
                case 'trait':
                    if (!protagonist.traits.includes(consequence.target)) {
                        protagonist.traits.push(consequence.target);
                    }
                    break;
                case 'stats':
                    if (protagonist.stats[consequence.target] !== undefined) {
                        protagonist.stats[consequence.target] += consequence.value;
                    }
                    break;
                case 'world_state':
                    if (consequence.target === 'eaiInfluence') {
                        Solterra.State.worldState.eaiInfluence += consequence.value;
                    }
                    break;
            }
        },

        queueConsequence(consequence) {
            Solterra.State.delayedConsequences.push({
                ...consequence,
                queuedAt: Date.now()
            });
        },

        processDelayedConsequences() {
            // Process consequences that should trigger now
            const now = Date.now();
            const toProcess = Solterra.State.delayedConsequences.filter(consequence => {
                return this.shouldTriggerConsequence(consequence, now);
            });

            toProcess.forEach(consequence => {
                console.log('Triggering delayed consequence:', consequence);
                // Process the consequence
            });

            // Remove processed consequences
            Solterra.State.delayedConsequences = Solterra.State.delayedConsequences.filter(
                consequence => !toProcess.includes(consequence)
            );
        },

        shouldTriggerConsequence(consequence, currentTime) {
            // Simple time-based triggering for now
            const timeSinceQueued = currentTime - consequence.queuedAt;
            return timeSinceQueued > (consequence.delay || 0);
        },

        getFallbackConsequences() {
            return {
                immediate: [{
                    type: 'story_flag',
                    target: 'general_progress',
                    value: 1,
                    description: 'Your choice is noted and remembered'
                }],
                delayed: [],
                narrative: 'Your decision has consequences that will unfold over time.'
            };
        }
    },

    // AI Integration System
    AISystem: {
        version: '1.0.0',
        
        // Configuration
        config: {
            API_KEY: null, // Set this from environment or config
            API_URL: 'https://api.anthropic.com/v1/messages',
            MAX_TOKENS: 1000,
            MODEL: 'claude-3-sonnet-20240229',
            TEMPERATURE: 0.7,
            TIMEOUT: 30000
        },

        // Performance tracking
        costTracker: {
            requests: 0,
            inputTokens: 0,
            outputTokens: 0
        },

        // Response caching for cost optimization
        responseCache: new Map(),

        // Initialize the AI system
        initialize(apiKey) {
            this.config.API_KEY = apiKey;
            this.logDebug('AISystem initialized');
        },

        // Build prompts for different content types
        buildPrompt(type, data) {
            const prompts = {
                consequences: this.buildConsequencesPrompt(data),
                dialogue: this.buildDialoguePrompt(data),
                character_voice: this.buildCharacterVoicePrompt(data),
                world_state: this.buildWorldStatePrompt(data),
                discovery: this.buildDiscoveryPrompt(data),
                relationship: this.buildRelationshipPrompt(data)
            };

            if (!prompts[type]) {
                throw new Error(`Unknown prompt type: ${type}`);
            }

            this.logDebug(`Built ${type} prompt`, { dataKeys: Object.keys(data) });
            return prompts[type];
        },

        // Build consequences prompt
        buildConsequencesPrompt(data) {
            const { choice, protagonist, worldState, context } = data;
            
            return `You are the narrative engine for Solterra, a magical dystopian world. Generate consequences for this player choice.

WORLD CONTEXT:
- Setting: ${context?.location || 'Unknown location'}
- Time: ${context?.timeOfDay || 'Unknown time'}
- Current Situation: ${context?.situation || 'General interaction'}

PROTAGONIST PROFILE:
- Background: ${protagonist?.background || 'Unknown'}
- Class: ${protagonist?.socialClass || 'Unknown'}
- Region: ${protagonist?.region || 'Unknown'}
- Current Reputation: ${JSON.stringify(protagonist?.reputation || {})}
- Traits: ${JSON.stringify(protagonist?.traits || {})}

WORLD STATE:
- EAI Influence: ${worldState?.eaiInfluence || 0}
- Regional Stability: ${JSON.stringify(worldState?.regions || {})}
- Active Factions: ${JSON.stringify(worldState?.factions || {})}

PLAYER CHOICE:
"${choice.text}"
Choice ID: ${choice.id}

Generate consequences in this EXACT JSON format:
{
  "immediate": [
    {
      "type": "reputation|relationship|knowledge|resource|story_flag",
      "target": "specific_target_name",
      "value": number_change,
      "description": "brief description of what happens"
    }
  ],
  "delayed": [
    {
      "type": "event|opportunity|threat",
      "trigger": "chapter_2|time_based|condition_met",
      "description": "what will happen later",
      "timeline": "when it happens"
    }
  ],
  "narrative": "A 2-3 sentence description of what immediately happens as a result of this choice, written in second person present tense."
}

Keep consequences realistic to the world's tone - magical dystopian with underground resistance themes.`;
        },

        // Build dialogue prompt
        buildDialoguePrompt(data) {
            const { npc, protagonist, context, mood } = data;
            
            return `Generate dialogue for an NPC in Solterra's magical dystopian world.

NPC PROFILE:
- Name: ${npc?.name || 'Unknown'}
- Role: ${npc?.role || 'Unknown'}
- Personality: ${npc?.personality || 'Neutral'}
- Relationship to PC: ${npc?.relationshipLevel || 'Neutral'}
- Faction: ${npc?.faction || 'None'}

PROTAGONIST CONTEXT:
- Background: ${protagonist?.background || 'Unknown'}
- Recent actions: ${protagonist?.recentChoices?.slice(-3) || 'None'}
- Reputation with this NPC: ${npc?.relationshipLevel || 'Neutral'}

SCENE CONTEXT:
- Location: ${context?.location || 'Unknown'}
- Situation: ${context?.situation || 'General conversation'}
- Mood/Tone: ${mood || 'Neutral'}
- Time Pressure: ${context?.urgent ? 'High' : 'Low'}

Generate natural dialogue that:
1. Fits the character's established personality
2. Reflects their relationship with the protagonist
3. Advances the story or provides useful information
4. Maintains Solterra's dystopian atmosphere
5. Includes subtext about underground resistance if appropriate

Format as natural speech with minimal formatting. 2-4 sentences maximum.`;
        },

        // Build character voice prompt
        buildCharacterVoicePrompt(data) {
            const { protagonist, situation, tone } = data;
            
            return `Generate internal monologue/thoughts for the protagonist in Solterra.

PROTAGONIST PROFILE:
- Background: ${protagonist?.background || 'Unknown'}
- Personality Traits: ${JSON.stringify(protagonist?.traits || {})}
- Current Stress Level: ${protagonist?.stats?.stress || 'Unknown'}
- Recent Experiences: ${protagonist?.recentEvents?.slice(-2) || 'None'}

CURRENT SITUATION:
- Context: ${situation || 'General moment'}
- Emotional State: ${tone || 'Neutral'}
- Decision Point: ${data.choice ? 'Considering: ' + data.choice : 'Reflecting'}

Generate 1-2 sentences of internal thought that:
1. Reflects the protagonist's established background and personality
2. Shows their reaction to the current situation
3. Maintains consistency with their previous thoughts/actions
4. Fits the magical dystopian world's tone

Write in first person, present tense. Keep it concise and authentic to character.`;
        },

        // Build world state prompt
        buildWorldStatePrompt(data) {
            const { region, event, scope } = data;
            
            return `Generate world state updates for Solterra based on recent events.

CURRENT WORLD STATE:
- EAI Influence: ${data.worldState?.eaiInfluence || 0}
- Active Regions: ${JSON.stringify(data.worldState?.regions || {})}
- Faction Status: ${JSON.stringify(data.worldState?.factions || {})}

TRIGGERING EVENT:
- Type: ${event?.type || 'Unknown'}
- Location: ${region || 'Unknown'}
- Scope: ${scope || 'Local'}
- Description: ${event?.description || 'Unspecified event'}

Generate realistic ripple effects in JSON format:
{
  "regionChanges": {
    "region_name": {
      "stability": change_amount,
      "eaiPresence": change_amount,
      "description": "what changed and why"
    }
  },
  "factionChanges": {
    "faction_name": {
      "influence": change_amount,
      "activity": "increased|decreased|shifted",
      "description": "how they responded"
    }
  },
  "globalEvents": [
    {
      "type": "news|rumor|policy",
      "description": "what happened",
      "regions_affected": ["list", "of", "regions"]
    }
  ]
}

Keep changes realistic and interconnected - actions in one region affect others.`;
        },

        // Build discovery prompt
        buildDiscoveryPrompt(data) {
            const { discoveryType, location, protagonist } = data;
            
            return `Generate discovery content for Solterra's EAI surveillance mystery.

DISCOVERY CONTEXT:
- Type: ${discoveryType || 'Unknown'}
- Location: ${location || 'Unknown'}
- Protagonist Background: ${protagonist?.background || 'Unknown'}
- Investigation Depth: ${data.depth || 'Surface'}

WORLD CONTEXT:
EAI (Enhanced Awareness Initiative) is a surveillance system that monitors all citizens. The protagonist is discovering its true scope and purpose.

Generate discovery content in JSON format:
{
  "information": {
    "technical_details": "what they learn about EAI's capabilities",
    "scope_revelation": "understanding of how widespread it is",
    "personal_impact": "how it affects them personally",
    "resistance_implications": "what this means for underground networks"
  },
  "evidence": [
    {
      "type": "document|recording|observation",
      "description": "what they found",
      "significance": "why it matters"
    }
  ],
  "immediate_risks": [
    "list of immediate dangers from this discovery"
  ],
  "narrative": "2-3 sentences describing the discovery moment in second person"
}

Make discoveries feel significant and build toward the larger EAI mystery.`;
        },

        // Build relationship prompt
        buildRelationshipPrompt(data) {
            const { npc, protagonist, interaction, currentRelationship } = data;
            
            return `Generate relationship changes for Solterra character interactions.

RELATIONSHIP CONTEXT:
- NPC: ${npc?.name || 'Unknown'} (${npc?.role || 'Unknown role'})
- Current Relationship: ${currentRelationship || 'Neutral'}
- Interaction Type: ${interaction?.type || 'Unknown'}
- Protagonist Background: ${protagonist?.background || 'Unknown'}

INTERACTION DETAILS:
- What happened: ${interaction?.description || 'Unspecified interaction'}
- Protagonist's approach: ${interaction?.approach || 'Unknown'}
- Context: ${interaction?.context || 'Unknown'}

Generate relationship update in JSON format:
{
  "relationship_change": {
    "previous_level": "${currentRelationship}",
    "new_level": "new_relationship_status",
    "trust_change": number_change,
    "respect_change": number_change,
    "influence_change": number_change
  },
  "unlocked_options": [
    "list of new interaction possibilities"
  ],
  "npc_perspective": "How the NPC now views the protagonist",
  "future_implications": "How this affects future interactions"
}

Relationship levels: Hostile, Suspicious, Neutral, Friendly, Trusted, Allied`;
        },

        // Make API calls to Claude
        async callClaudeAPI(prompt) {
            if (!this.config.API_KEY) {
                throw new Error('API key not configured');
            }

            // Check cache first
            const cacheKey = this.generateCacheKey(prompt);
            if (this.responseCache.has(cacheKey)) {
                this.logDebug('Using cached response');
                return this.responseCache.get(cacheKey);
            }

            try {
                this.costTracker.requests++;
                
                const response = await fetch(this.config.API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.config.API_KEY,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: this.config.MODEL,
                        max_tokens: this.config.MAX_TOKENS,
                        temperature: this.config.TEMPERATURE,
                        messages: [{
                            role: 'user',
                            content: prompt
                        }]
                    })
                });

                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                
                // Track token usage
                if (data.usage) {
                    this.costTracker.inputTokens += data.usage.input_tokens || 0;
                    this.costTracker.outputTokens += data.usage.output_tokens || 0;
                }

                const content = data.content?.[0]?.text;
                if (!content) {
                    throw new Error('No content in API response');
                }

                // Cache the response
                this.responseCache.set(cacheKey, content);
                
                this.logDebug('API call successful', { 
                    tokens: data.usage,
                    responseLength: content.length 
                });

                return content;

            } catch (error) {
                this.logDebug('API call failed', error.message);
                throw new Error(`Claude API call failed: ${error.message}`);
            }
        },

        // Parse consequences from AI response
        parseConsequences(response) {
            try {
                // Clean up response - remove markdown formatting and extract JSON
                let cleanResponse = response.trim();
                
                // Handle code blocks
                if (cleanResponse.includes('```json')) {
                    const match = cleanResponse.match(/```json\s*([\s\S]*?)\s*```/);
                    if (match) {
                        cleanResponse = match[1];
                    }
                } else if (cleanResponse.includes('```')) {
                    const match = cleanResponse.match(/```\s*([\s\S]*?)\s*```/);
                    if (match) {
                        cleanResponse = match[1];
                    }
                }

                // Try to find JSON in the response
                const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    cleanResponse = jsonMatch[0];
                }

                const parsed = JSON.parse(cleanResponse);
                
                // Validate structure
                if (!parsed.immediate || !Array.isArray(parsed.immediate)) {
                    throw new Error('Missing or invalid immediate consequences');
                }
                
                if (!parsed.delayed || !Array.isArray(parsed.delayed)) {
                    parsed.delayed = []; // Optional field
                }

                if (!parsed.narrative || typeof parsed.narrative !== 'string') {
                    parsed.narrative = 'Something happens as a result of your choice.';
                }

                this.logDebug('Successfully parsed consequences', {
                    immediate: parsed.immediate.length,
                    delayed: parsed.delayed.length
                });

                return parsed;

            } catch (error) {
                this.logDebug('Failed to parse consequences', error.message);
                return this.getFallbackConsequences();
            }
        },

        // Parse dialogue from AI response
        parseDialogue(response) {
            try {
                // Clean up response
                let dialogue = response.trim();
                
                // Remove markdown formatting
                dialogue = dialogue.replace(/```[\s\S]*?```/g, '');
                dialogue = dialogue.replace(/\*\*(.*?)\*\*/g, '$1');
                dialogue = dialogue.replace(/\*(.*?)\*/g, '$1');
                
                // Remove action text in brackets/parentheses
                dialogue = dialogue.replace(/\[.*?\]/g, '');
                dialogue = dialogue.replace(/\(.*?\)/g, '');
                
                // Clean up quotation marks
                dialogue = dialogue.replace(/^["']|["']$/g, '');
                
                // Take first paragraph if multiple
                dialogue = dialogue.split('\n\n')[0];
                
                // Validate length
                if (dialogue.length < 5 || dialogue.length > 500) {
                    throw new Error('Dialogue length invalid');
                }

                this.logDebug('Successfully parsed dialogue', { length: dialogue.length });
                
                return dialogue.trim();

            } catch (error) {
                this.logDebug('Failed to parse dialogue', error.message);
                return this.getFallbackDialogue();
            }
        },

        // Fallback consequences when AI fails
        getFallbackConsequences() {
            return {
                immediate: [
                    {
                        type: 'story_flag',
                        target: 'general_progress',
                        value: 1,
                        description: 'Your choice is noted and remembered'
                    }
                ],
                delayed: [],
                narrative: 'Your decision has consequences that will unfold over time.'
            };
        },

        // Fallback dialogue when AI fails
        getFallbackDialogue() {
            const fallbacks = [
                "I understand. Let me think about this.",
                "That's... interesting. I hadn't considered that perspective.",
                "We should be careful about what we say here.",
                "I'm not sure I can help with that right now.",
                "Things are more complicated than they appear."
            ];
            
            return fallbacks[Math.floor(Math.random() * fallbacks.length)];
        },

        // Helper function to generate cache keys
        generateCacheKey(prompt) {
            // Simple hash function for caching
            let hash = 0;
            for (let i = 0; i < prompt.length; i++) {
                const char = prompt.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return hash.toString();
        },

        // High-level functions for game integration
        async generateConsequences(choice, protagonist, worldState, context = {}) {
            try {
                const prompt = this.buildPrompt('consequences', {
                    choice,
                    protagonist,
                    worldState,
                    context
                });
                
                const response = await this.callClaudeAPI(prompt);
                return this.parseConsequences(response);
                
            } catch (error) {
                this.logDebug('Error generating consequences', error.message);
                return this.getFallbackConsequences();
            }
        },

        async generateDialogue(npc, protagonist, context = {}, mood = 'neutral') {
            try {
                const prompt = this.buildPrompt('dialogue', {
                    npc,
                    protagonist,
                    context,
                    mood
                });
                
                const response = await this.callClaudeAPI(prompt);
                return this.parseDialogue(response);
                
            } catch (error) {
                this.logDebug('Error generating dialogue', error.message);
                return this.getFallbackDialogue();
            }
        },

        async generateCharacterVoice(protagonist, situation, tone = 'neutral') {
            try {
                const prompt = this.buildPrompt('character_voice', {
                    protagonist,
                    situation,
                    tone
                });
                
                const response = await this.callClaudeAPI(prompt);
                return this.parseDialogue(response); // Same parsing as dialogue
                
            } catch (error) {
                this.logDebug('Error generating character voice', error.message);
                return "You take a moment to consider the situation.";
            }
        },

        // Cost and performance tracking
        getCostSummary() {
            const inputCost = this.costTracker.inputTokens * 0.000003;
            const outputCost = this.costTracker.outputTokens * 0.000015;
            return {
                totalRequests: this.costTracker.requests,
                totalTokens: this.costTracker.inputTokens + this.costTracker.outputTokens,
                estimatedCost: inputCost + outputCost,
                cacheHits: this.responseCache.size
            };
        },

        // Debug logging 
        logDebug(message, data = null) {
            if (typeof console !== 'undefined' && console.log) {
                console.log(`🔍 [AISystem] ${message}`, data || '');
            }
        },

        // Clear cache to free memory
        clearCache() {
            this.responseCache.clear();
            this.logDebug('Cache cleared');
        }
    },

    // Initialize the system
    init() {
        this.State.initialize();
        console.log('✅ Solterra Framework Initialized');
        
        // Process any delayed consequences on startup
        this.ChoiceSystem.processDelayedConsequences();
        
        return this;
    }
};

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.Solterra = Solterra;
    // Don't auto-init, let the page do it when ready
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Solterra;
}
