// generate-chapter1.js - Complete Chapter 1 Mechanics System

const Chapter1System = {
    version: '1.0.0',
    
    // Configuration
    config: {
        backgroundTypes: ['Methodical', 'Confident', 'Strategic'],
        colleagues: ['Kess Meridian', 'Supervisor Thane', 'Jorik Thorne', 'Mira Chen'],
        discoveryLevels: ['Surface', 'Medium', 'Deep'],
        timeWindows: {
            workShift: { start: '06:30', end: '15:00' },
            discovery: '10:47',
            blackmailerContact: '19:47'
        }
    },

    // Current state tracking
    state: {
        currentScene: 'morning_arrival',
        backgroundScore: { Methodical: 0, Confident: 0, Strategic: 0 },
        colleagueRelationships: {},
        discoveryDepth: 'none',
        eaiKnowledge: {},
        choices: [],
        timeElapsed: 0
    },

    // Scene Management System
    SceneManager: {
        scenes: {
            'morning_arrival': {
                title: 'Routine Morning',
                duration: 4,
                description: 'ACN Central Hub, Network Maintenance Division, Floor 47. Early morning shift, 6:30 AM.',
                objectives: ['Establish work routine', 'Meet colleagues', 'Begin background discovery'],
                nextScenes: ['workplace_dynamics']
            },
            'workplace_dynamics': {
                title: 'Workplace Interaction',
                duration: 5,
                description: 'Initial colleague interactions and work assignment.',
                objectives: ['Build relationships', 'Receive Terminal 7 assignment', 'Continue background discovery'],
                nextScenes: ['technical_investigation']
            },
            'technical_investigation': {
                title: 'The Discovery',
                duration: 6,
                description: 'Administrative Priority analysis leads to unauthorized access.',
                objectives: ['Investigate anomalies', 'Discover EAI surveillance', 'Process implications'],
                nextScenes: ['processing_paranoia']
            },
            'processing_paranoia': {
                title: 'Processing and Paranoia',
                duration: 4,
                description: 'Character processes discovery and growing workplace paranoia.',
                objectives: ['Internal conflict', 'Observation of surveillance', 'Prepare for contact'],
                nextScenes: ['blackmailer_contact']
            },
            'blackmailer_contact': {
                title: 'The Contact',
                duration: 5,
                description: 'Evening contact through underground network.',
                objectives: ['Mysterious contact', 'Proof of knowledge', 'Critical choice'],
                nextScenes: ['chapter_conclusion']
            },
            'chapter_conclusion': {
                title: 'First Choice Consequences',
                duration: 3,
                description: 'Immediate results and Chapter 2 setup.',
                objectives: ['Process choice', 'Set Chapter 2 state', 'Save progress'],
                nextScenes: ['chapter_2']
            }
        },

        getCurrentScene() {
            return this.scenes[Chapter1System.state.currentScene];
        },

        transitionToScene(sceneId) {
            if (this.scenes[sceneId]) {
                Chapter1System.state.currentScene = sceneId;
                return this.scenes[sceneId];
            }
            throw new Error(`Invalid scene: ${sceneId}`);
        },

        getAvailableScenes() {
            const currentScene = this.getCurrentScene();
            return currentScene.nextScenes || [];
        }
    },

    // Background Discovery System (Organic Character Development)
    BackgroundSystem: {
        traits: {
            Methodical: [
                'systematic_approach', 'documentation_focused', 'family_pressure',
                'precision_oriented', 'careful_planning', 'earned_advancement'
            ],
            Confident: [
                'family_tradition', 'institutional_knowledge', 'moral_clarity',
                'direct_communication', 'leadership_natural', 'legacy_awareness'
            ],
            Strategic: [
                'efficiency_focused', 'opportunity_seeking', 'advancement_driven',
                'business_minded', 'resource_optimization', 'market_thinking'
            ]
        },

        choicePatterns: {
            // Morning priorities reveal approach to work
            work_priority: {
                'check_logs_immediately': { Strategic: 2, Confident: 1 },
                'review_notes_methodically': { Methodical: 3, Strategic: 1 },
                'assess_team_status': { Confident: 2, Methodical: 1 }
            },
            
            // Workspace organization shows personality
            workspace_setup: {
                'efficiency_shortcuts': { Strategic: 2, Methodical: 1 },
                'methodical_arrangement': { Methodical: 3, Confident: 1 },
                'inherited_optimizations': { Confident: 3, Strategic: 1 }
            },
            
            // Response to colleague questions
            colleague_interaction: {
                'direct_information_sharing': { Confident: 2, Strategic: 1 },
                'cautious_professionalism': { Methodical: 2, Confident: 1 },
                'curious_questioning': { Strategic: 2, Methodical: 1 }
            },
            
            // Technical knowledge display
            technical_approach: {
                'security_protocols_focus': { Methodical: 2, Confident: 1 },
                'efficiency_patterns_focus': { Strategic: 3, Methodical: 1 },
                'infrastructure_knowledge': { Confident: 3, Strategic: 1 }
            },
            
            // Investigation method
            investigation_start: {
                'recent_anomalies_first': { Confident: 2, Strategic: 1 },
                'establish_baseline_first': { Methodical: 3, Confident: 1 },
                'volume_spikes_focus': { Strategic: 2, Methodical: 1 }
            },
            
            // Discovery depth choice
            discovery_approach: {
                'dig_deeper_boldly': { Confident: 3, Strategic: 1 },
                'document_carefully': { Methodical: 3, Strategic: 1 },
                'retreat_immediately': { Methodical: 1, Strategic: 2 }
            },
            
            // Blackmailer response
            contact_response: {
                'immediate_engagement': { Confident: 3, Strategic: 2 },
                'cautious_information_gathering': { Methodical: 3, Confident: 1 },
                'strategic_evaluation': { Strategic: 3, Methodical: 1 },
                'seek_alternative_counsel': { Methodical: 2, Confident: 2 }
            }
        },

        async processChoice(choiceType, choiceValue, protagonistId) {
            const patterns = this.choicePatterns[choiceType];
            if (!patterns || !patterns[choiceValue]) {
                console.warn(`Unknown choice pattern: ${choiceType}.${choiceValue}`);
                return;
            }

            // Update background scores
            const scores = patterns[choiceValue];
            Object.entries(scores).forEach(([background, points]) => {
                Chapter1System.state.backgroundScore[background] += points;
            });

            // Store choice for analysis
            Chapter1System.state.choices.push({
                type: choiceType,
                value: choiceValue,
                timestamp: Date.now(),
                scene: Chapter1System.state.currentScene
            });

            // Update protagonist traits if scores are decisive
            const protagonist = Solterra.State.protagonists[protagonistId];
            if (protagonist) {
                await this.updateProtagonistBackground(protagonistId);
            }

            // Generate AI-enhanced consequences
            return this.generateChoiceConsequences(choiceType, choiceValue, protagonistId);
        },

        async updateProtagonistBackground(protagonistId) {
            const protagonist = Solterra.State.protagonists[protagonistId];
            const scores = Chapter1System.state.backgroundScore;
            
            // Determine dominant background
            const dominantBackground = Object.entries(scores)
                .reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
            
            // Update if background has changed or is being established
            if (protagonist.background !== dominantBackground && scores[dominantBackground] >= 3) {
                protagonist.background = dominantBackground;
                
                // Add background-specific traits
                const newTraits = this.traits[dominantBackground];
                newTraits.forEach(trait => {
                    if (!protagonist.traits.includes(trait)) {
                        protagonist.traits.push(trait);
                    }
                });

                // Update specializations based on background
                await this.updateSpecializations(protagonist);
            }
        },

        async updateSpecializations(protagonist) {
            const specializations = {
                Methodical: ['Network Security', 'Documentation Systems', 'Protocol Analysis'],
                Confident: ['Infrastructure Management', 'Team Leadership', 'System Architecture'],
                Strategic: ['Data Analysis', 'Efficiency Optimization', 'Resource Management']
            };

            const backgroundSpecs = specializations[protagonist.background] || [];
            backgroundSpecs.forEach(spec => {
                if (!protagonist.specializations.includes(spec)) {
                    protagonist.specializations.push(spec);
                }
            });
        },

        async generateChoiceConsequences(choiceType, choiceValue, protagonistId) {
            try {
                if (typeof AISystem !== 'undefined' && AISystem.config.API_KEY) {
                    const protagonist = Solterra.State.protagonists[protagonistId];
                    const prompt = AISystem.buildPrompt('consequences', {
                        choice: {
                            action: `${choiceType}: ${choiceValue}`,
                            context: `Chapter 1 - ${Chapter1System.state.currentScene}`,
                            background_discovery: protagonist.background
                        },
                        protagonist: protagonist,
                        worldState: Solterra.State.worldState,
                        region: 'Valoria'
                    });

                    const response = await AISystem.callClaudeAPI(prompt);
                    return AISystem.parseConsequences(response);
                } else {
                    return this.getFallbackConsequences(choiceType, choiceValue);
                }
            } catch (error) {
                console.warn('AI consequence generation failed, using fallback');
                return this.getFallbackConsequences(choiceType, choiceValue);
            }
        },

        getFallbackConsequences(choiceType, choiceValue) {
            const fallbacks = {
                work_priority: {
                    immediate: [{ type: 'relationship', target: 'Supervisor Thane', value: 1, description: 'Professional approach noted' }],
                    delayed: []
                },
                investigation_start: {
                    immediate: [{ type: 'trait', target: 'observant', value: 1, description: 'Develops keen observation skills' }],
                    delayed: []
                },
                discovery_approach: {
                    immediate: [{ type: 'reputation', target: 'Valoria', value: -1, description: 'Security breach detected' }],
                    delayed: [{ type: 'event', trigger: 'Security review', effect: 'Investigation launched', timeline: '72 hours' }]
                }
            };

            return fallbacks[choiceType] || {
                immediate: [{ type: 'reputation', target: 'general', value: 0, description: 'Minor interaction' }],
                delayed: []
            };
        }
    },

    // ACN Workplace System
    WorkplaceSystem: {
        locations: {
            'main_floor': {
                name: 'Network Maintenance Division - Main Floor',
                description: '50+ workstations in geometric patterns, cortium-enhanced displays showing message flow',
                npcs: ['Kess Meridian', 'Jorik Thorne', 'Mira Chen'],
                interactions: ['colleague_chat', 'equipment_check', 'supervisor_briefing']
            },
            'terminal_7': {
                name: 'Terminal 7 - High-Clearance Station',
                description: 'Northeast corner, partially enclosed, advanced diagnostic capabilities',
                security_level: 'Administrative Priority',
                access_requirements: ['supervisor_assignment', 'biometric_scan'],
                capabilities: ['deep_log_access', 'encryption_analysis', 'classification_viewing']
            },
            'break_area': {
                name: 'Break Area',
                description: 'Geometric seating with city view, shared refreshment station',
                npcs: ['Rotating colleagues'],
                interactions: ['casual_conversation', 'gossip_exchange', 'relationship_building']
            }
        },

        colleagues: {
            'Kess Meridian': {
                role: 'Inter-Regional Coordinator',
                personality: ['observant', 'collaborative', 'curious'],
                background: 'Qadir, adjacent workstation, notices patterns',
                relationship_factors: {
                    information_sharing: 2,
                    technical_competence: 1,
                    trustworthiness: 3
                },
                dialogue_patterns: {
                    morning_greeting: "Morning, early bird. Those overnight routing errors still showing up?",
                    technical_discussion: "Something's definitely off with the Administrative Priority channels.",
                    concern_expression: "That's... unusual. Those channels are supposed to be rock-solid."
                }
            },
            'Supervisor Thane': {
                role: 'Floor Supervisor',
                personality: ['protective', 'efficient', 'increasingly_uncomfortable'],
                background: '15-year ACN veteran, values precision',
                authority_level: 'assignment_control',
                hidden_knowledge: 'aware_of_special_assignments',
                dialogue_patterns: {
                    assignment_delivery: "Need someone detail-oriented on the Administrative routing analysis.",
                    task_clarification: "Message volume spikes, unusual routing patterns. Probably system optimization protocols.",
                    professional_assessment: "Good precision record. Take Terminal 7, isolated access."
                }
            },
            'Jorik Thorne': {
                role: 'Senior Technician',
                personality: ['veteran', 'cynical', 'historically_aware'],
                background: '30-year ACN veteran, corner workstation',
                knowledge_type: 'institutional_memory',
                dialogue_patterns: {
                    historical_context: "Thirty years I've been here. Used to be we actually competed with the other networks.",
                    subtle_warnings: "Makes you wonder who's really setting the policies.",
                    mentor_advice: "When the patterns don't match the purpose, someone's changing the rules."
                }
            },
            'Mira Chen': {
                role: 'Junior Technician',
                personality: ['eager', 'nervous', 'grateful'],
                background: 'Recent Bara promotion to Qadir',
                relationship_factors: {
                    mentorship_seeking: 3,
                    procedure_focused: 2,
                    advancement_anxiety: 2
                },
                dialogue_patterns: {
                    guidance_seeking: "Is this the right way to handle routing discrepancies?",
                    procedure_questions: "What's the proper documentation protocol for this?",
                    gratitude_expression: "Thank you for explaining that - I want to get everything right."
                }
            }
        },

        async processWorkplaceInteraction(npcId, interactionType, protagonistId) {
            const npc = this.colleagues[npcId];
            const protagonist = Solterra.State.protagonists[protagonistId];
            
            if (!npc || !protagonist) {
                throw new Error('Invalid NPC or protagonist for workplace interaction');
            }

            // Update relationship based on interaction
            if (!Chapter1System.state.colleagueRelationships[npcId]) {
                Chapter1System.state.colleagueRelationships[npcId] = 0;
            }

            // Generate context-appropriate dialogue
            return this.generateWorkplaceDialogue(npc, interactionType, protagonist);
        },

        async generateWorkplaceDialogue(npc, interactionType, protagonist) {
            try {
                if (typeof AISystem !== 'undefined' && AISystem.config.API_KEY) {
                    const prompt = AISystem.buildPrompt('dialogue', {
                        character: {
                            name: npc.name || 'Colleague',
                            role: npc.role,
                            personality: npc.personality,
                            background: npc.background
                        },
                        situation: `ACN workplace ${interactionType}`,
                        location: 'ACN Central Hub Floor 47',
                        relationship: 'Professional colleague',
                        context: `${protagonist.background} protagonist during Chapter 1`
                    });

                    const response = await AISystem.callClaudeAPI(prompt);
                    return AISystem.parseDialogue(response);
                } else {
                    return this.getFallbackDialogue(npc, interactionType);
                }
            } catch (error) {
                return this.getFallbackDialogue(npc, interactionType);
            }
        },

        getFallbackDialogue(npc, interactionType) {
            const fallbacks = npc.dialogue_patterns || {};
            const defaultDialogue = fallbacks[interactionType] || "I understand what you're saying.";
            
            return {
                mainDialogue: defaultDialogue,
                options: [
                    { text: "Thanks for the information", tone: "professional" },
                    { text: "I'll look into that", tone: "investigative" },
                    { text: "Let me know if you notice anything else", tone: "collaborative" }
                ]
            };
        }
    },

    // EAI Discovery System
    DiscoverySystem: {
        discoveryLevels: {
            'surface': {
                name: 'Surface Discovery',
                risk_level: 'low',
                time_window: '72_hours',
                information: {
                    surveillance_exists: true,
                    personal_monitoring: true,
                    colleague_targeting: false,
                    scope_understanding: 'limited'
                },
                consequences: {
                    security_alert: false,
                    investigation_triggered: false,
                    evidence_secured: false
                }
            },
            'medium': {
                name: 'Careful Investigation',
                risk_level: 'moderate',
                time_window: '72_hours',
                information: {
                    surveillance_exists: true,
                    personal_monitoring: true,
                    colleague_targeting: true,
                    cross_company_coordination: true,
                    scope_understanding: 'moderate'
                },
                consequences: {
                    security_alert: true,
                    investigation_triggered: false,
                    evidence_secured: true
                }
            },
            'deep': {
                name: 'Deep Investigation',
                risk_level: 'high',
                time_window: '48_hours',
                information: {
                    surveillance_exists: true,
                    personal_monitoring: true,
                    colleague_targeting: true,
                    cross_company_coordination: true,
                    eai_scope: 'all_regions',
                    phase_4_protocols: true,
                    resistance_monitoring: true,
                    scope_understanding: 'comprehensive'
                },
                consequences: {
                    security_alert: true,
                    investigation_triggered: true,
                    evidence_secured: true,
                    underground_knowledge: true
                }
            }
        },

        async processDiscovery(discoveryLevel, protagonistId) {
            const level = this.discoveryLevels[discoveryLevel];
            if (!level) {
                throw new Error(`Invalid discovery level: ${discoveryLevel}`);
            }

            Chapter1System.state.discoveryDepth = discoveryLevel;
            Chapter1System.state.eaiKnowledge = { ...level.information };

            // Update protagonist knowledge
            const protagonist = Solterra.State.protagonists[protagonistId];
            if (protagonist) {
                // Add discovered information to character
                protagonist.stats.knowledge += this.getKnowledgeValue(discoveryLevel);
                
                // Update world state based on discovery
                if (level.consequences.security_alert) {
                    Solterra.State.worldState.eaiInfluence += 5;
                }
            }

            // Generate discovery-specific consequences
            return this.generateDiscoveryConsequences(level, protagonistId);
        },

        getKnowledgeValue(discoveryLevel) {
            const values = { surface: 1, medium: 3, deep: 5 };
            return values[discoveryLevel] || 0;
        },

        async generateDiscoveryConsequences(level, protagonistId) {
            try {
                if (typeof AISystem !== 'undefined' && AISystem.config.API_KEY) {
                    const protagonist = Solterra.State.protagonists[protagonistId];
                    const prompt = AISystem.buildPrompt('consequences', {
                        choice: {
                            action: `EAI_discovery_${level.name}`,
                            context: `Terminal 7 investigation reveals ${level.risk_level} risk surveillance database access`,
                            information_gained: Object.keys(level.information).filter(key => level.information[key])
                        },
                        protagonist: protagonist,
                        worldState: Solterra.State.worldState,
                        region: 'Valoria'
                    });

                    const response = await AISystem.callClaudeAPI(prompt);
                    return AISystem.parseConsequences(response);
                } else {
                    return this.getFallbackDiscoveryConsequences(level);
                }
            } catch (error) {
                return this.getFallbackDiscoveryConsequences(level);
            }
        },

        getFallbackDiscoveryConsequences(level) {
            const baseConsequences = {
                surface: {
                    immediate: [
                        { type: 'reputation', target: 'Valoria', value: -1, description: 'Minor security concern noted' },
                        { type: 'trait', target: 'aware', value: 1, description: 'Becomes aware of surveillance' }
                    ],
                    delayed: [
                        { type: 'event', trigger: 'Routine review', effect: 'Standard questioning', timeline: '3 days' }
                    ]
                },
                medium: {
                    immediate: [
                        { type: 'reputation', target: 'Valoria', value: -2, description: 'Security breach detected' },
                        { type: 'stats', target: 'knowledge', value: 3, description: 'Gains valuable intelligence' }
                    ],
                    delayed: [
                        { type: 'event', trigger: 'Security review', effect: 'Formal investigation', timeline: '72 hours' }
                    ]
                },
                deep: {
                    immediate: [
                        { type: 'reputation', target: 'Valoria', value: -3, description: 'Major security breach' },
                        { type: 'stats', target: 'knowledge', value: 5, description: 'Comprehensive intelligence gained' },
                        { type: 'relationship', target: 'Echo Traders', value: 1, description: 'Potential underground value' }
                    ],
                    delayed: [
                        { type: 'event', trigger: 'Automated alert', effect: 'Immediate investigation', timeline: '48 hours' }
                    ]
                }
            };

            return baseConsequences[level.risk_level] || baseConsequences.surface;
        }
    },

    // Blackmailer Contact System
    ContactSystem: {
        contactMethods: {
            'immediate_terminal': {
                timing: 'during_work',
                urgency: 'high',
                tone: 'urgent',
                knowledge_demonstrated: 'comprehensive',
                used_when: 'deep_discovery'
            },
            'evening_home': {
                timing: 'evening_19:47',
                urgency: 'moderate',
                tone: 'professional',
                knowledge_demonstrated: 'specific',
                used_when: 'medium_discovery'
            },
            'delayed_mysterious': {
                timing: 'delayed_contact',
                urgency: 'low',
                tone: 'mysterious',
                knowledge_demonstrated: 'hints',
                used_when: 'surface_discovery'
            }
        },

        messageTemplates: {
            methodical: {
                opening: "Your careful documentation of surveillance evidence shows impressive operational security.",
                approach: "Professional approach recognized. Your evidence is valuable if handled correctly.",
                offer: "My network can provide protection and purpose for your documented findings.",
                closing: "Secure channel attached. Consider carefully."
            },
            confident: {
                opening: "Your digital fingerprints are all over EAI Classification Level Seven files. Bold move.",
                approach: "I know because I monitor government surveillance systems. The watchers have watchers.",
                offer: "Your skills, my protection network. Mutual benefit against institutional corruption.",
                closing: "Channel attached. Time is short."
            },
            strategic: {
                opening: "You've identified a profitable information asymmetry regarding technical surveillance.",
                approach: "I represent interests that convert discoveries into advancement opportunities while managing risks.",
                offer: "Cost-benefit analysis: Cooperation provides protection and resources. Resistance provides neither.",
                closing: "Business proposition attached. Review terms."
            }
        },

        responseOptions: {
            methodical: [
                { text: "I need to verify your claims systematically", tone: "cautious", consequence: "information_exchange" },
                { text: "What specific protection protocols do you offer?", tone: "professional", consequence: "negotiation" },
                { text: "How do I know this isn't another surveillance layer?", tone: "suspicious", consequence: "trust_building" }
            ],
            confident: [
                { text: "If you're fighting surveillance, prove your legitimacy", tone: "direct", consequence: "challenge_response" },
                { text: "My family built these networks with integrity - explain your purpose", tone: "principled", consequence: "ideological_alignment" },
                { text: "I'm willing to listen but I won't be used", tone: "assertive", consequence: "respect_establishment" }
            ], // THIS WAS THE ERROR - MISSING CLOSING BRACKET
            strategic: [
                { text: "Define the specific terms and timeline", tone: "business", consequence: "formal_negotiation" },
                { text: "What resources do you control and what capabilities do you require?", tone: "analytical", consequence: "resource_assessment" },
                { text: "I need to evaluate all options before committing", tone: "strategic", consequence: "competitive_analysis" }
            ]
        },

        async generateContact(discoveryLevel, backgroundType, protagonistId) {
            const contactMethod = this.selectContactMethod(discoveryLevel);
            const messageTemplate = this.messageTemplates[backgroundType.toLowerCase()];
            
            if (!messageTemplate) {
                throw new Error(`No message template for background: ${backgroundType}`);
            }

            // Generate personalized contact message
            const contactMessage = await this.buildContactMessage(
                contactMethod,
                messageTemplate,
                discoveryLevel,
                backgroundType,
                protagonistId
            );

            // Store contact state
            Chapter1System.state.blackmailerContact = {
                method: contactMethod,
                backgroundType: backgroundType,
                discoveryLevel: discoveryLevel,
                timestamp: Date.now(),
                responseDeadline: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            };

            return contactMessage;
        },

        selectContactMethod(discoveryLevel) {
            const methodMap = {
                'surface': 'delayed_mysterious',
                'medium': 'evening_home',
                'deep': 'immediate_terminal'
            };
            return this.contactMethods[methodMap[discoveryLevel]];
        },

        async buildContactMessage(method, template, discoveryLevel, backgroundType, protagonistId) {
            try {
                if (typeof AISystem !== 'undefined' && AISystem.config.API_KEY) {
                    const protagonist = Solterra.State.protagonists[protagonistId];
                    const prompt = AISystem.buildPrompt('dialogue', {
                        character: {
                            name: 'Underground Contact',
                            role: 'Information broker and resistance coordinator',
                            personality: ['mysterious', 'knowledgeable', 'strategically_minded'],
                            background: 'Monitors government surveillance, coordinates resistance activities'
                        },
                        situation: `First contact with ${backgroundType} protagonist after ${discoveryLevel} discovery`,
                        location: method.timing === 'during_work' ? 'ACN Terminal' : 'Protagonist home',
                        relationship: 'Unknown potential ally',
                        context: `Blackmailer contact using ${method.tone} approach, demonstrating ${method.knowledge_demonstrated} knowledge`,
                        requirements: [
                            'Prove knowledge of protagonist\'s discovery',
                            'Demonstrate understanding of surveillance scope',
                            'Offer concrete help and resources',
                            'Create urgency without being threatening',
                            'Match protagonist\'s background communication style'
                        ]
                    });

                    const response = await AISystem.callClaudeAPI(prompt);
                    const dialogue = AISystem.parseDialogue(response);
                    
                    // Add background-specific response options
                    dialogue.options = this.responseOptions[backgroundType.toLowerCase()] || this.responseOptions.methodical;
                    
                    return dialogue;
                } else {
                    return this.getFallbackContactMessage(template, backgroundType);
                }
            } catch (error) {
                return this.getFallbackContactMessage(template, backgroundType);
            }
        },

        getFallbackContactMessage(template, backgroundType) {
            const message = `${template.opening}\n\n${template.approach}\n\n${template.offer}\n\n${template.closing}`;
            
            return {
                mainDialogue: message,
                options: this.responseOptions[backgroundType.toLowerCase()] || [
                    { text: "I need more information before deciding", tone: "cautious" },
                    { text: "What exactly are you offering?", tone: "direct" },
                    { text: "How do I know I can trust you?", tone: "suspicious" },
                    { text: "Give me time to think about this", tone: "deliberate" }
                ]
            };
        },

        async processResponse(responseChoice, protagonistId) {
            const protagonist = Solterra.State.protagonists[protagonistId];
            const contactState = Chapter1System.state.blackmailerContact;
            
            if (!contactState) {
                throw new Error('No active blackmailer contact to respond to');
            }

            // Generate consequences based on response choice
            return this.generateResponseConsequences(responseChoice, contactState, protagonistId);
        },

        async generateResponseConsequences(responseChoice, contactState, protagonistId) {
            try {
                if (typeof AISystem !== 'undefined' && AISystem.config.API_KEY) {
                    const protagonist = Solterra.State.protagonists[protagonistId];
                    const prompt = AISystem.buildPrompt('consequences', {
                        choice: {
                            action: `blackmailer_response_${responseChoice.consequence}`,
                            context: `${contactState.backgroundType} protagonist responds to underground contact`,
                            tone: responseChoice.tone,
                            discovery_level: contactState.discoveryLevel
                        },
                        protagonist: protagonist,
                        worldState: Solterra.State.worldState,
                        region: 'Valoria'
                    });

                    const response = await AISystem.callClaudeAPI(prompt);
                    return AISystem.parseConsequences(response);
                } else {
                    return this.getFallbackResponseConsequences(responseChoice);
                }
            } catch (error) {
                return this.getFallbackResponseConsequences(responseChoice);
            }
        },

        getFallbackResponseConsequences(responseChoice) {
            const consequences = {
                information_exchange: {
                    immediate: [
                        { type: 'relationship', target: 'Shadow Syndicate', value: 1, description: 'Professional approach appreciated' },
                        { type: 'stats', target: 'knowledge', value: 1, description: 'Gains additional intelligence' }
                    ],
                    delayed: [
                        { type: 'event', trigger: 'Information verification', effect: 'Blackmailer provides proof of capabilities', timeline: '24 hours' }
                    ]
                },
                negotiation: {
                    immediate: [
                        { type: 'relationship', target: 'Echo Traders', value: 2, description: 'Methodical approach valued' },
                        { type: 'trait', target: 'negotiator', value: 1, description: 'Develops negotiation skills' }
                    ],
                    delayed: [
                        { type: 'event', trigger: 'Terms discussion', effect: 'Formal cooperation proposal', timeline: '48 hours' }
                    ]
                },
                challenge_response: {
                    immediate: [
                        { type: 'relationship', target: 'Nullbound Coalition', value: 2, description: 'Direct challenge respected' },
                        { type: 'stats', target: 'influence', value: 1, description: 'Gains credibility through boldness' }
                    ],
                    delayed: [
                        { type: 'event', trigger: 'Legitimacy test', effect: 'Blackmailer demonstrates resistance credentials', timeline: '12 hours' }
                    ]
                },
                formal_negotiation: {
                    immediate: [
                        { type: 'relationship', target: 'Shadow Syndicate', value: 1, description: 'Business approach acknowledged' },
                        { type: 'stats', target: 'resources', value: 1, description: 'Strategic positioning improved' }
                    ],
                    delayed: [
                        { type: 'event', trigger: 'Contract terms', effect: 'Detailed proposal with specific benefits', timeline: '36 hours' }
                    ]
                }
            };

            return consequences[responseChoice.consequence] || {
                immediate: [{ type: 'reputation', target: 'general', value: 0, description: 'Neutral response noted' }],
                delayed: []
            };
        }
    },

    // Chapter State Management
    StateManager: {
        async saveChapterProgress(protagonistId) {
            const protagonist = Solterra.State.protagonists[protagonistId];
            if (!protagonist) {
                throw new Error('Cannot save progress: protagonist not found');
            }

            // Compile chapter completion data
            const chapterData = {
                background: protagonist.background,
                traits: protagonist.traits,
                relationships: Chapter1System.state.colleagueRelationships,
                discoveryLevel: Chapter1System.state.discoveryDepth,
                eaiKnowledge: Chapter1System.state.eaiKnowledge,
                choices: Chapter1System.state.choices,
                blackmailerContact: Chapter1System.state.blackmailerContact,
                completionTimestamp: Date.now()
            };

            // Store in protagonist's chapter history
            if (!protagonist.chapterHistory) {
                protagonist.chapterHistory = {};
            }
            protagonist.chapterHistory['chapter_1'] = chapterData;

            // Update world state based on chapter outcomes
            await this.updateWorldStateFromChapter(chapterData);

            // Save to persistent storage
            Solterra.State.saveState();

            return chapterData;
        },

        async updateWorldStateFromChapter(chapterData) {
            const worldState = Solterra.State.worldState;

            // Increase EAI influence based on discovery
            const eaiIncrease = {
                'surface': 2,
                'medium': 5,
                'deep': 8
            };
            worldState.eaiInfluence += eaiIncrease[chapterData.discoveryLevel] || 0;

            // Add chapter events to world history
            worldState.globalEvents.push({
                type: 'surveillance_discovery',
                region: 'Valoria',
                discoveryLevel: chapterData.discoveryLevel,
                protagonist: chapterData.background,
                timestamp: chapterData.completionTimestamp
            });

            // Update faction standings based on choices
            if (chapterData.blackmailerContact) {
                const contactType = chapterData.blackmailerContact.backgroundType;
                const factionMappings = {
                    'Methodical': 'Echo Traders',
                    'Confident': 'Nullbound Coalition',
                    'Strategic': 'Shadow Syndicate'
                };
                
                const favoredFaction = factionMappings[contactType];
                if (favoredFaction && worldState.factions[favoredFaction]) {
                    worldState.factions[favoredFaction].playerStanding += 1;
                }
            }
        },

        getChapterSummary(protagonistId) {
            const protagonist = Solterra.State.protagonists[protagonistId];
            if (!protagonist || !protagonist.chapterHistory || !protagonist.chapterHistory.chapter_1) {
                return null;
            }

            const chapterData = protagonist.chapterHistory.chapter_1;
            return {
                backgroundEstablished: chapterData.background,
                traitsAcquired: chapterData.traits.length,
                relationshipsFormed: Object.keys(chapterData.relationships).length,
                discoveryDepth: chapterData.discoveryLevel,
                eaiKnowledgeGained: Object.keys(chapterData.eaiKnowledge).length,
                choicesMade: chapterData.choices.length,
                blackmailerContactMade: !!chapterData.blackmailerContact,
                totalPlaytime: this.calculatePlaytime(chapterData.choices),
                keyMoments: this.identifyKeyMoments(chapterData)
            };
        },

        calculatePlaytime(choices) {
            if (choices.length < 2) return 0;
            const startTime = choices[0].timestamp;
            const endTime = choices[choices.length - 1].timestamp;
            return Math.round((endTime - startTime) / 1000 / 60); // minutes
        },

        identifyKeyMoments(chapterData) {
            const moments = [];
            
            // Background establishment
            if (chapterData.background !== 'Unknown') {
                moments.push(`Established as ${chapterData.background} specialist`);
            }
            
            // Discovery significance
            const discoveryMoments = {
                'surface': 'Discovered surveillance exists',
                'medium': 'Uncovered colleague targeting',
                'deep': 'Revealed full EAI scope'
            };
            if (discoveryMoments[chapterData.discoveryLevel]) {
                moments.push(discoveryMoments[chapterData.discoveryLevel]);
            }
            
            // Contact made
            if (chapterData.blackmailerContact) {
                moments.push('Made contact with underground network');
            }
            
            return moments;
        }
    },

    // Main Chapter Control
    async startChapter(protagonistId) {
        // Initialize chapter state
        this.state = {
            currentScene: 'morning_arrival',
            backgroundScore: { Methodical: 0, Confident: 0, Strategic: 0 },
            colleagueRelationships: {},
            discoveryDepth: 'none',
            eaiKnowledge: {},
            choices: [],
            timeElapsed: 0
        };

        // Ensure protagonist exists
        const protagonist = Solterra.State.protagonists[protagonistId];
        if (!protagonist) {
            throw new Error('Protagonist not found for Chapter 1');
        }

        // Set chapter context
        protagonist.chapter = 1;
        Solterra.State.currentChapter = 1;
        Solterra.State.currentProtagonist = protagonistId;

        return this.SceneManager.getCurrentScene();
    },

    async processSceneChoice(sceneId, choiceType, choiceValue, protagonistId) {
        // Process the choice through appropriate system
        let consequences;
        
        switch (sceneId) {
            case 'morning_arrival':
            case 'workplace_dynamics':
                consequences = await this.BackgroundSystem.processChoice(choiceType, choiceValue, protagonistId);
                break;
                
            case 'technical_investigation':
                if (choiceType === 'discovery_approach') {
                    consequences = await this.DiscoverySystem.processDiscovery(choiceValue, protagonistId);
                } else {
                    consequences = await this.BackgroundSystem.processChoice(choiceType, choiceValue, protagonistId);
                }
                break;
                
            case 'processing_paranoia':
                consequences = await this.BackgroundSystem.processChoice(choiceType, choiceValue, protagonistId);
                break;
                
            case 'blackmailer_contact':
                if (choiceType === 'initial_contact') {
                    const protagonist = Solterra.State.protagonists[protagonistId];
                    consequences = await this.ContactSystem.generateContact(
                        this.state.discoveryDepth,
                        protagonist.background,
                        protagonistId
                    );
                } else {
                    consequences = await this.ContactSystem.processResponse(choiceValue, protagonistId);
                }
                break;
                
            default:
                consequences = await this.BackgroundSystem.processChoice(choiceType, choiceValue, protagonistId);
        }

        // Apply consequences through main framework
        if (consequences && consequences.immediate) {
            const protagonist = Solterra.State.protagonists[protagonistId];
            consequences.immediate.forEach(consequence => {
                Solterra.ChoiceSystem.applyConsequence(protagonist, consequence);
            });
        }

        // Update time and save state
        this.state.timeElapsed += 1;
        Solterra.State.saveState();

        return consequences;
    },

    async completeChapter(protagonistId) {
        // Save all chapter progress
        const chapterData = await this.StateManager.saveChapterProgress(protagonistId);
        
        // Generate chapter summary
        const summary = this.StateManager.getChapterSummary(protagonistId);
        
        // Set up for Chapter 2
        const protagonist = Solterra.State.protagonists[protagonistId];
        protagonist.chapter = 2;
        
        return {
            chapterData: chapterData,
            summary: summary,
            chapter2Setup: this.generateChapter2Setup(chapterData)
        };
    },

    generateChapter2Setup(chapterData) {
        // Determine Chapter 2 starting scenario based on Chapter 1 choices
        const scenarios = {
            methodical_medium_cooperation: {
                title: 'The Careful Alliance',
                description: 'Working with underground contacts while maintaining professional cover',
                startingLocation: 'ACN workplace with underground communication',
                availableOptions: ['continue_surveillance', 'expand_network', 'protect_colleagues']
            },
            confident_deep_resistance: {
                title: 'The Bold Resistance',
                description: 'Active resistance operations with full underground integration',
                startingLocation: 'Underground safe house',
                availableOptions: ['sabotage_operations', 'recruit_colleagues', 'expose_eai']
            },
            strategic_surface_negotiation: {
                title: 'The Strategic Approach',
                description: 'Playing multiple sides while gathering intelligence',
                startingLocation: 'Public location with multiple contacts',
                availableOptions: ['information_brokering', 'advancement_opportunities', 'risk_management']
            }
        };

        // Select scenario based on chapter data
        const scenarioKey = `${chapterData.background.toLowerCase()}_${chapterData.discoveryLevel}_${chapterData.blackmailerContact ? 'cooperation' : 'independence'}`;
        
        return scenarios[scenarioKey] || scenarios.methodical_medium_cooperation;
    },

    // Utility functions
    getCurrentStatus() {
        return {
            version: this.version,
            currentScene: this.state.currentScene,
            backgroundScores: this.state.backgroundScore,
            discoveryLevel: this.state.discoveryDepth,
            choiceCount: this.state.choices.length,
            timeElapsed: this.state.timeElapsed,
            relationships: this.state.colleagueRelationships
        };
    },

    reset() {
        this.state = {
            currentScene: 'morning_arrival',
            backgroundScore: { Methodical: 0, Confident: 0, Strategic: 0 },
            colleagueRelationships: {},
            discoveryDepth: 'none',
            eaiKnowledge: {},
            choices: [],
            timeElapsed: 0
        };
    }
};

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Chapter1System;
} else if (typeof window !== 'undefined') {
    window.Chapter1System = Chapter1System;
}

// Integration with Solterra framework
if (typeof Solterra !== 'undefined') {
    Solterra.Chapter1System = Chapter1System;
}

console.log('✅ Chapter 1 System Generated Successfully!');
console.log('📊 System includes:');
console.log('  - 6 story scenes with organic progression');
console.log('  - Background discovery through 8+ choice patterns');
console.log('  - 4 detailed colleague relationships');
console.log('  - 3-tier EAI discovery system');
console.log('  - Dynamic blackmailer contact system');
console.log('  - Full integration with Solterra framework');
console.log('  - Chapter completion and Chapter 2 setup');
console.log('🎮 Ready for gameplay testing!');
