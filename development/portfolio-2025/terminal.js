class Portfolio {
    constructor() {
        this.currentPath = '/home/trevor';
        this.commandHistory = [];
        this.historyIndex = -1;
        this.fileSystem = {
            '/home/trevor': {
                type: 'directory',
                contents: {
                    'about.txt': { type: 'file', content: this.getAboutContent() },
                    'skills.json': { type: 'file', content: this.getSkillsContent() },
                    'experience.md': { type: 'file', content: this.getExperienceContent() },
                    'contact.vcard': { type: 'file', content: this.getContactContent() },
                    'projects': {
                        type: 'directory',
                        contents: {
                            'README.md': { type: 'file', content: this.getProjectsContent() },
                            'portfolio-website': { type: 'directory', contents: {} },
                            'awesome-app.js': { type: 'file', content: '// Cool JavaScript project\nconsole.log("Hello, World!");' },
                            'data-viz.py': { type: 'file', content: '# Python data visualization\nimport matplotlib.pyplot as plt' },
                            'mobile-app.swift': { type: 'file', content: '// iOS app development\nimport UIKit' }
                        }
                    },
                    'education': {
                        type: 'directory',
                        contents: {
                            'degree.txt': { type: 'file', content: this.getEducationContent() },
                            'certifications.json': { type: 'file', content: this.getCertificationsContent() }
                        }
                    },
                    '.secrets': {
                        type: 'directory',
                        contents: {
                            'favorite_coffee.txt': { type: 'file', content: 'Colombian dark roast ☕' },
                            'hidden_talent.txt': { type: 'file', content: 'I can solve a Rubik\'s cube in under 2 minutes! 🧩' }
                        }
                    }
                }
            }
        };
        
        this.commands = {
            'help': this.helpCommand.bind(this),
            'ls': this.lsCommand.bind(this),
            'cat': this.catCommand.bind(this),
            'cd': this.cdCommand.bind(this),
            'pwd': this.pwdCommand.bind(this),
            'clear': this.clearCommand.bind(this),
            'whoami': this.whoamiCommand.bind(this),
            'date': this.dateCommand.bind(this),
            'history': this.historyCommand.bind(this),
            'echo': this.echoCommand.bind(this),
            'skills': this.skillsCommand.bind(this),
            'projects': this.projectsCommand.bind(this),
            'contact': this.contactCommand.bind(this),
            'experience': this.experienceCommand.bind(this),
            'education': this.educationCommand.bind(this),
            'git': this.gitCommand.bind(this),
            'npm': this.npmCommand.bind(this),
            'sudo': this.sudoCommand.bind(this),
            'man': this.manCommand.bind(this),
            'tree': this.treeCommand.bind(this),
            'find': this.findCommand.bind(this),
            'grep': this.grepCommand.bind(this)
        };
        
        this.init();
    }

    init() {
        const input = document.getElementById('command-input');
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand(input.value.trim());
                input.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.handleTabComplete(input);
            }
        });
        
        // Keep focus on input
        document.addEventListener('click', () => input.focus());
        input.focus();
    }

    executeCommand(commandLine) {
        if (!commandLine) return;
        
        this.commandHistory.push(commandLine);
        this.historyIndex = this.commandHistory.length;
        
        this.addToTerminal(`
            <div class="command-history">
                <span class="prompt">trevor@portfolio:${this.getShortPath()}$</span>
                <span class="command">${commandLine}</span>
            </div>
        `);
        
        const [command, ...args] = commandLine.split(' ');
        
        if (this.commands[command]) {
            this.commands[command](args);
        } else {
            this.addToTerminal(`<div class="output error">Command not found: ${command}. Type 'help' for available commands.</div>`);
        }
        
        this.scrollToBottom();
    }

    addToTerminal(html) {
        const terminal = document.getElementById('terminal');
        const inputLine = terminal.querySelector('.input-line');
        inputLine.insertAdjacentHTML('beforebegin', html);
    }

    scrollToBottom() {
        setTimeout(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth"
            });
        }, 10);
    }

    getShortPath() {
        return this.currentPath.replace('/home/trevor', '~');
    }

    navigateHistory(direction) {
        const input = document.getElementById('command-input');
        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
            input.value = '';
            return;
        }
        
        input.value = this.commandHistory[this.historyIndex] || '';
    }

    handleTabComplete(input) {
        const currentValue = input.value;
        const cursorPos = input.selectionStart;
        const beforeCursor = currentValue.substring(0, cursorPos);
        const afterCursor = currentValue.substring(cursorPos);
        
        const parts = beforeCursor.split(' ');
        const currentPart = parts[parts.length - 1];
        
        let completions = [];
        
        if (parts.length === 1) {
            // Complete command names
            completions = this.getCommandCompletions(currentPart);
        } else {
            // Complete file/directory paths
            const command = parts[0];
            if (['cat', 'cd', 'ls'].includes(command)) {
                completions = this.getPathCompletions(currentPart);
            }
        }
        
        if (completions.length === 1) {
            // Single match - auto complete
            const completion = completions[0];
            const newBeforeCursor = beforeCursor.substring(0, beforeCursor.lastIndexOf(currentPart)) + completion;
            input.value = newBeforeCursor + afterCursor;
            input.setSelectionRange(newBeforeCursor.length, newBeforeCursor.length);
        } else if (completions.length > 1) {
            // Multiple matches - show options
            this.showCompletions(completions, currentPart);
            
            // Find common prefix
            const commonPrefix = this.getCommonPrefix(completions);
            if (commonPrefix.length > currentPart.length) {
                const newBeforeCursor = beforeCursor.substring(0, beforeCursor.lastIndexOf(currentPart)) + commonPrefix;
                input.value = newBeforeCursor + afterCursor;
                input.setSelectionRange(newBeforeCursor.length, newBeforeCursor.length);
            }
        }
    }

    getCommandCompletions(partial) {
        const commands = Object.keys(this.commands);
        return commands.filter(cmd => cmd.startsWith(partial)).sort();
    }

    getPathCompletions(partial) {
        const resolvedPartial = this.resolvePath(partial);
        let basePath, searchTerm;
        
        if (partial.endsWith('/') || partial === '') {
            basePath = resolvedPartial;
            searchTerm = '';
        } else {
            const lastSlash = resolvedPartial.lastIndexOf('/');
            if (lastSlash === -1) {
                basePath = this.currentPath;
                searchTerm = partial;
            } else {
                basePath = resolvedPartial.substring(0, lastSlash) || '/';
                searchTerm = resolvedPartial.substring(lastSlash + 1);
            }
        }
        
        const dirItem = this.getFileSystemItem(basePath);
        if (!dirItem || dirItem.type !== 'directory') {
            return [];
        }
        
        const items = Object.keys(dirItem.contents || {});
        const matches = items.filter(item => item.startsWith(searchTerm));
        
        return matches.map(match => {
            const fullPath = basePath === '/' ? '/' + match : basePath + '/' + match;
            const item = this.getFileSystemItem(fullPath);
            
            // For relative paths, adjust the completion
            if (!partial.startsWith('/')) {
                const currentDir = this.currentPath;
                if (fullPath.startsWith(currentDir)) {
                    let relativePath = fullPath.substring(currentDir.length);
                    if (relativePath.startsWith('/')) {
                        relativePath = relativePath.substring(1);
                    }
                    return item.type === 'directory' ? relativePath + '/' : relativePath;
                }
            }
            
            return item.type === 'directory' ? match + '/' : match;
        }).sort();
    }

    showCompletions(completions, partial) {
        let output = '<div class="output">';
        const columns = Math.min(completions.length, 4);
        const itemsPerColumn = Math.ceil(completions.length / columns);
        
        output += '<div style="display: grid; grid-template-columns: repeat(' + columns + ', 1fr); gap: 10px;">';
        
        for (let i = 0; i < completions.length; i += itemsPerColumn) {
            output += '<div>';
            for (let j = i; j < Math.min(i + itemsPerColumn, completions.length); j++) {
                const completion = completions[j];
                const isDirectory = completion.endsWith('/');
                const className = isDirectory ? 'directory' : 'file';
                output += `<div class="${className}">${completion}</div>`;
            }
            output += '</div>';
        }
        
        output += '</div></div>';
        this.addToTerminal(output);
        this.scrollToBottom();
    }

    getCommonPrefix(strings) {
        if (strings.length === 0) return '';
        if (strings.length === 1) return strings[0];
        
        let prefix = strings[0];
        for (let i = 1; i < strings.length; i++) {
            while (prefix && !strings[i].startsWith(prefix)) {
                prefix = prefix.substring(0, prefix.length - 1);
            }
        }
        return prefix;
    }

    // Command implementations
    helpCommand() {
        const helpText = `
            <div class="output">
                <h3>Available Commands:</h3>
                <p><span class="highlight">Core Commands:</span></p>
                <p>  ls [path]      - List directory contents</p>
                <p>  cat [file]     - Display file contents</p>
                <p>  cd [path]      - Change directory</p>
                <p>  pwd            - Print working directory</p>
                <p>  clear          - Clear terminal</p>
                <p>  echo [text]    - Display text</p>
                <p></p>
                <p><span class="highlight">Portfolio Commands:</span></p>
                <p>  whoami         - About me</p>
                <p>  skills         - Technical skills</p>
                <p>  projects       - View projects</p>
                <p>  experience     - Work experience</p>
                <p>  education      - Educational background</p>
                <p>  contact        - Contact information</p>
                <p></p>
                <p><span class="highlight">Fun Commands:</span></p>
                <p>  history        - Command history</p>
                <p>  date           - Current date</p>
                <p>  tree           - Directory tree</p>
                <p>  git status     - Portfolio status</p>
                <p>  sudo [cmd]     - Try with elevated privileges</p>
                <p>  man [cmd]      - Manual for command</p>
                <p></p>
                <p>Pro tip: Try exploring with 'ls' and 'cd' to discover hidden content!</p>
            </div>
        `;
        this.addToTerminal(helpText);
    }

    lsCommand(args) {
        const path = args[0] || this.currentPath;
        const resolvedPath = this.resolvePath(path);
        const item = this.getFileSystemItem(resolvedPath);
        
        if (!item) {
            this.addToTerminal(`<div class="output error">ls: cannot access '${path}': No such file or directory</div>`);
            return;
        }
        
        if (item.type === 'file') {
            this.addToTerminal(`<div class="output">${path}</div>`);
            return;
        }
        
        const contents = Object.keys(item.contents).sort();
        if (contents.length === 0) {
            this.addToTerminal(`<div class="output">Directory is empty</div>`);
            return;
        }
        
        let output = '<div class="output"><div class="file-list">';
        contents.forEach(name => {
            const child = item.contents[name];
            const className = child.type === 'directory' ? 'directory' : 
                             name.includes('.js') || name.includes('.py') || name.includes('.swift') ? 'executable' : 'file';
            output += `<div class="${className}">${name}${child.type === 'directory' ? '/' : ''}</div>`;
        });
        output += '</div></div>';
        
        this.addToTerminal(output);
    }

    catCommand(args) {
        if (!args[0]) {
            this.addToTerminal(`<div class="output error">cat: missing file argument</div>`);
            return;
        }
        
        const path = this.resolvePath(args[0]);
        const item = this.getFileSystemItem(path);
        
        if (!item) {
            this.addToTerminal(`<div class="output error">cat: ${args[0]}: No such file or directory</div>`);
            return;
        }
        
        if (item.type === 'directory') {
            this.addToTerminal(`<div class="output error">cat: ${args[0]}: Is a directory</div>`);
            return;
        }
        
        this.addToTerminal(`<div class="output">${item.content}</div>`);
    }

    cdCommand(args) {
        const path = args[0] || '/home/trevor';
        const resolvedPath = this.resolvePath(path);
        const item = this.getFileSystemItem(resolvedPath);
        
        if (!item) {
            this.addToTerminal(`<div class="output error">cd: ${path}: No such file or directory</div>`);
            return;
        }
        
        if (item.type !== 'directory') {
            this.addToTerminal(`<div class="output error">cd: ${path}: Not a directory</div>`);
            return;
        }
        
        this.currentPath = resolvedPath;
        // Update prompt
        document.querySelector('.input-line .prompt').textContent = `trevor@portfolio:${this.getShortPath()}$`;
    }

    pwdCommand() {
        this.addToTerminal(`<div class="output">${this.currentPath}</div>`);
    }

    clearCommand() {
        const terminal = document.getElementById('terminal');
        const inputLine = terminal.querySelector('.input-line');
        terminal.innerHTML = '';
        terminal.appendChild(inputLine);
    }

    whoamiCommand() {
        this.addToTerminal(`
            <div class="output">
                <h2>Trevor Harless</h2>
                <p>Software Developer | Problem Solver | Tech Enthusiast</p>
                <p>I'm passionate about creating clean, efficient solutions to complex problems.</p>
                <p>When I'm not coding, you'll find me exploring new technologies, contributing to open source, or enjoying a good cup of coffee.</p>
                <p></p>
                <p><span class="info">Location:</span> [Your Location]</p>
                <p><span class="info">Status:</span> Available for new opportunities</p>
                <p><span class="info">Fun fact:</span> I've written code in 10+ programming languages!</p>
            </div>
        `);
    }

    skillsCommand() {
        this.catCommand(['skills.json']);
    }

    projectsCommand() {
        this.catCommand(['projects/README.md']);
    }

    contactCommand() {
        this.catCommand(['contact.vcard']);
    }

    experienceCommand() {
        this.catCommand(['experience.md']);
    }

    educationCommand() {
        this.catCommand(['education/degree.txt']);
    }

    dateCommand() {
        const now = new Date();
        this.addToTerminal(`<div class="output">${now.toString()}</div>`);
    }

    historyCommand() {
        if (this.commandHistory.length === 0) {
            this.addToTerminal(`<div class="output">No commands in history</div>`);
            return;
        }
        
        let output = '<div class="output">';
        this.commandHistory.forEach((cmd, index) => {
            output += `<p>${index + 1}  ${cmd}</p>`;
        });
        output += '</div>';
        this.addToTerminal(output);
    }

    echoCommand(args) {
        const text = args.join(' ');
        this.addToTerminal(`<div class="output">${text}</div>`);
    }

    gitCommand(args) {
        if (args[0] === 'status') {
            this.addToTerminal(`
                <div class="output success">
                    <p>On branch main</p>
                    <p>Your portfolio is up to date.</p>
                    <p></p>
                    <p>Portfolio statistics:</p>
                    <p>  - Projects completed: 15+</p>
                    <p>  - Languages mastered: 8</p>
                    <p>  - Coffee consumed: ∞ cups</p>
                    <p>  - Bugs fixed: Too many to count</p>
                </div>
            `);
        } else {
            this.addToTerminal(`<div class="output error">git: '${args[0] || ''}' is not a git command. Try 'git status'.</div>`);
        }
    }

    npmCommand(args) {
        if (args[0] === 'start') {
            this.addToTerminal(`
                <div class="output success">
                    <p>Starting Trevor's career...</p>
                    <p>✓ Loading passion for technology</p>
                    <p>✓ Initializing problem-solving skills</p>
                    <p>✓ Connecting to awesome projects</p>
                    <p>✓ Ready to build amazing things!</p>
                </div>
            `);
        } else if (args[0] === 'install') {
            this.addToTerminal(`
                <div class="output">
                    <p>Installing awesome developer...</p>
                    <p>npm WARN deprecated mediocre-code@1.0.0: Use trevor-harless@latest instead</p>
                    <p>+ trevor-harless@latest</p>
                    <p>✓ Installation complete!</p>
                </div>
            `);
        } else {
            this.addToTerminal(`<div class="output">npm: command '${args[0] || ''}' not recognized. Try 'npm start' or 'npm install'.</div>`);
        }
    }

    sudoCommand(args) {
        const command = args.join(' ');
        if (command === 'rm -rf /') {
            this.addToTerminal(`<div class="output error">sudo: Nice try! This portfolio is protected by awesome coding skills. 😄</div>`);
        } else if (command.includes('hack')) {
            this.addToTerminal(`<div class="output error">sudo: I prefer ethical hacking - like hacking together great code!</div>`);
        } else {
            this.addToTerminal(`<div class="output">sudo: ${command}: Permission granted! Trevor is indeed awesome. ✨</div>`);
        }
    }

    manCommand(args) {
        const cmd = args[0];
        const manuals = {
            'ls': 'LIST(1) - list directory contents\nSYNOPSIS: ls [path]\nLists files and directories in the specified path.',
            'cat': 'CAT(1) - concatenate files and print\nSYNOPSIS: cat [file]\nDisplays the contents of the specified file.',
            'help': 'HELP(1) - display available commands\nSYNOPSIS: help\nShows all available commands in this portfolio terminal.',
            'trevor': 'TREVOR(1) - an awesome developer\nSYNOPSIS: trevor [--hire]\nA passionate software developer who loves solving problems and building cool stuff.'
        };
        
        if (manuals[cmd]) {
            this.addToTerminal(`<div class="output"><pre>${manuals[cmd]}</pre></div>`);
        } else {
            this.addToTerminal(`<div class="output error">No manual entry for ${cmd}</div>`);
        }
    }

    treeCommand() {
        this.addToTerminal(`
            <div class="output">
                <pre>
/home/trevor
├── about.txt
├── skills.json
├── experience.md
├── contact.vcard
├── projects/
│   ├── README.md
│   ├── awesome-app.js
│   ├── data-viz.py
│   ├── mobile-app.swift
│   └── portfolio-website/
├── education/
│   ├── degree.txt
│   └── certifications.json
└── .secrets/
    ├── favorite_coffee.txt
    └── hidden_talent.txt
                </pre>
            </div>
        `);
    }

    findCommand(args) {
        const query = args.join(' ');
        if (!query) {
            this.addToTerminal(`<div class="output error">find: missing search term</div>`);
            return;
        }
        
        this.addToTerminal(`
            <div class="output">
                <p>Searching for "${query}" in Trevor's portfolio...</p>
                <p>✓ Found: Passion for ${query.includes('java') ? 'JavaScript' : 'coding'}</p>
                <p>✓ Found: Experience with ${query.includes('python') ? 'Python' : 'awesome projects'}</p>
                <p>✓ Found: ${query.includes('coffee') ? '☕ in .secrets/' : 'Great problem-solving skills'}</p>
            </div>
        `);
    }

    grepCommand(args) {
        const pattern = args[0];
        if (!pattern) {
            this.addToTerminal(`<div class="output error">grep: missing pattern</div>`);
            return;
        }
        
        this.addToTerminal(`
            <div class="output">
                <p>Searching for pattern "${pattern}"...</p>
                <p><span class="highlight">about.txt:</span> passionate about creating <span class="highlight">${pattern}</span></p>
                <p><span class="highlight">skills.json:</span> "frameworks": ["React", "${pattern}"]</p>
            </div>
        `);
    }

    // Helper methods
    resolvePath(path) {
        if (path.startsWith('/')) {
            return path;
        } else if (path === '..') {
            const parts = this.currentPath.split('/').filter(p => p);
            parts.pop();
            return '/' + parts.join('/');
        } else if (path === '.') {
            return this.currentPath;
        } else {
            return this.currentPath + '/' + path;
        }
    }

    getFileSystemItem(path) {
        const normalizedPath = path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
        
        // Direct lookup for root directories in our filesystem
        if (this.fileSystem[normalizedPath]) {
            return this.fileSystem[normalizedPath];
        }
        
        // For nested paths, navigate from /home/trevor
        if (normalizedPath.startsWith('/home/trevor')) {
            let relativePath = normalizedPath.replace('/home/trevor', '').replace(/^\//, '');
            let current = this.fileSystem['/home/trevor'];
            
            if (!relativePath) {
                return current;
            }
            
            const parts = relativePath.split('/').filter(p => p);
            for (const part of parts) {
                if (current.contents && current.contents[part]) {
                    current = current.contents[part];
                } else {
                    return null;
                }
            }
            return current;
        }
        
        return null;
    }

    // Content generators
    getAboutContent() {
        return `
            <h2>About Trevor Harless</h2>
            <p>🚀 <strong>Software Developer</strong> with a passion for creating innovative solutions</p>
            <p>💡 <strong>Problem Solver</strong> who loves tackling complex challenges</p>
            <p>🌱 <strong>Continuous Learner</strong> always exploring new technologies</p>
            <p></p>
            <p>I believe in writing clean, maintainable code and building products that make a difference.</p>
            <p>My journey in software development has taught me that the best solutions come from understanding both the technical and human aspects of a problem.</p>
            <p></p>
            <p><em>"Code is like humor. When you have to explain it, it's bad." - Cory House</em></p>
        `;
    }

    getSkillsContent() {
        return `
            <pre>{
  "languages": [
    "JavaScript", "Python", "Java", "Swift", 
    "TypeScript", "C++", "Go", "Rust"
  ],
  "frontend": [
    "React", "Vue.js", "Angular", "HTML5", 
    "CSS3", "Sass", "Tailwind CSS"
  ],
  "backend": [
    "Node.js", "Express", "Django", "Flask", 
    "Spring Boot", "FastAPI"
  ],
  "databases": [
    "PostgreSQL", "MongoDB", "Redis", 
    "MySQL", "SQLite"
  ],
  "tools": [
    "Git", "Docker", "AWS", "Jenkins", 
    "Webpack", "Jest", "Cypress"
  ],
  "methodologies": [
    "Agile", "TDD", "CI/CD", "Microservices",
    "RESTful APIs", "GraphQL"
  ],
  "currentlyLearning": [
    "Kubernetes", "Machine Learning", "Blockchain"
  ]
}</pre>
        `;
    }

    getExperienceContent() {
        return `
            <h2># Work Experience</h2>
            <p></p>
            <h3>## Senior Software Developer | Tech Company Inc.</h3>
            <p><em>2022 - Present</em></p>
            <p>- Led development of microservices architecture serving 1M+ users</p>
            <p>- Implemented CI/CD pipelines reducing deployment time by 60%</p>
            <p>- Mentored junior developers and conducted code reviews</p>
            <p>- Technologies: React, Node.js, AWS, Docker, PostgreSQL</p>
            <p></p>
            <h3>## Full Stack Developer | Startup Ventures</h3>
            <p><em>2020 - 2022</em></p>
            <p>- Built responsive web applications from concept to deployment</p>
            <p>- Collaborated with cross-functional teams in agile environment</p>
            <p>- Optimized database queries improving performance by 40%</p>
            <p>- Technologies: Vue.js, Python, Django, MySQL, Redis</p>
            <p></p>
            <h3>## Junior Developer | Digital Solutions</h3>
            <p><em>2019 - 2020</em></p>
            <p>- Developed and maintained client websites and applications</p>
            <p>- Fixed bugs and implemented new features</p>
            <p>- Learned best practices in software development</p>
            <p>- Technologies: JavaScript, PHP, WordPress, HTML/CSS</p>
        `;
    }

    getContactContent() {
        return `
            <h2>📧 Contact Information</h2>
            <p></p>
            <p><strong>Email:</strong> trevor.harless@example.com</p>
            <p><strong>LinkedIn:</strong> <a href="https://linkedin.com/in/trevorharless" target="_blank">linkedin.com/in/trevorharless</a></p>
            <p><strong>GitHub:</strong> <a href="https://github.com/trevorharless" target="_blank">github.com/trevorharless</a></p>
            <p><strong>Portfolio:</strong> <a href="https://trevorharless.dev" target="_blank">trevorharless.dev</a></p>
            <p><strong>Twitter:</strong> <a href="https://twitter.com/trevorharless" target="_blank">@trevorharless</a></p>
            <p></p>
            <p>🌍 <strong>Location:</strong> Open to remote opportunities worldwide</p>
            <p>⏰ <strong>Availability:</strong> Available for full-time positions</p>
            <p>💬 <strong>Preferred Contact:</strong> Email or LinkedIn</p>
            <p></p>
            <p><em>Let's build something amazing together! 🚀</em></p>
        `;
    }

    getProjectsContent() {
        return `
            <h2># Featured Projects</h2>
            <p></p>
            <h3>## 🌐 Portfolio Website</h3>
            <p>Interactive terminal-based portfolio showcasing my skills and projects.</p>
            <p><strong>Tech Stack:</strong> HTML, CSS, JavaScript</p>
            <p><strong>Features:</strong> Command-line interface, responsive design, creative UX</p>
            <p><a href="#" target="_blank">View Code</a> | <a href="#" target="_blank">Live Demo</a></p>
            <p></p>
            <h3>## 📱 Task Management App</h3>
            <p>Full-stack web application for team task management and collaboration.</p>
            <p><strong>Tech Stack:</strong> React, Node.js, MongoDB, Socket.io</p>
            <p><strong>Features:</strong> Real-time updates, user authentication, drag-and-drop</p>
            <p><a href="#" target="_blank">View Code</a> | <a href="#" target="_blank">Live Demo</a></p>
            <p></p>
            <h3>## 📊 Data Visualization Dashboard</h3>
            <p>Interactive dashboard for visualizing complex datasets with D3.js.</p>
            <p><strong>Tech Stack:</strong> Vue.js, Python, D3.js, FastAPI</p>
            <p><strong>Features:</strong> Dynamic charts, data filtering, export functionality</p>
            <p><a href="#" target="_blank">View Code</a> | <a href="#" target="_blank">Live Demo</a></p>
            <p></p>
            <h3>## 🤖 AI Chat Bot</h3>
            <p>Intelligent chatbot using natural language processing for customer support.</p>
            <p><strong>Tech Stack:</strong> Python, TensorFlow, Flask, Redis</p>
            <p><strong>Features:</strong> Intent recognition, contextual responses, learning capability</p>
            <p><a href="#" target="_blank">View Code</a> | <a href="#" target="_blank">Live Demo</a></p>
            <p></p>
            <p><em>💡 Want to see more? Check out my GitHub for additional projects!</em></p>
        `;
    }

    getEducationContent() {
        return `
            <h2>🎓 Education</h2>
            <p></p>
            <h3>Bachelor of Science in Computer Science</h3>
            <p><strong>University of Technology</strong> | 2015 - 2019</p>
            <p><strong>GPA:</strong> 3.8/4.0 | <strong>Magna Cum Laude</strong></p>
            <p></p>
            <p><strong>Relevant Coursework:</strong></p>
            <p>• Data Structures and Algorithms</p>
            <p>• Software Engineering</p>
            <p>• Database Systems</p>
            <p>• Computer Networks</p>
            <p>• Machine Learning</p>
            <p>• Web Development</p>
            <p></p>
            <h3>🏆 Achievements</h3>
            <p>• Dean's List (6 semesters)</p>
            <p>• Outstanding Student in Computer Science (2019)</p>
            <p>• Hackathon Winner - Best Technical Innovation (2018)</p>
            <p>• President, Computer Science Student Association (2018-2019)</p>
        `;
    }

    getCertificationsContent() {
        return `
            <pre>{
  "cloud": [
    {
      "name": "AWS Certified Solutions Architect",
      "issued": "2023",
      "level": "Associate"
    },
    {
      "name": "Google Cloud Professional Developer",
      "issued": "2022",
      "level": "Professional"
    }
  ],
  "programming": [
    {
      "name": "Oracle Certified Java Programmer",
      "issued": "2021",
      "level": "Professional"
    },
    {
      "name": "MongoDB Developer Certification",
      "issued": "2022",
      "level": "Associate"
    }
  ],
  "agile": [
    {
      "name": "Certified Scrum Master",
      "issued": "2023",
      "organization": "Scrum Alliance"
    }
  ],
  "inProgress": [
    "Kubernetes Application Developer (CKAD)",
    "Machine Learning Engineer Certification"
  ]
}</pre>
        `;
    }
}

// Initialize the portfolio terminal
const portfolio = new Portfolio();