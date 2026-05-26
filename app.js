        function appState() {
            return {
                currentView: 'home',
                currentProfile: 'gallerystaff',
                selectedGallery: null,
                selectedExhibit: null,
                issueText: '',
                uploadedIssuePhotoBase64: null,
                
                // Lightbox Modal State
                lightboxOpen: false,
                lightboxImage: '',

                // Custom Router Sync Framework
                init() {
                    // Seed the initial history endpoint data state layout
                    if (!window.history.state) {
                        window.history.replaceState({ view: 'home', galleryId: null, exhibitName: null }, '', '');
                    }
                },

                handleBrowserNavigation(event) {
                    const state = event.state;
                    if (!state) return;

                    this.currentView = state.view;

                    if (state.galleryId) {
                        this.selectedGallery = this.galleries.find(g => g.id === state.galleryId) || null;
                    } else {
                        this.selectedGallery = null;
                    }

                    if (state.exhibitName && this.selectedGallery) {
                        this.selectedExhibit = this.selectedGallery.exhibits.find(e => e.name === state.exhibitName) || null;
                    } else {
                        this.selectedExhibit = null;
                    }
                },

                pushHistoryState() {
                    const stateObj = {
                        view: this.currentView,
                        galleryId: this.selectedGallery ? this.selectedGallery.id : null,
                        exhibitName: this.selectedExhibit ? this.selectedExhibit.name : null
                    };
                    window.history.pushState(stateObj, '', '');
                },

                openLightbox(imgSrc) {
                    if (!imgSrc) return;
                    this.lightboxImage = imgSrc;
                    this.lightboxOpen = true;
                },

                toggleProfile() {
                    if (this.currentProfile === 'gallerystaff') {
                        const passwordInput = prompt("Enter verification key to activate Technician mode:");
                        if (passwordInput === 'twose') {
                            this.currentProfile = 'technician';
                        } else if (passwordInput !== null) {
                            alert("ACCESS DENIED: Invalid configuration credentials.");
                        }
                    } else {
                        this.currentProfile = 'gallerystaff';
                    }
                },

                getGalleryStatus(gallery) {
                    const statuses = gallery.exhibits.map(e => e.status);
                    if (statuses.includes('problem')) return 'problem'; 
                    if (statuses.includes('working')) return 'working'; 
                    return 'clear'; 
                },

                uploadExhibitImage(event) {
                    const file = event.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.selectedExhibit.exhibitImage = e.target.result;
                    };
                    reader.readAsDataURL(file);
                },

                handleUploadedIssuePhoto(event) {
                    const file = event.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.uploadedIssuePhotoBase64 = e.target.result;
                    };
                    reader.readAsDataURL(file);
                },

                saveNotesLocal() {},

                submitIssue() {
                    if(!this.selectedExhibit) return;
                    
                    const timestampStr = new Date().toLocaleString();
                    const newReport = {
                        text: this.issueText,
                        photo: this.uploadedIssuePhotoBase64,
                        timestamp: timestampStr
                    };

                    if (!this.selectedExhibit.activeReports) {
                        this.selectedExhibit.activeReports = [];
                    }

                    this.selectedExhibit.activeReports.push(newReport);
                    this.selectedExhibit.status = 'problem';
                    
                    this.issueText = '';
                    this.uploadedIssuePhotoBase64 = null;
                },

                resolveIssue(index) {
                    if (!this.selectedExhibit || !this.selectedExhibit.activeReports) return;
                    this.selectedExhibit.activeReports.splice(index, 1);
                    
                    if (this.selectedExhibit.activeReports.length === 0) {
                        this.selectedExhibit.status = 'clear';
                    }
                },

                changeStatus(newStatus) {
                    if(this.selectedExhibit && this.currentProfile === 'technician') {
                        this.selectedExhibit.status = newStatus;
                    }
                },

                selectGallery(gallery) {
                    this.selectedGallery = gallery;
                    this.currentView = 'gallery';
                    this.pushHistoryState();
                    window.scrollTo(0,0);
                },

                selectExhibit(exhibit) {
                    this.selectedExhibit = exhibit;
                    if (!this.selectedExhibit.activeReports) this.selectedExhibit.activeReports = [];
                    if (!this.selectedExhibit.techOverviewNote) this.selectedExhibit.techOverviewNote = '';
                    if (!this.selectedExhibit.exhibitImage) this.selectedExhibit.exhibitImage = null;
                    if (!this.selectedExhibit.techNotes) this.selectedExhibit.techNotes = '';
                    
                    this.currentView = 'exhibit';
                    this.issueText = '';
                    this.uploadedIssuePhotoBase64 = null;
                    this.pushHistoryState();
                    window.scrollTo(0,0);
                },

                goBack() {
                    if (this.currentView === 'exhibit') {
                        this.currentView = 'gallery';
                        this.selectedExhibit = null;
                    } else if (this.currentView === 'gallery') {
                        this.currentView = 'home';
                        this.selectedGallery = null;
                    }
                    this.pushHistoryState();
                },

                goHome() {
                    this.currentView = 'home';
                    this.selectedGallery = null;
                    this.selectedExhibit = null;
                    this.pushHistoryState();
                },

                galleries: [
                    { id: 1, name: "Arctic Journey", icon: "images/arctic.png", exhibits: [
                        { name: "entrance mosaic", status: "clear", techNotes: "Mosaic glass tiles cleaned and secured.", techOverviewNote: "", exhibitImage: "" },
                        { name: "drumming welcome", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "north pole (quiz game)", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "pingo (exterior/interior/furniture/tech)", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "fox/goose puzzles", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "tundra flyover video wall", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "tundra plants (field book RFID interactive)", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "plant microscope", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "caribou (graphic/display boxes/display objects)", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "fish river", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "tracking change", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "parka (material match RFID)", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "fabric samples microscope", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "stitching", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "parka doll models", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "crystals of the Arctic", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "object theater (furniture/objects/tech)", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "iceberger", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "iglu", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "under the ice (graphic wall/hydrophone)", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "sea ice video (next to storage room)", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "polar bear", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "Inukshuk & video kiosk", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "boreal forest (animals of the Arctic)", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "sled race", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "hunter on the ice", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "seal skin", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "arctic highway maps", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "general graphics concerns", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" },
                        { name: "miscellaneous issues", status: "clear", techNotes: "", techOverviewNote: "", exhibitImage: "" }
                    ]},
                    { id: 2, name: "Health Zone", icon: "images/health.png", exhibits: [
    { name: "coping skills", status: "clear", techNotes: "" },
    { name: "grip strength", status: "clear", techNotes: "" },
    { name: "bone density", status: "clear", techNotes: "" },
    { name: "stretch test", status: "clear", techNotes: "" },
    { name: "jump test", status: "clear", techNotes: "" },
    { name: "sit/stand test", status: "clear", techNotes: "" },
    { name: "balance test (with mirror)", status: "clear", techNotes: "" },
    { name: "heart your heartbeat", status: "clear", techNotes: "" },
    { name: "various vectors (wall with nose, bug, etc.)", status: "clear", techNotes: "" },
    { name: "air quality index (opposite vector wall)", status: "clear", techNotes: "" },
    { name: "coronavirus", status: "clear", techNotes: "" },
    { name: "glyco science", status: "clear", techNotes: "" },
    { name: "blood slides microscope", status: "clear", techNotes: "" },
    { name: "x-rays", status: "clear", techNotes: "" },
    { name: "wall mounted scope", status: "clear", techNotes: "" },
    { name: "pee rainbow", status: "clear", techNotes: "" },
    { name: "medicines wall", status: "clear", techNotes: "" },
    { name: "epidemics", status: "clear", techNotes: "" },
    { name: "personal space invaders (4 pucks)", status: "clear", techNotes: "" },
    { name: "microbiome", status: "clear", techNotes: "" },
    { name: "gene chain", status: "clear", techNotes: "" },
    { name: "lab", status: "clear", techNotes: "" },
    { name: "Micronutrients", status: "clear", techNotes: "" },
    { name: "general graphics concerns", status: "clear", techNotes: "" },
    { name: "miscellaneous issues", status: "clear", techNotes: "" }
]},
                    { id: 3, name: "CuriousCity", icon: "images/cc.png", exhibits: [
    { name: "ball machine", status: "clear", techNotes: "" },
    { name: "fort edmonton", status: "clear", techNotes: "" },
    { name: "valley bridge (curved wooden bridge)", status: "clear", techNotes: "" },
    { name: "observatory", status: "clear", techNotes: "" },
    { name: "high level bridge (with trolley and colored lights)", status: "clear", techNotes: "" },
    { name: "muttart", status: "clear", techNotes: "" },
    { name: "walterdale bridge", status: "clear", techNotes: "" },
    { name: "yeg tower", status: "clear", techNotes: "" },
    { name: "spiral staircase", status: "clear", techNotes: "" },
    { name: "nursing nook", status: "clear", techNotes: "" },
    { name: "water table (and support items, bibs, dryers, etc.)", status: "clear", techNotes: "" },
    { name: "foam blocks", status: "clear", techNotes: "" },
    { name: "luggage scanner", status: "clear", techNotes: "" },
    { name: "airplane", status: "clear", techNotes: "" },
    { name: "toddler area", status: "clear", techNotes: "" },
    { name: "fossil crawl (inside tunnel or tunnel itself)", status: "clear", techNotes: "" },
    { name: "benches", status: "clear", techNotes: "" },
    { name: "general graphics concerns", status: "clear", techNotes: "" },
    { name: "miscellaneous issues", status: "clear", techNotes: "" }
]},
                    { id: 4, name: "Science Garage", icon: "images/garage.png", exhibits: [
        { name: "vertical wind tunnels", status: "clear", techNotes: "" },
        { name: "design in action cabinet", status: "clear", techNotes: "" },
        { name: "maker space (steam engine)", status: "clear", techNotes: "" },
        { name: "rigmajig (wooden build pieces)", status: "clear", techNotes: "" },
        { name: "shake table", status: "clear", techNotes: "" },
        { name: "horizontal wind tunnels", status: "clear", techNotes: "" },
        { name: "marble roller coaster wall", status: "clear", techNotes: "" },
        { name: "race ramp", status: "clear", techNotes: "" },
        { name: "optical illusion wheels", status: "clear", techNotes: "" },
        { name: "carnival grip strength tester", status: "clear", techNotes: "" },
        { name: "spinning led blade", status: "clear", techNotes: "" },
        { name: "back of house storage", status: "clear", techNotes: "" },
        { name: "general graphics concerns", status: "clear", techNotes: "" },
        { name: "miscellaneous issues", status: "clear", techNotes: "" }
]},
                    { id: 5, name: "Nature Exchange", icon: "images/nex.png", exhibits: [
        { name: "bison", status: "clear", techNotes: "" },
        { name: "library reading area", status: "clear", techNotes: "" },
        { name: "bird song", status: "clear", techNotes: "" },
        { name: "camera trap", status: "clear", techNotes: "" },
        { name: "scat match", status: "clear", techNotes: "" },
        { name: "mineral match", status: "clear", techNotes: "" },
        { name: "microscopes", status: "clear", techNotes: "" },
        { name: "trading desk", status: "clear", techNotes: "" },
        { name: "animal care", status: "clear", techNotes: "" },
        { name: "specimen displays", status: "clear", techNotes: "" },
        { name: "artefact displays", status: "clear", techNotes: "" },
        { name: "animal enclosures", status: "clear", techNotes: "" },
        { name: "general graphics concerns", status: "clear", techNotes: "" },
        { name: "miscellaneous issues", status: "clear", techNotes: "" }
    ]},
             { id: 6, name: "Feature Exhibit Hall", icon: "images/feature.png", exhibits: [
        { name: "Smell Scavenger Hunt", status: "clear", techNotes: "" },
        { name: "Dog Models display", status: "clear", techNotes: "" },
        { name: "Dog Park (Programming Space)", status: "clear", techNotes: "" },
        { name: "Projector or Video Concerns", status: "clear", techNotes: "" },
        { name: "Archaeological Dig", status: "clear", techNotes: "" },
        { name: "Spot The Dog Fossils", status: "clear", techNotes: "" },
        { name: "Dog Photo Crowdsourcing (DogPix)", status: "clear", techNotes: "" },
        { name: "Train a Human (Clicker Training)", status: "clear", techNotes: "" },
        { name: "A Bone To Pick (voting station)", status: "clear", techNotes: "" },
        { name: "Dog Laws True/False", status: "clear", techNotes: "" },
        { name: "The Science of Cuteness", status: "clear", techNotes: "" },
        { name: "Dog Communication (Kinect with Dog Training)", status: "clear", techNotes: "" },
        { name: "Maze", status: "clear", techNotes: "" },
        { name: "Dog Jeopardy", status: "clear", techNotes: "" },
        { name: "Dog Sharing (Record a Video)", status: "clear", techNotes: "" },
        { name: "Guess That Dogs Job", status: "clear", techNotes: "" },
        { name: "Be A Dog Scientist", status: "clear", techNotes: "" },
        { name: "Hear Like a Dog (fuzzy dog ears)", status: "clear", techNotes: "" },
        { name: "Dog Ears (sound dishes)", status: "clear", techNotes: "" },
        { name: "Learn Like a Dog", status: "clear", techNotes: "" },
        { name: "Run Like a Dog", status: "clear", techNotes: "" },
        { name: "See Like a Dog", status: "clear", techNotes: "" },
        { name: "Smell Like a Dog", status: "clear", techNotes: "" },
        { name: "Why Do Dogs", status: "clear", techNotes: "" },
        { name: "Dog Parts Puzzle", status: "clear", techNotes: "" },
        { name: "X-Rays", status: "clear", techNotes: "" },
        { name: "Organ Models & Skulls", status: "clear", techNotes: "" },
        { name: "General Graphics Concerns", status: "clear", techNotes: "" },
        { name: "Other", status: "clear", techNotes: "" }
    ]},
                    { id: 7, name: "Space Gallery", icon: "images/space.png", exhibits: [
        { name: "gallery entrance element (8 spectrum led lights)", status: "clear", techNotes: "" }, { name: "magic planet", status: "clear", techNotes: "" }, 
        { name: "planet wall", status: "clear", techNotes: "" }, { name: "Sun video wall", status: "clear", techNotes: "" },
        { name: "Aurora room", status: "clear", techNotes: "" }, { name: "Moon rover", status: "clear", techNotes: "" },
        { name: "meteorites", status: "clear", techNotes: "" }, { name: "black hole finder", status: "clear", techNotes: "" },
        { name: "constellation tube", status: "clear", techNotes: "" }, { name: "videos of ISS/weightlessness", status: "clear", techNotes: "" },
        { name: "digital rocket builder", status: "clear", techNotes: "" }, { name: "rocket launcher", status: "clear", techNotes: "" },
        { name: "astronaut photo op", status: "clear", techNotes: "" }, { name: "Atari Lunar Lander", status: "clear", techNotes: "" },
        { name: "modern Lunar Lander", status: "clear", techNotes: "" }, { name: "gravity floor", status: "clear", techNotes: "" },
        { name: "command center (in gallery classroom)", status: "clear", techNotes: "" }, { name: "in gallery portal lights (7 hexagon light portals)", status: "clear", techNotes: "" },
        { name: "rocket launcher", status: "clear", techNotes: "" }, { name: "general graphics concerns", status: "clear", techNotes: "" }, { name: "miscellaneous issues", status: "clear", techNotes: "" }
    ]},
                    { id: 8, name: "Fundamentals", icon: "images/fund.png", exhibits: [
    { name: "Colored Shadows", status: "clear", techNotes: "" },
    { name: "Focal length (telescope)", status: "clear", techNotes: "" },
    { name: "Free Money", status: "clear", techNotes: "" },
    { name: "Fun House Mirrors - Horizontal Concave/Convex", status: "clear", techNotes: "" },
    { name: "Fun House Mirrors - Vertical Concave/Convex", status: "clear", techNotes: "" },
    { name: "Fun House Mirrors - Double Concave/Convex", status: "clear", techNotes: "" },
    { name: "Kaleidoscope", status: "clear", techNotes: "" },
    { name: "Laser Lenses", status: "clear", techNotes: "" },
    { name: "Laser Mirrors", status: "clear", techNotes: "" },
    { name: "Periscope", status: "clear", techNotes: "" },
    { name: "Alien Voices", status: "clear", techNotes: "" },
    { name: "Bell Jar", status: "clear", techNotes: "" },
    { name: "Delay Tubes", status: "clear", techNotes: "" },
    { name: "Double-Helix Wave Form", status: "clear", techNotes: "" },
    { name: "Pipe Drum", status: "clear", techNotes: "" },
    { name: "Resonance Organ", status: "clear", techNotes: "" },
    { name: "Ripple Tank", status: "clear", techNotes: "" },
    { name: "Slide Whistle", status: "clear", techNotes: "" },
    { name: "Standing Wave Motion", status: "clear", techNotes: "" },
    { name: "Wave Generator", status: "clear", techNotes: "" },
    { name: "Whisper Dishes", status: "clear", techNotes: "" },
    { name: "2D Magnetic Fields", status: "clear", techNotes: "" },
    { name: "3D Magnetic Fields", status: "clear", techNotes: "" },
    { name: "Bending Electron Beam", status: "clear", techNotes: "" },
    { name: "Earth's Magnetic Field", status: "clear", techNotes: "" },
    { name: "Electromagnetic Launcher", status: "clear", techNotes: "" },
    { name: "Electromagnetic Lifter", status: "clear", techNotes: "" },
    { name: "Magnetic Properties", status: "clear", techNotes: "" },
    { name: "Magnetic Field Lines", status: "clear", techNotes: "" },
    { name: "Motor/Generator Effect", status: "clear", techNotes: "" },
    { name: "Elliptical Table", status: "clear", techNotes: "" },
    { name: "Fractals", status: "clear", techNotes: "" },
    { name: "Gaussian Distribution", status: "clear", techNotes: "" },
    { name: "Harmonograph", status: "clear", techNotes: "" },
    { name: "Hyperbolic Slot", status: "clear", techNotes: "" },
    { name: "Mathematics Activity Table", status: "clear", techNotes: "" },
    { name: "Math in Nature", status: "clear", techNotes: "" },
    { name: "Powers of 10", status: "clear", techNotes: "" },
    { name: "Probabilities", status: "clear", techNotes: "" },
    { name: "Pythagorean Theorem", status: "clear", techNotes: "" },
    { name: "Electricity (pith balls)", status: "clear", techNotes: "" },
    { name: "Jacob's Ladder (High Voltage Arc)", status: "clear", techNotes: "" },
    { name: "Plasma Ball", status: "clear", techNotes: "" },
    { name: "Circuit table 1", status: "clear", techNotes: "" },
    { name: "Circuit table 2", status: "clear", techNotes: "" },
    { name: "Hand Crank", status: "clear", techNotes: "" },
    { name: "Bridge Builder 1", status: "clear", techNotes: "" },
    { name: "Bridge Builder 2", status: "clear", techNotes: "" },
    { name: "Floppy Box", status: "clear", techNotes: "" },
    { name: "Catenary Arch", status: "clear", techNotes: "" },
    { name: "Shake table", status: "clear", techNotes: "" },
    { name: "general graphics concerns", status: "clear", techNotes: "" },
    { name: "miscellaneous issues", status: "clear", techNotes: "" }
]},
                  { id: 9, name: "Brain Teasers", icon: "images/brain.png", exhibits: [
    { name: "12 On One", status: "clear", techNotes: "" },
    { name: "15's the Number", status: "clear", techNotes: "" },
    { name: "15 - 6 = 10", status: "clear", techNotes: "" },
    { name: "18's the Number", status: "clear", techNotes: "" },
    { name: "A Conic Move", status: "clear", techNotes: "" },
    { name: "A Perfect Fit", status: "clear", techNotes: "" },
    { name: "A Perfect Square", status: "clear", techNotes: "" },
    { name: "Ball Pyramid", status: "clear", techNotes: "" },
    { name: "Build a Pyramid", status: "clear", techNotes: "" },
    { name: "Eight from Six", status: "clear", techNotes: "" },
    { name: "Five Room House", status: "clear", techNotes: "" },
    { name: "Jumping Sticks", status: "clear", techNotes: "" },
    { name: "Loop to Loop", status: "clear", techNotes: "" },
    { name: "Out of Order", status: "clear", techNotes: "" },
    { name: "Remove the Ring", status: "clear", techNotes: "" },
    { name: "Tangram", status: "clear", techNotes: "" },
    { name: "general graphics concerns", status: "clear", techNotes: "" },
    { name: "miscellaneous issues", status: "clear", techNotes: "" }
]},
                    { id: 10, name: "Miscellaneous", icon: "images/misc.png", exhibits: [
                        { name: "Imaginarium Theater", status: "clear", techNotes: "" },
                    ]}
                ]
            }
        }