const WebflowIntegration = {
    version: '1.0.0',
    
    // Configuration
    config: {
        selectors: {
            // Character Creation
            characterForm: '#character-creation-form',
            characterName: '#character-name',
            backgroundDisplay: '#character-background',
            traitsDisplay: '#character-traits',
            
            // Story Interface
            storyContainer: '#story-content',
            sceneTitle: '#scene-title',
            sceneDescription: '#scene-description',
            choicesContainer: '#choices-container',
            narrativeText: '#narrative-text',
            
            // Character Status
            protagonistName: '#protagonist-name',
            currentChapter: '#current-chapter',
            reputationDisplay: '#reputation-display',
            relationshipsDisplay: '#relationships-display',
            
            // Navigation
            saveButton: '#save-game',
            loadButton: '#load-game',
            protagonistSelect: '#protagonist-select',
            chapterSelect: '#chapter-select',
            
            // Progress Indicators
            progressBar: '#chapter-progress',
            choiceHistory: '#choice-history',
            worldStateDisplay: '#world-state',
            
            // AI Status
            aiStatus: '#ai-status',
            loadingIndicator: '#loading-content'
        },
        
        animations: {
            fadeIn: 300,
            fadeOut: 200,
            slideDown: 400,
            typewriter: 50
        },
        
        css: {
            choiceButton: 'choice-btn',
            selectedChoice: 'choice-selected',
            disabledChoice: 'choice-disabled',
            loadingState: 'loading',
            aiGenerated: 'ai-content',
            backgroundType: 'background-type',
            consequencePreview: 'consequence-preview'
        }
    },
    
    // Current State
    state: {
        currentProtagonist: null,
        currentScene: null,
        isProcessingChoice: false,
        autoSaveEnabled: true,
        typingInProgress: false
    },
    
    // Initialize the integration
    async initialize(apiKey) {
        try {
            // Initialize core framework
            if (typeof Solterra !== 'undefined') {
                Solterra.init();
                if (apiKey && typeof Solterra.AISystem !== 'undefined') {
                    Solterra.AISystem.initialize(apiKey);
                }
            }
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load any existing save data
            this.loadSavedState();
            
            // Initialize UI state
            this.updateUIState();
            
            console.log('✅ Webflow Integration initialized successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Webflow Integration initialization failed:', error);
            this.showError('Failed to initialize game. Please refresh the page.');
            return false;
        }
    },
    
    // Event Listeners Setup
    setupEventListeners() {
        // Character Creation Form
        const characterForm = document.querySelector(this.config.selectors.characterForm);
        if (characterForm) {
            characterForm.addEventListener('submit', (e) => this.handleCharacterCreation(e));
        }
        
        // Save/Load Buttons
        const saveButton = document.querySelector(this.config.selectors.saveButton);
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveGame());
        }
        
        const loadButton = document.querySelector(this.config.selectors.loadButton);
        if (loadButton) {
            loadButton.addEventListener('click', () => this.loadGame());
        }
        
        // Protagonist Selection
        const protagonistSelect = document.querySelector(this.config.selectors.protagonistSelect);
        if (protagonistSelect) {
            protagonistSelect.addEventListener('change', (e) => this.switchProtagonist(e.target.value));
        }
        
        // Auto-save on page unload
        window.addEventListener('beforeunload', () => {
            if (this.state.autoSaveEnabled && this.state.currentProtagonist) {
                this.saveGame();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    },
    
    // Character Creation System
    async handleCharacterCreation(event) {
        event.preventDefault();
        
        try {
            this.showLoading(true);
            
            const formData = new FormData(event.target);
            const characterData = {
                name: formData.get('character-name') || 'Unnamed Specialist',
                region: 'Valoria', // Chapter 1 always starts in Valoria
                socialClass: 'Qadir', // Chapter 1 protagonist is always Qadir
                background: 'Unknown', // Will be discovered organically
                traits: [],
                specializations: []
            };
            
            // Create protagonist in framework
            const protagonist = Solterra.CharacterSystem.createProtagonist({
                id: `protagonist_${Date.now()}`,
                ...characterData
            });
            
            // Set as current protagonist
            this.state.currentProtagonist = protagonist.id;
            Solterra.CharacterSystem.switchProtagonist(protagonist.id);
            
            // Update UI
            this.updateCharacterDisplay(protagonist);
            this.updateProtagonistSelector();
            
            // Start Chapter 1
            await this.startChapter1(protagonist.id);
            
            // Hide character creation, show game interface
            this.transitionToGameInterface();
            
            this.showLoading(false);
            
        } catch (error) {
            console.error('Character creation failed:', error);
            this.showError('Failed to create character. Please try again.');
            this.showLoading(false);
        }
    },
    
    // Chapter 1 Integration
    async startChapter1(protagonistId) {
        try {
            // Initialize Chapter 1 system
            if (typeof Chapter1System !== 'undefined') {
                const scene = await Chapter1System.startChapter(protagonistId);
                this.state.currentScene = scene;
                
                // Display opening scene
                await this.displayScene(scene, protagonistId);
                
                return true;
            } else {
                throw new Error('Chapter 1 system not loaded');
            }
        } catch (error) {
            console.error('Failed to start Chapter 1:', error);
            this.showError('Failed to start story. Please refresh and try again.');
            return false;
        }
    },
    
    // Scene Display System
    async displayScene(scene, protagonistId) {
        try {
            const sceneContainer = document.querySelector(this.config.selectors.storyContainer);
            if (!sceneContainer) return;
            
            // Update scene title and description
            this.updateElement(this.config.selectors.sceneTitle, scene.title);
            
            // Generate scene content using AI if available
            let sceneContent = scene.description;
            if (typeof Solterra.AISystem !== 'undefined' && Solterra.AISystem.config.API_KEY) {
                try {
                    const protagonist = Solterra.State.protagonists[protagonistId];
                    sceneContent = await Solterra.AISystem.generateCharacterVoice(
                        protagonist,
                        scene.description,
                        'observational'
                    );
                } catch (aiError) {
                    console.warn('AI content generation failed, using fallback:', aiError);
                }
            }
            
            // Display content with typewriter effect
            await this.typewriterEffect(this.config.selectors.sceneDescription, sceneContent);
            
            // Generate scene choices
            this.generateSceneChoices(scene, protagonistId);
            
        } catch (error) {
            console.error('Failed to display scene:', error);
            this.showError('Failed to load scene content.');
        }
    },
    
    // Choice Generation and Handling
    generateSceneChoices(scene, protagonistId) {
        const choicesContainer = document.querySelector(this.config.selectors.choicesContainer);
        if (!choicesContainer) return;
        
        // Clear existing choices
        choicesContainer.innerHTML = '';
        
        // Get scene-appropriate choices
        const choices = this.getSceneChoices(scene, protagonistId);
        
        choices.forEach((choice, index) => {
            const choiceButton = this.createChoiceButton(choice, index, protagonistId);
            choicesContainer.appendChild(choiceButton);
        });
    },
    
    getSceneChoices(scene, protagonistId) {
        // Define scene-specific choices based on Chapter 1 framework
        const sceneChoices = {
            'morning_arrival': [
                {
                    id: 'work_priority_check_logs',
                    text: 'Check overnight message logs immediately - efficiency is everything',
                    type: 'work_priority',
                    value: 'check_logs_immediately',
                    consequence: 'Strategic approach noted'
                },
                {
                    id: 'work_priority_review_notes',
                    text: 'Review yesterday\'s work notes and prepare tools methodically',
                    type: 'work_priority', 
                    value: 'review_notes_methodically',
                    consequence: 'Methodical precision appreciated'
                },
                {
                    id: 'work_priority_assess_team',
                    text: 'Quick scan of colleague workstations to assess team status',
                    type: 'work_priority',
                    value: 'assess_team_status',
                    consequence: 'Leadership qualities recognized'
                }
            ],
            'workplace_dynamics': [
                {
                    id: 'colleague_direct_sharing',
                    text: 'Share information directly about the routing errors',
                    type: 'colleague_interaction',
                    value: 'direct_information_sharing',
                    consequence: 'Kess appreciates honesty'
                },
                {
                    id: 'colleague_cautious_professional',
                    text: 'Maintain cautious professionalism about the errors',
                    type: 'colleague_interaction', 
                    value: 'cautious_professionalism',
                    consequence: 'Professional discretion noted'
                },
                {
                    id: 'colleague_curious_questioning',
                    text: 'Ask probing questions about what Kess has noticed',
                    type: 'colleague_interaction',
                    value: 'curious_questioning',
                    consequence: 'Investigative instincts emerge'
                }
            ],
            'technical_investigation': [
                {
                    id: 'discovery_dig_deeper',
                    text: 'Dig deeper into the surveillance files despite the risks',
                    type: 'discovery_approach',
                    value: 'deep',
                    consequence: 'High information, high risk'
                },
                {
                    id: 'discovery_document_carefully',
                    text: 'Document current findings carefully before proceeding',
                    type: 'discovery_approach',
                    value: 'medium', 
                    consequence: 'Medium information, evidence secured'
                },
                {
                    id: 'discovery_retreat_immediately',
                    text: 'Close files and back away immediately',
                    type: 'discovery_approach',
                    value: 'surface',
                    consequence: 'Low information, minimal exposure'
                }
            ],
            'blackmailer_contact': [
                {
                    id: 'contact_immediate_cooperation',
                    text: 'Agree to work together immediately',
                    type: 'contact_response',
                    value: 'immediate_engagement',
                    consequence: 'Fast-track resistance membership'
                },
                {
                    id: 'contact_demand_information',
                    text: 'Demand more information before deciding',
                    type: 'contact_response',
                    value: 'cautious_information_gathering',
                    consequence: 'Negotiated partnership terms'
                },
                {
                    id: 'contact_seek_help',
                    text: 'Seek advice from trusted colleagues first',
                    type: 'contact_response',
                    value: 'seek_alternative_counsel',
                    consequence: 'Collaborative resistance approach'
                }
            ]
        };
        
        return sceneChoices[scene.id] || sceneChoices['morning_arrival'];
    },
    
    createChoiceButton(choice, index, protagonistId) {
        const button = document.createElement('button');
        button.className = `${this.config.css.choiceButton} w-button`;
        button.textContent = choice.text;
        button.dataset.choiceId = choice.id;
        button.dataset.choiceType = choice.type;
        button.dataset.choiceValue = choice.value;
        
        // Add consequence preview on hover
        if (choice.consequence) {
            button.title = `Consequence: ${choice.consequence}`;
            
            // Create consequence preview element
            const preview = document.createElement('div');
            preview.className = this.config.css.consequencePreview;
            preview.textContent = choice.consequence;
            preview.style.display = 'none';
            
            button.appendChild(preview);
            
            button.addEventListener('mouseenter', () => {
                preview.style.display = 'block';
            });
            
            button.addEventListener('mouseleave', () => {
                preview.style.display = 'none';
            });
        }
        
        // Add click handler
        button.addEventListener('click', () => this.handleChoiceSelection(choice, protagonistId));
        
        // Keyboard support
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleChoiceSelection(choice, protagonistId);
            }
        });
        
        return button;
    },
    
    // Choice Processing
    async handleChoiceSelection(choice, protagonistId) {
        if (this.state.isProcessingChoice) return;
        
        try {
            this.state.isProcessingChoice = true;
            this.showLoading(true);
            
            // Visual feedback
            this.highlightSelectedChoice(choice.id);
            
            // Process choice through Chapter 1 system
            let consequences;
            if (typeof Chapter1System !== 'undefined') {
                consequences = await Chapter1System.processSceneChoice(
                    this.state.currentScene.id,
                    choice.type,
                    choice.value,
                    protagonistId
                );
            }
            
            // Display consequences
            if (consequences && consequences.narrative) {
                await this.displayConsequences(consequences);
            }
            
            // Update character display
            const protagonist = Solterra.State.protagonists[protagonistId];
            this.updateCharacterDisplay(protagonist);
            
            // Check for scene transition
            await this.checkSceneTransition(choice, protagonistId);
            
            // Auto-save progress
            if (this.state.autoSaveEnabled) {
                this.saveGame();
            }
            
        } catch (error) {
            console.error('Choice processing failed:', error);
            this.showError('Failed to process choice. Please try again.');
        } finally {
            this.state.isProcessingChoice = false;
            this.showLoading(false);
        }
    },
    
    async displayConsequences(consequences) {
        const narrativeElement = document.querySelector(this.config.selectors.narrativeText);
        if (!narrativeElement) return;
        
        // Clear previous content
        narrativeElement.innerHTML = '';
        
        // Display main narrative
        if (consequences.narrative) {
            await this.typewriterEffect(this.config.selectors.narrativeText, consequences.narrative);
        }
        
        // Display immediate consequences
        if (consequences.immediate && consequences.immediate.length > 0) {
            const consequencesText = consequences.immediate
                .map(c => c.description)
                .join(' ');
            
            const consequenceDiv = document.createElement('div');
            consequenceDiv.className = 'consequence-summary';
            consequenceDiv.textContent = consequencesText;
            narrativeElement.appendChild(consequenceDiv);
        }
    },
    
    async checkSceneTransition(choice, protagonistId) {
        // Determine if choice should trigger scene transition
        const currentSceneId = this.state.currentScene.id;
        const nextSceneMap = {
            'morning_arrival': 'workplace_dynamics',
            'workplace_dynamics': 'technical_investigation', 
            'technical_investigation': 'processing_paranoia',
            'processing_paranoia': 'blackmailer_contact',
            'blackmailer_contact': 'chapter_conclusion'
        };
        
        const nextSceneId = nextSceneMap[currentSceneId];
        if (nextSceneId && typeof Chapter1System !== 'undefined') {
            // Transition to next scene
            setTimeout(async () => {
                try {
                    const nextScene = Chapter1System.SceneManager.transitionToScene(nextSceneId);
                    this.state.currentScene = nextScene;
                    await this.displayScene(nextScene, protagonistId);
                } catch (error) {
                    console.error('Scene transition failed:', error);
                }
            }, 2000); // 2 second delay for narrative reading
        }
    },
    
    // UI Update Functions
    updateCharacterDisplay(protagonist) {
        if (!protagonist) return;
        
        // Update basic info
        this.updateElement(this.config.selectors.protagonistName, protagonist.name);
        this.updateElement(this.config.selectors.currentChapter, `Chapter ${protagonist.chapter || 1}`);
        
        // Update background (if discovered)
        if (protagonist.background && protagonist.background !== 'Unknown') {
            this.updateElement(this.config.selectors.backgroundDisplay, protagonist.background);
            
            // Add CSS class for background type
            const element = document.querySelector(this.config.selectors.backgroundDisplay);
            if (element) {
                element.className = `${this.config.css.backgroundType} ${protagonist.background.toLowerCase()}`;
            }
        }
        
        // Update traits
        if (protagonist.traits && protagonist.traits.length > 0) {
            const traitsText = protagonist.traits.join(', ');
            this.updateElement(this.config.selectors.traitsDisplay, traitsText);
        }
        
        // Update reputation
        this.updateReputationDisplay(protagonist);
        
        // Update relationships
        this.updateRelationshipsDisplay(protagonist);
    },
    
    updateReputationDisplay(protagonist) {
        const reputationElement = document.querySelector(this.config.selectors.reputationDisplay);
        if (!reputationElement || !protagonist.reputation) return;
        
        reputationElement.innerHTML = '';
        
        Object.entries(protagonist.reputation).forEach(([region, value]) => {
            const regionDiv = document.createElement('div');
            regionDiv.className = 'reputation-item';
            
            const regionName = document.createElement('span');
            regionName.className = 'region-name';
            regionName.textContent = region;
            
            const reputationValue = document.createElement('span');
            reputationValue.className = `reputation-value ${value >= 0 ? 'positive' : 'negative'}`;
            reputationValue.textContent = value > 0 ? `+${value}` : value.toString();
            
            regionDiv.appendChild(regionName);
            regionDiv.appendChild(reputationValue);
            reputationElement.appendChild(regionDiv);
        });
    },
    
    updateRelationshipsDisplay(protagonist) {
        const relationshipsElement = document.querySelector(this.config.selectors.relationshipsDisplay);
        if (!relationshipsElement || !protagonist.relationships) return;
        
        relationshipsElement.innerHTML = '';
        
        Object.entries(protagonist.relationships).forEach(([faction, value]) => {
            if (value !== 0) { // Only show non-neutral relationships
                const factionDiv = document.createElement('div');
                factionDiv.className = 'relationship-item';
                
                const factionName = document.createElement('span');
                factionName.className = 'faction-name';
                factionName.textContent = faction;
                
                const relationshipValue = document.createElement('span');
                relationshipValue.className = `relationship-value ${value >= 0 ? 'positive' : 'negative'}`;
                relationshipValue.textContent = value > 0 ? `+${value}` : value.toString();
                
                factionDiv.appendChild(factionName);
                factionDiv.appendChild(relationshipValue);
                relationshipsElement.appendChild(factionDiv);
            }
        });
    },
    
    updateProtagonistSelector() {
        const selector = document.querySelector(this.config.selectors.protagonistSelect);
        if (!selector || typeof Solterra === 'undefined') return;
        
        selector.innerHTML = '<option value="">Select Character...</option>';
        
        Object.entries(Solterra.State.protagonists).forEach(([id, protagonist]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `${protagonist.name} (${protagonist.background})`;
            
            if (id === this.state.currentProtagonist) {
                option.selected = true;
            }
            
            selector.appendChild(option);
        });
    },
    
    // Utility Functions
    updateElement(selector, content) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = content;
        }
    },
    
    async typewriterEffect(selector, text, speed = null) {
        const element = document.querySelector(selector);
        if (!element) return;
        
        this.state.typingInProgress = true;
        const typeSpeed = speed || this.config.animations.typewriter;
        
        element.textContent = '';
        element.classList.add(this.config.css.aiGenerated);
        
        for (let i = 0; i < text.length; i++) {
            if (!this.state.typingInProgress) break; // Allow interruption
            
            element.textContent += text.charAt(i);
            await new Promise(resolve => setTimeout(resolve, typeSpeed));
        }
        
        this.state.typingInProgress = false;
    },
    
    highlightSelectedChoice(choiceId) {
        // Remove previous highlights
        document.querySelectorAll(`.${this.config.css.selectedChoice}`).forEach(el => {
            el.classList.remove(this.config.css.selectedChoice);
        });
        
        // Highlight selected choice
        const selectedButton = document.querySelector(`[data-choice-id="${choiceId}"]`);
        if (selectedButton) {
            selectedButton.classList.add(this.config.css.selectedChoice);
            
            // Disable all choice buttons temporarily
            document.querySelectorAll(`.${this.config.css.choiceButton}`).forEach(btn => {
                btn.classList.add(this.config.css.disabledChoice);
                btn.disabled = true;
            });
        }
    },
    
    showLoading(show) {
        const loadingElement = document.querySelector(this.config.selectors.loadingIndicator);
        const aiStatus = document.querySelector(this.config.selectors.aiStatus);
        
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
        
        if (aiStatus) {
            aiStatus.textContent = show ? 'Generating content...' : 'Ready';
        }
        
        // Add loading class to body
        document.body.classList.toggle(this.config.css.loadingState, show);
    },
    
    showError(message) {
        // Create or update error display
        let errorElement = document.querySelector('#error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'error-message';
            errorElement.className = 'error-message';
            document.body.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    },
    
    // Save/Load System
    saveGame() {
        try {
            if (typeof Solterra !== 'undefined') {
                const success = Solterra.State.saveState();
                if (success) {
                    this.showTemporaryMessage('Game saved successfully!');
                    return true;
                }
            }
            throw new Error('Save failed');
        } catch (error) {
            console.error('Save failed:', error);
            this.showError('Failed to save game.');
            return false;
        }
    },
    
    loadGame() {
        try {
            if (typeof Solterra !== 'undefined') {
                const success = Solterra.State.loadState();
                if (success && Solterra.State.currentProtagonist) {
                    this.state.currentProtagonist = Solterra.State.currentProtagonist;
                    this.loadSavedState();
                    this.showTemporaryMessage('Game loaded successfully!');
                    return true;
                }
            }
            throw new Error('Load failed');
        } catch (error) {
            console.error('Load failed:', error);
            this.showError('Failed to load game.');
            return false;
        }
    },
    
    loadSavedState() {
        if (this.state.currentProtagonist && typeof Solterra !== 'undefined') {
            const protagonist = Solterra.State.protagonists[this.state.currentProtagonist];
            if (protagonist) {
                this.updateCharacterDisplay(protagonist);
                this.updateProtagonistSelector();
                this.updateUIState();
            }
        }
    },
    
    switchProtagonist(protagonistId) {
        if (!protagonistId || typeof Solterra === 'undefined') return;
        
        const success = Solterra.CharacterSystem.switchProtagonist(protagonistId);
        if (success) {
            this.state.currentProtagonist = protagonistId;
            this.loadSavedState();
            this.showTemporaryMessage(`Switched to ${Solterra.State.protagonists[protagonistId].name}`);
        }
    },
    
    // UI State Management
    updateUIState() {
        // Update progress indicators, chapter display, etc.
        const currentChapter = typeof Solterra !== 'undefined' ? Solterra.State.currentChapter : 1;
        this.updateElement(this.config.selectors.currentChapter, `Chapter ${currentChapter}`);
        
        // Update world state display if available
        this.updateWorldStateDisplay();
    },
    
    updateWorldStateDisplay() {
        const worldStateElement = document.querySelector(this.config.selectors.worldStateDisplay);
        if (!worldStateElement || typeof Solterra === 'undefined') return;
        
        const worldState = Solterra.State.worldState;
        worldStateElement.innerHTML = `
            <div class="world-stat">
                <span>EAI Influence:</span>
                <span class="stat-value">${worldState.eaiInfluence || 0}</span>
            </div>
            <div class="world-stat">
                <span>Global Events:</span>
                <span class="stat-value">${worldState.globalEvents?.length || 0}</span>
            </div>
        `;
    },
    
    transitionToGameInterface() {
        // Hide character creation form
        const characterForm = document.querySelector(this.config.selectors.characterForm);
        if (characterForm) {
            characterForm.style.display = 'none';
        }
        
        // Show game interface
        const storyContainer = document.querySelector(this.config.selectors.storyContainer);
        if (storyContainer) {
            storyContainer.style.display = 'block';
        }
        
        // Show character status
        const statusElements = [
            this.config.selectors.protagonistName,
            this.config.selectors.reputationDisplay,
            this.config.selectors.relationshipsDisplay
        ];
        
        statusElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = 'block';
            }
        });
    },
    
    // Utility Methods
    showTemporaryMessage(message, duration = 3000) {
        let messageElement = document.querySelector('#temp-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'temp-message';
            messageElement.className = 'temp-message';
            document.body.appendChild(messageElement);
        }
        
        messageElement.textContent = message;
        messageElement.style.display = 'block';
        
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, duration);
    },
    
    handleKeyboardShortcuts(event) {
        // Save: Ctrl+S
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            this.saveGame();
        }
        
        // Load: Ctrl+L
        if (event.ctrlKey && event.key === 'l') {
            event.preventDefault();
            this.loadGame();
        }
        
        // Stop typing animation: Escape
        if (event.key === 'Escape' && this.state.typingInProgress) {
            this.state.typingInProgress = false;
        }
        
        // Choice selection: Number keys 1-9
        if (event.key >= '1' && event.key <= '9') {
            const choiceIndex = parseInt(event.key) - 1;
            const choiceButtons = document.querySelectorAll(`.${this.config.css.choiceButton}`);
            if (choiceButtons[choiceIndex] && !choiceButtons[choiceIndex].disabled) {
                choiceButtons[choiceIndex].click();
            }
        }
    },
    
    // Debug and Development Helpers
    getDebugInfo() {
        return {
            version: this.version,
            currentState: this.state,
            solterraLoaded: typeof Solterra !== 'undefined',
            chapter1Loaded: typeof Chapter1System !== 'undefined',
            aiSystemActive: typeof Solterra !== 'undefined' && 
                           typeof Solterra.AISystem !== 'undefined' && 
                           Solterra.AISystem.config.API_KEY !== null,
            protagonistCount: typeof Solterra !== 'undefined' ? 
                             Object.keys(Solterra.State.protagonists).length : 0
        };
    },
    
    // Reset and Cleanup
    reset() {
        this.state = {
            currentProtagonist: null,
            currentScene: null,
            isProcessingChoice: false,
            autoSaveEnabled: true,
            typingInProgress: false
        };
        
        // Clear UI
        const containers = [
            this.config.selectors.storyContainer,
            this.config.selectors.choicesContainer,
            this.config.selectors.narrativeText
        ];
        
        containers.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = '';
            }
        });
        
        this.showLoading(false);
    }
};

// Auto-initialize if Solterra framework is available
if (typeof window !== 'undefined') {
    window.WebflowIntegration = WebflowIntegration;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize with API key from environment or prompt user
            const apiKey = window.CLAUDE_API_KEY || prompt('Enter Claude API key (optional for testing):');
            WebflowIntegration.initialize(apiKey);
        });
    } else {
        // DOM already ready
        const apiKey = window.CLAUDE_API_KEY || prompt('Enter Claude API key (optional for testing):');
        WebflowIntegration.initialize(apiKey);
    }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebflowIntegration;
}

console.log('✅ Webflow Integration System loaded successfully!');
console.log('🎮 Features included:');
console.log('  - Complete character creation integration');
console.log('  - Dynamic story scene display with AI content');
console.log('  - Interactive choice system with consequence previews');
console.log('  - Save/load functionality');
console.log('  - Multi-protagonist management');
console.log('  - Real-time character status updates');
console.log('  - Keyboard shortcuts and accessibility features');
console.log('  - Chapter 1 complete integration');
console.log('🚀 Ready for Webflow deployment!');
