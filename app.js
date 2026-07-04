        function appState() {
            return {
                isLoggedIn: false,
                selectedProfile: '',
                password: '',
                error: '',
		reporterName: '',
                currentView: 'home',
                currentProfile: 'gallerystaff',
                selectedGallery: null,
                selectedExhibit: null,
                issueText: '',
                uploadedIssuePhotos: [],
                lightboxOpen: false,
                lightboxImage: '',
		isRotating: false,
		technicians: [
        { name: 'Tristan', img: 'images/face1.png' },
        { name: 'Steve', img: 'images/face3.png' },
        { name: 'Jim', img: 'images/face2.png' }
    ],
		schedule: {
    weekly: [
        { id: 1, assignedTo: 'Tristan', task: 'Swab the Deck', checked: false, lastChecked: null, lastPerformedBy: null },
        { id: 2, assignedTo: 'Jim', task: 'Sanitize Touchscreens', checked: false, lastChecked: null, lastPerformedBy: null },
        { id: 3, assignedTo: 'Steve', task: 'Check Floor Cable Covers', checked: false, lastChecked: null, lastPerformedBy: null }
    ],
    monthly: [
        { id: 4, assignedTo: 'Tristan', task: 'Deep Clean Water Table', checked: false, lastChecked: null, lastPerformedBy: null },
        { id: 5, assignedTo: 'Jim', task: 'HVAC Filter Inspection', checked: false, lastChecked: null, lastPerformedBy: null },
        { id: 6, assignedTo: 'Steve', task: 'Sensor Calibration Check', checked: false, lastChecked: null, lastPerformedBy: null }
    ],
    yearly: [
        { id: 7, assignedTo: 'Tristan', task: 'Full Facility Safety Audit', checked: false, lastChecked: null, lastPerformedBy: null },
        { id: 8, assignedTo: 'Jim', task: 'Structural Inspection', checked: false, lastChecked: null, lastPerformedBy: null },
        { id: 9, assignedTo: 'Steve', task: 'Equipment Refurbishment', checked: false, lastChecked: null, lastPerformedBy: null }
    ]
},

setView(view) {
            this.currentView = view;
        },

spinWheel() {
    if (this.isRotating) return;
    
    this.isRotating = true;
    
    setTimeout(() => {
        // Change: Remove the first item and add it to the end
        const first = this.technicians.shift();
        this.technicians.push(first);
        
        this.isRotating = false;
    }, 3000);
},

getPositionClass(index) {
    const positions = [
        'top-[10%] left-[38%]',    // Position 0
        'bottom-[15%] right-[15%]', // Position 1
        'bottom-[15%] left-[15%]'   // Position 2
    ];
    return positions[index];
},

toggleTask(task) {
    task.checked = !task.checked;
    
    if (task.checked) {
        task.lastChecked = new Date().toISOString();
        task.lastPerformedBy = task.assignedTo; // Track who did it
        
        // Rotate current assignment for next time
        let currentIndex = this.technicians.indexOf(task.assignedTo);
        task.assignedTo = this.technicians[(currentIndex + 1) % this.technicians.length];
    } else {
        // If unchecking, you might want to revert the assignment logic
        task.lastChecked = null;
        task.lastPerformedBy = null;
    }
},
getSortedTasks(list) {
    return [...list].sort((a, b) => {
        if (a.checked !== b.checked) return a.checked - b.checked;
        if (a.checked && b.checked) {
            return new Date(a.lastChecked).getTime() - new Date(b.lastChecked).getTime();
        }
        return 0;
    });
},
resetTasks(list) {
    list.forEach(item => {
        item.checked = false;
        item.lastChecked = null;
	item.lastPerformedBy = null;
    });
},

                // Custom Router Sync Framework
               init() {
    // Seed the initial history endpoint data state layout
    if (!window.history.state) {
        window.history.replaceState({ view: 'home', galleryId: null, exhibitName: null }, '', '');
    }
},
login() {
    if (this.selectedProfile === 'gallery') {
        this.isLoggedIn = true;
        this.currentProfile = 'gallerystaff'; 
    } else if (this.selectedProfile === 'technician') {
        if (this.password === 'twose') {
            this.isLoggedIn = true;
            this.currentProfile = 'technician';
        } else {
            this.error = 'Incorrect password.';
        }
    } else {
        this.error = 'Please select a role.';
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

               getGalleryStatusList(gallery) {
    const problems = gallery.exhibits.filter(e => e.status === 'problem').length;
    const maintenance = gallery.exhibits.filter(e => e.status === 'working').length;
    
    let statuses = [];
    
    if (problems > 0) {
        statuses.push({ type: 'problem', count: problems });
    }
    if (maintenance > 0) {
        statuses.push({ type: 'working', count: maintenance });
    }
    
    return statuses;
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
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.uploadedIssuePhotos.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
    }
},

                saveNotesLocal() {},

                submitIssue() {
    if(!this.selectedExhibit) return;

const newReport = {
        text: this.issueText,
        photos: [...this.uploadedIssuePhotos], // Store multiple photos
        reporterName: this.reporterName,
        reportDate: new Date().toLocaleDateString(),
        timestamp: new Date().toLocaleString()
    };

    if (!this.selectedExhibit.activeReports) {
        this.selectedExhibit.activeReports = [];
    }

    this.selectedExhibit.activeReports.push(newReport);
    this.selectedExhibit.status = 'problem';
    
    // Reset fields
    this.issueText = '';
    this.reporterName = ''; // Reset
    this.uploadedIssuePhotos = [];
},

                resolveIssue(index) {
    if (!this.selectedExhibit || !this.selectedExhibit.activeReports) return;
    
    // Initialize deletedReports if it doesn't exist
    if (!this.selectedExhibit.deletedReports) this.selectedExhibit.deletedReports = [];
    
    // Move the report to history
    const removed = this.selectedExhibit.activeReports.splice(index, 1);
    this.selectedExhibit.deletedReports.push({
        ...removed[0],
        resolvedAt: new Date().toLocaleString()
    });
    
    // Update status if no active reports remain
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
                        { name: "entrance mosaic", status: "clear", heroImage: "images/exhibits/arctic/mosaic.jpg" },
    { name: "drumming welcome", status: "clear", heroImage: "images/exhibits/arctic/drumming.jpg" },
    { name: "north pole (quiz game)", status: "clear", heroImage: "images/exhibits/arctic/northpole.jpg" },
    { name: "pingo (exterior/interior/ furniture/tech)", status: "clear", heroImage: "images/exhibits/arctic/pingo.jpg" },
    { name: "fox/goose puzzles", status: "clear", heroImage: "images/exhibits/arctic/foxgoose.jpg" },
    { name: "tundra flyover video wall", status: "clear", heroImage: "images/exhibits/arctic/tundravideo.jpg" },
    { name: "tundra plants (field book RFID interactive)", status: "clear", heroImage: "images/exhibits/arctic/tundraplants.jpg" },
    { name: "plant microscope", status: "clear", heroImage: "images/exhibits/arctic/plantmicro.jpg" },
    { name: "caribou (graphic/display boxes/display objects)", status: "clear", heroImage: "images/exhibits/arctic/caribou.jpg" },
    { name: "fish river", status: "clear", heroImage: "images/exhibits/arctic/fishriver.jpg" },
    { name: "tracking change", status: "clear", heroImage: "images/exhibits/arctic/tracking.jpg" },
    { name: "parka (material match RFID)", status: "clear", heroImage: "images/exhibits/arctic/parka.jpg" },
    { name: "fabric samples microscope", status: "clear", heroImage: "images/exhibits/arctic/fabricmicro.jpg" },
    { name: "stitching", status: "clear", heroImage: "images/exhibits/arctic/stitching.jpg" },
    { name: "parka doll models", status: "clear", heroImage: "images/exhibits/arctic/parkadolls.jpg" },
    { name: "crystals of the Arctic", status: "clear", heroImage: "images/exhibits/arctic/crystals.jpg" },
    { name: "object theater (furniture/objects/tech)", status: "clear", heroImage: "images/exhibits/arctic/theater.jpg" },
    { name: "iceberger", status: "clear", heroImage: "images/exhibits/arctic/iceberger.jpg" },
    { name: "iglu", status: "clear", heroImage: "images/exhibits/arctic/iglu.jpg" },
    { name: "under the ice (graphic wall/hydrophone)", status: "clear", heroImage: "images/exhibits/arctic/undertheice.jpg" },
    { name: "sea ice video (next to storage room)", status: "clear", heroImage: "images/exhibits/arctic/seaice.jpg" },
    { name: "polar bear", status: "clear", heroImage: "images/exhibits/arctic/polarbear.jpg" },
    { name: "Inukshuk & video kiosk", status: "clear", heroImage: "images/exhibits/arctic/inukshuk.jpg" },
    { name: "boreal forest (animals of the Arctic)", status: "clear", heroImage: "images/exhibits/arctic/boreal.jpg" },
    { name: "sled race", status: "clear", heroImage: "images/exhibits/arctic/sledrace.jpg" },
    { name: "hunter on the ice", status: "clear", heroImage: "images/exhibits/arctic/hunter.jpg" },
    { name: "seal skin", status: "clear", heroImage: "images/exhibits/arctic/sealskin.jpg" },
    { name: "arctic highway maps", status: "clear", heroImage: "images/exhibits/arctic/maps.jpg" },
    { name: "general graphics concerns", status: "clear", heroImage: "images/exhibits/graphic.png" },
    { name: "miscellaneous issues", status: "clear", heroImage: "images/exhibits/misc.png" }
                    ]},
                    { id: 2, name: "Health Zone", icon: "images/health.png", exhibits: [
    { name: "coping skills", status: "clear", heroImage: "images/exhibits/health/coping.jpg" },
    { name: "grip strength", status: "clear", heroImage: "images/exhibits/health/grip.jpg" },
    { name: "bone density", status: "clear", heroImage: "images/exhibits/health/bone.jpg" },
    { name: "stretch test", status: "clear", heroImage: "images/exhibits/health/stretch.jpg" },
    { name: "jump test", status: "clear", heroImage: "images/exhibits/health/jump.jpg" },
    { name: "sit/stand test", status: "clear", heroImage: "images/exhibits/health/sitstand.jpg" },
    { name: "balance test (with mirror)", status: "clear", heroImage: "images/exhibits/health/balance.jpg" },
    { name: "hear your heartbeat", status: "clear", heroImage: "images/exhibits/health/heart.jpg" },
    { name: "various vectors (wall with nose, bug, etc.)", status: "clear", heroImage: "images/exhibits/health/vectors.jpg" },
    { name: "air quality index (opposite vector wall)", status: "clear", heroImage: "images/exhibits/health/airquality.jpg" },
    { name: "coronavirus", status: "clear", heroImage: "images/exhibits/health/virus.jpg" },
    { name: "glyco science", status: "clear", heroImage: "images/exhibits/health/glyco.jpg" },
    { name: "blood slides microscope", status: "clear", heroImage: "images/exhibits/health/microscope.jpg" },
    { name: "x-rays", status: "clear", heroImage: "images/exhibits/health/xray.jpg" },
    { name: "wall mounted scope", status: "clear", heroImage: "images/exhibits/health/scope.jpg" },
    { name: "pee rainbow", status: "clear", heroImage: "images/exhibits/health/pee.jpg" },
    { name: "medicines wall", status: "clear", heroImage: "images/exhibits/health/medicine.jpg" },
    { name: "epidemics", status: "clear", heroImage: "images/exhibits/health/epidemics.jpg" },
    { name: "personal space invaders (4 pucks)", status: "clear", heroImage: "images/exhibits/health/space.jpg" },
    { name: "microbiome", status: "clear", heroImage: "images/exhibits/health/microbiome.jpg" },
    { name: "gene chain", status: "clear", heroImage: "images/exhibits/health/gene.jpg" },
    { name: "lab", status: "clear", heroImage: "images/exhibits/health/lab.jpg" },
    { name: "Micronutrients", status: "clear", heroImage: "images/exhibits/health/nutrients.jpg" },
    { name: "general graphics concerns", status: "clear", heroImage: "images/exhibits/graphic.png" },
    { name: "miscellaneous issues", status: "clear", heroImage: "images/exhibits/misc.png" }
]},
                    { id: 3, name: "CuriousCity", icon: "images/cc.png", exhibits: [
    { name: "ball machine", status: "clear", heroImage: "images/exhibits/cc/ballmachine.jpg" },
    { name: "fort edmonton", status: "clear", heroImage: "images/exhibits/cc/fort.jpg" },
    { name: "valley bridge (curved wooden bridge)", status: "clear", heroImage: "images/exhibits/cc/valleybridge.jpg" },
    { name: "observatory", status: "clear", heroImage: "images/exhibits/cc/observatory.jpg" },
    { name: "high level bridge (with trolley and colored lights)", status: "clear", heroImage: "images/exhibits/cc/highlevel.jpg" },
    { name: "muttart", status: "clear", heroImage: "images/exhibits/cc/muttart.jpg" },
    { name: "walterdale bridge", status: "clear", heroImage: "images/exhibits/cc/walterdale.jpg" },
    { name: "yeg tower", status: "clear", heroImage: "images/exhibits/cc/yegtower.jpg" },
    { name: "spiral staircase", status: "clear", heroImage: "images/exhibits/cc/spiralstair.jpg" },
    { name: "nursing nook", status: "clear", heroImage: "images/exhibits/cc/nursing.jpg" },
    { name: "water table (and support items, bibs, dryers, etc.)", status: "clear", heroImage: "images/exhibits/cc/watertable.jpg" },
    { name: "foam blocks", status: "clear", heroImage: "images/exhibits/cc/foamblocks.jpg" },
    { name: "luggage scanner", status: "clear", heroImage: "images/exhibits/cc/scanner.jpg" },
    { name: "airplane", status: "clear", heroImage: "images/exhibits/cc/airplane.jpg" },
    { name: "toddler area", status: "clear", heroImage: "images/exhibits/cc/toddler.jpg" },
    { name: "fossil crawl (inside tunnel or tunnel itself)", status: "clear", heroImage: "images/exhibits/cc/fossilcrawl.jpg" },
    { name: "benches", status: "clear", heroImage: "images/exhibits/cc/benches.jpg" },
    { name: "general graphics concerns", status: "clear", heroImage: "images/exhibits/graphic.png" },
    { name: "miscellaneous issues", status: "clear", heroImage: "images/exhibits/misc.png" }
]},
                    { id: 4, name: "Science Garage", icon: "images/garage.png", exhibits: [
    { name: "vertical wind tunnels", status: "clear", heroImage: "images/exhibits/garage/v-windtunnel.jpg" },
    { name: "design in action cabinet", status: "clear", heroImage: "images/exhibits/garage/cabinet.jpg" },
    { name: "maker space (steam engine)", status: "clear", heroImage: "images/exhibits/garage/steamengine.jpg" },
    { name: "rigmajig (wooden build pieces)", status: "clear", heroImage: "images/exhibits/garage/rigmajig.jpg" },
    { name: "shake table", status: "clear", heroImage: "images/exhibits/garage/shaketable.jpg" },
    { name: "horizontal wind tunnels", status: "clear", heroImage: "images/exhibits/garage/h-windtunnel.jpg" },
    { name: "marble roller coaster wall", status: "clear", heroImage: "images/exhibits/garage/coaster.jpg" },
    { name: "race ramp", status: "clear", heroImage: "images/exhibits/garage/raceramp.jpg" },
    { name: "optical illusion wheels", status: "clear", heroImage: "images/exhibits/garage/wheels.jpg" },
    { name: "carnival grip strength tester", status: "clear", heroImage: "images/exhibits/garage/grip.jpg" },
    { name: "spinning led blade", status: "clear", heroImage: "images/exhibits/garage/ledblade.jpg" },
    { name: "back of house storage", status: "clear", heroImage: "images/exhibits/garage/storage.jpg" },
    { name: "general graphics concerns", status: "clear", heroImage: "images/exhibits/graphic.png" },
    { name: "miscellaneous issues", status: "clear", heroImage: "images/exhibits/misc.png" }
]},
                    { id: 5, name: "Nature Exchange", icon: "images/nex.png", exhibits: [
    { name: "bison", status: "clear", heroImage: "images/exhibits/nex/bison.jpg" },
    { name: "library reading area", status: "clear", heroImage: "images/exhibits/nex/library.jpg" },
    { name: "bird song", status: "clear", heroImage: "images/exhibits/nex/birdsong.jpg" },
    { name: "camera trap", status: "clear", heroImage: "images/exhibits/nex/cameratrap.jpg" },
    { name: "scat match", status: "clear", heroImage: "images/exhibits/nex/scat.jpg" },
    { name: "mineral match", status: "clear", heroImage: "images/exhibits/nex/mineral.jpg" },
    { name: "microscopes", status: "clear", heroImage: "images/exhibits/nex/microscopes.jpg" },
    { name: "trading desk", status: "clear", heroImage: "images/exhibits/nex/trading.jpg" },
    { name: "animal care", status: "clear", heroImage: "images/exhibits/nex/animalcare.jpg" },
    { name: "specimen displays", status: "clear", heroImage: "images/exhibits/nex/specimen.jpg" },
    { name: "artefact displays", status: "clear", heroImage: "images/exhibits/nex/artefact.jpg" },
    { name: "animal enclosures", status: "clear", heroImage: "images/exhibits/nex/enclosures.jpg" },
    { name: "general graphics concerns", status: "clear", heroImage: "images/exhibits/graphic.png" },
    { name: "miscellaneous issues", status: "clear", heroImage: "images/exhibits/misc.png" }
]},
             { id: 6, name: "Feature Exhibit", icon: "images/feature.png", exhibits: [
    { name: "Smell Scavenger Hunt", status: "clear", heroImage: "images/exhibits/feature/smell.jpg" },
    { name: "Dog Models display", status: "clear", heroImage: "images/exhibits/feature/dogmodels.jpg" },
    { name: "Dog Park (Programming Space)", status: "clear", heroImage: "images/exhibits/feature/dogpark.jpg" },
    { name: "Projector or Video Concerns", status: "clear", heroImage: "images/exhibits/feature/video.jpg" },
    { name: "Archaeological Dig", status: "clear", heroImage: "images/exhibits/feature/archaeo.jpg" },
    { name: "Spot The Dog Fossils", status: "clear", heroImage: "images/exhibits/feature/fossils.jpg" },
    { name: "Dog Photo Crowdsourcing (DogPix)", status: "clear", heroImage: "images/exhibits/feature/dogpix.jpg" },
    { name: "Train a Human (Clicker Training)", status: "clear", heroImage: "images/exhibits/feature/clicker.jpg" },
    { name: "A Bone To Pick (voting station)", status: "clear", heroImage: "images/exhibits/feature/bone.jpg" },
    { name: "Dog Laws True/False", status: "clear", heroImage: "images/exhibits/feature/doglaws.jpg" },
    { name: "The Science of Cuteness", status: "clear", heroImage: "images/exhibits/feature/cuteness.jpg" },
    { name: "Dog Communication (Kinect with Dog Training)", status: "clear", heroImage: "images/exhibits/feature/kinect.jpg" },
    { name: "Maze", status: "clear", heroImage: "images/exhibits/feature/maze.jpg" },
    { name: "Dog Jeopardy", status: "clear", heroImage: "images/exhibits/feature/jeopardy.jpg" },
    { name: "Dog Sharing (Record a Video)", status: "clear", heroImage: "images/exhibits/feature/sharing.jpg" },
    { name: "Guess That Dogs Job", status: "clear", heroImage: "images/exhibits/feature/job.jpg" },
    { name: "Be A Dog Scientist", status: "clear", heroImage: "images/exhibits/feature/scientist.jpg" },
    { name: "Hear Like a Dog (fuzzy dog ears)", status: "clear", heroImage: "images/exhibits/feature/ears.jpg" },
    { name: "Dog Ears (sound dishes)", status: "clear", heroImage: "images/exhibits/feature/dishes.jpg" },
    { name: "Learn Like a Dog", status: "clear", heroImage: "images/exhibits/feature/learn.jpg" },
    { name: "Run Like a Dog", status: "clear", heroImage: "images/exhibits/feature/run.jpg" },
    { name: "See Like a Dog", status: "clear", heroImage: "images/exhibits/feature/see.jpg" },
    { name: "Smell Like a Dog", status: "clear", heroImage: "images/exhibits/feature/smell-dog.jpg" },
    { name: "Why Do Dogs", status: "clear", heroImage: "images/exhibits/feature/whydogs.jpg" },
    { name: "Dog Parts Puzzle", status: "clear", heroImage: "images/exhibits/feature/puzzle.jpg" },
    { name: "X-Rays", status: "clear", heroImage: "images/exhibits/feature/xray.jpg" },
    { name: "Organ Models & Skulls", status: "clear", heroImage: "images/exhibits/feature/organs.jpg" },
    { name: "General Graphics Concerns", status: "clear", heroImage: "images/exhibits/graphic.png" },
    { name: "Other", status: "clear", heroImage: "images/exhibits/misc.png" }
    ]},
                    { id: 7, name: "Space Gallery", icon: "images/space.png", exhibits: [
    { name: "gallery entrance element (8 spectrum led lights)", status: "clear", heroImage: "images/exhibits/space/leds.jpg" },
    { name: "magic planet", status: "clear", heroImage: "images/exhibits/space/magicplanet.jpg" },
    { name: "planet wall", status: "clear", heroImage: "images/exhibits/space/planetwall.jpg" },
    { name: "Sun video wall", status: "clear", heroImage: "images/exhibits/space/sun.jpg" },
    { name: "Aurora room", status: "clear", heroImage: "images/exhibits/space/aurora.jpg" },
    { name: "Moon rover", status: "clear", heroImage: "images/exhibits/space/rover.jpg" },
    { name: "meteorites", status: "clear", heroImage: "images/exhibits/space/meteorites.jpg" },
    { name: "black hole finder", status: "clear", heroImage: "images/exhibits/space/blackhole.jpg" },
    { name: "constellation tube", status: "clear", heroImage: "images/exhibits/space/constellation.jpg" },
    { name: "videos of ISS/weightlessness", status: "clear", heroImage: "images/exhibits/space/iss.jpg" },
    { name: "digital rocket builder", status: "clear", heroImage: "images/exhibits/space/rocketbuilder.jpg" },
    { name: "rocket launcher", status: "clear", heroImage: "images/exhibits/space/launcher.jpg" },
    { name: "astronaut photo op", status: "clear", heroImage: "images/exhibits/space/photoop.jpg" },
    { name: "Atari Lunar Lander", status: "clear", heroImage: "images/exhibits/space/atari.jpg" },
    { name: "modern Lunar Lander", status: "clear", heroImage: "images/exhibits/space/modernlander.jpg" },
    { name: "gravity floor", status: "clear", heroImage: "images/exhibits/space/gravity.jpg" },
    { name: "command center (in gallery classroom)", status: "clear", heroImage: "images/exhibits/space/command.jpg" },
    { name: "in gallery portal lights (7 hexagon light portals)", status: "clear", heroImage: "images/exhibits/space/portals.jpg" },
    { name: "general graphics concerns", status: "clear", heroImage: "images/exhibits/graphic.png" },
    { name: "miscellaneous issues", status: "clear", heroImage: "images/exhibits/misc.png" }
    ]},
                    { id: 8, name: "Fundamentals", icon: "images/fund.png", exhibits: [
    { name: "Colored Shadows", status: "clear", heroImage: "images/exhibits/fundamentals/shadows.jpg" },
    { name: "Focal length (telescope)", status: "clear", heroImage: "images/exhibits/fundamentals/focal.jpg" },
    { name: "Free Money", status: "clear", heroImage: "images/exhibits/fundamentals/money.jpg" },
    { name: "Fun House Mirrors - Horizontal Concave/Convex", status: "clear", heroImage: "images/exhibits/fundamentals/mirror-h.jpg" },
    { name: "Fun House Mirrors - Vertical Concave/Convex", status: "clear", heroImage: "images/exhibits/fundamentals/mirror-v.jpg" },
    { name: "Fun House Mirrors - Double Concave/Convex", status: "clear", heroImage: "images/exhibits/fundamentals/mirror-d.jpg" },
    { name: "Kaleidoscope", status: "clear", heroImage: "images/exhibits/fundamentals/kaleido.jpg" },
    { name: "Laser Lenses", status: "clear", heroImage: "images/exhibits/fundamentals/laser-l.jpg" },
    { name: "Laser Mirrors", status: "clear", heroImage: "images/exhibits/fundamentals/laser-m.jpg" },
    { name: "Periscope", status: "clear", heroImage: "images/exhibits/fundamentals/periscope.jpg" },
    { name: "Alien Voices", status: "clear", heroImage: "images/exhibits/fundamentals/alien.jpg" },
    { name: "Bell Jar", status: "clear", heroImage: "images/exhibits/fundamentals/belljar.jpg" },
    { name: "Delay Tubes", status: "clear", heroImage: "images/exhibits/fundamentals/delay.jpg" },
    { name: "Double-Helix Wave Form", status: "clear", heroImage: "images/exhibits/fundamentals/helix.jpg" },
    { name: "Pipe Drum", status: "clear", heroImage: "images/exhibits/fundamentals/pipe.jpg" },
    { name: "Resonance Organ", status: "clear", heroImage: "images/exhibits/fundamentals/organ.jpg" },
    { name: "Ripple Tank", status: "clear", heroImage: "images/exhibits/fundamentals/ripple.jpg" },
    { name: "Slide Whistle", status: "clear", heroImage: "images/exhibits/fundamentals/whistle.jpg" },
    { name: "Standing Wave Motion", status: "clear", heroImage: "images/exhibits/fundamentals/wave-s.jpg" },
    { name: "Wave Generator", status: "clear", heroImage: "images/exhibits/fundamentals/wave-g.jpg" },
    { name: "Whisper Dishes", status: "clear", heroImage: "images/exhibits/fundamentals/whisper.jpg" },
    { name: "2D Magnetic Fields", status: "clear", heroImage: "images/exhibits/fundamentals/mag-2d.jpg" },
    { name: "3D Magnetic Fields", status: "clear", heroImage: "images/exhibits/fundamentals/mag-3d.jpg" },
    { name: "Bending Electron Beam", status: "clear", heroImage: "images/exhibits/fundamentals/electron.jpg" },
    { name: "Earth's Magnetic Field", status: "clear", heroImage: "images/exhibits/fundamentals/earth-mag.jpg" },
    { name: "Electromagnetic Launcher", status: "clear", heroImage: "images/exhibits/fundamentals/launcher.jpg" },
    { name: "Electromagnetic Lifter", status: "clear", heroImage: "images/exhibits/fundamentals/lifter.jpg" },
    { name: "Magnetic Properties", status: "clear", heroImage: "images/exhibits/fundamentals/mag-prop.jpg" },
    { name: "Magnetic Field Lines", status: "clear", heroImage: "images/exhibits/fundamentals/mag-lines.jpg" },
    { name: "Motor/Generator Effect", status: "clear", heroImage: "images/exhibits/fundamentals/motor.jpg" },
    { name: "Elliptical Table", status: "clear", heroImage: "images/exhibits/fundamentals/ellipse.jpg" },
    { name: "Fractals", status: "clear", heroImage: "images/exhibits/fundamentals/fractal.jpg" },
    { name: "Gaussian Distribution", status: "clear", heroImage: "images/exhibits/fundamentals/gauss.jpg" },
    { name: "Harmonograph", status: "clear", heroImage: "images/exhibits/fundamentals/harmono.jpg" },
    { name: "Hyperbolic Slot", status: "clear", heroImage: "images/exhibits/fundamentals/hyper.jpg" },
    { name: "Mathematics Activity Table", status: "clear", heroImage: "images/exhibits/fundamentals/math-table.jpg" },
    { name: "Math in Nature", status: "clear", heroImage: "images/exhibits/fundamentals/math-nature.jpg" },
    { name: "Powers of 10", status: "clear", heroImage: "images/exhibits/fundamentals/powers.jpg" },
    { name: "Probabilities", status: "clear", heroImage: "images/exhibits/fundamentals/prob.jpg" },
    { name: "Pythagorean Theorem", status: "clear", heroImage: "images/exhibits/fundamentals/pythag.jpg" },
    { name: "Electricity (pith balls)", status: "clear", heroImage: "images/exhibits/fundamentals/pith.jpg" },
    { name: "Jacob's Ladder (High Voltage Arc)", status: "clear", heroImage: "images/exhibits/fundamentals/ladder.jpg" },
    { name: "Plasma Ball", status: "clear", heroImage: "images/exhibits/fundamentals/plasma.jpg" },
    { name: "Circuit table 1", status: "clear", heroImage: "images/exhibits/fundamentals/circuit-1.jpg" },
    { name: "Circuit table 2", status: "clear", heroImage: "images/exhibits/fundamentals/circuit-2.jpg" },
    { name: "Hand Crank", status: "clear", heroImage: "images/exhibits/fundamentals/crank.jpg" },
    { name: "Bridge Builder 1", status: "clear", heroImage: "images/exhibits/fundamentals/bridge-1.jpg" },
    { name: "Bridge Builder 2", status: "clear", heroImage: "images/exhibits/fundamentals/bridge-2.jpg" },
    { name: "Floppy Box", status: "clear", heroImage: "images/exhibits/fundamentals/floppy.jpg" },
    { name: "Catenary Arch", status: "clear", heroImage: "images/exhibits/fundamentals/arch.jpg" },
    { name: "Shake table", status: "clear", heroImage: "images/exhibits/fundamentals/shake.jpg" },
    { name: "general graphics concerns", status: "clear", heroImage: "images/exhibits/graphic.png" },
    { name: "miscellaneous issues", status: "clear", heroImage: "images/exhibits/misc.png" }
]},
                  { id: 9, name: "Brain Teasers", icon: "images/brain.png", exhibits: [
    { name: "12 On One", status: "clear", heroImage: "images/exhibits/brain/12on1.jpg" },
    { name: "15's the Number", status: "clear", heroImage: "images/exhibits/brain/15num.jpg" },
    { name: "15 - 6 = 10", status: "clear", heroImage: "images/exhibits/brain/15-6.jpg" },
    { name: "18's the Number", status: "clear", heroImage: "images/exhibits/brain/18num.jpg" },
    { name: "A Conic Move", status: "clear", heroImage: "images/exhibits/brain/conic.jpg" },
    { name: "A Perfect Fit", status: "clear", heroImage: "images/exhibits/brain/fit.jpg" },
    { name: "A Perfect Square", status: "clear", heroImage: "images/exhibits/brain/square.jpg" },
    { name: "Ball Pyramid", status: "clear", heroImage: "images/exhibits/brain/pyramid.jpg" },
    { name: "Build a Pyramid", status: "clear", heroImage: "images/exhibits/brain/build-pyr.jpg" },
    { name: "Eight from Six", status: "clear", heroImage: "images/exhibits/brain/8from6.jpg" },
    { name: "Five Room House", status: "clear", heroImage: "images/exhibits/brain/5room.jpg" },
    { name: "Jumping Sticks", status: "clear", heroImage: "images/exhibits/brain/sticks.jpg" },
    { name: "Loop to Loop", status: "clear", heroImage: "images/exhibits/brain/loop.jpg" },
    { name: "Out of Order", status: "clear", heroImage: "images/exhibits/brain/order.jpg" },
    { name: "Remove the Ring", status: "clear", heroImage: "images/exhibits/brain/ring.jpg" },
    { name: "Tangram", status: "clear", heroImage: "images/exhibits/brain/tangram.jpg" },
    { name: "general graphics concerns", status: "clear", heroImage: "images/exhibits/graphic.png" },
    { name: "miscellaneous issues", status: "clear", heroImage: "images/exhibits/misc.png" }
]},
                    { id: 10, name: "Miscellaneous", icon: "images/misc.png", exhibits: [
                        { name: "Imaginarium Theater", status: "clear", heroimage: "images/exhibits/imagine.png" },
                    ]}
                ]
            }
        }